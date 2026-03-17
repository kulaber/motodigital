'use client'

import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
import type { Builder } from '@/lib/data/builders'

interface Props {
  builders: Builder[]
}

export default function BuilderMarquee({ builders }: Props) {
  const items = [...builders, ...builders]

  return (
    // Outer: nur für die Fade-Maske — overflow visible damit Hover-Lift nicht clippt
    <div
      className="relative py-3"
      style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}
    >
      <div
        className="flex gap-4 w-max cursor-default"
        style={{ animation: 'marquee-ltr 40s linear infinite' }}
        onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
        onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
      >
        {items.map((b, i) => {
          const coverImg = b.media.find(m => m.type === 'image')?.url
          return (
            <Link
              key={`${b.slug}-${i}`}
              href={`/custom-werkstatt/${b.slug}`}
              className="group flex-shrink-0 w-72 bg-white border border-[#222222]/6 rounded-2xl overflow-hidden hover:border-[#DDDDDD] hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300 block"
            >
              {/* Cover image */}
              <div className="relative h-36 overflow-hidden bg-[#F7F7F7]">
                {coverImg ? (
                  <img
                    src={coverImg}
                    alt={b.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#DDDDDD]">{b.initials}</span>
                  </div>
                )}
                {b.featured && (
                  <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest bg-white/90 text-[#222222] px-2 py-0.5 rounded-full shadow-sm">
                    Top Builder
                  </span>
                )}
              </div>

              {/* Card body */}
              <div className="p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#222222]/10 flex items-center justify-center text-xs font-bold text-[#717171] flex-shrink-0">
                    {b.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold text-[#222222] truncate">{b.name}</p>
                      {b.verified && <BadgeCheck size={11} className="text-[#717171] flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-[#222222]/35 truncate">{b.city} · {b.tags.slice(0, 2).join(' · ')}</p>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="#06a5a5"><path d="M7 1L8.5 5.5H13L9.5 8L11 12L7 9.5L3 12L4.5 8L1 5.5H5.5Z"/></svg>
                    <span className="text-xs text-[#222222]/40 font-medium">{b.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-[#222222]/40 leading-relaxed line-clamp-2 mb-3">{b.bio}</p>

                <div className="flex items-center justify-between pt-3 border-t border-[#222222]/6">
                  <span className="text-xs text-[#222222]/30 font-medium">{b.builds} Builds</span>
                  <span className="text-xs text-[#06a5a5] font-semibold opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">Profil →</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <style>{`
        @keyframes marquee-ltr {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
