import { useState, useCallback, useEffect, useRef } from 'react'
import { skills, categoryMeta, type Skill, type SkillCategory, type ChatMessage } from './data/skills'
import { getSystemPrompt } from './data/systemPrompts'

// ─── 访问口令 ─────────────────────────────────────────────────────────────────
// 站点公开，/api/chat 若不设防，任何人都能消耗你的 DeepSeek 额度。
// 用法：第一次访问 https://distill.uichain.org/?k=口令  → 自动存进 localStorage，
// 以后直接打开站点即可（收藏带参数的链接最省事）。服务端未配置 ACCESS_CODE 时此机制不生效。
const CODE_KEY = 'distill_access_code'
function accessCode(): string {
  try {
    const fromUrl = new URLSearchParams(location.search).get('k')
    if (fromUrl) {
      localStorage.setItem(CODE_KEY, fromUrl)
      // 把口令从地址栏摘掉，避免被截图/分享时带出去
      const clean = location.pathname + location.hash
      history.replaceState(null, '', clean)
      return fromUrl
    }
    return localStorage.getItem(CODE_KEY) || ''
  } catch {
    return ''
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function SearchIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function StarIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function ExternalLinkIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
    </svg>
  )
}

function XIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function SendIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="m22 2-7 20-4-9-9-4zM22 2 11 13" />
    </svg>
  )
}

function PlayIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

function getCategoryBg(category: SkillCategory): string {
  const map: Record<SkillCategory, string> = {
    work: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    celeb: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    life: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    self: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    spirit: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  }
  return map[category]
}

