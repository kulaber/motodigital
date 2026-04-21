import { redirect } from 'next/navigation'

interface Props {
  searchParams: Promise<{ email?: string }>
}

// Old verify page — redirect to the new /verify-email gate
export default async function VerifyPage({ searchParams }: Props) {
  const { email } = await searchParams
  redirect(`/verify-email${email ? `?email=${encodeURIComponent(email)}` : ''}`)
}
