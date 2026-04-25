import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PaymentMethodsForm, { type PaymentMethod } from '@/components/settings/PaymentMethodsForm'

export const metadata = { title: 'Payments — FreelanceHub' }

export default async function PaymentsSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/settings/payments')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data } = await db
    .from('profiles')
    .select('payment_methods')
    .eq('id', user.id)
    .maybeSingle()

  const initial: PaymentMethod[] = Array.isArray(data?.payment_methods) ? data.payment_methods : []

  return <PaymentMethodsForm initial={initial} />
}
