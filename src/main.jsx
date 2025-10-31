// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import './styles.css';
import JobsPage from './features/jobs/JobsPage.jsx';
import JobDetails from './features/jobs/JobDetails.jsx';
import Login from './pages/Login.jsx';
import { AuthProvider, useAuth } from './auth/AuthProvider.jsx';
import CandidatesPage from './features/candidates/CandidatesPage.jsx';
import CandidateProfile from './features/candidates/CandidateProfile.jsx';
import KanbanBoard from './features/candidates/KanbanBoard.jsx';
import AssessmentsPage from './features/assessments/AssessmentsPage.jsx';

// Start MSW asynchronously and expose readiness
window.__mswReady = (async () => {
  try {
    const { worker } = await import('./mocks/browser.js');
    await worker.start({ onUnhandledRequest: 'bypass' });
    console.info('[MSW] ready');
    return true;
  } catch (e) {
    console.warn('[MSW] failed to start, continuing without mocks:', e);
    return false;
  }
})();

function Protected({ children }) {
    const { user, ready } = useAuth();
    if (!ready) return <div className="section">Loading…</div>;
    return user ? children : <Navigate to="/login" replace />;
  }
function HeaderBar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <b>Mini Hiring Platform</b>
      {user && (
        <div className="row">
          <span className="badge">{user.name} · {user.role}</span>
          <button className="btn" onClick={() => { logout(); nav('/login', { replace: true }); }}>Logout</button>
        </div>
      )}
    </header>
  );
}
function Shell() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">TalentFlow</div>
        <nav className="nav">
          <NavLink to="/jobs">Jobs</NavLink>
          <NavLink to="/candidates">Candidates</NavLink>
          <NavLink to="/assessments">Assessments</NavLink>
        </nav>
      </aside>
      <main>
        <HeaderBar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/jobs" replace />} />
            <Route path="/jobs" element={<Protected><JobsPage /></Protected>} />
            <Route path="/jobs/:jobId" element={<Protected><JobDetails /></Protected>} />

            <Route path="/candidates" element={<Protected><CandidatesPage /></Protected>} />
            <Route path="/candidates/:id" element={<Protected><CandidateProfile /></Protected>} />
            <Route path="/candidates/board" element={<Protected><KanbanBoard /></Protected>} />

            <Route path="/assessments" element={<Protected><AssessmentsPage /></Protected>} />
            <Route path="/assessments/:jobId" element={<Protected><AssessmentsPage /></Protected>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<Shell />} />
      </Routes>
    </AuthProvider>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);