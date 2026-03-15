import { redirect } from 'next/navigation'

// Root "/" redirects to the map view (main product)
// Landing page lives at /landing for pre-auth visitors
export default function Home() {
  redirect('/map')
}
