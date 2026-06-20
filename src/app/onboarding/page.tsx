'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { Car } from '@/types'

export default function OnboardingPage() {
  const router = useRouter()
  const [cars, setCars] = useState<Car[]>([])
  const [selected, setSelected] = useState('')
  const [noCarModal, setNoCarModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getDocs(collection(db, 'cars')).then(snap => {
      setCars(snap.docs.filter(d => d.data().available).map(d => ({ id: d.id, ...d.data() } as Car)))
    })
  }, [])

  const selectCar = async () => {
    if (!selected) return
    const user = auth.currentUser
    if (!user) return
    setLoading(true)
    await updateDoc(doc(db, 'users', user.uid), { currentCar: selected })
    router.push('/garage')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', padding: '32px 20px 100px' }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Mashinangizni tanlang</h2>
      <p style={{ color: '#8892a4', marginBottom: 24, fontSize: 14 }}>
        Virtual garajingiz uchun mashinani tanlang
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {cars.map(car => (
          <button key={car.id} onClick={() => setSelected(car.id)} style={{
            background: selected === car.id ? '#1a1a2e' : '#111',
            border: selected === car.id ? '2px solid #E63946' : '2px solid #2a2a3e',
            borderRadius: 14, padding: 16, cursor: 'pointer', textAlign: 'left',
            transition: 'all 0.2s'
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={car.thumbnailURL || '/car-placeholder.png'} alt={car.name}
              style={{ width: '100%', height: 80, objectFit: 'contain', marginBottom: 8 }}
              onError={e => (e.currentTarget.style.display = 'none')}
            />
            <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{car.name}</p>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, flexDirection: 'column', marginTop: 24 }}>
        <p style={{ color: '#8892a4', fontSize: 13, textAlign: 'center' }}>
          Mashinangiz ro&apos;yxatda yo&apos;qmi?
        </p>
        <button onClick={() => setNoCarModal(true)} style={{
          background: 'none', border: '1px solid #2a2a3e', borderRadius: 12,
          color: '#8892a4', padding: '12px', cursor: 'pointer', fontSize: 14
        }}>
          😔 Mashinam ro&apos;yxatda yo&apos;q
        </button>
        <button className="btn-primary" onClick={selectCar} disabled={!selected || loading}>
          {loading ? 'Saqlanmoqda...' : 'Tanlash va Davom etish'}
        </button>
      </div>

      {/* No car modal */}
      {noCarModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 24
        }}>
          <div className="card" style={{ padding: 28, textAlign: 'center', maxWidth: 320 }}>
            <div style={{ fontSize: 56 }}>😔</div>
            <h3 style={{ marginTop: 12, marginBottom: 8 }}>Kechirasiz!</h3>
            <p style={{ color: '#8892a4', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              Mashinangiz hali virtual garajga qo&apos;shilmagan. Qo&apos;llab-quvvatlashga yozing, biz albatta so&apos;rovingizni qabul qilamiz!
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setNoCarModal(false)} style={{
                flex: 1, background: '#2a2a3e', border: 'none', borderRadius: 10,
                color: '#fff', padding: '12px', cursor: 'pointer'
              }}>OK</button>
              <button onClick={() => router.push('/chat')} className="btn-primary" style={{ flex: 1 }}>
                📩 Yozish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
