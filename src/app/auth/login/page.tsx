'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) return toast.error('Barcha maydonlarni to\'ldiring')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/garage')
    } catch (e: any) {
      toast.error('Email yoki parol noto\'g\'ri')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', padding: '48px 24px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900 }}>
          <span style={{ color: '#E63946' }}>APEX</span>
          <span style={{ color: '#fff' }}> TUNING</span>
        </h1>
        <p style={{ color: '#8892a4', marginTop: 8 }}>Hisobingizga kiring</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ position: 'relative' }}>
          <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8892a4' }} />
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ paddingLeft: 44 }}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8892a4' }} />
          <input
            type={showPass ? 'text' : 'password'}
            placeholder="Parol" value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ paddingLeft: 44, paddingRight: 44 }}
          />
          <button onClick={() => setShowPass(!showPass)} style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: '#8892a4'
          }}>
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button className="btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? 'Kirish...' : 'Kirish'}
        </button>

        <p style={{ textAlign: 'center', color: '#8892a4', marginTop: 8 }}>
          Hisob yo&apos;qmi?{' '}
          <Link href="/auth/register" style={{ color: '#E63946', textDecoration: 'none', fontWeight: 600 }}>
            Ro&apos;yxatdan o&apos;ting
          </Link>
        </p>
      </div>
    </div>
  )
}
