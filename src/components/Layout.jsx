// Layout.jsx — fully responsive
// Manages mobile sidebar open/close state
// On mobile: sidebar hidden, hamburger in header toggles overlay

import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { Toaster } from 'react-hot-toast'

function Layout({ children, userName: userNameProp, resumes = [], recentJDs = [] }) {

  const [userName, setUserName] = useState(
    userNameProp || sessionStorage.getItem('hp_user_name') || ''
  )
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Sync userName from prop
  useEffect(() => {
    if (userNameProp && userNameProp !== userName) {
      setUserName(userNameProp)
      sessionStorage.setItem('hp_user_name', userNameProp)
    }
  }, [userNameProp])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>

      <style>{`
        /* Main content pushed right by sidebar on desktop only */
        .lp-main {
          margin-left: 240px;
          padding-top: 56px;
          min-height: 100vh;
          background: #f0f4f8;
        }
        @media (max-width: 768px) {
          .lp-main { margin-left: 0; }
        }
      `}</style>

      {/* Global toasts */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { minWidth: '300px', maxWidth: '420px', fontSize: '14px', fontWeight: '600', padding: '14px 18px', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
          success: { style: { background: '#059669', color: '#ffffff', boxShadow: '0 8px 24px rgba(5,150,105,0.3)' }, iconTheme: { primary: '#ffffff', secondary: '#059669' } },
          error: { style: { background: '#DC2626', color: '#ffffff', boxShadow: '0 8px 24px rgba(220,38,38,0.3)' }, iconTheme: { primary: '#ffffff', secondary: '#DC2626' } },
          blank: { style: { background: '#DBEAFE', color: '#1E40AF', boxShadow: '0 8px 24px rgba(30,64,175,0.15)' }, iconTheme: { primary: '#1E40AF', secondary: '#DBEAFE' } },
        }}
      />

      {/* Header — passes toggle function */}
      <Header userName={userName} onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      {/* Sidebar — receives mobile state */}
      <Sidebar
        userName={userName}
        resumes={resumes}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content */}
      <main className="lp-main">
        {children}
      </main>

    </div>
  )
}

export default Layout