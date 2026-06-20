'use client'
import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Product } from '@/types'
import { ShoppingCart, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import toast from 'react-hot-toast'

const CATS = ['Hammasi', 'Disk', 'Filter', 'Moy', 'Aksessuar', 'Lamp']

export default function ZapchastlarPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cat, setCat] = useState('Hammasi')
  const [liked, setLiked] = useState<string[]>([])
  const { addItem, items } = useCartStore()

  useEffect(() => {
    getDocs(collection(db, 'products')).then(snap => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)))
    })
  }, [])

  const filtered = cat === 'Hammasi' ? products : products.filter(p => p.category === cat)
  const cartCount = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div style={{ paddingTop: 56, paddingBottom: 80 }}>
      <TopBar title="Zapchastlar" rightContent={
        <div style={{ position: 'relative' }}>
          <ShoppingCart size={22} color="#8892a4" />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6, background: '#E63946',
              borderRadius: '50%', width: 16, height: 16, fontSize: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>{cartCount}</span>
          )}
        </div>
      } />

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 20px', scrollbarWidth: 'none' }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: cat === c ? '#E63946' : '#1a1a2e',
            color: '#fff', fontSize: 13, whiteSpace: 'nowrap', fontWeight: cat === c ? 600 : 400
          }}>{c}</button>
        ))}
      </div>

      {/* Products grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 16px' }}>
        {filtered.map(p => (
          <div key={p.id} className="card" style={{ padding: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.imageURL} alt={p.name}
              style={{ width: '100%', height: 100, objectFit: 'contain', marginBottom: 8 }} />
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{p.name}</p>
            <p style={{ color: '#E63946', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
              ${p.price.toLocaleString()}
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => {
                setLiked(l => l.includes(p.id) ? l.filter(x => x !== p.id) : [...l, p.id])
              }} style={{ background: '#2a2a3e', border: 'none', borderRadius: 8, padding: '8px', cursor: 'pointer' }}>
                <Heart size={16} fill={liked.includes(p.id) ? '#E63946' : 'none'} color={liked.includes(p.id) ? '#E63946' : '#8892a4'} />
              </button>
              <button onClick={() => {
                addItem({ productId: p.id, name: p.name, price: p.price, quantity: 1, imageURL: p.imageURL })
                toast.success('Savatga qo\'shildi!')
              }} style={{
                flex: 1, background: '#E63946', border: 'none', borderRadius: 8,
                color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 600
              }}>
                + Savatga
              </button>
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  )
}
