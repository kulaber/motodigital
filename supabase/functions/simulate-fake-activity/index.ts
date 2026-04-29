// Supabase Edge Function: simulate-fake-activity
// Schedule (configure in Supabase Dashboard): "*/10 * * * *" — every 10 minutes.
//
// The function only acts when BOTH conditions are true:
//   1. current Europe/Berlin time falls inside the active window (10:00–19:30),
//   2. a random probability check passes (ACTION_PROBABILITY).
// With a 10-min cron and ~74% probability, expected volume is ~42 actions/day
// (split 50/30/20 → ~21 posts, ~13 likes, ~8 rides). Timing stays randomized
// so actions don't land on predictable tick boundaries.
// DST-safe (window is computed in Europe/Berlin zone, cron stays in UTC).
//
// On each active tick, it picks one random bot profile (is_bot = true) and
// performs one of three actions:
//   - post:  new community post with a German caption about custom bikes;
//            ~15% of posts also include 1–2 phone-style photos from MEDIA_POOL
//   - like:  like a recent post from another user
//   - ride:  create a short, realistic ride inside Germany (post_type='ride');
//            routes already used by upcoming rides are excluded so no two
//            simultaneously-open rides share a route

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WINDOW_START_HOUR = 10
const WINDOW_END_HOUR = 19
const WINDOW_END_MINUTE = 30
const ACTION_PROBABILITY = 0.74

const POSTS: string[] = [
  'Endlich läuft die CB450 wieder sauber. Zwei Wochen Vergaser-Abstimmung haben sich gelohnt.',
  'Kurzer Stopp beim Café am Rhein — bester Flat White seit langem.',
  'Scrambler-Umbau geht voran. Neue Auspuffanlage dran, klingt jetzt richtig fett.',
  'Wochenend-Runde durch die Eifel — 90 km, perfektes Wetter, null Stress.',
  'Auf der Suche nach einem originalen Mono-Sitz für meine SR500 — jemand ne Idee?',
  'Café Racer Projekt Update: Tank lackiert, Lenker montiert. Kommt langsam zusammen.',
  'Kurz beim Biker-Treff im Kesselhaus vorbeigefahren. Paar krasse Builds gesehen.',
  'Roadtrip-Sonntag: Stuttgart → Schwäbische Alb und zurück. Herrlich leer auf den Straßen.',
  'Meine Scrambler bekommt neue Knobby-Reifen. Bin gespannt wie sie sich auf Asphalt fährt.',
  'Gestern ein wunderschönes altes BMW R80 Paar gesehen. Custom bis zur letzten Schraube.',
  'Kleine Werkstatt-Session: Kette gespannt, Öl gewechselt, Bowdenzüge geölt. Wochenende kann kommen.',
  'Café Racer Treffen in Köln nächste Woche — wer ist dabei?',
  'Honda CX500 Tracker fast fertig. Nur noch der LED-Scheinwerfer muss angepasst werden.',
  'Ride durch den Taunus heute. Kurze Strecken, aber jede Kurve ein Traum.',
  'Neue Öhlins-Federbeine montiert. Die Yamaha fühlt sich an wie neu.',
  'Wer kennt gute Lackierer im Raum München für Tank- und Kotflügel-Arbeiten?',
  'Feierabend-Runde zum See, kurzer Kaffee, Sonnenuntergang eingefangen. Perfekt.',
  'Kleines Scrambler-Projekt auf Basis einer Yamaha XT600. Kommt nächstes Jahr raus.',
  'Endlich die originale Mikuni-Vergaserbatterie gefunden. Ersatzteilsuche hat sich gelohnt.',
  'Nichts entspannt mehr als abends 30 Minuten durch den Wald cruisen.',
  'Classic Bike Show am Samstag in Hamburg — wer kommt?',
  'Heute die Räder an meinem Café Racer gewechselt. Speichen statt Guss — sieht 100x besser aus.',
  'Kurze Pause an der Mosel. Perfekte Motorradstraßen hier oben.',
  'Restaurations-Projekt: Triumph Bonneville 1972. Rahmen ist gesandstrahlt und pulverbeschichtet.',
  'Garage voller alter Hondas geerbt. Jemand Interesse an originalen CB750-Teilen?',
  'Feel-Good-Sonntag: Bike poliert, Café au Lait, zwei Stunden Pfälzerwald.',
  'Custom-Build-Update: Rahmen ist geschweißt und gespachtelt. Nächster Schritt Lackierer.',
  'Suche Mitfahrer für ein Wochenende Alpen-Passstraßen. Nichts verrücktes, nur gemütlich und kurvig.',
  'Kleine Spessart-Runde, Stopp im Waldcafé. Motorrad parkt schöner als jedes Auto je könnte.',
  'Baujahr 78 Ducati wieder zum Leben erweckt. Sound ist immer noch magisch.',
  'Kawasaki W650 mit neuem Cockpit — analoge Instrumente, kein Digital-Kram.',
  'Mein Tipp für kurze Feierabend-Touren: durch den Odenwald. 40 km reichen für Seelenfrieden.',
  'Custom Bike Show München war der Wahnsinn. So viele kreative Projekte.',
  'BMW R65 Monolever — perfekte Basis für nen Scrambler. Leicht, zuverlässig, robust.',
  'Neues Lederpad für die Sitzbank kam heute an. Handgenäht in Italien. Bisschen Luxus muss sein.',
  'Sonntag früh um 7 losgefahren, leere Straßen, Nebel über den Wiesen. Einer der besten Rides dieses Jahr.',
]

