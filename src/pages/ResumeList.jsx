// ResumeList.jsx — redesigned and responsive
// Beautiful card layout, same logic and Supabase calls as original

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import { FileText, Plus, Download, Trash2, Calendar, HardDrive, FilePlus } from 'lucide-react'

function ResumeList() {

  const navigate = useNavigate()
  const [userName, setUserName] = useState(sessionStorage.getItem('hp_user_name') || '')
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [userId, setUserId] = useState('')

  useEffect(() => { getUser() }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }
    const name = user.user_metadata?.full_name || user.email
    setUserName(name)
    setUserId(user.id)
    sessionStorage.setItem('hp_user_name', name)
    loadResumes(user.id)
  }

    const loadResumes = async (uid) => {
    const { data, error } = await supabase
      .from('resumes').select('*').eq('user_id', uid)
      .order('created_at', { ascending: false })
    if (!error) {
      setResumes(data || [])
      // Log to see what file_type and name actually contain
      console.log('Resume data:', data?.map(r => ({ name: r.name, file_type: r.file_type, file_path: r.file_path })))
    }
    setLoading(false)
  }

  const handleDownload = async (resume) => {
    try {
      const { data, error } = await supabase.storage
        .from('resumes').download(resume.file_path)
      if (error) throw error
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = resume.name + '.' + (resume.file_type === 'application/pdf' ? 'pdf' : 'docx')
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Downloaded!')
    } catch {
      toast.error('Download failed')
    }
  }

  const handleDelete = async (resume) => {
    if (!window.confirm(`Delete "${resume.name}"? This cannot be undone.`)) return
    setDeletingId(resume.id)
    try {
      await supabase.storage.from('resumes').remove([resume.file_path])
      const { error } = await supabase.from('resumes').delete().eq('id', resume.id)
      if (error) throw error
      setResumes(prev => prev.filter(r => r.id !== resume.id))
      toast.success('Resume deleted')
    } catch {
      toast.error('Delete failed')
    }
    setDeletingId(null)
  }

  // Format file size
  const formatSize = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  }

  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const fileTypeInfo = (type) => {
    const t = type?.toUpperCase()
    if (t === 'PDF') return { label: 'PDF', bg: '#FEF2F2', fg: '#DC2626', border: '#FECACA' }
    if (t === 'DOCX' || t === 'DOC') return { label: t, bg: '#EFF6FF', fg: '#2563EB', border: '#BFDBFE' }
    return { label: t || 'FILE', bg: '#F3F4F6', fg: '#374151', border: '#E5E7EB' }
  }

  return (
    <Layout userName={userName} resumes={resumes} recentJDs={[]}>

      <style>{`
        .rl-wrap { padding: 20px; }
        .rl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        @media (max-width: 640px) {
          .rl-wrap { padding: 16px; }
          .rl-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="rl-wrap">

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1f2e', margin: 0 }}>My Resumes</h1>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
              <span style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Dashboard</span>
              {' / '}My Resumes
            </div>
          </div>
          <button
            onClick={() => navigate('/resumes/add')}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 18px', background: '#2563EB', color: '#fff',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
            onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
          >
            <Plus size={17} /> Upload New CV
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>⚡</div>
              <p style={{ color: '#9CA3AF', fontSize: 14 }}>Loading...</p>
            </div>
          </div>
        ) : resumes.length === 0 ? (

          /* Empty state */
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E9F0', padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <FilePlus size={34} color="#2563EB" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1f2e', margin: '0 0 8px' }}>No resumes yet</h2>
            <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
              Upload your first CV to start getting AI-powered job application analysis.
            </p>
            <button
              onClick={() => navigate('/resumes/add')}
              style={{ padding: '12px 28px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
              onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
            >
              Upload your first CV
            </button>
          </div>

        ) : (

          <>
            {/* Count */}
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
              {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'} saved
            </p>

            {/* Cards grid */}
            <div className="rl-grid">
              {resumes.map(resume => {
                const ft = fileTypeInfo(resume.file_type)
                const isDeleting = deletingId === resume.id
                return (
                  <div key={resume.id} style={{
                    background: '#fff', borderRadius: 14,
                    border: '1px solid #E5E9F0',
                    boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
                    overflow: 'hidden',
                    opacity: isDeleting ? 0.5 : 1,
                    transition: 'opacity 0.2s',
                  }}>

                    {/* Card top — blue strip */}
                    <div style={{ height: 6, background: 'linear-gradient(90deg, #2563EB, #1a1a2e)' }} />

                    <div style={{ padding: 20 }}>

                      {/* Icon + file type badge */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={22} color="#2563EB" />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 9px', borderRadius: 6, background: ft.bg, color: ft.fg, border: `1px solid ${ft.border}` }}>
                          {ft.label}
                        </span>
                      </div>

                      {/* Name */}
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 4, wordBreak: 'break-word' }}>
                        {resume.name}
                      </div>

                      {/* Meta — date and size */}
                      <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Calendar size={13} color="#94A3B8" />
                          <span style={{ fontSize: 12, color: '#94A3B8' }}>{formatDate(resume.created_at)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <HardDrive size={13} color="#94A3B8" />
                          <span style={{ fontSize: 12, color: '#94A3B8' }}>{formatSize(resume.file_size)}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleDownload(resume)}
                          style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '9px 12px', background: '#EFF6FF', color: '#2563EB',
                            border: '1px solid #BFDBFE', borderRadius: 9, fontSize: 13, fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#2563EB' }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.borderColor = '#BFDBFE' }}
                        >
                          <Download size={15} /> Download
                        </button>
                        <button
                          onClick={() => handleDelete(resume)}
                          disabled={isDeleting}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '9px 12px', background: '#FEF2F2', color: '#DC2626',
                            border: '1px solid #FECACA', borderRadius: 9, fontSize: 13, fontWeight: 600,
                            cursor: isDeleting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { if (!isDeleting) { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#DC2626' } }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.borderColor = '#FECACA' }}
                        >
                          <Trash2 size={15} />
                          {isDeleting ? '...' : 'Delete'}
                        </button>
                      </div>

                    </div>
                  </div>
                )
              })}

             

            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default ResumeList