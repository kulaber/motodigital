import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

/**
 * Gates an action behind authentication.
 *
 * - If `user` is truthy → calls `onAction()` (the protected action).
 * - If `user` is falsy  → redirects to login with the current path as `redirectTo`,
 *   so the user lands back here after logging in.
 *
 * Usage:
 *   triggerProtectedAction({
 *     user,
 *     router,
 *     redirectTo: '/explore/posts/abc#comment',
 *     onAction: () => setShowCommentBox(true),
 *   })
 */
export function triggerProtectedAction({
  user,
  router,
  redirectTo,
  onAction,
}: {
  user: unknown
  router: AppRouterInstance
  redirectTo: string
  onAction: () => void
}) {
  if (user) {
    onAction()
  } else {
    router.push('/auth/login?redirectTo=' + encodeURIComponent(redirectTo))
  }
}
