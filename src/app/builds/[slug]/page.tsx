import { redirect } from 'next/navigation'
import { BUILDS } from '@/lib/data/builds'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return BUILDS.map(b => ({ slug: b.slug }))
}

export default async function BuildRedirectPage({ params }: Props) {
  const { slug } = await params
  redirect(`/custom-bike/${slug}`)
}
