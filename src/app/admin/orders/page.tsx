'use client'
import { useEffect, useState } from 'react'
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Order } from '@/types'
import toast from 'react-hot-toast'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminHeader from '@/components/admin/AdminHeader'

const STATUSES: Order['status'][] = ['new', 'processing', 'ready', 'done']
const STATUS_LABEL: Record<string, string> = {
  new: 'Yangi', processing: 'Jarayonda', ready: 'Tayyor', done: 'Bajarildi',
}
const STATUS_COLOR: Record<string, string> = {
  new: '#f59e0b', processing: '#3b82f6', ready: '#22c55e', done: '#8892a4',
}

function OrdersInner() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')))
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)))
    } catch {
      const snap = await getDocs(collection(db, 'orders'))
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)))
    }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const changeStatus = async (id: string, status: Order['status']) => {
    await updateDoc(doc(db, 'orders', id), { status })
    toast.success('Holat yangilandi')
    load()
  }

  return (
    <div style={{ paddingBottom: 90 }}>
      <AdminHeader title="Buyurtmalar" />
      <div style={{ padding: 16 }}>
        {loading ? (
          <p style={{ color: '#8892a4', textAlign: 'center', marginTop: 24 }}>Yuklanmoqda...</p>
        ) : orders.length === 0 ? (
          <p style={{ color: '#8892a4', textAlign: 'center', marginTop: 24 }}>Hozircha buyurtma yo&apos;q</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(o => (
              <div key={o.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700 }}>{o.fullName || 'Mijoz'}</span>
                  <span style={{
                    fontSize: 11, padding: '2px 10px', borderRadius: 10, fontWeight: 700, color: '#fff',
                    background: STATUS_COLOR[o.status] || '#8892a4'
                  }}>{STATUS_LABEL[o.status] || o.status}</span>
                </div>
                <p style={{ color: '#8892a4', fontSize: 12 }}>{o.phone} · {o.email}</p>
                <div style={{ margin: '10px 0', borderTop: '1px solid #2a2a3e', paddingTop: 10 }}>
                  {o.items?.map((it, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span>{it.name} × {it.quantity}</span>
                      <span style={{ color: '#8892a4' }}>${(it.price * it.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <p style={{ color: '#E63946', fontWeight: 700 }}>Jami: ${o.totalPrice?.toLocaleString()}</p>
                <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => changeStatus(o.id, s)} style={{
                      padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                      background: o.status === s ? STATUS_COLOR[s] : '#16213e',
                      border: '1px solid #2a2a3e', color: '#fff', fontWeight: 600
                    }}>{STATUS_LABEL[s]}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminOrdersPage() {
  return <AdminGuard><OrdersInner /></AdminGuard>
}
