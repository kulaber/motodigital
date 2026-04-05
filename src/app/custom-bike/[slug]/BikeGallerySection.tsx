'use client'

import { MessageCircle } from 'lucide-react'
import BuildGallery from '@/components/build/BuildGallery'
import ContactModal from './ContactModal'

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
}

export default function BikeGallerySection({
  images, title, bikeId,
  sellerId, sellerName, sellerAvatarUrl, sellerRole, coverImage, listingType,
}: Props) {
  return (
    <BuildGallery
      images={images}
      title={title}
      bikeId={bikeId}
      listingType={listingType}
      modalContactSlot={
        <ContactModal
          sellerId={sellerId}
          sellerName={sellerName}
          sellerAvatarUrl={sellerAvatarUrl}
          sellerRole={sellerRole}
          bikeId={bikeId}
          bikeTitle={title}
          coverImage={coverImage}
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
