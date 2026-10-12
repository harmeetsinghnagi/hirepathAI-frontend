// Dashboard.jsx — fully responsive
// Uses sessionStorage to show name instantly
// Layout (header + sidebar) always stays visible
// On mobile: full width, no sidebar offset

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import { Sparkles } from 'lucide-react'

function Dashboard() {

  const navigate = useNavigate()
  const [userName, setUserName] = useState(sessionStorage.getItem('hp_user_name') || '')
  const [loading, setLoading] = useState(true)
  const [jobDescription, setJobDescription] = useState('')
  const [resumes, setResumes] = useState([])
  const [selectedResume, setSelectedResume] = useState(null)
  const [recentJDs] = useState([])

  useEffect(() => { getUserDetails() }, [])

  const getUserDetails = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }
    const name = user.user_metadata?.full_name || user.email
    setUserName(name)
    sessionStorage.setItem('hp_user_name', name)
    sessionStorage.setItem('hp_user_email', user.email || '')
    const { data: resumeData } = await supabase
      .from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setResumes(resumeData || [])
    setLoading(false)
  }

  const handleGetResults = () => {
    if (!jobDescription.trim()) { toast.error('Please paste a job description first'); return }
    if (!selectedResume) { toast.error('Please select a CV or upload a new one'); return }
    const words = jobDescription.trim().split(/\s+/)
    const uniqueWords = new Set(words.map(w => w.toLowerCase()))

    if (jobDescription.trim().length < 100) {
      toast.error('Job description is too short. Please paste the full description.')
      return
    }
    if (words.length < 20) {
      toast.error('Please paste a complete job description.')
      return
    }
    if (uniqueWords.size < 10) {
      toast.error('This does not look like a real job description.')
      return
    }
    navigate('/results', { state: { jobDescription, selectedResume } })
  }

  return (
    <Layout userName={userName} resumes={resumes} recentJDs={recentJDs}>

      <style>{`
        .db-wrap { padding: 20px; }
        .db-card { background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 4px rgba(0,0,0,0.05); overflow: hidden; }
        .db-section { padding: 20px; border-bottom: 1px solid #f3f4f6; }
        .db-section-last { padding: 20px; background: #fafafa; }
        @media (max-width: 768px) {
          .db-wrap { padding: 16px; }
          .db-section { padding: 16px; }
          .db-section-last { padding: 16px; }
        }
      `}</style>

      <div className="db-wrap">

        {/* Page title */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1f2e', margin: 0 }}>Dashboard</h1>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
            Welcome back, {userName.split(' ')[0] || 'there'} 👋
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>⚡</div>
              <p style={{ color: '#9CA3AF', fontSize: 14 }}>Loading...</p>
            </div>
          </div>
        ) : (

          <div className="db-card">

            {/* Card header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1f2e' }}>Start a New Application</span>
            </div>

            {/* Step 1 */}
            <div className="db-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 26, height: 26, background: '#2563EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>1</div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1f2e' }}>Paste Job Description</span>
              </div>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder={"Paste the full job description here...\n\nFor example:\nWe are looking for a Senior Frontend Developer with experience in React, TypeScript and Node.js..."}
                rows={7}
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', resize: 'none', outline: 'none', lineHeight: 1.6, fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = '#2563EB'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginTop: 4 }}>{jobDescription.length} characters</div>
            </div>

            {/* Step 2 */}
            <div className="db-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 26, height: 26, background: '#2563EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>2</div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1f2e' }}>Choose Your CV</span>
              </div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Select from your saved resumes</label>
              <select
                value={selectedResume ? selectedResume.id : ''}
                onChange={e => {
                  const val = e.target.value
                  if (!val) { setSelectedResume(null); return }
                  const found = resumes.find(r => String(r.id) === String(val))
                  setSelectedResume(found || null)
                }}
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: selectedResume ? '#111827' : '#9CA3AF', outline: 'none', background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#2563EB'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">{resumes.length > 0 ? '— Select a saved resume —' : '— No saved resumes yet —'}</option>
                {resumes.map(r => <option key={r.id} value={r.id}>{r.name} ({r.file_type})</option>)}
              </select>

              {selectedResume && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', marginTop: 10, background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: 8 }}>
                  <span style={{ color: '#059669' }}>✅</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#065F46', flex: 1 }}>{selectedResume.name} selected</span>
                  <button onClick={() => setSelectedResume(null)}
                    style={{ fontSize: 12, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    ✕ Clear
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>or</span>
                <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
              </div>

              <button
                onClick={() => navigate('/resumes/add')}
                style={{ width: '100%', padding: '12px', border: '2px dashed #BFDBFE', borderRadius: 8, background: '#fff', color: '#2563EB', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#2563EB' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#BFDBFE' }}
              >
                + Upload a new CV
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>After uploading your CV will appear in the dropdown above</p>
            </div>

            {/* Step 3 */}
            <div className="db-section-last">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 26, height: 26, background: '#2563EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>3</div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1f2e' }}>Get Your Results</span>
              </div>
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '11px 14px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Sparkles size={15} color="#2563EB" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: '#1D4ED8', lineHeight: 1.6, margin: 0 }}>
                  AI will analyse your CV against the job description, find skill gaps, and generate a professional NZ-style cover letter.
                </p>
              </div>
              <button
                onClick={handleGetResults}
                style={{ width: '100%', padding: '14px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
                onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
              >
                <span>⚡</span><span>Get my results</span><span>→</span>
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 10 }}>
                Includes skill gap analysis + NZ cover letter + optional CV rewrite
              </p>
            </div>

          </div>
        )}
      </div>
    </Layout>
  )
}

export default Dashboard