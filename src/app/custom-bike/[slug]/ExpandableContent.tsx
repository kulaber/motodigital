'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  children: React.ReactNode
  collapsedMaxHeight?: number
}

export default function ExpandableContent({ children, collapsedMaxHeight = 200 }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [needsToggle, setNeedsToggle] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setNeedsToggle(el.scrollHeight > collapsedMaxHeight + 2)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [collapsedMaxHeight])

  const shouldClamp = !expanded && needsToggle

  return (
    <>
      <div
        ref={ref}
        className="relative overflow-hidden"
        style={shouldClamp ? { maxHeight: `${collapsedMaxHeight}px` } : undefined}
      >
        {children}
        {shouldClamp && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      {needsToggle && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 text-xs font-semibold text-[#222222] underline underline-offset-4 hover:text-[#06a5a5] transition-colors"
        >
          {expanded ? 'Weniger anzeigen' : 'Mehr anzeigen'}
        </button>
      )}
    </>
  )
}