function getCategoryBorder(category: SkillCategory): string {
  const map: Record<SkillCategory, string> = {
    work: 'border-blue-500/30 hover:border-blue-500/60',
    celeb: 'border-violet-500/30 hover:border-violet-500/60',
    life: 'border-pink-500/30 hover:border-pink-500/60',
    self: 'border-emerald-500/30 hover:border-emerald-500/60',
    spirit: 'border-amber-500/30 hover:border-amber-500/60',
  }
  return map[category]
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Hero({ totalSkills }: { totalSkills: number }) {
  return (
    <section className="relative overflow-hidden py-20 md:py-32 px-4">
      {/* Background effects */}
      <div className="absolute inset-0 cyber-grid" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-light text-sm text-dark-300 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green" />
          </span>
          <span className="font-mono">{totalSkills} skills collected</span>
          <span className="text-dark-500">|</span>
          <span className="font-mono">2026.04</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6">
          <span className="text-dark-100">Distill</span>
          <span className="gradient-text">Hub</span>
        </h1>

        <p className="text-lg md:text-xl text-dark-400 max-w-2xl mx-auto mb-4 leading-relaxed">
          万物皆可 <span className="font-mono text-neon-cyan">.skill</span> 的开源宇宙
        </p>
        <p className="text-sm md:text-base text-dark-500 max-w-xl mx-auto mb-10">
          同事、前任、老板、偶像——把他们蒸馏成 AI Skill，让思维永生。
          <br />在线预览每个 skill 的对话效果，体验赛博蒸馏的魅力。
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm">
          {[
            { value: `${totalSkills}+`, label: 'Skills' },
            { value: '5', label: 'Categories' },
            { value: '40k+', label: 'Total Stars' },
            { value: '36', label: 'Contributors' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-dark-100">{s.value}</div>
              <div className="text-dark-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({
  active,
  onChange,
  search,
  onSearch,
  sortBy,
  onSort,
}: {
  active: SkillCategory | 'all'
  onChange: (c: SkillCategory | 'all') => void
  search: string
  onSearch: (s: string) => void
  sortBy: 'stars' | 'name'
  onSort: (s: 'stars' | 'name') => void
}) {
  const categories: (SkillCategory | 'all')[] = ['all', 'work', 'celeb', 'life', 'self', 'spirit']

  return (
    <div className="sticky top-0 z-40 py-4 px-4" style={{ background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Search */}
        <div className="relative mb-4">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
          <input
            type="text"
            placeholder="搜索 skill 名称、标签、描述..."
            value={search}
            onChange={e => onSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-dark-900/80 border border-dark-700/50 text-dark-200 placeholder-dark-500 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => {
            const isAll = cat === 'all'
            const meta = isAll ? { label: '全部', color: 'bg-dark-100 text-dark-900 border-dark-300 hover:bg-dark-200' } : categoryMeta[cat]
            const isActive = active === cat

            return (
              <button
                key={cat}
                onClick={() => onChange(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? isAll
                      ? 'bg-dark-100 text-dark-900 border-dark-300 shadow-lg'
                      : `${getCategoryBg(cat)} border-current shadow-lg`
                    : 'bg-dark-900/50 text-dark-400 border-dark-700/30 hover:bg-dark-800/50 hover:text-dark-200'
                }`}
              >
                {meta.label}
              </button>
            )
          })}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sort */}
          <button
            onClick={() => onSort(sortBy === 'stars' ? 'name' : 'stars')}
            className="px-3 py-2 rounded-lg text-xs font-mono text-dark-500 border border-dark-700/30 bg-dark-900/50 hover:text-dark-300 transition-colors cursor-pointer"
          >
            sort: {sortBy === 'stars' ? 'stars desc' : 'name asc'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Skill Card ───────────────────────────────────────────────────────────────
function SkillCard({ skill, onClick }: { skill: Skill; onClick: () => void }) {
  const meta = categoryMeta[skill.category]

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl border ${getCategoryBorder(skill.category)} bg-dark-900/40 p-5 cursor-pointer transition-all duration-300 hover:bg-dark-800/40 hover:shadow-lg hover:shadow-violet-500/5 hover:-translate-y-1`}
      style={{ animationDelay: `${Math.random() * 0.3}s` }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{skill.emoji}</span>
          <div>
            <h3 className="font-bold text-dark-100 text-sm group-hover:text-dark-50 transition-colors">
              {skill.name}
            </h3>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${getCategoryBg(skill.category)}`}>
              {meta.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-yellow-500">
          <StarIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-mono">{formatStars(skill.stars)}</span>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-xs text-dark-400 mb-3 line-clamp-2 leading-relaxed">{skill.subtitle}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {skill.tags.slice(0, 4).map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded bg-dark-800/60 text-[10px] text-dark-400 font-mono">
            {tag}
          </span>
        ))}
        {skill.tags.length > 4 && (
          <span className="px-2 py-0.5 rounded bg-dark-800/60 text-[10px] text-dark-500 font-mono">
            +{skill.tags.length - 4}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-dark-800/60">
        <span className="text-[10px] text-dark-500 font-mono">by {skill.author}</span>
        <div className="flex items-center gap-1 text-neon-cyan text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayIcon className="w-3 h-3" />
          <span>试玩</span>
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${
            skill.category === 'work' ? 'rgba(59,130,246,0.08)' :
            skill.category === 'celeb' ? 'rgba(139,92,246,0.08)' :
            skill.category === 'life' ? 'rgba(236,72,153,0.08)' :
            skill.category === 'self' ? 'rgba(16,185,129,0.08)' :
            'rgba(245,158,11,0.08)'
          }, transparent 70%)`,
        }}
      />
    </div>
  )
}

// ─── Skill Detail Modal ───────────────────────────────────────────────────────
function SkillDetailModal({
  skill,
  onClose,
}: {
  skill: Skill
  onClose: () => void
}) {
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState<Array<ChatMessage & { _key: string }>>([])

  const [currentMsgIndex, setCurrentMsgIndex] = useState(-1)
  const [userInput, setUserInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [isLiveMode, setIsLiveMode] = useState(false)

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Play demo conversation then switch to live mode
  const playDemo = useCallback(() => {
    setShowChat(true)
    setMessages([])
    setCurrentMsgIndex(0)
    setIsLiveMode(false)
    liveMessagesRef.current = []
  }, [])

  useEffect(() => {
    if (currentMsgIndex < 0 || currentMsgIndex >= skill.sampleChat.length) {
      // Demo finished, switch to live mode
      if (currentMsgIndex >= skill.sampleChat.length && skill.sampleChat.length > 0) {
        setIsLiveMode(true)
      }
      return
    }
    const msg = skill.sampleChat[currentMsgIndex]
    if (!msg) return

    const timer = setTimeout(() => {
      if (msg.role === 'user') {
        setMessages(prev => [...prev, addMsg(msg)])
        setCurrentMsgIndex(prev => prev + 1)
      } else {
        setMessages(prev => [...prev, addMsg({ role: 'user', content: '' })]) // placeholder
        setIsTyping(true)
        setTimeout(() => {
          setMessages(prev => [...prev.slice(0, -1), addMsg(msg)])
          setIsTyping(false)
          setCurrentMsgIndex(prev => prev + 1)
        }, 800 + msg.content.length * 20)
      }
    }, msg.role === 'user' ? 300 : 600)

    return () => clearTimeout(timer)
  }, [currentMsgIndex, skill.sampleChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  // Track live-only messages (separate from demo messages)
  const liveMessagesRef = useRef<ChatMessage[]>([])

  // Helper: add a message with a unique stable key
  const addMsg = useCallback((msg: ChatMessage): ChatMessage & { _key: string } => {
    return { ...msg, _key: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }
  }, [])

  // Core fetch logic — reusable for retries
  const fetchChat = async (
    apiMessages: ChatMessage[],
    systemPrompt: string,
    signal: AbortSignal,
    onChunk: (full: string) => void,
  ): Promise<string> => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessCode() ? { 'x-access-code': accessCode() } : {}),
      },
      body: JSON.stringify({ messages: apiMessages, systemPrompt }),
      signal,
    })

    if (!res.ok) {
      const body = await res.text()
      if (res.status === 502 || res.status === 503) {
        throw new Error('Upstream: AI 服务暂时不可用（网关 ' + res.status + '），请稍后重试')
      }
      if (res.status === 429) {
        throw new Error('Upstream: 提问太快了，请停 10 秒再试（站点为控制成本对每个 IP 做了限速）')
      }
      throw new Error(`API ${res.status}: ${body.slice(0, 200)}`)
    }

    const reader = res.body?.getReader()
    if (!reader) throw new Error('No stream reader')

    const decoder = new TextDecoder()
    let fullContent = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') continue
        try {
          const json = JSON.parse(data)
          // Detect upstream error events (now carries a human-readable detail)
          if (json.error) {
            // hint 是给终端用户看的人话（如"余额不足，去充值"），detail 是上游原始报文
            const readable = json.hint
              ? `${json.error}\n${json.hint}`
              : `${json.error}${json.detail ? ' — ' + json.detail : ''}`
            throw new Error(`Upstream: ${readable}`)
          }
          const delta = json.choices?.[0]?.delta?.content ?? ''
          fullContent += delta
          onChunk(fullContent)
        } catch (e: any) {
          if (e.message?.startsWith('Upstream')) throw e
          // Malformed JSON — skip
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim().startsWith('data: ') && buffer.trim() !== 'data: [DONE]') {
      try {
        const json = JSON.parse(buffer.trim().slice(6))
        if (json.error) throw new Error(`Upstream: ${json.error}`)
        fullContent += json.choices?.[0]?.delta?.content ?? ''
      } catch (e: any) {
        if (e.message?.startsWith('Upstream')) throw e
      }
    }

    return fullContent
  }

  // Handle user message — call real LLM
  const handleSend = async () => {
    if (!userInput.trim() || isTyping) return
    const q = userInput
    setUserInput('')
    const userMsg: ChatMessage = { role: 'user', content: q }
    setMessages(prev => [...prev, addMsg(userMsg)])
    setIsTyping(true)
    setStreamingContent('')

    // Ensure live mode
    if (!isLiveMode) {
      setIsLiveMode(true)
      setCurrentMsgIndex(-1)
      liveMessagesRef.current = []
    }

    // 只带最近 8 条（4 轮对话）——历史越长每次请求越贵，DeepSeek 按输入 token 计费
    const allHistory = [...liveMessagesRef.current, userMsg]
    const apiMessages = allHistory.length > 8 ? allHistory.slice(-8) : allHistory
    const sp = getSystemPrompt(skill.id)

    try {
      const abort = new AbortController()
      abortRef.current = abort

      let fullContent = await fetchChat(
        apiMessages,
        sp,
        abort.signal,
        (full) => setStreamingContent(full),
      )

      // If empty response, retry with just the current user message (new signal)
      if (!fullContent.trim()) {
        console.log('[DistillHub] Empty response, retrying with single message')
        const retryAbort = new AbortController()
        abortRef.current = retryAbort
        fullContent = await fetchChat(
          [userMsg],
          sp,
          retryAbort.signal,
          (full) => setStreamingContent(full),
        )
      }

      if (!fullContent.trim()) {
        setMessages(prev => [...prev, addMsg({ role: 'ai', content: '（未收到回复，请重试）' })])
      } else {
        setMessages(prev => [...prev, addMsg({ role: 'ai', content: fullContent })])
        // Append to full history (not truncated) for continuity
        liveMessagesRef.current = [...liveMessagesRef.current, userMsg, { role: 'ai', content: fullContent }]
      }
      setStreamingContent('')
    } catch (e: any) {
      if (e.name === 'AbortError') return
      console.error('[DistillHub] chat error:', e)
      const raw = String(e.message || '')
      let friendly: string
      if (raw.startsWith('Upstream:')) {
        friendly = `⚠️ ${raw.replace('Upstream: ', '')}`
      } else if (raw.includes('Failed to fetch') || raw.includes('NetworkError')) {
        friendly = '⚠️ 网络连接失败，请检查网络后重试。'
      } else if (raw.startsWith('API ')) {
        friendly = `⚠️ 服务端返回异常：${raw.slice(0, 160)}`
      } else {
        friendly = `⚠️ 出错了：${raw.slice(0, 160)}`
      }
      setMessages(prev => [...prev, addMsg({ role: 'ai', content: friendly })])
    } finally {
      setIsTyping(false)
      abortRef.current = null
    }
  }

  const meta = categoryMeta[skill.category]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl glass border-dark-700/40 overflow-hidden animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700/30">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{skill.emoji}</span>
            <div>
              <h2 className="text-xl font-bold text-dark-100">{skill.name}</h2>
              <p className="text-sm text-dark-400">{skill.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-dark-800 transition-colors cursor-pointer text-dark-400 hover:text-dark-200">
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Info section */}
          {!showChat && (
            <div className="p-6 space-y-6">
              {/* Description */}
              <p className="text-sm text-dark-300 leading-relaxed">{skill.description}</p>

              {/* Meta */}
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800/50">
                  <StarIcon className="w-3.5 h-3.5 text-yellow-500" />
                  <span className="text-dark-300 font-mono">{formatStars(skill.stars)}</span>
                </div>
                <div className={`px-3 py-1.5 rounded-lg border ${getCategoryBg(skill.category)}`}>
                  {meta.label}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800/50 text-dark-400">
                  by {skill.author}
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Core Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {skill.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-dark-300">
                      <span className={`w-1.5 h-1.5 rounded-full bg-${skill.category === 'work' ? 'blue' : skill.category === 'celeb' ? 'violet' : skill.category === 'life' ? 'pink' : skill.category === 'self' ? 'emerald' : 'amber'}-400`} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {skill.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-lg bg-dark-800/50 text-xs text-dark-400 font-mono border border-dark-700/30">
                    {tag}
                  </span>
                ))}
              </div>

              {/* GitHub link */}
              <a
                href={skill.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800/50 border border-dark-700/30 text-sm text-dark-300 hover:text-dark-100 hover:border-dark-600/50 transition-colors"
              >
                <ExternalLinkIcon />
                View on GitHub
              </a>

              {/* Start live AI chat CTA */}
              <button
                onClick={playDemo}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-cyan-500 transition-all cursor-pointer shadow-lg shadow-violet-500/20"
              >
                开始 AI 对话
              </button>
            </div>
          )}

          {/* Chat section */}
          {showChat && (
            <div className="flex flex-col" style={{ height: 'calc(90vh - 200px)' }}>
              {/* Chat header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700/30">
                <div className="flex items-center gap-3">
                  <span>{skill.emoji}</span>
                  <div>
                    <span className="text-sm font-medium text-dark-200">{skill.name}</span>
                    <span className="ml-2 text-[10px] text-neon-green">{isLiveMode ? 'AI Live' : 'demo'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isLiveMode && (
                    <button
                      onClick={() => { setIsLiveMode(true); setMessages([]); setCurrentMsgIndex(-1); liveMessagesRef.current = [] }}
                      className="text-xs text-violet-400 hover:text-violet-300 px-2 py-1 rounded cursor-pointer border border-violet-500/30 hover:border-violet-500/60"
                    >
                      跳过 Demo
                    </button>
                  )}
                  <button
                    onClick={() => { setShowChat(false); setMessages([]); setCurrentMsgIndex(-1); setIsLiveMode(false); abortRef.current?.abort() }}
                    className="text-xs text-dark-400 hover:text-dark-200 px-2 py-1 rounded cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg._key} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-violet-600/20 text-violet-200 border border-violet-500/20 rounded-br-sm'
                          : 'bg-dark-800/60 text-dark-200 border border-dark-700/30 rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-dark-800/60 border border-dark-700/30 rounded-2xl rounded-bl-sm px-4 py-3">
                      {streamingContent ? (
                        <div className="text-sm text-dark-200 leading-relaxed whitespace-pre-wrap">{streamingContent}<span className="animate-pulse">▊</span></div>
                      ) : (
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-dark-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-dark-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-dark-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-dark-700/30">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder={`跟 ${skill.name} 说点什么...`}
                    className="flex-1 px-4 py-3 rounded-xl bg-dark-900/80 border border-dark-700/50 text-dark-200 placeholder-dark-500 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!userInput.trim()}
                    className="p-3 rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-6xl mb-4">⚗️</span>
      <h3 className="text-lg font-semibold text-dark-300 mb-2">没有找到匹配的 Skill</h3>
      <p className="text-sm text-dark-500">试试换个关键词搜索？</p>
    </div>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-dark-800/50 py-12 px-4 mt-20">
      <div className="max-w-7xl mx-auto text-center space-y-4">
        <p className="text-sm text-dark-500">
          Inspired by{' '}
          <a href="https://github.com/titanwings/colleague-skill" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 transition-colors">
            colleague-skill
          </a>
          {' '}and the amazing open-source community
        </p>
        <p className="text-xs text-dark-600">
          Data collected from GitHub. All credits belong to the original authors.
        </p>
        <p className="text-xs text-dark-600 font-mono">
          Built with React + Tailwind CSS | DistillHub 2026
        </p>
      </div>
    </footer>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [activeCategory, setActiveCategory] = useState<SkillCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'stars' | 'name'>('stars')
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)

  const filteredSkills = skills
    .filter(s => {
      const matchCategory = activeCategory === 'all' || s.category === activeCategory
      const q = searchQuery.toLowerCase()
      const matchSearch = !q ||
        s.name.toLowerCase().includes(q) ||
        s.subtitle.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      return matchCategory && matchSearch
    })
    .sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars
      return a.name.localeCompare(b.name, 'zh')
    })

  const categoryCounts: Record<string, number> = { all: skills.length }
  for (const s of skills) {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Hero totalSkills={skills.length} />

      <FilterBar
        active={activeCategory}
        onChange={setActiveCategory}
        search={searchQuery}
        onSearch={setSearchQuery}
        sortBy={sortBy}
        onSort={setSortBy}
      />

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-dark-500">
            Showing <span className="text-dark-300 font-mono">{filteredSkills.length}</span> skills
          </p>
        </div>

        {filteredSkills.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSkills.map((skill, i) => (
              <div key={skill.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <SkillCard skill={skill} onClick={() => setSelectedSkill(skill)} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Modal */}
      {selectedSkill && (
        <SkillDetailModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />
      )}
    </div>
  )
}

export default App
