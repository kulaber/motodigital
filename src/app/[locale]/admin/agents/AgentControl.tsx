'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link, useRouter as useLocaleRouter } from '@/i18n/navigation'
import { allAgents, getAgent } from '@/lib/agents/definitions'
import type { PlatformStats } from '@/lib/agents/tools'
import { createAgentScene, type AgentState, type SceneApi, type SceneState } from './agentScene'

export interface AblageItem { id: string; task: string; text: string; at: string }

export interface ArticleDraft {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  meta_title: string
  meta_description: string
  cover_image: string | null
  read_time: string | null
  created_by_agent: string | null
  created_at: string
  content: { type: string; text?: string; items?: string[]; href?: string; label?: string }[]
  faq: { q: string; a: string }[]
}

export interface TeamOrder {
  id: string
  instruction: string
  summary: string | null
  plan: { agent_id: string; instruction: string }[]
  recurrence: 'none' | 'weekly'
  status: 'planned' | 'approved' | 'running' | 'done' | 'error' | 'rejected'
  active: boolean
  next_run_at: string | null
  last_run_at?: string | null
  created_at: string
}

export interface AgentControlProps {
  stats: PlatformStats
  briefing: string
  ablage: Record<string, AblageItem[]>
  drafts: ArticleDraft[]
  orders: TeamOrder[]
}

type StreamResult = { ok: boolean; id: string | null; output: string; error?: string }

interface AgentUi {
  state: AgentState
  task: number
  det: string
  out: string
  outId: string | null
  inbox: { from: string; text: string; outputId: string } | null
}

type AgentView = 'work' | 'ablage' | 'order' | 'recurring'
type Selection = { kind: 'agent'; id: string; view: AgentView } | { kind: 'cafe' } | { kind: 'draft'; id: string } | null

const DEFAULT_NOTE = 'Mitarbeiter arbeiten nur auf deinen Klick und liefern Entwürfe. Nichts wird gepostet oder versendet.'
const fmt = (n: number) => n.toLocaleString('de-DE')
const dateTime = (iso: string) => new Date(iso).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })

