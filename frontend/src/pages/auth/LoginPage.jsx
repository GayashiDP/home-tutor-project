import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import BrandLogo from '../../components/BrandLogo';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('Student');
  const [errorMsg, setErrorMsg] = useState('');
  const { register, handleSubmit, setValue, formState:{ errors, isSubmitting } } = useForm({
    defaultValues: { email:'student@hometutor.lk', password:'password123' }
  });
  const pick = (r) => { setRole(r); setErrorMsg(''); setValue('email', `${r.toLowerCase()}@hometutor.lk`); };
  const onSubmit = async (data) => { try { setErrorMsg(''); await login(data); navigate('/dashboard'); } catch (error) { setErrorMsg(error.response?.data?.error||'Could not sign in.'); } };
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-logo"><BrandLogo className="auth-logo-image" /></div>
          <p style={{color:'var(--text3)',fontSize:'.82rem',marginTop:'.4rem'}}>Welcome back — sign in to continue</p>
        </div>
        <div className="auth-card-body">
          <p style={{fontSize:'.78rem',color:'var(--text3)',marginBottom:'.5rem'}}>Quick demo — log in as:</p>
          <div className="role-picker">
            {['Student','Tutor','Admin'].map(r => (
              <button key={r} type="button" className={`role-btn${role===r?' selected':''}`} onClick={()=>pick(r)}>{r}</button>
            ))}
          </div>
          {errorMsg&&<div className="alert alert-danger">{errorMsg}</div>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="field"><label>Email address</label><input {...register('email',{required:true})} type="email"/>{errors.email&&<p className="field-error">Email is required</p>}</div>
            <div className="field"><label>Password</label><input {...register('password',{required:true})} type="password"/>{errors.password&&<p className="field-error">Password is required</p>}</div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isSubmitting}>{isSubmitting?'Signing in…':`Sign In as ${role}`}</button>
          </form>
          <p style={{textAlign:'center',marginTop:'1.25rem',fontSize:'.85rem',color:'var(--text2)'}}>No account? <Link to="/signup" style={{color:'var(--brand-mid)',fontWeight:500}}>Sign up free</Link></p>
        </div>
      </div>
    </div>
  );
}
