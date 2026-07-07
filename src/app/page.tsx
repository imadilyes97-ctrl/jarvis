'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Bot, Cpu, Database, Search, Globe, Activity,
  MessageSquare, FileText, Send, Server, BookOpen,
} from 'lucide-react'

type Tab = 'chat' | 'status' | 'projects' | 'memory'

// API calls via Next.js API routes
const API = '/api/jarvis'

const MODULE_ICONS: Record<string, React.ReactNode> = {
  knowledge_base: <BookOpen className="h-4 w-4" />,
  vector_memory: <Database className="h-4 w-4" />,
  project_generator: <BoxIcon className="h-4 w-4" />,
  web_search: <Globe className="h-4 w-4" />,
  sandbox: <ShieldIcon className="h-4 w-4" />,
  parallel: <Cpu className="h-4 w-4" />,
  orchestra: <Activity className="h-4 w-4" />,
}

function BoxIcon(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> }
function ShieldIcon(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> }

function Sidebar({ activeTab, onTabChange, status }: { activeTab: Tab; onTabChange: (t: Tab) => void; status: string }) {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-56 flex-col border-r border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="flex h-14 items-center gap-2 border-b border-[var(--color-border)] px-4">
        <Bot className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
        <span className="text-sm font-semibold">JARVIS</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {[
          { id: 'chat' as Tab, label: 'Chat', icon: <MessageSquare className="h-4 w-4" /> },
          { id: 'status' as Tab, label: 'Modules', icon: <Server className="h-4 w-4" /> },
          { id: 'projects' as Tab, label: 'Projets', icon: <FileText className="h-4 w-4" /> },
          { id: 'memory' as Tab, label: 'Mémoire', icon: <Database className="h-4 w-4" /> },
        ].map((t) => (
          <button key={t.id} onClick={() => onTabChange(t.id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === t.id
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]'
            }`}
          >{t.icon}{t.label}</button>
        ))}
      </nav>
      <div className="border-t border-[var(--color-border)] p-3">
        <div className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: 'var(--color-success)' }} />
          {status}
        </div>
      </div>
    </aside>
  )
}

function ChatPanel() {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input, timestamp: Date.now() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'jarvis', text: data.response || 'Message reçu.', timestamp: Date.now() }])
    } catch { setMessages((prev) => [...prev, { role: 'jarvis', text: 'Erreur de connexion.', timestamp: Date.now() }]) }
    setLoading(false)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'jarvis' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              m.role === 'jarvis' ? 'bg-[var(--color-muted)]' : 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
            }`}>
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
            <div className="flex gap-1">
              {[0, 150, 300].map((d, i) => (
                <span key={i} className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-muted-foreground)]"
                  style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
            JARVIS réfléchit...
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="border-t border-[var(--color-border)] p-4">
        <div className="flex items-center gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Message pour JARVIS..."
            className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none"
            style={{ borderColor: 'var(--color-border)' }} />
          <button onClick={sendMessage} disabled={loading || !input.trim()}
            className="rounded-xl p-2.5 disabled:opacity-50"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusPanel() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { fetch(`${API}/status`).then(r => r.json()).then(setData).catch(() => {}) }, [])

  if (!data) return <div className="p-4 text-sm text-[var(--color-muted-foreground)]">Chargement...</div>

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Modules JARVIS</h2>
      <div className="grid gap-3">
        {Object.entries(data.modules || {}).map(([key, mod]: [string, any]) => (
          <div key={key} className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3">
            <div className="flex items-center gap-3">
              {MODULE_ICONS[key] || <Cpu className="h-4 w-4 text-[var(--color-muted-foreground)]" />}
              <div>
                <p className="text-sm font-medium">{key.replace(/_/g, ' ')}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">{mod.note || ''}</p>
              </div>
            </div>
            <span className={`status-pulse ${mod.status === 'ok' ? 'status-ok' : 'status-warn'}`} />
          </div>
        ))}
      </div>
      {data.resources && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <h3 className="mb-3 text-sm font-medium">Ressources</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(data.resources).map(([k, v]) => (
              <div key={k} className="rounded-lg p-3 text-center" style={{ background: 'var(--color-muted)' }}>
                <p className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>{v as number}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">{k}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ProjectsPanel() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { fetch(`${API}/projects`).then(r => r.json()).then(setData).catch(() => {}) }, [])

  if (!data) return <div className="p-4 text-sm text-[var(--color-muted-foreground)]">Chargement...</div>

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Projets ({data.count})</h2>
      <div className="grid gap-2">
        {data.projects?.map((p: any, i: number) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3">
            <p className="text-sm">{p.name}</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">{Math.round(p.size / 1024)} KB</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function MemoryPanel() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { fetch(`${API}/memory?category=all`).then(r => r.json()).then(setData).catch(() => {}) }, [])

  if (!data) return <div className="p-4 text-sm text-[var(--color-muted-foreground)]">Chargement...</div>

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Mémoire</h2>
      {Object.entries(data).map(([cat, cd]: [string, any]) => (
        <div key={cat} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <h3 className="mb-3 text-sm font-medium capitalize">{cat} ({cd.count})</h3>
          <div className="space-y-2">
            {Object.entries(cd.files || {}).slice(0, 5).map(([name]) => (
              <div key={name} className="py-1 text-xs text-[var(--color-muted-foreground)]">{name}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('status')
  const [status, setStatus] = useState('En ligne')

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-background)', color: 'var(--color-foreground)' }}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} status={status} />
      <main className="ml-56 flex-1">
        {activeTab === 'chat' && <ChatPanel />}
        {activeTab === 'status' && <StatusPanel />}
        {activeTab === 'projects' && <ProjectsPanel />}
        {activeTab === 'memory' && <MemoryPanel />}
      </main>
    </div>
  )
}
