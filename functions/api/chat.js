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

// ─── 公开访问下的额度防护 ────────────────────────────────────────────────────
// 站点对外公开，接口谁都能调，DeepSeek 额度是作者自付的。做两层廉价防护：
//
//  1) IP 限流。RATE_BUCKETS 是滑动窗口，两条规则同时生效（取更严的那条）。
//     正常人聊天一分钟问不了 6 次，脚本刷接口会立刻撞线。
//     注意：Pages Functions 跑在多个 isolate 上，计数不跨 isolate 共享，
//     所以这是"削峰"而不是硬限。要硬限需接 KV / Durable Object /
//     Cloudflare WAF 速率规则。即便如此，撞线的大流量已被砍掉绝大部分。
//
//  2) 输入长度截断。防止有人塞几万字进来一次烧掉大量 token。
const RATE_BUCKETS = [
  { windowMs: 60_000, max: 6 },
  { windowMs: 600_000, max: 20 },
];
const MAX_INPUT_CHARS = 4000; // 单条消息
const MAX_SYSTEM_CHARS = 8000; // 技能提示词（技能库本身最长约 2k，留足余量）
const rateHits = new Map(); // ip -> number[] (timestamps)
const RATE_TTL_MS = 600_000;

function clientIP(request) {
  return (
    request.headers.get('cf-connecting-ip') ||
    (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown'
  );
}

/** @returns null = 放行；否则返回被撞的那条规则（附带窗口内最早一次的时间） */
function rateCheck(ip) {
  const now = Date.now();
  let arr = (rateHits.get(ip) || []).filter((t) => now - t < RATE_TTL_MS);

  for (const b of RATE_BUCKETS) {
    const inWindow = arr.filter((t) => now - t < b.windowMs);
    if (inWindow.length >= b.max) {
      rateHits.set(ip, arr);
      return { ...b, oldest: inWindow[0] };
    }
  }

  arr.push(now);
  rateHits.set(ip, arr);

  // 防止 Map 无限膨胀：条目过多时清掉已过期的
  if (rateHits.size > 5000) {
    for (const [k, v] of rateHits) {
      if (!v.length || now - v[v.length - 1] > RATE_TTL_MS) rateHits.delete(k);
    }
  }
  return null;
}

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
    access: 'public',
    rate_limit: RATE_BUCKETS.map((b) => `${b.max} 次 / ${Math.round(b.windowMs / 1000)} 秒（按 IP）`),
    history_window: 8,
    max_input_chars: MAX_INPUT_CHARS,
    max_tokens_cap: 3072,
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

  // 余额查询：402 Insufficient Balance 是本站最常见的故障，直接把余额摆出来。
  try {
    const bal = await fetch('https://api.deepseek.com/user/balance', {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(10000),
    });
    const b = await bal.json().catch(() => null);
    if (b) {
      info.balance_available = b.is_available;
      info.balance = (b.balance_infos || []).map((x) => ({
        currency: x.currency,
        total: x.total_balance,
        topped_up: x.topped_up_balance,
        granted: x.granted_balance,
      }));
      if (b.is_available === false) info.hint = 'DeepSeek 余额已耗尽，到 platform.deepseek.com/topup 充值。';
    }
  } catch (e) {
    info.balance_error = `${e.name || 'Error'}: ${e.message || String(e)}`;
  }

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
    .slice(-8)
    .map((m) => ({
      role: m.role === 'ai' || m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content).slice(0, MAX_INPUT_CHARS),
    }));

  const systemPrompt =
    typeof payload.systemPrompt === 'string' && payload.systemPrompt.trim()
      ? payload.systemPrompt.slice(0, MAX_SYSTEM_CHARS)
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

  // 站点保持公开访问：任何人都能用，不设口令。
  // 但做两层防护，避免脚本/爬虫把 DeepSeek 额度刷光：
  //   1) 按 IP 限流（见文件顶部 RATE_BUCKETS）
  //   2) 单次输入长度截断（见 MAX_INPUT_CHARS）
  const ip = clientIP(context.request);
  const limited = rateCheck(ip);
  if (limited) {
    const secs = Math.ceil((limited.windowMs - (Date.now() - limited.oldest)) / 1000);
    return sseResponse([{
      error: '请求太频繁',
      hint: `为避免额度被批量刷掉，每个 IP 每 ${Math.round(limited.windowMs / 1000)} 秒最多 ${limited.max} 次提问。请 ${secs} 秒后重试。`,
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
          max_tokens: Math.min(Number(payload.max_tokens) || 3072, 3072),
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

    const HINTS = {
      401: 'DeepSeek API Key 无效或已被删除。到 platform.deepseek.com/api_keys 检查，确认后到 Cloudflare Pages 的环境变量里更新并重新部署。',
      402: 'DeepSeek 账户余额不足（Insufficient Balance）。到 platform.deepseek.com/topup 充值后即可恢复，无需改代码、无需重新部署。',
      403: '当前 Key 没有该模型的访问权限，或所在区域被限制。检查 model 名称与账号权限。',
      404: '模型不存在或接口地址已变更。检查 DEEPSEEK_API 常量里的 model 字段。',
      422: '请求体不符合 DeepSeek 规范（常见于 max_tokens 过大或 messages 格式问题）。',
      429: '触发 DeepSeek 速率限制（429）。稍等几秒重试即可。',
    };
    const hint = HINTS[response.status]
      || (response.status >= 500
        ? 'DeepSeek 服务端故障（5xx）。这是上游问题，稍后重试即可。'
        : '上游返回错误但无具体原因。');

    return sseResponse([{
      error: `DeepSeek API ${response.status}`,
      hint,
      detail,
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
