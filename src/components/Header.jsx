// Header.jsx — fully responsive
// On mobile: sidebar hidden, hamburger in header toggles sidebar overlay

import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { User, LogOut, ChevronDown, Bell, Mail, Menu } from 'lucide-react'

function Header({ userName, onMenuToggle }) {

  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    sessionStorage.removeItem('hp_user_name')
    sessionStorage.removeItem('hp_user_email')
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <>
      <style>{`
        .hp-header-right { display: flex; align-items: center; gap: 4px; }
        .hp-icon-btn { background: none; border: none; border-radius: 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s; }
        .hp-icon-btn:hover { background: #f3f4f6; }
        .hp-hamburger { display: none; background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; }
        .hp-hamburger:hover { background: #f3f4f6; }
        @media (max-width: 768px) {
          .hp-hamburger { display: flex; align-items: center; justify-content: center; }
        }
      `}</style>

      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: 56, background: '#ffffff',
        borderBottom: '1px solid #e9ecef',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>

        {/* ── LEFT — Hamburger + Logo ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Hamburger — mobile only */}
          <button className="hp-hamburger" onClick={onMenuToggle} aria-label="Toggle menu">
            <Menu size={22} color="#374151" />
          </button>

          {/* Logo */}
          <div onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 32, height: 32, background: '#2563EB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
            <span style={{ color: '#111827', fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px' }}>HirePathAI</span>
          </div>
        </div>

        {/* ── RIGHT — Icons + User ── */}
        <div className="hp-header-right">

        
          <div style={{ width: 1, height: 24, background: '#e9ecef', margin: '0 8px' }} />

          {/* User dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 8, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{ width: 30, height: 30, background: '#2563EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span style={{ color: '#111827', fontSize: 13, fontWeight: 600 }}>
                {userName ? userName.split(' ')[0] : 'User'}
              </span>
              <ChevronDown size={13} color="#9CA3AF" />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div style={{ position: 'absolute', top: '110%', right: 0, background: '#fff', borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', minWidth: 190, zIndex: 100, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{userName}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Logged in</div>
                </div>
                <button onClick={() => { setUserMenuOpen(false); navigate('/profile') }}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, color: '#374151', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <User size={14} color="#6B7280" /> Profile
                </button>
                <button onClick={handleLogout}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <LogOut size={14} color="#DC2626" /> Log out
                </button>
              </div>
            )}
          </div>

        </div>
      </header>
    </>
  )
}

export default Header