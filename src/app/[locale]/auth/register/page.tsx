import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import RegisterClient from './RegisterClient'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Auth')
  return { title: t('registerPageTitle') }
}

export default async function RegisterPage(
  props: { searchParams: Promise<{ role?: string }> }
) {
  const { role } = await props.searchParams
  const initialRole = role === 'rider' || role === 'custom-werkstatt' ? role : undefined
  return <RegisterClient initialRole={initialRole} />
}
