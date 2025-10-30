import React from 'react';
import { useEffect, useState } from 'react';
import { sampleTags, slugify } from '../../utils';

export default function JobEditor({ open, onClose, initial, onSaved }){
  const [title,setTitle]=useState(''); const [slug,setSlug]=useState(''); const [tags,setTags]=useState([]); const [saving,setSaving]=useState(false);
  useEffect(()=>{ if(open){ setTitle(initial?.title||''); setSlug(initial?.slug||''); setTags(initial?.tags||[]);} },[open,initial]);
  if(!open) return null;

  async function submit(){
    if(!title.trim()) return alert('Title is required');
    const payload={ title:title.trim(), slug: slug? slugify(slug):undefined, tags };
    setSaving(true);
    const method=initial?'PATCH':'POST'; const url=initial? `/jobs/${initial.id}`:'/jobs';
    const res=await fetch(url,{ method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    setSaving(false);
    if(!res.ok){ const j=await res.json().catch(()=>({})); return alert(j.message||'Failed'); }
    onSaved && onSaved(await res.json()); onClose();
  }
  function toggleTag(t){ setTags(prev=> prev.includes(t)? prev.filter(x=>x!==t):[...prev,t]); }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <h3>{initial?'Edit Job':'New Job'}</h3>
        <div className="field"><label>Title</label><input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., Senior Frontend Engineer" /></div>
        <div className="field"><label>Slug</label><input className="input" value={slug} onChange={e=>setSlug(e.target.value)} placeholder="auto from title if empty" /></div>
        <div className="field"><label>Tags</label>
          <div className="tags">{sampleTags.map(t=>(
            <button key={t} type="button" className="btn" style={{ borderColor:tags.includes(t)?'var(--primary)':'var(--border)', color:tags.includes(t)?'var(--primary)':'inherit' }} onClick={()=>toggleTag(t)}>{t}</button>
          ))}</div>
        </div>
        <div className="row" style={{ justifyContent:'flex-end' }}>
          <button className="btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn primary" onClick={submit} disabled={saving}>{saving?'Saving…':'Save'}</button>
        </div>
      </div>
    </div>
  );
}