export default function AgentControl({ stats, briefing: initialBriefing, ablage: initialAblage, drafts: initialDrafts, orders: initialOrders }: AgentControlProps) {
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
  const [drafts, setDrafts] = useState(initialDrafts)
  const [orders, setOrders] = useState(initialOrders)
  const [orderText, setOrderText] = useState('')
  const [orderWeekly, setOrderWeekly] = useState(false)
  const [planning, setPlanning] = useState(false)
  const [activeOrderId, setActiveOrderId] = useState<string | null>(
    () => initialOrders.find(o => o.status === 'planned')?.id ?? null)
  const [progress, setProgress] = useState<{ step: number; total: number; label: string } | null>(null)
  const [busy, setBusy] = useState(false)

  // Fresh server data after router.refresh() (e.g. new drafts from a team order)
  useEffect(() => {
    setDrafts(initialDrafts)
  }, [initialDrafts])
  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('ac-panel-collapsed') === '1' } catch { return false }
  })
  const toggleCollapsed = () => setCollapsed(c => {
    try { localStorage.setItem('ac-panel-collapsed', c ? '0' : '1') } catch { /* storage unavailable */ }
    return !c
  })

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
    (drafts.length ? `<span class="alert">Freigaben offen</span><strong class="alert">${drafts.length}</strong>` : '') +
    '</div>', [stats, drafts.length])

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
      // Picking something in the scene always opens the panel again
      onPickAgent: id => { setSel({ kind: 'agent', id, view: 'work' }); setCollapsed(false) },
      onPickCafe: () => { setSel({ kind: 'cafe' }); setCollapsed(false) },
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

  /** POST /run and stream the result into the agent's panel; files it into the Ablage when done */
  const streamRun = useCallback(async (id: string, body: Record<string, unknown>, taskLabel: string): Promise<StreamResult> => {
    patch(id, { state: 'arbeitet', out: '', outId: null })
    let text = ''
    try {
      const res = await fetch('/api/admin/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: id, ...body }),
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
          else if (ev.type === 'tool') setNote(ev.name === 'save_article_draft' ? 'Speichert Artikel-Entwurf …' : `Liest Daten: ${ev.name}`)
          else if (ev.type === 'done') {
            const output = ev.output ?? text
            patch(id, { state: 'fertig', out: output, outId: ev.id ?? null, inbox: null })
            setAblage(prev => ({ ...prev, [id]: [{ id: ev.id!, task: taskLabel, text: output, at: new Date().toISOString() }, ...(prev[id] ?? [])].slice(0, 12) }))
            sceneRef.current?.packet(id)
            setNote(DEFAULT_NOTE)
            return { ok: true, id: ev.id ?? null, output }
          } else if (ev.type === 'error') throw new Error(ev.message ?? 'Der Mitarbeiter konnte nicht antworten.')
        }
      }
      throw new Error('Verbindung abgebrochen.')
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Der Mitarbeiter konnte nicht antworten.'
      patch(id, { state: 'bereit', out: text || error })
      return { ok: false, id: null, output: text, error }
    }
  }, [patch])

  const run = useCallback(async (id: string) => {
    const a = ui[id]
    if (a.state === 'arbeitet') return
    setNote(DEFAULT_NOTE)
    const res = await streamRun(id, { taskIndex: a.task, details: a.det, handoffFromId: a.inbox?.outputId ?? null }, getAgent(id)!.tasks[a.task].t)
    if (res.ok && getAgent(id)!.tools?.includes('save_article_draft')) router.refresh()
  }, [ui, streamRun, router])

  // ── Team orders (Chief of Staff plans, founder approves, staff executes) ──
  const activeOrder = orders.find(o => o.id === activeOrderId) ?? null
  const upsertOrder = (o: TeamOrder) => setOrders(prev => [o, ...prev.filter(x => x.id !== o.id)])

  const createOrder = async () => {
    setPlanning(true); setNote('Der Chief of Staff plant den Auftrag …')
    const res = await fetch('/api/admin/agents/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instruction: orderText, recurrence: orderWeekly ? 'weekly' : 'none' }),
    }).catch(() => null)
    const data = await res?.json().catch(() => null) as { order?: TeamOrder; error?: string } | null
    setPlanning(false)
    if (!res?.ok || !data?.order) { setNote(data?.error ?? 'Plan konnte nicht erstellt werden.'); return }
    upsertOrder(data.order); setActiveOrderId(data.order.id); setOrderText('')
    setNote('Plan steht. Prüfe ihn und gib ihn frei — vorher passiert nichts.')
  }

  const orderAction = async (id: string, action: 'approve' | 'reject' | 'finish' | 'fail' | 'pause' | 'resume') => {
    const res = await fetch(`/api/admin/agents/orders/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }),
    }).catch(() => null)
    const data = await res?.json().catch(() => null) as { order?: TeamOrder; error?: string } | null
    if (res?.ok && data?.order) upsertOrder(data.order)
    else setNote(data?.error ?? 'Aktion fehlgeschlagen.')
    return res?.ok ? data?.order ?? null : null
  }

  const approveAndRun = async (order: TeamOrder) => {
    if (busy) return
    setBusy(true)
    const approved = await orderAction(order.id, 'approve')
    if (!approved) { setBusy(false); return }
    let previous: { agentId: string; outputId: string } | null = null
    let ok = true
    for (let i = 0; i < order.plan.length; i++) {
      const step = order.plan[i]
      const agent = getAgent(step.agent_id)
      if (!agent) continue
      setProgress({ step: i + 1, total: order.plan.length + 1, label: agent.n })
      if (previous) sceneRef.current?.packet(previous.agentId, step.agent_id)
      const r = await streamRun(step.agent_id, { orderId: order.id, orderStep: i, handoffFromId: previous?.outputId ?? null }, 'Team-Auftrag')
      if (!r.ok || !r.id) { ok = false; setNote(`${agent.n}: ${r.error ?? 'fehlgeschlagen'}`); break }
      previous = { agentId: step.agent_id, outputId: r.id }
    }
    if (ok) {
      setProgress({ step: order.plan.length + 1, total: order.plan.length + 1, label: 'Chief of Staff fasst zusammen' })
      if (previous) sceneRef.current?.packet(previous.agentId, 'cos')
      await streamRun('cos', { orderId: order.id, orderSummary: true }, 'Zusammenfassung Team-Auftrag')
    }
    await orderAction(order.id, ok ? 'finish' : 'fail')
    setProgress(null); setBusy(false)
    setNote(ok
      ? order.recurrence === 'weekly' ? 'Erledigt. Wiederholt sich wöchentlich als Entwurf — Freigaben findest du im Café.' : 'Erledigt. Freigaben findest du im Café.'
      : 'Auftrag abgebrochen. Details in der Ablage der Mitarbeiter.')
    router.refresh()
  }

  // ── Article approvals (founder publishes) ──
  const decideDraft = async (draft: ArticleDraft, action: 'publish' | 'reject') => {
    setBusy(true)
    const res = await fetch(`/api/admin/agents/articles/${draft.id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }),
    }).catch(() => null)
    const data = await res?.json().catch(() => null) as { url?: string | null; error?: string } | null
    setBusy(false)
    if (!res?.ok) { setNote(data?.error ?? 'Aktion fehlgeschlagen.'); return }
    setDrafts(prev => prev.filter(d => d.id !== draft.id))
    setSel({ kind: 'cafe' })
    setNote(action === 'publish' ? `Veröffentlicht: motodigital.io${data?.url ?? ''}` : 'Entwurf abgelehnt.')
  }

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
    const isCos = a.id === 'cos'
    const recurring = orders.filter(o => o.recurrence === 'weekly' && ['approved', 'running', 'done', 'error'].includes(o.status))
    title = a.n; sub = `${a.r}, ${a.areaName}`; status = progress && isCos ? `Team-Auftrag ${progress.step}/${progress.total}` : u.state
    const tabs = isCos && sel.view !== 'ablage' && (
      <div className="tabs" role="tablist">
        {([['work', 'Aufgaben'], ['order', 'Team-Auftrag'], ['recurring', `Daueraufträge (${recurring.length})`]] as const).map(([v, label]) => (
          <button key={v} role="tab" aria-selected={sel.view === v} className={'chip' + (sel.view === v ? ' on' : '')} onClick={() => setSel({ ...sel, view: v })}>{label}</button>
        ))}
      </div>
    )
    if (isCos && sel.view === 'order') {
      if (activeOrder && ['planned', 'approved', 'running'].includes(activeOrder.status)) {
        const running = activeOrder.status !== 'planned' || busy
        body = (
          <>
            {tabs}
            <p className="job"><b>Auftrag:</b> {activeOrder.instruction}</p>
            {activeOrder.summary && <p className="job"><b>Ziel:</b> {activeOrder.summary}</p>}
            <ol className="steps">
              {activeOrder.plan.map((s, i) => {
                const state = progress ? (i + 1 < progress.step ? 'done' : i + 1 === progress.step ? 'now' : '') : ''
                return <li key={i} className={state}><b>{getAgent(s.agent_id)?.n ?? s.agent_id}:</b> {s.instruction}</li>
              })}
              <li className={progress && progress.step === progress.total ? 'now' : ''}><b>Chief of Staff:</b> fasst die Ergebnisse für dich zusammen.</li>
            </ol>
            {activeOrder.recurrence === 'weekly' && <p className="job">Wiederholt sich danach jede Woche automatisch — nur als Entwürfe, nichts geht ohne deine Freigabe raus.</p>}
            {progress && <p className="job"><b>Läuft:</b> Schritt {progress.step} von {progress.total} — {progress.label}</p>}
          </>
        )
        actions = running ? null : (
          <>
            <button onClick={() => approveAndRun(activeOrder)}>Freigeben &amp; starten</button>
            <button className="line" onClick={async () => { await orderAction(activeOrder.id, 'reject'); setActiveOrderId(null) }}>Verwerfen</button>
          </>
        )
      } else {
        body = (
          <>
            {tabs}
            <p className="job">Gib dem Team einen Auftrag. Der Chief of Staff plant, wer was macht — du gibst den Plan frei, dann arbeiten die Mitarbeiter nacheinander und übergeben sich die Ergebnisse.</p>
            <textarea
              placeholder="z. B. Erstellt diese Woche einen Magazin-Beitrag über BMW-Scrambler mit Links zu passenden Werkstätten und einen Instagram-Post dazu."
              aria-label="Auftrag an das Team"
              value={orderText}
              onChange={e => setOrderText(e.target.value)}
              style={{ minHeight: 80 }}
            />
            <label className="check">
              <input type="checkbox" checked={orderWeekly} onChange={e => setOrderWeekly(e.target.checked)} />
              Jede Woche wiederholen (nur Entwürfe)
            </label>
            {activeOrder?.status === 'done' && ui.cos.out && <div className="out">{ui.cos.out}</div>}
          </>
        )
        actions = <button disabled={planning || orderText.trim().length < 5} onClick={createOrder}>{planning ? 'Plant …' : 'Plan erstellen'}</button>
      }
    } else if (isCos && sel.view === 'recurring') {
      body = (
        <>
          {tabs}
          {recurring.length === 0 && <p className="job">Noch keine Daueraufträge. Setze beim Team-Auftrag den Haken „Jede Woche wiederholen“.</p>}
          <div className="list">
            {recurring.map(o => (
              <div key={o.id} className="row">
                <div>
                  {o.instruction.length > 110 ? o.instruction.slice(0, 110) + '…' : o.instruction}
                  <small>
                    {o.active ? `Nächster Lauf: ${o.next_run_at ? dateTime(o.next_run_at) : '–'}` : 'Pausiert'}
                    {o.last_run_at ? ` · zuletzt ${dateTime(o.last_run_at)}${o.status === 'error' ? ' (Fehler)' : ''}` : ''}
                  </small>
                </div>
                <button className="line" onClick={() => orderAction(o.id, o.active ? 'pause' : 'resume')}>{o.active ? 'Pausieren' : 'Fortsetzen'}</button>
              </div>
            ))}
          </div>
        </>
      )
    } else if (sel.view === 'ablage') {
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
          {tabs}
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
        <div className="w">
          <h3 className="sec">Freigaben ({drafts.length})</h3>
          {drafts.length === 0
            ? <p className="job">Keine Entwürfe offen.</p>
            : (
              <div className="list">
                {drafts.map(d => (
                  <button key={d.id} onClick={() => setSel({ kind: 'draft', id: d.id })}>
                    {d.title}
                    <small>Magazin-Entwurf · {getAgent(d.created_by_agent ?? '')?.n ?? 'Redaktion'} · {dateTime(d.created_at)}</small>
                  </button>
                ))}
              </div>
            )}
        </div>
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
  } else if (sel?.kind === 'draft') {
    const d = drafts.find(x => x.id === sel.id)
    title = 'Freigabe'; sub = 'Magazin-Entwurf'
    if (!d) {
      body = <p className="job">Dieser Entwurf ist nicht mehr offen.</p>
      actions = <button className="line" onClick={() => setSel({ kind: 'cafe' })}>Zurück</button>
    } else {
      body = (
        <article className="draft">
          <p className="job"><b>/magazine/{d.slug}</b> · {d.category} · {d.read_time ?? ''} · von {getAgent(d.created_by_agent ?? '')?.n ?? 'Redaktion'}</p>
          <p className="job"><b>Google-Titel:</b> {d.meta_title}<br /><b>Beschreibung:</b> {d.meta_description}</p>
          {d.cover_image
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={d.cover_image} alt="" className="cover" />
            : <p className="job">Kein Titelbild — es wird das Standardbild verwendet.</p>}
          <h3>{d.title}</h3>
          <p className="lead">{d.excerpt}</p>
          {d.content.map((s, i) => {
            switch (s.type) {
              case 'h2': return <h4 key={i}>{s.text}</h4>
              case 'list': return <ul key={i}>{(s.items ?? []).map((it, j) => <li key={j}>{it}</li>)}</ul>
              case 'quote': return <blockquote key={i}>{s.text}</blockquote>
              case 'cta': return <p key={i} className="cta">{s.text} <span>[{s.label} → {s.href}]</span></p>
              case 'intro': return <p key={i} className="lead">{s.text}</p>
              default: return <p key={i}>{s.text}</p>
            }
          })}
          {d.faq.length > 0 && (
            <>
              <h4>FAQ</h4>
              {d.faq.map((f, i) => <p key={i}><b>{f.q}</b><br />{f.a}</p>)}
            </>
          )}
        </article>
      )
      actions = (
        <>
          <button disabled={busy} onClick={() => decideDraft(d, 'publish')}>Freigeben &amp; veröffentlichen</button>
          <button className="line" disabled={busy} onClick={() => decideDraft(d, 'reject')}>Ablehnen</button>
          <button className="line" onClick={() => setSel({ kind: 'cafe' })}>Zurück</button>
        </>
      )
    }
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
      <div ref={panelRef} className={'panel' + (collapsed ? ' collapsed' : '')}>
        <div className="ph">
          <div><h2>{title}</h2><span className="ar">{sub}</span><span className="st">{status}</span></div>
          <button
            className="toggle"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-controls="ac-panel-content"
            aria-label={collapsed ? 'Panel aufklappen' : 'Panel zuklappen'}
            title={collapsed ? 'Aufklappen' : 'Zuklappen'}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 5.5l4 4 4-4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
        <div id="ac-panel-content" hidden={collapsed}>
          <div className="body">{body}</div>
          <div className="acts">{actions}</div>
          <div className="note">{note}</div>
        </div>
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
.ac-root .panel.collapsed{padding:10px 12px 10px 16px}
.ac-root .ph{display:flex;align-items:center;justify-content:space-between;gap:8px}
.ac-root .toggle{flex:none;display:flex;align-items:center;justify-content:center;width:30px;height:30px;padding:0;background:transparent;color:var(--fg);border-color:var(--line)}
.ac-root .toggle svg{transition:transform .2s}
.ac-root .panel.collapsed .toggle svg{transform:rotate(180deg)}
@media (prefers-reduced-motion:reduce){.ac-root .toggle svg{transition:none}}
.ac-root [hidden]{display:none!important}
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
.ac-root .tabs{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}
.ac-root .steps{margin:8px 0;padding-left:20px;font-size:12.5px;display:flex;flex-direction:column;gap:4px}
.ac-root .steps li.done{color:var(--mut)}
.ac-root .steps li.now{color:var(--teal);font-weight:600}
.ac-root .check{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;margin-top:8px;cursor:pointer}
.ac-root .check input{width:auto;accent-color:var(--teal)}
.ac-root .row{display:flex;justify-content:space-between;align-items:center;gap:10px;border:1px solid var(--line);border-radius:10px;padding:8px 10px;font-size:12.5px;font-weight:600}
.ac-root .row small{display:block;color:var(--mut);font-weight:600;font-size:11px;margin-top:2px}
.ac-root .row button{padding:5px 10px;font-size:12px;flex:none}
.ac-root .sec{font-size:12px;font-weight:800;margin:6px 0 6px}
.ac-root .cafe .g .alert{color:var(--teal)}
.ac-root .draft h3{font-size:16px;font-weight:800;margin:10px 0 4px}
.ac-root .draft h4{font-size:13.5px;font-weight:800;margin:12px 0 2px}
.ac-root .draft p{margin:6px 0}
.ac-root .draft .lead{font-weight:600}
.ac-root .draft ul{margin:6px 0;padding-left:18px}
.ac-root .draft blockquote{margin:8px 0;padding-left:10px;border-left:3px solid var(--teal);font-style:italic}
.ac-root .draft .cta span{color:var(--teal);font-weight:600}
.ac-root .draft .cover{width:100%;max-height:180px;object-fit:cover;border-radius:10px;margin:6px 0}
`
