import { createNavigation } from 'next-intl/navigation'
import type { ComponentProps, ReactElement } from 'react'
import { routing } from './routing'

const nav = createNavigation(routing)

// Loose href type: string with query/hash, or object form. Runtime slug
// translation via `routing.pathnames` still applies in all cases.
type LooseHref =
  | string
  | {
      pathname: string
      params?: Record<string, string | number>
      query?: Record<string, string | number | undefined>
      hash?: string
    }

type LooseLinkProps = Omit<ComponentProps<typeof nav.Link>, 'href'> & {
  href: LooseHref
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Link = nav.Link as unknown as (props: LooseLinkProps) => ReactElement

// Loose router — push/replace accept any path string or object at runtime.
type LooseRouter = {
  push: (href: LooseHref, options?: { locale?: string; scroll?: boolean }) => void
  replace: (href: LooseHref, options?: { locale?: string; scroll?: boolean }) => void
  prefetch: (href: LooseHref, options?: { locale?: string }) => void
  back: () => void
  forward: () => void
  refresh: () => void
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useRouter = nav.useRouter as unknown as () => LooseRouter

export const redirect = nav.redirect
export const usePathname = nav.usePathname
export const getPathname = nav.getPathname
