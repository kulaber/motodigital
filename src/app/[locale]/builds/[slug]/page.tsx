import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function BuildRedirectPage({ params }: Props) {
  const { slug } = await params
  redirect(`/custom-bike/${slug}`)
}
