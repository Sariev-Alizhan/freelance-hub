'use client'
import { useEffect } from 'react'

export default function ProfileViewLogger({ freelancerId }: { freelancerId: string }) {
  useEffect(() => {
    fetch('/api/profile/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ freelancerId }),
    }).catch(() => {})
  }, [freelancerId])

  return null
}
