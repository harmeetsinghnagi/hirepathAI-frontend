// App.jsx
// Controls which page user sees based on the URL
// Every new page we create must be added here as a Route

import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Public pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

// Dashboard
import Dashboard from './pages/Dashboard'

// Resume CRUD pages
import ResumeList from './pages/ResumeList'
import ResumeAdd from './pages/ResumeAdd'
import Results from './pages/Results'
import CVRewrite from './pages/CVRewrite'
import Profile from './pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── PUBLIC PAGES — anyone can visit ─────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* ── DASHBOARD ───────────────────────────────────────────────── */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* ── RESUME CRUD ─────────────────────────────────────────────── */}
        {/* List all resumes */}
        <Route path="/resumes" element={<ResumeList />} />
        {/* Add new resume */}
        <Route path="/resumes/add" element={<ResumeAdd />} />

        {/* ── RESULTS PAGE FROM DASHBAORD───────────────────────────────────────── */}
        <Route path="/results" element={<Results />} />
        {/* ── CV rewrite─────────────────────────────────────────────── */}
        <Route path="/cv-rewrite" element={<CVRewrite />} />
        {/* ── Profile ─────────────────────────────────────────────── */}
        <Route path="/profile" element={<Profile />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App