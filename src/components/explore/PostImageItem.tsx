'use client'

import { useState } from 'react'
import Image from 'next/image'

interface PostImageItemProps {
  url: string
  alt: string
}

export default function PostImageItem({ url, alt }: PostImageItemProps) {
  const [aspectClass, setAspectClass] = useState('aspect-video')

  return (
    <div className={`relative w-full ${aspectClass} bg-[#F7F7F7] overflow-hidden`}>
      <Image
        src={url}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, 560px"
        className="object-cover"
        onLoad={(e) => {
          const img = e.currentTarget as HTMLImageElement
          if (img.naturalWidth && img.naturalHeight) {
            // landscape → 16:9, portrait/square → 2:3
            setAspectClass(img.naturalWidth > img.naturalHeight ? 'aspect-video' : 'aspect-[2/3]')
          }
        }}
      />
    </div>
  )
}
