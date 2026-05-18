import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import BrandLogo from '../../components/BrandLogo';

export default function SignupPage() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('Student');
  const [errorMsg, setErrorMsg] = useState('');
  const { register, handleSubmit, setValue, watch, formState:{ errors, isSubmitting } } = useForm({ defaultValues:{ role:'Student' } });
  const password = watch('password');
  const pick = (r) => { setRole(r); setErrorMsg(''); setValue('role', r); };
  const onSubmit = async (data) => {
    try {
      setErrorMsg('');
      await authRegister(data);
      navigate('/dashboard');
    } catch (error) {
      setErrorMsg(error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || 'Could not create your account.');
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-logo"><BrandLogo className="auth-logo-image" /></div>
          <p style={{color:'var(--text3)',fontSize:'.82rem',marginTop:'.4rem'}}>Create your free account today</p>
        </div>
        <div className="auth-card-body">
          <p style={{fontSize:'.78rem',color:'var(--text3)',marginBottom:'.5rem'}}>I want to join as a:</p>
          <div className="role-picker">
            {['Student','Tutor'].map(r=><button key={r} type="button" className={`role-btn${role===r?' selected':''}`} onClick={()=>pick(r)}>{r}</button>)}
          </div>
          {errorMsg&&<div className="alert alert-danger">{errorMsg}</div>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="field"><label>Full name</label><input {...register('fullName',{required:true})} placeholder="e.g. Jordan Kim"/>{errors.fullName&&<p className="field-error">Name is required</p>}</div>
            <div className="field"><label>Email</label><input {...register('email',{required:'Email is required'})} type="email" placeholder="you@example.com"/>{errors.email&&<p className="field-error">{errors.email.message}</p>}</div>
            <div className="field"><label>Password</label><input {...register('password',{required:'Password is required',minLength:{value:8,message:'Password must be at least 8 characters'}})} type="password" placeholder="Min 8 characters"/>{errors.password&&<p className="field-error">{errors.password.message}</p>}</div>
            <div className="field"><label>Confirm password</label><input {...register('confirmPassword',{required:'Confirm password is required',validate:value=>value===password||'Passwords do not match'})} type="password" placeholder="Re-enter password"/>{errors.confirmPassword&&<p className="field-error">{errors.confirmPassword.message}</p>}</div>
            <input type="hidden" {...register('role')}/>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isSubmitting}>{isSubmitting?'Creating…':`Create ${role} Account`}</button>
          </form>
          <p style={{textAlign:'center',marginTop:'1.25rem',fontSize:'.85rem',color:'var(--text2)'}}>Already have an account? <Link to="/login" style={{color:'var(--brand-mid)',fontWeight:500}}>Log in</Link></p>
        </div>
      </div>
    </div>
  );
}