// Media pool for occasional photo posts — phone-shot style, café racers + roads/landscapes.
// Used by ~15% of posts (1–2 images each). All URLs verified reachable on Unsplash.
const MEDIA_POOL: string[] = [
  // Custom bikes / café racers
  'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80',
  'https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800&q=80',
  'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&q=80',
  'https://images.unsplash.com/photo-1622185135505-2d795003994a?w=800&q=80',
  'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&q=80',
  'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80',
  // Landscapes, roads, mountain passes
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=800&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800&q=80',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
  'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=800&q=80',
  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80',
  'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?w=800&q=80',
  'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=800&q=80',
  'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800&q=80',
]

const MEDIA_PROBABILITY = 0.15

function pickMediaUrls(): string[] {
  if (Math.random() >= MEDIA_PROBABILITY) return []
  const target = Math.random() < 0.7 ? 1 : 2
  const urls: string[] = []
  while (urls.length < target) {
    const candidate = pick(MEDIA_POOL)
    if (!urls.includes(candidate)) urls.push(candidate)
  }
  return urls
}

const RIDE_CAPTIONS: (string | null)[] = [
  'Kurze Runde, entspanntes Tempo. Wer mitfahren will – einfach einsteigen.',
  'Café-Stopp inklusive. Packt Zeit für nen ordentlichen Espresso ein.',
  'Kurvige Strecke, keine Autobahn. Zwei Stunden zum Abschalten.',
  'Treffpunkt an der Tanke, dann rollen wir los.',
  'Feierabend-Runde. Kurz, aber jede Kurve lohnt sich.',
  'Sonntagsride für alle, die nicht zu weit fahren wollen.',
  'Nette Gruppe, kein Gehetze. Halt an der ersten Aussichtsstelle.',
  'Perfekte Strecke für Neueinsteiger. Nur geteerte Straßen, alles machbar.',
  'Kleiner Ausflug, klassisch mit Café-Stopp in der Mitte.',
  null,
  null,
]

type Stop = { name: string; lon: number; lat: number }
type Route = { name: string; stops: Stop[] }

