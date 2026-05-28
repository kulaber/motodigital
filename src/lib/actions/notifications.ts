'use server'

import { Resend } from 'resend'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://motodigital.io'

type NotifType = 'message' | 'like' | 'comment' | 'follow'

const EMAIL_PREF_KEY: Record<NotifType, string> = {
  message: 'email_messages',
  like: 'email_likes',
  comment: 'email_comments',
  follow: 'email_follows',
}

// Default email pref when no row exists yet (mirrors defaultPrefs in NotificationSettings)
const DEFAULT_EMAIL_PREF: Record<NotifType, boolean> = {
  message: true,
  like: false,
  comment: true,
  follow: true,
}

export async function sendEmailNotification(params: {
  type: NotifType
  actorId: string
  /** For 'follow': the person being followed */
  recipientId?: string
  /** For 'like' / 'comment': the post to look up the owner from */
  postId?: string
  /** For 'message': the conversation to derive the other participant from */
  conversationId?: string
  /** For 'comment': snippet shown in the email body */
  commentBody?: string
}): Promise<void> {
  try {
    const { type, actorId, postId, conversationId, commentBody } = params
    let { recipientId } = params

    // Verify caller identity server-side
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== actorId) return

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Derive recipient from DB context (never trust client-sent recipientId for like/comment)
    if ((type === 'like' || type === 'comment') && postId) {
      const { data: post } = await (admin.from('community_posts') as any)
        .select('user_id')
        .eq('id', postId)
        .maybeSingle()
      recipientId = post?.user_id
    }

    if (type === 'message' && conversationId) {
      const { data: conv } = await (admin.from('conversations') as any)
        .select('buyer_id, seller_id')
        .eq('id', conversationId)
        .maybeSingle()
      if (conv) {
        recipientId = actorId === conv.buyer_id ? conv.seller_id : conv.buyer_id
      }
    }

    // No self-notifications, no unresolvable recipients
    if (!recipientId || recipientId === actorId) return

    // Check notification preference
    const prefKey = EMAIL_PREF_KEY[type]
    const { data: prefs } = await (admin.from('notification_preferences') as any)
      .select(prefKey)
      .eq('profile_id', recipientId)
      .maybeSingle()

    const prefValue = prefs ? (prefs[prefKey] as boolean | null) : null
    const emailEnabled = prefValue === null ? DEFAULT_EMAIL_PREF[type] : prefValue
    if (!emailEnabled) return

    // Get actor display name
    const { data: actor } = await (admin.from('profiles') as any)
      .select('full_name, username, slug')
      .eq('id', actorId)
      .maybeSingle()
    const actorName: string = actor?.full_name || actor?.username || 'Jemand'
    const actorSlug: string | undefined = actor?.slug

    // Get recipient email via admin API (never stored in profiles)
    const { data: { user: recipientUser } } = await admin.auth.admin.getUserById(recipientId)
    const recipientEmail = recipientUser?.email
    if (!recipientEmail) return

    const { subject, html } = buildEmail({ type, actorName, actorSlug, commentBody })

    await resend.emails.send({
      from: 'MotoDigital <noreply@motodigital.de>',
      to: recipientEmail,
      subject,
      html,
    })
  } catch (err) {
    console.error('[sendEmailNotification]', err)
  }
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildEmail(params: {
  type: NotifType
  actorName: string
  actorSlug?: string
  commentBody?: string
}): { subject: string; html: string } {
  const { type, actorName, actorSlug, commentBody } = params

  const actorProfileUrl = actorSlug
    ? `${APP_URL}/de/rider/${actorSlug}`
    : `${APP_URL}/de/explore`
  const messagesUrl = `${APP_URL}/de/dashboard/messages`
  const exploreUrl = `${APP_URL}/de/explore`
  const settingsUrl = `${APP_URL}/de/dashboard/account`

  const configs: Record<NotifType, {
    subject: string
    headline: string
    bodyHtml: string
    ctaUrl: string
    ctaLabel: string
  }> = {
    message: {
      subject: `Neue Nachricht von ${actorName}`,
      headline: 'Du hast eine neue Nachricht',
      bodyHtml: `<strong>${escHtml(actorName)}</strong> hat dir eine Nachricht auf MotoDigital geschickt.`,
      ctaUrl: messagesUrl,
      ctaLabel: 'Nachricht lesen',
    },
    like: {
      subject: `${actorName} mag deinen Beitrag`,
      headline: 'Jemand mag deinen Beitrag',
      bodyHtml: `<strong>${escHtml(actorName)}</strong> hat deinen Beitrag geliked.`,
      ctaUrl: exploreUrl,
      ctaLabel: 'Zur Community',
    },
    comment: {
      subject: `${actorName} hat deinen Beitrag kommentiert`,
      headline: 'Neuer Kommentar',
      bodyHtml: commentBody
        ? `<strong>${escHtml(actorName)}</strong> hat kommentiert:<br><span style="color:#555555;font-style:italic;">&ldquo;${escHtml(commentBody.slice(0, 160))}&rdquo;</span>`
        : `<strong>${escHtml(actorName)}</strong> hat deinen Beitrag kommentiert.`,
      ctaUrl: exploreUrl,
      ctaLabel: 'Kommentar ansehen',
    },
    follow: {
      subject: `${actorName} folgt dir jetzt`,
      headline: 'Neuer Follower',
      bodyHtml: `<strong>${escHtml(actorName)}</strong> folgt dir jetzt auf MotoDigital.`,
      ctaUrl: actorProfileUrl,
      ctaLabel: 'Profil ansehen',
    },
  }

  const c = configs[type]

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escHtml(c.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f4f0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:#111111;padding:24px 32px;">
              <a href="${APP_URL}" style="font-size:17px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                Moto<span style="color:#2AABAB;">Digital</span>
              </a>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <h1 style="margin:0 0 14px;font-size:20px;font-weight:700;color:#111111;line-height:1.3;">${escHtml(c.headline)}</h1>
              <p style="margin:0 0 28px;font-size:15px;color:#444444;line-height:1.65;">${c.bodyHtml}</p>
              <a href="${c.ctaUrl}"
                 style="display:inline-block;background:#2AABAB;color:#ffffff;font-size:14px;font-weight:600;padding:13px 26px;border-radius:999px;text-decoration:none;letter-spacing:0.01em;">
                ${escHtml(c.ctaLabel)}
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #f0f0ee;">
              <p style="margin:0;font-size:11px;color:#aaaaaa;line-height:1.6;">
                Du erhältst diese E-Mail, weil du E-Mail-Benachrichtigungen für diese Aktivität aktiviert hast.<br>
                <a href="${settingsUrl}" style="color:#2AABAB;text-decoration:none;">Benachrichtigungseinstellungen anpassen</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject: c.subject, html }
}
