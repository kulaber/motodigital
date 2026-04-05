import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Account gelöscht' }

const messages: Record<string, { title: string; text: string }> = {
  success: {
    title: 'Account gelöscht',
    text: 'Dein Account und alle zugehörigen Daten wurden endgültig gelöscht. Wir wünschen dir alles Gute.',
  },
  expired: {
    title: 'Link abgelaufen',
    text: 'Der Bestätigungslink ist abgelaufen. Bitte fordere die Löschung erneut über deine Konto-Einstellungen an.',
  },
  invalid: {
    title: 'Ungültiger Link',
    text: 'Der Bestätigungslink ist ungültig. Bitte fordere die Löschung erneut über deine Konto-Einstellungen an.',
  },
  error: {
    title: 'Fehler',
    text: 'Beim Löschen deines Accounts ist ein Fehler aufgetreten. Bitte versuche es später erneut oder kontaktiere den Support.',
  },
}

export default async function AccountDeletedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const msg = messages[status ?? 'success'] ?? messages.success
  const isSuccess = status === 'success' || !status

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className={`w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center ${isSuccess ? 'bg-[#222222]/5' : 'bg-red-50'}`}>
          <span className="text-2xl">{isSuccess ? '👋' : '⚠️'}</span>
        </div>
        <h1 className="text-xl font-bold text-[#222222] mb-2">{msg.title}</h1>
        <p className="text-sm text-[#222222]/50 leading-relaxed mb-8">{msg.text}</p>
        <Link
          href="/"
          className="inline-block bg-[#222222] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#333] transition-colors"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  )
}
