// src/features/assessments/Preview.jsx
import React from 'react';
import { useMemo, useState } from 'react';

function evalRule(values, rule){
  if(!rule) return true;
  const left = values[rule.qid];
  const right = rule.value;
  const num = (x) => Number(x);
  switch(rule.op){
    case '==': return left == right;
    case '!=': return left != right;
    case '>':  return num(left) >  num(right);
    case '>=': return num(left) >= num(right);
    case '<':  return num(left) <  num(right);
    case '<=': return num(left) <= num(right);
    default: return true;
  }
}

export default function Preview({ schema, jobId }){
  const [values, setValues] = useState({});

  function setField(id, v){
    setValues(prev => ({ ...prev, [id]: v }));
  }

  async function submit(){
    // Basic required and type checks
    for(const sec of schema.sections||[]){
      for(const q of sec.questions||[]){
        const visible = evalRule(values, q.showIf);
        if(!visible) continue;
        if(q.required){
          const v = values[q.id];
          if(q.type === 'multi'){
            if(!v || !v.length) return alert(`Please answer: ${q.label}`);
          } else if(v === undefined || v === '' || v === null){
            return alert(`Please answer: ${q.label}`);
          }
        }
        if((q.type==='shortText' || q.type==='longText') && q.maxLength && values[q.id]?.length > q.maxLength){
          return alert(`${q.label}: max ${q.maxLength} characters`);
        }
        if(q.type==='number'){
          const n = Number(values[q.id]);
          if(q.min!=null && n<q.min) return alert(`${q.label}: min ${q.min}`);
          if(q.max!=null && n>q.max) return alert(`${q.label}: max ${q.max}`);
        }
      }
    }
    const res = await fetch(`/assessments/${jobId}/submit`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ candidateId:'demo', answers:values })
    });
    if(!res.ok) return alert('Submit failed');
    alert('Submitted!');
  }

  return (
    <div>
      <h4 style={{ marginTop:0 }}>Live preview</h4>
      {!(schema.sections||[]).length ? <div style={{ color:'var(--muted)' }}>No sections yet</div> : null}
      {(schema.sections||[]).map(sec => (
        <div key={sec.id} className="card" style={{ marginBottom:10 }}>
          <b>{sec.title || 'Untitled section'}</b>
          <div style={{ marginTop:8, display:'grid', gap:8 }}>
            {(sec.questions||[]).map(q => {
              const visible = evalRule(values, q.showIf);
              if(!visible) return null;
              return (
                <div key={q.id} className="field">
                  <label>{q.label}{q.required ? ' *':''}</label>
                  {q.type==='single' && (
                    <div className="row">
                      {(q.options||[]).map(o => (
                        <label key={o.value} className="row" style={{ gap:6 }}>
                          <input type="radio" name={q.id} checked={values[q.id]===o.value} onChange={()=> setField(q.id,o.value)} />
                          {o.label}
                        </label>
                      ))}
                    </div>
                  )}
                  {q.type==='multi' && (
                    <div className="row">
                      {(q.options||[]).map(o => (
                        <label key={o.value} className="row" style={{ gap:6 }}>
                          <input type="checkbox"
                            checked={Array.isArray(values[q.id]) && values[q.id].includes(o.value)}
                            onChange={(e)=> {
                              setField(q.id, (prev=>{
                                const arr=Array.isArray(values[q.id])? [...values[q.id]]: [];
                                if(e.target.checked) { if(!arr.includes(o.value)) arr.push(o.value); }
                                else { const i=arr.indexOf(o.value); if(i>=0) arr.splice(i,1); }
                                return arr;
                              })());
                            }} />
                          {o.label}
                        </label>
                      ))}
                    </div>
                  )}
                  {q.type==='shortText' && (
                    <input className="input" value={values[q.id]||''}
                      maxLength={q.maxLength||undefined}
                      onChange={e=> setField(q.id, e.target.value)} />
                  )}
                  {q.type==='longText' && (
                    <textarea className="input" rows={4} value={values[q.id]||''}
                      maxLength={q.maxLength||undefined}
                      onChange={e=> setField(q.id, e.target.value)} />
                  )}
                  {q.type==='number' && (
                    <input className="input" type="number" value={values[q.id]||''}
                      min={q.min!=null? q.min:undefined} max={q.max!=null? q.max:undefined}
                      onChange={e=> setField(q.id, e.target.value)} />
                  )}
                  {q.type==='file' && (
                    <input className="input" type="file" onChange={e=> setField(q.id, e.target.files?.[0]?.name || '')} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="row" style={{ justifyContent:'flex-end' }}>
        <button className="btn primary" onClick={submit}>Submit (stub)</button>
      </div>
    </div>
  );
}