// Short, realistic German routes (~30–150 km each). All stops in Germany.
const ROUTES: Route[] = [
  {
    name: 'Schwarzwaldhochstraße',
    stops: [
      { name: 'Baden-Baden', lon: 8.2410, lat: 48.7606 },
      { name: 'Ruhestein', lon: 8.2194, lat: 48.5583 },
      { name: 'Freudenstadt', lon: 8.4129, lat: 48.4637 },
    ],
  },
  {
    name: 'Mosel-Schleife',
    stops: [
      { name: 'Koblenz', lon: 7.5890, lat: 50.3569 },
      { name: 'Cochem', lon: 7.1663, lat: 50.1456 },
      { name: 'Bernkastel-Kues', lon: 7.0691, lat: 49.9159 },
    ],
  },
  {
    name: 'Eifel-Tour',
    stops: [
      { name: 'Nürburg', lon: 6.9471, lat: 50.3320 },
      { name: 'Monschau', lon: 6.2419, lat: 50.5547 },
      { name: 'Bad Münstereifel', lon: 6.7644, lat: 50.5556 },
    ],
  },
  {
    name: 'Harz-Runde',
    stops: [
      { name: 'Goslar', lon: 10.4346, lat: 51.9056 },
      { name: 'Torfhaus', lon: 10.5447, lat: 51.8028 },
      { name: 'Wernigerode', lon: 10.7814, lat: 51.8349 },
    ],
  },
  {
    name: 'Allgäu-Pässe',
    stops: [
      { name: 'Kempten', lon: 10.3173, lat: 47.7267 },
      { name: 'Füssen', lon: 10.7017, lat: 47.5715 },
      { name: 'Oberstdorf', lon: 10.2811, lat: 47.4095 },
    ],
  },
  {
    name: 'Bayerischer Wald',
    stops: [
      { name: 'Passau', lon: 13.4319, lat: 48.5665 },
      { name: 'Grafenau', lon: 13.3942, lat: 48.8508 },
      { name: 'Bodenmais', lon: 13.1028, lat: 49.0697 },
    ],
  },
  {
    name: 'Schwäbische Alb',
    stops: [
      { name: 'Reutlingen', lon: 9.2042, lat: 48.4919 },
      { name: 'Bad Urach', lon: 9.4025, lat: 48.4917 },
      { name: 'Münsingen', lon: 9.4933, lat: 48.4117 },
    ],
  },
  {
    name: 'Sauerland-Höhen',
    stops: [
      { name: 'Winterberg', lon: 8.5311, lat: 51.1942 },
      { name: 'Willingen', lon: 8.6075, lat: 51.2906 },
      { name: 'Brilon', lon: 8.5711, lat: 51.3956 },
    ],
  },
  {
    name: 'Rhein-Runde',
    stops: [
      { name: 'Mainz', lon: 8.2473, lat: 49.9929 },
      { name: 'Rüdesheim am Rhein', lon: 7.9247, lat: 49.9832 },
      { name: 'Bingen am Rhein', lon: 7.9006, lat: 49.9667 },
    ],
  },
  {
    name: 'Tegernsee-Tour',
    stops: [
      { name: 'Tegernsee', lon: 11.7556, lat: 47.7111 },
      { name: 'Rottach-Egern', lon: 11.7606, lat: 47.6822 },
      { name: 'Bad Wiessee', lon: 11.7158, lat: 47.7092 },
    ],
  },
  {
    name: 'Saarschleife-Runde',
    stops: [
      { name: 'Saarbrücken', lon: 6.9969, lat: 49.2402 },
      { name: 'Mettlach', lon: 6.5933, lat: 49.4939 },
      { name: 'Merzig', lon: 6.6389, lat: 49.4428 },
    ],
  },
  {
    name: 'Odenwald-Tour',
    stops: [
      { name: 'Heidelberg', lon: 8.6724, lat: 49.3988 },
      { name: 'Michelstadt', lon: 9.0039, lat: 49.6756 },
      { name: 'Erbach', lon: 8.9986, lat: 49.6553 },
    ],
  },
  {
    name: 'Rhön-Rennstrecke',
    stops: [
      { name: 'Fulda', lon: 9.6836, lat: 50.5558 },
      { name: 'Wasserkuppe', lon: 9.9394, lat: 50.4983 },
      { name: 'Gersfeld', lon: 9.9203, lat: 50.4489 },
    ],
  },
  {
    name: 'Bergisches Land',
    stops: [
      { name: 'Köln', lon: 6.9603, lat: 50.9375 },
      { name: 'Altenberg', lon: 7.1483, lat: 51.0536 },
      { name: 'Wipperfürth', lon: 7.4006, lat: 51.1156 },
    ],
  },
  {
    name: 'Ostsee-Küste',
    stops: [
      { name: 'Lübeck', lon: 10.6866, lat: 53.8655 },
      { name: 'Travemünde', lon: 10.8731, lat: 53.9619 },
      { name: 'Grömitz', lon: 10.9489, lat: 54.1461 },
    ],
  },
  {
    name: 'Alpenstraße bei Garmisch',
    stops: [
      { name: 'Garmisch-Partenkirchen', lon: 11.0950, lat: 47.4917 },
      { name: 'Mittenwald', lon: 11.2614, lat: 47.4417 },
      { name: 'Walchensee', lon: 11.3342, lat: 47.5875 },
    ],
  },
  {
    name: 'Spessart-Runde',
    stops: [
      { name: 'Aschaffenburg', lon: 9.1436, lat: 49.9769 },
      { name: 'Lohr am Main', lon: 9.5814, lat: 49.9942 },
      { name: 'Miltenberg', lon: 9.2633, lat: 49.7028 },
    ],
  },
  {
    name: 'Teutoburger Wald',
    stops: [
      { name: 'Detmold', lon: 8.8786, lat: 51.9378 },
      { name: 'Externsteine', lon: 8.9200, lat: 51.8689 },
      { name: 'Horn-Bad Meinberg', lon: 8.9631, lat: 51.8828 },
    ],
  },
]

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function berlinTimeNow(): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(new Date())
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10)
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10)
  return { hour, minute }
}

