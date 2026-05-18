import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Stars from '../../components/common/Stars';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DAY_INDEX=Object.fromEntries(DAYS.map((day,index)=>[day,index]));
const BASE_HOURS=Array.from({length:12},(_,i)=>i+8);
const pad=h=>`${String(h).padStart(2,'0')}:00`;
const DEMO_TUTORS=[
  {id:'1',name:'Sarah Johnson',bio:'Mathematics expert with 10+ years of experience. Specialized in algebra, calculus, and statistics for all grade levels.',hourly_rate:45,rating:4.9,reviewCount:248,subjects:[{id:'s1',name:'Algebra',description:'Equations and problem-solving.'},{id:'s2',name:'Calculus',description:'Derivatives and integrals.'},{id:'s3',name:'Statistics',description:'Data analysis and probability.'}]},
  {id:'2',name:'Mike Chen',bio:'English teacher and TOEFL specialist.',hourly_rate:40,rating:4.8,reviewCount:156,subjects:[{id:'s4',name:'English',description:'Comprehensive English mastery.'}]},
  {id:'3',name:'Emma Wilson',bio:'Science tutor with a passion for real-world examples.',hourly_rate:50,rating:4.95,reviewCount:312,subjects:[{id:'s7',name:'Physics',description:'Mechanics to quantum fundamentals.'},{id:'s8',name:'Chemistry',description:'Organic and inorganic chemistry.'}]},
  {id:'4',name:'David Kumar',bio:'Computer Science mentor for all levels.',hourly_rate:55,rating:4.7,reviewCount:189,subjects:[{id:'s10',name:'Python',description:'Beginner to advanced Python.'}]},
  {id:'5',name:'Priya Nair',bio:'Languages specialist.',hourly_rate:38,rating:4.75,reviewCount:104,subjects:[{id:'s13',name:'French',description:'Conversational and academic French.'},{id:'s14',name:'History',description:'World history and critical analysis.'}]},
  {id:'6',name:'Omar Hassan',bio:'STEM educator and former university lecturer.',hourly_rate:48,rating:4.85,reviewCount:231,subjects:[{id:'s15',name:'Mathematics',description:'A-Level and university-level math.'}]},
];
const DEMO_SLOTS=[
  {id:'sl1',dayOfWeek:'Monday',startTime:'08:00',endTime:'09:00',status:'available'},
  {id:'sl2',dayOfWeek:'Monday',startTime:'09:00',endTime:'10:00',status:'booked'},
  {id:'sl3',dayOfWeek:'Wednesday',startTime:'10:00',endTime:'11:00',status:'available'},
  {id:'sl4',dayOfWeek:'Wednesday',startTime:'14:00',endTime:'15:00',status:'available'},
  {id:'sl5',dayOfWeek:'Friday',startTime:'09:00',endTime:'10:00',status:'available'},
  {id:'sl6',dayOfWeek:'Friday',startTime:'11:00',endTime:'12:00',status:'booked'},
  {id:'sl7',dayOfWeek:'Tuesday',startTime:'13:00',endTime:'14:00',status:'available'},
];
const DEMO_REVIEWS=[
  {id:'r1',tutorId:'1',studentName:'Jordan Kim',rating:5,comment:'Excellent! Explained quadratic equations beautifully.',createdAt:'2026-04-10T14:00:00Z'},
  {id:'r2',tutorId:'1',studentName:'Alex Chan',rating:4,comment:'Very patient and clear explanations.',createdAt:'2026-04-15T11:30:00Z'},
  {id:'r3',tutorId:'3',studentName:'Sam Lee',rating:5,comment:'Made physics actually enjoyable!',createdAt:'2026-04-18T09:00:00Z'},
];
const getSubjectName = subject => typeof subject === 'string' ? subject : subject?.name;
const normalizeTime=value=>{
  if(!value)return'';
  const [hour='00',minute='00']=String(value).split(':');
  return `${hour.padStart(2,'0')}:${minute.padStart(2,'0')}`;
};
const normalizeStatus=status=>String(status||'available').toLowerCase();
const normalizeSlot=slot=>({
  ...slot,
  startTime:normalizeTime(slot.startTime),
  endTime:normalizeTime(slot.endTime),
  status:normalizeStatus(slot.status),
});
const normalizeTutorResponse = data => data?.tutor || data;
const normalizeSlotsResponse = data => {
  const raw=Array.isArray(data)?data:Array.isArray(data?.slots)?data.slots:[];
  return raw.map(normalizeSlot).filter(slot=>slot.dayOfWeek&&slot.startTime&&slot.endTime);
};
const normalizeReviewsResponse = data => Array.isArray(data) ? data : data?.reviews || [];
const sortSlots=(a,b)=>(DAY_INDEX[a.dayOfWeek]??99)-(DAY_INDEX[b.dayOfWeek]??99)||a.startTime.localeCompare(b.startTime);
const slotStatusLabel=status=>status==='booked'?'Booked':status==='cancelled'?'Cancelled':'Available';
const getTutorRate=tutor=>Number(tutor?.hourly_rate ?? tutor?.hourlyRate ?? 0);
const ALLOWED_SLIP_TYPES=['image/jpeg','image/png','image/webp','application/pdf'];
const MAX_SLIP_SIZE=5*1024*1024;

