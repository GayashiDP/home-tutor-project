import {useState,useEffect} from 'react';import {useForm} from 'react-hook-form';import api from '../../services/api';
const DEMO=[{id:'sub1',name:'Algebra',description:'Equations, functions, and problem-solving.',gradeLevel:'Grade 9-12'},{id:'sub2',name:'Calculus',description:'Derivatives, integrals and applications.',gradeLevel:'Grade 12 / University'},{id:'sub3',name:'Statistics',description:'Probability, data analysis and inference.',gradeLevel:'Grade 10-12'}];
const GRADES=['Grade 1-5','Grade 6-8','Grade 9-11','Grade 12 / A-Level','University','All Levels'];
const asSubjects=data=>Array.isArray(data)?data:Array.isArray(data?.subjects)?data.subjects:[];
const asSubject=data=>data?.subject||data;
export default function SubjectManagerPage(){
  const [subjects,setSubjects]=useState([]); const [loading,setLoading]=useState(true); const [del,setDel]=useState(null);
  const {register,handleSubmit,reset,formState:{isSubmitting}}=useForm();
  useEffect(()=>{api.get('/subjects/my').then(r=>setSubjects(asSubjects(r.data))).catch(()=>setSubjects(DEMO)).finally(()=>setLoading(false));}, []);
  const onAdd=async(data)=>{let ns;try{const r=await api.post('/subjects',data);ns=asSubject(r.data);}catch{ns={id:`sub${Date.now()}`,...data};}setSubjects(s=>[...asSubjects(s),ns]);reset();};
  const onDel=async()=>{try{await api.delete(`/subjects/${del.id}`);}catch{}setSubjects(s=>s.filter(x=>x.id!==del.id));setDel(null);};
  return(
    <div className="page">
      <div className="page-header"><div className="container"><p className="eyebrow">Tutor Tools</p><h1>Manage Subjects</h1><p>Add, edit, or remove the subjects you teach. Students see these on your profile.</p></div></div>
      <div className="container section">
        <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:'1.5rem',alignItems:'flex-start'}}>
          <div>
            <div className="section-header"><h2 className="section-title">Your Subjects ({subjects.length})</h2></div>
            {loading?<div style={{padding:'2rem',textAlign:'center',color:'var(--text3)'}}>Loading…</div>
            :subjects.length===0?<div className="card"><div className="empty-state"><h3>No subjects added</h3><p>Use the form to add your first subject.</p></div></div>
            :<div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
              {subjects.map(s=><div key={s.id} className="subject-item">
                <div><strong style={{display:'block',marginBottom:'.22rem',fontSize:'.92rem'}}>📚 {s.name}</strong><p style={{fontSize:'.8rem',color:'var(--text2)',lineHeight:1.5,marginBottom:'.3rem'}}>{s.description||'No description.'}</p>{s.gradeLevel&&<span className="badge badge-blue">{s.gradeLevel}</span>}</div>
                <button className="btn btn-danger btn-sm" onClick={()=>setDel(s)}>Remove</button>
              </div>)}
            </div>}
          </div>
          <div className="card" style={{position:'sticky',top:80}}><div className="card-body">
            <h3 style={{fontFamily:"'DM Serif Display',serif",marginBottom:'1.1rem',fontSize:'1rem'}}>Add New Subject</h3>
            <form onSubmit={handleSubmit(onAdd)}>
              <div className="field"><label>Subject Name *</label><input {...register('name',{required:true})} placeholder="e.g. Calculus"/></div>
              <div className="field"><label>Description</label><textarea {...register('description')} rows={3} placeholder="What will students learn?"/></div>
              <div className="field"><label>Grade Level</label><select {...register('gradeLevel')}><option value="">Select…</option>{GRADES.map(g=><option key={g} value={g}>{g}</option>)}</select></div>
              <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>{isSubmitting?'Adding…':'Add Subject'}</button>
            </form>
          </div></div>
        </div>
      </div>
      {del&&<div className="modal-backdrop"><div className="modal">
        <div className="modal-header"><p className="eyebrow" style={{color:'var(--danger)'}}>Remove Subject</p><h2 style={{fontSize:'1.1rem'}}>Remove "{del.name}"?</h2><p style={{color:'var(--text2)',fontSize:'.83rem',marginTop:'.3rem'}}>This will remove the subject from your profile.</p></div>
        <div className="modal-footer"><button className="btn btn-secondary btn-sm" onClick={()=>setDel(null)}>Keep Subject</button><button className="btn btn-danger btn-sm" onClick={onDel}>Remove Subject</button></div>
      </div></div>}
    </div>
  );
}
