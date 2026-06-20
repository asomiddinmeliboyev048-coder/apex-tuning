'use client'
import { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { uploadFile, makeUploadPath } from '@/lib/supabase'
import { Post } from '@/types'
import { Plus, Trash2, X, UploadCloud, Check, Ban } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminHeader from '@/components/admin/AdminHeader'

const STORAGE_BUCKET = 'models'

function getYoutubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&\n?#]+)/)
  return m ? m[1] : ''
}

function VideosInner() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'pending'>('pending')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ title: '', youtubeURL: '', videoURL: '' })

  const load = async () => {
    setLoading(true)
    try {
      const snap = await getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc')))
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)))
    } catch {
      const snap = await getDocs(collection(db, 'posts'))
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)))
    }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = makeUploadPath('videos', file.name)
      const url = await uploadFile(STORAGE_BUCKET, path, file)
      setForm(f => ({ ...f, videoURL: url }))
      toast.success('Video yuklandi!')
    } catch (err: any) {
      toast.error('Yuklashda xato: ' + (err.message || 'policy tekshiring'))
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    if (!form.title) return toast.error('Sarlavha majburiy')
    if (!form.youtubeURL && !form.videoURL) return toast.error('YouTube URL yoki video yuklang')
    setSaving(true)
    try {
      await addDoc(collection(db, 'posts'), {
        userId: auth.currentUser?.uid || 'admin',
        title: form.title,
        youtubeURL: form.youtubeURL || '',
        videoURL: form.videoURL || '',
        thumbnailURL: '',
        likes: [],
        views: 0,
        status: 'approved',
        isAdminPost: true,
        createdAt: serverTimestamp(),
      })
      toast.success('Video qo\'shildi!')
      setForm({ title: '', youtubeURL: '', videoURL: '' })
      setShowForm(false)
      load()
    } catch (e: any) {
      toast.error(e.message || 'Xato')
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (id: string, status: 'approved' | 'rejected') => {
    await updateDoc(doc(db, 'posts', id), { status })
    toast.success(status === 'approved' ? 'Tasdiqlandi' : 'Rad etildi')
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('Videoni o\'chirasizmi?')) return
    await deleteDoc(doc(db, 'posts', id))
    toast.success('O\'chirildi')
    load()
  }

  const visible = tab === 'pending' ? posts.filter(p => p.status === 'pending') : posts

  return (
    <div style={{ paddingBottom: 90 }}>
      <AdminHeader title="Videolar" />

      <div style={{ padding: 16 }}>
        <button onClick={() => setShowForm(true)} style={{
          background: '#E63946', border: 'none', borderRadius: 12, color: '#fff',
          padding: '12px 16px', cursor: 'pointer', fontWeight: 600, display: 'flex',
          alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center'
        }}>
          <Plus size={18} /> Admin video qo&apos;shish
        </button>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {(['pending', 'all'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '8px', borderRadius: 10, cursor: 'pointer', fontSize: 13,
              background: tab === t ? '#E63946' : '#16213e', border: 'none', color: '#fff', fontWeight: 600
            }}>{t === 'pending' ? 'Kutilmoqda' : 'Hammasi'}</button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: '#8892a4', textAlign: 'center', marginTop: 24 }}>Yuklanmoqda...</p>
        ) : visible.length === 0 ? (
          <p style={{ color: '#8892a4', textAlign: 'center', marginTop: 24 }}>Video yo&apos;q</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {visible.map(post => (
              <div key={post.id} className="card" style={{ overflow: 'hidden' }}>
                <div style={{ position: 'relative', background: '#000' }}>
                  {post.youtubeURL ? (
                    <iframe src={`https://www.youtube.com/embed/${getYoutubeId(post.youtubeURL)}`}
                      style={{ width: '100%', height: 180, border: 'none' }} />
                  ) : post.videoURL ? (
                    <video src={post.videoURL} controls style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                  ) : null}
                  <span style={{
                    position: 'absolute', top: 8, left: 8, fontSize: 10, padding: '2px 8px',
                    borderRadius: 10, fontWeight: 700, color: '#fff',
                    background: post.status === 'approved' ? '#22c55e' : post.status === 'rejected' ? '#ef4444' : '#f59e0b'
                  }}>{post.status}</span>
                  {post.isAdminPost && (
                    <span style={{ position: 'absolute', top: 8, right: 8, background: '#E63946', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>ADMIN</span>
                  )}
                </div>
                <div style={{ padding: 12 }}>
                  <p style={{ fontWeight: 600, marginBottom: 8 }}>{post.title}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {post.status !== 'approved' && (
                      <button onClick={() => setStatus(post.id, 'approved')} style={{
                        flex: 1, background: '#22c55e', border: 'none', borderRadius: 8, color: '#fff',
                        padding: '8px', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                      }}><Check size={14} /> Tasdiqlash</button>
                    )}
                    {post.status !== 'rejected' && (
                      <button onClick={() => setStatus(post.id, 'rejected')} style={{
                        flex: 1, background: '#16213e', border: '1px solid #2a2a3e', borderRadius: 8, color: '#f59e0b',
                        padding: '8px', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                      }}><Ban size={14} /> Rad etish</button>
                    )}
                    <button onClick={() => remove(post.id)} style={{
                      background: '#16213e', border: '1px solid #2a2a3e', borderRadius: 8, color: '#ef4444',
                      padding: '8px 12px', cursor: 'pointer'
                    }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#1a1a2e', width: '100%', maxWidth: 430, borderRadius: '20px 20px 0 0', padding: 20, maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700 }}>Admin video</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#8892a4', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Sarlavha" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <input placeholder="YouTube URL (eng oson usul)" value={form.youtubeURL} onChange={e => setForm(f => ({ ...f, youtubeURL: e.target.value }))} />
              <p style={{ color: '#8892a4', fontSize: 12, textAlign: 'center' }}>— yoki —</p>
              {form.videoURL && <video src={form.videoURL} controls style={{ width: '100%', height: 140, background: '#000', borderRadius: 8 }} />}
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px dashed #2a2a3e', borderRadius: 12, padding: 14, cursor: 'pointer', color: '#8892a4' }}>
                <UploadCloud size={18} />
                {uploading ? 'Yuklanmoqda...' : 'Video fayl yuklash'}
                <input type="file" accept="video/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
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

export default function AdminVideosPage() {
  return <AdminGuard><VideosInner /></AdminGuard>
}
