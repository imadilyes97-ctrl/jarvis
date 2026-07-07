import { NextRequest, NextResponse } from 'next/server'

const PHASES = [
  { id: 1, name: 'Generateur de projets', status: 'done', desc: '4 templates SaaS/MVP/Landing/Chatbot' },
  { id: 2, name: 'Memoire vectorielle + RAG', status: 'done', desc: '33 fichiers indexes, recherche semantique' },
  { id: 3, name: 'Web Search + Sandbox', status: 'done', desc: '7 detecteurs, execution isolee, Pre-Flight' },
  { id: 4, name: 'Parallelisme multicouche', status: 'done', desc: '4 threads, TaskGraph, FileLockManager' },
  { id: 5, name: 'Interface Web REST + Streaming', status: 'done', desc: 'API + Next.js + notifications' },
]

const MODULES: Record<string, { status: string; note: string }> = {
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
  { name: 'CLAUDE.md', size: 28500 },
  { name: 'jarvis.md', size: 4200 },
  { name: 'me.md', size: 18500 },
  { name: 'projects.md', size: 8500 },
  { name: 'errors.md', size: 3200 },
  { name: 'decisions.md', size: 5100 },
  { name: 'patterns.md', size: 2800 },
  { name: 'clients.md', size: 2400 },
]

const KNOWLEDGE: Record<string, { count: number; files: Record<string, string> }> = {
  knowledge: {
    count: 9,
    files: {
      'index.md': 'Resume global mis a jour a chaque fin de session.',
      'jarvis.md': 'Memoire persistante de JARVIS. Role, capacites, regles de conduite.',
      'me.md': "Profil complet d'Imad : identite, style, stack, projets.",
      'projects.md': 'Historique et decisions de chaque projet.',
    },
  },
  memory: {
    count: 25,
    files: {
      'jarvis-creation.md': 'Creation de JARVIS comme point d entree unique.',
      'project-generator-phase1.md': 'Phase 1 - Generateur de projets.',
      'jarvis-rag-phase2.md': 'Phase 2 - Memoire vectorielle + RAG.',
      'jarvis-parallel-phase4.md': 'Phase 4 - Parallelisme multicouche.',
      'jarvis-web-api-phase5.md': 'Phase 5 - Interface Web REST.',
    },
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const slug = (await params).slug
  const path = slug?.join('/') || ''

  switch (path) {
    case 'health':
      return NextResponse.json({ status: 'ok', timestamp: Date.now(), version: '1.0.0', name: 'JARVIS API' })

    case 'status':
      return NextResponse.json({
        timestamp: Date.now(),
        jarvis: { status: 'online', phases: 5 },
        modules: MODULES,
        resources: RESOURCES,
        phases: PHASES,
      })

    case 'briefing':
      return NextResponse.json({
        date: new Date().toISOString().split('T')[0],
        title: 'Briefing JARVIS du ' + new Date().toISOString().split('T')[0],
        projects_actifs: [
          { name: 'JDIDK Mobility', url: 'locationv.vercel.app/fr', status: 'actif' },
          { name: 'LinkFlow SaaS', url: 'imadilyes97-ctrl-lasaas.vercel.app', status: 'actif' },
          { name: 'FloorPlan 3D Render', status: 'actif', bugs: ['rendu sombre'] },
        ],
        phases_terminees: [1, 2, 3, 4, 5],
        phase_courante: 5,
        etat_modules: 'Tous OK',
        capacites: 11,
      })

    case 'projects':
      return NextResponse.json({ count: PROJECTS.length, projects: PROJECTS })

    case 'memory':
      return NextResponse.json(KNOWLEDGE)

    default:
      if (path.startsWith('search')) {
        const url = new URL(request.url)
        const q = url.searchParams.get('q') || ''
        return NextResponse.json({ query: q, count: 0, results: [], note: 'Recherche locale seulement.' })
      }
      return NextResponse.json({ error: 'Not found', path }, { status: 404 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const slug = (await params).slug
  const path = slug?.join('/') || ''

  if (path === 'message') {
    const body = await request.json()
    const msg = (body.message || '').trim()
    if (!msg) return NextResponse.json({ error: 'Message vide' }, { status: 400 })

    const mLower = msg.toLowerCase()
    let intent = 'general'
    if (/projet|cre|gener|saas|mvp|landing|chatbot/.test(mLower)) intent = 'project_generation'
    else if (/bug|erreur|corrig|repar|plante/.test(mLower)) intent = 'bug_fix'
    else if (/deploi|vercel|livr|mettre en ligne/.test(mLower)) intent = 'deploy'
    else if (/test|tdd|teste/.test(mLower)) intent = 'test'

    const responses: Record<string, string> = {
      general: "Message recu ! Je suis JARVIS, ton assistant orchestrateur avec 11 capacites actives.",
      project_generation: "Je peux generer ce projet ! 4 templates dispo (SaaS, MVP, Landing, Chatbot). Donne-moi un nom et je cree tout : fichiers, dependances, git, Vercel.",
      bug_fix: "Correction de bug detectee. Consultation memoire vectorielle + sandbox validation.",
      deploy: "Pre-Flight Check enclenche : sandbox validation, tests, build. GO si tout passe.",
      test: "Workflow TDD : RED (tests) -> GREEN (implémentation) -> IMPROVE (refacto).",
    }

    return NextResponse.json({ received: msg, intent, response: responses[intent] || responses.general, timestamp: Date.now() })
  }

  if (path === 'goal') {
    const body = await request.json()
    if (!body.title || !body.objective) {
      return NextResponse.json({ error: 'Titre et objectif requis' }, { status: 400 })
    }
    return NextResponse.json({
      status: 'created',
      goal: { title: body.title, objective: body.objective, success_criteria: body.success_criteria || [], status: 'doing' },
      note: 'Goal simule',
    })
  }

  return NextResponse.json({ error: 'Not found', path }, { status: 404 })
}
