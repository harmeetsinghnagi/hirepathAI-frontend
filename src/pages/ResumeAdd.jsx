// ResumeAdd.jsx
// Redesigned — same logic, better look, responsive
// Drag/drop, AI parse, auto-name without extension all preserved

import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import { Upload, FileText, X, Sparkles, ArrowLeft } from 'lucide-react'

function ResumeAdd() {

  const [resumeName, setResumeName] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [userName, setUserName] = useState(sessionStorage.getItem('hp_user_name') || '')
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUserName(user.user_metadata?.full_name || user.email)
    }
    getUser()
  }, [])

  const handleFileSelect = (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF and DOCX files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }
    setSelectedFile(file)
    const nameWithoutExtension = file.name
      .substring(0, file.name.lastIndexOf('.'))
      .replace(/_/g, ' ')
      .trim()
    setResumeName(nameWithoutExtension)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleUpload = async () => {
    if (!resumeName.trim()) { toast.error('Please enter a name for your resume'); return }
    if (!selectedFile) { toast.error('Please select a PDF or DOCX file'); return }

    setUploading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('You must be logged in'); setUploading(false); return }

    const fileExtension = selectedFile.name.split('.').pop().toLowerCase()
    const uniqueFileName = `${user.id}/${Date.now()}.${fileExtension}`

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(uniqueFileName, selectedFile)

    if (uploadError) {
      toast.error('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    let parsedData = null

    try {
      toast('Parsing CV with AI...', { icon: '🤖' })
      const parseResponse = await fetch('http://localhost:8000/resume/parse', {
        method: 'POST',
        body: formData,
      })
      if (!parseResponse.ok) {
        const errorData = await parseResponse.json()
        console.error('Parse error:', errorData)
        toast.error('AI parsing failed: ' + errorData.detail)
      } else {
        const parseResult = await parseResponse.json()
        if (parseResult.success) {
          parsedData = parseResult.data
          toast.success('CV parsed by AI successfully!')
        }
      }
    } catch (parseError) {
      console.error('Network error calling backend:', parseError)
      toast.error('Could not connect to AI backend. Make sure backend is running on port 8000.')
    }

    const { error: dbError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        name: resumeName.trim(),
        file_path: uniqueFileName,
        file_type: fileExtension.toUpperCase(),
        file_size: selectedFile.size,
        parsed_data: parsedData,
      })

    if (dbError) {
      toast.error('Error saving: ' + dbError.message)
      setUploading(false)
      return
    }

    toast.success('Resume uploaded successfully!')
    setUploading(false)
    navigate('/resumes')
  }

  const isPDF = selectedFile?.name.endsWith('.pdf')

  return (
    <Layout userName={userName} resumes={[]} recentJDs={[]}>

      <style>{`
        .ra-wrap { padding: 20px; }
        .ra-dropzone {
          border: 2px dashed #BFDBFE; border-radius: 14px;
          padding: 48px 20px; text-align: center; cursor: pointer;
          background: #fff; transition: all 0.2s;
        }
        .ra-dropzone.hover { border-color: #2563EB; background: #EFF6FF; }
        .ra-dropzone.has-file { border-color: #A7F3D0; background: #F0FDF4; }
        .ra-input {
          width: 100%; box-sizing: border-box;
          padding: 11px 14px; border: 1px solid #E5E9F0;
          border-radius: 10px; font-size: 14px; color: #0F172A;
          background: #fff; font-family: inherit; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ra-input:focus { border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .ra-input::placeholder { color: #94A3B8; }
        @media (max-width: 640px) {
          .ra-wrap { padding: 16px; }
          .ra-dropzone { padding: 32px 16px; }
        }
      `}</style>

      <div className="ra-wrap">

        {/* Page title */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1f2e', margin: 0 }}>Add New Resume</h1>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
            <span style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => navigate('/resumes')}>My Resumes</span>
            {' / '}Add New
          </div>
        </div>

        {/* Main card */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E9F0', overflow: 'hidden' }}>

          {/* Card header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={17} color="#2563EB" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Upload Resume</div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>PDF or DOCX · Max 5MB</div>
            </div>
          </div>

          <div style={{ padding: 20 }}>

            {/* ── DROP ZONE ──────────────────────────────────────────── */}
            <div
              className={`ra-dropzone${dragOver ? ' hover' : ''}${selectedFile ? ' has-file' : ''}`}
              onClick={() => fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              style={{ marginBottom: 20 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                style={{ display: 'none' }}
                onChange={e => { if (e.target.files[0]) handleFileSelect(e.target.files[0]) }}
              />

              {selectedFile ? (
                /* File selected */
                <div>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: isPDF ? '#FEF2F2' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <FileText size={26} color={isPDF ? '#DC2626' : '#2563EB'} />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                    {selectedFile.name}
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 14 }}>
                    {(selectedFile.size / 1024).toFixed(0)} KB · {selectedFile.name.split('.').pop().toUpperCase()}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedFile(null); setResumeName('') }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <X size={14} /> Remove file
                  </button>
                </div>
              ) : (
                /* No file */
                <div>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Upload size={26} color="#2563EB" />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                    Drag and drop your CV here
                  </div>
                  <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 18 }}>
                    or click to browse your computer
                  </div>
                  <div style={{ display: 'inline-block', background: '#2563EB', color: '#fff', fontSize: 13, fontWeight: 700, padding: '9px 22px', borderRadius: 9, marginBottom: 14 }}>
                    Browse Files
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    {['PDF', 'DOCX'].map(ext => (
                      <span key={ext} style={{ fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 5, background: '#F1F5F9', color: '#475569', border: '1px solid #E5E9F0' }}>{ext}</span>
                    ))}
                    <span style={{ fontSize: 12, color: '#94A3B8' }}>· Max 5MB</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── RESUME NAME ────────────────────────────────────────── */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 7 }}>
                Resume Name
                <span style={{ color: '#94A3B8', fontWeight: 400, marginLeft: 6 }}>— auto filled from file name</span>
              </label>
              <input
                className="ra-input"
                type="text"
                placeholder="e.g. Software Engineer CV 2026"
                value={resumeName}
                onChange={e => setResumeName(e.target.value)}
              />
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>
                This name helps you identify your resume later. You can change it anytime.
              </p>
            </div>

            {/* ── AI info ────────────────────────────────────────────── */}
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '11px 14px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Sparkles size={15} color="#2563EB" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 13, color: '#1D4ED8', lineHeight: 1.55 }}>
                AI will automatically read your CV and extract your skills, experience and education when you upload.
              </div>
            </div>

            {/* ── BUTTONS ────────────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                style={{
                  flex: 1, padding: '13px',
                  background: uploading || !selectedFile ? '#93C5FD' : '#2563EB',
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontSize: 15, fontWeight: 700,
                  cursor: uploading || !selectedFile ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: 'inherit', transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!uploading && selectedFile) e.currentTarget.style.background = '#1D4ED8' }}
                onMouseLeave={e => { if (!uploading && selectedFile) e.currentTarget.style.background = '#2563EB' }}
              >
                <Upload size={17} />
                {uploading ? 'Uploading...' : 'Upload Resume'}
              </button>
              <button
                onClick={() => navigate('/resumes')}
                style={{ padding: '13px 18px', background: '#F1F5F9', color: '#374151', border: '1px solid #E5E9F0', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#E5E9F0'}
                onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>

        {/* Back link */}
        <button
          onClick={() => navigate('/resumes')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#475569', fontFamily: 'inherit', padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = '#2563EB'}
          onMouseLeave={e => e.currentTarget.style.color = '#475569'}
        >
          <ArrowLeft size={15} /> Back to My Resumes
        </button>

      </div>
    </Layout>
  )
}

export default ResumeAdd