export default function TutorDetailPage() {
  const {id}=useParams(); const navigate=useNavigate(); const {user}=useAuth();
  const [tutor,setTutor]=useState(null);
  const [slots,setSlots]=useState([]);
  const [reviews,setReviews]=useState([]);
  const [loading,setLoading]=useState(true);
  const [availabilityError,setAvailabilityError]=useState('');
  const [selSlot,setSelSlot]=useState(null);
  const [bSubj,setBSubj]=useState('');
  const [bNote,setBNote]=useState('');
  const [bConf,setBConf]=useState(false);
  const [submitting,setSubmitting]=useState(false);
  const [booked,setBooked]=useState(false);
  const [bookingError,setBookingError]=useState('');
  const [paymentTarget,setPaymentTarget]=useState(null);
  const [slipFile,setSlipFile]=useState(null);
  const [paymentUploading,setPaymentUploading]=useState(false);
  const [paymentNotice,setPaymentNotice]=useState('');
  const [paymentError,setPaymentError]=useState('');

  useEffect(()=>{
    setLoading(true); setAvailabilityError(''); setBookingError(''); setBooked(false); setPaymentNotice(''); setPaymentError(''); setPaymentTarget(null); setSlipFile(null);
    Promise.all([
      api.get(`/tutors/${id}`).catch(()=>({data:DEMO_TUTORS.find(t=>t.id===id)||DEMO_TUTORS[0]})),
      api.get(`/availability/tutors/${id}`).catch(error=>{setAvailabilityError(error.response?.data?.error||'Could not load this tutor availability.');return{data:{slots:[]}};}),
      api.get(`/reviews/tutors/${id}`).catch(()=>({data:DEMO_REVIEWS.filter(r=>r.tutorId===id)})),
    ]).then(([t,s,r])=>{
      setTutor(normalizeTutorResponse(t.data));
      setSlots(normalizeSlotsResponse(s.data));
      setReviews(normalizeReviewsResponse(r.data));
    }).finally(()=>setLoading(false));
  },[id]);

  if(loading)return<div style={{padding:'4rem',textAlign:'center',color:'var(--text3)'}}>Loading tutor profile…</div>;
  if(!tutor)return<div style={{padding:'4rem',textAlign:'center'}}>Tutor not found.</div>;

  const avgR=reviews.length?reviews.reduce((s,r)=>s+r.rating,0)/reviews.length:tutor.rating||0;
  const sortedSlots=[...slots].sort(sortSlots);
  const availableSlots=sortedSlots.filter(s=>s.status==='available');
  const bookedSlots=sortedSlots.filter(s=>s.status==='booked');
  const scheduleHours=[...new Set([...BASE_HOURS,...sortedSlots.map(s=>Number.parseInt(s.startTime,10)).filter(Number.isFinite)])].sort((a,b)=>a-b);
  const slotMap=new Map(slots.map(s=>[`${s.dayOfWeek}-${s.startTime}`,s]));
  const tutorRate=getTutorRate(tutor);

  const doBook=async(e)=>{
    e.preventDefault(); if(!bSubj||!selSlot)return; setSubmitting(true); setBookingError('');
    try{
      const response=await api.post('/bookings',{tutorId:tutor.id,slotId:selSlot.id,subject:bSubj,note:bNote});
      const booking=response.data?.booking;
      const bookedSlot=selSlot;
      setSlots(current=>current.map(slot=>slot.id===selSlot.id?{...slot,status:'booked'}:slot));
      setBooked(true); setSelSlot(null);
      if(booking?.id&&tutorRate>0){
        setPaymentTarget({...booking,tutorName:tutor.name,dayOfWeek:bookedSlot.dayOfWeek,startTime:bookedSlot.startTime,endTime:bookedSlot.endTime,amountDue:tutorRate});
        setSlipFile(null);
        setPaymentNotice('');
        setPaymentError('');
      }else if(tutorRate<=0){
        setPaymentNotice('Booking created. The tutor must set a session price before payment slip upload.');
      }
    }catch(error){
      setBookingError(error.response?.data?.error||'Could not submit this booking request. Please try another slot.');
    }finally{
      setSubmitting(false);
    }
  };

  const uploadPaymentSlip=async()=>{
    if(!paymentTarget||!slipFile)return;
    setPaymentUploading(true); setPaymentError(''); setPaymentNotice('');
    if(slipFile.size>MAX_SLIP_SIZE){
      setPaymentError('Payment slip must be 5MB or smaller.');
      setPaymentUploading(false);
      return;
    }
    if(!ALLOWED_SLIP_TYPES.includes(slipFile.type)){
      setPaymentError('Upload a JPG, PNG, WebP, or PDF payment slip.');
      setPaymentUploading(false);
      return;
    }
    const fd=new FormData();
    fd.append('slip',slipFile);
    try{
      await api.post(`/payments/slips/${paymentTarget.id}`,fd);
      setPaymentNotice('Payment slip uploaded. Admin will review it before confirming payment.');
      setPaymentTarget(null);
      setSlipFile(null);
    }catch(error){
      setPaymentError(error.response?.data?.error||'Could not upload payment slip.');
    }finally{
      setPaymentUploading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{paddingTop:'1.35rem',paddingBottom:'2rem'}}>
        <button className="btn btn-secondary btn-sm" onClick={()=>navigate('/tutors')} style={{marginBottom:'1rem'}}>← Back to Tutors</button>
        <div className="card" style={{marginBottom:'1.35rem'}}>
          <div className="tutor-detail-hero">
            <div className="tutor-detail-avatar">{tutor.name.charAt(0)}</div>
            <div style={{flex:1}}>
              <h1>{tutor.name}</h1>
              <div style={{display:'flex',alignItems:'center',gap:8,margin:'.3rem 0'}}>
                <Stars rating={avgR} size={13}/>
                <span style={{color:'rgba(255,255,255,.72)',fontSize:'.82rem'}}>{avgR.toFixed(1)} · {tutor.reviewCount||reviews.length} reviews</span>
              </div>
              <p style={{color:'rgba(255,255,255,.8)',fontSize:'.88rem',lineHeight:1.65,maxWidth:540,margin:'.5rem 0'}}>{tutor.bio}</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:'.65rem'}}>
                {(tutor.subjects||[]).map(s=><span key={s.id||getSubjectName(s)} style={{background:'rgba(255,255,255,.18)',color:'#fff',borderRadius:100,padding:'2px 11px',fontSize:'.73rem'}}>{getSubjectName(s)}</span>)}
              </div>
            </div>
            <div className="tutor-rate-badge"><div className="rate-num">${tutorRate}</div><div className="rate-label">per hour</div></div>
          </div>
          {booked&&<div className="alert alert-success" style={{margin:'1rem 1.35rem'}}>✅ <div><strong>Booking request submitted!</strong><p style={{marginTop:'.1rem',fontSize:'.82rem'}}>Your session request is pending confirmation from {tutor.name}. You can upload your payment slip now.</p></div></div>}
          {paymentNotice&&<div className="alert alert-info" style={{margin:'1rem 1.35rem'}}>{paymentNotice}</div>}
          {bookingError&&<div className="alert alert-danger" style={{margin:'1rem 1.35rem'}}>{bookingError}</div>}
        </div>
        <div className="grid-2" style={{marginBottom:'1.35rem'}}>
          <div className="card"><div className="card-body">
            <h2 className="section-title" style={{marginBottom:'1rem'}}>Subjects & Expertise</h2>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {(tutor.subjects||[]).map(s=>(
                <div key={s.id||getSubjectName(s)} style={{background:'var(--bg)',borderRadius:'var(--radius-sm)',padding:'.8rem 1rem',borderLeft:'3px solid var(--brand-mid)'}}>
                  <strong style={{display:'block',marginBottom:'.18rem',fontSize:'.9rem'}}>📚 {getSubjectName(s)}</strong>
                  <span style={{fontSize:'.8rem',color:'var(--text2)'}}>{s.description||'Expert level instruction available.'}</span>
                </div>
              ))}
            </div>
          </div></div>
          <div className="card"><div className="card-body">
            <h2 className="section-title" style={{marginBottom:'1rem'}}>Overview</h2>
            <div className="grid-2">
              {[{v:availableSlots.length,l:'Available Slots'},{v:bookedSlots.length,l:'Booked Slots'},{v:(tutor.subjects||[]).length,l:'Subjects'},{v:tutor.reviewCount||reviews.length,l:'Reviews'}].map(s=>(
                <div key={s.l} className="stat-card" style={{padding:'.9rem'}}><div className="stat-value" style={{fontSize:'1.5rem'}}>{s.v}</div><div className="stat-label">{s.l}</div></div>
              ))}
            </div>
          </div></div>
        </div>
        <div className="card" style={{marginBottom:'1.35rem'}}><div className="card-body">
          <h2 className="section-title" style={{marginBottom:'.5rem'}}>Weekly Availability</h2>
          <p style={{fontSize:'.8rem',color:'var(--text2)',marginBottom:'.9rem'}}>Green slots are ready to book. Blue slots are already reserved. The table below mirrors the exact API data.</p>
          {availabilityError&&<div className="alert alert-danger" style={{marginBottom:'.9rem'}}>{availabilityError}</div>}
          {sortedSlots.length===0?(
            <div className="empty-state" style={{padding:'2rem'}}>
              <h3>No availability published</h3>
              <p>This tutor has not opened bookable slots yet. Check another tutor or come back later.</p>
            </div>
          ):(
            <>
              {availableSlots.length===0&&<div className="alert alert-info" style={{marginBottom:'.9rem'}}>All published slots for this tutor are currently booked.</div>}
              <div className="cal-grid">
                <div style={{height:28}}/>
                {DAYS.map(d=><div key={d} className="cal-day-header">{d.slice(0,3)}</div>)}
                {scheduleHours.map(h=>(
                  <React.Fragment key={h}>
                    <div className="cal-time-label">{pad(h)}</div>
                    {DAYS.map(d=>{
                      const slot=slotMap.get(`${d}-${pad(h)}`);
                      const cls=slot?.status==='available'?'available':slot?.status==='booked'?'booked':slot?.status==='cancelled'?'cancelled':'';
                      const canBook=user?.role==='Student'&&cls==='available';
                      return<button key={`${d}${h}`} className={`cal-slot ${cls}`} disabled={!canBook} title={slot?`${slot.dayOfWeek} ${slot.startTime}-${slot.endTime} · ${slotStatusLabel(slot.status)}`:'No slot'} onClick={()=>{if(canBook){setSelSlot(slot);setBooked(false);setBookingError('');setBConf(false);setBSubj(getSubjectName(tutor.subjects?.[0])||'');setBNote('');}}}>
                        {cls==='available'?'Book':cls==='booked'?'Booked':cls==='cancelled'?'Off':''}
                      </button>;
                    })}
                  </React.Fragment>
                ))}
              </div>
              <div className="table-wrap" style={{marginTop:'1rem'}}>
                <table>
                  <thead><tr><th>Day</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {sortedSlots.map(slot=>{
                      const canBook=user?.role==='Student'&&slot.status==='available';
                      return(
                        <tr key={slot.id||`${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}`}>
                          <td>{slot.dayOfWeek}</td>
                          <td>{slot.startTime} - {slot.endTime}</td>
                          <td><span className={`badge ${slot.status==='available'?'badge-green':slot.status==='booked'?'badge-blue':'badge-gray'}`}>{slotStatusLabel(slot.status)}</span></td>
                          <td>{canBook?<button className="btn btn-primary btn-sm" onClick={()=>{setSelSlot(slot);setBooked(false);setBookingError('');setBConf(false);setBSubj(getSubjectName(tutor.subjects?.[0])||'');setBNote('');}}>Book</button>:<span style={{color:'var(--text3)',fontSize:'.78rem'}}>{slot.status==='booked'?'Reserved':'Unavailable'}</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {!user&&<p style={{textAlign:'center',marginTop:'.9rem',color:'var(--text2)',fontSize:'.83rem'}}>Please <button style={{background:'none',border:'none',color:'var(--brand-mid)',cursor:'pointer',fontWeight:500}} onClick={()=>navigate('/login')}>log in as a Student</button> to book a session.</p>}
        </div></div>
        <div className="card"><div className="card-body">
          <div className="section-header">
            <h2 className="section-title">Student Reviews</h2>
            <div style={{display:'flex',alignItems:'center',gap:8}}><Stars rating={avgR} size={13}/><span style={{fontFamily:"'DM Serif Display',serif",fontSize:'1.2rem'}}>{avgR.toFixed(1)}</span><span style={{color:'var(--text3)',fontSize:'.8rem'}}>({reviews.length})</span></div>
          </div>
          {reviews.length===0?<div className="empty-state" style={{padding:'2rem'}}><h3>No reviews yet</h3><p>Completed session feedback will appear here.</p></div>
          :<div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            {reviews.map(r=>(
              <div key={r.id} style={{background:'var(--bg)',borderRadius:'var(--radius-sm)',padding:'.9rem 1rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:'.5rem'}}>
                  <div className="avatar" style={{width:34,height:34,fontSize:'.82rem'}}>{(r.studentName||'S').charAt(0)}</div>
                  <div><strong style={{fontSize:'.88rem'}}>{r.studentName}</strong><div><Stars rating={r.rating} size={11}/></div></div>
                  <span style={{marginLeft:'auto',fontSize:'.72rem',color:'var(--text3)'}}>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{fontSize:'.83rem',color:'var(--text2)',lineHeight:1.55}}>{r.comment}</p>
              </div>
            ))}
          </div>}
        </div></div>
      </div>
      {selSlot&&(
        <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setSelSlot(null)}>
          <div className="modal">
            <div className="modal-header">
              <p className="eyebrow" style={{color:'var(--brand)'}}>Confirm Lesson</p>
              <h2 style={{fontSize:'1.2rem'}}>Book a tutoring session</h2>
              <p style={{color:'var(--text2)',fontSize:'.83rem',marginTop:'.3rem'}}>Review the details before sending your request.</p>
            </div>
            <form onSubmit={doBook}>
              <div className="modal-body">
                <div className="grid-2" style={{marginBottom:'.9rem'}}>
                  {[{l:'Tutor',v:tutor.name},{l:'Day',v:selSlot.dayOfWeek},{l:'Time',v:`${selSlot.startTime}–${selSlot.endTime}`},{l:'Rate',v:`$${tutorRate}/hr`}].map(i=>(
                    <div key={i.l} className="mini-card"><span className="mc-label">{i.l}</span><span className="mc-value">{i.v}</span></div>
                  ))}
                </div>
                <div className="field">
                  <label>Subject *</label>
                  <select value={bSubj} onChange={e=>setBSubj(e.target.value)} required>
                    <option value="">Select a subject…</option>
                    {(tutor.subjects||[]).map(s=><option key={s.id||getSubjectName(s)} value={getSubjectName(s)}>{getSubjectName(s)}</option>)}
                  </select>
                </div>
                <div className="field"><label>Lesson note (optional)</label><textarea rows={3} value={bNote} onChange={e=>setBNote(e.target.value)} placeholder="Share the topic or goal for this lesson…"/></div>
                <label style={{display:'flex',alignItems:'flex-start',gap:8,cursor:'pointer',fontSize:'.83rem',color:'var(--text2)'}}>
                  <input type="checkbox" checked={bConf} onChange={e=>setBConf(e.target.checked)} style={{marginTop:3}}/>
                  I confirm these booking details and want to send this request.
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={()=>setSelSlot(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={!bConf||!bSubj||submitting}>{submitting?'Submitting…':'Submit Booking'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {paymentTarget&&(
        <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setPaymentTarget(null)}>
          <div className="modal">
            <div className="modal-header">
              <p className="eyebrow" style={{color:'var(--brand)'}}>Payment Slip</p>
              <h2 style={{fontSize:'1.2rem'}}>Upload slip for this lecture</h2>
              <p style={{color:'var(--text2)',fontSize:'.83rem',marginTop:'.3rem'}}>Your booking is created. Upload the bank slip so admin can approve the payment.</p>
            </div>
            <div className="modal-body">
              {paymentError&&<div className="alert alert-danger">{paymentError}</div>}
              <div className="confirm-summary">
                <strong>{paymentTarget.subject}</strong>
                <span>{paymentTarget.dayOfWeek} · {paymentTarget.startTime}-{paymentTarget.endTime}</span>
                <span>Tutor: {paymentTarget.tutorName}</span>
                <span>Amount: ${paymentTarget.amountDue}/hr</span>
              </div>
              <div className="field">
                <label>Payment slip file</label>
                <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={e=>setSlipFile(e.target.files?.[0]||null)}/>
                <p className="field-hint">Accepted: JPG, PNG, WebP, PDF. Max 5MB.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={()=>setPaymentTarget(null)}>Upload Later</button>
              <button type="button" className="btn btn-primary btn-sm" disabled={!slipFile||paymentUploading} onClick={uploadPaymentSlip}>{paymentUploading?'Uploading…':'Upload Slip'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
