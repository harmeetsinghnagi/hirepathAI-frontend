// LandingPage.jsx
// HirePathAI landing page — fully responsive
// Same content and design, stacks correctly on mobile and tablet

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check, X, ArrowRight, Sparkles, PartyPopper, LayoutDashboard, FileText, FilePlus,
  User, PenLine, Upload, ClipboardList, Download, Search, Gauge, Mail, RefreshCw,
  GraduationCap, Globe, Briefcase, Gift, Lock, Bot, MapPin, ChevronDown,
} from 'lucide-react'

const C = {
  blue: '#2563EB', blueDark: '#1D4ED8', blueSoft: '#EFF6FF', blueLine: '#BFDBFE',
  navy: '#1a1a2e', ink: '#0F172A', body: '#475569', muted: '#94A3B8',
  paper: '#F7F9FC', line: '#E5E9F0',
  green: '#059669', greenSoft: '#ECFDF5', greenLine: '#A7F3D0',
  red: '#DC2626', redSoft: '#FEF2F2', redLine: '#FECACA',
}

function PageStyles() {
  return (
    <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap');
      *, *::before, *::after { box-sizing: border-box; }
      .lp-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
      .lp-display { font-family: 'Bricolage Grotesque', 'Figtree', system-ui, sans-serif; }
      .lp-focus:focus-visible { outline: 3px solid #93C5FD; outline-offset: 2px; border-radius: 10px; }

      .lp-hero { display: flex; align-items: center; gap: 64px; flex-wrap: wrap; }
      .lp-hero-left { flex: 1 1 340px; max-width: 540px; }
      .lp-hero-right { flex: 1 1 320px; display: flex; justify-content: center; }
      .lp-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .lp-three-col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      .lp-four-col { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
      .lp-trust { display: grid; grid-template-columns: repeat(4, 1fr); }
      .lp-nz { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start; }
      .lp-footer-top { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 40px; margin-bottom: 48px; }
      .lp-footer-links { display: flex; gap: 64px; flex-wrap: wrap; }
      .lp-navlinks { display: flex; align-items: center; gap: 32px; }
      .lp-mock { width: 100%; max-width: 480px; }

      /* Desktop auth buttons */
      .lp-nav-auth { display: flex; align-items: center; gap: 6px; }
      .lp-nav-login { font-size: 15px; color: #0F172A; background: none; border: none; cursor: pointer; font-weight: 600; padding: 8px 14px; font-family: inherit; }
      .lp-nav-signup { font-size: 15px; background: #2563EB; color: #fff; border: none; padding: 9px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; font-family: inherit; white-space: nowrap; }
      .lp-hamburger { display: none; flex-direction: column; justify-content: center; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px; }
      .lp-hamburger span { display: block; width: 22px; height: 2px; background: #0F172A; border-radius: 2px; }

      /* Tablet — 768px */
      @media (max-width: 768px) {
        .lp-hero { gap: 40px; }
        .lp-hero-left { max-width: 100%; flex: 1 1 100%; }
        .lp-hero-right { flex: 1 1 100%; }
        .lp-two-col { grid-template-columns: 1fr; }
        .lp-three-col { grid-template-columns: 1fr; }
        .lp-four-col { grid-template-columns: 1fr 1fr; gap: 12px; }
        .lp-trust { grid-template-columns: 1fr 1fr; }
        .lp-nz { grid-template-columns: 1fr; gap: 40px; }
        .lp-mock { max-width: 100%; }
        .lp-navlinks { display: none; }
        .lp-nav-login { display: none; }
        .lp-nav-signup { display: none; }
        .lp-hamburger { display: flex; }
      }

      /* Mobile — 480px */
      @media (max-width: 480px) {
        .lp-four-col { grid-template-columns: 1fr; }
        .lp-trust { grid-template-columns: 1fr 1fr; }
        .lp-footer-links { gap: 32px; }
        .lp-stats-grid { grid-template-columns: 1fr 1fr !important; }
        .lp-nav-signup { font-size: 12px; padding: 7px 12px; }
      }
    `}</style>
  )
}

function Badge({ icon: Icon, children, tone = 'blue', dark }) {
  const tones = {
    blue: { bg: C.blueSoft, fg: C.blue, bd: C.blueLine },
    green: { bg: C.greenSoft, fg: C.green, bd: C.greenLine },
  }
  const t = dark
    ? { bg: 'rgba(37,99,235,0.18)', fg: '#93C5FD', bd: 'rgba(147,197,253,0.25)' }
    : tones[tone]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: t.bg, color: t.fg, border: `1px solid ${t.bd}`, fontSize: 13, fontWeight: 600, padding: '5px 12px', borderRadius: 999 }}>
      {Icon && <Icon size={14} strokeWidth={2.4} />}
      {children}
    </span>
  )
}

function Btn({ children, onClick, variant = 'primary', full, href }) {
  const [hover, setHover] = useState(false)
  const styles = {
    primary: { background: hover ? C.blueDark : C.blue, color: '#fff', border: '1px solid transparent', boxShadow: '0 1px 2px rgba(15,23,42,0.08), 0 6px 16px -6px rgba(37,99,235,0.5)' },
    secondary: { background: '#fff', color: C.ink, border: `1px solid ${hover ? C.blue : C.line}` },
    light: { background: hover ? C.blueSoft : '#fff', color: C.blue, border: '1px solid transparent' },
  }
  const common = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: full ? '100%' : 'auto',
    padding: '13px 24px', borderRadius: 10, fontSize: 15, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none',
    transition: 'background 0.15s, border-color 0.15s',
    ...styles[variant],
  }
  const events = { onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false) }
  if (href) return <a className="lp-focus" href={href} target="_blank" rel="noreferrer" style={common} {...events}>{children}</a>
  return <button className="lp-focus" onClick={onClick} style={common} {...events}>{children}</button>
}

function SectionHead({ badge, title, text, dark, center = true }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', maxWidth: 620, margin: center ? '0 auto 56px' : '0 0 48px' }}>
      <div style={{ marginBottom: 16 }}>{badge}</div>
      <h2 className="lp-display" style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.12, color: dark ? '#fff' : C.ink, margin: '0 0 14px' }}>{title}</h2>
      <p style={{ fontSize: 17, lineHeight: 1.7, color: dark ? 'rgba(255,255,255,0.6)' : C.body, margin: 0 }}>{text}</p>
    </div>
  )
}

function SkillTag({ label, ok }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 600,
      background: ok ? C.greenSoft : C.redSoft,
      color: ok ? C.green : C.red,
      border: `1px solid ${ok ? C.greenLine : C.redLine}`,
    }}>
      {ok ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />} {label}
    </span>
  )
}

function IconTile({ icon: Icon, size = 44, bg = C.blueSoft, fg = C.blue }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={size * 0.48} color={fg} strokeWidth={2} />
    </div>
  )
}

function AppMock() {
  const side = [LayoutDashboard, FileText, FilePlus, User]
  return (
    <div className="lp-mock" style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.line}`, boxShadow: '0 1px 2px rgba(15,23,42,0.05), 0 30px 60px -20px rgba(15,23,42,0.25)', overflow: 'hidden' }}>
      <div style={{ background: '#FAFBFD', padding: '10px 14px', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#F87171', '#FBBF24', '#34D399'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, background: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: C.muted, border: `1px solid ${C.line}`, textAlign: 'center' }}>
          app.hirepathAI.co.nz
        </div>
      </div>
      <div style={{ display: 'flex', height: 340 }}>
        <div style={{ width: 56, background: C.navy, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 0', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: C.blue, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, marginBottom: 6 }}>⚡</div>
          {side.map((Icon, i) => (
            <div key={i} style={{ width: 34, height: 34, borderRadius: 8, background: i === 0 ? 'rgba(37,99,235,0.25)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={16} color={i === 0 ? '#93C5FD' : 'rgba(255,255,255,0.45)'} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, background: '#F0F4F8', padding: 14, overflow: 'hidden' }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>Welcome, Harmeet 👋</div>
            <div style={{ fontSize: 10, color: C.muted }}>Paste a job description to get started</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${C.line}`, padding: '9px 10px', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8, fontWeight: 700 }}>1</div>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.ink }}>Paste Job Description</span>
            </div>
            <div style={{ background: '#FAFBFD', borderRadius: 5, border: `1px solid ${C.line}`, padding: '6px 8px', fontSize: 8.5, color: C.muted, lineHeight: 1.45 }}>
              We are looking for a Senior Frontend Developer with experience in React and TypeScript...
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${C.line}`, padding: '9px 10px', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8, fontWeight: 700 }}>2</div>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.ink }}>Choose Your CV</span>
            </div>
            <div style={{ background: C.greenSoft, borderRadius: 5, border: `1px solid ${C.greenLine}`, padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Check size={11} color={C.green} strokeWidth={3} />
              <span style={{ fontSize: 9, fontWeight: 600, color: C.green }}>Harmeet Singh CV selected</span>
            </div>
          </div>
          <div style={{ background: C.blue, borderRadius: 8, padding: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>⚡ Get my results</span>
            <ArrowRight size={11} color="#fff" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultsMock() {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.line}`, boxShadow: '0 1px 2px rgba(15,23,42,0.05), 0 24px 48px -20px rgba(15,23,42,0.2)', padding: 20, width: '100%', maxWidth: 440 }}>
      <div style={{ background: C.paper, borderRadius: 12, border: `1px solid ${C.line}`, padding: 18, marginBottom: 12, textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Overall match score</div>
        <div className="lp-display" style={{ fontSize: 52, fontWeight: 800, color: C.green, lineHeight: 1 }}>78%</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Senior Frontend Developer · Xero, Wellington</div>
        <div style={{ height: 6, background: C.line, borderRadius: 3, marginTop: 14, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '78%', background: C.green, borderRadius: 3 }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div style={{ background: C.greenSoft, border: `1px solid ${C.greenLine}`, borderRadius: 10, padding: 12, textAlign: 'center' }}>
          <div className="lp-display" style={{ fontSize: 26, fontWeight: 800, color: C.green }}>8</div>
          <div style={{ fontSize: 11, color: C.body }}>Matched skills</div>
        </div>
        <div style={{ background: C.redSoft, border: `1px solid ${C.redLine}`, borderRadius: 10, padding: 12, textAlign: 'center' }}>
          <div className="lp-display" style={{ fontSize: 26, fontWeight: 800, color: C.red }}>3</div>
          <div style={{ fontSize: 11, color: C.body }}>Missing skills</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        <SkillTag label="React.js" ok />
        <SkillTag label="TypeScript" ok />
        <SkillTag label="Node.js" ok />
        <SkillTag label="AWS" ok={false} />
        <SkillTag label="GraphQL" ok={false} />
        <SkillTag label="Docker" ok={false} />
      </div>
      <div style={{ background: C.blueSoft, borderRadius: 10, border: `1px solid ${C.blueLine}`, padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Mail size={18} color={C.blue} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>Cover letter ready</div>
            <div style={{ fontSize: 11, color: C.body }}>NZ style · 320 words</div>
          </div>
        </div>
        <div style={{ background: C.blue, color: '#fff', fontSize: 11, fontWeight: 600, padding: '6px 11px', borderRadius: 7 }}>Download</div>
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#fff', border: `1px solid ${open ? C.blueLine : C.line}`, borderRadius: 12, marginBottom: 10, transition: 'border-color 0.15s' }}>
      <button
        className="lp-focus"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>{q}</span>
        <ChevronDown size={20} color={open ? C.blue : C.muted} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>
      {open && <p style={{ fontSize: 15, color: C.body, lineHeight: 1.7, margin: 0, padding: '0 20px 18px' }}>{a}</p>}
    </div>
  )
}

function LandingPage() {

  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  const wrap = { maxWidth: 1140, margin: '0 auto' }

  return (
    <div className="lp-body" style={{ minHeight: '100vh', background: '#fff', color: C.ink }}>
      <PageStyles />

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${scrolled ? C.line : 'transparent'}`,
        transition: 'border-color 0.2s',
      }}>
        <div style={{ ...wrap, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          <button className="lp-focus" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <span style={{ width: 32, height: 32, background: C.blue, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</span>
            <span className="lp-display" style={{ fontSize: 19, fontWeight: 800, color: C.ink, letterSpacing: '-0.3px' }}>HirePathAI</span>
          </button>

          {/* Desktop nav links */}
          <div className="lp-navlinks">
            {[['Features', 'features'], ['How it works', 'how'], ['Pricing', 'pricing'], ['FAQ', 'faq']].map(([label, id]) => (
              <button key={id} className="lp-focus" onClick={() => scrollTo(id)}
                style={{ fontSize: 15, color: C.body, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit' }}
                onMouseEnter={e => e.currentTarget.style.color = C.ink}
                onMouseLeave={e => e.currentTarget.style.color = C.body}
              >{label}</button>
            ))}
          </div>

          {/* Auth buttons + hamburger */}
          <div className="lp-nav-auth">
            <button className="lp-nav-login" onClick={() => navigate('/login')}>Log in</button>
            <button className="lp-nav-signup" onClick={() => navigate('/signup')}>Get started free</button>
            <button className="lp-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>

        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div style={{ background: '#fff', borderTop: `1px solid ${C.line}`, padding: '12px 20px 20px' }}>
            {[['Features', 'features'], ['How it works', 'how'], ['Pricing', 'pricing'], ['FAQ', 'faq']].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 0', fontSize: 16, color: C.ink, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, borderBottom: `1px solid ${C.line}` }}>
                {label}
              </button>
            ))}
            {/* Auth buttons in mobile menu */}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                onClick={() => { navigate('/login'); setMobileMenuOpen(false) }}
                style={{ flex: 1, padding: '12px', background: '#fff', color: C.ink, border: `1px solid ${C.line}`, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Log in
              </button>
              <button
                onClick={() => { navigate('/signup'); setMobileMenuOpen(false) }}
                style={{ flex: 1, padding: '12px', background: C.blue, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Get Started free
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(100px, 12vw, 136px) 20px clamp(48px, 8vw, 88px)' }}>
        <div style={{ ...wrap }}>
          <div className="lp-hero">

            <div className="lp-hero-left">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                <Badge icon={Sparkles}>Free AI-powered job application assistant</Badge>
                <Badge icon={PartyPopper} tone="green">Free for limited time only</Badge>
              </div>

              <h1 className="lp-display" style={{ fontSize: 'clamp(36px, 5.6vw, 64px)', fontWeight: 800, lineHeight: 1.06, color: C.ink, letterSpacing: '-2px', margin: '0 0 22px' }}>
                Apply smarter.<br />
                <span style={{ color: C.blue }}>Get hired faster.</span>
              </h1>

              <p style={{ fontSize: 'clamp(16px, 2vw, 18px)', color: C.body, lineHeight: 1.7, margin: '0 0 32px' }}>
                Upload your CV, paste a job description, and get AI-powered skill gap analysis, a professional cover letter, and an optional CV rewrite — completely free.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
                <Btn onClick={() => navigate('/signup')}>Get started free <ArrowRight size={17} /></Btn>
                <Btn variant="secondary" onClick={() => scrollTo('how')}>See how it works</Btn>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {['No credit card needed', '2 free analyses included', 'Built for NZ'].map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: C.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={11} color={C.green} strokeWidth={3.2} />
                    </span>
                    <span style={{ fontSize: 14, color: C.body }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lp-hero-right">
              <AppMock />
            </div>

          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ─────────────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, background: C.paper }}>
        <div style={{ ...wrap }}>
          <div className="lp-trust">
            {[
              { v: '2 Free Analyses', l: 'For limited time only' },
              { v: 'Groq API', l: 'Powered by GPT OSS 20B' },
              { v: 'Under 10 seconds', l: 'AI response time' },
              { v: 'NZ Style', l: 'Cover letters' },
            ].map(({ v, l }, i) => (
              <div key={l} style={{ textAlign: 'center', padding: '20px 12px', borderLeft: i ? `1px solid ${C.line}` : 'none' }}>
                <div className="lp-display" style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>{v}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how" style={{ padding: 'clamp(64px, 8vw, 104px) 20px', background: C.navy }}>
        <div style={wrap}>
          <SectionHead
            dark
            badge={<Badge dark icon={Sparkles}>Simple process</Badge>}
            title="Ready in minutes"
            text="Four simple steps. No confusing setup. Just a clear process that gets you a better application fast."
          />
          <div className="lp-four-col" style={{ marginBottom: 48 }}>
            {[
              { n: 1, icon: PenLine, title: 'Create account', desc: 'Sign up with your email. No credit card needed. Ready in seconds.' },
              { n: 2, icon: Upload, title: 'Upload your CV', desc: 'Drop in PDF or DOCX. AI reads and understands everything instantly.' },
              { n: 3, icon: ClipboardList, title: 'Paste job description', desc: 'Copy from Seek or LinkedIn. Paste it in and let AI do the analysis.' },
              { n: 4, icon: Download, title: 'Download results', desc: 'Get your skill gap report and tailored cover letter instantly.' },
            ].map(s => (
              <div key={s.n} style={{ padding: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <IconTile icon={s.icon} bg="rgba(37,99,235,0.2)" fg="#93C5FD" />
                  <span className="lp-display" style={{ fontSize: 30, fontWeight: 800, color: 'rgba(255,255,255,0.12)', lineHeight: 1 }}>0{s.n}</span>
                </div>
                <h3 className="lp-display" style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Btn onClick={() => navigate('/signup')}>Start for free now <ArrowRight size={17} /></Btn>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 14 }}>2 free analyses included. No credit card needed.</p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: 'clamp(64px, 8vw, 104px) 20px', background: C.paper }}>
        <div style={wrap}>
          <SectionHead
            badge={<Badge icon={Sparkles}>Everything you need</Badge>}
            title={<>Five AI tools.<br />One free platform.</>}
            text="Everything you need to prepare a stronger more relevant job application — without paying a cent."
          />
          <div className="lp-two-col" style={{ marginBottom: 16 }}>
            <div style={{ background: C.blue, borderRadius: 20, padding: 'clamp(24px, 4vw, 36px)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', border: '40px solid rgba(255,255,255,0.06)' }} />
              <IconTile icon={FileText} size={52} bg="rgba(255,255,255,0.16)" fg="#fff" />
              <h3 className="lp-display" style={{ fontSize: 22, fontWeight: 800, margin: '20px 0 10px' }}>CV Parser</h3>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, margin: '0 0 20px' }}>
                Upload your CV in PDF or DOCX format. Our AI automatically reads and extracts your experience, skills, education, and certifications in seconds. No manual entry needed.
              </p>
              <button className="lp-focus" onClick={() => navigate('/signup')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#fff', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}>
                Upload your CV <ArrowRight size={16} />
              </button>
            </div>
            <div style={{ background: C.navy, borderRadius: 20, padding: 'clamp(24px, 4vw, 36px)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', border: '40px solid rgba(37,99,235,0.12)' }} />
              <IconTile icon={Search} size={52} bg="rgba(37,99,235,0.22)" fg="#93C5FD" />
              <h3 className="lp-display" style={{ fontSize: 22, fontWeight: 800, margin: '20px 0 10px' }}>Job Description Analyser</h3>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: '0 0 20px' }}>
                Paste any job description from Seek, LinkedIn or any job board. Our AI breaks down the key requirements, must-have skills, responsibilities and qualifications instantly.
              </p>
              <button className="lp-focus" onClick={() => navigate('/signup')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#93C5FD', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}>
                Analyse any job <ArrowRight size={16} />
              </button>
            </div>
          </div>
          <div className="lp-three-col">
            {[
              { icon: Gauge, fg: '#B45309', bg: '#FEF3C7', tag: 'Most popular', title: 'Skill Gap Analysis', desc: 'See your exact match percentage. Get a clear side by side view of matched skills in green and missing skills in red.' },
              { icon: Mail, fg: '#6D28D9', bg: '#EDE9FE', tag: 'NZ Style', title: 'Cover Letter Generator', desc: 'AI writes a professional New Zealand style cover letter tailored specifically to your CV and the role.' },
              { icon: RefreshCw, fg: '#BE185D', bg: '#FCE7F3', tag: 'Optional', title: 'CV Rewrite', desc: 'Get an AI optimised version of your CV rephrased and restructured to better match the specific job description.' },
            ].map(f => (
              <div key={f.title} style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <IconTile icon={f.icon} bg={f.bg} fg={f.fg} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: f.fg, background: f.bg, padding: '4px 10px', borderRadius: 999 }}>{f.tag}</span>
                </div>
                <h3 className="lp-display" style={{ fontSize: 18, fontWeight: 700, color: C.ink, margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: C.body, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NZ FOCUS ────────────────────────────────────────────────────────── */}
      <section style={{ background: C.navy, padding: 'clamp(64px, 8vw, 104px) 20px' }}>
        <div style={wrap}>
          <div className="lp-nz">
            <div>
              <div style={{ marginBottom: 20 }}><Badge dark icon={MapPin}>Built for New Zealand</Badge></div>
              <h2 className="lp-display" style={{ fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 800, color: '#fff', margin: '0 0 16px', lineHeight: 1.12, letterSpacing: '-0.8px' }}>
                Designed for the NZ job market
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 32 }}>
                HirePathAI generates cover letters in New Zealand professional style. Built especially for fresh graduates, international students, and career changers entering the New Zealand workforce.
              </p>
              <div className="lp-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { value: '2', label: 'Free analyses included' },
                  { value: 'NZ', label: 'Style cover letters' },
                  { value: '100%', label: 'Free to use' },
                  { value: '5+', label: 'AI powered tools' },
                ].map(({ value, label }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="lp-display" style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{value}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>What you get</div>
              {[
                { icon: Mail, label: 'NZ-style cover letters', desc: 'Written in local professional style' },
                { icon: GraduationCap, label: 'Great for graduates', desc: 'Perfect for fresh graduates entering NZ' },
                { icon: Globe, label: 'International students', desc: 'Understand local job market expectations' },
                { icon: Briefcase, label: 'Works with Seek & LinkedIn', desc: 'Copy paste any NZ job description' },
                { icon: Gift, label: 'Completely free', desc: '2 analyses free, add Groq key for unlimited' },
                { icon: Lock, label: 'Secure & private', desc: 'Your CV data is never shared' },
              ].map(({ icon: Icon, label, desc }, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0', borderTop: i ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                  <Icon size={20} color="#93C5FD" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: 'clamp(64px, 8vw, 104px) 20px', background: C.paper }}>
        <div style={{ maxWidth: 940, margin: '0 auto' }}>
          <SectionHead
            badge={<Badge icon={Sparkles}>Simple pricing</Badge>}
            title="Simple and free"
            text="No subscription. No hidden fees. Just free AI tools for job seekers."
          />
          <div className="lp-two-col" style={{ marginBottom: 24 }}>
            <div style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 20, padding: 'clamp(24px, 4vw, 36px)', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.blue, marginBottom: 6 }}>Starter Plan</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                <span className="lp-display" style={{ fontSize: 52, fontWeight: 800, color: C.ink, lineHeight: 1 }}>$0</span>
                <Badge tone="green">FREE</Badge>
              </div>
              <div style={{ fontSize: 14, color: C.muted, marginBottom: 26 }}>2 free analyses — no credit card needed</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 30, flex: 1 }}>
                {['2 free AI job analyses', 'CV upload and parsing', 'Skill gap analysis', 'NZ style cover letters', 'CV rewrite feature', 'Save multiple resumes'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Check size={17} color={C.green} strokeWidth={3} />
                    <span style={{ fontSize: 15, color: C.ink }}>{f}</span>
                  </div>
                ))}
              </div>
              <Btn full onClick={() => navigate('/signup')}>Get started free</Btn>
            </div>
            <div style={{ background: C.blue, borderRadius: 20, padding: 'clamp(24px, 4vw, 36px)', color: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 48px -20px rgba(37,99,235,0.55)' }}>
              
              <div style={{ fontSize: 15, fontWeight: 700, color: '#BFDBFE', marginBottom: 6 }}>Unlimited Plan</div>
              <div className="lp-display" style={{ fontSize: 52, fontWeight: 800, lineHeight: 1, marginBottom: 6 }}>Free
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#10B981', color: '#fff', fontSize: 13, fontWeight: 600, padding: '5px 12px', borderRadius: 999, marginLeft: '6px' }}>
                  <PartyPopper size={14} /> Free for limited time only
                </span>
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 26 }}>Bring your own Groq API key</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 30, flex: 1 }}>
                {['Unlimited AI analyses', 'Your own free Groq API key', '1000 free requests per day', 'Everything in Starter Plan', 'No limits on CV rewrites', 'Cover letters every day'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Check size={17} color="#BFDBFE" strokeWidth={3} />
                    <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.92)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Btn full variant="light" href="https://console.groq.com">Get free Groq API key <ArrowRight size={17} /></Btn>
            </div>
          </div>
          
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: 'clamp(64px, 8vw, 104px) 20px', background: '#fff' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <SectionHead
            badge={<Badge icon={Sparkles}>FAQ</Badge>}
            title="Questions people ask"
            text="Everything you need to know before you start."
          />
          <FaqItem q="Is HirePathAI really free?" a="Yes. Every account gets 2 free analyses. After that you can add your own free Groq API key in your Profile and keep using HirePathAI without paying anything." />
          <FaqItem q="What is a Groq API key and how do I get one?" a="Groq is the service that runs the AI. Sign up at console.groq.com, open API Keys, create a key that starts with gsk_, and paste it into your HirePathAI Profile." />
          <FaqItem q="Which file types can I upload?" a="PDF and Word (.docx) files up to 5MB. Scanned images of a CV won't work, because the text needs to be readable." />
          <FaqItem q="Will the CV rewrite make things up?" a="No. The rewrite keeps your real job titles, companies and dates. It only rephrases what you've already done so it lines up with the job ad." />
          <FaqItem q="Is my CV kept private?" a="Your CV is stored in your own account and only you can see or download it. You can delete it at any time from My Resumes." />
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 20px clamp(64px, 8vw, 104px)', background: '#fff' }}>
        <div style={{
          ...wrap, borderRadius: 24, background: C.blue,
          padding: 'clamp(40px, 6vw, 88px) 24px', textAlign: 'center',
          backgroundImage: 'radial-gradient(600px 300px at 50% 0%, rgba(255,255,255,0.14), transparent 70%)',
        }}>
          <div style={{ maxWidth: 620, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', fontSize: 13, fontWeight: 600, padding: '5px 12px', borderRadius: 999 }}>
                <PartyPopper size={14} /> Free for limited time only
              </span>
            </div>
            <h2 className="lp-display" style={{ fontSize: 'clamp(28px, 4.4vw, 48px)', fontWeight: 800, color: '#fff', letterSpacing: '-1.2px', margin: '0 0 16px', lineHeight: 1.1 }}>
              Your next application starts here
            </h2>
            <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 36 }}>
              Get 2 free AI-powered analyses. No credit card. No subscription. Just better job applications built for New Zealand job seekers.
            </p>
            <Btn variant="light" onClick={() => navigate('/signup')}>Get started free <ArrowRight size={17} /></Btn>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 16 }}>
              2 free analyses included. Add your own Groq key for unlimited use.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{ background: C.navy, padding: 'clamp(40px, 6vw, 64px) 20px 32px' }}>
        <div style={wrap}>
          <div className="lp-footer-top">
            <div style={{ maxWidth: 300 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ width: 30, height: 30, background: C.blue, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⚡</span>
                <span className="lp-display" style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>HirePathAI</span>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0 }}>
                A free AI-powered job application assistant for New Zealand job seekers. Powered by Groq API.
              </p>
            </div>
            <div className="lp-footer-links">
              {[
                { h: 'Product', links: [['Features', 'features'], ['How it works', 'how'], ['Pricing', 'pricing'], ['FAQ', 'faq']] },
                { h: 'Legal', links: [['Privacy'], ['Terms'], ['Contact', 'https://harmeet-singh-portfolio.netlify.app/']] },
              ].map(({ h, links }) => (
                <div key={h}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>{h}</div>
                  {links.map(([label, id]) => (
                    id?.startsWith('http') ? (
                      <a key={label} href={id} target="_blank" rel="noreferrer"
                        style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: 12 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                      >{label}</a>
                    ) : (
                      <button key={label} className="lp-focus" onClick={() => id && scrollTo(id)}
                        style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', padding: 0, marginBottom: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                      >{label}</button>
                    )
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>© {new Date().getFullYear()} HirePathAI — MSc Software Engineering Capstone — Yoobee College</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Built by Er. Harmeet Singh · Powered by Groq API</span>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage