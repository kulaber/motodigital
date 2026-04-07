'use client'

import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={async () => { await supabase.auth.signOut(); router.push('/'); router.refresh() }}
      className="lg:hidden flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-red-400/20 text-red-400 text-sm font-semibold hover:bg-red-50 transition-colors"
    >
      <LogOut size={15} />
      Abmelden
    </button>
  )
}
