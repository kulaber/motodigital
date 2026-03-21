'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Settings } from 'lucide-react'
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

interface MyBike {
  title: string
  make: string
  model: string
  cover_url: string | null
}

interface Props {
  userId: string | null
  myProfile: MyProfile | null
  myBikes: MyBike[]
}

function ProfileSidebar({ profile, bikes }: { profile: MyProfile; bikes: MyBike[] }) {
  const name = profile.full_name ?? 'Unbekannt'
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const isWerkstatt = profile.role === 'custom-werkstatt'
  const roleLabel = isWerkstatt ? 'Custom Werkstatt' : 'Rider'

  return (
    <div className="bg-white rounded-2xl border border-[#EBEBEB] p-4 flex flex-col gap-4">

      {/* Profile row */}
      <div className="flex items-center gap-3">
        <div className="relative w-11 h-11 flex-shrink-0">
          <div className="absolute inset-0 rounded-full overflow-hidden bg-[#F0F0F0]">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={name} fill sizes="44px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#222222]/40">
                {initials}
              </div>
            )}
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[#222222] text-sm leading-tight truncate">{name}</p>
          <p className="text-[10px] font-semibold text-[#222222]/40 uppercase tracking-widest mt-0.5">{roleLabel}</p>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-xs text-[#717171] leading-relaxed line-clamp-3 -mt-1">
          {profile.bio}
        </p>
      )}

      {/* My Bikes */}
      {bikes.length > 0 && (
        <>
          <div className="border-t border-[#F0F0F0]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#222222]/30 mb-2">
              {bikes.length === 1 ? 'Mein Bike' : 'Meine Bikes'}
            </p>
            <div className="flex flex-col gap-2.5">
              {bikes.map((bike, i) => (
                <Link key={i} href="/dashboard/meine-custom-bikes" className="flex items-center gap-3 group">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#F0F0F0]">
                    {bike.cover_url ? (
                      <Image src={bike.cover_url} alt={bike.title} fill sizes="40px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[#222222]/25">
                        {bike.make[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#222222] group-hover:text-[#06a5a5] transition-colors truncate leading-tight">
                      {bike.title}
                    </p>
                    <p className="text-[10px] text-[#222222]/40 truncate">{bike.make} {bike.model}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Edit profile */}
      <Link
        href="/dashboard"
        className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-[#222222]/50 border border-[#EBEBEB] rounded-full py-2 hover:border-[#222222]/20 hover:text-[#222222] transition-all"
      >
        <Settings size={11} />
        Profil bearbeiten
      </Link>
    </div>
  )
}

export default function RidersPageClient({ userId, myProfile, myBikes }: Props) {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 relative">

      {/* Sidebar — absolutely positioned, never affects feed width */}
      {myProfile && (
        <div
          className="hidden xl:block absolute top-8 bottom-0 w-64 pointer-events-none"
          style={{ left: 'calc(50% - 280px - 24px - 256px)' }}
        >
          <div className="sticky top-24 pointer-events-auto flex flex-col gap-4">
            <ProfileSidebar profile={myProfile} bikes={myBikes} />

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
