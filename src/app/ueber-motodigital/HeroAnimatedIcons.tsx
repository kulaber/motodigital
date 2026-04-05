'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const icons = [
  '/custom-werkstatt.png',
  '/custom-bikes.png',
  '/rider.png',
]

export default function HeroAnimatedIcons() {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent(c => (c + 1) % icons.length)
        setVisible(true)
      }, 400)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-end pr-8 lg:pr-16">
      <Image
        src={icons[current]}
        alt=""
        width={340}
        height={340}
        className="h-[340px] sm:h-[420px] w-auto object-contain"
        style={{
          opacity: visible ? 0.17 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />
    </div>
  )
}
