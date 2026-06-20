import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// Upload a file to a Supabase storage bucket and return its public URL.
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  })
  if (error) throw error
  return getPublicUrl(bucket, path)
}

// Build a unique, safe storage path for an uploaded file.
export const makeUploadPath = (folder: string, fileName: string) => {
  const ext = fileName.split('.').pop() || 'bin'
  const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  return `${folder}/${safe}`
}

export const deleteFile = async (bucket: string, path: string) => {
  await supabase.storage.from(bucket).remove([path])
}
