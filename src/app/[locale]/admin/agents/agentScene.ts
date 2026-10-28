// Three.js scene for Agent Control — ported from docs/prototypes/agent-control.html.
// Imperative by design (one WebGL scene, DOM labels positioned per frame);
// React owns the panel and feeds state in via getState().

import * as THREE from 'three'
import { AREAS, COS, type AgentDef } from '@/lib/agents/definitions'

export type AgentState = 'bereit' | 'arbeitet' | 'fertig'

export interface SceneState {
  states: Record<string, AgentState>
  inbox: Set<string>
  selectedAgent: string | null
  cafeSelected: boolean
  cafeHtml: string
}

export interface SceneOptions {
  container: HTMLElement
  canvas: HTMLCanvasElement
  overlay: HTMLElement
  /** Elements that cover the scene (header, panel) — used to fit the view */
  header: HTMLElement
  panel: HTMLElement
  getState: () => SceneState
  onPickAgent: (id: string) => void
  onPickCafe: () => void
}

export interface SceneApi {
  packet: (fromId: string, toId?: string) => void
  resetView: () => void
  destroy: () => void
}

interface Person { g: THREE.Group; legs: { hip: THREE.Group; knee: THREE.Group }[]; arms: THREE.Group[] }
interface Station {
  def: AgentDef
  areaName: string
  g: THREE.Group
  scr: THREE.MeshBasicMaterial
  lines: THREE.Mesh[]
  p: Person
  s: number
  ph: number
  lp: number
  el: HTMLButtonElement
}

const TEAL = 0x2AABAB
const PAL = {
  light: { floor: 0xE7E3D8, plate: 0xDCD7C9, cafe: 0xF7F4ED, wall: 0xFBFAF6, desk: 0xFAF8F2 },
  dark: { floor: 0x1C1C1B, plate: 0x262624, cafe: 0x2E2D2A, wall: 0x3B3A37, desk: 0xD8D4CA },
}

