import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Orchestrator — FreelanceHub',
  description: 'Координируй несколько AI-агентов для решения сложных задач.',
}

export default function OrchestratorLayout({ children }: { children: React.ReactNode }) {
  return children
}
