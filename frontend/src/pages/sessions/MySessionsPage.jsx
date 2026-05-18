import {useState,useEffect,useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../services/api';

const fmtCurr=n=>new Intl.NumberFormat('en',{style:'currency',currency:'USD'}).format(Number(n)||0);
const fmtDT=s=>{const d=new Intl.DateTimeFormat('en',{weekday:'short',month:'short',day:'numeric'}).format(new Date(`${s.sessionDate}T00:00:00`));return`${d} · ${s.startTime}–${s.endTime}`;};
const fmtLiveDT=l=>{if(!l)return'Not scheduled';const start=new Date(l.scheduledStart);const end=new Date(l.scheduledEnd);const d=new Intl.DateTimeFormat('en',{weekday:'short',month:'short',day:'numeric'}).format(start);const st=new Intl.DateTimeFormat('en',{hour:'2-digit',minute:'2-digit'}).format(start);const et=new Intl.DateTimeFormat('en',{hour:'2-digit',minute:'2-digit'}).format(end);return`${d} · ${st}–${et}`;};
const isPast=s=>['Completed','Cancelled'].includes(s.status)||new Date(`${s.sessionDate}T${s.endTime||'23:59'}`)<new Date();
const amountFor=s=>Number(s?.amountDue||s?.sessionPrice||0);
const DEMO=[
  {id:'b1',subject:'Algebra',sessionDate:'2026-05-20',startTime:'10:00',endTime:'11:00',status:'Confirmed',tutorName:'Sarah Johnson',studentName:'Jordan Kim',note:'Focus on quadratic equations.',amountDue:45,paymentStatus:'Completed'},
  {id:'b2',subject:'Physics',sessionDate:'2026-05-22',startTime:'14:00',endTime:'15:00',status:'Pending',tutorName:'Emma Wilson',studentName:'Jordan Kim',note:'',amountDue:50},
  {id:'b3',subject:'Python',sessionDate:'2026-04-20',startTime:'09:00',endTime:'10:00',status:'Completed',tutorName:'David Kumar',studentName:'Jordan Kim',note:'Covered list comprehensions.',reviewed:true,amountDue:55,paymentStatus:'Completed'},
  {id:'b4',subject:'English',sessionDate:'2026-04-15',startTime:'11:00',endTime:'12:00',status:'Cancelled',tutorName:'Mike Chen',studentName:'Jordan Kim',note:'',amountDue:40},
  {id:'b5',subject:'Calculus',sessionDate:'2026-04-25',startTime:'15:00',endTime:'16:00',status:'Completed',tutorName:'Sarah Johnson',studentName:'Jordan Kim',note:'Integration techniques.',reviewed:false,amountDue:45,paymentStatus:'Completed'},
];
const normalizeSessions=data=>Array.isArray(data)?data:Array.isArray(data?.sessions)?data.sessions:DEMO;
const normalizeLiveSessions=data=>Array.isArray(data)?data:Array.isArray(data?.liveSessions)?data.liveSessions:[];
const toLocalInput=value=>{if(!value)return'';const d=new Date(value);if(Number.isNaN(d.getTime()))return String(value).slice(0,16);const local=new Date(d.getTime()-d.getTimezoneOffset()*60000);return local.toISOString().slice(0,16);};
const defaultLocal=(session,time)=>`${session.sessionDate}T${(time||'09:00').slice(0,5)}`;
const openMeeting=link=>{if(link)window.open(link,'_blank','noopener,noreferrer');};
const apiError=(e,fallback='Request failed')=>e.response?.data?.error||e.response?.data?.errors?.[0]?.msg||fallback;

export default function MySessionsPage(){
  const {user}=useAuth(); const navigate=useNavigate();
  const [sessions,setSessions]=useState([]); const [liveSessions,setLiveSessions]=useState({}); const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState('Upcoming'); const [sel,setSel]=useState(null);
  const [toCancel,setToCancel]=useState(null); const [toReview,setToReview]=useState(null);
  const [slipTarget,setSlipTarget]=useState(null); const [slipFile,setSlipFile]=useState(null);
  const [priceTarget,setPriceTarget]=useState(null); const [priceValue,setPriceValue]=useState('');
  const [liveTarget,setLiveTarget]=useState(null); const [liveForm,setLiveForm]=useState({title:'',description:'',platform:'Google Meet',meetingLink:'',scheduledStart:'',scheduledEnd:''});
  const [liveError,setLiveError]=useState('');
  const [notice,setNotice]=useState('');
  const [rating,setRating]=useState(0); const [comment,setComment]=useState('');

  useEffect(()=>{let active=true;(async()=>{try{const r=await api.get('/bookings/my');if(active)setSessions(normalizeSessions(r.data));}catch{if(active)setSessions(DEMO);}try{const r=await api.get('/live-sessions/my');const map={};normalizeLiveSessions(r.data).forEach(l=>{map[l.bookingId]=l;});if(active)setLiveSessions(map);}catch{if(active)setLiveSessions({});}finally{if(active)setLoading(false);}})();return()=>{active=false};},[]);

  const grouped=useMemo(()=>{const up=[],past=[];sessions.forEach(s=>isPast(s)?past.push(s):up.push(s));return{Upcoming:up.sort((a,b)=>new Date(a.sessionDate)-new Date(b.sessionDate)),Past:past.sort((a,b)=>new Date(b.sessionDate)-new Date(a.sessionDate))};},[sessions]);
  const vis=grouped[tab]||[];
  const pl=user?.role==='Tutor'?'Student':'Tutor';
  const selectedLive=sel?liveSessions[sel.id]:null;
  const canScheduleSelectedLive=user?.role==='Tutor'&&sel?.status==='Confirmed'&&!isPast(sel);
  const updateSession=(id,patch)=>setSessions(s=>s.map(x=>x.id===id?{...x,...patch}:x));
  const updateLive=l=>setLiveSessions(prev=>({...prev,[l.bookingId]:l}));

  const doCancel=async()=>{try{await api.patch(`/bookings/${toCancel.id}/cancel`);}catch{}setSessions(s=>s.map(x=>x.id===toCancel.id?{...x,status:'Cancelled'}:x));setToCancel(null);};
  const doReview=async()=>{if(rating<1||!toReview)return;try{await api.post('/reviews',{bookingId:toReview.id,rating,comment});setSessions(s=>s.map(x=>x.id===toReview.id?{...x,reviewed:true,canReview:false}:x));setNotice('Feedback submitted. Thank you for reviewing this lesson.');setToReview(null);setRating(0);setComment('');}catch(e){const message=apiError(e,'Could not submit review.');setNotice(message);if(e.response?.status===409){setSessions(s=>s.map(x=>x.id===toReview.id?{...x,reviewed:message.toLowerCase().includes('already'),canReview:false}:x));setToReview(null);}}};
  const openPrice=s=>{setPriceTarget(s);setPriceValue(String(s.sessionPrice||s.amountDue||''));setSel(null);};
  const savePrice=async()=>{if(!priceTarget||Number(priceValue)<=0)return;try{const r=await api.patch(`/bookings/${priceTarget.id}/price`,{price:Number(priceValue)});updateSession(priceTarget.id,r.data?.session||{amountDue:Number(priceValue),sessionPrice:Number(priceValue)});setNotice('Session price updated.');}catch{updateSession(priceTarget.id,{amountDue:Number(priceValue),sessionPrice:Number(priceValue)});setNotice('Demo mode: session price updated.');}setPriceTarget(null);setPriceValue('');};
  const openSlip=s=>{if(amountFor(s)<=0){setNotice('The tutor must set a session price before you can upload a payment slip.');setSel(null);return;}setSlipTarget(s);setSlipFile(null);setSel(null);};
  const uploadSlip=async()=>{if(!slipTarget||!slipFile)return;if(amountFor(slipTarget)<=0){setNotice('The tutor must set a session price before payment.');setSlipTarget(null);setSlipFile(null);return;}if(slipFile.size>5*1024*1024){setNotice('Payment slip must be 5MB or smaller.');return;}if(!['image/jpeg','image/png','image/webp','application/pdf'].includes(slipFile.type)){setNotice('Upload a JPG, PNG, WebP, or PDF payment slip.');return;}const fd=new FormData();fd.append('slip',slipFile);try{const r=await api.post(`/payments/slips/${slipTarget.id}`,fd);updateSession(slipTarget.id,r.data?.session||{paymentStatus:'PendingApproval',slipFileName:slipFile.name});setNotice('Payment slip uploaded for admin approval.');}catch(e){if(e.response){setNotice(e.response.data?.error||'Could not upload payment slip.');}else{updateSession(slipTarget.id,{paymentStatus:'PendingApproval',slipFileName:slipFile.name});setNotice('Demo mode: payment slip uploaded for admin approval.');}}setSlipTarget(null);setSlipFile(null);};

  const openLiveScheduler=s=>{const existing=liveSessions[s.id];setLiveError('');setLiveTarget(s);setLiveForm({
    title:existing?.title||`${s.subject} Live Lecture`,
    description:existing?.description||s.note||'',
    platform:existing?.platform||'Google Meet',
    meetingLink:existing?.meetingLink||'',
    scheduledStart:existing?.scheduledStart?toLocalInput(existing.scheduledStart):defaultLocal(s,s.startTime),
    scheduledEnd:existing?.scheduledEnd?toLocalInput(existing.scheduledEnd):defaultLocal(s,s.endTime),
  });setSel(null);};
  const saveLive=async()=>{if(!liveTarget)return;setLiveError('');const meetingLink=liveForm.meetingLink.trim();if(!meetingLink.startsWith('http://')&&!meetingLink.startsWith('https://')){setLiveError('Meeting link must start with http:// or https://');return;}const start=new Date(liveForm.scheduledStart);const end=new Date(liveForm.scheduledEnd);if(Number.isNaN(start.getTime())||Number.isNaN(end.getTime())||end<=start){setLiveError('Please choose a valid start and end time.');return;}if(start<new Date(Date.now()-5*60*1000)){setLiveError('Live session cannot be scheduled in the past. Choose a future start time.');return;}try{const payload={bookingId:liveTarget.id,title:liveForm.title.trim(),description:liveForm.description.trim(),platform:liveForm.platform,meetingLink,scheduledStart:start.toISOString(),scheduledEnd:end.toISOString()};const r=await api.post('/live-sessions',payload);let saved=r.data.liveSession;if(!saved?.meetingLink){const fresh=await api.get(`/live-sessions/booking/${liveTarget.id}`);saved=fresh.data.liveSession;}updateLive(saved);setNotice(r.data.message||'Live lecture scheduled.');setLiveTarget(null);}catch(e){setLiveError(apiError(e,'Could not schedule the live lecture.'));}};
  const cancelLive=async(live)=>{try{const r=await api.patch(`/live-sessions/${live.id}/cancel`);updateLive(r.data.liveSession);setNotice('Live lecture cancelled.');setSel(null);}catch(e){setNotice(e.response?.data?.error||'Could not cancel the live lecture.');}};
  const completeLive=async(live)=>{try{const r=await api.patch(`/live-sessions/${live.id}/complete`);updateLive(r.data.liveSession);setNotice('Live lecture marked as completed.');setSel(null);}catch(e){setNotice(e.response?.data?.error||'Could not complete the live lecture.');}};

  return(
    <div className="page">
      <div className="page-header"><div className="container"><p className="eyebrow">Your Learning Journey</p><h1>My Sessions</h1><p>Track bookings, payments, and scheduled live lecture links in one place.</p></div></div>
      <div className="container section">
        {notice&&<div className="alert alert-info">{notice}</div>}
        <div className="stats-row">
          {[{v:grouped.Upcoming?.length||0,l:'Upcoming'},{v:sessions.filter(s=>s.status==='Confirmed').length,l:'Confirmed'},{v:Object.values(liveSessions).filter(l=>['Scheduled','Live'].includes(l.displayStatus||l.status)).length,l:'Live Scheduled'},{v:sessions.filter(s=>s.status==='Completed').length,l:'Completed'}].map(s=>(
            <div key={s.l} className="stat-card"><div className="stat-value" style={{fontSize:'1.5rem'}}>{s.v}</div><div className="stat-label">{s.l}</div></div>
          ))}
        </div>
        <div className="tabs" style={{maxWidth:280,marginBottom:'1.1rem'}}>
          {['Upcoming','Past'].map(t=><button key={t} className={`tab${tab===t?' active':''}`} onClick={()=>setTab(t)}>{t}</button>)}
        </div>
        {loading?<div style={{textAlign:'center',padding:'3rem',color:'var(--text3)'}}>Loading sessions…</div>
        :vis.length===0?<div className="card"><div className="empty-state"><h3>No {tab.toLowerCase()} sessions</h3><p>{tab==='Upcoming'?(user?.role==='Student'?'Book a tutor to schedule your first session.':'Upcoming sessions will appear here.'):'Completed sessions will appear here.'}</p>{tab==='Upcoming'&&user?.role==='Student'&&<button className="btn btn-primary" style={{marginTop:'1rem'}} onClick={()=>navigate('/tutors')}>Browse Tutors</button>}</div></div>
        :<div className="card">{vis.map(s=>{const live=liveSessions[s.id];return <div key={s.id} className="session-row" onClick={()=>setSel(s)}><div className="avatar">{s.subject.charAt(0)}</div><div className="session-info"><strong>{s.subject}</strong><span>{fmtDT(s)} · {pl}: {user?.role==='Tutor'?s.studentName:s.tutorName}</span>{live&&<span className="live-inline">● {live.displayStatus||live.status} live lecture · {fmtLiveDT(live)}</span>}</div><StatusBadge status={s.status}/>{live&&<StatusBadge status={live.displayStatus||live.status}/>}<span style={{color:'var(--brand-mid)',fontSize:'.78rem',marginLeft:6}}>View →</span></div>})}</div>}
      </div>

      {sel&&<div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setSel(null)}><div className="modal">
        <div className="modal-header"><p className="eyebrow" style={{color:'var(--brand)'}}>Session Detail</p><div style={{display:'flex',alignItems:'center',gap:9,flexWrap:'wrap'}}><h2 style={{fontSize:'1.15rem'}}>{sel.subject}</h2><StatusBadge status={sel.status}/>{selectedLive&&<StatusBadge status={selectedLive.displayStatus||selectedLive.status}/>}</div></div>
        <div className="modal-body">
          <div className="grid-2" style={{marginBottom:'.85rem'}}>{[{l:'Tutor',v:sel.tutorName},{l:'Student',v:sel.studentName},{l:'Date & Time',v:fmtDT(sel)},{l:'Subject',v:sel.subject},{l:'Price',v:amountFor(sel)>0?fmtCurr(amountFor(sel)):'Not set yet'},{l:'Payment',v:sel.paymentStatus||'Not submitted'}].map(i=><div key={i.l} className="mini-card"><span className="mc-label">{i.l}</span><span className="mc-value">{i.v}</span></div>)}</div>
          {sel.slipFileName&&<div className="alert alert-info">Payment slip uploaded: {sel.slipFileName}</div>}
          {sel.paymentStatus==='PendingApproval'&&<div className="alert alert-info">This payment is waiting for admin approval. The tutor can schedule the live lecture after approval.</div>}
          {sel.paymentStatus==='Rejected'&&<div className="alert alert-danger">The previous payment slip was rejected. Upload a corrected slip for review.</div>}
          <div className="live-panel">
            <div className="live-panel-head"><div><span className="mc-label">Live Lecture</span><strong>{selectedLive?selectedLive.title:'Not scheduled yet'}</strong></div>{selectedLive&&<StatusBadge status={selectedLive.displayStatus||selectedLive.status}/>}</div>
            {selectedLive?<>
              <p>{fmtLiveDT(selectedLive)} · {selectedLive.platform}</p>
              {selectedLive.description&&<p>{selectedLive.description}</p>}
              {user?.role==='Student'&&selectedLive.displayStatus!=='Cancelled'&&!selectedLive.canJoin&&<div className="alert alert-info" style={{marginTop:'.7rem'}}>Join button opens 15 minutes before the lecture starts.</div>}
              {user?.role==='Tutor'&&selectedLive.meetingLink&&<p className="field-hint">Meeting link: {selectedLive.meetingLink}</p>}
            </>:<p>No live lecture link is attached to this confirmed booking yet.</p>}
          </div>
          {sel.note&&<div className="mini-card"><span className="mc-label">Lesson Note</span><p style={{fontSize:'.85rem',color:'var(--text2)',marginTop:'.2rem'}}>{sel.note}</p></div>}
        </div>
        <div className="modal-footer">
          {user?.role==='Student'&&selectedLive&&selectedLive.displayStatus!=='Cancelled'&&<button className="btn btn-success btn-sm" disabled={!selectedLive.canJoin} onClick={()=>openMeeting(selectedLive.joinUrl||selectedLive.meetingLink)}>Join Live Class</button>}
          {canScheduleSelectedLive&&<button className="btn btn-primary btn-sm" onClick={()=>openLiveScheduler(sel)}>{selectedLive?'Update Live Lecture':'Schedule Live Lecture'}</button>}
          {user?.role==='Tutor'&&sel.status==='Confirmed'&&isPast(sel)&&!selectedLive&&<div className="alert alert-info">Live lectures can only be scheduled before the lesson time.</div>}
          {user?.role==='Tutor'&&selectedLive&&selectedLive.displayStatus!=='Cancelled'&&<button className="btn btn-secondary btn-sm" onClick={()=>completeLive(selectedLive)}>Mark Completed</button>}
          {user?.role==='Tutor'&&selectedLive&&selectedLive.displayStatus!=='Cancelled'&&<button className="btn btn-danger btn-sm" onClick={()=>cancelLive(selectedLive)}>Cancel Live</button>}
          {user?.role==='Student'&&sel.status==='Confirmed'&&<button className="btn btn-danger btn-sm" onClick={()=>{setToCancel(sel);setSel(null);}}>Cancel Booking</button>}
          {user?.role==='Student'&&!sel.reviewed&&['Confirmed','Completed'].includes(sel.status)&&!sel.reviewWindowOpen&&<div className="alert alert-info">Feedback opens after the scheduled lesson end time.</div>}
          {user?.role==='Student'&&sel.reviewWindowOpen&&!sel.reviewed&&!sel.canReview&&<div className="alert alert-info">This lesson is not eligible for feedback.</div>}
          {user?.role==='Student'&&sel.canReview&&!sel.reviewed&&<button className="btn btn-accent btn-sm" onClick={()=>{setToReview(sel);setSel(null);}}>Leave Review</button>}
          {user?.role==='Student'&&['Pending','Confirmed'].includes(sel.status)&&sel.paymentStatus!=='PendingApproval'&&<button className="btn btn-primary btn-sm" disabled={amountFor(sel)<=0} onClick={()=>openSlip(sel)}>Upload Slip</button>}
          {user?.role==='Tutor'&&['Pending','Confirmed'].includes(sel.status)&&<button className="btn btn-primary btn-sm" onClick={()=>openPrice(sel)}>Set Price</button>}
          <button className="btn btn-secondary btn-sm" onClick={()=>setSel(null)}>Close</button>
        </div>
      </div></div>}

      {liveTarget&&<div className="modal-backdrop"><div className="modal">
        <div className="modal-header"><p className="eyebrow" style={{color:'var(--brand)'}}>Live Lecture Scheduler</p><h2 style={{fontSize:'1.15rem'}}>{liveSessions[liveTarget.id]?'Update live lecture':'Schedule live lecture'}</h2></div>
        <div className="modal-body">
          <div className="confirm-summary"><strong>{liveTarget.subject}</strong><span>{fmtDT(liveTarget)}</span><span>Student: {liveTarget.studentName}</span></div>
          {liveError&&<div className="alert alert-danger">{liveError}</div>}
          <div className="field"><label>Lecture title</label><input value={liveForm.title} onChange={e=>setLiveForm({...liveForm,title:e.target.value})} placeholder="Algebra revision live lecture"/></div>
          <div className="grid-2">
            <div className="field"><label>Start time</label><input type="datetime-local" value={liveForm.scheduledStart} onChange={e=>setLiveForm({...liveForm,scheduledStart:e.target.value})}/></div>
            <div className="field"><label>End time</label><input type="datetime-local" value={liveForm.scheduledEnd} onChange={e=>setLiveForm({...liveForm,scheduledEnd:e.target.value})}/></div>
          </div>
          <div className="grid-2">
            <div className="field"><label>Platform</label><select value={liveForm.platform} onChange={e=>setLiveForm({...liveForm,platform:e.target.value})}>{['Google Meet','Zoom','Microsoft Teams','Other'].map(p=><option key={p} value={p}>{p}</option>)}</select></div>
            <div className="field"><label>Meeting link</label><input value={liveForm.meetingLink} onChange={e=>setLiveForm({...liveForm,meetingLink:e.target.value})} placeholder="https://meet.google.com/..."/></div>
          </div>
          <div className="field"><label>Lecture instructions</label><textarea rows={3} value={liveForm.description} onChange={e=>setLiveForm({...liveForm,description:e.target.value})} placeholder="Add preparation notes, materials, or class rules for the student."/></div>
          <div className="alert alert-info">Best logic: create the live lecture only after payment approval. The system checks tutor/student time conflicts and opens the student join button 15 minutes before start.</div>
        </div>
        <div className="modal-footer"><button className="btn btn-secondary btn-sm" onClick={()=>setLiveTarget(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveLive}>Save Live Lecture</button></div>
      </div></div>}

      {toCancel&&<div className="modal-backdrop"><div className="modal">
        <div className="modal-header"><p className="eyebrow" style={{color:'var(--danger)'}}>Cancel Booking</p><h2 style={{fontSize:'1.15rem'}}>Release this time slot?</h2></div>
        <div className="modal-body"><div className="confirm-summary"><strong>{toCancel.subject}</strong><span>{fmtDT(toCancel)}</span><span>with {toCancel.tutorName}</span></div></div>
        <div className="modal-footer"><button className="btn btn-secondary btn-sm" onClick={()=>setToCancel(null)}>Keep Booking</button><button className="btn btn-danger btn-sm" onClick={doCancel}>Confirm Cancel</button></div>
      </div></div>}
      {priceTarget&&<div className="modal-backdrop"><div className="modal">
        <div className="modal-header"><p className="eyebrow" style={{color:'var(--brand)'}}>Session Price</p><h2 style={{fontSize:'1.15rem'}}>Set price for {priceTarget.subject}</h2></div>
        <div className="modal-body"><div className="confirm-summary"><strong>{priceTarget.studentName}</strong><span>{fmtDT(priceTarget)}</span></div><div className="field"><label>Session price</label><input type="number" min="1" step="0.01" value={priceValue} onChange={e=>setPriceValue(e.target.value)} placeholder="45.00"/></div></div>
        <div className="modal-footer"><button className="btn btn-secondary btn-sm" onClick={()=>setPriceTarget(null)}>Cancel</button><button className="btn btn-primary btn-sm" disabled={Number(priceValue)<=0} onClick={savePrice}>Save Price</button></div>
      </div></div>}
      {slipTarget&&<div className="modal-backdrop"><div className="modal">
        <div className="modal-header"><p className="eyebrow" style={{color:'var(--brand)'}}>Payment Slip</p><h2 style={{fontSize:'1.15rem'}}>Upload payment slip</h2></div>
        <div className="modal-body"><div className="confirm-summary"><strong>{slipTarget.subject}</strong><span>{fmtDT(slipTarget)}</span><span>Amount: {fmtCurr(amountFor(slipTarget))}</span></div><div className="field"><label>Slip file</label><input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={e=>setSlipFile(e.target.files?.[0]||null)}/><p className="field-hint">Accepted: JPG, PNG, WebP, PDF. Max 5MB.</p></div></div>
        <div className="modal-footer"><button className="btn btn-secondary btn-sm" onClick={()=>setSlipTarget(null)}>Cancel</button><button className="btn btn-primary btn-sm" disabled={!slipFile} onClick={uploadSlip}>Upload Slip</button></div>
      </div></div>}
      {toReview&&<div className="modal-backdrop"><div className="modal">
        <div className="modal-header"><p className="eyebrow" style={{color:'var(--accent)'}}>Leave Feedback</p><h2 style={{fontSize:'1.15rem'}}>Review {toReview.tutorName}</h2></div>
        <div className="modal-body"><div className="confirm-summary" style={{marginBottom:'1rem'}}><strong>{toReview.subject}</strong><span>{fmtDT(toReview)}</span></div><div className="field"><label>Star Rating</label><div style={{display:'flex',gap:4}}>{[1,2,3,4,5].map(n=><button key={n} type="button" className={`review-star${n<=rating?' filled':' empty'}`} onClick={()=>setRating(n)}>★</button>)}</div></div><div className="field"><label>Comment (optional)</label><textarea rows={3} value={comment} onChange={e=>setComment(e.target.value)} placeholder="Share what helped…"/></div></div>
        <div className="modal-footer"><button className="btn btn-secondary btn-sm" onClick={()=>setToReview(null)}>Cancel</button><button className="btn btn-primary btn-sm" disabled={rating<1} onClick={doReview}>Submit Review</button></div>
      </div></div>}
    </div>
  );
}
