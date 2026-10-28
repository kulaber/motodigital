// Agent Control — departments, staff and tasks.
// Ported from docs/prototypes/agent-control.html (BASE, AREAS, COS).
// Pure data: shared by the Three.js scene (client) and the run API (server).

export interface AgentTask {
  /** Chip label */
  t: string
  /** Task prompt */
  p: string
  /** Needs the latest results of all departments (Chief of Staff report) */
  ab?: boolean
}

// Price/performance: Sonnet for the drafting staff, Opus for strategy at HQ
export const DEFAULT_MODEL = 'claude-sonnet-5-5'

export interface AgentDef {
  id: string
  /** Claude model id; DEFAULT_MODEL when omitted */
  model?: string
  /** Display name */
  n: string
  /** Role */
  r: string
  job: string
  kpi: string
  /** Agent ids this agent can hand results to */
  to: string[]
  tasks: AgentTask[]
}

export interface AreaDef {
  id: string
  n: string
  /** Subtitle */
  s: string
  /** Angle (degrees) of the department around the café in the scene */
  ang: number
  agents: AgentDef[]
}

export const BASE = 'MotoDigital (motodigital.io) ist die Plattform für Custom-Motorrad-Kultur, live in der Beta, Fokus DACH, europäische Expansion geplant. Drei Zielgruppen: Custom-Werkstätten (wichtigste Zielgruppe, sie liefern das Angebot), Bike-Käufer und Rider. Live: Werkstatt-Verzeichnis mit interaktiver Karte, Profil, Galerie und Direktkontakt; Rider Community; Custom-Bike-Marktplatz. Demnächst: Werkstatt-Bewertungen, Shop-Integration. Geplant: Teile-Datenbank, digitaler Custom-Bike-Pass, App, europäische Expansion. Dazu ein Magazin (Guides, Interviews, Build Stories) und ein Event-Kalender, z. B. Custombike Show Bad Salzuflen 27.–29.11.2026. Angebot für Werkstätten: Founding Member, kostenlos bis Ende 2026 mit allen PRO-Features (unbegrenzte Bikes, Leistungen und Umbaustile, Kontakt-Button, Analytics, Logo und Titelbild, Karte, Badge), nur 100 Plätze, dazu ein dauerhafter Vorteil nach 2026, der noch nicht genau definiert ist. Tech: Next.js, Supabase, Stripe, Vercel, Mapbox, Cloudinary. Marke: roh, custom, bewusst abgegrenzt vom Harley- und Chopper-Mainstream, Du-Ansprache, kein Marketing-Sprech. Erfinde keine Zahlen, Fakten, Zitate oder Eigenschaften von Werkstätten; Zahlen nur aus dem Briefing oder aus deinen Daten-Tools. Antworte auf Deutsch.'

