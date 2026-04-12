import type { Metadata } from 'next'
import AboutContent from './AboutContent'

export const metadata: Metadata = {
  title: 'О создателе — FreelanceHub',
  description:
    'Сариев Алижан Сабитулы — разработчик из Казахстана. Создал FreelanceHub, чтобы фрилансеры СНГ могли работать без комиссий и сложных западных платформ.',
}

export default function AboutPage() {
  return <AboutContent />
}
