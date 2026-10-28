'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link, useRouter as useLocaleRouter } from '@/i18n/navigation'
import { allAgents, getAgent } from '@/lib/agents/definitions'
import type { PlatformStats } from '@/lib/agents/tools'
import { createAgentScene, type AgentState, type SceneApi, type SceneState } from './agentScene'

export interface AblageItem { id: string; task: string; text: string; at: string }

export interface AgentControlProps {
  stats: PlatformStats
  briefing: string
  ablage: Record<string, AblageItem[]>
}

interface AgentUi {
  state: AgentState
  task: number
  det: string
  out: string
  outId: string | null
  inbox: { from: string; text: string; outputId: string } | null
}

type Selection = { kind: 'agent'; id: string; view: 'work' | 'ablage' } | { kind: 'cafe' } | null

const DEFAULT_NOTE = 'Mitarbeiter arbeiten nur auf deinen Klick und liefern Entwürfe. Nichts wird gepostet oder versendet.'
const fmt = (n: number) => n.toLocaleString('de-DE')

export default function AgentControl({ stats, briefing: initialBriefing, ablage: initialAblage }: AgentControlProps) {
  const router = useRouter()
  const localeRouter = useLocaleRouter()
  const agents = useMemo(() => allAgents(), [])
  const [ui, setUi] = useState<Record<string, AgentUi>>(() =>
    Object.fromEntries(agents.map(a => [a.id, { state: 'bereit', task: 0, det: '', out: '', outId: null, inbox: null }])))
  const [sel, setSel] = useState<Selection>(null)
  const [ablage, setAblage] = useState(initialAblage)
  const [briefing, setBriefing] = useState(initialBriefing)
  const [note, setNote] = useState(DEFAULT_NOTE)
  const [saving, setSaving] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<SceneApi | null>(null)

  const cafeHtml = useMemo(() =>
    '<h3>MotoDigital Café</h3><div class="g">' +
    `<span>Founding Members</span><strong>${fmt(stats.foundingMembers)} / ${stats.foundingLimit}</strong>` +
    `<span>Werkstätten</span><strong>${fmt(stats.workshops)}</strong>` +
    `<span>Rider registriert</span><strong>${fmt(stats.riders)}</strong>` +
    `<span>Bikes aktiv</span><strong>${fmt(stats.bikesActive)}</strong>` +
    `<span>Seitenaufrufe (30 T.)</span><strong>${fmt(stats.pageViews30d)}</strong>` +
    '</div>', [stats])

  // The scene reads React state through a ref every frame
  const sceneState = useRef<SceneState>({ states: {}, inbox: new Set(), selectedAgent: null, cafeSelected: false, cafeHtml })
  useEffect(() => {
    sceneState.current = {
      states: Object.fromEntries(Object.entries(ui).map(([id, u]) => [id, u.state])),
      inbox: new Set(Object.entries(ui).filter(([, u]) => u.inbox).map(([id]) => id)),
      selectedAgent: sel?.kind === 'agent' ? sel.id : null,
      cafeSelected: sel?.kind === 'cafe',
      cafeHtml,
    }
  }, [ui, sel, cafeHtml])

  useEffect(() => {
    const scene = createAgentScene({
      container: containerRef.current!,
      canvas: canvasRef.current!,
      overlay: overlayRef.current!,
      header: headerRef.current!,
      panel: panelRef.current!,
      getState: () => sceneState.current,
      onPickAgent: id => setSel({ kind: 'agent', id, view: 'work' }),
      onPickCafe: () => setSel({ kind: 'cafe' }),
    })
    sceneRef.current = scene
    return () => { scene.destroy(); sceneRef.current = null }
  }, [])

  // Esc closes Agent Control (unless typing in a field)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (e.key === 'Escape' && tag !== 'TEXTAREA' && tag !== 'INPUT') localeRouter.push('/dashboard')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [localeRouter])

  const patch = useCallback((id: string, p: Partial<AgentUi>) => {
    setUi(prev => ({ ...prev, [id]: { ...prev[id], ...p } }))
  }, [])

  const run = useCallback(async (id: string) => {
    const a = ui[id]
    if (a.state === 'arbeitet') return
    patch(id, { state: 'arbeitet', out: '', outId: null })
    setNote(DEFAULT_NOTE)
    let text = ''
    try {
      const res = await fetch('/api/admin/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: id, taskIndex: a.task, details: a.det, handoffFromId: a.inbox?.outputId ?? null }),
      })
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => null) as { error?: string } | null
        throw new Error(err?.error ?? 'Der Mitarbeiter konnte nicht antworten.')
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        let nl: number
        while ((nl = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1)
          if (!line) continue
          const ev = JSON.parse(line) as { type: string; delta?: string; name?: string; id?: string; output?: string; message?: string }
          if (ev.type === 'text' && ev.delta) { text += ev.delta; patch(id, { out: text }) }
          else if (ev.type === 'tool') setNote(`Liest Daten: ${ev.name}`)
          else if (ev.type === 'done') {
            const task = getAgent(id)!.tasks[a.task].t
            patch(id, { state: 'fertig', out: ev.output ?? text, outId: ev.id ?? null, inbox: null })
            setAblage(prev => ({ ...prev, [id]: [{ id: ev.id!, task, text: ev.output ?? text, at: new Date().toISOString() }, ...(prev[id] ?? [])].slice(0, 12) }))
            sceneRef.current?.packet(id)
            setNote(DEFAULT_NOTE)
          } else if (ev.type === 'error') throw new Error(ev.message ?? 'Der Mitarbeiter konnte nicht antworten.')
        }
      }
    } catch (e) {
      patch(id, { state: 'bereit', out: text || (e instanceof Error ? e.message : 'Der Mitarbeiter konnte nicht antworten.') })
    }
  }, [ui, patch])

  const handoff = (fromId: string, toId: string) => {
    const from = ui[fromId]
    if (!from.outId) return
    patch(toId, { inbox: { from: getAgent(fromId)!.n, text: from.out, outputId: from.outId } })
    sceneRef.current?.packet(fromId, toId)
    setNote(`An ${getAgent(toId)!.n} übergeben. Wähle dort eine Aufgabe und starte sie.`)
    setSel({ kind: 'agent', id: toId, view: 'work' })
  }

  const copy = async (t: string) => {
    try { await navigator.clipboard.writeText(t); setNote('Kopiert.') } catch { setNote('Kopieren nicht möglich — bitte Text markieren.') }
  }

  const saveBriefing = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/agents/briefing', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: briefing }),
    }).catch(() => null)
    setSaving(false)
    setNote(res?.ok ? 'Gespeichert. Alle Mitarbeiter arbeiten ab jetzt mit diesem Stand.' : 'Speichern nicht möglich.')
  }

  // ── Panel content ──
  let title = 'Willkommen', sub = '', status = ''
  let body: React.ReactNode
  let actions: React.ReactNode = null

  if (sel?.kind === 'agent') {
    const a = getAgent(sel.id)!, u = ui[sel.id], items = ablage[sel.id] ?? []
    title = a.n; sub = `${a.r}, ${a.areaName}`; status = u.state
    if (sel.view === 'ablage') {
      body = (
        <div className="list">
          {items.map(it => (
            <button key={it.id} onClick={() => { patch(sel.id, { out: it.text, outId: it.id, state: u.state === 'arbeitet' ? u.state : 'fertig' }); setSel({ ...sel, view: 'work' }) }}>
              {it.task}
              <small>{new Date(it.at).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}</small>
            </button>
          ))}
        </div>
      )
      actions = <button className="line" onClick={() => setSel({ ...sel, view: 'work' })}>Zurück</button>
    } else {
      body = (
        <>
          <p className="job"><b>Verantwortung:</b> {a.job} <b>Kennzahl:</b> {a.kpi}</p>
          <div className="chips">
            {a.tasks.map((t, i) => (
              <button key={t.t} className={'chip' + (u.task === i ? ' on' : '')} disabled={u.state === 'arbeitet'} onClick={() => patch(sel.id, { task: i })}>{t.t}</button>
            ))}
          </div>
          <textarea
            placeholder="Details (optional): Werkstatt, Ort, Thema, Zahlen, Notizen"
            aria-label="Details zur Aufgabe"
            value={u.det}
            onChange={e => patch(sel.id, { det: e.target.value })}
          />
          {u.inbox && (
            <div className="inbox">
              <span>Übergabe von {u.inbox.from} liegt bei.</span>
              <button className="line" onClick={() => patch(sel.id, { inbox: null })}>Entfernen</button>
            </div>
          )}
          <div className={'out' + (u.out ? '' : ' empty')}>{u.out || 'Noch kein Ergebnis. Aufgabe wählen und starten.'}</div>
        </>
      )
      actions = (
        <>
          <button disabled={u.state === 'arbeitet'} onClick={() => run(sel.id)}>{u.out ? 'Neu bearbeiten' : 'Aufgabe starten'}</button>
          {u.out && u.state !== 'arbeitet' && <button className="line" onClick={() => copy(u.out)}>Kopieren</button>}
          {u.out && u.outId && u.state !== 'arbeitet' && a.to.map(t => (
            <button key={t} className="line" onClick={() => handoff(sel.id, t)}>An {getAgent(t)!.n} übergeben</button>
          ))}
          <button className="line" disabled={!items.length} onClick={() => setSel({ ...sel, view: 'ablage' })}>Ablage ({items.length})</button>
        </>
      )
    }
  } else if (sel?.kind === 'cafe') {
    title = 'MotoDigital Café'; sub = 'Zentrale'
    body = (
      <div className="f">
        <dl className="stats w">
          <dt>Founding Members</dt><dd>{fmt(stats.foundingMembers)} / {stats.foundingLimit}</dd>
          <dt>Angemeldet, unbestätigt</dt><dd>{fmt(stats.foundingPending)}</dd>
          <dt>Werkstätten gelistet</dt><dd>{fmt(stats.workshops)}</dd>
          <dt>Rider registriert</dt><dd>{fmt(stats.riders)}</dd>
          <dt>Bikes aktiv</dt><dd>{fmt(stats.bikesActive)}</dd>
          <dt>Seitenaufrufe (30 Tage)</dt><dd>{fmt(stats.pageViews30d)}</dd>
          <dt>Neuanmeldungen (30 Tage)</dt><dd>{fmt(stats.newSignups30d)}</dd>
          <dt>Kontaktanfragen (30 Tage)</dt><dd>{fmt(stats.contactRequests30d)}</dd>
        </dl>
        <label className="w">
          Briefing: Stand, Ziele, Entscheidungen
          <textarea value={briefing} onChange={e => setBriefing(e.target.value)} style={{ minHeight: 96 }} />
        </label>
      </div>
    )
    actions = (
      <>
        <button disabled={saving} onClick={saveBriefing}>{saving ? 'Speichert…' : 'Briefing speichern'}</button>
        <button className="line" onClick={() => { router.refresh(); setNote('Zahlen werden neu geladen.') }}>Zahlen aktualisieren</button>
      </>
    )
  } else {
    body = (
      <>
        <p className="job">Im Café sitzt die Zentrale mit deinem Chief of Staff, drumherum arbeiten fünf Abteilungen. Tippe einen Mitarbeiter an, wähle eine Aufgabe und starte sie. Ergebnisse landen in seiner Ablage und lassen sich an Kollegen übergeben.</p>
        <p className="job">Tippe aufs Café, um das Briefing zu pflegen. Die Zahlen kommen live aus der Datenbank.</p>
      </>
    )
  }

  return (
    <div ref={containerRef} className="ac-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <canvas ref={canvasRef} />
      <div ref={overlayRef} className="ac-overlay" />
      <header ref={headerRef}>
        <div>
          <h1>Moto<span>Digital</span> · Agent Control</h1>
          <div className="sub">Ziehen zum Drehen, Scrollen oder zwei Finger zum Zoomen. Mitarbeiter oder Café antippen.</div>
        </div>
        <div className="hd-actions">
          <button className="ghost" onClick={() => sceneRef.current?.resetView()}>Iso-Ansicht</button>
          <Link href="/dashboard" className="close" aria-label="Agent Control schließen" title="Schließen (Esc)">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9m0-9l-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </Link>
        </div>
      </header>
      <div ref={panelRef} className="panel">
        <div><h2>{title}</h2><span className="ar">{sub}</span><span className="st">{status}</span></div>
        <div className="body">{body}</div>
        <div className="acts">{actions}</div>
        <div className="note">{note}</div>
      </div>
    </div>
  )
}

