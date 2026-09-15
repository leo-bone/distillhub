// Cloudflare Pages Function — DeepSeek API proxy
// Keeps the API key server-side (never shipped to the browser).
//
// Routes:
//   GET  /api/chat  -> diagnostics (is the key set? is upstream reachable?)
//   POST /api/chat  -> streaming chat proxy
//
// Reliability fixes vs. the original version:
//  1. Upstream failures come back as SSE `error` events with HTTP 200, so the UI
//     can render a readable message. A bare 502 only produced "error code: 502".
//  2. Hard timeout (AbortController) — a hung upstream no longer hangs the request.
//  3. Non-stream fallback — if DeepSeek rejects `stream: true`, retry once without it.
//  4. Roles normalised to user/assistant instead of being passed through raw.

const DEEPSEEK_API = 'https://api.deepseek.com/chat/completions';
const UPSTREAM_TIMEOUT_MS = 45000;
const MODEL = 'deepseek-chat';

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  'Connection': 'keep-alive',
  'X-Accel-Buffering': 'no',
};

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

function sseEvent(payload) {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

function sseResponse(events) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const e of events) controller.enqueue(encoder.encode(sseEvent(e)));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
  return new Response(stream, { status: 200, headers: SSE_HEADERS });
}

/** Diagnostics: tells you exactly which link in the chain is broken. */
export async function onRequestGet(context) {
  const key = context.env?.DEEPSEEK_API_KEY || '';
  const info = {
    ok: true,
    function_running: true,
    api_key_configured: Boolean(key),
    api_key_prefix: key ? `${key.slice(0, 6)}...` : null,
    model: MODEL,
    upstream: DEEPSEEK_API,
    ts: new Date().toISOString(),
  };

  if (!key) {
    return new Response(JSON.stringify({
      ...info,
      ok: false,
      hint: 'DEEPSEEK_API_KEY is not set. Cloudflare Pages -> Settings -> Environment variables -> add DEEPSEEK_API_KEY (both Production and Preview), then redeploy.',
    }, null, 2), { status: 200, headers: JSON_HEADERS });
  }

  const started = Date.now();
  try {
    const probe = await fetch('https://api.deepseek.com/models', {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(10000),
    });
    info.upstream_reachable = probe.ok;
    info.upstream_status = probe.status;
    if (!probe.ok) {
      const t = await probe.text().catch(() => '');
      info.upstream_error = t.slice(0, 300);
    }
  } catch (e) {
    info.upstream_reachable = false;
    info.upstream_error = `${e.name || 'Error'}: ${e.message || String(e)}`;
  }
  info.probe_ms = Date.now() - started;

  return new Response(JSON.stringify(info, null, 2), { status: 200, headers: JSON_HEADERS });
}

export async function onRequestPost(context) {
  let payload;
  try {
    payload = await context.request.json();
  } catch {
    payload = {};
  }

  const rawMessages = Array.isArray(payload.messages) ? payload.messages : [];
  const messages = rawMessages
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .slice(-20)
    .map((m) => ({
      role: m.role === 'ai' || m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content),
    }));

  const systemPrompt =
    typeof payload.systemPrompt === 'string' && payload.systemPrompt.trim()
      ? payload.systemPrompt
      : 'You are a helpful assistant.';

  if (!messages.length) {
    return new Response(JSON.stringify({ error: 'No messages provided' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const apiKey = context.env?.DEEPSEEK_API_KEY || '';
  if (!apiKey) {
    return sseResponse([{
      error: 'DEEPSEEK_API_KEY 未配置',
      detail: 'Cloudflare Pages -> Settings -> Environment variables 添加 DEEPSEEK_API_KEY（Production 与 Preview 都要加），然后重新部署。',
    }]);
  }

  const allMessages = [{ role: 'system', content: systemPrompt }, ...messages];

  async function callUpstream(useStream) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
    try {
      return await fetch(DEEPSEEK_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: allMessages,
          max_tokens: Number(payload.max_tokens) || 4096,
          temperature: payload.temperature ?? 0.85,
          stream: useStream,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  let response;
  try {
    response = await callUpstream(true);
    // Some gateways reject streaming; fall back to a single shot.
    if (!response.ok && response.status === 400) {
      response = await callUpstream(false);
      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content ?? '';
        return sseResponse([{ choices: [{ delta: { content } }] }]);
      }
    }
  } catch (e) {
    return sseResponse([{
      error: '无法连接 DeepSeek',
      detail: `${e.name || 'Error'}: ${e.message || String(e)}`,
    }]);
  }

  if (!response.ok) {
    let detail = '';
    try {
      detail = (await response.text()).slice(0, 500);
    } catch { /* ignore */ }
    return sseResponse([{
      error: `DeepSeek API ${response.status}`,
      detail: detail || '上游返回错误但无具体原因（常见：余额不足 402 / Key 无效 401 / 模型无权限 403）。',
    }]);
  }

  if (!response.body) {
    return sseResponse([{ error: '上游返回空响应体' }]);
  }

  // Forward upstream SSE chunks verbatim, but never leave the client hanging.
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await writer.write(value);
      }
    } catch (e) {
      try {
        await writer.write(encoder.encode(sseEvent({
          error: '流式传输中断',
          detail: `${e.name || 'Error'}: ${e.message || String(e)}`,
        })));
      } catch { /* writer already closed */ }
    } finally {
      try { await writer.close(); } catch { /* ignore */ }
    }
  })();

  return new Response(readable, { status: 200, headers: SSE_HEADERS });
}

export async function onRequest(context) {
  if (context.request.method === 'GET') return onRequestGet(context);
  if (context.request.method === 'POST') return onRequestPost(context);
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: JSON_HEADERS,
  });
}
