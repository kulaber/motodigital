'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Shield, Trash2, AlertTriangle } from 'lucide-react'
import { deleteRider } from '@/lib/actions/riders'

type RiderProfile = {
  id: string
  full_name: string | null
  username: string | null
  email?: string | null
}

export default function AdminDeleteRiderPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [rider, setRider]       = useState<RiderProfile | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: me } = await (supabase.from('profiles') as any)
        .select('role').eq('id', user.id).maybeSingle()
      if (me?.role !== 'superadmin') { router.push('/dashboard'); return }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('profiles') as any)
        .select('id, full_name, username')
        .eq('id', id)
        .maybeSingle() as { data: RiderProfile | null }

      if (!data) { router.push('/admin/riders'); return }
      setRider(data)
      setLoading(false)
    }
    load()
  }, [id, router])

  async function handleDelete() {
    if (!rider) return
    setDeleting(true)
    setError(null)

    const result = await deleteRider(rider.id)

    if (result.error) {
      setError(result.error)
      setDeleting(false)
    } else {
      router.push('/admin/riders')
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 pt-8 pb-16">

        <Link href="/admin/riders" className="inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#222222] transition-colors mb-8">
          <ArrowLeft size={13} /> Rider-Liste
        </Link>

        <div className="flex items-center gap-2 mb-1">
          <Shield size={14} className="text-amber-400" />
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Superadmin</p>
        </div>

        {loading ? (
          <div className="space-y-3 mt-6">
            {[1,2].map(i => <div key={i} className="h-14 rounded-xl bg-[#F7F7F7] animate-pulse" />)}
          </div>
        ) : (
          <div className="mt-6 space-y-5">

            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#222222]">Rider löschen?</h1>
                <p className="text-sm text-[#222222]/50 mt-1">
                  <span className="font-semibold text-[#222222]">{rider?.full_name ?? rider?.username ?? id}</span> wird dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">{error}</div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Link href="/admin/riders" className="text-xs text-[#222222]/35 hover:text-[#222222] transition-colors">
                Abbrechen
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 bg-red-500 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-red-600 transition-all disabled:opacity-40"
              >
                <Trash2 size={14} />
                {deleting ? 'Wird gelöscht…' : 'Endgültig löschen'}
              </button>
            </div>

          </div>
        )}
    </div>
  )
}
