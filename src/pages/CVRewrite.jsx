// CVRewrite.jsx — PREMIUM REDESIGN
// ✅ ALL LOGIC PRESERVED EXACTLY — zero functional changes
// Only styles and visual design changed

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function CVRewrite() {

  const navigate = useNavigate()
  const location = useLocation()

  const { jobDescription, selectedResume, jdData, skillGapData, cachedResults } = location.state || {}

  const [userName, setUserName] = useState('')
  const [resumes, setResumes] = useState([])
  const [processing, setProcessing] = useState(true)
  const [error, setError] = useState(null)
  const [rewrittenCV, setRewrittenCV] = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!selectedResume || !jdData || !skillGapData) {
      toast.error('Missing data. Please start from the dashboard.')
      navigate('/dashboard')
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

    rewriteCV(resumeData)
  }

  const rewriteCV = async (resumeList) => {
    try {
      setProcessing(true)
      setError(null)

      const selectedResumeData = resumeList?.find(r => r.id === selectedResume.id)
      const cvData = selectedResumeData?.parsed_data

      if (!cvData) throw new Error('CV data not found. Please re-upload your CV.')

      toast('AI is rewriting your CV...', { icon: '🔄' })

      const response = await fetch(`${API_URL}/cvrewrite/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_data: cvData, jd_data: jdData, skill_gap_data: skillGapData })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error('CV rewrite failed: ' + err.detail)
      }

      const result = await response.json()
      setRewrittenCV(result.data)
      setProcessing(false)
      toast.success('CV rewritten successfully!')

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { incrementCVRewriteCount } = await import('../lib/stats')
        await incrementCVRewriteCount(user.id)
      }

    } catch (err) {
      setError(err.message)
      setProcessing(false)
      toast.error(err.message)
    }
  }

  const handleDownload = async () => {
    if (!rewrittenCV) return
    setDownloading(true)

    try {
      const children = []

      children.push(
        new Paragraph({
          children: [new TextRun({ text: rewrittenCV.full_name || '', font: 'Calibri', size: 48, bold: true, color: '1A2E4A' })],
          spacing: { after: 80 }
        })
      )

      if (rewrittenCV.target_role) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: rewrittenCV.target_role, font: 'Calibri', size: 26, color: '2D6DB4', bold: true })],
            spacing: { after: 80 }
          })
        )
      }

      const contactParts = [rewrittenCV.email, rewrittenCV.phone, rewrittenCV.location].filter(Boolean).join('  |  ')
      children.push(
        new Paragraph({
          children: [new TextRun({ text: contactParts, font: 'Calibri', size: 20, color: '555555' })],
          spacing: { after: 240 }
        })
      )

      const sectionHeading = (text) => new Paragraph({
        children: [new TextRun({ text: text.toUpperCase(), font: 'Calibri', size: 22, bold: true, color: '1A2E4A' })],
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '2D6DB4' } },
        spacing: { before: 280, after: 120 }
      })

      const bulletPoint = (text) => new Paragraph({
        children: [new TextRun({ text: `• ${text}`, font: 'Calibri', size: 20, color: '333333' })],
        spacing: { before: 40, after: 40 },
        indent: { left: 360 }
      })

      const bodyText = (text) => new Paragraph({
        children: [new TextRun({ text, font: 'Calibri', size: 20, color: '333333' })],
        spacing: { before: 40, after: 80 }
      })

      if (rewrittenCV.professional_summary) {
        children.push(sectionHeading('Professional Summary'))
        children.push(bodyText(rewrittenCV.professional_summary))
      }

      const allSkills = [...(rewrittenCV.skills?.technical || []), ...(rewrittenCV.skills?.soft || [])]
      if (allSkills.length > 0) {
        children.push(sectionHeading('Skills'))
        children.push(
          new Paragraph({
            children: [new TextRun({ text: allSkills.join('  •  '), font: 'Calibri', size: 20, color: '333333' })],
            spacing: { after: 80 }
          })
        )
      }

      if (rewrittenCV.experience?.length > 0) {
        children.push(sectionHeading('Professional Experience'))
        rewrittenCV.experience.forEach(exp => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: exp.job_title || '', font: 'Calibri', size: 22, bold: true, color: '1A2E4A' }),
                new TextRun({ text: exp.company ? `  —  ${exp.company}` : '', font: 'Calibri', size: 22, color: '2D6DB4' }),
              ],
              spacing: { before: 160, after: 40 }
            })
          )
          if (exp.duration) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: exp.duration, font: 'Calibri', size: 19, italics: true, color: '888888' })],
                spacing: { after: 80 }
              })
            )
          }
          exp.responsibilities?.forEach(r => children.push(bulletPoint(r)))
          exp.achievements?.forEach(a => { if (a) children.push(bulletPoint('Achievement: ' + a)) })
        })
      }

      if (rewrittenCV.education?.length > 0) {
        children.push(sectionHeading('Education'))
        rewrittenCV.education.forEach(edu => {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: edu.degree || '', font: 'Calibri', size: 22, bold: true, color: '1A2E4A' })],
              spacing: { before: 120, after: 40 }
            })
          )
          children.push(
            new Paragraph({
              children: [new TextRun({ text: [edu.institution, edu.year].filter(Boolean).join('  |  '), font: 'Calibri', size: 20, color: '555555' })],
              spacing: { after: 80 }
            })
          )
        })
      }

      if (rewrittenCV.certifications?.length > 0) {
        children.push(sectionHeading('Certifications'))
        rewrittenCV.certifications.forEach(cert => { if (cert) children.push(bulletPoint(cert)) })
      }

      const doc = new Document({
        sections: [{
          properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
          children
        }]
      })

      const blob = await Packer.toBlob(doc)
      const fileName = `${rewrittenCV.full_name?.replace(/\s+/g, '_') || 'CV'}_Tailored_${jdData?.company?.replace(/\s+/g, '_') || 'Job'}.docx`
      saveAs(blob, fileName)
      toast.success('CV downloaded as Word document!')

    } catch (err) {
      console.error('Download error:', err)
      toast.error('Error downloading CV')
    }

    setDownloading(false)
  }

  const goBackToResults = () => navigate('/results', {
    state: {
      jobDescription, selectedResume,
      cachedResults: cachedResults || { jdData, skillGapData, coverLetterData: null }
    }
  })

  return (
    <Layout userName={userName} resumes={resumes} recentJDs={[]}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&display=swap');

        .cv-page  { padding: 28px 24px 48px; background: #F0F2F7; min-height: 100vh; }
        .cv-card  { background: #fff; border-radius: 16px; border: 1px solid #E8ECF4; box-shadow: 0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.04); }

        .cv-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 11px 24px; background: #2563EB; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; color: #fff; cursor: pointer; font-family: inherit; transition: all 0.15s; }
        .cv-btn-primary:hover { background: #1D4ED8; transform: translateY(-1px); }
        .cv-btn-primary:disabled { background: #94A3B8; cursor: not-allowed; transform: none; }

        .cv-btn-green { display: inline-flex; align-items: center; gap: 8px; padding: 11px 24px; background: linear-gradient(135deg,#059669,#047857); border: none; border-radius: 10px; font-size: 14px; font-weight: 700; color: #fff; cursor: pointer; font-family: inherit; transition: all 0.15s; box-shadow: 0 4px 14px rgba(5,150,105,0.3); }
        .cv-btn-green:hover { opacity: 0.9; transform: translateY(-1px); }
        .cv-btn-green:disabled { background: #94A3B8; cursor: not-allowed; box-shadow: none; transform: none; }

        .cv-btn-outline { display: inline-flex; align-items: center; gap: 7px; padding: 11px 22px; background: #fff; border: 1px solid #E8ECF4; border-radius: 10px; font-size: 14px; font-weight: 600; color: #475569; cursor: pointer; font-family: inherit; transition: all 0.15s; }
        .cv-btn-outline:hover { border-color: #2563EB; color: #2563EB; background: #EFF6FF; }

        .cv-sec-title { font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.7px; border-bottom: 2px solid #2563EB; padding-bottom: 6px; margin-bottom: 14px; }

        .cv-skill-base { display: inline-flex; align-items: center; padding: 4px 11px; border-radius: 7px; font-size: 12px; font-weight: 600; margin: 3px; }
        .cv-skill-new  { background: #F0F4FF; color: #4F46E5; border: 1px solid #C7D2FE; }
        .cv-skill-old  { background: #F1F5F9; color: #334155; border: 1px solid #E2E8F0; }

        .cv-imp-item { display: flex; gap: 10px; align-items: flex-start; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 11px 14px; }

        @keyframes cv-pulse { 0%,80%,100%{opacity:.2;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
        .cv-dot { width: 8px; height: 8px; border-radius: 50%; background: #6366F1; display: inline-block; animation: cv-pulse 1.4s infinite both; }
        .cv-dot:nth-child(2) { animation-delay: .2s; }
        .cv-dot:nth-child(3) { animation-delay: .4s; }

        @media (max-width: 640px) {
          .cv-page { padding: 16px 14px 40px; }
          .cv-exp-header { flex-direction: column; gap: 2px; }
        }
      `}</style>

      <div className="cv-page">

        {/* ── Page header ────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }}>
              <span style={{ cursor: 'pointer', color: '#2563EB' }} onClick={() => navigate('/dashboard')}>Dashboard</span>
              <span style={{ margin: '0 6px' }}>›</span>
              <span style={{ cursor: 'pointer', color: '#2563EB' }} onClick={goBackToResults}>Results</span>
              <span style={{ margin: '0 6px' }}>›</span>CV Rewrite
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", letterSpacing: '-0.5px' }}>
              CV Rewrite
            </h1>
          </div>
          <button className="cv-btn-outline" onClick={goBackToResults}>← Back to Results</button>
        </div>

        {/* ── PROCESSING ─────────────────────────────────────────── */}
        {processing && (
          <div className="cv-card" style={{ maxWidth: 500, margin: '60px auto', padding: '56px 40px', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(99,102,241,0.35)', fontSize: 32 }}>
              🔄
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 8px', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>
              AI is rewriting your CV
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 6px' }}>
              This usually takes 20–40 seconds
            </p>
            <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 28px', lineHeight: 1.6 }}>
              Incorporating missing skills and tailoring content for<br />
              <strong style={{ color: '#6366F1' }}>{jdData?.job_title || 'this role'}</strong>
              {jdData?.company ? ` at ${jdData.company}` : ''}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
              <span className="cv-dot" /><span className="cv-dot" /><span className="cv-dot" />
            </div>
          </div>
        )}

        {/* ── ERROR ──────────────────────────────────────────────── */}
        {error && !processing && (
          <div className="cv-card" style={{ maxWidth: 500, margin: '40px auto', padding: '40px 36px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 30, border: '1px solid #FECACA' }}>❌</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 8px', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>Something went wrong</h2>
            <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 24px', lineHeight: 1.65 }}>{error}</p>
            <button className="cv-btn-outline" onClick={goBackToResults}>← Go back to Results</button>
          </div>
        )}

        {/* ── RESULTS ────────────────────────────────────────────── */}
        {!processing && !error && rewrittenCV && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Success + download banner */}
            <div className="cv-card" style={{ padding: '18px 24px', background: 'linear-gradient(135deg,#ECFDF5,#F0FDF4)', border: '1px solid #6EE7B7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,#059669,#047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 12px rgba(5,150,105,0.3)', flexShrink: 0 }}>✅</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#065F46', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>CV rewritten successfully</div>
                  <div style={{ fontSize: 13, color: '#047857', marginTop: 2 }}>
                    Tailored for <strong>{jdData?.job_title || 'this role'}</strong>{jdData?.company ? ` at ${jdData.company}` : ''}
                  </div>
                </div>
              </div>
              <button className="cv-btn-green" onClick={handleDownload} disabled={downloading}>
                {downloading ? '⏳ Downloading...' : '⬇ Download CV as .docx'}
              </button>
            </div>

            {/* What AI improved */}
            {rewrittenCV.improvements_made?.length > 0 && (
              <div className="cv-card" style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>💡</span>
                  What AI improved in your CV
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {rewrittenCV.improvements_made.map((imp, i) => (
                    <div key={i} className="cv-imp-item">
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#FCD34D,#F59E0B)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                      <span style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>{imp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CV Preview */}
            <div className="cv-card" style={{ overflow: 'hidden' }}>

              {/* Toolbar */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: '#FAFBFD' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#1A2E4A,#2D6DB4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>📄</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>Rewritten CV Preview</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>
                      Tailored for <span style={{ color: '#6366F1', fontWeight: 600 }}>{jdData?.job_title || 'this role'}</span>
                    </div>
                  </div>
                </div>
                <button className="cv-btn-green" onClick={handleDownload} disabled={downloading} style={{ padding: '8px 18px', fontSize: 13 }}>
                  {downloading ? '⏳ Downloading...' : '⬇ Download .docx'}
                </button>
              </div>

              {/* CV body */}
              <div style={{ padding: '40px 48px', background: '#fff' }}>
                <div style={{ maxWidth: 700, margin: '0 auto' }}>

                  {/* Name */}
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#1A2E4A', marginBottom: 4, fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", letterSpacing: '-0.5px' }}>
                    {rewrittenCV.full_name}
                  </div>

                  {/* Target role */}
                  {rewrittenCV.target_role && (
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#2D6DB4', marginBottom: 8 }}>
                      {rewrittenCV.target_role}
                    </div>
                  )}

                  {/* Contact */}
                  <div style={{ fontSize: 13, color: '#64748B', marginBottom: 28, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                    {[rewrittenCV.email, rewrittenCV.phone, rewrittenCV.location].filter(Boolean).map((item, i, arr) => (
                      <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {item}{i < arr.length - 1 && <span style={{ color: '#CBD5E1' }}>·</span>}
                      </span>
                    ))}
                  </div>

                  {/* Summary */}
                  {rewrittenCV.professional_summary && (
                    <div style={{ marginBottom: 24 }}>
                      <div className="cv-sec-title">Professional Summary</div>
                      <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.8, margin: 0 }}>
                        {rewrittenCV.professional_summary}
                      </p>
                    </div>
                  )}

                  {/* Skills */}
                  {(rewrittenCV.skills?.technical?.length > 0 || rewrittenCV.skills?.soft?.length > 0) && (
                    <div style={{ marginBottom: 24 }}>
                      <div className="cv-sec-title">Skills</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', margin: '-3px' }}>
                        {[...(rewrittenCV.skills?.technical || []), ...(rewrittenCV.skills?.soft || [])].map((skill, i) => {
                          const wasMissing = skillGapData?.missing_skills?.some(s => s.skill?.toLowerCase() === skill?.toLowerCase())
                          return (
                            <span key={i} className={`cv-skill-base ${wasMissing ? 'cv-skill-new' : 'cv-skill-old'}`}>
                              {wasMissing && <span style={{ marginRight: 3 }}>✦</span>}{skill}
                            </span>
                          )
                        })}
                      </div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ color: '#4F46E5', fontWeight: 700 }}>✦</span> Purple skills were added based on job requirements
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {rewrittenCV.experience?.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <div className="cv-sec-title">Professional Experience</div>
                      {rewrittenCV.experience.map((exp, i) => (
                        <div key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: i < rewrittenCV.experience.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                          <div className="cv-exp-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, flexWrap: 'wrap', gap: 4 }}>
                            <div>
                              <span style={{ fontSize: 15, fontWeight: 700, color: '#1A2E4A' }}>{exp.job_title}</span>
                              {exp.company && <span style={{ fontSize: 15, color: '#2D6DB4', fontWeight: 600 }}> — {exp.company}</span>}
                            </div>
                            {exp.duration && (
                              <span style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic', flexShrink: 0 }}>{exp.duration}</span>
                            )}
                          </div>
                          <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                            {exp.responsibilities?.map((r, j) => (
                              <li key={j} style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.7, marginBottom: 4 }}>{r}</li>
                            ))}
                            {exp.achievements?.filter(Boolean).map((a, j) => (
                              <li key={`a-${j}`} style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.7, marginBottom: 4, fontWeight: 600 }}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education */}
                  {rewrittenCV.education?.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <div className="cv-sec-title">Education</div>
                      {rewrittenCV.education.map((edu, i) => (
                        <div key={i} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: '3px solid #BFDBFE' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2E4A' }}>{edu.degree}</div>
                          <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                            {[edu.institution, edu.year].filter(Boolean).join(' · ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Certifications */}
                  {rewrittenCV.certifications?.filter(Boolean).length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div className="cv-sec-title">Certifications</div>
                      <ul style={{ margin: '0 0 0 18px', padding: 0 }}>
                        {rewrittenCV.certifications.filter(Boolean).map((cert, i) => (
                          <li key={i} style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.7, marginBottom: 4 }}>{cert}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Bottom actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', paddingTop: 8 }}>
              <button className="cv-btn-green" onClick={handleDownload} disabled={downloading}>
                {downloading ? '⏳ Downloading...' : '⬇ Download CV as .docx'}
              </button>
              <button className="cv-btn-outline" onClick={goBackToResults}>← Back to Results</button>
            </div>

          </div>
        )}

      </div>
    </Layout>
  )
}

export default CVRewrite