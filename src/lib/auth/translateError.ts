const ERROR_MAP: Record<string, string> = {
  'Email not confirmed': 'E-Mail-Adresse wurde noch nicht bestätigt.',
  'Invalid login credentials': 'E-Mail oder Passwort ist falsch.',
  'User already registered': 'Diese E-Mail ist bereits registriert.',
  'Signup requires a valid password': 'Bitte gib ein gültiges Passwort ein.',
  'Password should be at least 6 characters': 'Passwort muss mindestens 6 Zeichen haben.',
  'Email rate limit exceeded': 'Zu viele Anfragen — bitte versuche es später erneut.',
  'For security purposes, you can only request this once every 60 seconds': 'Aus Sicherheitsgründen kannst du dies nur alle 60 Sekunden anfordern.',
  'Unable to validate email address: invalid format': 'Ungültiges E-Mail-Format.',
  'New password should be different from the old password.': 'Das neue Passwort muss sich vom alten unterscheiden.',
  'Auth session missing!': 'Sitzung abgelaufen — bitte erneut anmelden.',
  'User not found': 'Kein Konto mit dieser E-Mail gefunden.',
}

/** Translate common Supabase auth error messages to German. */
export function translateAuthError(message: string): string {
  // Exact match
  if (ERROR_MAP[message]) return ERROR_MAP[message]

  // Partial match for rate-limit variants ("...after X seconds")
  if (message.includes('you can only request this')) {
    return 'Zu viele Anfragen — bitte warte einen Moment.'
  }
  if (message.includes('rate limit') || message.includes('Rate limit')) {
    return 'Zu viele Anfragen — bitte versuche es später erneut.'
  }

  return message
}
