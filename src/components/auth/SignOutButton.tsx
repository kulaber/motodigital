'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-3 px-4 py-3.5 w-full text-left
                 hover:bg-[#222222]/[0.03] transition-colors"
    >
      <span className="text-base w-5 text-center flex-shrink-0">🚪</span>
      <span className="text-sm font-medium text-red-400">Abmelden</span>
    </button>
  )
}
