import LandingPage from './landing/page'

export { metadata } from './landing/page'

// Rider redirect is handled by middleware / client-side navigation.
// No getUser() call here — avoids blocking DB query on every landing page load.
export default function RootPage() {
  return <LandingPage />
}
