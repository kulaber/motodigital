import ArticleEditor from '../ArticleEditor'
import Header from '@/components/layout/Header'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Neuer Beitrag' }

export default function NewArticlePage() {
  return (
    <>
      <Header />
      <div className="pt-16">
        <ArticleEditor />
      </div>
    </>
  )
}