function inActiveWindow(hour: number, minute: number): boolean {
  if (hour < WINDOW_START_HOUR) return false
  if (hour > WINDOW_END_HOUR) return false
  if (hour === WINDOW_END_HOUR && minute > WINDOW_END_MINUTE) return false
  return true
}

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const force = url.searchParams.get('force') === '1'

  const { hour, minute } = berlinTimeNow()
  const berlinTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`

  if (!force && !inActiveWindow(hour, minute)) {
    return jsonResponse({ skipped: true, reason: 'outside active window', berlinTime })
  }

  // Probabilistic trigger: only act on ~74% of ticks for natural spacing.
  if (!force && Math.random() >= ACTION_PROBABILITY) {
    return jsonResponse({ skipped: true, reason: 'probability gate', berlinTime })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )

  // 1. Pick a random bot profile
  const { data: bots, error: botsErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_bot', true)

  if (botsErr) {
    console.error('[simulate-fake-activity] bots query failed:', botsErr)
    return jsonResponse({ error: botsErr.message }, 500)
  }
  if (!bots || bots.length === 0) {
    return jsonResponse({ skipped: true, reason: 'no bot profiles found' })
  }

  const bot = pick(bots)

  // 2. Decide action: 50% post, 30% like, 20% ride
  const roll = Math.random()
  const action: 'post' | 'like' | 'ride' =
    roll < 0.5 ? 'post' : roll < 0.8 ? 'like' : 'ride'

  try {
    let detail: unknown = null
    if (action === 'post') detail = await doPost(supabase, bot.id)
    else if (action === 'like') detail = await doLike(supabase, bot.id)
    else detail = await doRide(supabase, bot.id)

    // Refresh last_seen_at so the bot appears recently active on /riders.
    await supabase
      .from('profiles')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', bot.id)

    console.log(`[simulate-fake-activity] ${action} by ${bot.id}`, detail)
    return jsonResponse({ ok: true, action, botId: bot.id, berlinTime, detail })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[simulate-fake-activity] ${action} failed:`, msg)
    return jsonResponse({ error: msg, action, botId: bot.id }, 500)
  }
})

