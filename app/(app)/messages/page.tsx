import { Suspense } from 'react'
import MessengerPage from '@/components/messages/MessengerPage'

export default function Page() {
  return (
    <Suspense>
      <MessengerPage />
    </Suspense>
  )
}
