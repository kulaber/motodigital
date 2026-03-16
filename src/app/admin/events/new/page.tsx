import EventEditor from '../EventEditor'
import Header from '@/components/layout/Header'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Neues Event' }

export default function NewEventPage() {
  return (
    <>
      <Header />
      <div className="pt-16">
        <EventEditor />
      </div>
    </>
  )
}
