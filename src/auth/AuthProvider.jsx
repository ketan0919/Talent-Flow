// src/auth/AuthProvider.jsx
import React, { createContext, useContext, useState } from 'react';

const AuthCtx = createContext(null);

function readSaved() {
  try {
    const raw = localStorage.getItem('tf_auth');
    if (!raw) return { user: null, token: null };
    const j = JSON.parse(raw);
    return { user: j.user || null, token: j.token || null };
  } catch {
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }) {
  // Read synchronously so we don't flash-redirect before we know the user
  const saved = readSaved();
  const [user, setUser] = useState(saved.user);
  const [token, setToken] = useState(saved.token);
  const [ready] = useState(true); // already hydrated synchronously

  function persist(u, t) {
    localStorage.setItem('tf_auth', JSON.stringify({ user: u, token: t }));
  }

  async function login(email, password) {
    // ensure MSW is up before first fetch
    try {
      if (window.__mswReady && typeof window.__mswReady.then === 'function') {
        await window.__mswReady;
      }
    } catch {}
    let res;
    try {
      res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
    } catch {
      throw new Error('Network error. Is the dev server running?');
    }
    if (!res.ok) {
      let msg = 'Login failed';
      try { const j = await res.json(); msg = j.message || msg; } catch {}
      throw new Error(msg);
    }
    const j = await res.json();
    setUser(j.user); setToken(j.token); persist(j.user, j.token);
  }

  function logout() {
    setUser(null); setToken(null);
    localStorage.removeItem('tf_auth');
  }

  return (
    <AuthCtx.Provider value={{ user, token, ready, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}