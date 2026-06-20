'use client'
import { useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import { Maximize2, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { getPublicUrl } from '@/lib/supabase'
import * as THREE from 'three'

const COLORS = ['#1a1a1a', '#E63946', '#3b82f6', '#22c55e', '#f59e0b', '#ffffff', '#9ca3af', '#14b8a6']
const RIMS = [
  { id: 'stock', label: 'Stock', price: 0 },
  { id: 'vossen', label: 'Vossen', price: 800 },
  { id: 'bbs', label: 'BBS', price: 1300 },
  { id: 'rays', label: 'Rays', price: 1100 },
  { id: 'enkei', label: 'Enkei', price: 900 },
]

function CarModel({ url, color }: { url: string; color: string }) {
  const { scene } = useGLTF(url)
  scene.traverse((child: any) => {
    if (child.isMesh && child.material) {
      if (child.name.toLowerCase().includes('body') || child.name.toLowerCase().includes('paint')) {
        child.material.color = new THREE.Color(color)
      }
    }
  })
  return <primitive object={scene} scale={1.5} position={[0, -0.5, 0]} />
}

function GarageModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

function GarageScene({ carUrl, garageUrl, color }: { carUrl: string; garageUrl: string; color: string }) {
  return (
    <Canvas camera={{ position: [3, 2, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Suspense fallback={null}>
        {garageUrl && <GarageModel url={garageUrl} />}
        {carUrl && <CarModel url={carUrl} color={color} />}
        <Environment preset="city" />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI / 2}
        maxAzimuthAngle={Math.PI / 2}
      />
    </Canvas>
  )
}

export default function GaragePage() {
  const router = useRouter()
  const [color, setColor] = useState('#1a1a1a')
  const [rim, setRim] = useState('stock')
  const [carUrl, setCarUrl] = useState('')
  const [garageUrl, setGarageUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser
      if (!user) return router.push('/auth/login')
      const snap = await getDoc(doc(db, 'users', user.uid))
      const data = snap.data()
      if (!data?.currentCar) return router.push('/onboarding')
      const carPath = `cars/${data.currentCar}.glb`
      setCarUrl(getPublicUrl('models', carPath))
      setGarageUrl(getPublicUrl('models', 'garage/garage.glb'))
      setColor(data.carColor || '#1a1a1a')
      setRim(data.carRim || 'stock')
      setLoading(false)
    }
    load()
  }, [router])

  const totalPrice = 47250 + (RIMS.find(r => r.id === rim)?.price || 0)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #E63946', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        <p style={{ color: '#8892a4', marginTop: 16 }}>Garaj yuklanmoqda...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ paddingTop: 56, paddingBottom: 70 }}>
      <TopBar
        title="VIRTUAL 3D GARAJ v2.0"
        rightContent={
          <button onClick={() => router.push('/garage/race')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8892a4' }}>
            <Maximize2 size={20} />
          </button>
        }
      />

      {/* 3D Canvas */}
      <div style={{ height: '50vh', background: '#111' }}>
        <GarageScene carUrl={carUrl} garageUrl={garageUrl} color={color} />
      </div>

      {/* Controls */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#8892a4', fontSize: 13 }}>Konstruksiya umumiy qiymati:</span>
        </div>
        <p style={{ color: '#E63946', fontSize: 24, fontWeight: 800 }}>
          ${totalPrice.toLocaleString()}
        </p>

        {/* Color picker */}
        <div>
          <p style={{ color: '#8892a4', fontSize: 13, marginBottom: 10 }}>Kuzov rangi (Paint Shop):</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} style={{
                width: 36, height: 36, borderRadius: '50%', background: c,
                border: color === c ? '3px solid #E63946' : '3px solid transparent',
                cursor: 'pointer', transition: 'border 0.2s'
              }} />
            ))}
          </div>
        </div>

        {/* Rim selector */}
        <div>
          <p style={{ color: '#8892a4', fontSize: 13, marginBottom: 10 }}>Yengil qotishmali disklar:</p>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {RIMS.map(r => (
              <button key={r.id} onClick={() => setRim(r.id)} style={{
                padding: '8px 14px', borderRadius: 10, whiteSpace: 'nowrap',
                background: rim === r.id ? '#E63946' : '#1a1a2e',
                border: rim === r.id ? '2px solid #E63946' : '2px solid #2a2a3e',
                color: '#fff', fontSize: 13, cursor: 'pointer', flexShrink: 0
              }}>
                {r.label}
                <br />
                <span style={{ fontSize: 11, opacity: 0.8 }}>
                  {r.price === 0 ? 'Bepul' : `+$${r.price}`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Play button */}
        <button
          onClick={() => router.push('/garage/race')}
          style={{
            background: 'linear-gradient(135deg, #E63946, #c1121f)',
            border: 'none', borderRadius: 14, padding: '16px',
            color: '#fff', fontSize: 16, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8
          }}
        >
          <Play size={20} fill="#fff" /> Poyga boshlash
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
