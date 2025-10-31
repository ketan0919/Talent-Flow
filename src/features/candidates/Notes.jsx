// src/features/candidates/Notes.jsx
import React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

const people = ['Alex', 'Priya', 'Jordan', 'Sam', 'Lee', 'Taylor', 'Morgan', 'Jamie', 'Chris'];

export default function Notes({ candidateId }){
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState('');
  const boxRef = useRef(null);

  async function load(){
    const r = await fetch(`/candidates/${candidateId}/notes`);
    const j = await r.json();
    setItems(j.items || []);
  }
  useEffect(()=>{ load(); }, [candidateId]);

  function extractMentions(s){
    return Array.from(new Set((s.match(/@([\w-]+)/g)||[]).map(x=>x.slice(1))));
  }

  const suggestions = useMemo(()=>{
    const q = query.toLowerCase();
    return q ? people.filter(p => p.toLowerCase().startsWith(q)) : [];
  }, [query]);

  function onChange(e){
    const v = e.target.value;
    setText(v);
    const m = v.match(/@([\w-]*)$/);
    if(m){ setShow(true); setQuery(m[1]||''); } else { setShow(false); setQuery(''); }
  }

  function insertSuggestion(name){
    setText(t => t.replace(/@([\w-]*)$/, '@'+name+' '));
    setShow(false); setQuery('');
    boxRef.current?.focus();
  }

  async function addNote(){
    if(!text.trim()) return;
    const payload={ text, mentions: extractMentions(text) };
    const res = await fetch(`/candidates/${candidateId}/notes`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if(!res.ok) return alert('Failed to add note');
    setText(''); setShow(false); setQuery(''); load();
  }

  return (
    <div className="section">
      <h4 style={{ marginTop:0 }}>Notes</h4>
      <div className="field">
        <textarea ref={boxRef} className="input" rows={4} placeholder="Add a note… use @ to mention"
          value={text} onChange={onChange} />
        {show && suggestions.length ? (
          <div className="card" style={{ marginTop:6, padding:6, display:'inline-block' }}>
            {suggestions.map(s => (
              <button key={s} className="btn" style={{ marginRight:6 }} onClick={()=> insertSuggestion(s)}>@{s}</button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="row" style={{ justifyContent:'flex-end' }}>
        <button className="btn primary" onClick={addNote}>Add note</button>
      </div>
      <div style={{ marginTop:12 }}>
        {!items.length ? <div style={{ color:'var(--muted)' }}>No notes yet</div> :
          items.map(n => (
            <div key={n.id} className="card" style={{ marginBottom:8 }}>
              <div style={{ whiteSpace:'pre-wrap' }}>{n.text}</div>
              <div style={{ marginTop:6, display:'flex', gap:6, flexWrap:'wrap' }}>
                {(n.mentions||[]).map(m => <span key={m} className="badge">@{m}</span>)}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}