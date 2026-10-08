// Profile.jsx — fully responsive
// Same logic, responsive layout
// On mobile: single column, all cards stack

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import {
  User, Mail, KeyRound, Lock, Eye, EyeOff, Check,
  FileText, BarChart2, RefreshCw, Zap, Pencil, X, Trash2,
} from 'lucide-react'

function Profile() {

  const navigate = useNavigate()

  const [userName, setUserName] = useState(sessionStorage.getItem('hp_user_name') || '')
  const [userEmail, setUserEmail] = useState(sessionStorage.getItem('hp_user_email') || '')
  const [userId, setUserId] = useState('')
  const [memberSince, setMemberSince] = useState('')
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)

  const [jdCount, setJdCount] = useState(0)
  const [cvRewriteCount, setCvRewriteCount] = useState(0)

  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(sessionStorage.getItem('hp_user_name') || '')
  const [savingName, setSavingName] = useState(false)

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [groqKey, setGroqKey] = useState('')
  const [savedGroqKey, setSavedGroqKey] = useState('')
  const [savingGroqKey, setSavingGroqKey] = useState(false)
  const [showGroqKey, setShowGroqKey] = useState(false)

  const freeLimit = parseInt(import.meta.env.VITE_FREE_ANALYSIS_LIMIT) || 2

  useEffect(() => { getUser() }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }

    const name = user.user_metadata?.full_name || ''
    setUserName(name)
    setNewName(name)
    setUserEmail(user.email || '')
    setUserId(user.id)
    sessionStorage.setItem('hp_user_name', name || user.email)
    sessionStorage.setItem('hp_user_email', user.email || '')

    const date = new Date(user.created_at)
    setMemberSince(date.toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' }))

    const { data: resumeData } = await supabase
      .from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setResumes(resumeData || [])

    const { data: statsData } = await supabase
      .from('user_stats').select('*').eq('user_id', user.id).single()
    setJdCount(statsData?.jd_count || 0)
    setCvRewriteCount(statsData?.cv_rewrite_count || 0)

    const { data: profileData } = await supabase
      .from('profiles').select('groq_api_key').eq('id', user.id).single()
    if (profileData?.groq_api_key) {
      setGroqKey(profileData.groq_api_key)
      setSavedGroqKey(profileData.groq_api_key)
    }

    setLoading(false)
  }

  const handleSaveName = async () => {
    if (!newName.trim()) { toast.error('Name cannot be empty'); return }
    setSavingName(true)
    const { error } = await supabase.auth.updateUser({ data: { full_name: newName.trim() } })
    if (error) { toast.error('Error updating name'); setSavingName(false); return }
    setUserName(newName.trim())
    sessionStorage.setItem('hp_user_name', newName.trim())
    setEditingName(false); setSavingName(false)
    toast.success('Name updated!')
  }

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) { toast.error('Please fill in both fields'); return }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { toast.error('Error changing password'); setSavingPassword(false); return }
    setNewPassword(''); setConfirmPassword('')
    setShowPasswordForm(false); setSavingPassword(false)
    toast.success('Password changed!')
  }

  const handleSaveGroqKey = async () => {
    if (!groqKey.trim()) { toast.error('Please enter your Groq API key'); return }
    if (!groqKey.startsWith('gsk_')) { toast.error('Invalid key — Groq keys start with gsk_'); return }
    setSavingGroqKey(true)
    const { error } = await supabase.from('profiles').update({ groq_api_key: groqKey.trim() }).eq('id', userId)
    if (error) { toast.error('Error saving key'); setSavingGroqKey(false); return }
    setSavedGroqKey(groqKey.trim()); setSavingGroqKey(false)
    toast.success('Groq API key saved!')
  }

  const handleRemoveGroqKey = async () => {
    if (!window.confirm('Remove your Groq API key?')) return
    const { error } = await supabase.from('profiles').update({ groq_api_key: null }).eq('id', userId)
    if (error) { toast.error('Error removing key'); return }
    setGroqKey(''); setSavedGroqKey('')
    toast.success('Groq API key removed')
  }

  const iStyle = {
    width: '100%', boxSizing: 'border-box',
    border: '1px solid #E5E9F0', borderRadius: 10,
    fontSize: 14, color: '#0F172A', background: '#fff',
    fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }
  const iFocus = e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)' }
  const iBlur  = e => { e.target.style.borderColor = '#E5E9F0'; e.target.style.boxShadow = 'none' }

  const usagePct = Math.min((jdCount / freeLimit) * 100, 100)
  const usageOver = jdCount >= freeLimit

  return (
    <Layout userName={userName} resumes={resumes} recentJDs={[]}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap');
        .pf-wrap { padding: 28px 28px 56px; font-family: Figtree, system-ui, sans-serif; }
        .pf-main { display: grid; grid-template-columns: 260px 1fr; gap: 20px; align-items: start; }
        .pf-right { display: flex; flex-direction: column; gap: 16px; }
        .pf-top-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
        .pf-groq-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 900px) {
          .pf-main { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .pf-wrap { padding: 16px 16px 48px; }
          .pf-top-row { grid-template-columns: 1fr; }
          .pf-groq-inner { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="pf-wrap">

        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Bricolage Grotesque, Figtree, system-ui', fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>My Profile</h1>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
            <span style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Dashboard</span>
            {' / '}Profile
          </div>
        </div>

        <div className="pf-main">

          {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Avatar card */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E9F0', overflow: 'hidden' }}>
              <div style={{ height: 72, background: 'linear-gradient(135deg, #1a1a2e 0%, #2563EB 100%)' }} />
              <div style={{ padding: '0 20px 20px', marginTop: -32 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#2563EB', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bricolage Grotesque, system-ui', fontSize: 24, fontWeight: 800, color: '#fff', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontFamily: 'Bricolage Grotesque, system-ui', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{userName}</div>
                  <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>{userEmail}</div>
                  <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 6 }}>Member since {memberSince}</div>
                </div>
              </div>
            </div>

            {/* Activity */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E9F0', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ fontFamily: 'Bricolage Grotesque, system-ui', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Activity</div>
              </div>
              <div style={{ padding: '4px 20px 12px' }}>
                {[
                  { icon: FileText, label: 'Saved Resumes', value: resumes.length, bg: '#EFF6FF', fg: '#2563EB' },
                  { icon: BarChart2, label: 'JDs Analysed', value: jdCount, bg: '#ECFDF5', fg: '#059669' },
                  { icon: RefreshCw, label: 'CV Rewrites', value: cvRewriteCount, bg: '#F5F3FF', fg: '#7C3AED' },
                ].map(({ icon: Icon, label, value, bg, fg }, i) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: i ? '1px solid #F1F5F9' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={15} color={fg} />
                      </div>
                      <span style={{ fontSize: 13, color: '#475569' }}>{label}</span>
                    </div>
                    <span style={{ fontFamily: 'Bricolage Grotesque, system-ui', fontSize: 17, fontWeight: 700, color: fg }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Free usage */}
            <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${usageOver && !savedGroqKey ? '#FECACA' : '#E5E9F0'}`, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontFamily: 'Bricolage Grotesque, system-ui', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Free Usage</div>
                {savedGroqKey && <span style={{ fontSize: 11, fontWeight: 600, background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '3px 8px', borderRadius: 999 }}>Unlimited</span>}
              </div>
              <div style={{ fontSize: 13, color: '#475569', marginBottom: 10 }}>{jdCount} of {freeLimit} free analyses used</div>
              <div style={{ height: 7, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', width: `${usagePct}%`, background: usageOver ? '#DC2626' : '#2563EB', borderRadius: 4, transition: 'width 0.5s ease' }} />
              </div>
              {usageOver && !savedGroqKey && <div style={{ fontSize: 12, color: '#DC2626', lineHeight: 1.5 }}>⚠️ Limit reached. Add your Groq API key below.</div>}
              {savedGroqKey && <div style={{ fontSize: 12, color: '#059669', display: 'flex', alignItems: 'center', gap: 5 }}><Check size={13} strokeWidth={3} /> Using your own Groq key</div>}
            </div>

          </div>

          {/* ── RIGHT AREA ────────────────────────────────────────── */}
          <div className="pf-right">

            {/* Account Details + Password */}
            <div className="pf-top-row">

              {/* Account Details */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E9F0', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ fontFamily: 'Bricolage Grotesque, system-ui', fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Account Details</div>
                </div>
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>

                  {/* Full name */}
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 7 }}>Full Name</label>
                    {editingName ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <User size={15} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Your full name" autoFocus
                            style={{ ...iStyle, padding: '10px 14px 10px 36px' }} onFocus={iFocus} onBlur={iBlur} />
                        </div>
                        <button onClick={handleSaveName} disabled={savingName}
                          style={{ padding: '10px 14px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                          {savingName ? '…' : 'Save'}
                        </button>
                        <button onClick={() => { setEditingName(false); setNewName(userName) }}
                          style={{ padding: '10px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E5E9F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <User size={15} color="#94A3B8" />
                          <span style={{ fontSize: 14, color: '#0F172A' }}>{userName}</span>
                        </div>
                        <button onClick={() => setEditingName(true)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                          <Pencil size={12} /> Edit
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 7 }}>Email Address</label>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E5E9F0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                        <Mail size={15} color="#94A3B8" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '3px 7px', borderRadius: 999, flexShrink: 0, marginLeft: 6 }}>Verified</span>
                    </div>
                  </div>

                  {/* User ID */}
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 7 }}>User ID</label>
                    <div style={{ padding: '10px 13px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E5E9F0', fontSize: 11, color: '#94A3B8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userId}</div>
                  </div>

                </div>
              </div>

              {/* Password */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E9F0', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontFamily: 'Bricolage Grotesque, system-ui', fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Password</div>
                  <button onClick={() => setShowPasswordForm(!showPasswordForm)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: showPasswordForm ? '#FEF2F2' : '#F1F5F9', color: showPasswordForm ? '#DC2626' : '#475569', border: `1px solid ${showPasswordForm ? '#FECACA' : '#E5E9F0'}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Lock size={13} /> {showPasswordForm ? 'Cancel' : 'Change'}
                  </button>
                </div>
                {showPasswordForm ? (
                  <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 13 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 6 }}>New Password</label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={15} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters"
                          style={{ ...iStyle, padding: '10px 44px 10px 36px' }} onFocus={iFocus} onBlur={iBlur} />
                        <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                          style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4 }}>
                          {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 6 }}>Confirm Password</label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={15} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input type={showConfirmPw ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Type again"
                          style={{ ...iStyle, padding: '10px 44px 10px 36px' }} onFocus={iFocus} onBlur={iBlur} />
                        <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                          style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4 }}>
                          {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                    <button onClick={handleChangePassword} disabled={savingPassword}
                      style={{ padding: '11px', background: savingPassword ? '#93C5FD' : '#2563EB', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: savingPassword ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                      onMouseEnter={e => { if (!savingPassword) e.currentTarget.style.background = '#1D4ED8' }}
                      onMouseLeave={e => { if (!savingPassword) e.currentTarget.style.background = '#2563EB' }}>
                      {savingPassword ? 'Saving…' : 'Update Password'}
                    </button>
                  </div>
                ) : (
                  <div style={{ padding: '16px 20px' }}>
                    <span style={{ fontSize: 22, color: '#CBD5E1', letterSpacing: 4 }}>••••••••••</span>
                  </div>
                )}
              </div>

            </div>

            {/* Groq API Key — full width */}
            <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${savedGroqKey ? '#A7F3D0' : '#E5E9F0'}`, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontFamily: 'Bricolage Grotesque, system-ui', fontSize: 15, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <KeyRound size={16} color="#2563EB" /> Groq API Key
                  </div>
                  <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>First {freeLimit} analyses free. Add your own key for unlimited use.</div>
                </div>
                {savedGroqKey && <span style={{ fontSize: 12, fontWeight: 600, background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>✓ Key saved</span>}
              </div>

              <div style={{ padding: 20 }}>
                <div className="pf-groq-inner">

                  {/* Left — info + input + buttons */}
                  <div>
                    <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '11px 14px', marginBottom: 14, fontSize: 13, color: '#1D4ED8', lineHeight: 1.6 }}>
                      <Zap size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                      Get your free key from{' '}<a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ fontWeight: 700, color: '#2563EB' }}>console.groq.com</a>{' '}— 1,000 free requests per day.
                    </div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 7 }}>Your Groq API Key</label>
                    <div style={{ position: 'relative', marginBottom: 12 }}>
                      <KeyRound size={14} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input type={showGroqKey ? 'text' : 'password'} placeholder="gsk_xxxxxxxxxxxxxxxxxxxx" value={groqKey} onChange={e => setGroqKey(e.target.value)}
                        style={{ ...iStyle, padding: '10px 44px 10px 36px', fontFamily: 'monospace' }} onFocus={iFocus} onBlur={iBlur} />
                      <button type="button" onClick={() => setShowGroqKey(!showGroqKey)}
                        style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4 }}>
                        {showGroqKey ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={handleSaveGroqKey} disabled={savingGroqKey}
                        style={{ flex: 1, padding: '11px', background: savingGroqKey ? '#93C5FD' : '#2563EB', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: savingGroqKey ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        onMouseEnter={e => { if (!savingGroqKey) e.currentTarget.style.background = '#1D4ED8' }}
                        onMouseLeave={e => { if (!savingGroqKey) e.currentTarget.style.background = '#2563EB' }}>
                        <Check size={15} /> {savingGroqKey ? 'Saving…' : 'Save Key'}
                      </button>
                      {savedGroqKey && (
                        <button onClick={handleRemoveGroqKey}
                          style={{ padding: '11px 14px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.color = '#fff' }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626' }}>
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right — YouTube video */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>🎬 Watch how to get your Groq API key</div>
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 10, overflow: 'hidden', border: '1px solid #E5E9F0' }}>
                      <iframe src="https://www.youtube.com/embed/bZuW0NVTE3I" title="How to get your Groq API key"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Profile