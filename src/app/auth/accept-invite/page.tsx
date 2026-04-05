import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { verifyInviteToken } from '@/lib/invite'
import AcceptInviteForm from './AcceptInviteForm'

export const metadata: Metadata = { title: 'Konto einrichten — MotoDigital' }

function ErrorCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <span className="text-xl">⚠️</span>
        </div>
        <h1 className="text-lg font-bold text-white mb-2">{title}</h1>
        <p className="text-sm text-white/40 mb-6">{text}</p>
        <Link
          href="/"
          className="inline-block text-sm font-semibold text-[#06a5a5] hover:text-[#06a5a5]/80 transition-colors"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  )
}

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ pid?: string; t?: string; exp?: string }>
}) {
  const { pid, t, exp } = await searchParams

  if (!pid || !t || !exp) {
    return <ErrorCard title="Ungültiger Link" text="Dieser Einladungslink ist ungültig." />
  }

  const expires = parseInt(exp)
  if (isNaN(expires) || !verifyInviteToken(pid, t, expires)) {
    return <ErrorCard title="Link abgelaufen" text="Dieser Einladungslink ist abgelaufen oder ungültig. Bitte fordere eine neue Einladung an." />
  }

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: { user } } = await admin.auth.admin.getUserById(pid)
  if (!user?.email) {
    return <ErrorCard title="Nicht gefunden" text="Der Account wurde nicht gefunden." />
  }

  if (user.last_sign_in_at) {
    return <ErrorCard title="Bereits eingerichtet" text="Dein Account wurde bereits eingerichtet. Du kannst dich jetzt einloggen." />
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', pid)
    .maybeSingle()

  const werkstattName = (profile as { full_name: string | null } | null)?.full_name ?? ''

  return (
    <AcceptInviteForm
      pid={pid}
      token={t}
      exp={exp}
      email={user.email}
      werkstattName={werkstattName}
    />
  )
}