export const AREAS: AreaDef[] = [
  { id: 'vertrieb', n: 'Werkstatt-Vertrieb', s: 'Founding Members gewinnen', ang: 90, agents: [
    { id: 'lead', n: 'Lead-Researcher', r: 'Lead Research', job: 'Findet und qualifiziert Custom-Werkstätten in DACH als Founding Members.', kpi: 'qualifizierte Leads pro Woche', to: ['outreach'], tasks: [
      { t: 'Leads bewerten', p: 'Bewerte die Werkstätten aus den Details nach Passung zu MotoDigital, sortiere nach Priorität und begründe jede in einem Satz. Erfinde nichts über die Werkstätten.' },
      { t: 'Suchstrategie', p: 'Lege eine Suchstrategie fest, um bis Ende 2026 passende Custom-Werkstätten zu finden: Quellen, Suchbegriffe, Ausschlusskriterien.' },
      { t: 'Regionen-Plan', p: 'Schlage vor, welche Regionen in DACH zuerst bearbeitet werden, mit Begründung. Kennzeichne Annahmen.' }] },
    { id: 'outreach', n: 'Outreach', r: 'Werkstatt-Ansprache', job: 'Spricht Werkstätten an und lädt sie als Founding Member ein.', kpi: 'Antwortquote und neue Founding Members', to: ['onboarding', 'lead'], tasks: [
      { t: 'Instagram-DM', p: 'Schreibe eine Instagram-DM an die Werkstatt aus den Details, die sie als Founding Member einlädt. Kurz, persönlich, ohne erfundene Details über ihre Bikes.' },
      { t: 'E-Mail', p: 'Schreibe eine E-Mail mit Betreffzeile an die Werkstatt aus den Details, die sie als Founding Member einlädt.' },
      { t: 'Follow-up', p: 'Schreibe ein kurzes Follow-up an die Werkstatt aus den Details, die auf die erste Nachricht nicht reagiert hat.' }] },
    { id: 'onboarding', n: 'Onboarding', r: 'Werkstatt-Onboarding', job: 'Bringt neue Founding Members zu einem vollständigen, starken Profil.', kpi: 'Anteil vollständiger Profile', to: ['account', 'social'], tasks: [
      { t: 'Willkommensmail', p: 'Schreibe eine Willkommens-Mail an ein neues Founding Member mit den ersten drei Schritten im Profil.' },
      { t: 'Profil-Checkliste', p: 'Erstelle eine Checkliste für ein starkes Werkstatt-Profil: Logo, Titelbild, Beschreibung, Leistungen, Umbaustile, Builds.' },
      { t: 'Profil-Feedback', p: 'Gib konkretes Feedback zum Werkstatt-Profil aus den Details: was fehlt und was besser werden sollte.' }] },
    { id: 'account', n: 'Account Manager', r: 'Kundenbetreuung', job: 'Hält Founding Members aktiv und bereitet den Übergang nach 2026 vor.', kpi: 'aktive Mitglieder und Verlängerungen 2027', to: ['pricing', 'cos'], tasks: [
      { t: 'Check-in', p: 'Schreibe eine Check-in-Nachricht an ein bestehendes Founding Member: wie es läuft und was ihm fehlt.' },
      { t: 'Übergang 2027', p: 'Entwirf die Nachricht an Founding Members zum Ende der Gratisphase. Was der dauerhafte Vorteil genau ist, bleibt ein Platzhalter, falls die Details es nicht festlegen.' },
      { t: 'Abwanderungsrisiken', p: 'Nenne typische Gründe, warum Werkstätten inaktiv werden könnten, mit je einer Gegenmaßnahme. Als Hypothesen kennzeichnen.' }] }] },
  { id: 'marketing', n: 'Marketing & Content', s: 'Reichweite und Nachfrage', ang: 162, agents: [
    { id: 'social', n: 'Social Media', r: 'Instagram', job: 'Baut Reichweite auf Instagram auf und zeigt Werkstätten und Builds.', kpi: 'Reichweite und Profilbesuche', to: ['redaktion', 'events'], tasks: [
      { t: 'Post', p: 'Schreibe einen Instagram-Post zum Thema aus den Details (sonst frei gewählt): Caption, 5 Hashtags, konkrete Bildidee.' },
      { t: 'Werkstatt-Feature', p: 'Schreibe einen Instagram-Post, der die Werkstatt aus den Details vorstellt. Nur Fakten aus den Details oder aus deinen Daten-Tools verwenden.' },
      { t: 'Wochenplan', p: 'Erstelle einen Instagram-Wochenplan (Mo bis So) mit je einem Post oder einer Story und Ziel.' }] },
    { id: 'redaktion', n: 'Redaktion & SEO', r: 'Magazin', job: 'Plant und gliedert Magazin-Artikel, die Käufer und Werkstattsuchende über Google bringen.', kpi: 'organische Besucher', to: ['social'], tasks: [
      { t: 'Themenplan', p: 'Schlage 5 neue Artikelthemen mit Suchintention vor, die bestehende Guides zu Kaufberatung, Umbaukosten, TÜV und Stilen ergänzen statt doppeln.' },
      { t: 'Gliederung', p: 'Erstelle eine Artikel-Gliederung mit H2/H3 zum Thema aus den Details.' },
      { t: 'Meta-Texte', p: 'Schreibe Title (max. 60 Zeichen) und Meta-Description (max. 155 Zeichen) für das Thema aus den Details, drei Varianten.' }] },
    { id: 'events', n: 'Events & Community', r: 'Szene und Messen', job: 'Bringt MotoDigital in die Szene, vor Ort und in Foren.', kpi: 'Werkstatt-Kontakte über Events', to: ['outreach', 'social'], tasks: [
      { t: 'Messe-Plan', p: 'Erstelle einen Plan für die Custombike Show Bad Salzuflen: Ziele, Vorbereitung, Gesprächsleitfaden für Werkstätten, Nachbereitung.' },
      { t: 'Forum-Beitrag', p: 'Schreibe einen Diskussionsbeitrag für ein Biker-Forum oder eine Facebook-Gruppe, der zum Mitreden einlädt und nicht wie Werbung wirkt.' },
      { t: 'Event-Post', p: 'Schreibe einen Post zum Event aus den Details.' }] }] },
  { id: 'it', n: 'IT-Sicherheit & Recht', s: 'Schutz und Pflichten', ang: 234, agents: [
    { id: 'security', n: 'Security', r: 'IT-Sicherheit', job: 'Schützt Plattform, Konten und Zahlungen.', kpi: 'offene Sicherheitsrisiken', to: ['po'], tasks: [
      { t: 'Sicherheits-Check', p: 'Erstelle einen Sicherheits-Check mit 8 Punkten: Supabase Auth und Row Level Security, Storage, Stripe-Webhooks, Secrets in Vercel, Abhängigkeiten, Rate Limits, Backups, Admin-Zugänge.' },
      { t: 'Notfallplan', p: 'Erstelle einen kurzen Notfallplan für einen Sicherheitsvorfall oder ein Datenleck: Schritte, Zuständigkeit, Meldefristen als Prüfpunkt.' },
      { t: 'Feature prüfen', p: 'Prüfe das Feature aus den Details auf Sicherheitsrisiken und nenne Gegenmaßnahmen.' }] },
    { id: 'recht', n: 'Datenschutz & Recht', r: 'Compliance', job: 'Behält DSGVO, Bildrechte und Plattformpflichten im Blick. Keine Rechtsberatung, nur Prüfpunkte.', kpi: 'offene Rechtsrisiken', to: ['po', 'cos'], tasks: [
      { t: 'DSGVO-Check', p: 'Nenne die wichtigsten DSGVO-Prüfpunkte für eine Plattform mit Werkstatt-Profilen, Rider-Konten, Nachrichten, Analytics und Zahlungen.' },
      { t: 'Bildrechte', p: 'Erstelle einen Prüfplan für Bikes und Fotos fremder Builder, die das Team selbst eingestellt hat: was zu klären ist und wie.' },
      { t: 'Marktplatz-Pflichten', p: 'Nenne Prüfpunkte, die ein Online-Marktplatz für Custom-Bikes zwischen Werkstätten und Privatverkäufern klären sollte.' }] }] },
  { id: 'plattform', n: 'Plattform & Produkt', s: 'Roadmap und Qualität', ang: 306, agents: [
    { id: 'po', n: 'Product Owner', r: 'Produkt', job: 'Priorisiert die Roadmap nach Nutzen für Werkstätten.', kpi: 'Nutzen pro Release', to: ['security', 'support'], tasks: [
      { t: 'Roadmap-Prio', p: 'Priorisiere Bewertungen, Shop-Integration, Teile-Datenbank, Custom-Bike-Pass und App nach Nutzen für Werkstätten und Aufwand, mit Begründung.' },
      { t: 'User Story', p: 'Schreibe User Stories mit Akzeptanzkriterien für das Feature aus den Details.' },
      { t: 'Release Notes', p: 'Schreibe kurze Release Notes für Werkstätten zum Update aus den Details.' }] },
    { id: 'qa', n: 'Qualität', r: 'Qualität & Moderation', job: 'Sorgt für saubere Profile und Inserate.', kpi: 'Anteil geprüfter Profile und Inserate', to: ['support', 'onboarding'], tasks: [
      { t: 'Prüfregeln', p: 'Lege Prüfregeln für Werkstatt-Profile und Bike-Inserate fest: Pflichtangaben, Bildqualität, Dubletten, Spam.' },
      { t: 'Inserat prüfen', p: 'Prüfe das Inserat oder Profil aus den Details gegen sinnvolle Qualitätsregeln und nenne konkrete Korrekturen.' },
      { t: 'Verifizierung', p: 'Beschreibe einen schlanken Ablauf, um Werkstatt-Profile zu verifizieren.' }] },
    { id: 'support', n: 'Support', r: 'Hilfe und Anfragen', job: 'Beantwortet Fragen von Werkstätten und Ridern schnell und freundlich.', kpi: 'Antwortzeit und gelöste Anfragen', to: ['po'], tasks: [
      { t: 'FAQ', p: 'Schreibe 5 FAQ-Einträge (Frage und Antwort) für Werkstätten zum Founding-Member-Angebot.' },
      { t: 'Antwort', p: 'Schreibe eine Antwort auf die Anfrage aus den Details.' },
      { t: 'Hilfetext', p: 'Schreibe einen kurzen Hilfetext zur Funktion aus den Details.' }] }] },
  { id: 'finanzen', n: 'Finanzen', s: 'Kosten und Preise', ang: 18, agents: [
    { id: 'controller', n: 'Controller', r: 'Finanzen', job: 'Hält Kosten, Runway und Break-even im Blick.', kpi: 'Monate Runway', to: ['pricing', 'cos'], tasks: [
      { t: 'Kostenstruktur', p: 'Erstelle eine Kostenstruktur für die Plattform (Hosting, Datenbank, Karten, Bilder, Zahlungen, Domain, Tools, Marketing). Beträge nur aus den Details, sonst Platzhalter.' },
      { t: 'Break-even', p: 'Zeige als Formel, wie viele zahlende Werkstätten ab 2027 für den Break-even nötig sind. Preise und Kosten aus den Details, sonst Platzhalter.' },
      { t: 'Runway', p: 'Berechne die Runway aus den Zahlen in den Details und nenne zwei Hebel.' }] },
    { id: 'pricing', n: 'Pricing', r: 'Preismodell', job: 'Entwickelt das Preismodell ab 2027 und den Founding-Vorteil.', kpi: 'zahlende Werkstätten 2027', to: ['account', 'cos'], tasks: [
      { t: 'Modell 2027', p: 'Schlage zwei bis drei Preismodelle für Werkstätten ab 2027 vor, mit Vor- und Nachteilen. Als Hypothesen, ohne erfundene Marktpreise.' },
      { t: 'Founding-Vorteil', p: 'Formuliere drei Varianten, was der dauerhafte Vorteil für Founding Members nach 2026 konkret sein könnte, mit Bewertung.' },
      { t: 'Preisseite', p: 'Schreibe den Text für eine Preisseite zum Modell aus den Details.' }] }] },
]

