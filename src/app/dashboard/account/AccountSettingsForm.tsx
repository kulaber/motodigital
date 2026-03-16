'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Eye, EyeOff } from 'lucide-react'

type Props = {
  userId: string
  currentEmail: string
  currentUsername: string
}

const input = 'w-full bg-[#141414] border border-[#F0EDE4]/10 rounded-xl px-4 py-2.5 text-sm text-[#F0EDE4] placeholder:text-[#F0EDE4]/20 outline-none focus:border-[#2AABAB] transition-colors'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-[#F0EDE4]/35 uppercase tracking-widest mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-[#F0EDE4]/25 mt-1">{hint}</p>}
    </div>
  )
}

function SaveRow({ saving, saved, error, label = 'Speichern' }: { saving: boolean; saved: boolean; error: string | null; label?: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <button type="submit" disabled={saving}
        className="bg-[#2AABAB] text-[#141414] text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#3DBFBF] disabled:opacity-50 transition-all">
        {saving ? 'Wird gespeichert…' : label}
      </button>
      {saved && (
        <span className="flex items-center gap-1.5 text-xs text-green-400">
          <CheckCircle size={13} /> Gespeichert
        </span>
      )}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}

export default function AccountSettingsForm({ userId, currentEmail, currentUsername }: Props) {
  const supabase = createClient()

  // ── Username ──
  const [username, setUsername] = useState(currentUsername)
  const [usernameSaving, setUsernameSaving] = useState(false)
  const [usernameSaved, setUsernameSaved] = useState(false)
  const [usernameError, setUsernameError] = useState<string | null>(null)

  async function handleUsername(e: React.FormEvent) {
    e.preventDefault()
    setUsernameSaving(true); setUsernameError(null); setUsernameSaved(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('profiles') as any)
      .update({ username: username.trim() || null })
      .eq('id', userId)
    if (error) setUsernameError(error.message)
    else setUsernameSaved(true)
    setUsernameSaving(false)
  }

  // ── Email ──
  const [email, setEmail] = useState(currentEmail)
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailSaved, setEmailSaved] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setEmailSaving(true); setEmailError(null); setEmailSaved(false)
    const { error } = await supabase.auth.updateUser({ email })
    if (error) setEmailError(error.message)
    else setEmailSaved(true)
    setEmailSaving(false)
  }

  // ── Password ──
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirmPw) { setPwError('Passwörter stimmen nicht überein'); return }
    if (newPw.length < 8) { setPwError('Mindestens 8 Zeichen'); return }
    setPwSaving(true); setPwError(null); setPwSaved(false)

    // Re-authenticate first, then update
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: currentPw,
    })
    if (signInErr) { setPwError('Aktuelles Passwort falsch'); setPwSaving(false); return }

    const { error } = await supabase.auth.updateUser({ password: newPw })
    if (error) setPwError(error.message)
    else { setPwSaved(true); setCurrentPw(''); setNewPw(''); setConfirmPw('') }
    setPwSaving(false)
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Benutzername ── */}
      <form onSubmit={handleUsername} className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[#F0EDE4] mb-5">Benutzername</h2>
        <div className="flex flex-col gap-4">
          <Field label="Benutzername" hint="Wird auf der Plattform als dein Handle angezeigt">
            <input value={username} onChange={e => setUsername(e.target.value)}
              placeholder="z.B. jakobkraft" className={input} />
          </Field>
          <SaveRow saving={usernameSaving} saved={usernameSaved} error={usernameError} />
        </div>
      </form>

      {/* ── E-Mail ── */}
      <form onSubmit={handleEmail} className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[#F0EDE4] mb-5">E-Mail-Adresse</h2>
        <div className="flex flex-col gap-4">
          <Field label="E-Mail" hint="Nach der Änderung erhältst du eine Bestätigungs-E-Mail">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="deine@email.de" className={input} />
          </Field>
          <SaveRow saving={emailSaving} saved={emailSaved} error={emailError} label="E-Mail ändern" />
        </div>
      </form>

      {/* ── Passwort ── */}
      <form onSubmit={handlePassword} className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-[#F0EDE4]">Passwort ändern</h2>
          <button type="button" onClick={() => setShowPw(v => !v)}
            className="text-xs text-[#F0EDE4]/30 hover:text-[#F0EDE4] transition-colors flex items-center gap-1">
            {showPw ? <EyeOff size={12} /> : <Eye size={12} />}
            {showPw ? 'Verstecken' : 'Anzeigen'}
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <Field label="Aktuelles Passwort">
            <input type={showPw ? 'text' : 'password'} value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              placeholder="••••••••" className={input} />
          </Field>
          <Field label="Neues Passwort" hint="Mindestens 8 Zeichen">
            <input type={showPw ? 'text' : 'password'} value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder="••••••••" className={input} />
          </Field>
          <Field label="Neues Passwort bestätigen">
            <input type={showPw ? 'text' : 'password'} value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              placeholder="••••••••" className={input} />
          </Field>
          <SaveRow saving={pwSaving} saved={pwSaved} error={pwError} label="Passwort ändern" />
        </div>
      </form>

    </div>
  )
}
