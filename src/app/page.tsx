'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Bot, Cpu, Database, Globe, Activity,
  MessageSquare, FileText, Send, Server, BookOpen,
  Image, Video, Paperclip, X, Sparkles, ChevronRight,
  ExternalLink, CheckCircle2, AlertCircle, Loader2,
  Upload, Zap, Shield, Menu,
} from 'lucide-react'

/* ── Types ──────────────────────────────────────────────────────────── */

type Tab = 'chat' | 'status' | 'projects' | 'memory'
type Message = { role: 'user' | 'jarvis'; text: string; timestamp: number; files?: FileInfo[] }
type FileInfo = { name: string; type: string; size: number; url?: string; preview?: string }
type ModuleStatus = { status: string; note?: string }

/* ── API ────────────────────────────────────────────────────────────── */

const API = '/api/jarvis'

/* ── Helpers ────────────────────────────────────────────────────────── */

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' o'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko'
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo'
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

/* ── Icons map ─────────────────────────────────────────────────────── */

const MODULE_ICONS: Record<string, React.ReactNode> = {
  knowledge_base: <BookOpen className="h-4 w-4" />,
  vector_memory: <Database className="h-4 w-4" />,
  project_generator: <Zap className="h-4 w-4" />,
  web_search: <Globe className="h-4 w-4" />,
  sandbox: <Shield className="h-4 w-4" />,
  parallel: <Cpu className="h-4 w-4" />,
  orchestra: <Activity className="h-4 w-4" />,
}

/* ── Sidebar ────────────────────────────────────────────────────────── */

