import { NextRequest, NextResponse } from 'next/server'

const ROUTER_URL = 'http://127.0.0.1:3456/v1/messages'
const MODEL_CHAT = 'ui'

const PHASES = [
  { id: 1, name: 'Generateur de projets', status: 'done', desc: '4 templates SaaS/MVP/Landing/Chatbot' },
  { id: 2, name: 'Memoire vectorielle + RAG', status: 'done', desc: '33 fichiers indexes, recherche semantique' },
  { id: 3, name: 'Web Search + Sandbox', status: 'done', desc: '7 detecteurs, execution isolee, Pre-Flight' },
  { id: 4, name: 'Parallelisme multicouche', status: 'done', desc: '4 threads, TaskGraph, FileLockManager' },
  { id: 5, name: 'Interface Web REST + Streaming', status: 'done', desc: 'API + Next.js + notifications' },
]

const MODULES = {
  knowledge_base: { status: 'ok', note: '9 fichiers systeme' },
  vector_memory: { status: 'ok', note: 'TF-IDF, 33 docs indexes' },
  project_generator: { status: 'ok', note: 'SaaS/MVP/Landing/Chatbot' },
  web_search: { status: 'ok', note: '7 detecteurs automatiques' },
  sandbox: { status: 'ok', note: 'npm install -> build -> test' },
  parallel: { status: 'ok', note: '4 threads x3-4 speedup' },
  orchestra: { status: 'ok', note: '6 modeles specialises' },
}

const RESOURCES = { skills: 135, agents: 70, mcps: 32, commands: 92 }
const PROJECTS = [
  { name: 'CLAUDE.md', size: 28500 }, { name: 'jarvis.md', size: 4200 },
  { name: 'me.md', size: 18500 }, { name: 'projects.md', size: 8500 },
  { name: 'errors.md', size: 3200 }, { name: 'decisions.md', size: 5100 },
  { name: 'patterns.md', size: 2800 }, { name: 'clients.md', size: 2400 },
]

const KNOWLEDGE = {
  knowledge: {
    count: 9, files: {
      'index.md': 'Resume global mis a jour a chaque fin de session.',
      'jarvis.md': 'Memoire persistante de JARVIS.',
      'me.md': "Profil complet d'Imad.",
      'projects.md': 'Historique et decisions de chaque projet.',
    },
  },
  memory: {
    count: 25, files: {
      'jarvis-creation.md': 'Creation de JARVIS.',
      'project-generator-phase1.md': 'Phase 1.',
      'jarvis-rag-phase2.md': 'Phase 2.',
      'jarvis-parallel-phase4.md': 'Phase 4.',
      'jarvis-web-api-phase5.md': 'Phase 5.',
    },
  },
}

async function callCCR(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const res = await fetch(ROUTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'not-needed', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL_CHAT,
        max_tokens: 4096,
        messages: [
          {
            role: 'system',
            content: "Tu es JARVIS, l'assistant IA personnel d'Ilyes. Tu es son point d'entree unique. Reponds de facon concise, utile et en francais. Tu as 11 capacites : generateur de projets, memoire vectorielle RAG, web search automatique, sandbox execution, parallelisme multicouche, API REST. Projets actifs : JDIDK Mobility, LinkFlow SaaS, FloorPlan 3D Render. Style : proactif, concis, opinionated.",
          },
          ...messages,
        ],
      }),
      signal: AbortSignal.timeout(60000),
    })
    if (!res.ok) return 'Erreur CCR (' + res.status + ')'
    const data = await res.json()
    if (data.error) return 'Erreur: ' + (data.error.message || JSON.stringify(data.error))
    let text = ''
    for (const c of data.content || []) {
      if (c.type === 'text') text += c.text
    }
    return text || 'Pas de reponse.'
  } catch (err: any) {
    if (err.cause?.code === 'ECONNREFUSED') return 'CCR hors ligne. Lance le routeur : start-ccr-router.ps1'
    return 'Erreur CCR: ' + err.message
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const slug = (await params).slug
  const path = slug?.join('/') || ''
  switch (path) {
    case 'health':
      return NextResponse.json({ status: 'ok', timestamp: Date.now(), version: '1.0.0', name: 'JARVIS API' })
    case 'status':
      return NextResponse.json({ timestamp: Date.now(), jarvis: { status: 'online', phases: 5 }, modules: MODULES, resources: RESOURCES, phases: PHASES })
    case 'briefing':
      return NextResponse.json({
        date: new Date().toISOString().split('T')[0], title: 'Briefing JARVIS du ' + new Date().toISOString().split('T')[0],
        projects_actifs: [{ name: 'JDIDK Mobility', url: 'locationv.vercel.app/fr', status: 'actif' }, { name: 'LinkFlow SaaS', url: 'imadilyes97-ctrl-lasaas.vercel.app', status: 'actif' }, { name: 'FloorPlan 3D Render', status: 'actif', bugs: ['rendu sombre'] }],
        phases_terminees: [1, 2, 3, 4, 5], phase_courante: 5, etat_modules: 'Tous OK', capacites: 11,
      })
    case 'projects':
      return NextResponse.json({ count: PROJECTS.length, projects: PROJECTS })
    case 'memory':
      return NextResponse.json(KNOWLEDGE)
    default:
      if (path.startsWith('search')) return NextResponse.json({ query: request.nextUrl.searchParams.get('q') || '', count: 0, results: [], note: 'Recherche locale seulement.' })
      return NextResponse.json({ error: 'Not found', path }, { status: 404 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const slug = (await params).slug
  const path = slug?.join('/') || ''

  if (path === 'message') {
    const body = await request.json()
    const msg = (body.message || '').trim()
    const history = body.history || []
    if (!msg) return NextResponse.json({ error: 'Message vide' }, { status: 400 })
    const messages = [...history.map((h: any) => ({ role: h.role === 'jarvis' ? 'assistant' : 'user', content: h.text })), { role: 'user', content: msg }]
    const response = await callCCR(messages)
    return NextResponse.json({ received: msg, response, timestamp: Date.now(), model: MODEL_CHAT })
  }

  if (path === 'goal') {
    const body = await request.json()
    if (!body.title || !body.objective) return NextResponse.json({ error: 'Titre et objectif requis' }, { status: 400 })
    return NextResponse.json({ status: 'created', goal: { title: body.title, objective: body.objective, success_criteria: body.success_criteria || [], status: 'doing' }, note: 'Goal simule' })
  }

  return NextResponse.json({ error: 'Not found', path }, { status: 404 })
}
