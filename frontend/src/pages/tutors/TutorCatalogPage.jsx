import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Stars from '../../components/common/Stars';
import api from '../../services/api';

const DEMO = [
  {id:'1',name:'Sarah Johnson',bio:'Mathematics expert with 10+ years of experience. Specialized in algebra, calculus, and statistics for all grade levels.',hourly_rate:45,rating:4.9,reviewCount:248,subjects:[{id:'s1',name:'Algebra'},{id:'s2',name:'Calculus'},{id:'s3',name:'Statistics'}]},
  {id:'2',name:'Mike Chen',bio:'English teacher and TOEFL specialist. Improve writing, speaking, and reading comprehension skills.',hourly_rate:40,rating:4.8,reviewCount:156,subjects:[{id:'s4',name:'English'},{id:'s5',name:'TOEFL Prep'},{id:'s6',name:'Creative Writing'}]},
  {id:'3',name:'Emma Wilson',bio:'Science tutor passionate about making complex concepts easy through real-world examples and experiments.',hourly_rate:50,rating:4.95,reviewCount:312,subjects:[{id:'s7',name:'Physics'},{id:'s8',name:'Chemistry'},{id:'s9',name:'Biology'}]},
  {id:'4',name:'David Kumar',bio:'Computer Science mentor helping students master programming, data structures, and software engineering.',hourly_rate:55,rating:4.7,reviewCount:189,subjects:[{id:'s10',name:'Python'},{id:'s11',name:'Data Structures'},{id:'s12',name:'Web Dev'}]},
  {id:'5',name:'Priya Nair',bio:'Languages & humanities specialist with experience teaching students from diverse backgrounds.',hourly_rate:38,rating:4.75,reviewCount:104,subjects:[{id:'s13',name:'French'},{id:'s14',name:'History'}]},
  {id:'6',name:'Omar Hassan',bio:'STEM educator and former university lecturer. Specializes in exam preparation and bridging foundational gaps.',hourly_rate:48,rating:4.85,reviewCount:231,subjects:[{id:'s15',name:'Mathematics'},{id:'s16',name:'Further Maths'}]},
];

const getSubjectName = subject => typeof subject === 'string' ? subject : subject?.name;
const normalizeTutorsResponse = data => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.tutors)) return data.tutors;
  return DEMO;
};
const displayRating=tutor=>{
  const rating=Number(tutor?.rating)||0;
  return rating>0?rating.toFixed(1):'New';
};

export default function TutorCatalogPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState(searchParams.get('subject') || '');

  useEffect(() => {
    api.get('/tutors').then(r => setTutors(normalizeTutorsResponse(r.data))).catch(() => setTutors(DEMO)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSubject(searchParams.get('subject') || '');
  }, [searchParams]);

  const changeSubject = value => {
    setSubject(value);
    setSearchParams(value ? { subject: value } : {});
  };

  const allSubjects = [...new Set(tutors.flatMap(t => (t.subjects||[]).map(getSubjectName).filter(Boolean)))].sort();
  const filtered = tutors.filter(t => {
    const nm = !search || (t.name||'').toLowerCase().includes(search.toLowerCase()) || (t.bio||'').toLowerCase().includes(search.toLowerCase());
    const sub = !subject || (t.subjects||[]).some(s=>getSubjectName(s)===subject);
    return nm && sub;
  });

  return (
    <div className="page">
      <div className="page-header"><div className="container">
        <p className="eyebrow">Expert Educators</p>
        <h1>Browse Tutors</h1>
        <p>Find your perfect tutor from our curated network of qualified educators across all subjects.</p>
      </div></div>
      <div className="container section">
        <div className="search-bar">
          <span style={{fontSize:'1rem'}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or keyword…"/>
          <div className="search-divider"/>
          <select value={subject} onChange={e=>changeSubject(e.target.value)}>
            <option value="">All Subjects</option>
            {allSubjects.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          {(search||subject)&&<button className="btn btn-secondary btn-sm" onClick={()=>{setSearch('');changeSubject('');}}>Clear</button>}
        </div>
        <p style={{color:'var(--text2)',fontSize:'.85rem',marginBottom:'1rem'}}>{loading?'Loading tutors…':`${filtered.length} tutor${filtered.length!==1?'s':''} found`}</p>
        {loading ? <div style={{textAlign:'center',padding:'3rem',color:'var(--text3)'}}>Loading tutors…</div>
        : filtered.length===0 ? <div className="card"><div className="empty-state"><h3>No tutors found</h3><p>Try a different search or clear filters.</p></div></div>
        : <div className="tutor-grid">
          {filtered.map(t=>{
            const rating=Number(t.rating)||0;
            const reviewCount=Number(t.reviewCount)||0;
            const latest=t.latestReview||{};
            return (
            <div key={t.id} className="tutor-card" onClick={()=>navigate(`/tutors/${t.id}`)}>
              <div className="tutor-card-header">
                <div className="tutor-avatar">{(t.name||'T').charAt(0)}</div>
                <div style={{flex:1}}>
                  <h3>{t.name}</h3>
                  <div className="tutor-rating"><Stars rating={rating} size={12}/><span style={{color:'var(--text2)'}}>{displayRating(t)} ({reviewCount} review{reviewCount!==1?'s':''})</span></div>
                </div>
              </div>
              <div className="tutor-card-body">
                <p className="tutor-bio">{t.bio}</p>
                <div className="subject-pills">{(t.subjects||[]).map(s=><span key={s.id||getSubjectName(s)} className="subject-pill">{getSubjectName(s)}</span>)}</div>
                {latest.comment&&<div className="tutor-feedback">
                  <div className="tutor-feedback-top"><Stars rating={Number(latest.rating)||rating} size={10}/><span>{latest.studentName||'Student'}</span></div>
                  <p>{latest.comment}</p>
                </div>}
              </div>
              <div className="tutor-card-footer">
                <div className="hourly-rate">${t.hourly_rate} <span>/ hour</span></div>
                <button className="btn btn-primary btn-sm" onClick={e=>{e.stopPropagation();navigate(`/tutors/${t.id}`);}}>View Profile</button>
              </div>
            </div>
          );})}
        </div>}
      </div>
    </div>
  );
}
