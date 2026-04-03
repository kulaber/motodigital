'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Tab = 'followers' | 'following'

interface FollowerUser {
  id: string
  slug: string | null
  username: string
  full_name: string | null
  avatar_url: string | null
}

interface Props {
  riderId: string
  riderName: string
  followerCount: number
  followingCount: number
}

export default function FollowerListModal({ riderId, riderName, followerCount, followingCount }: Props) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('followers')
  const [users, setUsers] = useState<FollowerUser[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    async function load() {
      setLoading(true)
      const supabase = createClient()

      // Get follower/following IDs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: rows } = await (supabase.from('followers') as any)
        .select(tab === 'followers' ? 'follower_id' : 'following_id')
        .eq(tab === 'followers' ? 'following_id' : 'follower_id', riderId)

      const ids = (rows ?? []).map((r: Record<string, string>) =>
        tab === 'followers' ? r.follower_id : r.following_id
      )

      if (ids.length === 0) {
        setUsers([])
        setLoading(false)
        return
      }

      // Fetch profiles for those IDs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profiles } = await (supabase.from('profiles') as any)
        .select('id, slug, username, full_name, avatar_url')
        .in('id', ids)

      setUsers((profiles ?? []) as FollowerUser[])
      setLoading(false)
    }
    load()
  }, [open, tab, riderId])

  function openTab(t: Tab) {
    setTab(t)
    setOpen(true)
  }

  const firstName = riderName.split(' ')[0]

  return (
    <>
      {/* Stat Buttons */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => openTab('followers')}
          className="group flex flex-col items-center cursor-pointer"
        >
          <span className="text-lg font-bold text-[#222222] group-hover:text-[#06a5a5] transition-colors leading-none">{followerCount}</span>
          <span className="text-[11px] text-[#999999] group-hover:text-[#06a5a5]/60 transition-colors mt-0.5">Follower</span>
        </button>
        <div className="w-px h-8 bg-[#EBEBEB]" />
        <button
          onClick={() => openTab('following')}
          className="group flex flex-col items-center cursor-pointer"
        >
          <span className="text-lg font-bold text-[#222222] group-hover:text-[#06a5a5] transition-colors leading-none">{followingCount}</span>
          <span className="text-[11px] text-[#999999] group-hover:text-[#06a5a5]/60 transition-colors mt-0.5">Folgt</span>
        </button>
      </div>

      {/* Modal Backdrop */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center sm:justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Modal — fullscreen on mobile, centered card on desktop */}
          <div className="relative bg-white w-full h-full sm:h-auto sm:rounded-2xl sm:shadow-xl sm:max-w-sm sm:max-h-[70vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="text-base font-bold text-[#222222]">{firstName}</h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-[#F7F7F7] transition-colors">
                <X size={18} className="text-[#717171]" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#EBEBEB] px-5">
              <button
                onClick={() => setTab('followers')}
                className={`flex-1 text-sm font-medium pb-2.5 border-b-2 transition-colors ${
                  tab === 'followers'
                    ? 'border-[#222222] text-[#222222]'
                    : 'border-transparent text-[#999999] hover:text-[#717171]'
                }`}
              >
                Follower · {followerCount}
              </button>
              <button
                onClick={() => setTab('following')}
                className={`flex-1 text-sm font-medium pb-2.5 border-b-2 transition-colors ${
                  tab === 'following'
                    ? 'border-[#222222] text-[#222222]'
                    : 'border-transparent text-[#999999] hover:text-[#717171]'
                }`}
              >
                Folgt · {followingCount}
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={20} className="animate-spin text-[#999999]" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-sm text-[#999999] text-center py-10">
                  {tab === 'followers' ? 'Noch keine Follower' : 'Folgt noch niemandem'}
                </p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {users.map(u => {
                    const profileUrl = `/rider/${u.slug ?? u.username}`
                    const name = u.full_name ?? u.username
                    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

                    return (
                      <Link
                        key={u.id}
                        href={profileUrl}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F7F7F7] transition-colors"
                      >
                        <div className="relative w-9 h-9 rounded-full bg-[#06a5a5] overflow-hidden flex items-center justify-center flex-shrink-0">
                          {u.avatar_url ? (
                            <Image src={u.avatar_url} alt={name} fill sizes="36px" className="object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-white">{initials}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#222222] truncate">{name}</p>
                          <p className="text-xs text-[#999999]">@{u.username}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
