import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import '../styles.css';

export default function Login(){
  const nav=useNavigate(); const { login } = useAuth();
  const [email,setEmail]=useState('admin@talentflow.dev');
  const [password,setPassword]=useState('Admin#2025');
  const [err,setErr]=useState(''); const [loading,setLoading]=useState(false);

  async function submit(e){
    e.preventDefault(); setErr(''); setLoading(true);
    try{ await login(email,password); nav('/jobs',{ replace:true }); } 
    catch(e){ setErr(e.message); } 
    finally{ setLoading(false); }
  }

  return (
    <div style={{ minHeight:'100vh', display:'grid', placeItems:'center', background:'var(--bg)' }}>
      <form className="section" style={{ width:'min(420px,92vw)' }} onSubmit={submit}>
        <h3 style={{ marginTop:0 }}>Sign in</h3>
        <div className="field"><label>Email</label><input className="input" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div className="field"><label>Password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        {err && <div style={{ color:'#b91c1c', fontSize:13, marginBottom:8 }}>{err}</div>}
        <button className="btn primary" style={{ width:'100%' }} disabled={loading}>{loading?'Signing in…':'Sign in'}</button>
      </form>
    </div>
  );
}