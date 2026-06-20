'use client'
import { useEffect, useState } from 'react'
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { uploadFile, makeUploadPath } from '@/lib/supabase'
import { Car } from '@/types'
import { Plus, Trash2, X, UploadCloud } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminHeader from '@/components/admin/AdminHeader'

const STORAGE_BUCKET = 'models'

function CarsInner() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ id: '', name: '', thumbnailURL: '', available: true })

  const load = async () => {
    setLoading(true)
    const snap = await getDocs(collection(db, 'cars'))
    setCars(snap.docs.map(d => ({ id: d.id, ...d.data() } as Car)))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = makeUploadPath('car-thumbs', file.name)
      const url = await uploadFile(STORAGE_BUCKET, path, file)
      setForm(f => ({ ...f, thumbnailURL: url }))
      toast.success('Rasm yuklandi!')
    } catch (err: any) {
      toast.error('Yuklashda xato: ' + (err.message || ''))
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    const id = form.id.trim().toLowerCase().replace(/\s+/g, '-')
    if (!id || !form.name) return toast.error('ID va nom majburiy')
    setSaving(true)
    try {
      await setDoc(doc(db, 'cars', id), {
        name: form.name,
        modelPath: `cars/${id}.glb`,
        thumbnailURL: form.thumbnailURL,
        available: form.available,
      })
      toast.success('Mashina saqlandi!')
      toast(`⚠️ Supabase'ga yuklang: models/cars/${id}.glb`, { duration: 6000 })
      setForm({ id: '', name: '', thumbnailURL: '', available: true })
      setShowForm(false)
      load()
    } catch (e: any) {
      toast.error(e.message || 'Xato')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Mashinani o\'chirasizmi?')) return
    await deleteDoc(doc(db, 'cars', id))
    toast.success('O\'chirildi')
    load()
  }

  return (
    <div style={{ paddingBottom: 90 }}>
      <AdminHeader title="Mashinalar" />
      <div style={{ padding: 16 }}>
        <button onClick={() => setShowForm(true)} style={{
          background: '#E63946', border: 'none', borderRadius: 12, color: '#fff',
          padding: '12px 16px', cursor: 'pointer', fontWeight: 600, display: 'flex',
          alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center'
        }}>
          <Plus size={18} /> Yangi mashina qo&apos;shish
        </button>

        {loading ? (
          <p style={{ color: '#8892a4', textAlign: 'center', marginTop: 24 }}>Yuklanmoqda...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
            {cars.map(c => (
              <div key={c.id} className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                {c.thumbnailURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.thumbnailURL} alt={c.name} style={{ width: 56, height: 40, objectFit: 'contain', background: '#16213e', borderRadius: 6 }} />
                ) : <div style={{ width: 56, height: 40, background: '#16213e', borderRadius: 6 }} />}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</p>
                  <p style={{ color: '#8892a4', fontSize: 11 }}>{c.modelPath} · {c.available ? '✅ faol' : '⛔ yashirin'}</p>
                </div>
                <button onClick={() => remove(c.id)} style={{ background: '#16213e', border: '1px solid #2a2a3e', borderRadius: 8, color: '#ef4444', padding: 8, cursor: 'pointer' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#1a1a2e', width: '100%', maxWidth: 430, borderRadius: '20px 20px 0 0', padding: 20, maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700 }}>Yangi mashina</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#8892a4', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="ID (masalan: spark) — fayl nomi shunday bo'ladi" value={form.id}
                onChange={e => setForm(f => ({ ...f, id: e.target.value }))} />
              <p style={{ color: '#8892a4', fontSize: 11, marginTop: -6 }}>
                ⚠️ Bu ID Supabase&apos;dagi <b>models/cars/{form.id || 'id'}.glb</b> bilan bir xil bo&apos;lishi shart!
              </p>
              <input placeholder="Nomi (masalan: Chevrolet Spark)" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              {form.thumbnailURL && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.thumbnailURL} alt="preview" style={{ width: '100%', height: 100, objectFit: 'contain', background: '#16213e', borderRadius: 8 }} />
              )}
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px dashed #2a2a3e', borderRadius: 12, padding: 14, cursor: 'pointer', color: '#8892a4' }}>
                <UploadCloud size={18} />
                {uploading ? 'Yuklanmoqda...' : 'Rasm (thumbnail) yuklash'}
                <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
                <input type="checkbox" checked={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} style={{ width: 'auto' }} />
                Faol (onboarding&apos;da ko&apos;rinadi)
              </label>
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

export default function AdminCarsPage() {
  return <AdminGuard><CarsInner /></AdminGuard>
}
