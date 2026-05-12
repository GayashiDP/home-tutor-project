import {useEffect,useState} from 'react';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../services/api';

const fmtCurr=n=>new Intl.NumberFormat('en',{style:'currency',currency:'USD'}).format(Number(n)||0);
const fmtDate=v=>v?new Date(v).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'}):'';
const DEMO=[
  {id:'p1',bookingId:'b2',studentName:'Jordan Kim',tutorName:'Emma Wilson',subject:'Physics',sessionDate:'2026-05-12',startTime:'14:00',endTime:'15:00',amount:50,status:'PendingApproval',slipFileName:'bank-slip.jpg',slipUploadedAt:'2026-05-02T10:00:00Z'},
];
const normalize=data=>Array.isArray(data)?data:Array.isArray(data?.payments)?data.payments:DEMO;

export default function AdminPaymentApprovalPage(){
  const [payments,setPayments]=useState([]);
  const [loading,setLoading]=useState(true);
  const [busyId,setBusyId]=useState(null);
  const [notice,setNotice]=useState('');
  const [preview,setPreview]=useState(null);
  useEffect(()=>{api.get('/payments/approvals').then(r=>setPayments(normalize(r.data))).catch(()=>setPayments(DEMO)).finally(()=>setLoading(false));},[]);
  const viewSlip=async(payment)=>{
    try{
      const r=await api.get(`/payments/${payment.id}/slip`,{responseType:'blob'});
      const url=URL.createObjectURL(r.data);
      setPreview({url,type:r.data.type||payment.slipContentType||'',name:payment.slipFileName||'Payment slip'});
    }catch{
      setNotice('Could not open payment slip.');
    }
  };
  const closePreview=()=>{if(preview?.url)URL.revokeObjectURL(preview.url);setPreview(null);};
  const approve=async(payment)=>{
    setBusyId(payment.id); setNotice('');
    try{
      await api.patch(`/payments/${payment.id}/approve`);
      setPayments(p=>p.filter(x=>x.id!==payment.id));
      setNotice('Payment approved and session confirmed.');
    }catch(error){
      if(error.response){
        setNotice(error.response.data?.error||'Could not approve payment.');
      }else{
        setPayments(p=>p.filter(x=>x.id!==payment.id));
        setNotice('Demo mode: payment approved.');
      }
    }finally{setBusyId(null);}
  };
  const reject=async(payment)=>{
    setBusyId(payment.id); setNotice('');
    try{
      await api.patch(`/payments/${payment.id}/reject`);
      setPayments(p=>p.filter(x=>x.id!==payment.id));
      setNotice('Payment rejected. The student can upload a corrected slip.');
    }catch(error){
      if(error.response){
        setNotice(error.response.data?.error||'Could not reject payment.');
      }else{
        setPayments(p=>p.filter(x=>x.id!==payment.id));
        setNotice('Demo mode: payment rejected.');
      }
    }finally{setBusyId(null);}
  };
  const total=payments.reduce((s,p)=>s+(Number(p.amount)||0),0);
  return(
    <div className="page admin-payments-page">
      <div className="page-header admin-payments-hero"><div className="container"><p className="eyebrow">Admin Panel</p><h1>Payment Approvals</h1><p>Review uploaded student payment slips, verify each transaction clearly, then approve or reject payments with confidence.</p></div></div>
      <div className="container section">
        <div className="payment-approval-summary">
          <div className="payment-summary-card payment-summary-card-primary">
            <span className="payment-summary-icon" aria-hidden="true">⌛</span>
            <div>
              <div className="stat-value" style={{fontSize:'1.5rem'}}>{payments.length}</div>
              <div className="stat-label">Pending Slips</div>
            </div>
          </div>
          <div className="payment-summary-card payment-summary-card-amount">
            <span className="payment-summary-icon" aria-hidden="true">💳</span>
            <div>
              <div className="stat-value" style={{fontSize:'1.5rem'}}>{fmtCurr(total)}</div>
              <div className="stat-label">Pending Amount</div>
            </div>
          </div>
          <div className="payment-summary-card payment-summary-card-safe">
            <span className="payment-summary-icon" aria-hidden="true">🛡️</span>
            <div>
              <div className="stat-value" style={{fontSize:'1.5rem'}}>Review</div>
              <div className="stat-label">Bank-slip verification queue</div>
            </div>
          </div>
        </div>
        {notice&&<div className="alert alert-info">{notice}</div>}
        {loading?<div style={{textAlign:'center',padding:'3rem',color:'var(--text3)'}}>Loading payment slips...</div>
        :payments.length===0?<div className="card"><div className="empty-state"><h3>No pending payments</h3><p>Uploaded payment slips will appear here for approval.</p></div></div>
        :<div className="table-wrap payment-approval-table"><table><thead><tr><th>Session</th><th>Student</th><th>Tutor</th><th>Slip</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>
          {payments.map(p=><tr key={p.id}>
            <td><strong>{p.subject}</strong><div className="payment-row-meta">{p.sessionDate} · {p.startTime}-{p.endTime}</div></td>
            <td>{p.studentName}</td>
            <td>{p.tutorName}</td>
            <td><strong>{p.slipFileName||'Uploaded slip'}</strong><div className="payment-row-meta">{fmtDate(p.slipUploadedAt)}</div><button className="btn btn-secondary btn-sm payment-slip-btn" onClick={()=>viewSlip(p)}><span aria-hidden="true">↗</span> View Slip</button></td>
            <td><strong>{fmtCurr(p.amount)}</strong></td>
            <td><StatusBadge status={p.status}/></td>
            <td><div className="payment-action-buttons"><button className="btn btn-success btn-sm" disabled={busyId===p.id} onClick={()=>approve(p)}><span aria-hidden="true">✓</span>{busyId===p.id?'Saving...':'Approve'}</button><button className="btn btn-danger btn-sm" disabled={busyId===p.id} onClick={()=>reject(p)}><span aria-hidden="true">×</span>Reject</button></div></td>
          </tr>)}
        </tbody></table></div>}
      </div>
      {preview&&<div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&closePreview()}><div className="modal" style={{maxWidth:880}}>
        <div className="modal-header"><p className="eyebrow" style={{color:'var(--brand)'}}>Payment Slip</p><h2 style={{fontSize:'1.15rem'}}>{preview.name}</h2></div>
        <div className="modal-body">
          {preview.type.startsWith('image/')?<img src={preview.url} alt={preview.name} style={{width:'100%',maxHeight:'70vh',objectFit:'contain',borderRadius:'var(--radius-sm)',background:'var(--bg)'}}/>:<iframe src={preview.url} title={preview.name} style={{width:'100%',height:'70vh',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)'}}/>}
        </div>
        <div className="modal-footer"><button className="btn btn-secondary btn-sm" onClick={closePreview}>Close</button></div>
      </div></div>}
    </div>
  );
}
