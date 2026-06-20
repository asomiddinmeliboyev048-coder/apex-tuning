'use client'
import { useEffect, useState } from 'react'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { User } from '@/types'
import { ShieldCheck, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminHeader from '@/components/admin/AdminHeader'

function UsersInner() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const snap = await getDocs(collection(db, 'users'))
    setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as User)))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const toggleRole = async (u: User) => {
    if (u.uid === auth.currentUser?.uid) return toast.error('O\'zingizni o\'zgartira olmaysiz')
    const next = u.role === 'admin' ? 'user' : 'admin'
    if (!confirm(`${u.displayName} ni ${next === 'admin' ? 'ADMIN qilasizmi' : 'oddiy user qilasizmi'}?`)) return
    await updateDoc(doc(db, 'users', u.uid), { role: next })
    toast.success('Rol yangilandi')
    load()
  }

  return (
    <div style={{ paddingBottom: 90 }}>
      <AdminHeader title="Foydalanuvchilar" />
      <div style={{ padding: 16 }}>
        {loading ? (
          <p style={{ color: '#8892a4', textAlign: 'center', marginTop: 24 }}>Yuklanmoqda...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {users.map(u => (
              <div key={u.uid} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: u.photoURL ? `url(${u.photoURL}) center/cover` : '#E63946',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700
                }}>
                  {!u.photoURL && (u.displayName?.[0]?.toUpperCase() || '?')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{u.displayName || 'Foydalanuvchi'}</p>
                  <p style={{ color: '#8892a4', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</p>
                </div>
                <button onClick={() => toggleRole(u)} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, border: '1px solid #2a2a3e',
                  background: u.role === 'admin' ? '#E63946' : '#16213e', color: '#fff'
                }}>
                  {u.role === 'admin' ? <ShieldCheck size={14} /> : <Shield size={14} />}
                  {u.role === 'admin' ? 'Admin' : 'User'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  return <AdminGuard><UsersInner /></AdminGuard>
}
