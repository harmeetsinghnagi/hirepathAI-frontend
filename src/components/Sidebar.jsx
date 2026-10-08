// Sidebar.jsx — fully responsive
// On desktop: fixed left sidebar always visible
// On mobile: hidden by default, slides in as overlay when hamburger tapped

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, FilePlus, User, LogOut, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

function Sidebar({ userName, resumes = [], mobileOpen, onClose }) {

  const navigate = useNavigate()
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    sessionStorage.removeItem('hp_user_name')
    sessionStorage.removeItem('hp_user_email')
    await supabase.auth.signOut()
    toast.success('Logged out')
    navigate('/')
  }

  const handleNav = (path) => {
    navigate(path)
    onClose?.()
  }

  const SectionLabel = ({ text }) => (
    <div style={{ padding: '16px 20px 6px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
      {text}
    </div>
  )

  const MenuItem = ({ icon: Icon, label, path, onClick, danger }) => {
    const [hovered, setHovered] = useState(false)
    const active = path ? isActive(path) : false
    return (
      <button
        onClick={onClick || (() => handleNav(path))}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 20px', border: 'none',
          borderLeft: active ? '3px solid #2563EB' : '3px solid transparent',
          background: active ? 'rgba(37,99,235,0.15)' : hovered ? 'rgba(255,255,255,0.06)' : 'transparent',
          cursor: 'pointer', transition: 'all 0.15s ease', textAlign: 'left',
        }}
      >
        <Icon size={17} color={danger ? '#EF4444' : active ? '#60A5FA' : hovered ? '#fff' : 'rgba(255,255,255,0.55)'} />
        <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: danger ? '#EF4444' : active ? '#fff' : hovered ? '#fff' : 'rgba(255,255,255,0.65)', letterSpacing: '0.1px' }}>
          {label}
        </span>
      </button>
    )
  }

  const sidebarContent = (
    <aside style={{
      width: 240, background: '#1a1a2e',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      height: '100%', overflowY: 'auto',
    }}>

      {/* Mobile close button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#2563EB', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 800 }}>HirePathAI</span>
        </div>
        <button onClick={onClose} className="sidebar-close-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(255,255,255,0.5)', display: 'none' }}>
          <X size={20} />
        </button>
      </div>

      {/* User profile */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{userName || 'User'}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Welcome</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, paddingTop: 8, paddingBottom: 16 }}>
        <SectionLabel text="Dash Menu" />
        <MenuItem icon={LayoutDashboard} label="Dashboard" path="/dashboard" />
        <SectionLabel text="Resumes" />
        <MenuItem icon={FileText} label="My Resumes" path="/resumes" />
        <MenuItem icon={FilePlus} label="Add New Resume" path="/resumes/add" />
        <SectionLabel text="Account" />
        <MenuItem icon={User} label="Profile" path="/profile" />
      </nav>

      {/* Logout */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 8, paddingBottom: 16 }}>
        <MenuItem icon={LogOut} label="Log out" danger onClick={handleLogout} />
      </div>

    </aside>
  )

  return (
    <>
      <style>{`
        /* Desktop — fixed sidebar */
        .sidebar-desktop {
          position: fixed; left: 0; top: 56px; bottom: 0;
          width: 240px; z-index: 40;
        }
        /* Mobile close button shows on mobile */
        @media (max-width: 768px) {
          .sidebar-desktop { display: none; }
          .sidebar-close-btn { display: flex !important; }
        }
      `}</style>

      {/* Desktop sidebar */}
      <div className="sidebar-desktop">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 45, display: 'none' }} className="sidebar-backdrop" />
          {/* Slide-in panel */}
          <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 280, zIndex: 50, display: 'flex' }} className="sidebar-mobile-panel">
            {sidebarContent}
          </div>
          <style>{`
            @media (max-width: 768px) {
              .sidebar-backdrop { display: block !important; }
              .sidebar-mobile-panel { display: flex !important; }
            }
          `}</style>
        </>
      )}
    </>
  )
}

export default Sidebar