// Results.jsx — PREMIUM REDESIGN
// ✅ ALL LOGIC PRESERVED EXACTLY — zero functional changes
// Only styles, layout and visual design changed

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Results() {

  const navigate = useNavigate()
  const location = useLocation()

  const { jobDescription, selectedResume, cachedResults } = location.state || {}

  const [userName, setUserName] = useState('')
  const [resumes, setResumes] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [processing, setProcessing] = useState(true)
  const [jdData, setJdData] = useState(null)
  const [skillGapData, setSkillGapData] = useState(null)
  const [coverLetterData, setCoverLetterData] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('skillgap')

  const freeLimit = parseInt(import.meta.env.VITE_FREE_ANALYSIS_LIMIT) || 5

  const steps = [
    { label: 'Analysing job description...', icon: '🔍' },
    { label: 'Comparing with your CV...', icon: '📊' },
    { label: 'Generating cover letter...', icon: '✉️' },
    { label: 'All done!', icon: '✅' },
  ]

  useEffect(() => {
    if (!jobDescription || !selectedResume) {
      toast.error('Please select a CV and paste a job description first')
      navigate('/dashboard')
      return
    }
    if (cachedResults?.skillGapData) {
      setJdData(cachedResults.jdData)
      setSkillGapData(cachedResults.skillGapData)
      setCoverLetterData(cachedResults.coverLetterData)
      setProcessing(false)
      getUser()
      return
    }
    getUser()
  }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }

    const metaName = user.user_metadata?.full_name
    if (metaName) {
      setUserName(metaName)
    } else {
      const { data: profileData } = await supabase
        .from('profiles').select('full_name').eq('id', user.id).single()
      setUserName(profileData?.full_name || user.email)
    }

    const { data: resumeData } = await supabase
      .from('resumes').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setResumes(resumeData || [])

    const { data: profileData } = await supabase
      .from('profiles').select('groq_api_key').eq('id', user.id).single()
    const userGroqKey = profileData?.groq_api_key || null

    if (!cachedResults?.skillGapData) {
      processApplication(resumeData, userGroqKey, user.id)
    }
  }

  const processApplication = async (resumeList, userGroqKey = null, userId) => {
    try {
      setProcessing(true)
      setError(null)

      const selectedResumeData = resumeList?.find(r => r.id === selectedResume.id)
      const cvData = selectedResumeData?.parsed_data

      if (!cvData) throw new Error('CV data not found. Please re-upload your CV.')

      const { data: statsData } = await supabase
        .from('user_stats').select('jd_count').eq('user_id', userId).single()
      const currentCount = statsData?.jd_count || 0

      if (currentCount >= freeLimit && !userGroqKey) {
        throw new Error(`FREE_LIMIT_REACHED:You have used your ${freeLimit} free AI analyses. Please add your own Groq API key in your Profile to continue.`)
      }

      setCurrentStep(0)
      const jdResponse = await fetch(`${API_URL}/jd/analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain', ...(userGroqKey && { 'X-Groq-Key': userGroqKey }) },
        body: jobDescription
      })
      if (!jdResponse.ok) {
        const err = await jdResponse.json()
        throw new Error('JD analysis failed: ' + err.detail)
      }
      const jdResult = await jdResponse.json()
      setJdData(jdResult.data)

      const { incrementJDCount } = await import('../lib/stats')
      await incrementJDCount(userId)

      setCurrentStep(1)
      const skillGapResponse = await fetch(`${API_URL}/skillgap/analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(userGroqKey && { 'X-Groq-Key': userGroqKey }) },
        body: JSON.stringify({ cv_data: cvData, jd_data: jdResult.data })
      })
      if (!skillGapResponse.ok) {
        const err = await skillGapResponse.json()
        throw new Error('Skill gap analysis failed: ' + err.detail)
      }
      const skillGapResult = await skillGapResponse.json()
      setSkillGapData(skillGapResult.data)

      setCurrentStep(2)
      const coverLetterResponse = await fetch(`${API_URL}/coverletter/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(userGroqKey && { 'X-Groq-Key': userGroqKey }) },
        body: JSON.stringify({ cv_data: cvData, jd_data: jdResult.data, skill_gap_data: skillGapResult.data, tone: 'professional' })
      })
      if (!coverLetterResponse.ok) {
        const err = await coverLetterResponse.json()
        throw new Error('Cover letter generation failed: ' + err.detail)
      }
      const coverLetterResult = await coverLetterResponse.json()
      setCoverLetterData(coverLetterResult.data)

      setCurrentStep(3)
      setProcessing(false)

    } catch (err) {
      setError(err.message)
      setProcessing(false)
      if (!err.message.startsWith('FREE_LIMIT_REACHED:')) toast.error(err.message)
    }
  }

  const isFreeLimitError = error?.startsWith('FREE_LIMIT_REACHED:')
  const errorMessage = isFreeLimitError ? error.replace('FREE_LIMIT_REACHED:', '') : error

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(coverLetterData?.cover_letter || '')
    toast.success('Cover letter copied to clipboard!')
  }

  const handleDownloadCoverLetter = async () => {
    try {
      const lines = (coverLetterData?.cover_letter || '').split('\n')
      const doc = new Document({
        sections: [{
          properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
          children: lines.map(line =>
            !line.trim()
              ? new Paragraph({ text: '' })
              : new Paragraph({ children: [new TextRun({ text: line, font: 'Calibri', size: 24 })], spacing: { after: 160 } })
          )
        }]
      })
      const blob = await Packer.toBlob(doc)
      saveAs(blob, `Cover_Letter_${coverLetterData?.company || 'Job'}.docx`)
      toast.success('Cover letter downloaded as Word document!')
    } catch (err) {
      console.error('Download error:', err)
      toast.error('Error downloading cover letter')
    }
  }

  const getMatchColor = (percentage) => {
    if (percentage >= 90) return { text: '#059669', bg: '#ECFDF5', border: '#6EE7B7', glow: 'rgba(5,150,105,0.15)' }
    if (percentage >= 70) return { text: '#2563EB', bg: '#EFF6FF', border: '#93C5FD', glow: 'rgba(37,99,235,0.15)' }
    if (percentage >= 50) return { text: '#D97706', bg: '#FFFBEB', border: '#FCD34D', glow: 'rgba(217,119,6,0.15)' }
    return { text: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5', glow: 'rgba(220,38,38,0.15)' }
  }

  const pct = skillGapData?.match_percentage || 0
  const mc = getMatchColor(pct)

  return (
    <Layout userName={userName} resumes={resumes} recentJDs={[]}>

      {/* ── Global premium styles ─────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&display=swap');

        .rp-page { padding: 28px 24px 48px; background: #F0F2F7; min-height: 100vh; }

        /* Card */
        .rp-card { background: #fff; border-radius: 16px; border: 1px solid #E8ECF4; box-shadow: 0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.04); }

        /* Tabs */
        .rp-tabs { display: flex; background: #F0F2F7; border-radius: 12px; padding: 4px; gap: 4px; }
        .rp-tab { flex: 1; padding: 10px 16px; border: none; border-radius: 9px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.18s; display: flex; align-items: center; justify-content: center; gap: 7px; }
        .rp-tab.on  { background: #2563EB; color: #fff; box-shadow: 0 2px 8px rgba(37,99,235,0.35); }
        .rp-tab.off { background: transparent; color: #64748B; }
        .rp-tab.off:hover { color: #2563EB; background: rgba(37,99,235,0.06); }

        /* Skill pills */
        .sk-match { background: #ECFDF5; border: 1px solid #6EE7B7; border-radius: 9px; padding: 9px 13px; }
        .sk-miss  { background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 9px; padding: 9px 13px; }
        .sk-name-match { font-size: 13px; font-weight: 600; color: #065F46; }
        .sk-name-miss  { font-size: 13px; font-weight: 600; color: #991B1B; }
        .sk-note  { font-size: 12px; color: #6B7280; margin-top: 3px; line-height: 1.5; }

        /* Imp badge */
        .sk-imp-req  { font-size: 10px; font-weight: 700; background: #FEE2E2; color: #DC2626; padding: 2px 7px; border-radius: 5px; }
        .sk-imp-nice { font-size: 10px; font-weight: 700; background: #FEF3C7; color: #D97706; padding: 2px 7px; border-radius: 5px; }

        /* Rec item */
        .rp-rec { display: flex; gap: 12px; align-items: flex-start; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 12px 14px; }

        /* Buttons */
        .rp-btn-outline { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; background: #fff; border: 1px solid #E8ECF4; border-radius: 10px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; font-family: inherit; transition: all 0.15s; }
        .rp-btn-outline:hover { border-color: #2563EB; color: #2563EB; background: #EFF6FF; }

        .rp-btn-primary { display: inline-flex; align-items: center; gap: 7px; padding: 10px 22px; background: #2563EB; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; color: #fff; cursor: pointer; font-family: inherit; transition: background 0.15s; }
        .rp-btn-primary:hover { background: #1D4ED8; }

        /* 2-col grid */
        .rp-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        /* Loading dot pulse */
        @keyframes rp-pulse { 0%,80%,100%{opacity:.2;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
        .rp-dot { width: 8px; height: 8px; border-radius: 50%; background: #2563EB; display: inline-block; animation: rp-pulse 1.4s infinite both; }
        .rp-dot:nth-child(2) { animation-delay: .2s; }
        .rp-dot:nth-child(3) { animation-delay: .4s; }

        @media (max-width: 720px) {
          .rp-cols { grid-template-columns: 1fr; }
          .rp-page { padding: 16px 14px 40px; }
        }
      `}</style>

      <div className="rp-page">

        {/* ── Page header ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }}>
              <span style={{ cursor: 'pointer', color: '#2563EB' }} onClick={() => navigate('/dashboard')}>Dashboard</span>
              <span style={{ margin: '0 6px' }}>›</span>Results
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", letterSpacing: '-0.5px' }}>
              Application Results
            </h1>
          </div>
          <button className="rp-btn-outline" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>

        {/* ── PROCESSING ─────────────────────────────────────────────── */}
        {processing && (
          <div className="rp-card" style={{ maxWidth: 500, margin: '60px auto', padding: '56px 40px', textAlign: 'center' }}>
            {/* Animated orb */}
            <div style={{ width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg, #2563EB, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(37,99,235,0.35)', fontSize: 32 }}>
              ⚡
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 8px', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>
              AI is working on it
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 8px' }}>
              This usually takes 15–30 seconds
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 5, margin: '0 0 36px' }}>
              <span className="rp-dot" /><span className="rp-dot" /><span className="rp-dot" />
            </div>

            {/* Steps */}
            <div style={{ display: 'inline-block', textAlign: 'left' }}>
              {steps.map((step, i) => {
                const done = i < currentStep
                const active = i === currentStep
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: i < steps.length - 1 ? 16 : 0, opacity: i > currentStep ? 0.28 : 1, transition: 'opacity 0.4s' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, transition: 'all 0.3s', background: done ? '#059669' : active ? '#2563EB' : '#F1F5F9', boxShadow: active ? '0 0 0 4px rgba(37,99,235,0.15)' : 'none' }}>
                      {done ? <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>✓</span> : <span>{step.icon}</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: active ? 700 : 500, color: done ? '#059669' : active ? '#2563EB' : '#94A3B8', transition: 'color 0.3s' }}>
                        {step.label}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── ERROR ──────────────────────────────────────────────────── */}
        {error && !processing && (
          <div className="rp-card" style={{ maxWidth: 560, margin: '40px auto', padding: '40px 36px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: isFreeLimitError ? '#FFFBEB' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32, border: `1px solid ${isFreeLimitError ? '#FDE68A' : '#FECACA'}` }}>
              {isFreeLimitError ? '🔑' : '❌'}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 8px', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>
              {isFreeLimitError ? 'Free limit reached' : 'Something went wrong'}
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 24px', lineHeight: 1.65 }}>{errorMessage}</p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: isFreeLimitError ? 24 : 0 }}>
              {isFreeLimitError ? (
                <>
                  <button className="rp-btn-primary" onClick={() => navigate('/profile')}>
                    🔑 Add my Groq key in Profile
                  </button>
                  <button className="rp-btn-outline" onClick={() => navigate('/dashboard')}>← Dashboard</button>
                </>
              ) : (
                <button className="rp-btn-primary" onClick={() => navigate('/dashboard')}>← Go back to Dashboard</button>
              )}
            </div>

            {isFreeLimitError && (
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '16px 18px', textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8', marginBottom: 10 }}>How to get your free Groq API key:</div>
                <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.85 }}>
                  1. Go to{' '}<a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: '#2563EB', fontWeight: 700 }}>console.groq.com</a><br />
                  2. Sign up for a free account<br />
                  3. Click <strong>API Keys</strong> in left menu<br />
                  4. Click <strong>Create API Key</strong><br />
                  5. Copy the key starting with <strong>gsk_</strong><br />
                  6. Go to <strong>Profile → Groq API Key</strong> and paste it
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── RESULTS ────────────────────────────────────────────────── */}
        {!processing && !error && skillGapData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Hero score banner */}
            {jdData && (
              <div className="rp-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', background: `linear-gradient(135deg, #fff 60%, ${mc.glow})` }}>
                {/* Job info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 5 }}>Analysed role</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", letterSpacing: '-0.3px' }}>
                    {jdData.job_title || 'Job Position'}
                  </div>
                  {(jdData.company || jdData.location) && (
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                      {jdData.company}{jdData.company && jdData.location ? ' · ' : ''}{jdData.location}
                    </div>
                  )}
                </div>

                {/* Score ring */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 12, padding: '10px 16px', textAlign: 'center', minWidth: 70 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#059669', lineHeight: 1 }}>{skillGapData.matched_skills?.length || 0}</div>
                      <div style={{ fontSize: 11, color: '#047857', fontWeight: 600, marginTop: 3 }}>Matched</div>
                    </div>
                    <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '10px 16px', textAlign: 'center', minWidth: 70 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#DC2626', lineHeight: 1 }}>{skillGapData.missing_skills?.length || 0}</div>
                      <div style={{ fontSize: 11, color: '#B91C1C', fontWeight: 600, marginTop: 3 }}>Missing</div>
                    </div>
                  </div>

                  {/* Big % badge */}
                  <div style={{ width: 88, height: 88, borderRadius: 22, background: mc.bg, border: `2px solid ${mc.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 6px ${mc.glow}` }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: mc.text, lineHeight: 1, fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>{pct}%</div>
                    <div style={{ fontSize: 10, color: mc.text, fontWeight: 700, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{skillGapData.match_level}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Progress bar */}
            <div className="rp-card" style={{ padding: '12px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>Match score</div>
                <div style={{ flex: 1, height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${mc.border}, ${mc.text})`, borderRadius: 4, transition: 'width 1.2s cubic-bezier(.4,0,.2,1)' }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: mc.text, whiteSpace: 'nowrap' }}>{pct}%</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="rp-card" style={{ padding: 6 }}>
              <div className="rp-tabs">
                <button className={`rp-tab ${activeTab === 'skillgap' ? 'on' : 'off'}`} onClick={() => setActiveTab('skillgap')}>
                  📊 Skill Gap Analysis
                </button>
                <button className={`rp-tab ${activeTab === 'coverletter' ? 'on' : 'off'}`} onClick={() => setActiveTab('coverletter')}>
                  ✉️ Cover Letter
                </button>
              </div>
            </div>

            {/* ── SKILL GAP TAB ──────────────────────────────────────── */}
            {activeTab === 'skillgap' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Summary */}
                <div className="rp-card" style={{ padding: '20px 24px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>📋</span>
                    Summary
                  </div>
                  <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.75, margin: 0 }}>{skillGapData.summary}</p>
                </div>

                {/* Matched + Missing skills */}
                <div className="rp-cols">

                  {/* Matched */}
                  <div className="rp-card" style={{ padding: '20px 20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#059669', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 26, height: 26, borderRadius: 8, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✅</span>
                      Matched Skills
                      <span style={{ marginLeft: 'auto', fontSize: 12, background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#047857', borderRadius: 20, padding: '2px 9px', fontWeight: 700 }}>
                        {skillGapData.matched_skills?.length || 0}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {skillGapData.matched_skills?.map((skill, i) => (
                        <div key={i} className="sk-match">
                          <div className="sk-name-match">✓ {skill.skill}</div>
                          {skill.note && <div className="sk-note">{skill.note}</div>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing */}
                  <div className="rp-card" style={{ padding: '20px 20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 26, height: 26, borderRadius: 8, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>❌</span>
                      Missing Skills
                      <span style={{ marginLeft: 'auto', fontSize: 12, background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', borderRadius: 20, padding: '2px 9px', fontWeight: 700 }}>
                        {skillGapData.missing_skills?.length || 0}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {skillGapData.missing_skills?.map((skill, i) => (
                        <div key={i} className="sk-miss">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span className="sk-name-miss">✕ {skill.skill}</span>
                            {skill.importance === 'required' && <span className="sk-imp-req">REQUIRED</span>}
                            {skill.importance && skill.importance !== 'required' && <span className="sk-imp-nice">{skill.importance.toUpperCase()}</span>}
                          </div>
                          {skill.note && <div className="sk-note">{skill.note}</div>}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* CV Rewrite CTA */}
                <div className="rp-card" style={{ padding: '22px 24px', background: pct >= 50 ? 'linear-gradient(135deg, #F5F3FF, #EFF6FF)' : '#FAFAFA', border: pct >= 50 ? '1px solid #C4B5FD' : '1px solid #E8ECF4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 5, fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>
                        {pct >= 90 ? '🔄 Strong match — want to go further?' : pct >= 50 ? '🔄 Boost your match score' : '🔄 CV Rewrite Not Available'}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
                        {pct >= 90
                          ? <span>Your match is <strong style={{ color: '#059669' }}>{pct}%</strong> — excellent! Rewrite your CV to address the remaining gaps.</span>
                          : pct >= 50
                          ? <span>Your match is <strong style={{ color: '#6366F1' }}>{pct}%</strong>. An AI-rewritten CV targeting the missing skills can significantly improve your chances.</span>
                          : <span>Your match is <strong style={{ color: '#DC2626' }}>{pct}%</strong> — below 50%. CV rewrite requires at least 50% match with this role.</span>
                        }
                      </div>
                    </div>
                    <button
                      disabled={pct < 50}
                      onClick={() => {
                        if (pct >= 50) {
                          navigate('/cv-rewrite', {
                            state: {
                              jobDescription,
                              selectedResume,
                              jdData,
                              skillGapData,
                              cachedResults: { jdData, skillGapData, coverLetterData }
                            }
                          })
                        }
                      }}
                      style={{
                        padding: '11px 24px',
                        background: pct >= 90 ? 'linear-gradient(135deg,#059669,#047857)' : pct >= 50 ? 'linear-gradient(135deg,#6366F1,#4F46E5)' : '#E5E7EB',
                        color: pct >= 50 ? '#fff' : '#9CA3AF',
                        border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 700,
                        cursor: pct >= 50 ? 'pointer' : 'not-allowed',
                        whiteSpace: 'nowrap', flexShrink: 0,
                        opacity: pct < 50 ? 0.65 : 1,
                        fontFamily: 'inherit',
                        boxShadow: pct >= 50 ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { if (pct >= 50) e.currentTarget.style.transform = 'translateY(-1px)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      🔄 Rewrite my CV for this job
                    </button>
                  </div>
                </div>

                {/* Recommendations */}
                {skillGapData.recommendations?.length > 0 && (
                  <div className="rp-card" style={{ padding: '20px 24px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 8, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>💡</span>
                      Recommendations
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {skillGapData.recommendations.map((rec, i) => (
                        <div key={i} className="rp-rec">
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#FCD34D,#F59E0B)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                          <span style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ── COVER LETTER TAB ───────────────────────────────────── */}
            {activeTab === 'coverletter' && coverLetterData && (
              <div className="rp-card" style={{ overflow: 'hidden' }}>

                {/* Toolbar */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: '#FAFBFD' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#2563EB,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>✉️</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>Cover Letter</div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>{coverLetterData.word_count} words · NZ Professional Style</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={handleCopyCoverLetter}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#fff', border: '1px solid #E8ECF4', borderRadius: 9, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.borderColor = '#BFDBFE' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#E8ECF4' }}
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={handleDownloadCoverLetter}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'linear-gradient(135deg,#059669,#047857)', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(5,150,105,0.3)', transition: 'all 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      ⬇ Download .docx
                    </button>
                  </div>
                </div>

                {/* Letter body */}
                <div style={{ padding: '36px 48px', background: '#fff' }}>
                  <div style={{ maxWidth: 680, margin: '0 auto', fontSize: 14.5, color: '#1E293B', lineHeight: 1.9, whiteSpace: 'pre-wrap', fontFamily: 'Georgia, "Times New Roman", serif' }}>
                    {coverLetterData.cover_letter}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom back button */}
            <div style={{ textAlign: 'center', paddingTop: 8 }}>
              <button className="rp-btn-outline" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
            </div>

          </div>
        )}

      </div>
    </Layout>
  )
}

export default Results