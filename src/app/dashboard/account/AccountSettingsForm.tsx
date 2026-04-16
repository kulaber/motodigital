'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/utils/compressImage'
import { CheckCircle, Eye, EyeOff, Camera, User, Trash2, ChevronDown } from 'lucide-react'
import { requestAccountDeletion } from '@/lib/actions/account-deletion'

type Props = {
  userId: string
  currentEmail: string
  currentUsername: string
  currentAvatarUrl: string | null
  currentBio: string | null
  currentFullName: string | null
  role: string | null
}

const input = 'w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-2.5 text-sm text-[#222222] placeholder:text-[#222222]/20 outline-none focus:border-[#DDDDDD] transition-colors'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-[#222222]/35 uppercase tracking-widest mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-[#222222]/25 mt-1">{hint}</p>}
    </div>
  )
}

function SaveRow({ saving, saved, error, label = 'Speichern' }: { saving: boolean; saved: boolean; error: string | null; label?: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <button type="submit" disabled={saving}
        className="bg-[#06a5a5] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#058f8f] disabled:opacity-50 transition-all">
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

export default function AccountSettingsForm({ userId, currentEmail, currentUsername, currentAvatarUrl, currentBio, currentFullName, role }: Props) {
  const isWerkstatt = role === 'custom-werkstatt'
  const isRider = role === 'rider'
  const isSuperadmin = role === 'superadmin'
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Avatar ──
  const [avatarUrl,       setAvatarUrl]       = useState(currentAvatarUrl ?? '')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarDeleting,  setAvatarDeleting]  = useState(false)
  const [avatarError,     setAvatarError]     = useState<string | null>(null)
  const [avatarSaved,     setAvatarSaved]     = useState(false)

  async function handleAvatarDelete() {
    if (!avatarUrl) return
    setAvatarDeleting(true); setAvatarError(null); setAvatarSaved(false)
    // Remove all avatar files for this user in storage
    const { data: files } = await supabase.storage.from('avatars').list(userId)
    if (files?.length) {
      await supabase.storage.from('avatars').remove(files.map(f => `${userId}/${f.name}`))
    }
    await (supabase.from('profiles') as any).update({ avatar_url: null }).eq('id', userId)
    setAvatarUrl('')
    setAvatarDeleting(false)
    setAvatarSaved(true)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setAvatarError('Maximale Dateigröße: 5 MB'); return }
    setAvatarUploading(true); setAvatarError(null); setAvatarSaved(false)

    const compressed = await compressImage(file, 400, 0.82)
    const ext  = compressed.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, compressed, { upsert: true, contentType: compressed.type })

    if (upErr) {
      setAvatarError(upErr.message)
      setAvatarUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    await (supabase.from('profiles') as any).update({ avatar_url: publicUrl }).eq('id', userId)
    setAvatarUrl(`${publicUrl}?t=${Date.now()}`)
    setAvatarSaved(true)
    setAvatarUploading(false)
  }

  // ── Bio ──
  const [bio,      setBio]      = useState(currentBio ?? '')
  const [bioSaving, setBioSaving] = useState(false)
  const [bioSaved,  setBioSaved]  = useState(false)
  const [bioError,  setBioError]  = useState<string | null>(null)

  async function handleBio(e: React.FormEvent) {
    e.preventDefault()
    setBioSaving(true); setBioError(null); setBioSaved(false)
    const { error } = await (supabase.from('profiles') as any)
      .update({ bio: bio.trim() || null })
      .eq('id', userId)
    if (error) setBioError(error.message)
    else setBioSaved(true)
    setBioSaving(false)
  }

  // ── Full Name (Superadmin) ──
  const [fullName, setFullName] = useState(currentFullName ?? '')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  async function handleFullName(e: React.FormEvent) {
    e.preventDefault()
    setNameSaving(true); setNameError(null); setNameSaved(false)
    const { error } = await (supabase.from('profiles') as any)
      .update({ full_name: fullName.trim() || null })
      .eq('id', userId)
    if (error) setNameError(error.message)
    else setNameSaved(true)
    setNameSaving(false)
  }

  // ── Username ──
  const [username, setUsername] = useState(currentUsername)
  const [usernameSaving, setUsernameSaving] = useState(false)
  const [usernameSaved, setUsernameSaved] = useState(false)
  const [usernameError, setUsernameError] = useState<string | null>(null)

  async function handleUsername(e: React.FormEvent) {
    e.preventDefault()
    setUsernameSaving(true); setUsernameError(null); setUsernameSaved(false)
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

  // ── Account löschen ──
  const [deletePw, setDeletePw]       = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteSent, setDeleteSent]   = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    if (!deletePw) return
    setDeleteLoading(true); setDeleteError(null)
    const result = await requestAccountDeletion(deletePw)
    if (result.error) setDeleteError(result.error)
    else setDeleteSent(true)
    setDeleteLoading(false)
  }

  // ── Accordion ──
  const [openSection, setOpenSection] = useState<'username' | 'email' | 'password' | 'delete' | null>(null)
  function toggleSection(s: 'username' | 'email' | 'password' | 'delete') {
    setOpenSection(prev => prev === s ? null : s)
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Profilbild ── */}
      {!isWerkstatt && !isRider && <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[#222222] mb-5">Profilbild</h2>
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <div className="relative w-20 h-20 rounded-full bg-[#F7F7F7] border border-[#222222]/10 overflow-hidden flex items-center justify-center">
              {avatarUrl
                ? <Image src={avatarUrl} alt="Avatar" fill sizes="80px" className="object-cover" />
                : <User size={28} className="text-[#222222]/20" />
              }
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#222222] rounded-full flex items-center justify-center shadow-md hover:bg-[#444] transition-colors disabled:opacity-50"
            >
              <Camera size={13} className="text-white" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading || avatarDeleting}
                className="text-sm font-semibold text-[#222222] border border-[#222222]/12 px-4 py-2 rounded-full hover:border-[#222222]/30 transition-colors disabled:opacity-50"
              >
                {avatarUploading ? 'Wird hochgeladen…' : avatarUrl ? 'Foto ändern' : 'Foto hochladen'}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleAvatarDelete}
                  disabled={avatarDeleting || avatarUploading}
                  className="flex items-center gap-1.5 text-sm text-red-400 border border-red-400/20 px-3 py-2 rounded-full hover:bg-red-50 hover:border-red-400/40 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  {avatarDeleting ? 'Wird gelöscht…' : 'Entfernen'}
                </button>
              )}
            </div>
            <p className="text-[11px] text-[#222222]/30">JPG, PNG oder WebP · max. 5 MB</p>
            {avatarSaved && <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle size={12} /> Gespeichert</span>}
            {avatarError && <p className="text-[11px] text-red-400">{avatarError}</p>}
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
      </div>}

      {/* ── Bio ── */}
      {!isWerkstatt && !isRider && (
        <form onSubmit={handleBio} className="bg-white border border-[#222222]/6 rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[#222222] mb-5">Kurze Bio</h2>
          <div className="flex flex-col gap-4">
            <Field label="Bio" hint="Wird auf deinem öffentlichen Profil angezeigt">
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={160}
                rows={3}
                placeholder="Beschreibe dich in ein paar Worten…"
                className={`${input} resize-none`}
              />
              <p className="text-[10px] text-[#222222]/25 mt-1 text-right">{bio.length}/160</p>
            </Field>
            <SaveRow saving={bioSaving} saved={bioSaved} error={bioError} />
          </div>
        </form>
      )}

      {/* ── Name (Superadmin) ── */}
      {isSuperadmin && (
        <form onSubmit={handleFullName} className="bg-white border border-[#222222]/6 rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[#222222] mb-5">Name</h2>
          <div className="flex flex-col gap-4">
            <Field label="Vollständiger Name">
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Vor- und Nachname"
                className={input}
              />
            </Field>
            <SaveRow saving={nameSaving} saved={nameSaved} error={nameError} />
          </div>
        </form>
      )}

      {/* ── Konto (Accordion) ── */}
      <div className="bg-white border border-[#222222]/6 rounded-2xl overflow-hidden">

        {/* Benutzername */}
        <div>
          <button type="button" onClick={() => toggleSection('username')}
            className="w-full flex items-center justify-between p-5 sm:p-6 text-left">
            <div>
              <h2 className="text-sm font-semibold text-[#222222]">Benutzername</h2>
              <p className="text-xs text-[#222222]/40 mt-0.5">{username || '–'}</p>
            </div>
            <ChevronDown size={16} className={`text-[#222222]/30 transition-transform duration-200 ${openSection === 'username' ? 'rotate-180' : ''}`} />
          </button>
          {openSection === 'username' && (
            <form onSubmit={handleUsername} className="px-5 sm:px-6 pb-5 sm:pb-6">
              <div className="flex flex-col gap-4">
                <Field label="Benutzername" hint="Wird auf der Plattform als dein Handle angezeigt">
                  <input value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="z.B. jakobkraft" className={input} />
                </Field>
                <SaveRow saving={usernameSaving} saved={usernameSaved} error={usernameError} />
              </div>
            </form>
          )}
        </div>

        <div className="border-t border-[#222222]/6" />

        {/* E-Mail */}
        <div>
          <button type="button" onClick={() => toggleSection('email')}
            className="w-full flex items-center justify-between p-5 sm:p-6 text-left">
            <div>
              <h2 className="text-sm font-semibold text-[#222222]">E-Mail-Adresse</h2>
              <p className="text-xs text-[#222222]/40 mt-0.5">{email}</p>
            </div>
            <ChevronDown size={16} className={`text-[#222222]/30 transition-transform duration-200 ${openSection === 'email' ? 'rotate-180' : ''}`} />
          </button>
          {openSection === 'email' && (
            <form onSubmit={handleEmail} className="px-5 sm:px-6 pb-5 sm:pb-6">
              <div className="flex flex-col gap-4">
                <Field label="E-Mail" hint="Nach der Änderung erhältst du eine Bestätigungs-E-Mail">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="deine@email.de" className={input} />
                </Field>
                <SaveRow saving={emailSaving} saved={emailSaved} error={emailError} label="E-Mail ändern" />
              </div>
            </form>
          )}
        </div>

        <div className="border-t border-[#222222]/6" />

        {/* Passwort */}
        <div>
          <button type="button" onClick={() => toggleSection('password')}
            className="w-full flex items-center justify-between p-5 sm:p-6 text-left">
            <div>
              <h2 className="text-sm font-semibold text-[#222222]">Passwort ändern</h2>
              <p className="text-xs text-[#222222]/40 mt-0.5">••••••••</p>
            </div>
            <ChevronDown size={16} className={`text-[#222222]/30 transition-transform duration-200 ${openSection === 'password' ? 'rotate-180' : ''}`} />
          </button>
          {openSection === 'password' && (
            <form onSubmit={handlePassword} className="px-5 sm:px-6 pb-5 sm:pb-6">
              <div className="flex items-center justify-end mb-3">
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="text-xs text-[#222222]/30 hover:text-[#222222] transition-colors flex items-center gap-1">
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
          )}
        </div>

        {role !== 'superadmin' && <>
        <div className="border-t border-[#222222]/6" />

        {/* Account löschen */}
        <div>
          <button type="button" onClick={() => toggleSection('delete')}
            className="w-full flex items-center justify-between p-5 sm:p-6 text-left">
            <div>
              <h2 className="text-sm font-semibold text-[#222222]">Account löschen</h2>
              <p className="text-xs text-[#222222]/40 mt-0.5">Alle Daten endgültig entfernen</p>
            </div>
            <ChevronDown size={16} className={`text-[#222222]/30 transition-transform duration-200 ${openSection === 'delete' ? 'rotate-180' : ''}`} />
          </button>
          {openSection === 'delete' && (
            <div className="px-5 sm:px-6 pb-5 sm:pb-6">
              {deleteSent ? (
                <div className="bg-[#F7F7F7] rounded-xl p-4">
                  <p className="text-sm text-[#222222] font-medium">
                    Bestätigungs-E-Mail wurde gesendet.
                  </p>
                  <p className="text-xs text-[#222222]/40 mt-1">
                    Klicke auf den Link in der E-Mail, um die Löschung zu bestätigen. Der Link ist 24 Stunden gültig.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-[#222222]/40 mb-4">
                    Dein Account, Bikes, Nachrichten, Medien und alle anderen Inhalte werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
                  </p>
                  <form onSubmit={handleDelete} className="flex flex-col gap-4">
                    <Field label="Passwort bestätigen">
                      <input
                        type="password"
                        value={deletePw}
                        onChange={e => setDeletePw(e.target.value)}
                        placeholder="Dein aktuelles Passwort"
                        className={input}
                        required
                      />
                    </Field>
                    {deleteError && <p className="text-xs text-red-500">{deleteError}</p>}
                    <button
                      type="submit"
                      disabled={deleteLoading || !deletePw}
                      className="bg-[#222222] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#333] disabled:opacity-50 transition-all self-start"
                    >
                      {deleteLoading ? 'Wird verarbeitet…' : 'Account endgültig löschen'}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
        </>}

      </div>

    </div>
  )
}
