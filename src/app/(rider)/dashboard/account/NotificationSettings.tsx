'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Switch } from '@/components/ui/Switch'
import { Bell, Mail, CheckCircle } from 'lucide-react'

type Preferences = {
  inapp_likes: boolean
  inapp_comments: boolean
  inapp_tags: boolean
  inapp_follows: boolean
  inapp_messages: boolean
  inapp_inquiries: boolean
  email_likes: boolean
  email_comments: boolean
  email_tags: boolean
  email_follows: boolean
  email_messages: boolean
  email_inquiries: boolean
}

const defaultPrefs: Preferences = {
  inapp_likes: true,
  inapp_comments: true,
  inapp_tags: true,
  inapp_follows: true,
  inapp_messages: true,
  inapp_inquiries: true,
  email_likes: false,
  email_comments: true,
  email_tags: true,
  email_follows: true,
  email_messages: true,
  email_inquiries: true,
}

type ToggleRow = {
  label: string
  field: keyof Preferences
  workshopOnly?: boolean
}

const inappToggles: ToggleRow[] = [
  { label: 'Likes erhalten', field: 'inapp_likes' },
  { label: 'Kommentare', field: 'inapp_comments' },
  { label: 'Markierungen', field: 'inapp_tags' },
  { label: 'Neue Follower', field: 'inapp_follows' },
  { label: 'Nachrichten', field: 'inapp_messages' },
  { label: 'Anfragen', field: 'inapp_inquiries', workshopOnly: true },
]

const emailToggles: ToggleRow[] = [
  { label: 'Likes erhalten', field: 'email_likes' },
  { label: 'Kommentare', field: 'email_comments' },
  { label: 'Markierungen', field: 'email_tags' },
  { label: 'Neue Follower', field: 'email_follows' },
  { label: 'Nachrichten', field: 'email_messages' },
  { label: 'Anfragen', field: 'email_inquiries', workshopOnly: true },
]

export default function NotificationSettings({ userId, role }: { userId: string; role: string | null }) {
  const supabase = createClient()
  const isWerkstatt = role === 'custom-werkstatt'

  const [prefs, setPrefs] = useState<Preferences>(defaultPrefs)
  const [loading, setLoading] = useState(true)
  const [savedField, setSavedField] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('notification_preferences')
        .select('*')
        .eq('profile_id', userId)
        .maybeSingle()

      if (error) {
        setLoading(false)
        return
      }

      if (!data) {
        await supabase.from('notification_preferences').insert({ profile_id: userId } as any)
        setLoading(false)
        return
      }

      const loaded: Preferences = { ...defaultPrefs }
      for (const key of Object.keys(defaultPrefs) as (keyof Preferences)[]) {
        if (key in data) {
          loaded[key] = (data as Record<string, boolean>)[key] ?? defaultPrefs[key]
        }
      }
      setPrefs(loaded)
      setLoading(false)
    }
    load()
  }, [userId, supabase])

  const toggle = useCallback(async (field: keyof Preferences, value: boolean) => {
    setPrefs(prev => ({ ...prev, [field]: value }))
    setSavedField(null)

    const { error } = await (supabase.from('notification_preferences') as any)
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('profile_id', userId)

    if (error) {
      setPrefs(prev => ({ ...prev, [field]: !value }))
      return
    }

    setSavedField(field)
    setTimeout(() => setSavedField(prev => prev === field ? null : prev), 2000)
  }, [supabase, userId])

  if (loading) {
    return (
      <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 sm:p-6 animate-pulse">
        <div className="h-5 bg-[#222222]/5 rounded w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-8 bg-[#222222]/5 rounded" />)}
        </div>
      </div>
    )
  }

  function renderSection(title: string, icon: React.ReactNode, toggles: ToggleRow[], hint?: string) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h3 className="text-sm font-semibold text-[#222222]">{title}</h3>
        </div>
        <div className="space-y-0">
          {toggles
            .filter(t => !t.workshopOnly || isWerkstatt)
            .map((t, i, arr) => (
              <div
                key={t.field}
                className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? 'border-b border-[#222222]/6' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#222222]/70">{t.label}</span>
                  {savedField === t.field && (
                    <span className="flex items-center gap-1 text-[11px] text-green-500">
                      <CheckCircle size={12} /> Gespeichert
                    </span>
                  )}
                </div>
                <Switch
                  checked={prefs[t.field]}
                  onCheckedChange={(val) => toggle(t.field, val)}
                />
              </div>
            ))}
        </div>
        {hint && <p className="text-[10px] text-[#222222]/30 mt-3">{hint}</p>}
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 sm:p-6 space-y-8">
      <div>
        <h2 className="text-lg font-bold text-[#222222]">Benachrichtigungen</h2>
        <p className="text-sm text-[#222222]/40 mt-0.5">Bestimme, wie und worüber du informiert wirst</p>
      </div>

      {renderSection(
        'Auf der Website',
        <Bell size={16} className="text-[#222222]/40" />,
        inappToggles,
      )}

      <div className="border-t border-[#222222]/6" />

      {renderSection(
        'Per E-Mail',
        <Mail size={16} className="text-[#222222]/40" />,
        emailToggles,
        'Celebration-Mails beim Veröffentlichen können nicht deaktiviert werden.',
      )}
    </div>
  )
}