function Sidebar({
  activeTab, onTabChange, status, collapsed, onToggle,
}: {
  activeTab: Tab; onTabChange: (t: Tab) => void
  status: string; collapsed: boolean; onToggle: () => void
}) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'status', label: 'Modules', icon: <Server className="h-4 w-4" /> },
    { id: 'projects', label: 'Projets', icon: <FileText className="h-4 w-4" /> },
    { id: 'memory', label: 'Mémoire', icon: <Database className="h-4 w-4" /> },
  ]

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={onToggle} className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl glass lg:hidden">
        <Menu className="h-5 w-5 text-text-secondary" />
      </button>

      <aside className={`fixed left-0 top-0 z-40 flex h-full flex-col border-r border-border-glass bg-bg-glass backdrop-blur-2xl transition-all duration-300 ${
        collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'w-56'
      }`}>
        {/* Logo */}
        <div className={`flex h-16 items-center border-b border-border-glass px-4 ${collapsed ? 'justify-center lg:px-0' : 'gap-3'}`}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 animate-pulse-glow">
            <Bot className="h-5 w-5 text-accent" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-text-primary">JARVIS</p>
              <p className="text-[10px] text-text-muted tracking-widest uppercase">Assistant IA</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {tabs.map((t, i) => (
            <button key={t.id} onClick={() => onTabChange(t.id)}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 animate-fade-in ${
                collapsed ? 'justify-center lg:px-0' : ''
              } ${
                activeTab === t.id
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {t.icon}
              {!collapsed && t.label}
              {activeTab === t.id && !collapsed && (
                <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" />
              )}
            </button>
          ))}
        </nav>

        {/* Status */}
        <div className={`border-t border-border-glass p-4 ${collapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-2">
            <span className="status-dot ok" />
            {!collapsed && <span className="text-xs text-text-muted">{status}</span>}
          </div>
        </div>
      </aside>
    </>
  )
}

/* ── File Preview ───────────────────────────────────────────────────── */

function FilePreview({ file, onRemove }: { file: FileInfo; onRemove?: () => void }) {
  const isImage = file.type?.startsWith('image/')
  const isVideo = file.type?.startsWith('video/')

  return (
    <div className="group relative inline-flex flex-col items-center rounded-xl border border-border-glass bg-bg-surface p-2 animate-scale-in">
      {isImage && file.preview ? (
        <img src={file.preview} alt={file.name} className="h-16 w-16 rounded-lg object-cover" />
      ) : isVideo ? (
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-accent/10">
          <Video className="h-6 w-6 text-accent" />
        </div>
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-accent/10">
          <FileText className="h-6 w-6 text-accent" />
        </div>
      )}
      <p className="mt-1 max-w-[80px] truncate text-[10px] text-text-muted">{file.name}</p>
      {onRemove && (
        <button onClick={onRemove} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-error text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

/* ── Chat Panel ─────────────────────────────────────────────────────── */

function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'jarvis', text: "Salut Ilyes 👋 Je suis JARVIS, ton assistant IA prêt à t'aider ! Tu peux m'envoyer du texte, des images ou des vidéos.", timestamp: Date.now() },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<FileInfo[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return
    const newFiles: FileInfo[] = Array.from(selectedFiles).map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
    }))
    setFiles((prev) => [...prev, ...newFiles].slice(0, 5)) // max 5
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const sendMessage = useCallback(async () => {
    if (!input.trim() && files.length === 0) return

    const userMsg: Message = { role: 'user', text: input, timestamp: Date.now(), files: [...files] }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input + (files.length > 0 ? ` [${files.map(f => f.name).join(', ')}]` : ''),
        }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, {
        role: 'jarvis',
        text: data.response || files.length > 0
          ? `J'ai reçu ${files.length} fichier(s) ! ${input ? `\n\nMessage : "${input}"` : ''}\n\nJe peux analyser des images et traiter les infos. Donne-moi un instant.`
          : 'Message reçu !',
        timestamp: Date.now(),
      }])
    } catch {
      setMessages((prev) => [...prev, { role: 'jarvis', text: 'Erreur de connexion au serveur JARVIS.', timestamp: Date.now() }])
    }
    setFiles([])
    setLoading(false)
  }, [input, files])

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border-glass px-6 glass-strong">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
            <MessageSquare className="h-4 w-4 text-accent" />
          </div>
          <h1 className="text-sm font-semibold text-text-primary">Chat JARVIS</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          En ligne
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'jarvis' ? 'justify-start' : 'justify-end'} animate-fade-in`}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className={`max-w-[85%] space-y-2 ${
                m.role === 'jarvis' ? 'bubble-jarvis' : 'bubble-user'
              }`}>
                {/* Files */}
                {m.files && m.files.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {m.files.map((f, j) => (
                      <FilePreview key={j} file={f} />
                    ))}
                  </div>
                )}
                {/* Text */}
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</p>
                <p className="text-[10px] text-text-muted/50 text-right">{formatTime(m.timestamp)}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bubble-jarvis">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[0, 150, 300].map((d, i) => (
                      <span key={i} className="h-2 w-2 rounded-full bg-accent/60"
                        style={{ animation: `pulse 1.4s ease-in-out ${d}ms infinite` }} />
                    ))}
                  </div>
                  <span className="text-sm text-text-muted">JARVIS réfléchit...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border-glass bg-bg-surface/50 px-4 py-4 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-3">
          {/* File previews */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => <FilePreview key={i} file={f} onRemove={() => removeFile(i)} />)}
            </div>
          )}

          {/* Drop zone + input */}
          <div
            className={`relative flex items-end gap-2 rounded-2xl border-2 p-2 transition-all ${
              dragOver ? 'border-accent bg-accent/5 drop-zone active' : 'border-border-glass bg-bg-surface'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files) }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Message pour JARVIS... (Enter pour envoyer, Shift+Enter pour sauter une ligne)"
              rows={1}
              className="input-premium flex-1 resize-none border-0 bg-transparent !p-2 !shadow-none !ring-0"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />

            <div className="flex items-center gap-1">
              {/* File button */}
              <button onClick={() => fileInputRef.current?.click()}
                className="btn-ghost flex h-9 w-9 items-center justify-center rounded-xl p-0">
                <Paperclip className="h-4 w-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)} />

              {/* Send button */}
              <button onClick={sendMessage} disabled={loading || (!input.trim() && files.length === 0)}
                className="btn-premium btn-primary h-9 w-9 !p-0 disabled:opacity-40">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Drag hint */}
          <p className="text-center text-xs text-text-muted">
            Déposez des images ou vidéos ici, ou cliquez sur <Paperclip className="inline h-3 w-3" />
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Status Panel ───────────────────────────────────────────────────── */

