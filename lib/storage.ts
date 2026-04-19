// Storage wrapper — today uses Supabase Storage, tomorrow can swap for S3/IPFS
// without touching call sites. Every upload computes a content hash (CID-like)
// so media can be re-addressed if/when we move off Supabase.

import { createClient } from '@/lib/supabase/client'

export interface UploadResult {
  url: string        // public URL for <img src>
  path: string       // bucket path
  cid: string        // sha-256 content hash, hex
}

async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function uploadMedia(
  file: File,
  folder: 'posts' | 'stories' | 'avatars' | 'portfolio',
): Promise<UploadResult | null> {
  const supabase = createClient()
  const buf  = await file.arrayBuffer()
  const cid  = await sha256Hex(buf)
  const ext  = file.name.split('.').pop() ?? 'bin'
  const path = `${folder}/${cid}.${ext}`

  const { error } = await supabase.storage
    .from('media')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error && !error.message.includes('already exists')) return null

  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return { url: data.publicUrl, path, cid }
}
