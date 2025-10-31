// src/features/candidates/CandidateProfile.jsx
import React from 'react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import Notes from './Notes.jsx';

export default function CandidateProfile(){
  const { id } = useParams();
  const [cand, setCand] = useState(null);
  const [timeline, setTimeline] = useState([]);

  useEffect(()=>{ (async ()=>{
    const r1 = await fetch(`/candidates/${id}`); if(!r1.ok) return;
    setCand(await r1.json());
    const r2 = await fetch(`/candidates/${id}/timeline`);
    const tj = await r2.json();
    setTimeline(tj.items || []);
  })(); }, [id]);

  if(!cand) return <div className="section">Loading…</div>;

  return (
    <div className="grid">
      <div className="section">
        <div className="row" style={{ justifyContent:'space-between' }}>
          <h3 style={{ margin:0 }}>{cand.name}</h3>
          <Link className="btn" to="/candidates">Back</Link>
        </div>
        <div style={{ color:'var(--muted)' }}>{cand.email}</div>
        <div className="row" style={{ marginTop:8 }}>
          <span className="badge">Stage: {cand.stage}</span>
          <span className="badge">Job ID: {cand.jobId}</span>
        </div>
      </div>

      <div className="section">
        <h4 style={{ marginTop:0 }}>Timeline</h4>
        {!timeline.length ? <div>No timeline yet</div> :
          timeline.map(t => (
            <div key={t.id} style={{ padding:'6px 0', borderBottom:'1px solid var(--border)' }}>
              <b>{t.from} → {t.to}</b>
              <div style={{ fontSize:12, color:'var(--muted)' }}>{dayjs(t.at).format('DD MMM YYYY HH:mm')}</div>
            </div>
          ))
        }
      </div>

      <Notes candidateId={id} />
    </div>
  );
}