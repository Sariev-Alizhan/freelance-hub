export { MOCK_FREELANCERS } from './freelancers'
export { MOCK_ORDERS } from './orders'
export { CATEGORIES } from './categories'

import { MOCK_FREELANCERS } from './freelancers'
import { MOCK_ORDERS } from './orders'
import { Freelancer, Order, CategorySlug } from '@/lib/types'

export function getFreelancerById(id: string): Freelancer | undefined {
  return MOCK_FREELANCERS.find((f) => f.id === id)
}

export function getFreelancersByCategory(category: CategorySlug): Freelancer[] {
  return MOCK_FREELANCERS.filter((f) => f.category === category)
}

export function getTopFreelancers(limit = 6): Freelancer[] {
  return [...MOCK_FREELANCERS].sort((a, b) => b.rating - a.rating).slice(0, limit)
}

export function getOrderById(id: string): Order | undefined {
  return MOCK_ORDERS.find((o) => o.id === id)
}

export function getOrdersByCategory(category: CategorySlug): Order[] {
  return MOCK_ORDERS.filter((o) => o.category === category)
}

export function searchFreelancers(query: string): Freelancer[] {
  const q = query.toLowerCase()
  return MOCK_FREELANCERS.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.title.toLowerCase().includes(q) ||
      f.skills.some((s) => s.toLowerCase().includes(q))
  )
}

export function searchOrders(query: string): Order[] {
  const q = query.toLowerCase()
  return MOCK_ORDERS.filter(
    (o) =>
      o.title.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q) ||
      o.skills.some((s) => s.toLowerCase().includes(q))
  )
}
