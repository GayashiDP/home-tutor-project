import {useState,useEffect} from 'react';import Stars from '../../components/common/Stars';import api from '../../services/api';
const fmtDate=v=>new Date(v).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'});
const DEMO=[{id:'r1',tutorId:'1',tutorName:'Sarah Johnson',studentName:'Jordan Kim',rating:5,comment:'Excellent! Sarah explained quadratic equations beautifully.',createdAt:'2026-04-10T14:00:00Z'},{id:'r2',tutorId:'4',tutorName:'David Kumar',studentName:'Lee Park',rating:4,comment:'Very clear explanations. Highly recommend for Python beginners.',createdAt:'2026-04-15T11:30:00Z'},{id:'r3',tutorId:'3',tutorName:'Emma Wilson',studentName:'Alex Chan',rating:5,comment:"Best science tutor I've had. Made physics actually enjoyable!",createdAt:'2026-04-18T16:00:00Z'},{id:'r4',tutorId:'2',tutorName:'Mike Chen',studentName:'Priya S.',rating:3,comment:'Good session but could use more practice examples.',createdAt:'2026-04-20T09:00:00Z'},{id:'r5',tutorId:'6',tutorName:'Omar Hassan',studentName:'Sam Lee',rating:5,comment:'Outstanding teacher. Cleared all my doubts about Further Maths.',createdAt:'2026-04-22T11:00:00Z'}];
const normalizeReviews=data=>Array.isArray(data)?data:Array.isArray(data?.reviews)?data.reviews:DEMO;
export default function AdminReviewManagementPage(){
  const [reviews,setReviews]=useState([]); const [loading,setLoading]=useState(true); const [filter,setFilter]=useState('All'); const [del,setDel]=useState(null);
  useEffect(()=>{api.get('/reviews').then(r=>setReviews(normalizeReviews(r.data))).catch(()=>setReviews(DEMO)).finally(()=>setLoading(false));}, []);
  const avg=reviews.length?(reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1):'0.0';
  const vis=filter==='All'?reviews:reviews.filter(r=>r.rating===Number(filter));
  const doDel=async()=>{try{await api.delete(`/reviews/${del.id}`);}catch{}setReviews(r=>r.filter(x=>x.id!==del.id));setDel(null);};
  return(
    <div className="page">
      <div className="page-header"><div className="container"><p className="eyebrow">Admin Panel</p><h1>Review Moderation</h1><p>Manage student reviews across all tutors. Remove inappropriate or spam content.</p></div></div>
      <div className="container section">
        <div className="stats-row">{[{v:reviews.length,l:'Total Reviews'},{v:`${avg} ★`,l:'Avg. Rating'},{v:reviews.filter(r=>r.rating>=4).length,l:'Positive (4-5★)'},{v:reviews.filter(r=>r.rating<=2).length,l:'Negative (1-2★)'}].map(s=><div key={s.l} className="stat-card"><div className="stat-value" style={{fontSize:'1.5rem'}}>{s.v}</div><div className="stat-label">{s.l}</div></div>)}</div>
        <div style={{display:'flex',gap:7,marginBottom:'1.25rem',flexWrap:'wrap'}}>
          {['All','5','4','3','2','1'].map(f=><button key={f} className={`btn btn-sm ${filter===f?'btn-primary':'btn-secondary'}`} onClick={()=>setFilter(f)}>{f==='All'?'All Reviews':`${f} Star`}</button>)}
        </div>
        {loading?<div style={{textAlign:'center',padding:'3rem',color:'var(--text3)'}}>Loading reviews…</div>
        :vis.length===0?<div className="card"><div className="empty-state"><h3>No reviews</h3><p>No reviews match this filter.</p></div></div>
        :<div>{vis.map(r=><div key={r.id} className="review-card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'.75rem'}}>
            <div style={{display:'flex',gap:11,alignItems:'flex-start'}}>
              <div className="avatar" style={{width:36,height:36,fontSize:'.82rem'}}>{(r.studentName||'S').charAt(0)}</div>
              <div><strong style={{display:'block',fontSize:'.9rem'}}>{r.studentName}</strong><span style={{fontSize:'.75rem',color:'var(--text3)'}}>Reviewed <strong style={{color:'var(--text2)'}}>{r.tutorName}</strong></span><div style={{marginTop:'.2rem'}}><Stars rating={r.rating} size={12}/></div></div>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}><span style={{fontSize:'.73rem',color:'var(--text3)'}}>{fmtDate(r.createdAt)}</span><button className="btn btn-danger btn-sm" onClick={()=>setDel(r)}>Delete</button></div>
          </div>
          <p style={{fontSize:'.85rem',color:'var(--text2)',lineHeight:1.6,paddingTop:'.6rem',borderTop:'1px solid var(--border)'}}>{r.comment||<em style={{color:'var(--text3)'}}>No written comment.</em>}</p>
        </div>)}</div>}
      </div>
      {del&&<div className="modal-backdrop"><div className="modal">
        <div className="modal-header"><p className="eyebrow" style={{color:'var(--danger)'}}>Delete Review</p><h2 style={{fontSize:'1.1rem'}}>Delete this review?</h2><p style={{color:'var(--text2)',fontSize:'.83rem',marginTop:'.3rem'}}>This action is permanent and cannot be undone.</p></div>
        <div className="modal-body"><div className="confirm-summary"><strong>{del.studentName} → {del.tutorName}</strong><span><Stars rating={del.rating} size={12}/></span>{del.comment&&<span style={{fontStyle:'italic',marginTop:'.25rem'}}>"{del.comment.slice(0,100)}{del.comment.length>100?'…':''}"</span>}</div></div>
        <div className="modal-footer"><button className="btn btn-secondary btn-sm" onClick={()=>setDel(null)}>Cancel</button><button className="btn btn-danger btn-sm" onClick={doDel}>Delete Review</button></div>
      </div></div>}
    </div>
  );
}
