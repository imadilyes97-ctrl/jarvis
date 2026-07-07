import { NextRequest, NextResponse } from 'next/server'

const API_URL = 'https://api.xiaomimimo.com/anthropic/v1/messages'
const API_KEY = process.env.XIAOMI_API_KEY || 'sk-sga81e527xoq5cmo3g571vtj9ia0rx5vobdixu5dybn36yq1'
const MODEL = 'mimo-v2.5'

const PHASES = [
  {id:1,name:'Gen. projets',status:'done',desc:'SaaS/MVP/Landing/Chatbot'},
  {id:2,name:'Memoire RAG',status:'done',desc:'33 fichiers indexes'},
  {id:3,name:'Web+Sandbox',status:'done',desc:'7 detecteurs + sandbox'},
  {id:4,name:'Parallelisme',status:'done',desc:'4 threads x3-4 speedup'},
  {id:5,name:'API Web+PWA',status:'done',desc:'REST + Next.js + PWA'},
]

async function callXiaomi(messages) {
  try {
    const res = await fetch(API_URL, {
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':API_KEY,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({
        model:MODEL, max_tokens:4096,
        messages:[
          {role:'user',content:[{type:'text',text:"Tu es JARVIS, assistant IA d'Ilyes. Tu parles francais, proactif, concis, opinionated. 11 capacites: generateur projets, memoire RAG, web search, sandbox, parallelisme 4 threads, API REST. Projets: JDIDK Mobility, LinkFlow SaaS, FloorPlan 3D."}]},
          ...messages.map(m=>({role:m.role==='assistant'?'assistant':'user',content:[{type:'text',text:m.content}]})),
        ],
      }),
      signal:AbortSignal.timeout(60000),
    })
    if(!res.ok) return 'Erreur '+res.status
    const data=await res.json()
    let t=''
    for(const c of data.content||[]) if(c.type==='text') t+=c.text
    return t||'(vide)'
  } catch(e) {return 'Erreur: '+(e.message||'timeout')}
}

export async function GET(req,{params}) {
  const p=(await params).slug?.join('')||''
  if(p==='health') return NextResponse.json({status:'ok',version:'1.0.0'})
  if(p==='status') return NextResponse.json({modules:{knowledge_base:{status:'ok'},vector_memory:{status:'ok'},project_generator:{status:'ok'},web_search:{status:'ok'},sandbox:{status:'ok'},parallel:{status:'ok'},orchestra:{status:'ok'}},phases:PHASES})
  if(p==='briefing') return NextResponse.json({date:new Date().toISOString().split('T')[0],projets:[{name:'JDIDK Mobility'},{name:'LinkFlow SaaS'},{name:'FloorPlan 3D'}],phases:5})
  if(p==='projects') return NextResponse.json({count:8,projects:[{name:'CLAUDE.md'},{name:'jarvis.md'},{name:'me.md'},{name:'projects.md'},{name:'errors.md'},{name:'decisions.md'},{name:'patterns.md'},{name:'clients.md'}]})
  if(p==='memory') return NextResponse.json({knowledge:{count:9},memory:{count:25}})
  return NextResponse.json({error:'Not found'},{status:404})
}

export async function POST(req,{params}) {
  const p=(await params).slug?.join('')||''
  if(p==='message') {
    const b=await req.json()
    const msg=(b.message||'').trim()
    if(!msg) return NextResponse.json({error:'Vide'},{status:400})
    const msgs=(b.history||[]).map(h=>({role:h.role==='jarvis'?'assistant':'user',content:h.text}))
    msgs.push({role:'user',content:msg})
    return NextResponse.json({received:msg,response:await callXiaomi(msgs),timestamp:Date.now(),model:MODEL})
  }
  return NextResponse.json({error:'Not found'},{status:404})
}
