// src/mocks/handlers.js
import { http, HttpResponse } from 'msw';
import { db } from '../db';
import { ensureSeed } from '../seed';
import { sleep, randomBetween, shouldFailWrite } from '../utils';

const accounts = [
  { id:'u-admin', name:'Admin User', email:'admin@talentflow.dev', role:'admin', password:'Admin#2025' },
  { id:'u-hr',   name:'Hiring Manager', email:'hr@talentflow.dev', role:'hr',   password:'Hr#2025' }
];

async function withLatency(fn, isWrite=false){
  await ensureSeed();
  await sleep(randomBetween(200,1200));
  if(isWrite && shouldFailWrite()) return HttpResponse.json({ message:'Random write failure' }, { status:500 });
  return fn();
}
function paginate(arr, page=1, pageSize=8){
  const start=(page-1)*pageSize, end=start+pageSize;
  return { items:arr.slice(start,end), total:arr.length, page, pageSize };
}

export const handlers = [
  // Auth
  http.post('/auth/login', async ({ request }) => withLatency(async ()=>{
    const { email, password } = await request.json();
    const acct = accounts.find(a => a.email.toLowerCase() === String(email||'').toLowerCase());
    if(!acct || acct.password !== password) return HttpResponse.json({ message:'Invalid email or password' }, { status:401 });
    const token = `tok-${crypto.randomUUID()}`;
    return HttpResponse.json({ token, user:{ id:acct.id, name:acct.name, email:acct.email, role:acct.role } });
  })),

  // Jobs
  http.get('/jobs', ({ request }) => withLatency(async ()=>{
    const url=new URL(request.url);
    const search=url.searchParams.get('search')?.toLowerCase()||'';
    const status=url.searchParams.get('status')||'all';
    const tags=(url.searchParams.get('tags')||'').split(',').filter(Boolean);
    const page=Number(url.searchParams.get('page')||1);
    const pageSize=Number(url.searchParams.get('pageSize')||8);
    let jobs=await db.jobs.orderBy('order').toArray();
    if(status!=='all') jobs=jobs.filter(j=>j.status===status);
    if(search) jobs=jobs.filter(j=>j.title.toLowerCase().includes(search));
    if(tags.length) jobs=jobs.filter(j=>tags.every(t=>(j.tags||[]).includes(t)));
    return HttpResponse.json(paginate(jobs,page,pageSize));
  })),
  http.get('/jobs/:id', ({ params }) => withLatency(async ()=>{
    const job=await db.jobs.get(params.id);
    return job ? HttpResponse.json(job) : HttpResponse.json({ message:'Not found' }, { status:404 });
  })),
  http.post('/jobs', ({ request }) => withLatency(async ()=>{
    const body=await request.json();
    if(!body.title) return HttpResponse.json({ message:'Title required' }, { status:400 });
    const slug=(body.slug||body.title).toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,60);
    const exists=await db.jobs.where('slug').equals(slug).first();
    if(exists) return HttpResponse.json({ message:'Slug must be unique' }, { status:409 });
    const order=await db.jobs.count();
    const job={ id:crypto.randomUUID(), title:body.title, slug, tags:body.tags||[], status:'active', order };
    await db.jobs.put(job);
    return HttpResponse.json(job, { status:201 });
  }, true)),
  http.patch('/jobs/:id', ({ params, request }) => withLatency(async ()=>{
    const patch=await request.json();
    const job=await db.jobs.get(params.id);
    if(!job) return HttpResponse.json({ message:'Not found' }, { status:404 });
    if(patch.slug){
      const exists=await db.jobs.where('slug').equals(patch.slug).first();
      if(exists && exists.id!==job.id) return HttpResponse.json({ message:'Slug must be unique' }, { status:409 });
    }
    const updated={ ...job, ...patch };
    await db.jobs.put(updated);
    return HttpResponse.json(updated);
  }, true)),
  http.patch('/jobs/:id/reorder', ({ request }) => withLatency(async ()=>{
    const { fromOrder, toOrder } = await request.json();
    const all=await db.jobs.orderBy('order').toArray();
    const [item]=all.splice(fromOrder,1);
    all.splice(toOrder,0,item);
    await db.transaction('rw', db.jobs, async ()=> all.forEach((j,i)=> db.jobs.update(j.id,{ order:i })));
    return HttpResponse.json({ ok:true });
  }, true)),

  // Candidates
  http.get('/candidates', ({ request }) => withLatency(async ()=>{
    const url=new URL(request.url); const stage=url.searchParams.get('stage')||'all';
    let list=await db.candidates.toArray(); if(stage!=='all') list=list.filter(c=>c.stage===stage);
    list.sort((a,b)=>a.name.localeCompare(b.name));
    return HttpResponse.json({ items:list, total:list.length });
  })),
  http.get('/candidates/:id', ({ params }) => withLatency(async ()=>{
    const c=await db.candidates.get(params.id);
    return c ? HttpResponse.json(c) : HttpResponse.json({ message:'Not found' }, { status:404 });
  })),
  http.patch('/candidates/:id', ({ params, request }) => withLatency(async ()=>{
    const patch=await request.json();
    const cand=await db.candidates.get(params.id);
    if(!cand) return HttpResponse.json({ message:'Not found' }, { status:404 });
    await db.candidates.update(cand.id, patch);
    if (patch.stage && patch.stage !== cand.stage) {
      await db.timeline.add({ id:crypto.randomUUID(), candidateId:cand.id, from:cand.stage, to:patch.stage, at:Date.now() });
    }
    return HttpResponse.json({ ...cand, ...patch });
  }, true)),
  http.get('/candidates/:id/timeline', ({ params }) => withLatency(async ()=>{
    const items=await db.timeline.where('candidateId').equals(params.id).toArray();
    items.sort((a,b)=>a.at-b.at); return HttpResponse.json({ items });
  })),
  http.get('/candidates/:id/notes', ({ params }) => withLatency(async ()=>{
    const items=await db.notes.where('candidateId').equals(params.id).toArray();
    items.sort((a,b)=>b.at-a.at);
    return HttpResponse.json({ items });
  })),
  http.post('/candidates/:id/notes', ({ params, request }) => withLatency(async ()=>{
    const body=await request.json();
    const rec={ id:crypto.randomUUID(), candidateId:params.id, text:body.text, mentions:body.mentions||[], at:Date.now() };
    await db.notes.put(rec);
    return HttpResponse.json(rec, { status:201 });
  }, true)),

  // Assessments
  http.get('/assessments/:jobId', ({ params }) => withLatency(async ()=>{
    const rec=await db.assessments.where('jobId').equals(params.jobId).first();
    return HttpResponse.json(rec || { schema:{ jobId:params.jobId, sections:[] } });
  })),
  http.put('/assessments/:jobId', ({ params, request }) => withLatency(async ()=>{
    const body=await request.json();
    await db.assessments.put({ id:`ass-${params.jobId}`, jobId:params.jobId, schema: body.schema });
    return HttpResponse.json({ ok:true });
  }, true)),
  http.post('/assessments/:jobId/submit', ({ params, request }) => withLatency(async ()=>{
    const body=await request.json();
    await db.responses.put({ id:crypto.randomUUID(), jobId:params.jobId, candidateId:body.candidateId||'anon', answers:body.answers, createdAt:new Date().toISOString() });
    return HttpResponse.json({ ok:true }, { status:201 });
  }, true)),
];