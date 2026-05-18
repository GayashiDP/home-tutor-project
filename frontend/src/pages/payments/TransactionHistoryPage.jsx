import {useState,useEffect} from 'react';import StatusBadge from '../../components/common/StatusBadge';import api from '../../services/api';
const fmtCurr=n=>new Intl.NumberFormat('en',{style:'currency',currency:'USD'}).format(Number(n)||0);
const fmtDate=v=>v?new Date(v).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'}):'Pending';
const DEMO=[{id:'t1',receiptId:'RCP-2026-0043',subject:'Python',tutorName:'David Kumar',studentName:'Jordan Kim',sessionDate:'2026-04-20',startTime:'09:00',endTime:'10:00',amount:55,displayStatus:'Paid',paidAt:'2026-04-20T09:30:00Z'},{id:'t2',receiptId:'RCP-2026-0039',subject:'Algebra',tutorName:'Sarah Johnson',studentName:'Jordan Kim',sessionDate:'2026-03-18',startTime:'10:00',endTime:'11:00',amount:45,displayStatus:'Paid',paidAt:'2026-03-18T10:45:00Z'}];
const normalizeTransactions=data=>Array.isArray(data)?data:Array.isArray(data?.transactions)?data.transactions:[];
const safeFileName=v=>String(v||'receipt').replace(/[^a-z0-9._-]+/gi,'-');
const receiptText=t=>[
  'HOME TUTOR SYSTEM',
  'Payment Receipt',
  '',
  `Receipt: ${t.receiptNo||t.receiptId||t.id}`,
  `Student: ${t.studentName||'-'}`,
  `Tutor: ${t.tutorName||'-'}`,
  `Subject: ${t.subject||'-'}`,
  `Session: ${t.sessionDate||'-'} ${t.startTime||''}-${t.endTime||''}`,
  `Amount: ${fmtCurr(t.amount)}`,
  `Status: ${t.displayStatus||t.status||'-'}`,
  `Issued: ${fmtDate(t.issuedAt||t.paidAt)}`,
].join('\n');
export default function TransactionHistoryPage(){
  const [txns,setTxns]=useState([]); const [loading,setLoading]=useState(true); const [expandedId,setExpandedId]=useState(null); const [notice,setNotice]=useState(''); const [downloadingId,setDownloadingId]=useState(null); const [demoMode,setDemoMode]=useState(false);
  useEffect(()=>{api.get('/payments/history').then(r=>{setTxns(normalizeTransactions(r.data));setDemoMode(false);}).catch(()=>{setTxns(DEMO);setDemoMode(true);setNotice('Database is currently unavailable, so demo transactions are shown.');}).finally(()=>setLoading(false));}, []);
  const total=txns.reduce((s,t)=>s+(Number(t.amount)||0),0);
  const downloadReceipt=async(t)=>{
    const receiptKey=t.receiptId||t.id;
    if(!receiptKey){setNotice('Receipt is not available yet.');return;}
    setDownloadingId(t.id); setNotice('');
    if(demoMode){
      const blob=new Blob([receiptText(t)],{type:'text/plain;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;
      a.download=`${safeFileName(t.receiptNo||t.receiptId||t.id)}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setDownloadingId(null);
      return;
    }
    try{
      const r=await api.get(`/payments/receipt/${receiptKey}`,{responseType:'blob'});
      const url=URL.createObjectURL(r.data);
      const a=document.createElement('a');
      const receiptName=t.receiptNo||t.receiptId||t.id;
      a.href=url;
      a.download=`${safeFileName(receiptName)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }catch(error){
      setNotice(error.response?.data?.error||'Could not download receipt. Receipts are available after admin approves payment.');
    }finally{
      setDownloadingId(null);
    }
  };
  return(
    <div className="page">
      <div className="page-header"><div className="container"><p className="eyebrow">Financial Records</p><h1>Transaction History</h1><p>View all your tutoring session payments and download receipts.</p></div></div>
      <div className="container section">
        {notice&&<div className="alert alert-info">{notice}</div>}
        <div className="stats-row">{[{v:txns.length,l:'Total Payments'},{v:fmtCurr(total),l:'Total Spent'},{v:txns.filter(t=>t.displayStatus==='Paid').length,l:'Paid'}].map(s=><div key={s.l} className="stat-card"><div className="stat-value" style={{fontSize:'1.5rem'}}>{s.v}</div><div className="stat-label">{s.l}</div></div>)}</div>
        {loading?<div style={{textAlign:'center',padding:'3rem',color:'var(--text3)'}}>Loading transactions…</div>
        :txns.length===0?<div className="card"><div className="empty-state"><h3>No transactions yet</h3><p>Paid sessions will appear here.</p></div></div>
        :<div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          {txns.map(t=><div key={t.id} className="card"><div className="card-body">
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'1rem'}}>
              <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                <div className="avatar" style={{background:'var(--success-light)',color:'var(--success)'}}>💳</div>
                <div><strong style={{display:'block',marginBottom:'.2rem'}}>{t.subject} with {t.tutorName}</strong><span style={{fontSize:'.8rem',color:'var(--text3)'}}>{t.sessionDate} · {t.startTime}–{t.endTime}</span><div style={{marginTop:'.3rem'}}><StatusBadge status={t.displayStatus}/></div></div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div className="receipt-total">{fmtCurr(t.amount)}</div>
                <div style={{fontSize:'.73rem',color:'var(--text3)',marginTop:'.2rem'}}>Paid {fmtDate(t.paidAt)}</div>
                <button className="btn btn-secondary btn-sm" style={{marginTop:'.5rem'}} onClick={()=>setExpandedId(expandedId===t.id?null:t.id)}>{expandedId===t.id?'Hide Receipt':'View Receipt'}</button>
              </div>
            </div>
            {expandedId===t.id&&<div style={{marginTop:'1rem',paddingTop:'1rem',borderTop:'1px solid var(--border)'}}>
              <div className="receipt-card">
                <div style={{fontWeight:700,marginBottom:'.7rem',fontSize:'.8rem',color:'var(--brand)'}}>🧾 PAYMENT RECEIPT</div>
                {[['Receipt No',t.receiptNo||t.receiptId],['Student',t.studentName],['Tutor',t.tutorName],['Subject',t.subject],['Session Date',t.sessionDate],['Duration',`${t.startTime}–${t.endTime}`],['Amount',fmtCurr(t.amount)],['Status',t.displayStatus],['Issued',fmtDate(t.issuedAt||t.paidAt)]].map(([l,v])=><div key={l} className="receipt-row"><span style={{color:'var(--text3)'}}>{l}</span><strong>{v||'-'}</strong></div>)}
              </div>
              <button className="btn btn-secondary btn-sm" style={{marginTop:'.75rem'}} disabled={downloadingId===t.id||t.displayStatus!=='Paid'} onClick={()=>downloadReceipt(t)}>{downloadingId===t.id?'Downloading…':'⬇ Download PDF Receipt'}</button>
            </div>}
          </div></div>)}
        </div>}
      </div>
    </div>
  );
}
