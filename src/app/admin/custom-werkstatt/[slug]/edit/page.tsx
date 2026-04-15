'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Shield, BadgeCheck, ExternalLink } from 'lucide-react'
import ProfileEditForm from '@/app/dashboard/profile/ProfileEditForm'

/* ── Types ─────────────────────────────────────────────────────────── */

type ProfileData = {
  id: string
  full_name: string | null
  slug: string | null
  bio: string | null
  bio_long: string | null
  city: string | null
  specialty: string | null
  since_year: number | null
  tags: string[] | null
  bases: string[] | null
  address: string | null
  lat: number | null
  lng: number | null
  instagram_url: string | null
  tiktok_url: string | null
  website_url: string | null
  youtube_url: string | null
  avatar_url: string | null
  opening_hours: { day: string; hours: string }[] | null
  is_verified: boolean
}

type MediaItem = {
  id: string
  url: string
  type: 'image' | 'video'
  title: string | null
  position: number
}

/* ── Component ─────────────────────────────────────────────────────── */

export default function EditBuilderPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [dbProfile, setDbProfile] = useState<ProfileData | null>(null)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [isVerified, setIsVerified] = useState(false)
  const [savingVerified, setSavingVerified] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: me } = await (supabase.from('profiles') as any)
        .select('role').eq('id', user.id).maybeSingle()
      if (me?.role !== 'superadmin') { router.push('/dashboard'); return }

      const { data } = await (supabase.from('profiles') as any)
        .select('id, full_name, slug, bio, bio_long, city, specialty, since_year, tags, bases, address, lat, lng, instagram_url, tiktok_url, website_url, youtube_url, avatar_url, opening_hours, is_verified')
        .or(`username.eq.${slug},slug.eq.${slug}`)
        .maybeSingle() as { data: ProfileData | null }

      if (data) {
        setDbProfile(data)
        setIsVerified(data.is_verified)

        // Load media
        const { data: mediaData } = await (supabase.from('builder_media') as any)
          .select('id, url, type, title, position')
          .eq('builder_id', data.id)
          .order('position', { ascending: true })

        setMedia(mediaData ?? [])
      }
      setLoading(false)
    }
    load()
  }, [slug, router])

  async function handleToggleVerified() {
    if (!dbProfile) return
    setSavingVerified(true)
    const newVal = !isVerified
    const supabase = createClient()
    const { error } = await (supabase.from('profiles') as any)
      .update({ is_verified: newVal })
      .eq('id', dbProfile.id)
    if (!error) setIsVerified(newVal)
    setSavingVerified(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16">

      <div className="flex items-center justify-between mb-8">
        <Link href="/admin/custom-werkstatt" className="inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#222222] transition-colors">
          <ArrowLeft size={13} /> Builder-Liste
        </Link>
        <a href={`/custom-werkstatt/${slug}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#717171] transition-colors">
          <ExternalLink size={12} /> Profil ansehen
        </a>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <Shield size={14} className="text-amber-400" />
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Superadmin</p>
      </div>
      <h1 className="text-2xl font-bold text-[#222222] mb-1">{dbProfile?.full_name || slug}</h1>
      <p className="text-xs text-[#222222]/30 mb-8">@{slug}</p>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl bg-white animate-pulse" />)}
        </div>
      ) : !dbProfile ? (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-white border border-[#222222]/6">
          <div className="w-2 h-2 rounded-full flex-shrink-0 bg-amber-400" />
          <p className="text-xs text-[#222222]/50">
            Kein Supabase-Konto — nur statische Profildaten verfügbar (schreibgeschützt)
          </p>
        </div>
      ) : (
        <div className="space-y-5">

          {/* Source indicator */}
          <div className="flex items-center gap-2 p-4 rounded-2xl bg-white border border-[#222222]/6">
            <div className="w-2 h-2 rounded-full flex-shrink-0 bg-green-400" />
            <p className="text-xs text-[#222222]/50">
              Supabase-Profil gefunden — Änderungen werden in der Datenbank gespeichert
            </p>
          </div>

          {/* Admin: Verified toggle */}
          <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-[#222222]/30 uppercase tracking-widest mb-4">Admin-Status</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={handleToggleVerified}
                className={`w-10 h-6 rounded-full border-2 transition-all relative ${
                  isVerified ? 'bg-[#06a5a5] border-[#DDDDDD]' : 'bg-transparent border-[#222222]/20'
                } ${savingVerified ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isVerified ? 'left-4' : 'left-0.5'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#222222] flex items-center gap-1.5">
                  <BadgeCheck size={14} className={isVerified ? 'text-[#717171]' : 'text-[#222222]/20'} />
                  Verifizierter Builder
                </p>
                <p className="text-xs text-[#222222]/30 mt-0.5">Zeigt das Verified-Badge auf dem Profil</p>
              </div>
            </label>
          </div>

          {/* Same form as workshop's own profile edit — admin always has full access */}
          <ProfileEditForm profile={dbProfile} media={media} subscriptionTier="founding_partner" workshopId={null} />

        </div>
      )}
    </div>
  )
}
