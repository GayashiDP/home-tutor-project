import {useState,useEffect,useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';
import StatusBadge from '../../components/common/StatusBadge';
import Stars from '../../components/common/Stars';
import api from '../../services/api';
const fmtCurr=n=>new Intl.NumberFormat('en',{style:'currency',currency:'USD'}).format(Number(n)||0);
const fmtDT=s=>{const d=new Intl.DateTimeFormat('en',{weekday:'short',month:'short',day:'numeric'}).format(new Date(`${s.sessionDate}T00:00:00`));return`${d} · ${s.startTime}–${s.endTime}`;};
const isPast=s=>['Completed','Cancelled'].includes(s.status)||new Date(`${s.sessionDate}T${s.endTime||'23:59'}`)< new Date();
const DEMO=[
  {id:'b1',subject:'Algebra',sessionDate:'2026-05-10',startTime:'10:00',endTime:'11:00',status:'Confirmed',tutorName:'Sarah Johnson',studentName:'Jordan Kim',note:'Focus on quadratic equations.',amountDue:45},
  {id:'b2',subject:'Physics',sessionDate:'2026-05-12',startTime:'14:00',endTime:'15:00',status:'Pending',tutorName:'Emma Wilson',studentName:'Jordan Kim',note:'',amountDue:50},
  {id:'b3',subject:'Python',sessionDate:'2026-04-20',startTime:'09:00',endTime:'10:00',status:'Completed',tutorName:'David Kumar',studentName:'Jordan Kim',note:'Covered list comprehensions.',reviewed:true,amountDue:55,paymentStatus:'Completed'},
  {id:'b4',subject:'English',sessionDate:'2026-04-15',startTime:'11:00',endTime:'12:00',status:'Cancelled',tutorName:'Mike Chen',studentName:'Jordan Kim',note:'',amountDue:40},
  {id:'b5',subject:'Calculus',sessionDate:'2026-04-25',startTime:'15:00',endTime:'16:00',status:'Completed',tutorName:'Sarah Johnson',studentName:'Jordan Kim',note:'Integration techniques.',reviewed:false,amountDue:45,paymentStatus:'Completed'},
];
const normalizeSessions=data=>Array.isArray(data)?data:Array.isArray(data?.sessions)?data.sessions:DEMO;
export default function MySessionsPage(){
  const {user}=useAuth(); const navigate=useNavigate();
  const [sessions,setSessions]=useState([]); const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState('Upcoming'); const [sel,setSel]=useState(null);
  const [toCancel,setToCancel]=useState(null); const [toReview,setToReview]=useState(null);
  const [slipTarget,setSlipTarget]=useState(null); const [slipFile,setSlipFile]=useState(null);
  const [priceTarget,setPriceTarget]=useState(null); const [priceValue,setPriceValue]=useState('');
  const [notice,setNotice]=useState('');
  const [rating,setRating]=useState(0); const [comment,setComment]=useState('');
  useEffect(()=>{api.get('/bookings/my').then(r=>setSessions(normalizeSessions(r.data))).catch(()=>setSessions(DEMO)).finally(()=>setLoading(false));}, []);
  const grouped=useMemo(()=>{const up=[],past=[];sessions.forEach(s=>isPast(s)?past.push(s):up.push(s));return{Upcoming:up.sort((a,b)=>new Date(a.sessionDate)-new Date(b.sessionDate)),Past:past.sort((a,b)=>new Date(b.sessionDate)-new Date(a.sessionDate))};}, [sessions]);
  const vis=grouped[tab]||[];
  const pl=user?.role==='Tutor'?'Student':'Tutor';
  const updateSession=(id,patch)=>setSessions(s=>s.map(x=>x.id===id?{...x,...patch}:x));
  const doCancel=async()=>{try{await api.patch(`/bookings/${toCancel.id}/cancel`);}catch{}setSessions(s=>s.map(x=>x.id===toCancel.id?{...x,status:'Cancelled'}:x));setToCancel(null);};
  const doReview=async()=>{if(rating<1)return;try{await api.post('/reviews',{bookingId:toReview.id,rating,comment});}catch{}setSessions(s=>s.map(x=>x.id===toReview.id?{...x,reviewed:true}:x));setToReview(null);setRating(0);setComment('');};
  const openPrice=s=>{setPriceTarget(s);setPriceValue(String(s.sessionPrice||s.amountDue||''));setSel(null);};
  const savePrice=async()=>{if(!priceTarget||Number(priceValue)<=0)return;try{const r=await api.patch(`/bookings/${priceTarget.id}/price`,{price:Number(priceValue)});updateSession(priceTarget.id,r.data?.session||{amountDue:Number(priceValue),sessionPrice:Number(priceValue)});setNotice('Session price updated.');}catch{updateSession(priceTarget.id,{amountDue:Number(priceValue),sessionPrice:Number(priceValue)});setNotice('Demo mode: session price updated.');}setPriceTarget(null);setPriceValue('');};
  const openSlip=s=>{setSlipTarget(s);setSlipFile(null);setSel(null);};
  const uploadSlip=async()=>{if(!slipTarget||!slipFile)return;const fd=new FormData();fd.append('slip',slipFile);try{const r=await api.post(`/payments/slips/${slipTarget.id}`,fd,{headers:{'Content-Type':'multipart/form-data'}});updateSession(slipTarget.id,r.data?.session||{paymentStatus:'PendingApproval',slipFileName:slipFile.name});setNotice('Payment slip uploaded for admin approval.');}catch(e){if(e.response){setNotice(e.response.data?.error||'Could not upload payment slip.');}else{updateSession(slipTarget.id,{paymentStatus:'PendingApproval',slipFileName:slipFile.name});setNotice('Demo mode: payment slip uploaded for admin approval.');}}setSlipTarget(null);setSlipFile(null);};
  return(
    <div className="page">
      <div className="page-header"><div className="container"><p className="eyebrow">Your Learning Journey</p><h1>My Sessions</h1><p>Track all your upcoming and past tutoring sessions in one place.</p></div></div>
      <div className="container section">
        {notice&&<div className="alert alert-info">{notice}</div>}
        <div className="stats-row">
          {[{v:grouped.Upcoming?.length||0,l:'Upcoming'},{v:sessions.filter(s=>s.status==='Confirmed').length,l:'Confirmed'},{v:sessions.filter(s=>s.status==='Completed').length,l:'Completed'},{v:sessions.filter(s=>s.status==='Cancelled').length,l:'Cancelled'}].map(s=>(
            <div key={s.l} className="stat-card"><div className="stat-value" style={{fontSize:'1.5rem'}}>{s.v}</div><div className="stat-label">{s.l}</div></div>
          ))}
        </div>
        <div className="tabs" style={{maxWidth:280,marginBottom:'1.1rem'}}>
          {['Upcoming','Past'].map(t=><button key={t} className={`tab${tab===t?' active':''}`} onClick={()=>setTab(t)}>{t}</button>)}
        </div>
        {loading?<div style={{textAlign:'center',padding:'3rem',color:'var(--text3)'}}>Loading sessions…</div>
        :vis.length===0?<div className="card"><div className="empty-state"><h3>No {tab.toLowerCase()} sessions</h3><p>{tab==='Upcoming'?(user?.role==='Student'?'Book a tutor to schedule your first session.':'Upcoming sessions will appear here.'):'Completed sessions will appear here.'}</p>{tab==='Upcoming'&&user?.role==='Student'&&<button className="btn btn-primary" style={{marginTop:'1rem'}} onClick={()=>navigate('/tutors')}>Browse Tutors</button>}</div></div>
        :<div className="card">{vis.map(s=><div key={s.id} className="session-row" onClick={()=>setSel(s)}><div className="avatar">{s.subject.charAt(0)}</div><div className="session-info"><strong>{s.subject}</strong><span>{fmtDT(s)} · {pl}: {user?.role==='Tutor'?s.studentName:s.tutorName}</span></div><StatusBadge status={s.status}/><span style={{color:'var(--brand-mid)',fontSize:'.78rem',marginLeft:6}}>View →</span></div>)}</div>}
      </div>
      {sel&&<div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setSel(null)}><div className="modal">
        <div className="modal-header"><p className="eyebrow" style={{color:'var(--brand)'}}>Session Detail</p><div style={{display:'flex',alignItems:'center',gap:9}}><h2 style={{fontSize:'1.15rem'}}>{sel.subject}</h2><StatusBadge status={sel.status}/></div></div>
        <div className="modal-body">
          <div className="grid-2" style={{marginBottom:'.85rem'}}>{[{l:'Tutor',v:sel.tutorName},{l:'Student',v:sel.studentName},{l:'Date & Time',v:fmtDT(sel)},{l:'Subject',v:sel.subject},{l:'Price',v:fmtCurr(sel.amountDue||sel.sessionPrice)},{l:'Payment',v:sel.paymentStatus||'Not submitted'}].map(i=><div key={i.l} className="mini-card"><span className="mc-label">{i.l}</span><span className="mc-value">{i.v}</span></div>)}</div>
          {sel.slipFileName&&<div className="alert alert-info">Payment slip uploaded: {sel.slipFileName}</div>}
          {sel.paymentStatus==='PendingApproval'&&<div className="alert alert-info">This payment is waiting for admin approval.</div>}
          {sel.paymentStatus==='Rejected'&&<div className="alert alert-danger">The previous payment slip was rejected. Upload a corrected slip for review.</div>}
          {sel.note&&<div className="mini-card"><span className="mc-label">Lesson Note</span><p style={{fontSize:'.85rem',color:'var(--text2)',marginTop:'.2rem'}}>{sel.note}</p></div>}
        </div>
        <div className="modal-footer">
          {user?.role==='Student'&&sel.status==='Confirmed'&&<button className="btn btn-danger btn-sm" onClick={()=>{setToCancel(sel);setSel(null);}}>Cancel Booking</button>}
          {user?.role==='Student'&&sel.status==='Completed'&&!sel.reviewed&&<button className="btn btn-accent btn-sm" onClick={()=>{setToReview(sel);setSel(null);}}>Leave Review</button>}
          {user?.role==='Student'&&['Pending','Confirmed'].includes(sel.status)&&sel.paymentStatus!=='PendingApproval'&&<button className="btn btn-primary btn-sm" onClick={()=>openSlip(sel)}>Upload Slip</button>}
          {user?.role==='Tutor'&&['Pending','Confirmed'].includes(sel.status)&&<button className="btn btn-primary btn-sm" onClick={()=>openPrice(sel)}>Set Price</button>}
          <button className="btn btn-secondary btn-sm" onClick={()=>setSel(null)}>Close</button>
        </div>
      </div></div>}
      {toCancel&&<div className="modal-backdrop"><div className="modal">
        <div className="modal-header"><p className="eyebrow" style={{color:'var(--danger)'}}>Cancel Booking</p><h2 style={{fontSize:'1.15rem'}}>Release this time slot?</h2></div>
        <div className="modal-body"><div className="confirm-summary"><strong>{toCancel.subject}</strong><span>{fmtDT(toCancel)}</span><span>with {toCancel.tutorName}</span></div></div>
        <div className="modal-footer"><button className="btn btn-secondary btn-sm" onClick={()=>setToCancel(null)}>Keep Booking</button><button className="btn btn-danger btn-sm" onClick={doCancel}>Confirm Cancel</button></div>
      </div></div>}
      {priceTarget&&<div className="modal-backdrop"><div className="modal">
        <div className="modal-header"><p className="eyebrow" style={{color:'var(--brand)'}}>Session Price</p><h2 style={{fontSize:'1.15rem'}}>Set price for {priceTarget.subject}</h2></div>
        <div className="modal-body">
          <div className="confirm-summary"><strong>{priceTarget.studentName}</strong><span>{fmtDT(priceTarget)}</span></div>
          <div className="field"><label>Session price</label><input type="number" min="1" step="0.01" value={priceValue} onChange={e=>setPriceValue(e.target.value)} placeholder="45.00"/></div>
        </div>
        <div className="modal-footer"><button className="btn btn-secondary btn-sm" onClick={()=>setPriceTarget(null)}>Cancel</button><button className="btn btn-primary btn-sm" disabled={Number(priceValue)<=0} onClick={savePrice}>Save Price</button></div>
      </div></div>}
      {slipTarget&&<div className="modal-backdrop"><div className="modal">
        <div className="modal-header"><p className="eyebrow" style={{color:'var(--brand)'}}>Payment Slip</p><h2 style={{fontSize:'1.15rem'}}>Upload payment slip</h2></div>
        <div className="modal-body">
          <div className="confirm-summary"><strong>{slipTarget.subject}</strong><span>{fmtDT(slipTarget)}</span><span>Amount: {fmtCurr(slipTarget.amountDue||slipTarget.sessionPrice)}</span></div>
          <div className="field"><label>Slip file</label><input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={e=>setSlipFile(e.target.files?.[0]||null)}/><p className="field-hint">Accepted: JPG, PNG, WebP, PDF. Max 5MB.</p></div>
        </div>
        <div className="modal-footer"><button className="btn btn-secondary btn-sm" onClick={()=>setSlipTarget(null)}>Cancel</button><button className="btn btn-primary btn-sm" disabled={!slipFile} onClick={uploadSlip}>Upload Slip</button></div>
      </div></div>}
      {toReview&&<div className="modal-backdrop"><div className="modal">
        <div className="modal-header"><p className="eyebrow" style={{color:'var(--accent)'}}>Leave Feedback</p><h2 style={{fontSize:'1.15rem'}}>Review {toReview.tutorName}</h2></div>
        <div className="modal-body">
          <div className="confirm-summary" style={{marginBottom:'1rem'}}><strong>{toReview.subject}</strong><span>{fmtDT(toReview)}</span></div>
          <div className="field"><label>Star Rating</label><div style={{display:'flex',gap:4}}>{[1,2,3,4,5].map(n=><button key={n} type="button" className={`review-star${n<=rating?' filled':' empty'}`} onClick={()=>setRating(n)}>★</button>)}</div></div>
          <div className="field"><label>Comment (optional)</label><textarea rows={3} value={comment} onChange={e=>setComment(e.target.value)} placeholder="Share what helped…"/></div>
        </div>
        <div className="modal-footer"><button className="btn btn-secondary btn-sm" onClick={()=>setToReview(null)}>Cancel</button><button className="btn btn-primary btn-sm" disabled={rating<1} onClick={doReview}>Submit Review</button></div>
      </div></div>}
    </div>
  );
}
