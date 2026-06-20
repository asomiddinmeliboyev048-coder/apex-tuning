'use client'
import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { User } from '@/types'
import { Settings } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const u = auth.currentUser
    if (!u) return router.push('/auth/login')
    getDoc(doc(db, 'users', u.uid)).then(snap => {
      if (snap.exists()) setUser({ uid: snap.id, ...snap.data() } as User)
    })
  }, [router])

  if (!user) return null

  return (
    <div style={{ paddingTop: 56, paddingBottom: 80 }}>
      <TopBar title="Profil" rightContent={
        <button onClick={() => router.push('/profile/edit')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8892a4' }}>
          <Settings size={20} />
        </button>
      } />

      <div style={{ padding: '24px 20px' }}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: user.photoURL ? `url(${user.photoURL}) center/cover` : '#E63946',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: '#fff', border: '3px solid #E63946'
          }}>
            {!user.photoURL && user.displayName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 18 }}>{user.displayName}</p>
            <p style={{ color: '#8892a4', fontSize: 13 }}>@{user.username}</p>
            <p style={{ color: '#8892a4', fontSize: 12, marginTop: 4 }}>{user.bio || 'Bio yo\'q'}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-around', marginBottom: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: 20 }}>{user.followers?.length || 0}</p>
            <p style={{ color: '#8892a4', fontSize: 12 }}>Followers</p>
          </div>
          <div style={{ width: 1, background: '#2a2a3e' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: 20 }}>{user.following?.length || 0}</p>
            <p style={{ color: '#8892a4', fontSize: 12 }}>Following</p>
          </div>
        </div>

        {/* Current car */}
        <div className="card" style={{ padding: 16 }}>
          <p style={{ color: '#8892a4', fontSize: 13, marginBottom: 8 }}>Joriy mashina:</p>
          <p style={{ fontWeight: 600 }}>{user.currentCar || 'Tanlanmagan'}</p>
          <button onClick={() => router.push('/onboarding')} style={{
            marginTop: 12, background: 'none', border: '1px solid #E63946',
            borderRadius: 10, color: '#E63946', padding: '8px 16px',
            cursor: 'pointer', fontSize: 13, fontWeight: 600
          }}>
            Mashina o&apos;zgartirish
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
