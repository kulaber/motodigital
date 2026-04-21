'use client'

import { Link } from '@/i18n/navigation'
import { Pencil } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface Props {
  builderSlug: string
  iconOnly?: boolean
}

export default function OwnerEditButton({ builderSlug, iconOnly }: Props) {
  const { user, role, slug } = useAuth()

  const isOwner = user && role === 'custom-werkstatt' && slug === builderSlug
  const isAdmin = user && role === 'superadmin'

  if (!isOwner && !isAdmin) return null

  const href = isAdmin
    ? `/admin/custom-werkstatt/${builderSlug}/edit`
    : '/dashboard/profile'

  if (iconOnly) {
    return (
      <Link
        href={href}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow-md text-[#222] hover:bg-white transition-all"
        aria-label="Profil bearbeiten"
      >
        <Pencil size={17} />
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all"
    >
      <Pencil size={13} />
      Bearbeiten
    </Link>
  )
}