export function createAgentScene(o: SceneOptions): SceneApi {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches
  const size = () => ({ w: o.container.clientWidth, h: o.container.clientHeight })

  const R = new THREE.WebGLRenderer({ canvas: o.canvas, alpha: true, antialias: true })
  R.setPixelRatio(Math.min(devicePixelRatio, 2))
  const S = new THREE.Scene()
  const C = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 300)
  // three ≥ r155 uses physical light units — ×π keeps the prototype's (r128) brightness
  S.add(new THREE.AmbientLight(0xffffff, 0.6 * Math.PI))
  const L = new THREE.DirectionalLight(0xffffff, 0.58 * Math.PI)
  L.position.set(5, 10, 2)
  S.add(L)

  const mats: Record<number, THREE.MeshLambertMaterial> = {}
  const M = (c: number) => mats[c] || (mats[c] = new THREE.MeshLambertMaterial({ color: c }))
  const TM = {
    floor: new THREE.MeshLambertMaterial(), plate: new THREE.MeshLambertMaterial(), cafe: new THREE.MeshLambertMaterial(),
    wall: new THREE.MeshLambertMaterial(), desk: new THREE.MeshLambertMaterial(),
  }
  const box = (w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0, par: THREE.Object3D = S) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); par.add(m); return m
  }
  const cyl = (r1: number, r2: number, h: number, mat: THREE.Material, x = 0, y = 0, z = 0, par: THREE.Object3D = S, seg = 18) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat); m.position.set(x, y, z); par.add(m); return m
  }
  const ball = (r: number, mat: THREE.Material, x = 0, y = 0, z = 0, par: THREE.Object3D = S) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat); m.position.set(x, y, z); par.add(m); return m
  }

  const PL = 12.2
  box(PL * 2, 0.5, PL * 2, TM.floor, 0, -0.25, 0)
  const TGT = new THREE.Vector3(0, 0.8, 0)

  // ── Café = Zentrale ──
  const cafe = new THREE.Group(); S.add(cafe)
  box(5.4, 0.12, 5.4, TM.cafe, 0, 0.06, 0, cafe)
  box(3, 0.75, 0.7, M(0x1d1d1d), 0.6, 0.5, -1.9, cafe); box(3.1, 0.05, 0.78, TM.desk, 0.6, 0.9, -1.9, cafe); box(3.02, 0.06, 0.02, M(TEAL), 0.6, 0.74, -1.54, cafe)
  box(0.55, 0.42, 0.38, M(0xC9CACC), 0.1, 1.13, -2.05, cafe); box(0.5, 0.06, 0.3, M(0x1d1d1d), 0.1, 1.37, -2.05, cafe)
  cyl(0.05, 0.05, 0.08, M(0x1d1d1d), 0.1, 0.98, -1.85, cafe)
  for (const x of [0.75, 1, 1.25]) cyl(0.05, 0.04, 0.08, M(0xFAF8F2), x, 0.97, -1.9, cafe)
  box(2.6, 0.06, 1.2, TM.desk, 0.3, 0.72, 0.9, cafe)
  for (const [dx, dz] of [[-1.15, -0.5], [1.15, -0.5], [-1.15, 0.5], [1.15, 0.5]]) box(0.06, 0.66, 0.06, M(0x111111), 0.3 + dx, 0.39, 0.9 + dz, cafe)
  for (const x of [-0.5, 0.3, 1.1]) for (const z of [0.05, 1.75]) {
    cyl(0.17, 0.17, 0.05, M(0x111111), x, 0.47, z, cafe); cyl(0.03, 0.03, 0.34, M(0x111111), x, 0.28, z, cafe); cyl(0.14, 0.14, 0.02, M(0x111111), x, 0.12, z, cafe)
  }
  for (const [x, z] of [[-0.35, 0.75], [1.0, 1.2]]) cyl(0.05, 0.04, 0.08, M(0xFAF8F2), x, 0.79, z, cafe)
  const helmet = (c: number, st: number, x: number, y: number, z: number, ry = 0) => {
    const g = new THREE.Group(); g.position.set(x, y + 0.052, z); g.rotation.y = ry; cafe.add(g)
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), M(c)))
    for (const r of [0, Math.PI]) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.143, 4, 12, -0.14, 0.28, 0, Math.PI * 0.62), M(st)); s.rotation.y = r + Math.PI / 2; g.add(s)
    }
    const pk = box(0.17, 0.012, 0.07, M(0x111111), 0, 0, 0.15, g); pk.rotation.x = -0.25
    box(0.2, 0.03, 0.02, M(0x6b4a2b), 0, -0.03, -0.13, g)
  }
  helmet(0xFAF8F2, TEAL, -0.2, 0.75, 1.15, 0.4); helmet(0x111111, 0xFAF8F2, 0.95, 0.75, 0.6, -0.8); helmet(TEAL, 0x111111, 1.75, 0.93, -1.9, 0.3)
  const plant = (x: number, z: number, par: THREE.Object3D = S) => {
    cyl(0.18, 0.14, 0.3, M(0x1d1d1d), x, 0.27, z, par); ball(0.28, M(0x6E8B5A), x, 0.6, z, par); ball(0.2, M(0x7E9C68), x + 0.1, 0.8, z - 0.05, par)
  }
  plant(-2.1, -2.1, cafe)
  cafe.traverse(obj => { obj.userData.cafe = true })

  // ── Figures ──
  const SKIN = [0xE9C9A8, 0xC99A76, 0x8D5F40, 0xF1D3B8], HAIR = [0x2a1d14, 0x111111, 0x6b4a2b, 0xb08d57], SHIRT = [0x111111, TEAL, 0x6b675e, 0xFAF8F2, 0x44505A]
  const person = (i: number, shirtC?: number, beard = false): Person => {
    const g = new THREE.Group()
    const shirt = M(shirtC ?? SHIRT[i % SHIRT.length]), skin = M(SKIN[i % 4]), pants = M(0x2b2d33), hair = M(HAIR[(i + 1) % 4]), shoe = M(0x111111)
    const legs: Person['legs'] = [], arms: THREE.Group[] = []
    for (const sx of [-0.08, 0.08]) {
      const hip = new THREE.Group(); hip.position.x = sx; g.add(hip)
      box(0.12, 0.25, 0.13, pants, 0, -0.125, 0, hip)
      const knee = new THREE.Group(); knee.position.y = -0.25; hip.add(knee)
      box(0.11, 0.23, 0.12, pants, 0, -0.115, 0, knee); box(0.12, 0.05, 0.18, shoe, 0, -0.235, -0.03, knee)
      legs.push({ hip, knee })
    }
    box(0.32, 0.38, 0.19, shirt, 0, 0.2, 0, g)
    ball(0.115, skin, 0, 0.5, 0, g); const h = ball(0.12, hair, 0, 0.54, 0.03, g); h.scale.set(1, 0.75, 1)
    if (beard) {
      // Three-day stubble: thin translucent shell over jaw and chin (face looks towards -z)
      const stubble = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 18, 12, Math.PI * 1.05, Math.PI * 0.9, Math.PI * 0.5, Math.PI * 0.42),
        new THREE.MeshLambertMaterial({ color: 0x2e231c, transparent: true, opacity: 0.72 }),
      )
      stubble.position.set(0, 0.5, 0); g.add(stubble)
    }
    for (const sx of [-0.2, 0.2]) {
      const sh = new THREE.Group(); sh.position.set(sx, 0.36, 0); g.add(sh)
      box(0.08, 0.3, 0.09, shirt, 0, -0.15, 0, sh); ball(0.045, skin, 0, -0.32, 0, sh); arms.push(sh)
    }
    return { g, legs, arms }
  }
  const pose = (p: Person, s: number, t: number, typing: boolean, ph: number) => {
    p.legs.forEach(l => { l.hip.rotation.x = s * Math.PI / 2; l.knee.rotation.x = -s * Math.PI / 2 })
    p.arms.forEach((a, i) => { a.rotation.x = s * 1.25 + (typing ? Math.sin(t / 70 + i * 2 + ph) * 0.14 : 0) })
  }
  // Portafilter + cup on the machine's working side, barista behind it
  cyl(0.05, 0.05, 0.05, M(0x1d1d1d), 0.1, 1.07, -2.27, cafe)
  box(0.03, 0.025, 0.16, M(0x111111), 0.1, 1.06, -2.38, cafe)
  cyl(0.04, 0.035, 0.07, M(0xFAF8F2), 0.1, 0.96, -2.27, cafe)
  const barista = person(1, TEAL); barista.g.position.set(0.1, 0.62, -2.55); barista.g.rotation.y = Math.PI
  pose(barista, 0, 0, false, 0); barista.arms.forEach(a => { a.rotation.x = 0.95 }); cafe.add(barista.g)
  const bike = (tank: number, hump?: number) => {
    const g = new THREE.Group(); const blk = M(0x151515), chr = M(0xC9CACC)
    for (const z of [-0.36, 0.36]) {
      const w = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.05, 8, 20), blk); w.position.set(0, 0.22, z); w.rotation.y = Math.PI / 2; g.add(w)
      cyl(0.04, 0.04, 0.1, chr, 0, 0.22, z, g, 8).rotation.z = Math.PI / 2
    }
    box(0.06, 0.06, 0.62, M(0x2a2a2a), 0, 0.33, 0, g); box(0.17, 0.17, 0.22, M(0x8a8a8a), 0, 0.27, 0.02, g)
    box(0.19, 0.13, 0.32, M(tank), 0, 0.46, -0.09, g); box(0.15, 0.04, 0.2, blk, 0, 0.44, 0.17, g); box(0.17, 0.09, 0.08, M(hump ?? tank), 0, 0.48, 0.29, g)
    box(0.36, 0.025, 0.025, blk, 0, 0.43, -0.3, g); cyl(0.07, 0.07, 0.07, M(0xFAF8F2), 0, 0.42, -0.38, g).rotation.x = Math.PI / 2
    const ex = cyl(0.025, 0.03, 0.5, chr, 0.11, 0.22, 0.18, g, 8); ex.rotation.x = Math.PI / 2 - 0.12
    return g
  }
  ;([[TEAL, 0xFAF8F2, 2.3, -0.55, -0.5], [0x111111, TEAL, 2.3, 0.8, -0.5], [0xFAF8F2, 0x111111, -1.95, 1.95, 0.6]] as const).forEach(([t, h, x, z, r]) => {
    const b = bike(t, h); b.position.set(x, 0.12, z); b.rotation.y = r; cafe.add(b)
  })

  // ── Workstations ──
  const stations: Station[] = []
  const byId = new Map<string, Station>()
  const station = (def: AgentDef, areaName: string, x: number, y: number, z: number, atCafeTable = false) => {
    const g = new THREE.Group(); g.position.set(x, y, z); S.add(g)
    if (!atCafeTable) { box(1.25, 0.05, 0.62, TM.desk, 0, 0.53, -0.25, g); box(0.04, 0.51, 0.56, M(0x111111), -0.58, 0.265, -0.25, g); box(0.04, 0.51, 0.56, M(0x111111), 0.58, 0.265, -0.25, g) }
    const al = M(0xD3D4D6); box(0.22, 0.015, 0.15, al, 0, 0.565, -0.4, g); box(0.08, 0.24, 0.04, al, 0, 0.68, -0.42, g)
    box(0.68, 0.44, 0.035, al, 0, 0.88, -0.4, g); box(0.68, 0.07, 0.036, M(0xE4E5E7), 0, 0.69, -0.4, g)
    const scr = new THREE.MeshBasicMaterial({ color: 0x1b1b1b }); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.33), scr); sc.position.set(0, 0.9, -0.381); g.add(sc)
    const lines = [0, 1, 2].map(k => { const m = box(0.36 - k * 0.08, 0.025, 0.002, new THREE.MeshBasicMaterial({ color: 0xFAF8F2 }), -0.1 + k * 0.04, 0.98 - k * 0.06, -0.378, g); m.visible = false; return m })
    box(0.42, 0.015, 0.14, M(0xF4F4F4), 0, 0.565, -0.12, g); box(0.06, 0.02, 0.1, M(0xF4F4F4), 0.32, 0.565, -0.12, g)
    if (!atCafeTable) {
      cyl(0.02, 0.02, 0.24, M(0x111111), 0, 0.12, 0.35, g, 8); box(0.36, 0.03, 0.36, M(0x111111), 0, 0.02, 0.35, g)
      box(0.44, 0.06, 0.42, M(0x111111), 0, 0.24, 0.35, g); box(0.44, 0.42, 0.05, M(0x111111), 0, 0.47, 0.57, g)
    }
    const isCos = def.id === COS.id
    const p = person(stations.length, isCos ? TEAL : undefined, isCos); g.add(p.g)
    const el = document.createElement('button')
    el.className = 'node'; el.innerHTML = '<i></i><span></span>'; el.querySelector('span')!.textContent = def.n
    el.setAttribute('aria-label', `${def.n}, ${areaName}`)
    el.onclick = () => o.onPickAgent(def.id)
    o.overlay.appendChild(el)
    // The Chief of Staff starts (and stays) seated
    const st: Station = { def, areaName, g, scr, lines, p, s: isCos ? 1 : 0, ph: Math.random() * 6, lp: 0, el }
    g.traverse(obj => { obj.userData.agentId = def.id })
    stations.push(st); byId.set(def.id, st)
  }
  station(COS, 'Zentrale', 0.3, 0.185, 1.4, true)

  const areaEls: { el: HTMLDivElement; x: number; z: number; sz: number }[] = []
  AREAS.forEach(area => {
    const t = area.ang * Math.PI / 180, r = 8.8, cx = Math.cos(t) * r, cy = Math.sin(t) * r
    const ax = +((cx + cy) * Math.SQRT1_2).toFixed(2), az = +((cy - cx) * Math.SQRT1_2).toFixed(2)
    const n = area.agents.length, sz = n > 3 ? 6.8 : 6.2
    box(sz, 0.08, sz, TM.plate, ax, 0.04, az); plant(ax - sz / 2 + 0.5, az - sz / 2 + 0.5)
    const off = n === 4 ? [-2.25, -0.75, 0.75, 2.25] : n === 3 ? [-1.7, 0, 1.7] : [-0.95, 0.95]
    area.agents.forEach((a, i) => station(a, area.n, ax + off[i], 0.08, az - off[i]))
    const el = document.createElement('div'); el.className = 'area'
    const b = document.createElement('b'); b.textContent = area.n
    const sm = document.createElement('small'); sm.textContent = `${area.s}, ${n} Mitarbeiter`
    el.append(b, sm); o.overlay.appendChild(el)
    areaEls.push({ el, x: ax, z: az, sz })
  })
  const STAND = new THREE.Vector3(0.72, 0.5, 0.45), SEAT = new THREE.Vector3(0, 0.3, 0.35)

  const cafeEl = document.createElement('button'); cafeEl.className = 'cafe'; cafeEl.onclick = () => o.onPickCafe(); o.overlay.appendChild(cafeEl)
  const CAFE_P = new THREE.Vector3(0.3, 2.2, -2.6)

  // ── Packets (handoffs / results flying around) ──
  const pk: { m: THREE.Mesh; from: THREE.Vector3; to: THREE.Vector3; t: number; d: number }[] = []
  const pg = new THREE.BoxGeometry(0.2, 0.2, 0.2)
  const pm = new THREE.MeshLambertMaterial({ color: TEAL, emissive: TEAL, emissiveIntensity: 0.35 })
  const CAFE_T = new THREE.Vector3(0.3, 1.4, 1.1)
  const packet = (fromId: string, toId?: string) => {
    const a = byId.get(fromId); if (!a) return
    const from = new THREE.Vector3(); a.g.getWorldPosition(from); from.y += 1.1
    const to = CAFE_T.clone()
    const b = toId ? byId.get(toId) : undefined
    if (b) { b.g.getWorldPosition(to); to.y += 1.1 }
    else if (fromId === COS.id) { const z = areaEls[Math.floor(Math.random() * areaEls.length)]; to.set(z.x, 1, z.z) }
    const m = new THREE.Mesh(pg, pm); S.add(m); pk.push({ m, from, to, t: 0, d: from.distanceTo(to) })
  }

  // ── Theme (follows the site's data-theme / OS preference) ──
  const isDark = () => {
    const t = document.documentElement.dataset.theme
    return t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches)
  }
  const theme = () => { const P = PAL[isDark() ? 'dark' : 'light']; for (const k in TM) TM[k as keyof typeof TM].color.setHex(P[k as keyof typeof P]) }
  const mq = matchMedia('(prefers-color-scheme: dark)'); mq.addEventListener('change', theme)
  const mo = new MutationObserver(theme); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); theme()

  // ── Camera ──
  const ISO = { yaw: Math.PI / 4, pitch: Math.atan(1 / Math.SQRT2) }
  let yaw = ISO.yaw, pitch = ISO.pitch, zoom = 1, tYaw = yaw, tPitch = pitch, tZoom = 1, sBase = 40, AX = 0, AY = 0
  const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x))
  const cam = () => {
    C.position.set(TGT.x + Math.cos(pitch) * Math.sin(yaw) * 70, TGT.y + Math.sin(pitch) * 70, TGT.z + Math.cos(pitch) * Math.cos(yaw) * 70)
    C.lookAt(TGT)
  }
  const corners: THREE.Vector3[] = []
  for (const x of [-PL, PL]) for (const z of [-PL, PL]) for (const y of [-0.5, 2]) corners.push(new THREE.Vector3(x, y, z))
  const v = new THREE.Vector3()
  const frame = () => {
    cam(); const { w, h } = size(), s = sBase * zoom
    C.left = -AX / s; C.right = (w - AX) / s; C.top = AY / s; C.bottom = -(h - AY) / s
    C.updateProjectionMatrix(); C.updateMatrixWorld()
  }
  const fit = () => {
    const { w, h } = size(); if (!w || !h) return
    R.setSize(w, h, false)
    const sy = yaw, sp = pitch; yaw = ISO.yaw; pitch = ISO.pitch; cam(); C.updateMatrixWorld()
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9
    for (const p of corners) { v.copy(p).applyMatrix4(C.matrixWorldInverse); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y) }
    yaw = sy; pitch = sp
    const top = o.header.offsetTop + o.header.offsetHeight + 40
    const bot = h - o.panel.offsetTop + 8
    const aw = w - 24, ah = Math.max(120, h - top - bot)
    sBase = Math.min(aw / (2 * Math.max(-x0, x1)), ah / (2 * Math.max(-y0, y1))); AX = w / 2; AY = top + ah / 2; frame()
  }
  // Refit only when the viewport changes — not when the panel collapses or its
  // content grows, otherwise the zoom would jump on every toggle/selection
  const ro = new ResizeObserver(fit); ro.observe(o.container); fit()

  // ── Interaction ──
  const cv = o.canvas
  const ray = new THREE.Raycaster(), mp = new THREE.Vector2(), hitList: THREE.Object3D[] = [...stations.map(s => s.g), cafe]
  const hit = (e: PointerEvent | MouseEvent) => {
    const r = cv.getBoundingClientRect()
    mp.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(mp, C)
    return ray.intersectObjects(hitList, true)[0]?.object.userData as { agentId?: string; cafe?: boolean } | undefined
  }
  const ptrs = new Map<number, { x: number; y: number }>(); let moved = 0, pd0 = 1, z0 = 1
  const onDown = (e: PointerEvent) => {
    cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = 0; cv.style.cursor = 'grabbing'
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pd0 = Math.hypot(a.x - b.x, a.y - b.y) || 1; z0 = tZoom }
  }
  const onMove = (e: PointerEvent) => {
    const p = ptrs.get(e.pointerId)
    if (!p) { if (e.pointerType === 'mouse') { const u = hit(e); cv.style.cursor = u && (u.agentId || u.cafe) ? 'pointer' : 'grab' } return }
    const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; moved += Math.abs(dx) + Math.abs(dy)
    if (ptrs.size === 1) { tYaw -= dx * 0.008; tPitch = clamp(tPitch + dy * 0.006, 0.22, 1.4) }
    else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; tZoom = clamp(z0 * Math.hypot(a.x - b.x, a.y - b.y) / pd0, 0.6, 4) }
  }
  const onUp = (e: PointerEvent) => { ptrs.delete(e.pointerId); if (!ptrs.size) cv.style.cursor = 'grab' }
  const onWheel = (e: WheelEvent) => { e.preventDefault(); tZoom = clamp(tZoom * Math.exp(-e.deltaY * 0.0015), 0.6, 4) }
  const onClick = (e: MouseEvent) => {
    if (moved > 6) return
    const u = hit(e); if (!u) return
    if (u.agentId) o.onPickAgent(u.agentId); else if (u.cafe) o.onPickCafe()
  }
  const resetView = () => { tYaw = ISO.yaw + Math.PI * 2 * Math.round((yaw - ISO.yaw) / (Math.PI * 2)); tPitch = ISO.pitch; tZoom = 1 }
  cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove)
  cv.addEventListener('pointerup', onUp); cv.addEventListener('pointercancel', onUp)
  cv.addEventListener('wheel', onWheel, { passive: false }); cv.addEventListener('click', onClick); cv.addEventListener('dblclick', resetView)

  // ── Animation loop ──
  const put = (el: HTMLElement, p: THREE.Vector3, dy = 0) => {
    const { w, h } = size(); v.copy(p).project(C)
    el.style.left = (v.x * 0.5 + 0.5) * w + 'px'; el.style.top = ((-v.y * 0.5 + 0.5) * h + dy) + 'px'
  }
  const tmp = new THREE.Vector3()
  let raf = 0
  const loop = (t: number) => {
    raf = requestAnimationFrame(loop)
    const st = o.getState()
    const k = RM ? 1 : 0.16; yaw += (tYaw - yaw) * k; pitch += (tPitch - pitch) * k; zoom += (tZoom - zoom) * k; frame()
    const dense = sBase * zoom < 36
    stations.forEach(a => {
      const state = st.states[a.def.id] ?? 'bereit', w = state === 'arbeitet', inbox = st.inbox.has(a.def.id), sel = st.selectedAgent === a.def.id
      a.s += ((w || a.def.id === COS.id ? 1 : 0) - a.s) * (RM ? 1 : 0.08)
      a.p.g.position.lerpVectors(STAND, SEAT, a.s); a.p.g.rotation.y = (1 - a.s) * Math.PI; pose(a.p, a.s, t, w && a.s > 0.9, a.ph)
      a.scr.color.setHex(w ? (Math.sin(t / 180 + a.ph) > -0.2 ? TEAL : 0x249494) : state === 'fertig' ? 0x8FD3D3 : 0x1b1b1b)
      a.lines.forEach((m, i) => { m.visible = w || state === 'fertig'; if (w) m.scale.x = 0.6 + 0.4 * Math.abs(Math.sin(t / 300 + i + a.ph)) })
      if (w && t - a.lp > 900) { a.lp = t; packet(a.def.id) }
      a.g.getWorldPosition(tmp); tmp.y += 1.35; put(a.el, tmp)
      a.el.className = 'node' + (w ? ' work' : state === 'fertig' ? ' done' : inbox ? ' inbox' : '') + (sel ? ' sel' : '') + (dense && !sel && !w && !inbox ? ' mini' : '')
    })
    areaEls.forEach(z => { tmp.set(z.x + z.sz / 2, 0, z.z + z.sz / 2); put(z.el, tmp, 4); z.el.classList.toggle('mini', dense) })
    if (cafeEl.dataset.html !== st.cafeHtml) { cafeEl.innerHTML = st.cafeHtml; cafeEl.dataset.html = st.cafeHtml }
    put(cafeEl, CAFE_P); cafeEl.classList.toggle('mini', dense && !st.cafeSelected); cafeEl.classList.toggle('sel', st.cafeSelected)
    for (let i = pk.length - 1; i >= 0; i--) {
      const p = pk[i]; p.t += 1.6 / (p.d * 40 + 30); const q = Math.min(p.t, 1)
      p.m.position.lerpVectors(p.from, p.to, q); p.m.position.y += Math.sin(Math.PI * q) * Math.min(4, p.d * 0.3); p.m.rotation.y += 0.08
      if (p.t >= 1) { S.remove(p.m); pk.splice(i, 1) }
    }
    R.render(S, C)
  }
  raf = requestAnimationFrame(loop)

  return {
    packet,
    resetView,
    destroy: () => {
      cancelAnimationFrame(raf)
      ro.disconnect(); mo.disconnect(); mq.removeEventListener('change', theme)
      cv.removeEventListener('pointerdown', onDown); cv.removeEventListener('pointermove', onMove)
      cv.removeEventListener('pointerup', onUp); cv.removeEventListener('pointercancel', onUp)
      cv.removeEventListener('wheel', onWheel); cv.removeEventListener('click', onClick); cv.removeEventListener('dblclick', resetView)
      S.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          const m = obj.material as THREE.Material | THREE.Material[]
          ;(Array.isArray(m) ? m : [m]).forEach(x => x.dispose())
        }
      })
      R.dispose()
      o.overlay.replaceChildren()
    },
  }
}
