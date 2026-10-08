// SignupPage.jsx — fully responsive
// On desktop: dark left panel + clean form on right
// On mobile: stacks to single column, left panel hidden

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Check } from 'lucide-react'

function SignupPage() {

  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    if (!fullName || !email || !password) { setError('Please fill in all fields'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    const { error: signupError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } }
    })
    if (signupError) { setError(signupError.message); setLoading(false); return }
    navigate('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Figtree, system-ui, sans-serif' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap');
        .auth-input:focus { outline: none; border-color: #2563EB !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.12) !important; }
        .auth-input::placeholder { color: #94A3B8; }
        .signup-left { width: 460px; flex-shrink: 0; background: #1a1a2e; display: flex; flex-direction: column; justify-content: space-between; padding: 48px 52px; }
        .signup-right { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; background: #F6F8FB; overflow-y: auto; }
        @media (max-width: 860px) {
          .signup-left { display: none; }
          .signup-right { padding: 40px 20px; min-height: 100vh; }
        }
      `}</style>

      {/* ── LEFT PANEL ───────────────────────────────────────────────────── */}
      <div className="signup-left">

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: '#2563EB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
          <span style={{ fontFamily: 'Bricolage Grotesque, Figtree, system-ui', fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>HirePathAI</span>
        </div>

        {/* Middle content */}
        <div>
          <div style={{ width: 48, height: 3, background: '#2563EB', borderRadius: 2, marginBottom: 24 }} />
          <p style={{ fontFamily: 'Bricolage Grotesque, Figtree, system-ui', fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.3, letterSpacing: '-0.5px', marginBottom: 32 }}>
            Your free AI job application assistant
          </p>
          {[
            'Match score for every job you apply to',
            'Missing skills shown clearly with advice',
            'Cover letter written in NZ style',
            'Optional CV rewrite tailored to the role',
            '2 free analyses — no credit card needed',
          ].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <Check size={12} color="#93C5FD" strokeWidth={3} />
              </div>
              <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
           © {new Date().getFullYear()} HirePathAI · Built by Er. Harmeet Singh 
        </p>

      </div>

      {/* ── RIGHT — FORM ─────────────────────────────────────────────────── */}
      <div className="signup-right">
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36, justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, background: '#2563EB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
            <span style={{ fontFamily: 'Bricolage Grotesque, Figtree, system-ui', fontSize: 19, fontWeight: 800, color: '#0F172A' }}>HirePathAI</span>
          </div>

          {/* Heading */}
          <h1 style={{ fontFamily: 'Bricolage Grotesque, Figtree, system-ui', fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.8px', margin: '0 0 6px', textAlign: 'center' }}>
            Create your account
          </h1>
          <p style={{ fontSize: 16, color: '#475569', margin: '0 0 32px', textAlign: 'center' }}>
            Start with 2 free AI analyses — no credit card needed
          </p>

          {/* Error */}
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#DC2626', marginBottom: 20 }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Full name */}
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', display: 'block', marginBottom: 7 }}>Full name</label>
              <div style={{ position: 'relative' }}>
                <User size={17} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input className="auth-input" type="text" placeholder="Harmeet Singh" value={fullName} onChange={e => setFullName(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 42px', border: '1px solid #E5E9F0', borderRadius: 10, fontSize: 15, color: '#0F172A', background: '#fff', fontFamily: 'inherit', transition: 'border-color 0.15s, box-shadow 0.15s' }} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', display: 'block', marginBottom: 7 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 42px', border: '1px solid #E5E9F0', borderRadius: 10, fontSize: 15, color: '#0F172A', background: '#fff', fontFamily: 'inherit', transition: 'border-color 0.15s, box-shadow 0.15s' }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', display: 'block', marginBottom: 7 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={17} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input className="auth-input" type={showPassword ? 'text' : 'password'} placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 44px 12px 42px', border: '1px solid #E5E9F0', borderRadius: 10, fontSize: 15, color: '#0F172A', background: '#fff', fontFamily: 'inherit', transition: 'border-color 0.15s, box-shadow 0.15s' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#94A3B8' }}>
                  {showPassword ? <Eye size={17} /> : <EyeOff size={17} />}
                </button>
              </div>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>Minimum 6 characters</p>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', background: loading ? '#93C5FD' : '#2563EB', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s', marginTop: 4 }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1D4ED8' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2563EB' }}>
              {loading ? 'Creating account...' : <>Create free account <ArrowRight size={17} /></>}
            </button>

          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E5E9F0' }} />
            <span style={{ fontSize: 13, color: '#94A3B8' }}>Already have an account?</span>
            <div style={{ flex: 1, height: 1, background: '#E5E9F0' }} />
          </div>

          {/* Log in link */}
          <button onClick={() => navigate('/login')}
            style={{ width: '100%', padding: '13px', background: '#fff', color: '#0F172A', border: '1px solid #E5E9F0', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#2563EB'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E9F0'}>
            Log in instead
          </button>

          {/* Back to home */}
          <p style={{ textAlign: 'center', marginTop: 24 }}>
            <button onClick={() => navigate('/')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontFamily: 'inherit', fontSize: 14 }}
              onMouseEnter={e => e.currentTarget.style.color = '#2563EB'}
              onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
              ← Back to home
            </button>
          </p>

        </div>
      </div>

    </div>
  )
}

export default SignupPage
