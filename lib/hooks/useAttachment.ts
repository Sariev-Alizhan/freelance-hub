import { useState, useRef, type ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

export type UploadedAttachment = {
  url: string
  type: 'image' | 'file'
  name: string
}

/**
 * Message-attachment staging area. Owns the selected `File`, the image
 * preview data URL, and an upload-progress flag. Exposes:
 *   - `handleFileSelect`: wire to `<input type="file" onChange>`
 *   - `clearAttachment`: reset all three pieces of state
 *   - `uploadAttachment(userId)`: pushes the file to the
 *     `chat-attachments` storage bucket and returns the public URL +
 *     detected type + name. Returns `null` if there's nothing staged or
 *     the upload errored.
 */
export function useAttachment() {
  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachPreview, setAttachPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAttachment(file)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = ev => setAttachPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setAttachPreview(null)
    }
    e.target.value = ''
  }

  function clearAttachment() {
    setAttachment(null)
    setAttachPreview(null)
    setUploadProgress(null)
  }

  async function uploadAttachment(userId: string): Promise<UploadedAttachment | null> {
    if (!attachment) return null
    setUploadProgress(0)
    const path = `${userId}/${Date.now()}_${attachment.name}`
    const { data: upData, error: upErr } = await supabase.storage
      .from('chat-attachments')
      .upload(path, attachment, { upsert: false })
    let result: UploadedAttachment | null = null
    if (!upErr && upData) {
      const { data: urlData } = supabase.storage.from('chat-attachments').getPublicUrl(path)
      result = {
        url: urlData.publicUrl,
        type: attachment.type.startsWith('image/') ? 'image' : 'file',
        name: attachment.name,
      }
    }
    setUploadProgress(null)
    clearAttachment()
    return result
  }

  return {
    attachment,
    attachPreview,
    uploadProgress,
    fileInputRef,
    handleFileSelect,
    clearAttachment,
    uploadAttachment,
  }
}
