'use client'

import dynamic from 'next/dynamic'
import type { Builder } from '@/lib/data/builders'

const BuilderPageClient = dynamic(() => import('./BuilderPageClient'), { ssr: false })

export default function BuilderPageClientLoader({ builders }: { builders: Builder[] }) {
  return <BuilderPageClient builders={builders} />
}