function StatusPanel() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { fetch(`${API}/status`).then(r => r.json()).then(setData).catch(() => {}) }, [])

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4 animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20">
            <Server className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">Modules JARVIS</h1>
            <p className="text-sm text-text-secondary">7 capacités actives — Tous les systèmes opérationnels</p>
          </div>
        </div>

        {!data ? (
          /* Loading skeleton */
          <div className="space-y-3">
            {[1,2,3,4,5,6,7].map((i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </div>
        ) : (
          <>
            {/* Modules grid */}
            <div className="mb-8 grid gap-3">
              {Object.entries(data.modules || {}).map(([key, mod], i) => {
                const m = mod as ModuleStatus
                return (
                  <div key={key}
                    className="card-premium flex items-center justify-between px-5 py-4 animate-fade-in-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                        {MODULE_ICONS[key] || <Cpu className="h-4 w-4 text-accent" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary capitalize">{key.replace(/_/g, ' ')}</p>
                        {m.note && <p className="text-xs text-text-muted mt-0.5">{m.note}</p>}
                      </div>
                    </div>
                    <span className={`status-dot ${m.status === 'ok' ? 'ok' : m.status?.includes('non') ? 'warn' : 'err'}`} />
                  </div>
                )
              })}
            </div>

            {/* Resources */}
            {data.resources && (
              <div className="card-premium p-6 animate-fade-in-up stagger-7">
                <h3 className="mb-5 text-sm font-semibold text-text-primary">Ressources</h3>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {Object.entries(data.resources).map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-accent/5 p-4 text-center transition-all hover:bg-accent/10">
                      <p className="text-2xl font-bold gradient-text">{v as number}</p>
                      <p className="mt-1 text-xs text-text-muted capitalize">{k}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Phases */}
            {data.phases && (
              <div className="mt-6 card-premium p-6 animate-fade-in-up">
                <h3 className="mb-4 text-sm font-semibold text-text-primary">Plan de route JARVIS</h3>
                <div className="space-y-3">
                  {data.phases.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        p.status === 'done' ? 'bg-success/20 text-success' : 'bg-accent/10 text-accent'
                      }`}>
                        {p.status === 'done' ? <CheckCircle2 className="h-4 w-4" /> : p.id}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-text-primary">{p.name}</p>
                        <p className="text-xs text-text-muted">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ── Projects Panel ─────────────────────────────────────────────────── */

function ProjectsPanel() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { fetch(`${API}/projects`).then(r => r.json()).then(setData).catch(() => {}) }, [])

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-4 animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20">
            <FileText className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">Projets</h1>
            <p className="text-sm text-text-secondary">{data?.count || '...'} fichiers dans la Knowledge Base</p>
          </div>
        </div>

        <div className="grid gap-2">
          {(data?.projects || Array.from({ length: 8 })).map((p: any, i: number) => (
            <div key={i}
              className="card-premium flex items-center justify-between px-5 py-3.5 animate-fade-in-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-text-muted" />
                <p className="text-sm text-text-primary">{p?.name || 'Chargement...'}</p>
              </div>
              <p className="text-xs text-text-muted">{p?.size ? formatFileSize(p.size) : ''}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Memory Panel ───────────────────────────────────────────────────── */

function MemoryPanel() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { fetch(`${API}/memory?category=all`).then(r => r.json()).then(setData).catch(() => {}) }, [])

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-4 animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20">
            <BookOpen className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">Mémoire</h1>
            <p className="text-sm text-text-secondary">Base de connaissances JARVIS</p>
          </div>
        </div>

        {data && Object.entries(data).map(([cat, cd]: [string, any], i) => (
          <div key={cat} className="card-premium mb-4 p-5 animate-fade-in-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <h3 className="mb-3 text-sm font-semibold capitalize text-text-primary flex items-center gap-2">
              <Database className="h-4 w-4 text-accent" />
              {cat} <span className="text-text-muted font-normal">({cd.count})</span>
            </h3>
            <div className="space-y-1">
              {Object.entries(cd.files || {}).slice(0, 8).map(([name], j) => (
                <div key={j} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-text-secondary hover:bg-white/5 transition-colors">
                  <FileText className="h-3.5 w-3.5 text-text-muted" />
                  {name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main Page ───────────────────────────────────────────────────────── */

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-bg-base">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        status="En ligne · Phase 5"
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
      />
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-56'}`}>
        {activeTab === 'chat' && <ChatPanel />}
        {activeTab === 'status' && <StatusPanel />}
        {activeTab === 'projects' && <ProjectsPanel />}
        {activeTab === 'memory' && <MemoryPanel />}
      </main>
    </div>
  )
}
