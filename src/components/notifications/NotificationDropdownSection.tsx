'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { Bell, Heart, MessageCircle, UserPlus, Tag, Store, Loader2 } from 'lucide-react'
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
    avatar_url: string | null
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

export function NotificationDropdownSection({ userId, onClose }: { userId: string; onClose?: () => void }) {
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await (supabase.from('notifications') as any)
        .select(`
          id, type, entity_type, entity_id, read_at, created_at,
          actor:actor_id (id, username, avatar_url)
        `)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(2)

      setNotifications(data ?? [])
      setLoading(false)
    }
    load()
  }, [userId, supabase])

  const markAllRead = async () => {
    await (supabase.from('notifications') as any)
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_id', userId)
      .is('read_at', null)
    setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })))
    window.dispatchEvent(new Event('notifications-read'))
  }

  const unread = notifications.filter(n => !n.read_at).length

  return (
    <div className="border-b border-[#222222]/6 pb-1 mb-1">
      <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
        <div className="flex items-center gap-1.5">
          <Bell size={12} className="text-[#06a5a5]" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#222222]/35">
            Benachrichtigungen
          </span>
          {unread > 0 && (
            <span className="bg-[#06a5a5] text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-[10px] text-[#06a5a5] hover:underline">
            Alle gelesen
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center px-4 py-4">
          <Loader2 size={16} className="animate-spin text-[#999999]" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-4 py-3 text-[11px] text-[#222222]/30">Keine Benachrichtigungen</div>
      ) : (
        <div>
          {notifications.map(n => {
            const config = TYPE_CONFIG[n.type] ?? { icon: Bell, label: n.type }
            const Icon = config.icon
            const isUnread = !n.read_at

            return (
              <div
                key={n.id}
                className={`flex items-start gap-2.5 px-4 py-2 hover:bg-[#222222]/3 transition-colors ${isUnread ? 'bg-[#06a5a5]/[0.04]' : ''}`}
              >
                <div className="relative shrink-0 mt-0.5">
                  {n.actor?.avatar_url ? (
                    <Image src={n.actor.avatar_url} alt="" width={24} height={24} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#222222]/8 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-[#222222]/35">
                        {n.actor?.username?.[0]?.toUpperCase() ?? '?'}
                      </span>
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white rounded-full flex items-center justify-center border border-[#222222]/8">
                    <Icon size={7} className="text-[#06a5a5]" />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[#222222] leading-snug">
                    <span className="font-semibold">{n.actor?.username ?? 'Jemand'}</span>{' '}
                    <span className="text-[#222222]/50">{config.label}</span>
                  </p>
                  <p className="text-[9px] text-[#222222]/30 mt-0.5">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: de })}
                  </p>
                </div>
                {isUnread && <div className="w-1.5 h-1.5 rounded-full bg-[#06a5a5] shrink-0 mt-1.5" />}
              </div>
            )
          })}
        </div>
      )}

      <Link
        href="/dashboard/notifications"
        onClick={onClose}
        className="block text-center text-[10px] text-[#06a5a5] font-medium hover:underline px-4 pt-1.5 pb-2"
      >
        Alle anzeigen
      </Link>
    </div>
  )
}
