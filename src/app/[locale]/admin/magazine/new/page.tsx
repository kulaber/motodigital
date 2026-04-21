import ArticleEditor from '../ArticleEditor'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Neuer Beitrag' }

export default function NewArticlePage() {
  return <ArticleEditor />
}
