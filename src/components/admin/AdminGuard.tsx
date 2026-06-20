'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

function Spinner({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #E63946', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        <p style={{ color: '#8892a4', marginTop: 16 }}>{label}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'ok'>('checking')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login')
        return
      }
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (snap.data()?.role !== 'admin') {
        router.push('/garage')
        return
      }
      setStatus('ok')
    })
    return () => unsub()
  }, [router])

  if (status === 'checking') return <Spinner label="Tekshirilmoqda..." />
  return <>{children}</>
}
