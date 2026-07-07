import { NextRequest, NextResponse } from 'next/server'

const API_URL = 'https://api.xiaomimimo.com/anthropic/v1/messages'
const API_KEY = process.env.XIAOMI_API_KEY || 'sk-sga81e527xoq5cmo3g571vtj9ia0rx5vobdixu5dybn36yq1'
const MODEL = 'mimo-v2.5'

async function callXiaomi(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL, max_tokens: 4096,
        messages: [
          { role: 'user', content: [{ type: 'text', text: "Tu es JARVIS, assistant IA d'Ilyes. Tu parles francais, proactif, concis, opinionated. 11 capacites: generateur projets, memoire RAG, web search, sandbox, parallelisme 4 threads, API REST. Projets: JDIDK Mobility, LinkFlow SaaS, FloorPlan 3D." }] },
          ...messages.map((m) => ({ role: m.role === 'assistant' ? 'assistant' as const : 'user' as const, content: [{ type: 'text' as const, text: m.content }] })),
        ],
      }),
      signal: AbortSignal.timeout(60000),
    })
    if (!res.ok) return 'Erreur ' + res.status
    const data = await res.json() as { content?: { type: string; text: string }[] }
    let t = ''
    for (const c of data.content || []) { if (c.type === 'text') t += c.text }
    return t || '(vide)'
  } catch (e: unknown) { return 'Erreur: ' + (e instanceof Error ? e.message : 'timeout') }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const p = (await params).slug?.join('') || ''
  if (p === 'health') return NextResponse.json({ status: 'ok', version: '1.0.0' })
  if (p === 'status') return NextResponse.json({
    modules: { knowledge_base: { status: 'ok' }, vector_memory: { status: 'ok' }, project_generator: { status: 'ok' }, web_search: { status: 'ok' }, sandbox: { status: 'ok' }, parallel: { status: 'ok' }, orchestra: { status: 'ok' } },
    phases: [{ id: 1, name: 'Gen. projets' }, { id: 2, name: 'Memoire RAG' }, { id: 3, name: 'Web+Sandbox' }, { id: 4, name: 'Parallelisme' }, { id: 5, name: 'API Web+PWA' }],
  })
  if (p === 'briefing') return NextResponse.json({ date: new Date().toISOString().split('T')[0], projets: [{ name: 'JDIDK Mobility' }, { name: 'LinkFlow SaaS' }, { name: 'FloorPlan 3D' }], phases: 5 })
  if (p === 'projects') return NextResponse.json({ count: 8, projects: [{ name: 'CLAUDE.md' }, { name: 'jarvis.md' }, { name: 'me.md' }] })
  if (p === 'memory') return NextResponse.json({ knowledge: { count: 9 }, memory: { count: 25 } })
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const p = (await params).slug?.join('') || ''
  if (p === 'message') {
    const b = await _req.json() as { message?: string; history?: { role: string; text: string }[] }
    const msg = (b.message || '').trim()
    if (!msg) return NextResponse.json({ error: 'Vide' }, { status: 400 })
    const msgs = (b.history || []).map((h: { role: string; text: string }) => ({ role: h.role === 'jarvis' ? 'assistant' as const : 'user' as const, content: h.text }))
    msgs.push({ role: 'user', content: msg })
    return NextResponse.json({ received: msg, response: await callXiaomi(msgs), timestamp: Date.now(), model: MODEL })
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
