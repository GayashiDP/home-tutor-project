import {useState,useEffect} from 'react';import {Link} from 'react-router-dom';import {useAuth} from '../../hooks/useAuth';import api from '../../services/api';
export default function ProfilePage(){
  const {user}=useAuth(); const [editing,setEditing]=useState(false); const [form,setForm]=useState({name:'',bio:'',subjects:[]});const [ns,setNs]=useState('');const [saving,setSaving]=useState(false);
  useEffect(()=>{api.get('/profile').then(r=>setForm({name:r.data.name||r.data.fullName||'',bio:r.data.bio||'',subjects:r.data.subjects||[]})).catch(()=>setForm({name:user?.name||user?.fullName||'',bio:'Passionate about learning and growing.',subjects:user?.role==='Tutor'?['Algebra','Calculus']:[]}));}, []);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const save=async()=>{setSaving(true);try{await api.patch('/profile',form);}catch{}setSaving(false);setEditing(false);};
  const addSub=()=>{if(ns.trim()&&!form.subjects.includes(ns.trim())){set('subjects',[...form.subjects,ns.trim()]);setNs('');}};
  const remSub=s=>set('subjects',form.subjects.filter(x=>x!==s));
  const isTutor=user?.role==='Tutor'; const isAdmin=user?.role==='Admin'; const dn=form.name||user?.name||user?.fullName||'User';
  const links=isTutor?[{l:'Manage Subjects',to:'/tutor/subjects'},{l:'Set Availability',to:'/tutor/availability'},{l:'View Sessions',to:'/sessions'}]:isAdmin?[{l:'User Management',to:'/admin/users'},{l:'Payment Approvals',to:'/admin/payments'},{l:'Review Moderation',to:'/admin/reviews'}]:[{l:'Browse Tutors',to:'/tutors'},{l:'My Sessions',to:'/sessions'},{l:'Transactions',to:'/transactions'}];
  return(
    <div className="page">
      <div className="card" style={{borderRadius:0,border:'none'}}>
        <div className="profile-hero">
          <div className="profile-avatar-lg">{dn.charAt(0)}</div>
          <div><h1>{dn}</h1><p>{user?.role} · {user?.email}</p>
          {isTutor&&form.subjects.length>0&&<div style={{display:'flex',gap:5,marginTop:'.5rem',flexWrap:'wrap'}}>{form.subjects.map(s=><span key={s} className="subject-pill" style={{background:'rgba(255,255,255,.2)',color:'#fff'}}>{s}</span>)}</div>}
          </div>
        </div>
      </div>
      <div className="container section">
        <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:'1.5rem',alignItems:'flex-start'}}>
          <div className="card"><div className="card-body">
            <div className="section-header"><h2 className="section-title">Profile Information</h2><button className="btn btn-secondary btn-sm" onClick={()=>setEditing(!editing)}>{editing?'Cancel':'Edit Profile'}</button></div>
            {!editing?<div>
              {[{l:'Full Name',v:dn},{l:'Email',v:user?.email},{l:'Role',v:user?.role}].map(i=><div key={i.l} style={{marginBottom:'.9rem'}}><div style={{fontSize:'.75rem',color:'var(--text3)',marginBottom:'.2rem'}}>{i.l}</div><div style={{fontWeight:500,fontSize:'.9rem'}}>{i.v}</div></div>)}
              <div style={{marginBottom:'.9rem'}}><div style={{fontSize:'.75rem',color:'var(--text3)',marginBottom:'.2rem'}}>Bio</div><div style={{color:'var(--text2)',lineHeight:1.6,fontSize:'.9rem'}}>{form.bio||'No bio added yet.'}</div></div>
              {isTutor&&<div><div style={{fontSize:'.75rem',color:'var(--text3)',marginBottom:'.45rem'}}>Subjects</div><div style={{display:'flex',flexWrap:'wrap',gap:5}}>{form.subjects.length?form.subjects.map(s=><span key={s} className="subject-pill">{s}</span>):<span style={{color:'var(--text3)',fontSize:'.85rem'}}>No subjects added.</span>}</div></div>}
            </div>:<div>
              <div className="field"><label>Full Name</label><input value={form.name} onChange={e=>set('name',e.target.value)}/></div>
              <div className="field"><label>Bio</label><textarea rows={3} value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="Tell students about your background…"/></div>
              {isTutor&&<div className="field"><label>Subjects</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:'.5rem'}}>{form.subjects.map(s=><span key={s} className="subject-pill" style={{cursor:'pointer'}} onClick={()=>remSub(s)}>{s} ×</span>)}</div>
                <div style={{display:'flex',gap:8}}><input value={ns} onChange={e=>setNs(e.target.value)} placeholder="Add a subject…" onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addSub())} style={{flex:1,padding:'8px 12px',border:'1.5px solid var(--border)',borderRadius:'var(--radius-sm)',fontSize:'.85rem',fontFamily:'inherit',background:'var(--bg)'}}/><button type="button" className="btn btn-secondary btn-sm" onClick={addSub}>Add</button></div>
              </div>}
              <div style={{display:'flex',gap:8}}><button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving?'Saving…':'Save Changes'}</button><button className="btn btn-secondary btn-sm" onClick={()=>setEditing(false)}>Cancel</button></div>
            </div>}
          </div></div>
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div className="card"><div className="card-body">
              <h3 style={{fontFamily:"'DM Serif Display',serif",marginBottom:'1rem',fontSize:'1rem'}}>Account Details</h3>
              {[{l:'Role',v:user?.role},{l:'Member Since',v:'2026'},{l:'Status',v:'Active'}].map(i=><div key={i.l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid var(--border)',fontSize:'.85rem'}}><span style={{color:'var(--text3)'}}>{i.l}</span><strong>{i.v}</strong></div>)}
            </div></div>
            <div className="card"><div className="card-body">
              <h3 style={{fontFamily:"'DM Serif Display',serif",marginBottom:'1rem',fontSize:'1rem'}}>Quick Links</h3>
              <div className="link-list">{links.map(l=><Link key={l.to} to={l.to} className="btn btn-secondary btn-sm">{l.l} →</Link>)}</div>
            </div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
