#!/usr/bin/env node
/**
 * Seed script: Batch #2 of BikeEXIF bikes as superadmin (no workshop link).
 * Run: node scripts/seed-bikeexif-batch-2.mjs
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const envPath = path.resolve(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^=]+)=\s*(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
}

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const SUPERADMIN_ID = '0103433a-8c28-4867-8602-e1d00f5f8ca6'

const BIKES = [
  {
    title: 'BMW R nineT "Cloud 9" — CNCPT Moto',
    make: 'BMW Motorrad',
    model: 'R nineT',
    year: 2022,
    style: 'cafe_racer',
    cc: 1170,
    description: `"Cloud 9" ist die Auftakt-Kreation von CNCPT Moto — der Zusammenarbeit von Ironwood Motorcycles und Powerbrick aus den Niederlanden. Ein "neo-futuristisches" Statement, das fortschrittliche Fertigungstechniken mit handwerklicher Präzision verbindet: Clay-Modelle wurden digitalisiert und 3D-gedruckt, während die originalen Montagepunkte erhalten blieben. Debüt auf der Bike Shed London 2022, Beschreibung der Macher: "ein Teleport ins Jahr 2084".

Herzstück ist der 1.170 cm³ Boxer der R nineT, der durch eine 3D-gedruckte Airbox mit DNA-Filter atmet. CNC-gefräste Ventildeckel und vordere Motorabdeckung runden das Triebwerk optisch ab. Custom-Edelstahl-Auspuff mit handgebogenem Alu-Bauchspoiler.

Der radikalste Eingriff: eine zweiteilige Monocoque-Karosserie aus ASA-Thermoplast, kombiniert mit einer maßgefertigten Alu-Tankzelle mit OEM-Pumpe und -Anschlüssen. Fahrwerk auf Top-Niveau: Matris Hydraulik-Cartridges in der Gabel mit CeraCarbon Carbon-Standrohren, TFX Monoshock hinten. 17" Rotobox Carbon-Felgen auf Pirelli Diablo Superbike Slicks.

Cockpit mit Motogadget Tacho und Controls, Beringer Bremse und Kupplung. Sitzbezug von Silvermachine in Leder und Alcantara. Akzent-Details von Brothercoating.`,
    modifications: [
      'Zweiteilige Monocoque-Karosserie aus ASA-Thermoplast',
      'Custom Aluminium-Tankzelle mit OEM-Pumpe und Anschlüssen',
      '3D-gedruckte Airbox mit DNA-Luftfilter',
      'CNC-gefräste Ventildeckel',
      'CNC-gefräste vordere Motorabdeckung',
      'Matris Hydraulik-Cartridges in Vordergabel',
      'CeraCarbon Carbon-Standrohre',
      'TFX Monoshock hinten',
      '17" Rotobox Carbon-Felgen (vorne + hinten)',
      'Pirelli Diablo Superbike Slicks',
      'Custom Edelstahl-Auspuff + handgebogener Alu-Bauchspoiler',
      'Silvermachine Sitzbezug (Leder + Alcantara)',
      'Motogadget Tacho + Controls',
      'Beringer Hauptbremszylinder + Kupplung',
      'Akzent-Details von Brothercoating',
      'Clay-Modell digitalisiert + 3D-gedruckt',
    ],
    images: [
      'https://images.bikeexif.com/2022/06/bmw-r9t-cafe-racer.jpg',
      'https://images.bikeexif.com/2022/06/bmw-r9t-cafe-racer-1.jpg',
      'https://images.bikeexif.com/2022/06/bmw-r9t-cafe-racer-2.jpg',
      'https://images.bikeexif.com/2022/06/bmw-r9t-cafe-racer-3.jpg',
      'https://images.bikeexif.com/2022/06/bmw-r9t-cafe-racer-4.jpg',
      'https://images.bikeexif.com/2022/06/bmw-r9t-cafe-racer-5.jpg',
      'https://images.bikeexif.com/2022/06/bmw-r9t-cafe-racer-6.jpg',
      'https://images.bikeexif.com/2022/06/bmw-r9t-cafe-racer-7.jpg',
      'https://images.bikeexif.com/2022/06/bmw-r9t-cafe-racer-8.jpg',
      'https://images.bikeexif.com/2022/06/bmw-r9t-cafe-racer-9.jpg',
    ],
  },

  {
    title: 'Yamaha XS650 Café Racer — Motocrew',
    make: 'Yamaha',
    model: 'XS650',
    year: 1979,
    style: 'cafe_racer',
    cc: 653,
    description: `Chris Scholtka von Motocrew hat eine gut erhaltene 1979er Yamaha XS650 zu einem klassischen Café Racer umgebaut — im Auftrag eines Kunden aus Stuttgart. Drei Vorgaben: tiefe Sitzposition, laute Anlage und alles schwarz. Das Ergebnis verbindet Vintage-Silhouette mit kompromisslos modernen Fahrwerks-, Brems- und Elektrik-Komponenten.

Vorn kommt eine Honda CBR1000RR Gabel zum Einsatz, umgerüstet mit einem Cognito Moto Frame-Converter-Stem. Die Speichenräder sind maßgefertigt in 3,0 × 18" mit TÜV-Abnahme und laufen auf Shinko E270. Die Vorderradnabe ist CNC-gefertigt und schwarz eloxiert von Cognito Moto.

Bremsen: CBR-Sättel mit TRW-Scheibe, Brembo-Beläge und Hauptbremszylinder vorne — hinten die überholte Serien-Trommel. Touratech Gabelfedern, hinten Custom Black-T Federbeine. Neue Clip-Ons mit Hookie Co. Griffen.

Beleuchtung: 6,5" Puig LED-Scheinwerfer, Highsider Rückleuchten, Motogadget Spiegel. Motoscope Mini Tacho in 3D-gedrucktem Fascia-Halter. Bluetooth-fähige Motogadget mo.unit, schlüssellose Zündung, komplett neu verlegte Elektrik.

Das Highlight: der maßgefertigte 48-mm-Auspuff aus 42 geschwungenen Segmenten pro Seite. Der Tank wurde modifiziert (Aero-Tankdeckel, Heck-Höcker), das neue Heckrahmen-Design birgt die komplette Beleuchtung verdeckt.`,
    modifications: [
      'Honda CBR1000RR Vordergabel',
      'Cognito Moto Frame-Converter-Stem',
      'Custom Speichenräder 3,0 × 18" (TÜV-abgenommen)',
      'Shinko E270 Reifen',
      'CNC-Vorderradnabe, schwarz eloxiert (Cognito Moto)',
      'CBR Bremssättel + TRW Bremsscheibe vorne',
      'Brembo Bremsbeläge + Hauptbremszylinder',
      'Originale Trommelbremse hinten überholt',
      'Touratech Gabelfedern',
      'Black-T Custom Federbeine hinten',
      'Neue Clip-On Stummellenker',
      'Hookie Co. Griffe',
      '6,5" Puig LED-Scheinwerfer',
      'Highsider LED-Rückleuchten',
      'Motogadget Spiegel',
      'Motoscope Mini Tacho in 3D-gedrucktem Fascia',
      'Bluetooth Motogadget mo.unit',
      'Schlüssellose Zündung',
      'Kompletter Elektrik-Neubau',
      'Custom 48 mm Auspuff (42 Segmente pro Seite)',
      'Tank modifiziert: Aero-Tankdeckel + Heck-Höcker',
      'Custom Heckrahmen mit integrierter, versteckter Beleuchtung',
      'All-black Finish',
    ],
    images: [
      'https://images.bikeexif.com/2022/03/yamaha-1979-xs650.jpg',
      'https://images.bikeexif.com/2022/03/yamaha-1979-xs650-1a.jpg',
      'https://images.bikeexif.com/2022/03/yamaha-1979-xs650-2.jpg',
      'https://images.bikeexif.com/2022/03/yamaha-1979-xs650-3.jpg',
      'https://images.bikeexif.com/2022/03/yamaha-1979-xs650-4.jpg',
      'https://images.bikeexif.com/2022/03/yamaha-1979-xs650-5.jpg',
      'https://images.bikeexif.com/2022/03/yamaha-1979-xs650-6.jpg',
      'https://images.bikeexif.com/2022/03/yamaha-1979-xs650-7.jpg',
      'https://images.bikeexif.com/2022/03/yamaha-1979-xs650-8.jpg',
      'https://images.bikeexif.com/2022/03/yamaha-1979-xs650-9.jpg',
    ],
  },

  {
    title: 'Moto Guzzi V50 "Beretta" — Deus ex Machina Japan',
    make: 'Moto Guzzi',
    model: 'V50',
    year: 1980,
    style: 'cafe_racer',
    cc: 490,
    description: `"Beretta" entstand im Deus ex Machina Studio im Tokioter Stadtteil Asakusa zu Ehren des 100. Jubiläums von Moto Guzzi — ganz ohne Auftrag, rein aus Leidenschaft. Tomoyuki Soeda, Chef-Techniker bei Deus Japan, belässt den gut erhaltenen 490-cm³-V-Twin im Original und konzentriert sich ganz auf die handwerkliche Neuinterpretation.

Design-Leitlinie: die charakteristisch freiliegenden Zylinder des V50 zur Geltung bringen. Eine schmale Linie von Tank bis Heck rahmt den Motor ein. Als Tank dient ein modifizierter Yamaha SRV 250 Tank, das Heck-Cowl wurde aus Aluminium mit gerillter Textur handgefertigt. Brauner Leder-Sitz, handgefertigter Stahlrohr-Heckrahmen.

Vergaser sind zwei Keihin FCR36. Auspuff: chrom-beschichtete Stahlkrümmer mit Danmoto GP-Style-Endtöpfen. Die originalen 18"-Felgen bleiben erhalten, ebenso die originalen Brembo-Bremsen. Reifen: Firestone Champion Deluxe. Gabel vorne um 40 mm tiefergelegt, hintere Federbeine 40 mm länger als das Original.

Cockpit: Tomaselli Clip-Ons, Original 80er-Jahre Schaltereinheit, Motogadget Digital-Analog-Tacho, Custom getönte Windschutzscheibe, LED-Scheinwerfer, Hella-Nebellichter und ein eingelassener LED-Streifen als Rückleuchte.

Lack: Teal mit goldenen Pinstripes und messingfarbenen Hardware-Details.`,
    modifications: [
      '2× Keihin FCR36 Vergaser',
      'Chrom-Edelstahl Krümmer + Danmoto GP-Style Endtöpfe',
      'Original 18" Felgen beibehalten',
      'Original Brembo Bremsen beibehalten',
      'Firestone Champion Deluxe Reifen',
      'Vordergabel um 40 mm tiefergelegt',
      'Hintere Federbeine 40 mm länger als Original',
      'Modifizierter Yamaha SRV 250 Tank',
      'Handgefertigtes Alu-Heck-Cowl mit gerillter Textur',
      'Brauner Leder-Sitz',
      'Tomaselli Clip-On Stummellenker',
      'Original 80er Jahre Schaltereinheit',
      'Motogadget Digital-Analog-Tacho',
      'Custom getönte Windschutzscheibe',
      'LED-Scheinwerfer (custom montiert)',
      'Hella Nebellichter',
      'Eingelassener LED-Streifen als Rückleuchte',
      'Handgefertigter Stahlrohr-Heckrahmen',
      'Teal-Lackierung mit goldenen Pinstripes',
      'Messingfarbene Hardware-Details',
    ],
    images: [
      'https://images.bikeexif.com/2021/08/deus-guzzi-v50.jpg',
      'https://images.bikeexif.com/2021/08/deus-guzzi-v50-2.jpg',
      'https://images.bikeexif.com/2021/08/deus-guzzi-v50-3.jpg',
      'https://images.bikeexif.com/2021/08/deus-guzzi-v50-1.jpg',
      'https://images.bikeexif.com/2021/08/deus-guzzi-v50-4.jpg',
      'https://images.bikeexif.com/2021/08/deus-guzzi-v50-5.jpg',
      'https://images.bikeexif.com/2021/08/deus-guzzi-v50-6.jpg',
      'https://images.bikeexif.com/2021/08/deus-guzzi-v50-8.jpg',
    ],
  },

  {
    title: 'Buell S1 Turbo — Hazan Motorworks',
    make: 'Buell',
    model: 'S1 Lightning',
    year: 2001,
    style: 'naked',
    cc: 1350,
    description: `Max Hazan von Hazan Motorworks hat seinen eigenen, seit 2001 im Besitz befindlichen Buell S1 wieder zum Leben erweckt — mit dem Wissen von zwei Jahrzehnten Custom-Bike-Erfahrung. Nachdem ein früher Lachgas-Versuch den Originalmotor zerstörte, stand die Maschine 16 Jahre still. Heute: ein turbogeladener V-Twin mit rund 175 PS am Hinterrad bei gerade einmal 190 kg Gewicht. Hazan beschreibt das Fahrgefühl als "super sketchy".

Der V-Twin wurde auf 1.350 cm³ aufgebohrt, Verdichtung 8,5:1, mit größeren Ventilen und Nockenwellen mit 0,600" Hub. Turbolader: Garrett Dual-Ball-Bearing GT25R mit rund 1,4 bar Ladedruck. Vergasung: Mikuni HSR42 mit druckgespeistem Kraftstoffsystem. Race-Kupplung im Getriebe.

Fahrwerk: Gabel aus einer 2014er Honda CBR1000RR mit Custom-Gabelbrücken. Magnesium-Marchesini-Felgen (vorne 16,5", hinten 17") auf kompaktem Radstand. Schwinge: aus einem anderen Buell-Modell. Komplette Custom-Alu-Karosserie — aggressiv, kompakt, minimalistisch. Drehzahllimit: 6.000 U/min.

Leistung am Prüfstand: rund 175 PS, 217 Nm Drehmoment. Mit vollem Tank und Öl: 190 kg.`,
    modifications: [
      'V-Twin auf 1.350 cc aufgebohrt (Original 1.203 cc)',
      '8,5:1 Verdichtung',
      'Garrett GT25R Dual-Ball-Bearing Turbolader',
      'Rund 1,4 bar Ladedruck (~20 psi)',
      'Mikuni HSR42 Vergaser mit druckgespeistem Kraftstoffsystem',
      'Größere Ventile',
      'Nockenwellen mit 0,600" Hub',
      'Race-Kupplung',
      '2014er Honda CBR1000RR Gabel',
      'Custom-Gabelbrücken',
      'Marchesini Magnesium-Felgen (16,5" vorne / 17" hinten)',
      'Schwinge aus alternativem Buell-Modell',
      'Komplette Custom-Aluminium-Karosserie',
      'Drehzahllimit 6.000 U/min',
      '~175 PS am Hinterrad',
      '217 Nm (160 lb-ft) Drehmoment',
      '190 kg (415 lbs) betriebsfertig',
    ],
    images: [
      'https://images.bikeexif.com/2021/07/turbo-buell-s1-max-hazan.jpg',
      'https://images.bikeexif.com/2021/07/turbo-buell-s1-max-hazan-1.jpg',
      'https://images.bikeexif.com/2021/07/turbo-buell-s1-max-hazan-2.jpg',
      'https://images.bikeexif.com/2021/07/turbo-buell-s1-max-hazan-3.jpg',
      'https://images.bikeexif.com/2021/07/turbo-buell-s1-max-hazan-4.jpg',
      'https://images.bikeexif.com/2021/07/turbo-buell-s1-max-hazan-5.jpg',
      'https://images.bikeexif.com/2021/07/turbo-buell-s1-max-hazan-6.jpg',
      'https://images.bikeexif.com/2021/07/turbo-buell-s1-max-hazan-7.jpg',
      'https://images.bikeexif.com/2021/07/turbo-buell-s1-max-hazan-8.jpg',
      'https://images.bikeexif.com/2021/07/turbo-buell-s1-max-hazan-9.jpg',
      'https://images.bikeexif.com/2021/07/turbo-buell-s1-max-hazan-10.jpg',
    ],
  },

  {
    title: 'Suzuki Savage CS-1X — RYCA Motors',
    make: 'Suzuki',
    model: 'Savage / Boulevard S40',
    year: 2006,
    style: 'cafe_racer',
    cc: 652,
    description: `Die CS-1X ist RYCA Motors' 10-Jahres-Jubiläums-Edition aus Kalifornien — ein Prototyp, der einen Suzuki Savage (Boulevard S40) Cruiser in einen raffinierten Café Racer verwandelt. Das Besondere: Augmented Reality im Designprozess. "Wir haben AR benutzt, um jede Komponente 'im Kontext' auf dem Bike zu sehen, bevor wir gebaut haben."

Der neue 2,4-Gallon Stahltank ist poliert und dreifach verchromt. Herzstück der Ästhetik ist ein eigentümlicher "Double Barrel Shotgun"-Ram-Air-Einlass in Kombination mit einem mittig montierten Auspuff. Seitenverkleidungen in Aluminium mit Lüftungsschlitzen, Voll-gepolsterter Café-Racer-Sitz.

Antrieb: Umrüstung von Riemen- auf Kettenantrieb. Fahrwerk: RYCA Rear-Sets, RYCA Clip-Ons, RYCA Federbeine hinten, RYCA Tieferlegungs-Kit mit internen Distanzstücken vorne.

Räder: passendes 18"-Set (RYCA Kit) mit Shinko Super Classic 270 Vintage-Reifen. Veredelung: Satin-Chrom und -Nickel von Cal-Tron Plating Inc., dazu ein Mix aus Galvanik und Cerakote-Beschichtung.`,
    modifications: [
      '2,4-Gallon polierter Stahltank (dreifach verchromt)',
      '"Double Barrel Shotgun" Ram-Air-Einlass',
      'Mittig montierter Custom-Auspuff',
      'Voll gepolsterter Café-Racer-Sitz',
      'Alu-Seitenverkleidungen mit Lüftungsschlitzen',
      'Kettenantrieb-Umrüstung (statt Riemen)',
      'RYCA Rear-Sets',
      'RYCA Clip-On Stummellenker',
      'RYCA Federbeine hinten',
      'RYCA Tieferlegungs-Kit vorne (interne Distanzstücke)',
      '18" Räder (RYCA Kit, matched set)',
      'Shinko Super Classic 270 Vintage-Reifen',
      'Satin-Chrom + -Nickel (Cal-Tron Plating)',
      'Mix aus Galvanik und Cerakote-Beschichtung',
      'Mit Augmented Reality designt',
    ],
    images: [
      'https://images.bikeexif.com/2020/08/ryca-motors-cs-1x.jpg',
      'https://images.bikeexif.com/2020/08/ryca-motors-cs-1x-1.jpg',
      'https://images.bikeexif.com/2020/08/ryca-motors-cs-1x-2.jpg',
      'https://images.bikeexif.com/2020/08/ryca-motors-cs-1x-3.jpg',
      'https://images.bikeexif.com/2020/08/ryca-motors-cs-1x-4.jpg',
      'https://images.bikeexif.com/2020/08/ryca-motors-cs-1x-5.jpg',
      'https://images.bikeexif.com/2020/08/ryca-motors-cs-1x-6.jpg',
      'https://images.bikeexif.com/2020/08/ryca-motors-cs-1x-7.jpg',
      'https://images.bikeexif.com/2020/08/ryca-motors-cs-1x-8.jpg',
    ],
  },

  {
    title: 'Ducati Monster 600 "Ghost" — For The Bold Industries',
    make: 'Ducati',
    model: 'Monster',
    year: 1994,
    style: 'cafe_racer',
    cc: 583,
    description: `"Ghost" ist die Interpretation von Antony Ruggiero (For The Bold Industries) aus Manchester — eine 1994er Ducati Monster 600, konsequent weitergedacht: Retro-Ästhetik trifft auf moderne Materialien und Verfahren. Clay-Modellierung und Schaumstoff-Prototyping (klassische Car-Design-Methoden) lieferten die angulare Formensprache, die den ikonischen Trellis-Rahmen inszeniert.

Der Trellis-Rahmen wurde hinten gekürzt, die Karosserie besteht aus Carbon-Verkleidungen mit scharfen Kanten und 3D-gedruckten Kunststoff-Teilen für Lüftungen, Halterungen und unteren Verkleidungen. Der Custom-Tank wurde um 10 cm verlängert und sitzt gut 7 cm tiefer als das Original.

Fahrwerk: TFX Monoshock mit externem Ausgleichsbehälter. Räder: Naben einer Yamaha XS650 (von Dime City Cycles), Excel-Felgen custom gebohrt. Reifen: Avon Trailriders (90/10 Mischung). Gabel überarbeitet, schwarz eloxiert, mit Custom-Distanzstücken. Hinten Custom-Bremssattel-Halter.

Auspuff: QD Ex-Box mit abgestimmten Akustik-Kammern. Cockpit: Domino-Gasgriff, neue Armaturen, kompakte LED-Blinker. Sitz: Alcantara schwarz mit orangen Kontrastnähten. CNC-gefräste Alu-Teile für Heckabschluss, Zahnriemen-Abdeckungen, Gabelbrücke, Tankgurt. Custom-Ritzeladapter für die XS650-Nabe.`,
    modifications: [
      'Trellis-Rahmen hinten gekürzt',
      'Carbon-Verkleidungen (angular)',
      '3D-gedruckte Kunststoff-Teile: Lüftungen, Halter, untere Verkleidungen',
      'Custom-Tank 10 cm verlängert, 7 cm tiefer',
      'Sitz in schwarzem Alcantara mit orangen Kontrastnähten',
      'TFX Monoshock mit externem Ausgleichsbehälter',
      'Yamaha XS650 Naben (Dime City Cycles)',
      'Custom gebohrte Excel-Felgen',
      'Avon Trailriders (90% on-road / 10% off-road)',
      'Vordergabel überarbeitet, schwarz eloxiert',
      'Custom Gabel-Distanzstücke',
      'Custom Hinterrad-Bremssattelhalter',
      'QD Ex-Box Auspuff mit abgestimmten Akustik-Kammern',
      'Domino Gasgriff + neue Armaturen',
      'Kompakte LED-Blinker',
      'CNC-gefräste Alu-Teile: Heckabschluss, Zahnriemen-Abdeckung, Gabelbrücke, Tankgurt',
      'Custom-Ritzeladapter für XS650-Nabe',
    ],
    images: [
      'https://images.bikeexif.com/2022/08/ducati-monster-600-cafe-racer.jpg',
      'https://images.bikeexif.com/2022/08/ducati-monster-600-cafe-racer-1.jpg',
      'https://images.bikeexif.com/2022/08/ducati-monster-600-cafe-racer-3.jpg',
      'https://images.bikeexif.com/2022/08/ducati-monster-600-cafe-racer-7.jpg',
      'https://images.bikeexif.com/2022/08/ducati-monster-600-cafe-racer-2.jpg',
      'https://images.bikeexif.com/2022/08/ducati-monster-600-cafe-racer-5.jpg',
      'https://images.bikeexif.com/2022/08/ducati-monster-600-cafe-racer-4.jpg',
      'https://images.bikeexif.com/2022/08/ducati-monster-600-cafe-racer-6.jpg',
      'https://images.bikeexif.com/2022/08/ducati-monster-600-cafe-racer-8.jpg',
      'https://images.bikeexif.com/2022/08/ducati-monster-600-cafe-racer-9.jpg',
      'https://images.bikeexif.com/2022/08/ducati-monster-600-cafe-racer-10.jpg',
    ],
  },
]

function generateBikeSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function downloadImage(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MotoDigital-Seed/1.0)' },
  })
  if (!res.ok) throw new Error(`Download failed ${url}: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  return { buffer, contentType }
}

async function createBike(bike) {
  const slug = generateBikeSlug(bike.title)
  console.log(`\n── ${bike.title} ──`)

  const { data: existing } = await admin
    .from('bikes')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    console.log(`  ⚠ Slug "${slug}" exists (id: ${existing.id}). Skipping.`)
    return
  }

  const { data: inserted, error: insertError } = await admin
    .from('bikes')
    .insert({
      seller_id:        SUPERADMIN_ID,
      workshop_id:      null,
      title:            bike.title,
      make:             bike.make,
      model:            bike.model,
      year:             bike.year,
      style:            bike.style,
      cc:               bike.cc,
      mileage_km:       null,
      price:            0,
      city:             null,
      lat:              null,
      lng:              null,
      description:      bike.description,
      modifications:    bike.modifications,
      status:           'active',
      is_verified:      false,
      listing_type:     'showcase',
      price_amount:     null,
      price_on_request: false,
    })
    .select('id')
    .maybeSingle()

  if (insertError || !inserted) {
    console.error('  ✗ Insert failed:', insertError?.message)
    return
  }

  const bikeId = inserted.id
  await admin.from('bikes').update({ slug }).eq('id', bikeId)
  console.log(`  ✓ Bike: ${bikeId} (slug: ${slug})`)
  console.log(`  Uploading ${bike.images.length} images...`)

  for (let i = 0; i < bike.images.length; i++) {
    const url = bike.images[i]
    try {
      const { buffer, contentType } = await downloadImage(url)
      const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
      const storagePath = `${SUPERADMIN_ID}/${bikeId}/${i}.${ext}`

      const { error: uploadError } = await admin.storage
        .from('bike-images')
        .upload(storagePath, buffer, { contentType, upsert: true })
      if (uploadError) throw new Error(uploadError.message)

      const { data: { publicUrl } } = admin.storage
        .from('bike-images')
        .getPublicUrl(storagePath)

      const { error: mediaInsertError } = await admin
        .from('bike_images')
        .insert({
          bike_id: bikeId,
          url: publicUrl,
          position: i,
          is_cover: i === 0,
          media_type: 'image',
          thumbnail_url: null,
        })
      if (mediaInsertError) throw new Error(`bike_images: ${mediaInsertError.message}`)

      process.stdout.write(`  [${i + 1}/${bike.images.length}] ✓\n`)
    } catch (e) {
      console.warn(`  [${i + 1}] FAILED — ${e.message}`)
    }
  }
}

async function main() {
  console.log(`Seeding ${BIKES.length} BikeEXIF bikes as superadmin (no workshop link)...`)
  for (const bike of BIKES) {
    await createBike(bike)
  }
  console.log('\n✓ All done.')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
