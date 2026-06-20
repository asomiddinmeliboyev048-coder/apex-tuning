'use client'
import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import { Users, Package, Video, ShoppingBag } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState({ users: 0, orders: 0, pending: 0, products: 0 })

  useEffect(() => {
    const check = async () => {
      const u = auth.currentUser
      if (!u) return router.push('/auth/login')
      const snap = await getDoc(doc(db, 'users', u.uid))
      if (snap.data()?.role !== 'admin') return router.push('/garage')
      const [users, orders, pending, products] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'orders'), where('status', '==', 'new'))),
        getDocs(query(collection(db, 'posts'), where('status', '==', 'pending'))),
        getDocs(collection(db, 'products')),
      ])
      setStats({ users: users.size, orders: orders.size, pending: pending.size, products: products.size })
    }
    check()
  }, [router])

  const cards = [
    { icon: Users, label: 'Foydalanuvchilar', value: stats.users, path: '/admin/users' },
    { icon: ShoppingBag, label: 'Yangi buyurtmalar', value: stats.orders, path: '/admin/orders' },
    { icon: Video, label: 'Kutilmoqda video', value: stats.pending, path: '/admin/videos' },
    { icon: Package, label: 'Mahsulotlar', value: stats.products, path: '/admin/products' },
  ]

  return (
    <div style={{ paddingTop: 56, paddingBottom: 80 }}>
      <TopBar title="Admin Panel" />
      <div style={{ padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {cards.map(({ icon: Icon, label, value, path }) => (
            <button key={path} onClick={() => router.push(path)} className="card" style={{
              padding: 16, textAlign: 'left', border: 'none', cursor: 'pointer', width: '100%'
            }}>
              <Icon size={24} color="#E63946" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 24, fontWeight: 800, color: '#E63946' }}>{value}</p>
              <p style={{ color: '#8892a4', fontSize: 12, marginTop: 4 }}>{label}</p>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: '🚗 Mashinalar boshqarish', path: '/admin/cars' },
            { label: '📹 Video moderatsiya', path: '/admin/videos' },
            { label: '💬 Qo\'llab-quvvatlash', path: '/admin/support' },
          ].map(({ label, path }) => (
            <button key={path} onClick={() => router.push(path)} className="card" style={{
              padding: 16, border: 'none', cursor: 'pointer', textAlign: 'left',
              color: '#fff', fontSize: 15, fontWeight: 500, width: '100%'
            }}>{label}</button>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
