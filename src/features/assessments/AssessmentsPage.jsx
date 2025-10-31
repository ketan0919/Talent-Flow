// src/features/assessments/AssessmentsPage.jsx
import React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import Builder from './Builder.jsx';
import Preview from './Preview.jsx';

export default function AssessmentsPage(){
  const params = useParams();
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const jobId = params.jobId || searchParams.get('jobId') || '';
  const [schema, setSchema] = useState({ jobId, sections: [] });
  const [jobs, setJobs] = useState([]);

  // load jobs for picker (first page is enough)
  useEffect(()=>{ (async()=>{
    const r = await fetch('/jobs?page=1&pageSize=50');
    const j = await r.json();
    setJobs(j.items || []);
  })(); }, []);

  // load schema for chosen job
  useEffect(()=>{ (async()=>{
    if(!jobId) return;
    const r = await fetch(`/assessments/${jobId}`); const j = await r.json();
    if(j?.schema) setSchema(j.schema); else setSchema({ jobId, sections: [] });
  })(); }, [jobId]);

  async function save(){
    const res = await fetch(`/assessments/${schema.jobId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ schema }) });
    if(!res.ok) return alert('Save failed');
    alert('Saved');
  }

  return (
    <div className="grid" style={{ gridTemplateColumns:'1fr 1fr' }}>
      <div className="section">
        <div className="row" style={{ justifyContent:'space-between' }}>
          <h3 style={{ margin:0 }}>Assessments</h3>
          <div className="row">
            <label className="row" style={{ gap:6 }}>
              <span className="badge">Job</span>
              <select className="select" value={jobId} onChange={e=> nav(`/assessments/${e.target.value}`)}>
                <option value="">(pick)</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
            </label>
          </div>
        </div>
        {!jobId ? <div style={{ color:'var(--muted)', marginTop:8 }}>Pick a job to edit its assessment.</div> :
          <Builder jobId={jobId} schema={schema} setSchema={setSchema} onSave={save} />
        }
      </div>
      <div className="section">
        {!jobId ? <div className="helper">Preview appears when a job is selected.</div> : <Preview schema={schema} jobId={jobId} />}
      </div>
    </div>
  );
}