'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function RacePage() {
  const router = useRouter()
  return (
    <div style={{
      minHeight: '100vh', background: '#0d0d0d', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, textAlign: 'center'
    }}>
      <button onClick={() => router.push('/garage')} style={{
        position: 'absolute', top: 20, left: 20, background: '#1a1a2e',
        border: '1px solid #2a2a3e', borderRadius: 10, color: '#fff',
        padding: 10, cursor: 'pointer', display: 'flex', alignItems: 'center'
      }}>
        <ArrowLeft size={18} />
      </button>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🏁</div>
      <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>
        <span style={{ color: '#E63946' }}>POYGA</span> REJIMI
      </h1>
      <p style={{ color: '#8892a4', fontSize: 14, maxWidth: 320, lineHeight: 1.6 }}>
        3D poyga rejimi tez orada qo&apos;shiladi. Tayyorlaning!
      </p>
      <button onClick={() => router.push('/garage')} className="btn-primary" style={{ marginTop: 32, maxWidth: 240 }}>
        Garajga qaytish
      </button>
    </div>
  )
}
