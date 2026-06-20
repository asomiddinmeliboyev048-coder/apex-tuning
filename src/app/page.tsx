'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          router.push('/garage')
        } else {
          router.push('/auth/login')
        }
      })
      return unsubscribe
    }, 2000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', background: '#0d0d0d'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: 2 }}>
          <span style={{ color: '#E63946' }}>APEX</span>
          <span style={{ color: '#fff' }}> TUNING</span>
        </h1>
        <p style={{ color: '#8892a4', marginTop: 8, fontSize: 14 }}>
          Virtual 3D Garaj
        </p>
        <div style={{ marginTop: 40 }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #E63946',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto'
          }} />
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
