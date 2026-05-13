import Link from 'next/link'
import Header from '@/components/layout/Header'

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#2AABAB] mb-4">
          404
        </p>
        <h2 className="text-2xl font-bold text-[#222222] mb-2">Seite nicht gefunden</h2>
        <p className="text-[#717171] mb-6 max-w-md">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <Link
          href="/"
          className="rounded-full bg-[#2AABAB] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2AABAB]/90"
        >
          Zur Startseite
        </Link>
      </div>
    </>
  )
}
