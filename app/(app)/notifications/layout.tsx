import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Уведомления — FreelanceHub',
  description: 'Новые отклики, сообщения и обновления заказов в одном месте.',
}

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children
}
