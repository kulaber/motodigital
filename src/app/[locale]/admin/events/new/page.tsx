import EventEditor from '../EventEditor'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Neues Event' }

export default function NewEventPage() {
  return <EventEditor />
}
