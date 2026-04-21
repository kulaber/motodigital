import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import VerifyEmailGate from './VerifyEmailGate'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Auth')
  return { title: t('verifyPageTitle') }
}

interface Props {
  searchParams: Promise<{ email?: string }>
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { email } = await searchParams

  return (
    <div className="min-h-dvh bg-[#F0EDE4] flex items-center justify-center px-4">
      <VerifyEmailGate email={email ?? ''} />
    </div>
  )
}
