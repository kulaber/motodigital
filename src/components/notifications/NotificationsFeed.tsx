'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow, isToday, isThisWeek } from 'date-fns'
import { de } from 'date-fns/locale'
import { Bell, Heart, MessageCircle, UserPlus, Tag, Store } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type NotificationRow = {
  id: string
  type: string
  entity_type: string | null
  entity_id: string | null
  read_at: string | null
  created_at: string
  actor: {
    id: string
    username: string
    slug: string | null
    avatar_url: string | null
    role: string | null
  } | null
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string }> = {
  like:                 { icon: Heart,          label: 'hat deinen Beitrag geliked' },
  comment:              { icon: MessageCircle,  label: 'hat kommentiert' },
  follow:               { icon: UserPlus,       label: 'folgt dir jetzt' },
  tag:                  { icon: Tag,            label: 'hat dich markiert' },
  message:              { icon: MessageCircle,  label: 'hat dir geschrieben' },
  inquiry:              { icon: Store,          label: 'hat eine Anfrage gesendet' },
  publish_celebration:  { icon: Bell,           label: 'Dein Bike ist jetzt live' },
}

const PAGE_SIZE = 20

function getEntityHref(n: NotificationRow): string | null {
  if (n.type === 'follow' && n.actor?.slug) {
    return n.actor.role === 'custom-werkstatt'
      ? `/custom-werkstatt/${n.actor.slug}`
      : `/rider/${n.actor.slug}`
  }
  if (n.type === 'message') return '/dashboard/messages'
  if (n.type === 'inquiry') return '/dashboard/messages'
  if (n.entity_type === 'bike' && n.entity_id) return `/bikes/${n.entity_id}`
  if (n.entity_type === 'post' && n.entity_id) return `/explore?post=${n.entity_id}`
  return null
}

export default function NotificationsFeed({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const supabase = createClient()

  const loadPage = useCallback(async (offset: number) => {
    const { data } = await (supabase.from('notifications') as any)
      .select(`
        id, type, entity_type, entity_id, read_at, created_at,
        actor:actor_id (id, username, slug, avatar_url, role)
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    return (data ?? []) as NotificationRow[]
  }, [userId, supabase])

  useEffect(() => {
    async function init() {
      const data = await loadPage(0)
      setNotifications(data)
      setHasMore(data.length === PAGE_SIZE)
      setLoading(false)

      // Alle ungelesenen als gelesen markieren
      await (supabase.from('notifications') as any)
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_id', userId)
        .is('read_at', null)

      window.dispatchEvent(new Event('notifications-read'))
    }
    init()
  }, [userId, supabase, loadPage])

  const loadMore = async () => {
    const data = await loadPage(notifications.length)
    setNotifications(prev => [...prev, ...data])
    setHasMore(data.length === PAGE_SIZE)
  }

  if (loading) {
    return (
      <div className="bg-white border border-[#222222]/6 rounded-2xl p-6 animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-[#222222]/5" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[#222222]/5 rounded w-3/4" />
                <div className="h-2 bg-[#222222]/5 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white border border-[#222222]/6 rounded-2xl py-16 text-center">
        <Bell size={32} className="mx-auto text-[#222222]/15 mb-3" />
        <p className="text-sm text-[#222222]/40">Noch keine Benachrichtigungen</p>
        <p className="text-xs text-[#222222]/25 mt-1">Teile deinen ersten Build mit der Community</p>
      </div>
    )
  }

  // Gruppierung
  const groups: { label: string; items: NotificationRow[] }[] = []
  const today: NotificationRow[] = []
  const thisWeek: NotificationRow[] = []
  const older: NotificationRow[] = []

  for (const n of notifications) {
    const d = new Date(n.created_at)
    if (isToday(d)) today.push(n)
    else if (isThisWeek(d, { weekStartsOn: 1 })) thisWeek.push(n)
    else older.push(n)
  }
  if (today.length) groups.push({ label: 'Heute', items: today })
  if (thisWeek.length) groups.push({ label: 'Diese Woche', items: thisWeek })
  if (older.length) groups.push({ label: 'Früher', items: older })

  return (
    <div className="bg-white border border-[#222222]/6 rounded-2xl overflow-hidden">
      {groups.map((group, gi) => (
        <div key={group.label}>
          <div className={`px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#222222]/30 ${gi > 0 ? 'border-t border-[#222222]/6' : ''}`}>
            {group.label}
          </div>
          {group.items.map((n) => {
            const config = TYPE_CONFIG[n.type] ?? { icon: Bell, label: n.type }
            const Icon = config.icon
            const wasUnread = !n.read_at
            const href = getEntityHref(n)

            const content = (
              <div className={`flex items-start gap-3 px-5 py-3 transition-colors hover:bg-[#222222]/3 ${wasUnread ? 'border-l-2 border-[#06a5a5]' : 'border-l-2 border-transparent'}`}>
                <div className="relative shrink-0 mt-0.5">
                  {n.actor?.avatar_url ? (
                    <Image src={n.actor.avatar_url} alt="" width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#222222]/8 flex items-center justify-center">
                      <span className="text-[11px] font-bold text-[#222222]/35">
                        {n.actor?.username?.[0]?.toUpperCase() ?? '?'}
                      </span>
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center border border-[#222222]/8">
                    <Icon size={9} className="text-[#06a5a5]" />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#222222] leading-snug">
                    <span className="font-semibold">{n.actor?.username ?? 'Jemand'}</span>{' '}
                    <span className="text-[#222222]/55">{config.label}</span>
                  </p>
                  <p className="text-[11px] text-[#222222]/30 mt-0.5">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: de })}
                  </p>
                </div>
              </div>
            )

            return href ? (
              <Link key={n.id} href={href} className="block">
                {content}
              </Link>
            ) : (
              <div key={n.id}>{content}</div>
            )
          })}
        </div>
      ))}

      {hasMore && (
        <div className="border-t border-[#222222]/6 px-5 py-3 text-center">
          <button onClick={loadMore} className="text-xs text-[#06a5a5] font-medium hover:underline">
            Mehr laden
          </button>
        </div>
      )}
    </div>
  )
}
