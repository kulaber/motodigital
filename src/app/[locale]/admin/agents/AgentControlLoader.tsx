'use client'

import dynamic from 'next/dynamic'
import type { AgentControlProps } from './AgentControl'

// WebGL needs the browser — no server render
const AgentControl = dynamic(() => import('./AgentControl'), { ssr: false })

export default function AgentControlLoader(props: AgentControlProps) {
  return <AgentControl {...props} />
}
