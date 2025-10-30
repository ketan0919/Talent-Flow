import { useEffect, useState } from 'react';
import { sampleTags } from '../../utils';
import JobEditor from './JobEditor.jsx';
import SortableJobList from './SortableJobList.jsx';

export default function JobsPage(){
  const [query,setQuery]=useState({ search:'', status:'all', tags:[], page:1, pageSize:8 });
  const [data,setData]=useState({ items:[], total:0, page:1, pageSize:8 }); const [loading,setLoading]=useState(false);
  const [modal,setModal]=useState({ open:false, edit:null });

  async function load(){
    setLoading(true);
    const params=new URLSearchParams({ search:query.search, status:query.status, page:String(query.page), pageSize:String(query.pageSize) });
    if(query.tags.length) params.set('tags', query.tags.join(','));
    const res=await fetch(`/jobs?${params.toString()}`); const json=await res.json(); setData(json); setLoading(false);
  }
  useEffect(()=>{ load(); },[query.search,query.status,query.page,query.pageSize,JSON.stringify(query.tags)]);

  function toggleTag(t){ setQuery(q=>({ ...q, tags: q.tags.includes(t)? q.tags.filter(x=>x!==t):[...q.tags,t], page:1 })); }

  async function onReorder(oldIndex,newIndex){
    const prev=data.items.slice(); const next=[...data.items]; const moved=next.splice(oldIndex,1)[0]; next.splice(newIndex,0,moved);
    next.forEach((j,i)=> j.order=i);
    setData(d=>({ ...d, items: next }));
    const res=await fetch(`/jobs/x/reorder`,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ fromOrder:oldIndex, toOrder:newIndex }) });
    if(!res.ok){ setData(d=>({ ...d, items: prev })); alert('Reorder failed; rolled back'); }
  }

  async function archiveToggle(job){
    const next=job.status==='active'?'archived':'active';
    const res=await fetch(`/jobs/${job.id}`,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status:next }) });
    if(!res.ok) return alert('Failed to update'); load();
  }

  return (
    <div className="grid">
      <div className="section">
        <div className="spread">
          <div className="toolbar">
            <input className="input" style={{ width:260 }} placeholder="Search job titles…" onChange={e=>setQuery(q=>({ ...q, search:e.target.value, page:1 }))} />
            <select className="select" value={query.status} onChange={e=>setQuery(q=>({ ...q, status:e.target.value, page:1 }))}>
              <option value="all">All</option><option value="active">Active</option><option value="archived">Archived</option>
            </select>
            <div className="row">
              {sampleTags.map(t=>(
                <label key={t} className="row" style={{ gap:6 }}>
                  <input type="checkbox" checked={query.tags.includes(t)} onChange={()=>toggleTag(t)} />
                  <span className="badge">{t}</span>
                </label>
              ))}
            </div>
          </div>
          <button className="btn primary" onClick={()=>setModal({ open:true, edit:null })}>New Job</button>
        </div>
      </div>

      <div className="section">
        {loading? <div>Loading…</div> : (data.items.length? <>
          <SortableJobList items={data.items} onReorder={onReorder} onEdit={(j)=>setModal({ open:true, edit:j })} onArchive={archiveToggle} />
          <div className="pagination" style={{ marginTop:10 }}>
            <button className="btn" onClick={()=>setQuery(q=>({ ...q, page:Math.max(1,q.page-1) }))} disabled={query.page<=1}>Prev</button>
            <span>Page {data.page} / {Math.max(1, Math.ceil(data.total/data.pageSize))}</span>
            <button className="btn" onClick={()=>setQuery(q=>({ ...q, page:q.page+1 }))} disabled={data.page*data.pageSize>=data.total}>Next</button>
          </div>
        </> : <div>No jobs found</div>)}
      </div>

      <JobEditor open={modal.open} initial={modal.edit} onClose={()=>setModal({ open:false, edit:null })} onSaved={()=>load()} />
    </div>
  );
}