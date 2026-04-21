'use client'

import { useRouter } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer"
    >
      Abmelden
    </button>
  )
}
