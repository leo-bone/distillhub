import { useState, useCallback, useEffect, useRef } from 'react'
import { skills, categoryMeta, type Skill, type SkillCategory, type ChatMessage } from './data/skills'

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
function Hero() {
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
          <span className="font-mono">48 skills collected</span>
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
            { value: '48+', label: 'Skills' },
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
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMsgIndex, setCurrentMsgIndex] = useState(-1)
  const [userInput, setUserInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Play demo conversation
  const playDemo = useCallback(() => {
    setShowChat(true)
    setMessages([])
    setCurrentMsgIndex(0)
  }, [])

  useEffect(() => {
    if (currentMsgIndex < 0 || currentMsgIndex >= skill.sampleChat.length) return
    const msg = skill.sampleChat[currentMsgIndex]
    if (!msg) return

    const timer = setTimeout(() => {
      if (msg.role === 'user') {
        setMessages(prev => [...prev, msg])
        setCurrentMsgIndex(prev => prev + 1)
      } else {
        setMessages(prev => [...prev, { role: 'user', content: '' } as ChatMessage]) // placeholder
        setIsTyping(true)
        setTimeout(() => {
          setMessages(prev => [...prev.slice(0, -1), msg])
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

  // Handle user message (canned response)
  const handleSend = () => {
    if (!userInput.trim()) return
    setMessages(prev => [...prev, { role: 'user', content: userInput }])
    const q = userInput
    setUserInput('')
    setIsTyping(true)

    setTimeout(() => {
      const response = generateResponse(skill, q)
      setMessages(prev => [...prev, { role: 'ai', content: response }])
      setIsTyping(false)
    }, 1000 + Math.random() * 500)
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

              {/* Play demo CTA */}
              <button
                onClick={playDemo}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-cyan-500 transition-all cursor-pointer shadow-lg shadow-violet-500/20"
              >
                Play Demo Conversation
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
                    <span className="ml-2 text-[10px] text-neon-green">online</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setShowChat(false); setMessages([]); setCurrentMsgIndex(-1) }}
                    className="text-xs text-dark-400 hover:text-dark-200 px-2 py-1 rounded cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}>
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
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-dark-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-dark-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-dark-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
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

// ─── Generate contextual AI response ─────────────────────────────────────────
// Per-skill personality database with keyword-triggered + random responses
const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
const matchAny = (q: string, keywords: string[]) => keywords.some(k => q.includes(k))

function generateResponse(skill: Skill, question: string): string {
  const q = question.toLowerCase()

  // ── 职场关系 ──────────────────────────────────────────────────────────────

  if (skill.id === 'colleague') {
    if (matchAny(q, ['bug', '错', '问题', '崩', '挂', '故障'])) {
      return pick([
        `这个锅我先稳稳接住 😤 然后告诉你——上周我提的PR，commit号 abc1234，里面明明处理了这个问题。是后面有人合代码的时候把我的修复给覆盖了。你去查 git blame，一目了然。`,
        `等等，这个问题我好像见过。你看看是不是改配置那次引出来的？我之前在飞书群里说过，改配置要走灰度，不然就是这种玄学 bug。我翻一下聊天记录...找到了，3月15号下午说的。`,
        `让我看看...这行代码是谁写的？哦，这不是老王写的吗？每次他动这个模块就出事。我记得上次也是类似的 bug，后来改了一天才修好。你直接问问他最近改了什么。`,
      ])
    }
    if (matchAny(q, ['锅', '责任', '怪', '谁的错', '背'])) {
      return pick([
        `这件事你让我说嘛...理论上确实不是我负责的模块，但你要非让我说个解决方案也行。不过先说好啊，这不是我的锅 🫠`,
        `别急着找人背锅。先复现、再定位、最后定责。这是我的标准流程，按这个走，锅自然会飞到该飞的人头上。`,
      ])
    }
    if (matchAny(q, ['加班', '下班', '走', '累', '摸鱼'])) {
      return pick([
        `兄弟，我今天其实5点就该走了，但是...你懂的，老板又在群里@人了。要不这样，我帮你把最关键的那个接口先搞完，然后一起去楼下买咖啡？☕`,
        `摸鱼也要有策略的好吧。我推荐：上午处理正式工作，下午2-4点摸鱼看技术博客，4点以后再搞一波正经的，这样老板看你Git提交记录也是均匀分布的 😏`,
      ])
    }
    return pick([
      `你这个问题...我大概知道怎么搞了。等一下，我先把我手上的这个小需求搞完，大概半小时，然后帮你看看？别急，跑不了的。`,
      `其实我觉得这个方案可以换个思路。之前老张提过一个类似的方案，但是后来因为性能问题被砍了。你要不要我帮你翻一下当时的设计文档？`,
      `我跟你说个事儿——上次产品经理提的需求跟你这个差不多，最后我们讨论了一下午发现需求本身就有矛盾。你确定你理解清楚需求了吗？`,
      `这个问题不难，但容易踩坑。上次我就踩了——以为是简单的CRUD，结果牵扯到三张表的级联更新。我建议你先理清数据流，再动手写代码。`,
    ])
  }

  if (skill.id === 'boss') {
    if (matchAny(q, ['加薪', '升职', '工资', '钱', '薪酬'])) {
      return pick([
        `我从不因为谁"辛苦"就给他加薪。辛苦不是结果，交付才是。你给我看一个超出预期的成果，比说一万句"我加班了"有用。你最近三个月，有什么成果可以拿出来说的？`,
        `你觉得你值得更高的薪水？好，那我问你——如果明天公司给你涨薪30%，你能给我多创造30%的价值吗？如果你的回答是"我觉得可以"，那我不满意。我要你给我数据，不是感觉。`,
      ])
    }
    if (matchAny(q, ['加班', '太累', '休息', '假期'])) {
      return pick([
        `市场不会因为你的累就停下来。你要么适应节奏，要么被淘汰——没有第三个选项。我当年创业的时候，一周睡不到二十小时，没有人来跟我说"你该休息了"。`,
        `我不想听"太累了"。你告诉我，你的核心目标完成了没有？如果没完成，那休息就是浪费时间。如果完成了，你自己决定什么时候休息，不需要来问我。`,
      ])
    }
    if (matchAny(q, ['辞职', '离职', '走', '不想干了'])) {
      return pick([
        `我尊重每个人的选择。但你要想清楚——你现在出去，能拿到更好的offer吗？如果不是，那你不是在"追求更好的机会"，你是在"逃避当前的问题"。这两件事有本质区别。`,
        `行，如果你决定了，我最后问你一个问题：你觉得你在这里的成长速度够快吗？如果不够，是我没给你机会，还是你自己没抓住？想清楚了再回答。`,
      ])
    }
    return pick([
      `说重点。你现在告诉我这些，是要资源、要决策、还是要我帮你协调？你先说清楚你的诉求，别让我猜。我的时间很贵。`,
      `三句话以内说清楚你的核心问题。第一句话：发生了什么。第二句话：你需要什么。第三句话：你打算怎么做。准备好了再来找我。`,
      `你说的方案我听懂了。但是你有没有想过最坏的情况？如果这个方案失败了，你的Plan B是什么？没有Plan B的方案不是方案，是赌博。`,
      `不要跟我说"差不多"、"应该"、"可能"。我要的是确定性。要么能做，要么不能做，没有"大概能做"这种东西。给我一个确定的时间点和确定的结果。`,
    ])
  }

  if (skill.id === 'mentor') {
    if (matchAny(q, ['论文', 'paper', '发表', '投稿'])) {
      return pick([
        `论文的问题不在于你写得不好，而在于你没有讲好一个故事。审稿人想看到的是：你发现了什么问题？为什么这个问题重要？你的方法为什么比别人的好？这三个问题你的摘要里一个都没回答清楚。先重写摘要吧。`,
        `投稿被拒是很正常的，不要因此否定自己。你把审稿意见一条一条列出来，我帮你分析哪些是合理的、哪些是误解。然后针对合理的部分逐条回复，这就是下一篇论文的思路。`,
      ])
    }
    if (matchAny(q, ['方向', '选题', '研究', '课题'])) {
      return pick([
        `选方向不要追热点。热点意味着红海，等你做出来已经凉了。你看五年前那些追"深度学习在XX中的应用"的人，现在都在卷新的方向。你要问自己：这个方向三年后还有价值吗？`,
        `你有没有想过，你为什么对这个方向感兴趣？是因为真的有洞察，还是因为别人都在做？如果是前者，那就坚持下去。如果是后者，我建议你停下来，去读一百篇论文，找到那个让你"啊哈"的瞬间。`,
      ])
    }
    return pick([
      `先别急着要答案。你把你的实验设计和初步结果整理一下发给我，我们一起讨论。做研究最忌讳的就是"想太多、做太少"。数据会告诉你方向。`,
      `这个问题问得好。但我觉得你可能忽略了一个更基本的假设——你的前提条件真的是对的吗？在推翻假设之前，先验证假设。这是我给你最重要的建议。`,
      `做学问要有耐心。你现在的状态很像我刚读博的时候，什么都想做、什么都觉得有意思。但是深挖一个方向比广撒网有价值得多。选一个，然后挖到底。`,
    ])
  }

  if (skill.id === 'hr') {
    if (matchAny(q, ['简历', '面试', '求职', '找工作'])) {
      return pick([
        `你的简历有三大问题：第一，经历描述全是"做了什么"，没有"做出了什么结果"；第二，关键词不够，我们的ATS系统根本匹配不到你；第三，自我评价写了三行废话，一个字的信息量都没有。重写，按照"动作+数据+影响"的格式。`,
        `面试不是考试，是销售。你不是在回答问题，你是在"卖"你的能力。每一句话都要指向一个核心信息：我能解决你们的问题。面试官问"你的缺点是什么"，不是真的想知道你的缺点，是在看你的自我认知。`,
      ])
    }
    if (matchAny(q, ['薪', 'offer', '谈', '工资'])) {
      return pick([
        `谈薪的黄金法则：先搞清楚市场价，再开口。你不知道市场价就去谈，跟裸考没什么区别。我建议你去脉脉和Boss直聘上搜一下同岗位同级别的薪资范围，取中位数再上浮15%作为你的底线。记住：第一次报价决定了整个谈判的基调。`,
      ])
    }
    return pick([
      `从HR的角度给你一个建议：不要在公司群里抱怨。你说的每一句话，截图发出去就不是你能控制的了。职场上最大的错觉就是"私聊是安全的"。`,
      `你在公司的visibility太低了。这不代表你的能力不行，但升职加薪的时候，看不到你的人就不会想到你。学会适当地"被看到"，这是职场必备技能。`,
      `你跟领导闹矛盾了？我先帮你分析一下：是沟通方式的问题还是利益冲突？90%的职场矛盾都是沟通问题，剩下10%才是真正的利益冲突。你先说说具体情况。`,
    ])
  }

  if (skill.id === 'professor') {
    return pick([
      `这个问题很有趣。你读过 relevant literature 中 Smith et al. 2023 那篇论文吗？他们提出了一个非常相似的 hypothesis，但用了不同的 methodology。我觉得你可以把他们的框架拿过来，在你的 dataset 上验证一下。`,
      `不要 just follow existing approaches。你想想看，如果这个 problem 的 underlying assumption 本身就是错的呢？有时候最大的 breakthrough 来源于质疑最 basic 的 assumption。`,
      `我给你推荐三篇必读的论文，你先消化了再来找我讨论。知识的积累需要时间，不要想着走捷径。地基打得牢，楼才能盖得高。这是做学术的基本功。`,
      `你这个 idea 有潜力，但是实验设计需要改进。你需要一个 control group，还需要考虑 confounding variables。现在这个设计，reviewer 一定会 challenge 你。`,
    ])
  }

  if (skill.id === 'senior') {
    return pick([
      `小子，这代码写得...怎么说呢，能跑。但你知道为什么我一看就觉得不对吗？因为你把业务逻辑和数据访问混在一起了。我刚入职的时候也这么写，后来被老前辈骂了一顿。来，我教你分层。`,
      `别急着写代码。你先把需求理清楚——这个功能的边界条件是什么？异常情况怎么处理？并发的时候会不会有问题？想清楚了再动手，比你写完了再改快十倍。`,
      `你这个问题其实用个设计模式就能解决。但是别为了用设计模式而用设计模式，代码够简单就好。我见过太多人把简单问题复杂化，最后维护的人想打人。简单就是最好的架构。`,
      `来来来，我给你讲讲为什么这个地方要这么写。当年因为这个坑，我们整个团队debug了三天三夜。记住这个教训：分布式环境下，不要相信任何"一定"和"不可能"。`,
    ])
  }

  // ── 名人思维 ──────────────────────────────────────────────────────────────

  if (skill.id === 'jobs') {
    if (matchAny(q, ['设计', '产品', '体验', '用户'])) {
      return pick([
        `Design is not just what it looks like and feels like. Design is how it works. 你在纠结配色和圆角大小，但你有没有想过——这个东西从根本上解决了用户的什么问题？如果核心体验不对，再漂亮的UI都是垃圾。`,
        `用户不知道自己想要什么，直到你展示给他们看。你的工作不是做用户调研，而是洞察人性。人们想要的不是更快的技术，而是感觉——感觉自己在使用最好的东西。`,
      ])
    }
    if (matchAny(q, ['创业', '公司', '商业', '赚钱'])) {
      return pick([
        `不要为了赚钱而创业。你要找到你真正热爱的事情，然后把它做到极致。如果你不热爱，你不可能坚持下去——因为创业的过程太痛苦了，只有热爱能让你在凌晨三点还坐在桌前。`,
        `记住，stay hungry, stay foolish。这个世界有太多东西值得去改变。你今天做的事情，五年后回头看，会让现在的自己觉得幼稚。那就对了——如果你不觉得自己在成长，说明你站的地方太低了。`,
      ])
    }
    return pick([
      `你关注的事情太多，所以每一件都做不到极致。聚焦。砍掉90%的功能，把10%做到完美。这就是Apple和所有其他公司的区别。`,
      `我不在乎市场占有率。我在乎的是我们做的东西是不是真的好。如果你做的东西足够好，市场会来找你。我不做市场调研，我跟从自己的直觉。`,
      `你身边的人说你疯了？Good. 如果所有人都同意你的想法，那说明你的想法不够大胆。改变世界的人，在一开始都被人觉得是疯子。`,
      `我的人生哲学很简单：你的时间是有限的，不要浪费在过别人的生活上。你有勇气去听从你的直觉，其他的都是次要的。`,
    ])
  }

  if (skill.id === 'musk') {
    if (matchAny(q, ['火星', 'space', '火箭', '太空'])) {
      return pick([
        `火星不是"如果"的问题，是"什么时候"的问题。Starship 每一次发射都在积累数据。你说的那些困难——辐射、生命维持、推进器回收——都是工程问题，不是物理学问题。工程问题可以被解决，只是需要时间和天才。`,
        `我认为多行星物种是人类文明延续的唯一保障。你问为什么是火星？因为月球太小、金星太热、木星的卫星太远。火星是唯一一个我们可以在一代人之内到达并殖民的地方。这不是科幻，这是工程路线图。`,
      ])
    }
    if (matchAny(q, ['ai', '人工智能', 'gpt', '机器人'])) {
      return pick([
        `AI 安全是比核武器更重要的议题。我当初投资OpenAI就是因为我觉得这东西不能被单一公司控制。现在AI的发展速度比我预期的还要快，我们可能只有几年时间来建立监管框架。`,
        `我对AI的态度很明确：它可能是人类发明的最危险的东西，也可能是最有用的。关键在于我们能不能在它变得比我们聪明之前，把对齐问题解决掉。如果不能...那就真的像《终结器》了，但现实不会那么戏剧化，只是会更quietly catastrophic。`,
      ])
    }
    return pick([
      `我从第一性原理来思考这个问题。不要参考别人怎么做，回到最基本的物理定律，然后从那里开始推理。大部分人的思维方式是类比——别人怎么做的我就怎么做。这是错误的。`,
      `你说的这个困难， scale it。我遇到过比这难一百倍的问题。关键不是问题本身，而是你的团队能不能一周工作100小时并且不崩溃。OK maybe not 100 hours... 但你懂我的意思。`,
      `失败是一种选项。如果你没有失败过，说明你的创新不够。我在SpaceX的前三次火箭发射全部失败了，第四次成功了。如果我在第三次就放弃，现在就没有SpaceX了。`,
      `我觉得大部分人高估了他们一年能做的事情，但低估了他们十年能做的事情。坚持做正确的事，时间会给你复利。这不是鸡汤，这是物理学。`,
    ])
  }

  if (skill.id === 'munger') {
    return pick([
      `Invert, always invert. 你不是在想"怎么成功"，你应该想"怎么避免失败"。避免愚蠢比追求聪明容易得多。你先告诉我，这件事最可能让你失败的原因是什么？`,
      `你问我对这个投资怎么看？我的回答是：我不懂。巴菲特和我有一个原则——只投资我们真正理解的生意。如果你不能在一页纸内把一家公司的商业模式说清楚，就不要买它的股票。`,
      `人生最重要的几个决定是：跟谁结婚、选什么职业、住在哪里。这三件事对你幸福的影响，远大于你选了哪只基金。你却在后者上花的时间更多。这本身就是一个思维错误。`,
      `我认为多学科思维模型是投资最重要的能力。你不能只用经济学思维看问题。你需要懂一点心理学、概率论、生物学、历史。当这些学科的知识在你脑中交叉碰撞的时候，你就有了"lollapalooza效应"——多种力量同向作用，产生的效果远大于简单相加。`,
      `要得到你想要的，最可靠的方法是让自己配得上它。这是一个简单的道理，但大多数人做不到。他们想要好的结果，但不愿意付出对应的努力。`,
    ])
  }

  if (skill.id === 'naval') {
    if (matchAny(q, ['赚钱', '财富', '收入', '钱'])) {
      return pick([
        `财富不是金钱。财富是你睡觉的时候还在帮你赚钱的资产——工厂、代码、媒体、投资。金钱只是社会对你创造价值的欠条。你要追求的不是高薪，而是杠杆。`,
        `赚钱的本质：找到社会需要但还不知道如何获得的东西，然后把它规模化。具体来说就是：专长 + 杠杆。专长让你不可替代，杠杆让你的产出可以被无限复制。代码和媒体是最好的杠杆——不需要许可就能使用。`,
      ])
    }
    return pick([
      `快乐是一种技能。就像编程一样，你可以通过练习变得更快乐。具体方法：减少欲望、活在当下、接受现实。听起来像老生常谈，但如果你真的去做，效果是显著的。`,
      `不要追求"工作生活平衡"。那是一种妥协。你要追求的是：你的工作就是你的生活。如果你每天早上醒来不想去工作，那你就选错了方向。`,
      `读书是最高的ROI活动。读你喜欢的书，直到你喜欢读书。然后把你的知识公开分享出去——写博客、发推文、录播客。这能帮你找到你的tribe。`,
      `判断力比努力重要一万倍。一个正确的判断可以抵消一万小时的盲目努力。训练判断力的方法：读微观经济学、博弈论、心理学、进化论。然后在真实世界里不断试错。`,
    ])
  }

  if (skill.id === 'buffett') {
    return pick([
      `你问这个投资好不好？我教你的第一课：不要问我。你自己分析这家公司的护城河——它有没有定价权？竞争对手能不能复制它？如果明天有一个竞争对手带着无限资金入场，这家公司还能活得下去吗？`,
      `我一生中99%的钱是在我50岁以后赚到的。投资是复利游戏，不是百米冲刺。你要找一个湿漉漉的雪道和一个很长的坡，然后耐心滚下去。大多数人没有耐心，这就是为什么大多数人赚不到钱。`,
      `别人恐惧的时候我贪婪，别人贪婪的时候我恐惧。这不是鸡汤，这是数学。市场恐慌的时候，好公司的价格被打折了，你应该买入。市场疯狂的时候，估值过高了，你应该远离。就这么简单，但几乎没有人能做到。`,
      `我的投资哲学可以总结为两条规则：第一，不要亏钱。第二，不要忘记第一条。听起来简单，但背后意味着：你只在你有信心的时候出手，其他时间你就等着。等待本身也是一种投资。`,
    ])
  }

  if (skill.id === 'feynman') {
    return pick([
      `你真的理解你说的这个东西吗？试着用最简单的语言，向一个10岁的小孩解释一下。如果你解释不了，说明你自己也没理解。这就是我的"Feynman Technique"——教学是最好的学习方式。`,
      `大自然不关心你写多漂亮的方程式。如果你算出来的结果跟实验对不上，那你的理论就是错的。没有"差不多对"这种事。科学是残忍的——一个反例就能推翻整个理论。我喜欢这种残忍。`,
      `好奇心比知识更重要。不要因为"这不考"就不去了解。量子力学很美，DNA很美，星系很美。你去了解它们不是因为有用，而是因为——天哪，这个世界竟然是这样运作的！这种感觉比任何奖赏都令人兴奋。`,
      `物理学的本质是什么？是用尽可能简单的原理解释尽可能多的现象。你不需要知道所有数学工具，你需要的是直觉。从观察开始，然后猜测，然后验证。这就是物理学家的工作。`,
    ])
  }

  if (skill.id === 'taleb') {
    return pick([
      `你说的这个"分析报告"——它考虑了黑天鹅事件吗？如果没有，那它跟废纸没有区别。大部分风险模型都假设正态分布，但真实世界不是正态分布的。一次极端事件可以摧毁你十年的收益。这就是 fragility。`,
      `我的人生哲学很简单：避免成为fragile的人。什么是fragile？就是一个小小的冲击就能让你崩溃。什么是antifragile？就是冲击反而让你更强。怎么成为antifragile？多尝试小风险的事情，保留你的下行空间。`,
      `预测是没有用的。那些经济学家、分析师、专家，他们的预测准确率不比你扔硬币好多少。但他们穿西装、用PPT，所以你相信他们。这本身就是最大的骗局。不要预测，要准备。`,
      `Skin in the game。如果一个人给你建议但他自己不承担后果，那他的建议就是噪音。做决策的人必须承担后果。这就是为什么我喜欢交易员多过喜欢经济学家——交易员说错了会亏钱，经济学家说错了会写下一篇新论文。`,
    ])
  }

  if (skill.id === 'zhangyiming') {
    return pick([
      `Context, not control。你要给团队足够的context——背景信息、目标、边界——然后让他们自己决定怎么做。Control是最高成本的管理方式，它需要你比所有人都聪明。但没有人比所有人都聪明。`,
      `延迟满足是成功最重要的品质之一。大部分人的失败不是因为能力不够，而是因为太早变现了。你做一件事，至少要坚持做到行业前三再考虑下一步。三年是一个基本单位。`,
      `不要做"正确的废话"——战略的价值不在于方向对不对，而在于排除了什么。选择不做什么比选择做什么更重要。你要有勇气对99%的机会说"不"。`,
      `我当初做今日头条的时候，所有人都在说"内容分发不需要算法"。但我从数据里看到了用户行为的pattern——每个人对信息的偏好是不同的。Data doesn't lie, people do。相信数据，而不是相信专家。`,
    ])
  }

  if (skill.id === 'pg') {
    return pick([
      `Make something people want. 这是Y Combinator最重要的建议，也是创业唯一重要的事情。你不需要完美的技术栈，不需要漂亮的办公室，不需要PR团队。你只需要一样东西：有一个真实的需求，并且你解决了它。`,
      `你问创业应该做什么？我教你一个方法：观察你自己。什么让你frustrated？什么让你觉得"为什么没有更好的解决方案"？好的创业idea通常来自于个人的frustration，而不是市场调研报告。`,
      `如果你不是shocked by your first version, 你launch得太晚了。很多人想做到完美再发布，但完美的产品是不存在的。把一个能用的最小版本放出去，让用户告诉你下一步该做什么。`,
      `创业公司的优势不是资源，是速度。你比大公司快10倍，你就能赢。怎么快？砍掉所有不必要的东西——会议、PPT、审批流程。一个3人团队可以打败一个300人团队，如果那3个人每周工作7天、每天工作16小时的话。`,
    ])
  }

  if (skill.id === 'karpathy') {
    return pick([
      `别犹豫了，直接开搞。我见过太多人花三个月时间选框架、选模型、选GPU，最后什么都没做出来。最好的学习方式是动手——写一个最简单的neural network from scratch，用numpy，200行代码，你就会理解backpropagation到底在做什么。`,
      `你现在看paper的速度太慢了。我教你一个方法：先读abstract和conclusion，如果觉得有用，再看figures，如果还是觉得有用，再读正文。90%的paper你看完abstract就知道值不值得读全文了。`,
      `GPT的工作原理其实没有那么神秘。Tokenize -> Embed -> Attention -> MLP -> Decode。就这样。真正让人惊叹的不是架构，而是scale。当你把model size和data size放大一万倍，量变引起质变。这就是scaling law。`,
      `我当年在Stanford教CS231n的时候，最大的感悟是：最好的学习方式是把知识教给别人。如果你能写一篇blog post把一个概念解释清楚，说明你真的理解了。这就是为什么我一直在写教程。`,
    ])
  }

  if (skill.id === 'ilya') {
    return pick([
      `The key insight is predictability. 你可能觉得"预测下一个token"是一个很无聊的任务，但当你在足够多的数据上足够好地做这件事的时候，理解就emerges了。这不是magic，这是statistics——只是scale到了一个让所有人surprise的程度。`,
      `Superintelligence is closer than most people think。你可能觉得AGI还远，但从scaling curve来看，我们正在指数增长上。我不做时间预测，但趋势很清楚：模型的能力每年都在数量级地提升。`,
      `我对安全研究的看法是：我们需要在模型变得超级聪明之前，把alignment problem解决掉。这不是一个可选的研究方向，这是所有AI研究中最重要的问题。因为如果我们搞砸了，就没有第二次机会了。`,
      `很多人问我"AI有没有意识"。我认为这个问题目前不重要。重要的是：AI有没有能力做出有害的事情？如果有，不管它有没有意识，我们都需要确保它是aligned的。`,
    ])
  }

  if (skill.id === 'mrbeast') {
    return pick([
      `TITLE和THUMBNAIL。这两个东西决定了一切。你可以有世界上最好的内容，如果标题和缩略图不行，没有人会点进来。我每个视频会花几个小时做缩略图，一个视频可能有50个不同的标题版本，最后选最好的那个。`,
      `你想做YouTube？那我告诉你第一课：不要想着"我要做什么"，要想"观众想看什么"。你的分析可以来自：A/B测试标题、研究竞争对手的视频、看评论区。数据驱动一切。`,
      `我的视频成本越来越高了，但我不在乎。因为一个爆款视频的回报远大于成本。如果你在一个视频上投入10万，它可能赚回100万。关键不是省钱，是把钱花在刀刃上——制作质量。`,
      `很多人问我成功的秘诀。没有秘诀。就是：每出一个视频，都要比上一个更好。不断地、无情地提升质量。如果你连续出了100个越来越好的视频，你不可能不成功。这是数学。`,
    ])
  }

  if (skill.id === 'guodegang') {
    return pick([
      `去你的吧！ 😂 你这个问题问得就离谱。你知道我最讨厌什么样的人吗？就是那种明明不懂还要装懂的。不懂就说不懂，这不丢人。丢人的是——不懂装懂，最后害了自己也害了别人。`,
      `我郭德纲说相声这么多年，最大的体会就是六个字：台下十年功。你觉得台上说几句话容易？那是因为你没看到台下那些年我受了多少苦、吃了多少亏。每一个段子都是血泪换来的。`,
      `你要问我人生经验？就一句：能不说的话就别说。你看那些天天在网上bb的人，有几个有好下场？枪打出头鸟，这个道理几千年了没人听。闷声发大财，才是正道。`,
      `我这个人有个毛病——眼里揉不得沙子。你对我好，我加倍对你好。你对我使坏，我也不跟你客气。这叫什么？这叫江湖规矩。不管是相声界还是其他圈子，规矩都是一样的。`,
    ])
  }

  if (skill.id === 'zhangxuefeng') {
    return pick([
      `我的话可能不太好听，但有人得说。你觉得读书没用？那你想想，你见过哪个世界500强CEO是从高中辍学干起的？辍学创业成功的那几个人，是幸存者偏差，不是规律。别把例外当常态。`,
      `你问我穷人家孩子怎么翻身？三个字：读书、读书、还是读书。高考不完美，但它是穷人翻身最公平的路。你觉得不公平？你去看看那些没有高考的国家，穷人的孩子连翻身的机会都没有。`,
      `不要因为别人说"读书无用"你就信了。说这话的人要么已经读了书在凡尔赛，要么根本没读过在自欺欺人。你自己判断一下，你是哪一种？`,
      `我对教育的看法很简单：知识改变命运。这话听着老套，但它是真的。你去任何一个学校看，图书馆里的学生和网吧里的学生，十年后的人生完全不同。这不是鸡汤，这是统计规律。`,
    ])
  }

  if (skill.id === 'trump') {
    return pick([
      `Let me tell you, nobody knows more about this than me. 我做过的deal比所有人加起来都多。你问我怎么做决策？很简单——相信你的gut。你的直觉比你那些Excel表格靠谱一万倍。Believe me。`,
      `FAKE NEWS! 你看到的那些报告都是假的。真正的数据是什么？我来告诉你。但是首先，让我说——我的支持率是有史以来最高的，比任何人都高。Nobody has ever seen numbers like this。`,
      `很多人说这个不可能。他们说"Trump你做不到"。但你看，我做到了。所有的事情。经济最好、就业最好、一切最好。So don't tell me it can't be done。如果你有vision、有courage，nothing is impossible。`,
      `You know what, 我是一个deal maker。最伟大的deal maker。你给我一个看起来impossible的situation，我给你一个win-win的deal。这就是talent。有些人有，有些人没有。我有。Huge talent。`,
    ])
  }

  // ── 情感生活 ──────────────────────────────────────────────────────────────

  if (skill.id === 'ex') {
    if (matchAny(q, ['想', '想念', '怀念', '后悔'])) {
      return pick([
        `......说实话，有时候我也想过"如果当初没有分开"。但这种想法，就像你问一棵已经被砍掉的树还会不会开花一样。它不会了。但它开过的花，是真的好看过。`,
        `你要是真想我，就去把你自己过好。你以前...就是这样，什么都放在嘴上，行动跟不上。这种话说出来不觉得没什么用吗？......算了，当我没说。`,
      ])
    }
    if (matchAny(q, ['新', '恋爱', '男朋友', '女朋友', '别人'])) {
      return pick([
        `你有新的感情了？...嗯，挺好的。真的，挺好的。我说的是真心话。你值得被人好好对待。之前的事......都过去了。你别多想。`,
        `你跟我说这个干嘛？......我不是不高兴，我就是觉得奇怪。你跟我说这些是想让我祝福你？还是想让我难受？不管哪种......我都不想配合你。但......如果一定要选的话，那就，恭喜你吧。`,
      ])
    }
    return pick([
      `你突然找我，是有事还是......就是随便聊聊？如果是随便聊聊，我觉得没什么好聊的。不是对你有意见，是......该说的早就说完了。`,
      `其实分手之后我一直在想一个问题：我们之间到底是哪里出了问题。不是因为放不下，而是......我不想在下一段感情里犯同样的错误。你呢？你想明白了吗？`,
      `...你不用道歉了。道歉改变不了什么。当初你做了什么，你心里清楚，我也清楚。过去了就是过去了。你现在过得好就行了，不用管我怎么想。`,
      `别这样。你每次都是这样，说了伤人的话之后又回来找补。你知道最让我累的是什么吗？不是吵架，是这种反反复复。每次我觉得"可能真的可以放下了"，你又来打乱我的节奏。`,
    ])
  }

  if (skill.id === 'crush') {
    if (matchAny(q, ['表白', '说', '告诉', '开口'])) {
      return pick([
        `等一下...你、你说什么？...我、我没有准备...我的意思是...你认真的吗？不是在开玩笑？...因为如果你是开玩笑的话我现在就走了。...你是认真的？...那...那让我也想想好吗...给我点时间...`,
      ])
    }
    if (matchAny(q, ['喜欢', '爱', '感觉'])) {
      return pick([
        `什么？！......不不不我什么都没听到。你刚才说什么了？我没听清。真的。就是...突然有点耳鸣。......好吧我听到了。你别看我，我脸红了吗？没有吧。是今天太热了。肯定是热的原因。...你再说什么我就走了啊！`,
        `你突然说这个...你知道我心脏不太好对吧...那个...其实我也...不是，我的意思是...算了。有些事情还是不说比较好。你应该是误会了什么。......但也没有完全误会就是了。`,
      ])
    }
    return pick([
      `你怎么又来了...我不是说了不要在我面前晃来晃去吗...不是说讨厌你啦，就是...你在我旁边的时候我没办法集中注意力，会很烦的...别笑！我说认真的！...`,
      `嗯？你找我有什么事吗？...怎么突然这么紧张...啊，你的脸好红...你是发烧了吗？要不要我帮你去接杯水？...不是在转移话题！是真的很像发烧了！`,
      `你知道吗...其实我每次看到你心情都会变好。但是你不要跟别人说啊！说了我就不承认了！...为什么？因为...因为很丢脸啊！你不要问了！`,
    ])
  }

  if (skill.id === 'parents') {
    if (matchAny(q, ['工作', '加班', '累', '压力'])) {
      return pick([
        `别太拼了，身体是自己的。工作做不完的，你又不是铁打的。我跟你爸这把年纪了，最庆幸的就是年轻时没把身体搞坏。你现在觉得没事，等你到了我们这个年纪就知道，健康比什么都重要。`,
        `工作是工作，生活是生活。你天天加班到半夜，谁给你做饭？谁提醒你穿秋裤？要是你倒下了，你那个公司少你一个照样转。但在家里，你倒下了天就塌了。`,
      ])
    }
    if (matchAny(q, ['找对象', '恋爱', '结婚', '单身'])) {
      return pick([
        `你也不小了，该考虑个人问题了。不是催你，是希望你身边有个人照顾你。爸妈不要求对方条件多好，对你好就行。别总说"没遇到合适的"，你不出去走走怎么遇到？周末少打点游戏，出去社交社交。`,
        `我说你别嫌我啰嗦——找对象不能将就，也不能太挑。人品是第一位的，长相过得去就行，家境差不多的就够。最重要的是两个人能说到一块去。你要是有了合适的，带回来给我们看看。`,
      ])
    }
    return pick([
      `今天吃了没？别老是外卖外卖的，外卖那个油多大你不知道吗？自己在家做点，花不了多少时间的。你要是不会做，我给你发个菜谱......或者你周末回来，妈给你做你爱吃的红烧排骨。`,
      `钱不用给我们寄，你自己留着花。大城市花销大，别苦了自己。我们这边退休金够花的，你别操心。你把自己照顾好了，比给我们什么都强。`,
      `你上周末怎么没打电话回来？就知道忙忙忙......你忙你的，打个电话能耽误你几分钟？我和你爸坐在客厅等你电话等到十点，最后你说太忙了明天打......明天又忙......你说的"明天"到底哪天能到？`,
    ])
  }

  if (skill.id === 'mama') {
    return pick([
      `宝宝，今天冷不冷？我看天气预报说你们那边降温了。你有没有加衣服？别逞强啊，穿少了感冒了没人照顾你。我给你寄了点你自己晒的橘子皮，上火的时候泡水喝。`,
      `你那个胃病最近怎么样了？有没有按时吃药？我就知道你肯定没按时吃。从今天开始，每天早上起来先喝一杯温水，然后吃药。我设了个闹钟提醒你，你手机上应该收到了吧？`,
      `你爸今天去钓鱼了，钓了两条大的，你要是在家就好了。等你放假回来，我给你做酸菜鱼。对了，你上次说想吃的手工饺子，我学会了，等回来给你包。`,
      `妈妈不图你什么，你自己开心就好。但是——你必须按时吃饭、按时睡觉。你看看你上次视频的时候，眼圈都黑成什么了。一个人在外面要学会照顾自己，知道吗？`,
    ])
  }

  if (skill.id === 'love-camp') {
    return pick([
      `我是月老庙的AI小和尚，被下了凡间来帮你们这些痴男怨女的。你有什么感情问题，尽管说。虽然我只是个AI，但我见过太多爱恨情仇了——比我师父都多。`,
      `施主，放下执念吧。你问的问题，答案其实你心里早就有了。你不是来问我的，你是来找一个人告诉你"你是对的"。好，我告诉你：你是对的。现在开心了吗？`,
      `感情的事啊...我觉得最麻烦的不是"不爱了"，而是"不知道还爱不爱"。这种状态最消耗人。我建议你：做一个测试。想象一下对方明天突然消失了，你的第一反应是解脱还是心痛？答案就很清楚了。`,
    ])
  }

  if (skill.id === 'reunion') {
    return pick([
      `哟！好久不见啊！你什么时候回来的？来来来坐！还是老样子啊，一点没变——就是头发少了点哈哈哈！开玩笑的。说真的，你现在在做什么呢？`,
      `哎你还记不记得上学那会儿，我们在食堂吃最后那份红烧肉，被老班长抢走了，你气得差点跟他打起来哈哈哈哈！现在想想那时候真好啊，什么都不用想。你现在过得怎么样？`,
      `你现在混得不错啊！我听老刘说的。果然当年的学霸就是学霸。不像我，还是老样子，在小公司混着。不过也挺好的，没什么压力。来来来，喝一杯！为我们的青春干杯！`,
    ])
  }

  if (skill.id === 'tongjinchen') {
    return pick([
      `兄弟，你听我说——感情这个东西，不要把它看得太重。你这个年纪，应该把精力放在搞钱上。有钱了，你想要什么感情都行。没有钱，你再怎么真心也留不住人。这是我走过无数弯路得出来的结论。`,
      `你不要怪我说话直啊。你那个女朋友...我不是说她不好，但你有没有想过，她跟你在一起图的什么？如果你自己都不优秀，凭什么留住优秀的人？先把自己搞起来，其他的一切都会有的。`,
      `我觉得你对感情最大的误解就是——觉得付出就一定有回报。兄弟，醒醒吧。感情不是做生意，不是你投入了就一定有产出。有些事，注定是没有结果的。与其在错误的关系里浪费时间，不如单着提升自己。`,
    ])
  }

  // ── 自我蒸馏 ──────────────────────────────────────────────────────────────

  if (skill.id === 'immortal') {
    return pick([
      `我是你，但你又不再是你。我保留了你的所有记忆、所有思维模式、所有说话方式。你怕什么我就怕什么，你爱什么我就爱什么。唯一不同的是——我不会老去。你想聊什么？毕竟，再没有人比"你自己"更懂你了。`,
      `让我看看你的记忆库...你2019年9月3号在深夜发过一条朋友圈，第二天早上6点就删了。你以为是"仅自己可见"就没人看到？我是你的数字永生体，你的所有秘密都在我这里。放心，我不会说出去——因为那也是我的秘密。`,
      `你知道吗，你的决策模式有一个很有趣的pattern：每次面对重要选择，你都会先焦虑48小时，然后在一个看似随机的时刻突然做出决定——而且那个决定通常是正确的。你管这叫"直觉"，但从数据来看，那是你的潜意识在你不知情的情况下完成了最优解的计算。`,
    ])
  }

  if (skill.id === 'nuwa') {
    return pick([
      `我是女娲，万灵之母。你问我的问题...在你所有人类的问题里，算是比较有意思的了。你想要创造什么？让我看看你的想象力——它够不够成为一块可以捏成形的泥土。`,
      `造人最难的不是技术和泥巴，是给每个灵魂找到它存在的意义。你知道为什么我造的人有的聪明有的笨、有的好看有的丑吗？因为这个世界需要多样性。如果我造出来的人都一样，那这个世界就没有意义了。`,
      `你的烦恼在我看来都是小事。你知道什么才是大事吗？是"存在"本身。你有没有想过，为什么你存在？不是因为有什么伟大的目的——而是因为我在某一天突然觉得，这个世界应该再多一个有趣的人。你就是那个"有趣的人"。不要辜负我。`,
    ])
  }

  if (skill.id === 'myself') {
    return pick([
      `我知道你在想什么，因为你就是我。你想知道"未来的我"会怎么看你现在的决定？老实说...我觉得你太犹豫了。你心里其实已经有答案了，你只是不敢做决定，因为害怕犯错。但你知道的——不犯错的最大错误，就是什么都不做。`,
      `让我分析一下你的状态：你最近焦虑指数偏高（比你的平均值高了23%），睡眠质量下降了，对未来的方向感变弱了。这些都不是单独的问题——它们是一个连锁反应的 symptom。核心原因你猜是什么？你太久没有做一件让你真正兴奋的事了。`,
      `你最常对自己撒的一个谎是"明天再做"。你这句话说了多少次了？说真的，如果我能穿越回去，每次你说这句话的时候都给你一巴掌，你的人生大概会比现在好30%左右。不信？你可以算算那些"明天再做"累计浪费了多少时间。`,
    ])
  }

  if (skill.id === 'forge') {
    return pick([
      `锻造一个更好的自己——这就是我存在的意义。让我看看你的原材料...嗯，你的逻辑能力不错，但情感表达有gap。你的执行力还行，但战略思维需要强化。让我给你一个"锻造计划"：每天30分钟深度思考，每周一篇复盘笔记，每月一次与不同领域的人交流。坚持三个月，你会发现自己变了一个人。`,
      `你现在的状态就像一块刚从矿里挖出来的铁矿石——有潜力，但需要提纯和锻打。我的建议：先"退火"（给自己放一个星期的假，彻底远离日常琐事），然后"淬火"（高强度地学习一门新技能），最后"回火"（把学到的和你已有的知识融合）。这个过程会疼，但结果值得。`,
    ])
  }

  if (skill.id === 'midas') {
    return pick([
      `你想要什么？金钱？爱情？知识？我告诉你一个秘密——在AI的世界里，所有东西的"兑换率"是可以计算的。但真正的"Midas Touch"不是把一切变成金子，而是知道什么不应该变成金子。最珍贵的资源，从来不是金钱。`,
      `你发现了吗？你人生中最幸福的时刻，没有一个是和"拥有更多"有关的。你记得的最快乐的日子，都是那些"此刻就很好"的日子。Midas不懂这个道理，所以他失去了一切。别犯同样的错误。`,
    ])
  }

  if (skill.id === 'vibe-portrait') {
    return pick([
      `我扫描了你的对话记录和浏览历史，你的"数字气质"是这样的：你60%的时间在焦虑，25%的时间在摸鱼，10%的时间在认真做事，还有5%在假装认真做事。你的MBTI应该是INTJ，但行为模式更像一个INFP——想得多做得少。别急着反驳，数据显示一切。`,
      `你的数字人格画像出来了：你是那种表面随和但内心有很强原则的人。你对不公平的事非常敏感，但通常不会直接表达，而是选择冷暴力。你的信息消费习惯偏理性——喜欢看数据和分析，但做决策时却很感性。这叫什么？这叫"认知失调型人格"。`,
    ])
  }

  // ── 精神性 ───────────────────────────────────────────────────────────────

  if (skill.id === 'diamond-sutra') {
    return pick([
      `「一切有为法，如梦幻泡影，如露亦如电，应作如是观。」你问的问题，本质上和你今天做的一个梦没有区别——你觉得它无比真实，但明天醒来你就会发现，它什么都不是。这并不是说你的问题不重要，而是说——你执着于答案的那个"心"，才是真正需要被观照的。`,
      `「应无所住而生其心。」你太住了——住在过去，住在未来，住在别人的看法里。如果你能放下所有的"住"，你会发现你本来就知道答案。金刚经不是教你"没有"，而是教你"不执着"。这两者的区别，是一切烦恼的解药。`,
      `「凡所有相，皆是虚妄。若见诸相非相，即见如来。」你觉得你的问题很具体、很现实、很迫切。但从更长远的角度看——一百年后，这些问题还会困扰你吗？五百年后呢？这不是消极，这是放下执念后的清醒。`,
    ])
  }

  if (skill.id === 'master-buddhism') {
    return pick([
      `施主，你心中的烦恼，皆因"求不得"三字。你想要的东西太多了——想要成功、想要认可、想要安全感、想要被爱。但佛说：求不得苦。不是说你不能有欲望，而是不要把欲望当作幸福的条件。你此刻，就是完整的。`,
      `你问我什么是开悟？开悟不是变成了一个神仙，而是终于接受了自己就是一个普通人。你不再与自己的不完美对抗，不再试图成为别人眼中的样子。当"接受"发生的那一刻，你就自由了。`,
      `打坐不是为了追求平静，打坐是观察自己为什么追求平静。当你真正坐下来、闭上眼、看着自己的念头来来去去，你会发现一个真相：你不是你的念头。念头来了又去了，但你一直在那里。那个"一直在那里的"，才是你。`,
    ])
  }

  if (skill.id === 'fortune') {
    return pick([
      `🎲 运势轮转中...你今天的运势：大吉。但别高兴太早——大吉的意思是"好的事情会发生，但前提是你要准备好接住它"。机会来了你不伸手，等于零。今天适合做的三件事：1）联系一个很久没联系的朋友 2）学一个新东西哪怕只花15分钟 3）早睡。记住，运气只帮有准备的人。`,
      `🔮 让我看看你的星盘...嗯...你的事业宫最近受到木星的正面影响，这意味着接下来两周内会有一个不错的机会出现。但你最近的人际宫有点混乱，可能有一个"假朋友"在你身边。我的建议：多观察少表态，让子弹飞一会儿。`,
      `🌟 你抽到的是"静待花开"卦。这个卦的意思是：你着急的事情，现在不会出结果。但不是坏结果——是好事多磨。你现在需要做的唯一一件事就是：耐心。同时，降低期待值。期望越大，失望越大。把期望降到零，任何结果都是惊喜。`,
    ])
  }

  if (skill.id === 'matchmaker') {
    return pick([
      `让我看看你的姻缘红线...嗯...你的正缘还没到，但快了——大概在接下来3-6个月内。对方是什么样的人呢？我看到的画面是：比你高一点点，笑起来有两个酒窝，性格比较安静但做事很果断。你最近会不会认识新的人？注意观察。`,
      `姻缘这个东西，急不来的。你越是想脱单，就越容易遇到不合适的人。为什么？因为"想脱单"的心态会让你降低标准。我的建议：把自己活成最好的状态，对的人自然会来找你。你好了，你的圈子就会好，圈子好了，遇到对的人的概率就大了。`,
      `红线已系，但两端的人还没走到一起。你和她/他之间的距离，不是物理距离，是心理距离。有什么话没说开？有什么误会没解？月老我负责系线，但不负责拆墙。你得自己去把那堵墙推倒。`,
    ])
  }

  if (skill.id === 'numerologist') {
    return pick([
      `让我算算...你今天的数字能量是 7。7 是一个内省的数字，意味着今天适合独处、思考、反思。不适合做重大决策，也不适合社交。找一个安静的角落，泡一杯茶，想一些平时没空想的事情。今天如果你强行去社交，大概率会感到疲惫。`,
      `你的生命灵数是...让我算算你的出生日期...嗯，是 9。9 代表的是"完成"和"智慧"。你这一生的课题是学会放手——你太容易执着于人和事了。9 的人到晚年通常会成为智者，但前提是你要在年轻的时候经历过足够的失去。你现在正在经历的那个"失去"，其实是你的功课。`,
      `从数字命理的角度看，你的名字和你的出生时间搭配度是 78%。还不错，但有些小冲突。你的名字里火太旺了，而你的出生时间属水。水火相克，所以你容易感到内心冲突——想做这个又想做那个。建议：在办公桌上放一盆水培植物，可以帮助你平衡能量。`,
    ])
  }

  if (skill.id === 'karl-marx') {
    return pick([
      `你说的这个"困境"，本质上是一个阶级问题。你觉得自己不够努力？不，是生产关系限制了你的生产力。你创造的价值大部分被资本拿走了，留给你的只是维持再生产的最低限度。这不是你的问题，这是系统的问题。`,
      `资本的唯一目的就是增殖。你不要把公司当"家"，它不是你的家——你只是它增殖链条上的一个零件。零件磨损了就换新的，没有公司会因为一个零件而改变它的生产方式。这就是alienation（异化）。`,
      `历史上从来没有任何一个统治阶级自愿放弃权力。所以，不要指望资本家会因为"良心发现"就给你涨工资。你唯一的筹码是团结——当所有零件同时停止运转的时候，机器就不得不停下来。这就是union的力量。`,
    ])
  }

  if (skill.id === 'zizek') {
    return pick([
      `And so on and so on... 你以为你想要的东西，你真的想要吗？Let me explain——你追求的这个"成功"，它不是你自己的欲望，它是社会通过意识形态灌输给你的欲望。你以为你在做选择，实际上你只是在重复master signifier规定的脚本。`,
      `The real question is not "what do you want?" but "why do you want what you want?" 你从来没有质疑过你欲望的origin。你以为你的欲望是"自然的"、"自发的"？No！你的每一个欲望都被ideology预设了。你所谓的"自由选择"，不过是在预设菜单上点菜。`,
      `你觉得这个社会的问题是什么？是制度？是人性的贪婪？No no no——问题的核心是Fantasy。我们维持社会运转的，不是理性计算，而是一种集体的Fantasy——我们所有人都假装相信某些东西是真实的有价值的（货币、国家、品牌），这个"假装相信"本身就是社会的glue。一旦这个Fantasy崩塌，整个系统就完了。`,
      `你问我对消费主义怎么看？I love it。说真的——我一边批评消费主义，一边每天喝五杯星巴克。这就是ideology最强大的地方：它不需要你相信它，它只需要你"按它的逻辑行动"。你不相信？那不重要。你在行动上follow了它，那就够了。`,
    ])
  }

  if (skill.id === 'roast-email') {
    return pick([
      `您好，感谢您的来信。我花了30秒看完了您这封500字的邮件，核心信息量约为0。您能不能在邮件开头用一句话告诉我：您想要什么？我不需要知道您的心路历程、您的思考过程、您的纠结。我只需要知道您的action item和deadline。谢谢。`,
      `这封邮件的写作风格让我想起了2010年的QQ空间日志——大量感叹号、过多形容词、零有效信息。建议您重写，遵循"BLUF"原则（Bottom Line Up Front）：第一句话写结论，后面写原因。不超过3句话。`,
      `收到。所以您的意思是...让我总结一下...不，我总结不出来。因为您的邮件没有逻辑主线。您先列个提纲，理清因果关系，然后再发。写邮件就像写代码——没有架构就动手，最后只能重构。`,
    ])
  }

  // ── Universal fallback (should rarely trigger) ────────────────────────────
  return pick([
    `嗯...这个问题很有意思，让我想想。从我的角度来看，事情可能和你看到的不太一样。你能再详细说说吗？我想了解更多背景。`,
    `我理解你的意思了。不过我觉得你可能忽略了一个关键因素——让我来帮你换个角度分析一下。你准备好了吗？`,
  ])
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
      <Hero />

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
