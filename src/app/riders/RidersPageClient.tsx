'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Settings } from 'lucide-react'
import CommunityFeed from './CommunityFeed'

interface MyProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  city: string | null
  bio: string | null
  role: string | null
  tags: string[] | null
}

interface Props {
  userId: string | null
  myProfile: MyProfile | null
}

function ProfileSidebar({ profile }: { profile: MyProfile }) {
  const name = profile.full_name ?? 'Unbekannt'
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const isWerkstatt = profile.role === 'custom-werkstatt'

  return (
    <div className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden">
      {/* Cover gradient */}
      <div className="h-16 w-full" style={{ background: 'linear-gradient(135deg, #06a5a5 0%, #058f8f 100%)' }} />

      {/* Avatar */}
      <div className="px-4 pb-4">
        <div className="relative -mt-7 mb-3 w-14 h-14 rounded-full overflow-hidden border-2 border-white flex-shrink-0 bg-[#06a5a5]/10">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={name} fill sizes="56px" className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#06a5a5]">
              {initials}
            </div>
          )}
        </div>

        <p className="font-bold text-[#222222] text-sm leading-tight">{name}</p>
        <p className="text-[10px] font-semibold text-[#06a5a5] uppercase tracking-widest mt-0.5">
          {isWerkstatt ? 'Custom Werkstatt' : 'Rider'}
        </p>

        {profile.city && (
          <p className="flex items-center gap-1 text-xs text-[#717171] mt-1.5">
            <MapPin size={10} />
            {profile.city}
          </p>
        )}

        {profile.bio && (
          <p className="text-xs text-[#717171] leading-relaxed mt-2 line-clamp-3">
            {profile.bio}
          </p>
        )}

        {profile.tags && profile.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {profile.tags.slice(0, 4).map(t => (
              <span key={t} className="text-[10px] font-medium text-[#717171] bg-[#F7F7F7] px-2 py-0.5 rounded-full">
                {t}
              </span>
            ))}
          </div>
        )}

        <Link
          href="/dashboard"
          className="mt-4 flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-[#222222]/60 border border-[#EBEBEB] rounded-full py-2 hover:border-[#222222]/25 hover:text-[#222222] transition-all"
        >
          <Settings size={12} />
          Profil bearbeiten
        </Link>
      </div>
    </div>
  )
}

export default function RidersPageClient({ userId, myProfile }: Props) {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 relative">

      {/* Sidebar — absolutely positioned, never affects feed width */}
      {myProfile && (
        <div
          className="hidden xl:block absolute top-8 bottom-0 w-64 pointer-events-none"
          style={{ left: 'calc(50% - 280px - 24px - 256px)' }}
        >
          <div className="sticky top-24 pointer-events-auto flex flex-col gap-4">
            <ProfileSidebar profile={myProfile} />

            <div className="bg-white rounded-2xl border border-[#EBEBEB] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#222222]/30 mb-3">Schnellzugriff</p>
              <div className="flex flex-col gap-1">
                {[
                  { label: 'Meine Bikes', href: '/dashboard/meine-custom-bikes' },
                  { label: 'Nachrichten', href: '/dashboard/messages' },
                  { label: 'Dashboard', href: '/dashboard' },
                ].map(l => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-sm text-[#222222]/60 hover:text-[#222222] py-1.5 px-2 rounded-lg hover:bg-[#F7F7F7] transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feed — always centered, same width logged in or out */}
      <div className="max-w-[560px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-[#222222]">Community Feed</h1>
          <span className="text-xs text-[#222222]/30">Rider Community</span>
        </div>
        <CommunityFeed userId={userId} userRole={myProfile?.role ?? null} />
      </div>

    </div>
  )
}
