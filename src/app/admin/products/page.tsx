'use client'
import { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { uploadFile, makeUploadPath } from '@/lib/supabase'
import { Product } from '@/types'
import { Plus, Trash2, X, UploadCloud } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminHeader from '@/components/admin/AdminHeader'

const CATEGORIES = ['Disk', 'Filter', 'Moy', 'Aksessuar', 'Lamp']
const STORAGE_BUCKET = 'models'

function ProductsInner() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    name: '', price: '', category: 'Disk', description: '', stock: '', imageURL: '',
  })

  const load = async () => {
    setLoading(true)
    const snap = await getDocs(collection(db, 'products'))
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = makeUploadPath('products', file.name)
      const url = await uploadFile(STORAGE_BUCKET, path, file)
      setForm(f => ({ ...f, imageURL: url }))
      toast.success('Rasm yuklandi!')
    } catch (err: any) {
      toast.error('Yuklashda xato: ' + (err.message || 'policy tekshiring'))
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    if (!form.name || !form.price) return toast.error('Nom va narx majburiy')
    setSaving(true)
    try {
      await addDoc(collection(db, 'products'), {
        name: form.name,
        price: Number(form.price),
        category: form.category,
        description: form.description,
        stock: Number(form.stock) || 0,
        imageURL: form.imageURL,
        createdAt: serverTimestamp(),
      })
      toast.success('Mahsulot qo\'shildi!')
      setForm({ name: '', price: '', category: 'Disk', description: '', stock: '', imageURL: '' })
      setShowForm(false)
      load()
    } catch (e: any) {
      toast.error(e.message || 'Xato')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Mahsulotni o\'chirasizmi?')) return
    await deleteDoc(doc(db, 'products', id))
    toast.success('O\'chirildi')
    load()
  }

  return (
    <div style={{ paddingBottom: 90 }}>
      <AdminHeader title="Mahsulotlar" />

      <div style={{ padding: 16 }}>
        <button onClick={() => setShowForm(true)} style={{
          background: '#E63946', border: 'none', borderRadius: 12, color: '#fff',
          padding: '12px 16px', cursor: 'pointer', fontWeight: 600, display: 'flex',
          alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center'
        }}>
          <Plus size={18} /> Yangi mahsulot qo&apos;shish
        </button>

        {loading ? (
          <p style={{ color: '#8892a4', textAlign: 'center', marginTop: 24 }}>Yuklanmoqda...</p>
        ) : products.length === 0 ? (
          <p style={{ color: '#8892a4', textAlign: 'center', marginTop: 24 }}>Hozircha mahsulot yo&apos;q</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
            {products.map(p => (
              <div key={p.id} className="card" style={{ padding: 12, position: 'relative' }}>
                <button onClick={() => remove(p.id)} style={{
                  position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)',
                  border: 'none', borderRadius: 8, color: '#E63946', padding: 6, cursor: 'pointer'
                }}>
                  <Trash2 size={14} />
                </button>
                {p.imageURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageURL} alt={p.name} style={{ width: '100%', height: 90, objectFit: 'contain', marginBottom: 8 }} />
                ) : (
                  <div style={{ height: 90, background: '#16213e', borderRadius: 8, marginBottom: 8 }} />
                )}
                <p style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</p>
                <p style={{ fontSize: 11, color: '#8892a4' }}>{p.category} · stok: {p.stock}</p>
                <p style={{ color: '#E63946', fontWeight: 700, marginTop: 4 }}>${p.price?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        }}>
          <div style={{
            background: '#1a1a2e', width: '100%', maxWidth: 430, borderRadius: '20px 20px 0 0',
            padding: 20, maxHeight: '92vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700 }}>Yangi mahsulot</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#8892a4', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Nomi (masalan: Vossen disk)" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />

              <input placeholder="Narxi ($)" type="number" value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />

              <div>
                <p style={{ color: '#8892a4', fontSize: 13, marginBottom: 8 }}>Kategoriya:</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))} style={{
                      padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13,
                      background: form.category === c ? '#E63946' : '#16213e',
                      border: form.category === c ? '2px solid #E63946' : '2px solid #2a2a3e',
                      color: '#fff'
                    }}>{c}</button>
                  ))}
                </div>
              </div>

              <input placeholder="Stok (dona)" type="number" value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />

              <textarea placeholder="Tavsif" value={form.description} rows={3}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

              {/* Image upload */}
              <div>
                <p style={{ color: '#8892a4', fontSize: 13, marginBottom: 8 }}>Rasm:</p>
                {form.imageURL && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.imageURL} alt="preview" style={{ width: '100%', height: 120, objectFit: 'contain', marginBottom: 8, background: '#16213e', borderRadius: 8 }} />
                )}
                <label style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  border: '1px dashed #2a2a3e', borderRadius: 12, padding: 14, cursor: 'pointer',
                  color: '#8892a4'
                }}>
                  <UploadCloud size={18} />
                  {uploading ? 'Yuklanmoqda...' : 'Rasm tanlash (yuklash)'}
                  <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
                </label>
                <input placeholder="yoki rasm URL'ini joylashtiring" value={form.imageURL}
                  onChange={e => setForm(f => ({ ...f, imageURL: e.target.value }))}
                  style={{ marginTop: 8 }} />
              </div>

              <button className="btn-primary" onClick={save} disabled={saving || uploading}>
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminProductsPage() {
  return <AdminGuard><ProductsInner /></AdminGuard>
}