export const COS: AgentDef = {
  id: 'cos', model: 'claude-opus-5-5', n: 'Chief of Staff', r: 'Zentrale', job: 'Hält den Überblick über alle Abteilungen, bündelt Ergebnisse und setzt Prioritäten.', kpi: 'du weißt jede Woche, was die drei wichtigsten Schritte sind', to: [], tasks: [
    { t: 'Wochenbericht', ab: true, p: 'Schreibe einen Wochenbericht aus den letzten Ergebnissen der Abteilungen unten: was erledigt ist, was offen ist, die drei wichtigsten nächsten Schritte mit Zuständigkeit.' },
    { t: 'Prioritäten', p: 'Lege anhand des Briefings die drei wichtigsten Prioritäten bis Ende 2026 fest, mit Begründung und zuständiger Abteilung.' },
    { t: 'Entscheidungsvorlage', p: 'Bereite eine Entscheidungsvorlage zum Thema aus den Details vor: Optionen, Vor- und Nachteile, Empfehlung.' }],
}

export const ZENTRALE = { id: 'zentrale', n: 'Zentrale' } as const

export interface ResolvedAgent extends AgentDef {
  areaId: string
  areaName: string
}

/** Lookup across Chief of Staff + all departments */
export function getAgent(id: string): ResolvedAgent | null {
  if (id === COS.id) return { ...COS, areaId: ZENTRALE.id, areaName: ZENTRALE.n }
  for (const area of AREAS) {
    const a = area.agents.find(x => x.id === id)
    if (a) return { ...a, areaId: area.id, areaName: area.n }
  }
  return null
}

export function allAgents(): ResolvedAgent[] {
  return [getAgent(COS.id)!, ...AREAS.flatMap(area => area.agents.map(a => getAgent(a.id)!))]
}
