// src/auth/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
const AuthCtx = createContext(null);

export function AuthProvider({ children }){
  const [user,setUser]=useState(null);
  const [token,setToken]=useState(null);

  useEffect(()=>{ 
    const saved=localStorage.getItem('tf_auth'); 
    if(saved){ try{ const j=JSON.parse(saved); setUser(j.user); setToken(j.token);}catch{} }
  },[]);

  function persist(u,t){ localStorage.setItem('tf_auth', JSON.stringify({ user:u, token:t })); }

  async function login(email,password){
    // Ensure MSW worker is started before the first fetch
    try {
      if (window.__mswReady && typeof window.__mswReady.then === 'function') {
        await window.__mswReady;
      }
    } catch { /* ignore */ }

    let res;
    try {
      res = await fetch('/auth/login', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email,password })
      });
    } catch (e) {
      throw new Error('Network error. Check that the app is served via Vite and MSW worker is active.');
    }

    if (!res.ok) {
      let msg = 'Login failed';
      try { const j = await res.json(); msg = j.message || msg; } catch {}
      throw new Error(msg);
    }

    const j = await res.json();
    setUser(j.user); setToken(j.token); persist(j.user,j.token);
  }

  function logout(){ setUser(null); setToken(null); localStorage.removeItem('tf_auth'); }

  return <AuthCtx.Provider value={{ user, token, login, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth(){ return useContext(AuthCtx); }