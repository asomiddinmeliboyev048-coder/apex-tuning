'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function AdminHeader({ title }: { title: string }) {
  const router = useRouter()
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50, background: '#1a1a2e',
      borderBottom: '1px solid #2a2a3e', padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12
    }}>
      <button onClick={() => router.push('/admin')} style={{
        background: '#16213e', border: '1px solid #2a2a3e', borderRadius: 10,
        color: '#fff', padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center'
      }}>
        <ArrowLeft size={18} />
      </button>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#E63946' }}>APEX ADMIN</span>
      <span style={{ width: 1, height: 16, background: '#2a2a3e' }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>
    </header>
  )
}
