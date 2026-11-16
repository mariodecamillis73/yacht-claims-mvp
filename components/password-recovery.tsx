"use client";
import {useEffect,useState} from 'react';import Link from 'next/link';
import {useLanguage} from './language-provider';import {PASSWORD_HELP} from '@/lib/password-policy';
export default function PasswordRecovery({reset=false}:{reset?:boolean}){
 const {tr}=useLanguage();const [token,setToken]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirmPassword,setConfirmPassword]=useState(''),[message,setMessage]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState(false);
 useEffect(()=>{if(reset){const t=new URLSearchParams(window.location.hash.slice(1)).get('token')||'';setToken(t);window.history.replaceState(null,'',window.location.pathname);if(!t)setError('Reset link is invalid or expired. Request a new link.')}},[reset]);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');setMessage('');try{
  const response=await fetch('/api/auth/'+(reset?'reset-password':'forgot-password'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(reset?{token,password,confirmPassword}:{email})});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'Unable to complete request');setMessage(data.message);setDone(true);setPassword('');setConfirmPassword('');
 }catch(e){setError(e instanceof Error?e.message:'Unable to complete request')}finally{setBusy(false)}}
 return <main className="container"><div className="login-box"><header style={{textAlign:'center'}}><h1>YY ASM</h1><p>YYachts After Sales Management</p></header><h2>{tr(reset?'Choose a new password':'Forgot password?')}</h2>
 {!done&&<form className="form-grid" onSubmit={submit}>{reset?<><p>{tr(PASSWORD_HELP)}</p><label>{tr('New password')}<input className="input" type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={password} onChange={e=>setPassword(e.target.value)}/></label><label>{tr('Confirm password')}<input className="input" type="password" autoComplete="new-password" required value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/></label></>:<label>{tr('Email')}<input className="input" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>}
 <button className="button" disabled={busy||(reset&&!token)}>{tr(busy?'Please wait…':reset?'Save new password':'Send reset link')}</button></form>}
 {error&&<p role="alert">{tr(error)}</p>}{message&&<p role="status">{tr(message)}</p>}<p><Link href="/login">{tr('Back to sign in')}</Link></p>{reset&&<Link href="/forgot-password">{tr('Request a new link')}</Link>}</div></main>;
}
