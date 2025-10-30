import React from 'react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import JobEditor from './JobEditor.jsx';

export default function JobDetails(){
  const { jobId } = useParams();
  const [job,setJob]=useState(null);
  const [edit,setEdit]=useState(false);
  const [err,setErr]=useState('');

  useEffect(()=>{ (async()=>{
    const res=await fetch(`/jobs/${jobId}`); if(!res.ok){ setErr('Job not found'); return; }
    setJob(await res.json());
  })(); },[jobId]);

  if(err) return <div className="section">{err} · <Link className="link" to="/jobs">Back</Link></div>;
  if(!job) return <div className="section">Loading…</div>;

  return (
    <div className="grid">
      <div className="section">
        <div className="row" style={{ justifyContent:'space-between' }}>
          <h3 style={{ margin:0 }}>{job.title}</h3>
          <div className="row">
            <button className="btn" onClick={()=>setEdit(true)}>Edit</button>
            <Link className="btn" to="/jobs">Back</Link>
          </div>
        </div>
        <div style={{ color:'var(--muted)' }}>{job.slug}</div>
        <div className="row" style={{ marginTop:10 }}>
          <span className="badge">Status: {job.status}</span>
          <span className="badge">Order: {job.order}</span>
        </div>
        <div className="tags" style={{ marginTop:8 }}>{(job.tags||[]).map(t=> <span key={t} className="tag">{t}</span>)}</div>
      </div>

      <JobEditor open={edit} initial={job} onClose={()=>setEdit(false)} onSaved={(j)=>setJob(j)} />
    </div>
  );
}