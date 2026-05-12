import {useState,useEffect} from 'react';import StatusBadge from '../../components/common/StatusBadge';import api from '../../services/api';
const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const HOURS=Array.from({length:12},(_,i)=>i+8);
const pad=h=>`${String(h).padStart(2,'0')}:00`;
const DEMO=[{id:'sl1',dayOfWeek:'Monday',startTime:'08:00',endTime:'09:00',status:'available'},{id:'sl2',dayOfWeek:'Monday',startTime:'09:00',endTime:'10:00',status:'booked'},{id:'sl3',dayOfWeek:'Wednesday',startTime:'10:00',endTime:'11:00',status:'available'},{id:'sl4',dayOfWeek:'Wednesday',startTime:'14:00',endTime:'15:00',status:'available'},{id:'sl5',dayOfWeek:'Friday',startTime:'09:00',endTime:'10:00',status:'available'},{id:'sl6',dayOfWeek:'Friday',startTime:'11:00',endTime:'12:00',status:'booked'},{id:'sl7',dayOfWeek:'Tuesday',startTime:'13:00',endTime:'14:00',status:'available'}];
export default function AvailabilityManagerPage(){
  const [saved,setSaved]=useState([]); const [selected,setSelected]=useState(new Set()); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false);
  useEffect(()=>{api.get('/availability/my').then(r=>{const sl=r.data||DEMO;setSaved(sl);setSelected(new Set(sl.filter(s=>s.status!=='cancelled').map(s=>`${s.dayOfWeek}-${s.startTime}`)));}).catch(()=>{setSaved(DEMO);setSelected(new Set(DEMO.filter(s=>s.status!=='cancelled').map(s=>`${s.dayOfWeek}-${s.startTime}`)));}).finally(()=>setLoading(false));}, []);
  const booked=new Set(saved.filter(s=>s.status==='booked').map(s=>`${s.dayOfWeek}-${s.startTime}`));
  const toggle=(d,h)=>{const k=`${d}-${pad(h)}`;if(booked.has(k))return;setSelected(p=>{const n=new Set(p);n.has(k)?n.delete(k):n.add(k);return n;});};
  const save=async()=>{setSaving(true);const slots=[...selected].map(k=>{const[day,time]=k.split('-');const h=parseInt(time);return{dayOfWeek:day,startTime:pad(h),endTime:pad(h+1)};});try{await api.put('/availability',{slots});}catch{}setSaving(false);};
  return(
    <div className="page">
      <div className="page-header"><div className="container"><p className="eyebrow">Tutor Tools</p><h1>Manage Availability</h1><p>Click time slots to toggle them. Blue slots are already booked by students.</p></div></div>
      <div className="container section">
        <div className="stats-row">{[{v:selected.size,l:'Total Slots'},{v:[...selected].filter(k=>!booked.has(k)).length,l:'Available'},{v:booked.size,l:'Booked'}].map(s=><div key={s.l} className="stat-card"><div className="stat-value" style={{fontSize:'1.5rem'}}>{s.v}</div><div className="stat-label">{s.l}</div></div>)}</div>
        <div className="card"><div className="card-body">
          <div className="section-header">
            <div><h2 className="section-title">Weekly Schedule</h2><p style={{fontSize:'.8rem',color:'var(--text2)',marginTop:'.2rem'}}>🟢 Available · 🔵 Booked · ⬜ Off — Click to toggle</p></div>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving?'Saving…':'Save Changes'}</button>
          </div>
          {loading?<div style={{textAlign:'center',padding:'2rem',color:'var(--text3)'}}>Loading…</div>:(
            <div className="avail-grid">
              <div style={{height:28}}/>
              {DAYS.map(d=><div key={d} style={{textAlign:'center',fontSize:'.68rem',fontWeight:700,color:'var(--text2)',padding:'5px 0',background:'var(--bg2)',borderRadius:5}}>{d.slice(0,3)}</div>)}
              {HOURS.map(h=><><div key={`t${h}`} className="cal-time-label" style={{height:38}}>{pad(h)}</div>{DAYS.map(d=>{const k=`${d}-${pad(h)}`;const isBkd=booked.has(k);const isOn=selected.has(k);return<button key={k} className={`avail-slot ${isBkd?'booked-slot':isOn?'on':'off'}`} onClick={()=>toggle(d,h)}>{isBkd?'●':isOn?'✓':''}</button>;})}</>)}
            </div>
          )}
        </div></div>
        <div className="card" style={{marginTop:'1.25rem'}}><div className="card-body">
          <h3 style={{fontFamily:"'DM Serif Display',serif",marginBottom:'1rem',fontSize:'1rem'}}>Saved Slots ({saved.length})</h3>
          {saved.length===0?<div className="empty-state" style={{padding:'1.5rem'}}><p>No availability saved yet.</p></div>
          :<div className="table-wrap"><table><thead><tr><th>Day</th><th>Start</th><th>End</th><th>Status</th></tr></thead><tbody>{saved.map(s=><tr key={s.id}><td>{s.dayOfWeek}</td><td>{s.startTime}</td><td>{s.endTime}</td><td><StatusBadge status={s.status==='available'?'Available':'Booked'}/></td></tr>)}</tbody></table></div>}
        </div></div>
      </div>
    </div>
  );
}
