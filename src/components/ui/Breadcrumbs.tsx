import Link from 'next/link'

type Crumb = { label: string; href?: string }

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#F0EDE4]/40 flex-wrap">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-[#F0EDE4]/20">›</span>}
            {crumb.href && !isLast ? (
              <Link href={crumb.href} className="text-[#2aabab] hover:text-[#1f9999] transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-[#F0EDE4]/60' : 'text-[#2aabab]'}>
                {crumb.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
