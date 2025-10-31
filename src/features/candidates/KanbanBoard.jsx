// src/features/candidates/KanbanBoard.jsx
import React from 'react';
import { useEffect, useState } from 'react';
import { stages } from '../../utils';

export default function KanbanBoard(){
  const [cols, setCols] = useState({}); // { stage: [] }
  const [loading, setLoading] = useState(false);

  async function load(){
    setLoading(true);
    const all = {};
    for(const s of stages){
      const r = await fetch(`/candidates?stage=${s}`);
      const j = await r.json();
      all[s] = j.items || [];
    }
    setCols(all);
    setLoading(false);
  }
  useEffect(()=>{ load(); }, []);

  async function move(cand, toStage){
    const fromStage = cand.stage;
    // optimistic
    setCols(prev => ({
      ...prev,
      [fromStage]: prev[fromStage].filter(x => x.id !== cand.id),
      [toStage]: [{ ...cand, stage: toStage }, ...prev[toStage]]
    }));
    const res = await fetch(`/candidates/${cand.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ stage: toStage }) });
    if(!res.ok){
      alert('Move failed; rolling back');
      await load(); // rollback by reloading from source
    }
  }

  function Card({ c }){
    return (
      <div draggable onDragStart={e=> e.dataTransfer.setData('text/plain', JSON.stringify(c))}
        className="card" style={{ marginBottom:8, cursor:'grab' }}>
        <b>{c.name}</b>
        <div style={{ fontSize:12, color:'var(--muted)' }}>{c.email}</div>
      </div>
    );
  }

  return (
    <div className="grid">
      <div className="section">
        <h3 style={{ margin:0 }}>Kanban</h3>
      </div>
      <div className="section" style={{ overflowX:'auto' }}>
        {loading ? 'Loading…' :
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${stages.length}, 1fr)`, gap:12 }}>
            {stages.map(s => (
              <div key={s} style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:10, padding:8, minHeight:520 }}>
                <div className="row" style={{ justifyContent:'space-between' }}>
                  <b style={{ textTransform:'capitalize' }}>{s}</b>
                  <span className="badge">{(cols[s]||[]).length}</span>
                </div>
                <div
                  onDragOver={e=> e.preventDefault()}
                  onDrop={e=> {
                    const c = JSON.parse(e.dataTransfer.getData('text/plain'));
                    if(c.stage !== s) move(c, s);
                  }}
                  style={{ marginTop:8, minHeight:480 }}
                >
                  {(cols[s]||[]).map(c => <Card key={c.id} c={c} />)}
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}