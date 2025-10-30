import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';

function Row({ job, listeners, attributes, onEdit, onArchive }){
  return (
    <div className="card" {...attributes} {...listeners} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:10 }}>
      <div>
        <Link className="link" to={`/jobs/${job.id}`} style={{ fontWeight:600 }}>{job.title}</Link>
        <div style={{ fontSize:12, color:'var(--muted)' }}>{job.slug}</div>
        <div className="tags" style={{ marginTop:6 }}>{(job.tags||[]).map(t=> <span key={t} className="tag">{t}</span>)}</div>
      </div>
      <div className="row">
        <button className="btn" onClick={()=>onEdit(job)}>Edit</button>
        <button className="btn" style={{ borderColor: job.status==='active'?'#ef4444':'#16a34a', color: job.status==='active'?'#ef4444':'#16a34a' }} onClick={()=>onArchive(job)}>
          {job.status==='active'?'Archive':'Unarchive'}
        </button>
      </div>
    </div>
  );
}
function SortableItem({ job, onEdit, onArchive }){
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: job.order });
  const style={ transform: CSS.Transform.toString(transform), transition };
  return <div ref={setNodeRef} style={style}><Row job={job} listeners={listeners} attributes={attributes} onEdit={onEdit} onArchive={onArchive} /></div>;
}
export default function SortableJobList({ items, onReorder, onEdit, onArchive }){
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={({active,over})=>{
      if(!over || active.id===over.id) return;
      const oldIndex=items.findIndex(i=>i.order===active.id);
      const newIndex=items.findIndex(i=>i.order===over.id);
      onReorder(oldIndex,newIndex);
    }}>
      <SortableContext items={items.map(i=>i.order)} strategy={verticalListSortingStrategy}>
        <div className="list">{items.map(j => <SortableItem key={j.id} job={j} onEdit={onEdit} onArchive={onArchive} />)}</div>
      </SortableContext>
    </DndContext>
  );
}