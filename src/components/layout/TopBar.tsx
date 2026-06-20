'use client'
import { Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'

interface TopBarProps {
  title: string
  rightContent?: React.ReactNode
}

export default function TopBar({ title, rightContent }: TopBarProps) {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const theme = localStorage.getItem('apex-theme') || 'dark'
    setDark(theme === 'dark')
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  const toggleTheme = () => {
    const next = dark ? 'light' : 'dark'
    setDark(!dark)
    localStorage.setItem('apex-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <header style={{
      position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430, background: '#1a1a2e',
      borderBottom: '1px solid #2a2a3e', padding: '14px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#E63946' }}>APEX</span>
        <span style={{ width: 1, height: 16, background: '#2a2a3e' }} />
        <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {rightContent}
        <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8892a4' }}>
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  )
}
