// src/features/assessments/Builder.jsx
import React from 'react';
import { useEffect, useState } from 'react';

const emptyQ = () => ({ id:`q-${Date.now()}-${Math.random().toString(36).slice(2)}`, type:'shortText', label:'New question', required:false });

export default function Builder({ jobId, schema, setSchema, onSave }){
  function addSection(){
    setSchema(s => ({ ...s, sections:[...(s.sections||[]), { id:`sec-${Date.now()}`, title:`Section ${((s.sections||[]).length)+1}`, questions:[] }] }));
  }
  function removeSection(secId){
    setSchema(s => ({ ...s, sections:(s.sections||[]).filter(sec => sec.id!==secId) }));
  }
  function updateSectionTitle(secId, title){
    setSchema(s => ({ ...s, sections:(s.sections||[]).map(sec => sec.id===secId? { ...sec, title }:sec) }));
  }
  function addQuestion(secId){
    setSchema(s => ({ ...s, sections:(s.sections||[]).map(sec => sec.id===secId? { ...sec, questions:[...sec.questions, emptyQ()] }:sec) }));
  }
  function updateQuestion(secId, qid, patch){
    setSchema(s => ({ ...s, sections:(s.sections||[]).map(sec => sec.id===secId? { ...sec, questions: sec.questions.map(q => q.id===qid? { ...q, ...patch }:q) }:sec) }));
  }
  function removeQuestion(secId, qid){
    setSchema(s => ({ ...s, sections:(s.sections||[]).map(sec => sec.id===secId? { ...sec, questions: sec.questions.filter(q => q.id!==qid) }:sec) }));
  }

  return (
    <div>
      <h4 style={{ marginTop:0 }}>Assessment Builder · Job {jobId}</h4>
      <button className="btn" onClick={addSection}>Add section</button>
      <div style={{ marginTop:10, display:'grid', gap:10 }}>
        {(schema.sections||[]).map(sec => (
          <div key={sec.id} className="card">
            <div className="row" style={{ justifyContent:'space-between' }}>
              <input className="input" value={sec.title} onChange={e=> updateSectionTitle(sec.id, e.target.value)} />
              <button className="btn" onClick={()=> removeSection(sec.id)}>Remove</button>
            </div>
            <div style={{ marginTop:8, display:'grid', gap:8 }}>
              {(sec.questions||[]).map(q => (
                <div key={q.id} className="card">
                  <div className="row" style={{ justifyContent:'space-between' }}>
                    <input className="input" style={{ flex:1 }} value={q.label} onChange={e=> updateQuestion(sec.id, q.id, { label:e.target.value })} />
                    <select className="select" value={q.type} onChange={e=> updateQuestion(sec.id, q.id, { type:e.target.value })}>
                      <option value="single">single</option>
                      <option value="multi">multi</option>
                      <option value="shortText">shortText</option>
                      <option value="longText">longText</option>
                      <option value="number">number</option>
                      <option value="file">file</option>
                    </select>
                    <label className="row" style={{ gap:6 }}>
                      <input type="checkbox" checked={!!q.required} onChange={e=> updateQuestion(sec.id, q.id, { required:e.target.checked })} />
                      <span className="badge">required</span>
                    </label>
                    <button className="btn" onClick={()=> removeQuestion(sec.id, q.id)}>Delete</button>
                  </div>

                  {(q.type==='single' || q.type==='multi') && (
                    <div className="field">
                      <label>Options (comma separated)</label>
                      <input className="input"
                        value={(q.options||[]).map(o=>o.label).join(', ')}
                        onChange={e=> updateQuestion(sec.id, q.id, { options: e.target.value.split(',').map(s=>s.trim()).filter(Boolean).map(x=>({ label:x, value:x })) })} />
                    </div>
                  )}
                  {(q.type==='shortText' || q.type==='longText') && (
                    <div className="field">
                      <label>maxLength (optional)</label>
                      <input className="input" type="number" value={q.maxLength||''} onChange={e=> updateQuestion(sec.id, q.id, { maxLength: e.target.value ? Number(e.target.value): undefined })} />
                    </div>
                  )}
                  {q.type==='number' && (
                    <div className="row">
                      <label className="row" style={{ gap:6 }}>min <input className="input" type="number" style={{ width:100 }} value={q.min ?? ''} onChange={e=> updateQuestion(sec.id, q.id, { min: e.target.value===''? undefined : Number(e.target.value) })} /></label>
                      <label className="row" style={{ gap:6 }}>max <input className="input" type="number" style={{ width:100 }} value={q.max ?? ''} onChange={e=> updateQuestion(sec.id, q.id, { max: e.target.value===''? undefined : Number(e.target.value) })} /></label>
                    </div>
                  )}
                  <div className="card" style={{ marginTop:6 }}>
                    <b>Conditional (showIf)</b>
                    <div className="row" style={{ marginTop:6 }}>
                      <label className="row" style={{ gap:6 }}>qid <input className="input" style={{ width:160 }} value={q.showIf?.qid||''} onChange={e=> updateQuestion(sec.id, q.id, { showIf: { ...(q.showIf||{}), qid:e.target.value } })} /></label>
                      <label className="row" style={{ gap:6 }}>
                        op
                        <select className="select" value={q.showIf?.op||'=='} onChange={e=> updateQuestion(sec.id, q.id, { showIf: { ...(q.showIf||{}), op:e.target.value } })}>
                          <option>==</option><option>!=</option><option>&gt;</option><option>&gt;=</option><option>&lt;</option><option>&lt;=</option>
                        </select>
                      </label>
                      <label className="row" style={{ gap:6 }}>value <input className="input" style={{ width:160 }} value={q.showIf?.value ?? ''} onChange={e=> updateQuestion(sec.id, q.id, { showIf: { ...(q.showIf||{}), value:e.target.value } })} /></label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="row" style={{ marginTop:6 }}>
              <button className="btn" onClick={()=> addQuestion(sec.id)}>Add question</button>
            </div>
          </div>
        ))}
      </div>

      <div className="row" style={{ justifyContent:'flex-end', marginTop:12 }}>
        <button className="btn primary" onClick={onSave}>Save</button>
      </div>
    </div>
  );
}