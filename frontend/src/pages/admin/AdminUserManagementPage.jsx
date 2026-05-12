import {useEffect,useState} from 'react';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../services/api';

const fmtCurr=n=>new Intl.NumberFormat('en',{style:'currency',currency:'USD'}).format(Number(n)||0);
const DEMO={
  students:[
    {id:'s1',name:'Jordan Kim',email:'jordan@student.test',status:'Active',sessionCount:5,completedSessions:3,totalSpent:145},
    {id:'s2',name:'Lee Park',email:'lee@student.test',status:'Active',sessionCount:2,completedSessions:1,totalSpent:55},
  ],
  tutors:[
    {id:'t1',name:'Sarah Johnson',email:'sarah@tutor.test',status:'Active',hourlyRate:45,subjectCount:3,slotCount:8,sessionCount:7,completedSessions:4,totalEarned:180},
    {id:'t2',name:'David Kumar',email:'david@tutor.test',status:'Suspended',hourlyRate:55,subjectCount:2,slotCount:5,sessionCount:3,completedSessions:2,totalEarned:110},
  ],
};
const calcStats=(students,tutors)=>({
  students:students.length,
  tutors:tutors.length,
  suspendedTutors:tutors.filter(t=>t.status==='Suspended').length,
  totalStudentSpend:students.reduce((s,x)=>s+(Number(x.totalSpent)||0),0),
  totalTutorEarnings:tutors.reduce((s,x)=>s+(Number(x.totalEarned)||0),0),
});
const normalize=data=>{
  const students=Array.isArray(data?.students)?data.students:Array.isArray(data)?data:DEMO.students;
  const tutors=Array.isArray(data?.tutors)?data.tutors:DEMO.tutors;
  return {students,tutors,stats:data?.stats||calcStats(students,tutors)};
};

export default function AdminUserManagementPage(){
  const [adminData,setAdminData]=useState({students:[],tutors:[],stats:calcStats([],[])});
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState('Tutors');
  const [busyId,setBusyId]=useState(null);
  const [notice,setNotice]=useState('');
  const {students,tutors}=adminData;
  const stats=adminData.stats||calcStats(students,tutors);

  useEffect(()=>{api.get('/admin/users').then(r=>setAdminData(normalize(r.data))).catch(()=>setAdminData(normalize(DEMO))).finally(()=>setLoading(false));},[]);

  const updateTutor=(tutor,updated)=>{
    setAdminData(current=>{
      const nextTutors=current.tutors.map(t=>t.id===tutor.id?{...t,...updated}:t);
      return {...current,tutors:nextTutors,stats:calcStats(current.students,nextTutors)};
    });
  };
  const toggleTutor=async(tutor)=>{
    const nextStatus=tutor.status==='Suspended'?'Active':'Suspended';
    const endpoint=nextStatus==='Suspended'?`/admin/tutors/${tutor.id}/suspend`:`/admin/tutors/${tutor.id}/activate`;
    setBusyId(tutor.id); setNotice('');
    try{
      const res=await api.patch(endpoint);
      updateTutor(tutor,res.data?.tutor||{status:nextStatus});
      setNotice(res.data?.message||`Tutor ${nextStatus.toLowerCase()}.`);
    }catch(error){
      if(error.response){
        setNotice(error.response.data?.error||'Could not update tutor status.');
      }else{
        updateTutor(tutor,{status:nextStatus});
        setNotice(`Demo mode: tutor marked ${nextStatus.toLowerCase()}.`);
      }
    }finally{setBusyId(null);}
  };

  return(
    <div className="page">
      <div className="page-header"><div className="container"><p className="eyebrow">Admin Panel</p><h1>User Management</h1><p>Manage platform students and tutors, review spending, and suspend tutors when needed.</p></div></div>
      <div className="container section">
        <div className="stats-row">
          {[{v:stats.students,l:'Students'},{v:stats.tutors,l:'Tutors'},{v:fmtCurr(stats.totalStudentSpend),l:'Student Spend'},{v:fmtCurr(stats.totalTutorEarnings),l:'Tutor Earnings'},{v:stats.suspendedTutors,l:'Suspended Tutors'}].map(s=><div key={s.l} className="stat-card"><div className="stat-value" style={{fontSize:'1.5rem'}}>{s.v}</div><div className="stat-label">{s.l}</div></div>)}
        </div>
        {notice&&<div className="alert alert-info">{notice}</div>}
        <div className="section-header">
          <h2 className="section-title">{tab}</h2>
          <div className="tabs" style={{width:260}}>
            {['Tutors','Students'].map(t=><button key={t} className={`tab${tab===t?' active':''}`} onClick={()=>setTab(t)}>{t}</button>)}
          </div>
        </div>
        {loading?<div style={{textAlign:'center',padding:'3rem',color:'var(--text3)'}}>Loading users...</div>
        :tab==='Tutors'?(
          tutors.length===0?<div className="card"><div className="empty-state"><h3>No tutors</h3><p>Tutor accounts will appear here.</p></div></div>
          :<div className="table-wrap"><table><thead><tr><th>Tutor</th><th>Subjects</th><th>Sessions</th><th>Earned</th><th>Status</th><th>Action</th></tr></thead><tbody>
            {tutors.map(t=><tr key={t.id}>
              <td><strong>{t.name}</strong><div style={{fontSize:'.75rem',color:'var(--text3)'}}>{t.email}</div></td>
              <td>{t.subjectCount||0}<div style={{fontSize:'.75rem',color:'var(--text3)'}}>{t.slotCount||0} slots</div></td>
              <td>{t.sessionCount||0}<div style={{fontSize:'.75rem',color:'var(--text3)'}}>{t.completedSessions||0} completed</div></td>
              <td><strong>{fmtCurr(t.totalEarned)}</strong><div style={{fontSize:'.75rem',color:'var(--text3)'}}>{fmtCurr(t.hourlyRate)}/hr</div></td>
              <td><StatusBadge status={t.status||'Active'}/></td>
              <td><button className={t.status==='Suspended'?'btn btn-secondary btn-sm':'btn btn-danger btn-sm'} disabled={busyId===t.id} onClick={()=>toggleTutor(t)}>{busyId===t.id?'Saving...':t.status==='Suspended'?'Reactivate':'Suspend'}</button></td>
            </tr>)}
          </tbody></table></div>
        ):(
          students.length===0?<div className="card"><div className="empty-state"><h3>No students</h3><p>Student accounts will appear here.</p></div></div>
          :<div className="table-wrap"><table><thead><tr><th>Student</th><th>Sessions</th><th>Total Spent</th><th>Status</th></tr></thead><tbody>
            {students.map(s=><tr key={s.id}>
              <td><strong>{s.name}</strong><div style={{fontSize:'.75rem',color:'var(--text3)'}}>{s.email}</div></td>
              <td>{s.sessionCount||0}<div style={{fontSize:'.75rem',color:'var(--text3)'}}>{s.completedSessions||0} completed</div></td>
              <td><strong>{fmtCurr(s.totalSpent)}</strong></td>
              <td><StatusBadge status={s.status||'Active'}/></td>
            </tr>)}
          </tbody></table></div>
        )}
      </div>
    </div>
  );
}
