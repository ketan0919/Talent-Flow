// src/features/candidates/CandidatesPage.jsx
import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { stages } from '../../utils';
import { useNavigate } from 'react-router-dom';

export default function CandidatesPage(){
  const nav = useNavigate();
  const [stage, setStage] = useState('all');
  const [all, setAll] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  async function load(){
    setLoading(true);
    const res = await fetch(`/candidates?stage=${stage}`);
    const j = await res.json();
    setAll(j.items || []);
    setLoading(false);
  }
  useEffect(()=>{ load(); }, [stage]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if(!q) return all;
    return all.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [all, search]);

  return (
    <div className="grid">
      <div className="section">
        <div className="spread">
          <div className="toolbar">
            <input className="input" style={{ width:300 }} placeholder="Search name or email" value={search} onChange={e=>setSearch(e.target.value)} />
            <div className="row">
              <label className="row" style={{ gap:6 }}>
                <span className="badge">Stage</span>
                <select className="select" value={stage} onChange={e=> setStage(e.target.value)}>
                  <option value="all">all</option>
                  {stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>
          </div>
          <button className="btn primary" onClick={()=> nav('/candidates/board')}>Open Kanban</button>
        </div>
      </div>

      <div className="section" style={{ height:560 }}>
        {loading ? 'Loading…' : (
          <List height={520} itemCount={filtered.length} itemSize={72} width="100%">
            {({ index, style }) => {
              const c = filtered[index];
              return (
                <div style={{ ...style, display:'flex', alignItems:'center', padding:'0 12px', borderBottom:'1px solid var(--border)', cursor:'pointer' }}
                  onClick={()=> nav(`/candidates/${c.id}`)}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600 }}>{c.name}</div>
                    <div style={{ color:'var(--muted)', fontSize:12 }}>{c.email}</div>
                  </div>
                  <span className="badge">{c.stage}</span>
                </div>
              );
            }}
          </List>
        )}
      </div>
    </div>
  );
}