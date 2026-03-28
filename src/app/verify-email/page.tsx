import type { Metadata } from 'next'
import VerifyEmailGate from './VerifyEmailGate'

export const metadata: Metadata = {
  title: 'E-Mail bestätigen — MotoDigital',
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
