'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { User, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handle = async () => {
    if (!form.username || !form.email || !form.password) return toast.error('Barcha maydonlarni to\'ldiring')
    if (form.password !== form.confirm) return toast.error('Parollar mos emas')
    if (form.password.length < 6) return toast.error('Parol kamida 6 ta belgi')
    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username: form.username.toLowerCase().replace(/\s/g, '_'),
        email: form.email,
        displayName: form.username,
        photoURL: '',
        bio: '',
        role: 'user',
        currentCar: '',
        carColor: '#E63946',
        carRim: 'stock',
        followers: [],
        following: [],
        createdAt: serverTimestamp(),
      })
      setSuccess(true)
    } catch (e: any) {
      toast.error(e.message || 'Xato yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24, background: '#0d0d0d'
    }}>
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Tabriklaymiz!</h2>
        <p style={{ color: '#8892a4', marginBottom: 24 }}>APEX TUNING&apos;ga xush kelibsiz!</p>
        <button className="btn-primary" onClick={() => router.push('/onboarding')}>OK</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', padding: '48px 24px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900 }}>
          <span style={{ color: '#E63946' }}>APEX</span>
          <span style={{ color: '#fff' }}> TUNING</span>
        </h1>
        <p style={{ color: '#8892a4', marginTop: 8 }}>Yangi hisob yarating</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { icon: <User size={18} />, key: 'username', placeholder: 'Username', type: 'text' },
          { icon: <Mail size={18} />, key: 'email', placeholder: 'Email', type: 'email' },
          { icon: <Lock size={18} />, key: 'password', placeholder: 'Parol', type: 'password' },
          { icon: <Lock size={18} />, key: 'confirm', placeholder: 'Parolni tasdiqlang', type: 'password' },
        ].map(({ icon, key, placeholder, type }) => (
          <div key={key} style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8892a4' }}>
              {icon}
            </span>
            <input
              type={type} placeholder={placeholder}
              value={form[key as keyof typeof form]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              style={{ paddingLeft: 44 }}
            />
          </div>
        ))}

        <button className="btn-primary" onClick={handle} disabled={loading}>
          {loading ? 'Yaratilmoqda...' : 'Ro\'yxatdan o\'tish'}
        </button>

        <p style={{ textAlign: 'center', color: '#8892a4' }}>
          Hisob bormi?{' '}
          <Link href="/auth/login" style={{ color: '#E63946', textDecoration: 'none', fontWeight: 600 }}>Kirish</Link>
        </p>
      </div>
    </div>
  )
}
