'use client'
import { usePathname, useRouter } from 'next/navigation'
import { Car, Users, ShoppingBag, LayoutDashboard } from 'lucide-react'

const tabs = [
  { icon: Car, label: 'Virtual Garaj', path: '/garage' },
  { icon: Users, label: 'Portfolio', path: '/profile' },
  { icon: ShoppingBag, label: 'Zapchastlar', path: '/zapchastlar' },
  { icon: LayoutDashboard, label: 'Admin Panel', path: '/admin' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const hideOn = ['/auth/login', '/auth/register', '/onboarding', '/', '/garage/race']
  if (hideOn.some(p => pathname === p)) return null

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430, background: '#1a1a2e',
      borderTop: '1px solid #2a2a3e', display: 'flex',
      zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)',
      isolation: 'isolate', willChange: 'transform', backfaceVisibility: 'hidden',
    }}>
      {tabs.map(({ icon: Icon, label, path }) => {
        const active = pathname.startsWith(path)
        return (
          <button key={path} onClick={() => router.push(path)} style={{
            flex: 1, padding: '10px 0', background: 'none', border: 'none',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 4
          }}>
            <Icon size={22} color={active ? '#E63946' : '#8892a4'} />
            <span style={{ fontSize: 10, color: active ? '#E63946' : '#8892a4', fontWeight: active ? 600 : 400 }}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
