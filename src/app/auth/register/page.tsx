import type { Metadata } from 'next'
import RegisterClient from './RegisterClient'

export const metadata: Metadata = { title: 'Registrieren — MotoDigital' }

export default async function RegisterPage(
  props: { searchParams: Promise<{ role?: string }> }
) {
  const { role } = await props.searchParams
  const initialRole = role === 'rider' || role === 'custom-werkstatt' ? role : undefined
  return <RegisterClient initialRole={initialRole} />
}