// Styles from the prototype, scoped to .ac-root (positions relative to the container, not the viewport)
const CSS = `
.ac-root{--bg:#F0EDE4;--fg:#111;--teal:#2AABAB;--card:rgba(255,255,255,.92);--mut:#5d5a52;--line:rgba(17,17,17,.14);--tint:rgba(42,171,171,.1);position:fixed;inset:0;z-index:100;overflow:hidden;background:var(--bg);color:var(--fg);font-family:var(--font-sans),'Plus Jakarta Sans',system-ui,sans-serif}
.ac-root .hd-actions{display:flex;gap:8px;align-items:center;pointer-events:auto}
.ac-root .close{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:var(--card);color:var(--fg);border:1px solid var(--line);backdrop-filter:blur(6px);text-decoration:none}
.ac-root .close:hover{border-color:var(--fg)}
.ac-root .close:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .ac-root{--bg:#111;--fg:#F0EDE4;--card:rgba(30,30,30,.93);--mut:#a8a59c;--line:rgba(240,237,228,.16);--tint:rgba(42,171,171,.16);color-scheme:dark}}
:root[data-theme="dark"] .ac-root{--bg:#111;--fg:#F0EDE4;--card:rgba(30,30,30,.93);--mut:#a8a59c;--line:rgba(240,237,228,.16);--tint:rgba(42,171,171,.16);color-scheme:dark}
.ac-root canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:grab}
.ac-root .ac-overlay{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.ac-root .ac-overlay>*{pointer-events:auto}
.ac-root header{position:absolute;top:calc(env(safe-area-inset-top,0px) + 16px);left:16px;right:16px;display:flex;justify-content:space-between;align-items:flex-start;pointer-events:none;gap:12px;z-index:5}
.ac-root h1{font-size:15px;font-weight:800;margin:0;letter-spacing:.02em}
.ac-root h1 span{color:var(--teal)}
.ac-root .sub{font-size:12px;color:var(--mut);margin-top:2px;max-width:46ch}
.ac-root button{font:inherit;font-weight:600;font-size:13px;border:1px solid var(--fg);background:var(--fg);color:var(--bg);border-radius:999px;padding:9px 16px;cursor:pointer;pointer-events:auto}
.ac-root button.ghost{background:var(--card);color:var(--fg);border-color:var(--line);backdrop-filter:blur(6px)}
.ac-root button.line{background:transparent;color:var(--fg);border-color:var(--line)}
.ac-root button:disabled{opacity:.4;cursor:default}
.ac-root button:focus-visible,.ac-root textarea:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.ac-root .node{position:absolute;left:0;top:0;transform:translate(-50%,-100%);display:flex;align-items:center;gap:5px;background:var(--card);border:1px solid var(--line);border-radius:8px;padding:3px 8px;white-space:nowrap;backdrop-filter:blur(6px);color:var(--fg);z-index:2;font-size:11px;font-weight:700}
.ac-root .node i{width:7px;height:7px;border-radius:50%;background:var(--mut);flex:none}
.ac-root .node.work i{background:var(--teal);animation:ac-p 1s infinite}
.ac-root .node.done i{background:var(--teal)}
.ac-root .node.inbox i{background:transparent;border:2px solid var(--teal);width:5px;height:5px}
.ac-root .node.sel{border-color:var(--teal);box-shadow:0 0 0 1px var(--teal);z-index:3}
.ac-root .node.mini{padding:4px;border-radius:50%}
.ac-root .node.mini span{display:none}
.ac-root .area{position:absolute;left:0;top:0;transform:translate(-50%,0);pointer-events:none;text-align:center;z-index:1;white-space:nowrap}
.ac-root .area b{display:block;font-size:13px;font-weight:800;letter-spacing:.01em}
.ac-root .area small{font-size:10.5px;color:var(--mut);font-weight:600}
.ac-root .area.mini small{display:none}
.ac-root .cafe{position:absolute;left:0;top:0;transform:translate(-50%,-100%);z-index:3;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:8px 11px;backdrop-filter:blur(8px);color:var(--fg);text-align:left}
.ac-root .cafe.sel{border-color:var(--teal);box-shadow:0 0 0 1px var(--teal)}
.ac-root .cafe h3{margin:0 0 5px;font-size:12.5px;font-weight:800;color:var(--teal)}
.ac-root .cafe .g{display:grid;grid-template-columns:auto auto;gap:2px 14px;font-size:11px}
.ac-root .cafe .g span{color:var(--mut);font-weight:600}
.ac-root .cafe .g strong{font-weight:800;text-align:right;font-variant-numeric:tabular-nums}
.ac-root .cafe.mini .g{display:none}.ac-root .cafe.mini h3{margin:0}
@keyframes ac-p{50%{opacity:.25}}
@media (prefers-reduced-motion:reduce){.ac-root .node.work i{animation:none}}
.ac-root .panel{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 14px);width:min(600px,calc(100% - 24px));background:var(--card);border:1px solid var(--line);border-radius:18px;padding:14px 16px;backdrop-filter:blur(10px);box-sizing:border-box;z-index:5}
.ac-root .panel h2{font-size:14px;margin:0;font-weight:800;display:inline}
.ac-root .ar{font-size:11px;color:var(--mut);font-weight:600;margin-left:8px}
.ac-root .st{font-size:11px;color:var(--teal);font-weight:600;margin-left:8px}
.ac-root .body{font-size:13px;line-height:1.5;margin:8px 0 10px;max-height:38vh;overflow-y:auto}
.ac-root .acts{display:flex;gap:8px;flex-wrap:wrap}
.ac-root .note{font-size:11px;color:var(--mut);margin-top:8px}
.ac-root .job{font-size:12px;color:var(--mut);margin:0 0 4px}
.ac-root .job b{color:var(--fg);font-weight:700}
.ac-root .chips{display:flex;flex-wrap:wrap;gap:6px;margin:9px 0}
.ac-root .chip{font-size:12px;padding:6px 11px;background:transparent;color:var(--fg);border-color:var(--line)}
.ac-root .chip.on{border-color:var(--teal);color:var(--teal);background:var(--tint)}
.ac-root textarea{font:inherit;font-size:13px;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:transparent;color:var(--fg);width:100%;box-sizing:border-box;min-height:52px;resize:vertical}
.ac-root .inbox{font-size:12px;background:var(--tint);border-radius:8px;padding:6px 9px;margin-top:8px;display:flex;gap:8px;align-items:flex-start;justify-content:space-between}
.ac-root .inbox button{padding:2px 8px;font-size:11px}
.ac-root .out{white-space:pre-wrap;margin-top:10px;padding-top:10px;border-top:1px solid var(--line)}
.ac-root .out.empty{color:var(--mut)}
.ac-root .f{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.ac-root .f label{display:flex;flex-direction:column;gap:3px;font-size:11px;font-weight:600;color:var(--mut)}
.ac-root .f .w{grid-column:1/-1}
.ac-root .stats{display:grid;grid-template-columns:auto auto;gap:3px 16px;margin:0;font-size:12px}
.ac-root .stats dt{color:var(--mut);font-weight:600}
.ac-root .stats dd{margin:0;font-weight:800;text-align:right;font-variant-numeric:tabular-nums}
.ac-root .list{display:flex;flex-direction:column;gap:6px}
.ac-root .list button{text-align:left;border-radius:10px;background:transparent;color:var(--fg);border-color:var(--line);font-weight:600}
.ac-root .list small{display:block;color:var(--mut);font-weight:600;font-size:11px}
`
