'use client'

import Link from 'next/link'
import { MessageCircle, Pencil } from 'lucide-react'
import BuildGallery from '@/components/build/BuildGallery'
import ContactModal from './ContactModal'
import { track } from '@/lib/track'

interface Props {
  images: string[]
  title: string
  bikeId: string
  sellerId: string
  sellerName: string
  sellerAvatarUrl?: string
  sellerRole: string | null
  coverImage: string | null
  listingType?: string | null
  editHref?: string
  workshopId?: string | null
}

export default function BikeGallerySection({
  images, title, bikeId,
  sellerId, sellerName, sellerAvatarUrl, sellerRole, coverImage, listingType,
  editHref, workshopId,
}: Props) {
  return (
    <BuildGallery
      images={images}
      title={title}
      bikeId={bikeId}
      listingType={listingType}
      onGalleryClick={() => {
        if (workshopId) {
          track({ event_type: 'gallery_click', target_type: 'bike', target_id: bikeId, workshop_id: workshopId })
        }
      }}
      ownerEditSlot={editHref ? (
        <Link
          href={editHref}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow-md text-[#222] hover:bg-white transition-all"
          aria-label="Bike bearbeiten"
        >
          <Pencil size={17} />
        </Link>
      ) : undefined}
      modalContactSlot={
        <ContactModal
          sellerId={sellerId}
          sellerName={sellerName}
          sellerAvatarUrl={sellerAvatarUrl}
          sellerRole={sellerRole}
          bikeId={bikeId}
          bikeTitle={title}
          coverImage={coverImage}
          workshopId={workshopId}
          renderTrigger={(onClick) => (
            <button
              onClick={onClick}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F0F0F0] text-[#222222] hover:bg-[#E5E5E5] transition-all"
              aria-label="Nachricht senden"
            >
              <MessageCircle size={17} />
            </button>
          )}
        />
      }
    />
  )
}