// deno-lint-ignore no-explicit-any
async function doPost(supabase: any, botId: string) {
  const body = pick(POSTS)
  const topic = Math.random() < 0.3 ? 'projekte' : 'allgemein'
  const mediaUrls = pickMediaUrls()
  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      user_id: botId,
      body,
      media_urls: mediaUrls,
      topic,
      post_type: 'post',
    })
    .select('id')
    .maybeSingle()
  if (error) throw error
  return { postId: data?.id, topic, mediaCount: mediaUrls.length }
}

// deno-lint-ignore no-explicit-any
async function doLike(supabase: any, botId: string) {
  // Candidate pool: recent posts from anyone other than this bot
  const { data: candidates, error: candErr } = await supabase
    .from('community_posts')
    .select('id')
    .neq('user_id', botId)
    .order('created_at', { ascending: false })
    .limit(100)
  if (candErr) throw candErr
  if (!candidates || candidates.length === 0) {
    return { skipped: 'no candidates' }
  }

  // Try up to 5 random picks to avoid already-liked posts
  for (let i = 0; i < 5; i++) {
    const target = pick(candidates)
    const { error } = await supabase
      .from('community_post_likes')
      .insert({ post_id: target.id, user_id: botId })
    if (!error) return { likedPostId: target.id }
    // 23505 = unique violation → bot already liked it, try another
    if (error.code !== '23505') throw error
  }
  return { skipped: 'all picks already liked' }
}

// deno-lint-ignore no-explicit-any
async function doRide(supabase: any, botId: string) {
  // Avoid repeating routes already taken by upcoming rides (any user, bot or real).
  // Each route in ROUTES has a unique first-stop city, so location_name identifies it.
  // Once a ride's start date passes, its route becomes available again.
  const { data: upcoming } = await supabase
    .from('community_posts')
    .select('location_name')
    .eq('post_type', 'ride')
    .gt('ride_start_at', new Date().toISOString())

  const usedNames = new Set((upcoming ?? []).map((r: { location_name: string | null }) => r.location_name))
  const available = ROUTES.filter((r) => !usedNames.has(r.stops[0].name))
  const route = available.length > 0 ? pick(available) : pick(ROUTES)
  const caption = pick(RIDE_CAPTIONS)

  // Start 2–14 days from now, between 10:00 and 14:30 local time.
  const startAt = new Date()
  startAt.setDate(startAt.getDate() + 2 + Math.floor(Math.random() * 13))
  startAt.setHours(
    10 + Math.floor(Math.random() * 5),
    Math.random() < 0.5 ? 0 : 30,
    0,
    0,
  )

  const ridersWanted = 3 + Math.floor(Math.random() * 5) // 3–7
  const maxParticipants = ridersWanted + 1 // +1 for the creator (matches composer convention)
  const firstStop = route.stops[0]

  const { data: inserted, error } = await supabase
    .from('community_posts')
    .insert({
      user_id: botId,
      body: caption,
      media_urls: [],
      topic: 'allgemein',
      post_type: 'ride',
      ride_visibility: 'public',
      ride_stops: route.stops,
      ride_start_at: startAt.toISOString(),
      ride_max_participants: maxParticipants,
      latitude: firstStop.lat,
      longitude: firstStop.lon,
      location_name: firstStop.name,
    })
    .select('id')
    .maybeSingle()
  if (error) throw error

  // Auto-join creator as participant (matches PostComposerSheet behaviour)
  if (inserted?.id) {
    const { error: partErr } = await supabase
      .from('ride_participants')
      .insert({ ride_post_id: inserted.id, user_id: botId })
    if (partErr && partErr.code !== '23505') throw partErr
  }

  return {
    postId: inserted?.id,
    route: route.name,
    startAt: startAt.toISOString(),
    maxParticipants,
  }
}
