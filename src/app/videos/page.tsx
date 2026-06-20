'use client'
import { useState, useEffect } from 'react'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Post } from '@/types'
import { Plus, Eye, Heart } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import { useRouter } from 'next/navigation'

function getYoutubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&\n?#]+)/)
  return m ? m[1] : ''
}

export default function VideosPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const router = useRouter()

  useEffect(() => {
    const q = query(collection(db, 'posts'), where('status', '==', 'approved'), orderBy('createdAt', 'desc'))
    getDocs(q).then(snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post))
      const admin = all.filter(p => p.isAdminPost)
      const others = all.filter(p => !p.isAdminPost)
      setPosts([...admin, ...others])
    })
  }, [])

  return (
    <div style={{ paddingTop: 56, paddingBottom: 80 }}>
      <TopBar title="Videolar" rightContent={
        <button onClick={() => router.push('/videos/upload')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Plus size={22} color="#E63946" />
        </button>
      } />

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {posts.map(post => (
          <div key={post.id} className="card" onClick={() => router.push(`/videos/${post.id}`)}
            style={{ cursor: 'pointer', overflow: 'hidden' }}>
            <div style={{ position: 'relative' }}>
              {post.youtubeURL ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYoutubeId(post.youtubeURL)}`}
                  style={{ width: '100%', height: 200, border: 'none' }}
                />
              ) : (
                <video src={post.videoURL} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
              )}
              {post.isAdminPost && (
                <span style={{
                  position: 'absolute', top: 8, right: 8, background: '#E63946',
                  color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 700
                }}>ADMIN</span>
              )}
            </div>
            <div style={{ padding: 12 }}>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>{post.title}</p>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ color: '#8892a4', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Eye size={13} /> {post.views || 0}
                </span>
                <span style={{ color: '#8892a4', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Heart size={13} /> {post.likes?.length || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  )
}
