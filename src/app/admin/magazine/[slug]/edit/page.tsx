import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { ARTICLES } from '@/lib/data/magazine'
import ArticleEditor from '../../ArticleEditor'

export const metadata: Metadata = { title: 'Admin — Beitrag bearbeiten' }

export default async function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .maybeSingle() as { data: { role: string } | null }

  if (profile?.role !== 'superadmin') redirect('/dashboard')

  const article = ARTICLES.find(a => a.slug === slug)
  if (!article) notFound()

  return (
    <>
      <Header />
      <div className="pt-16">
        <ArticleEditor initialArticle={article} />
      </div>
    </>
  )
}
