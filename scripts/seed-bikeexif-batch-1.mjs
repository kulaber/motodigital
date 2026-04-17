#!/usr/bin/env node
/**
 * Seed script: Create a batch of BikeEXIF custom bikes as superadmin.
 * No workshop link (workshop_id = null) for all entries.
 * Run: node scripts/seed-bikeexif-batch-1.mjs
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

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const SUPERADMIN_ID = '0103433a-8c28-4867-8602-e1d00f5f8ca6'

// ── Bike definitions ─────────────────────────────────────────────────
const BIKES = [
  {
    title: 'Moto Guzzi V11 "Horizontal 723" — Horizontal Moto',
    make: 'Moto Guzzi',
    model: 'V11',
    year: 2023,
    style: 'cafe_racer',
    cc: 1064,
    description: `"Horizontal 723" nennt Paul Führmann von Horizontal Moto in Wien sein Meisterstück — eine Fusion aus klassischem 1978er Le Mans Mk II Tonti-Rahmen und moderner Moto Guzzi V11 Technik. Vintage-Ästhetik trifft auf zeitgenössische Performance, durchdacht bis ins letzte Detail und vollständig in Österreich zugelassen.

Der 1.064 cm³ V11-Block wurde grundlegend überarbeitet: leichtes Schwungrad, drehmomentstarke Nockenwelle, größere Einlassventile, Doppelzündung, zwei 41 mm Dell'Orto-Vergaser, redesignte Entlüftung und Ölabscheidung, sowie eine erweiterte Ölwanne mit CNC-gefräster Ölpumpe. Das Ergebnis: 90 PS bei nur 190 kg.

Fahrwerk: originale Le Mans-Gabeln tiefergelegt mit Bitubo-Innereien, YSS-Federbeine hinten, 18" Felgen mit Metzeler Roadtec. Die Bremsen: frische Scheiben, Stahlflex-Leitungen, CNC-gefräster Bremssattelhalter hinten.

Karosserie in poliertem Aluminium: Tab Classics Tank, eine von Carl Auböck gefertigte Alu-Verkleidung, Alu-Kotflügel vorne und innen hinten, Wildleder-Sitz von Ledernardo. Cockpit mit Clip-Ons, Tomaselli-Gasgriff, Motogadget Kombi-Tacho in CNC-Halterung, Motogadget Druckschalter und Lenkerenden-Blinker, Motocicli Veloci Rear-Sets.

Elektrik: komplett neu verlegt, stärkere Lichtmaschine, schlüssellose Zündung, 3D-gedruckter Elektronik-Träger. Auspuff: MASS Twin-Anlage. Minimalistisches Design mit Fokus auf horizontale Linien.`,
    modifications: [
      'Moto Guzzi V11 Motor (1.064 cc) in 1978er Le Mans Mk II Tonti-Rahmen',
      'Leichtes Schwungrad',
      'Drehmomentstarke Nockenwelle',
      'Größere Einlassventile',
      'Doppelzündung',
      '2× 41 mm Dell\'Orto Vergaser',
      'Redesignte Entlüftung und Ölabscheidung',
      'Erweiterte Ölwanne + CNC-gefräste Ölpumpe',
      'Originale Le Mans Gabel tiefergelegt, mit Bitubo Innereien',
      'YSS Federbeine hinten',
      '18" Felgen, Metzeler Roadtec Reifen',
      'Neue Bremsscheiben + Stahlflex-Leitungen',
      'CNC-gefräster Bremssattelhalter hinten',
      'Polierter Aluminium-Tank (Tab Classics)',
      'Alu-Verkleidung von Carl Auböck',
      'Aluminium-Kotflügel vorne + hinten (Innen)',
      'Wildleder-Sitz von Ledernardo',
      'Clip-On Stummellenker + Tomaselli Gasgriff',
      'Motogadget analog-digital Tacho in CNC-Halterung',
      'Motogadget Druckschalter + Lenkerenden-Blinker',
      'Rear-Sets von Motocicli Veloci',
      'Komplett neuer Kabelbaum + stärkere Lichtmaschine',
      'Schlüssellose Zündung',
      '3D-gedruckter Elektronik-Träger',
      'MASS Twin-Auspuffanlage',
      '90 PS · 190 kg',
    ],
    images: [
      'https://images.bikeexif.com/2023/07/moto-guzzi-v11-tonti-frame.jpg',
      'https://images.bikeexif.com/2023/07/moto-guzzi-v11-tonti-frame-1.jpg',
      'https://images.bikeexif.com/2023/07/moto-guzzi-v11-tonti-frame-3.jpg',
      'https://images.bikeexif.com/2023/07/moto-guzzi-v11-tonti-frame-5.jpg',
      'https://images.bikeexif.com/2023/07/moto-guzzi-v11-tonti-frame-8.jpg',
      'https://images.bikeexif.com/2023/07/moto-guzzi-v11-tonti-frame-9.jpg',
      'https://images.bikeexif.com/2023/07/moto-guzzi-v11-tonti-frame-6.jpg',
      'https://images.bikeexif.com/2023/07/moto-guzzi-v11-tonti-frame-11.jpg',
      'https://images.bikeexif.com/2023/07/moto-guzzi-v11-tonti-frame-4.jpg',
      'https://images.bikeexif.com/2023/07/moto-guzzi-v11-tonti-frame-7.jpg',
    ],
  },

  {
    title: 'BMW R nineT "Mach 9" Café Racer — CNCPT Moto',
    make: 'BMW Motorrad',
    model: 'R nineT',
    year: 2023,
    style: 'cafe_racer',
    cc: 1170,
    description: `"Mach 9" ist die Kollaboration von Arjan van den Boom (Ironwood Motorcycles) und Timothy Somers (Powerbrick), zusammen als CNCPT Moto aus den Niederlanden. Die Fortentwicklung ihres futuristischen "Cloud 9"-Konzepts in einen kompromisslos alltagstauglichen Road Warrior — kontrollierte Aggressivität trifft auf echte Fahrbarkeit.

Der 1.170 cm³ luft-/ölgekühlte Boxer bleibt intern serienmäßig, atmet aber durch DNA Pod-Filter anstelle der Airbox und bläst durch eine maßgefertigte Edelstahl 2-in-1 Anlage von MAD Exhausts mit passendem Endtopf.

Fahrwerk auf State-of-the-Art: OEM-Gabeln neu aufgebaut mit CeraCarbon Carbon-Standrohren und Matris Cartridge-Kit (voll einstellbar). Hinten ein TFX Suspension Federbein (ebenfalls voll einstellbar). Gefahren wird auf Rotobox Bullet Carbon-Felgen mit Pirelli Diablo Rosso IV. Bremse: OEM Brembo beibehalten.

Karosserie: Original-Tank mit Custom-Luftführung von Pier City Cycles, 3D-gedruckter Stummel-Heckrahmen, AC Schnitzer Bauchspoiler, CNC-gefräste Motor-Brustplatte und Ventildeckel, schmale LED-Rückleuchte integriert. Koso LED-Scheinwerfer in Powerbrick-Verkleidung. Sitz von Silver Machine (NL) in Leder und Alcantara.

Cockpit: CNC-gefräste Gabelbrücken und Clip-Ons, lederumwickelte Griffe, Motogadget Druckschalter und digitaler Tacho, Beringer Hauptbremszylinder und hydraulische Kupplung. Lackierung Schwarz/Silber von Royal Jack, Beschichtung/Eloxierung von Brother Coating.`,
    modifications: [
      'Serienmäßiger 1.170 cc Boxer-Motor',
      'DNA Pod-Luftfilter (Airbox entfernt)',
      'MAD Exhausts Edelstahl 2-in-1 Anlage + Endtopf',
      'OEM-Gabel neu aufgebaut mit CeraCarbon Carbon-Standrohren',
      'Matris Cartridge-Kit (voll einstellbar)',
      'TFX Suspension Federbein hinten (voll einstellbar)',
      'Rotobox Bullet Carbon-Räder (vorne + hinten)',
      'Pirelli Diablo Rosso IV Bereifung',
      'OEM Brembo Bremsanlage',
      'Original-Tank mit Custom-Luftführung (Pier City Cycles)',
      '3D-gedruckter Stummel-Heckrahmen',
      'AC Schnitzer Bauchspoiler',
      'CNC-gefräste Motor-Brustplatte und Ventildeckel',
      'Schmale integrierte LED-Rückleuchte',
      'CNC-gefräste Gabelbrücken und Clip-Ons',
      'Lederumwickelte Griffe',
      'Motogadget digitaler Tacho + Druckschalter',
      'Beringer Hauptbremszylinder + hydraulische Kupplung',
      'Koso LED-Scheinwerfer in Powerbrick-Nacelle',
      'Silver Machine Leder + Alcantara Sitzbezug',
      'Schwarz/Silber Lackierung (Royal Jack)',
      'Pulverbeschichtung + Eloxal (Brother Coating)',
    ],
    images: [
      'https://images.bikeexif.com/2023/06/r-ninet-cafe-racer.jpg',
      'https://images.bikeexif.com/2023/06/r-ninet-cafe-racer-1.jpg',
      'https://images.bikeexif.com/2023/06/r-ninet-cafe-racer-2.jpg',
      'https://images.bikeexif.com/2023/06/r-ninet-cafe-racer-3.jpg',
      'https://images.bikeexif.com/2023/06/r-ninet-cafe-racer-8.jpg',
      'https://images.bikeexif.com/2023/06/r-ninet-cafe-racer-10.jpg',
      'https://images.bikeexif.com/2023/06/r-ninet-cafe-racer-4.jpg',
      'https://images.bikeexif.com/2023/06/r-ninet-cafe-racer-7.jpg',
      'https://images.bikeexif.com/2023/06/r-ninet-cafe-racer-6.jpg',
    ],
  },

  {
    title: 'BMW R65 Café Racer — Gas&Retro',
    make: 'BMW Motorrad',
    model: 'R65',
    year: 1983,
    style: 'cafe_racer',
    cc: 890,
    description: `Žiga Petek von Gas&Retro aus Notranje Gorice in Slowenien hat eine unauffällige 1983er BMW R65 in einen messerscharfen modernen Café Racer verwandelt, der bewusst die gängigen BMW-Boxer-Konventionen ignoriert.

Motor: komplett revidiert und auf 890 cm³ aufgebohrt (Original 645 cc). Neue Ventile, Ventilfedern und Lager. Die originalen Bing-Vergaser wurden durch Mikuni mit Trompeten ersetzt, Zündung von Silent-Hektik, komplette Elektrik neu mit Motogadget-Komponenten und neuem Lade-System. Custom Edelstahl-Auspuff von Jaka Legiša.

Fahrwerk radikal umgebaut: Showa-Gabel aus einer Kawasaki ZX-10R, Schwinge aus einer neueren BMW GS, Custom YSS Europe Federbein hinten. Bremsen von Brembo mit Motomaster-Scheiben und Goodridge-Leitungen. Maßgefertigte, schwarz lackierte Speichenräder auf Pirelli Phantom Sportscomp.

Die komplette Karosserie — Tank, Heck, Verkleidung, Frontkotflügel, Bauchspoiler — wurde komplett aus Aluminium handgeformt: Hammer, Englisches Rad, traditionelle Blechbearbeitung. Ein integrierter Ölsumpf im Bauchspoiler. Forged Carbon Winglets und Trimelemente (MotoGP-inspiriertes Front-Wing, Seitenfinnen). Aerodynamische Seitenverkleidungen.

Cockpit: TRW Clip-Ons, Tomaselli Gasgriff, Brembo-Bedienarmaturen, Motogadget Griffe, Spiegel, Druckschalter und Digital-Dash. Custom Fußrasten mit handgefertigtem Schalthebel. Alcantara-Sitz von Mitja Bizjak.

Lackierung: BMW "Brooklyn Grey" metallic, alle Logos, Streifen und Honeycomb-Grafiken handgemalt von Matej Mrzlikar — ohne Vinyl-Folie. Rot eloxierte Akzente, farblich abgestimmte Schläuche und Kabel.`,
    modifications: [
      'Hubraum auf 890 cc aufgebohrt (Original 645 cc)',
      'Neue Ventile, Ventilfedern und Lager',
      'Mikuni Vergaser mit Trompeten (statt Bing)',
      'Silent-Hektik Zündung',
      'Motogadget-Elektrik + neues Ladesystem',
      'Custom Edelstahl-Auspuff (Jaka Legiša)',
      'Showa Gabel aus Kawasaki ZX-10R',
      'Schwinge aus neuerer BMW GS',
      'Custom YSS Europe Federbein hinten',
      'Brembo Bremssättel + Hauptbremszylinder',
      'Motomaster Bremsscheiben',
      'Goodridge Stahlflex-Leitungen',
      'Custom schwarze Speichenräder',
      'Pirelli Phantom Sportscomp Reifen',
      'Handgeformter Aluminium-Tank',
      'Handgeformtes Alu-Heck + Verkleidung',
      'Handgeformter Alu-Frontkotflügel + Bauchspoiler',
      'Ölsumpf integriert in Bauchspoiler',
      'Forged Carbon Front-Wing (MotoGP-inspiriert)',
      'Forged Carbon Seitenfinnen',
      'Aerodynamische Seitenverkleidungen',
      'TRW Clip-On Stummellenker',
      'Tomaselli Gasgriff + Brembo Armaturen',
      'Motogadget Griffe, Spiegel, Druckschalter, Digital-Dash',
      'Custom Rear-Sets + handgefertigter Schalthebel',
      'Alcantara-Sitz (Mitja Bizjak)',
      'Motogadget schlüsselloser Zündungsempfänger',
      'Koso LED-Scheinwerfer',
      'LED-Blinker integriert in Front-Wing + Heck-Finnen',
      'Vertikaler LED-Rückleuchtenstreifen',
      'BMW "Brooklyn Grey" metallic Lackierung',
      'Hand-gemalte Logos, Streifen und Honeycomb-Grafiken (Matej Mrzlikar)',
      'Rot eloxierte Akzente, farbcodierte Schläuche und Kabel',
    ],
    images: [
      'https://images.bikeexif.com/2023/05/bmw-r65-cafe-racer-0.jpg',
      'https://images.bikeexif.com/2023/05/bmw-r65-cafe-racer-1.jpg',
      'https://images.bikeexif.com/2023/05/bmw-r65-cafe-racer-2.jpg',
      'https://images.bikeexif.com/2023/05/bmw-r65-cafe-racer-3.jpg',
      'https://images.bikeexif.com/2023/05/bmw-r65-cafe-racer-4.jpg',
      'https://images.bikeexif.com/2023/05/bmw-r65-cafe-racer-5.jpg',
      'https://images.bikeexif.com/2023/05/bmw-r65-cafe-racer-6.jpg',
      'https://images.bikeexif.com/2023/05/bmw-r65-cafe-racer-8.jpg',
      'https://images.bikeexif.com/2023/05/bmw-r65-cafe-racer-10.jpg',
      'https://images.bikeexif.com/2023/05/bmw-r65-cafe-racer-12.jpg',
      'https://images.bikeexif.com/2023/05/bmw-r65-cafe-racer-13.jpg',
      'https://images.bikeexif.com/2023/05/bmw-r65-cafe-racer-14.jpg',
      'https://images.bikeexif.com/2023/05/bmw-r65-cafe-racer-15.jpg',
    ],
  },

  {
    title: 'Yamaha XS650 Custom — Simone Conti',
    make: 'Yamaha',
    model: 'XS650',
    year: 1971,
    style: 'cafe_racer',
    cc: 653,
    description: `Simone Conti aus Italien hat eine 1971er Yamaha XS650 radikal neu interpretiert — "ein alter Motor mit moderner Ästhetik". Vom Original blieben nur Motor, Getriebe, Felgen und die hintere Trommelbremse. Der Rest: komplett neu designt und gebaut.

Der Rahmen ist eine Eigenkonstruktion aus Aluminium, modular aufgebaut: röhrenförmiger Vorderteil und Heckrahmen, verbunden durch CNC-gefräste Montageplatten. Die Gabel stammt aus einer Honda CBR600RR, hinten ein Öhlins-Federbein. Vorne zwei Brembo-Bremszangen, hinten die originale Trommel.

Karosserie: handgeformte Alu-Verkleidung, Carbon-Elemente aus unidirektionalem Carbon für entlüftete Bremsscoops, Radabdeckungen hinten, Heck-Hugger, Auspuff-Hitzeschilder und Motorfilterschilde (Kooperation mit Devils Kiteboarding). Skulpturaler Tank und Heck in Candy Aquamarine, lackiert von Ivan Motta.

Zwei Edelstahl-Auspüffe mit Slash-Cut-Endtöpfen aus Carbon- und Alu-Rohren, maßgefertigte Fußrasten und Fersenplatten von Simone selbst. Reifen: Avon Speedmaster vorne, Dunlop K825 hinten auf 19F/18R Original-Felgen.

Inspiriert von Jet Fighters und Anime-Robotern: scharfe Kanten, sichtbare Schweißnähte, üppige Lüftungsöffnungen, "schlank und muskulös". Praktische Viertel-Drehverschlüsse für schnelle Wartung.`,
    modifications: [
      'Komplett neuer Aluminium-Rahmen (modular)',
      'CNC-gefräste Montageplatten',
      'Honda CBR600RR Vordergabel',
      'Öhlins Federbein hinten',
      '2× Brembo Bremszangen vorne',
      'Original Trommelbremse hinten beibehalten',
      'Original 19"/18" Felgen',
      'Avon Speedmaster (vorne) + Dunlop K825 (hinten)',
      'Handgeformte Aluminium-Verkleidung',
      'Unidirektional Carbon entlüftete Bremsscoops',
      'Carbon Radabdeckungen hinten',
      'Carbon Heck-Hugger',
      'Carbon Auspuff-Hitzeschilder',
      'Carbon Motorfilterschilde',
      'Skulpturaler Tank und Heck',
      'Candy Aquamarine Lackierung (Ivan Motta)',
      '2× Edelstahl-Auspuff mit Slash-Cut Endtöpfen',
      'Carbon- und Aluminium-Rohre im Auspuffsystem',
      'Maßgefertigte Fußrasten und Fersenplatten',
      'Viertel-Drehverschlüsse für Servicefreundlichkeit',
      'Carbon in Kooperation mit Devils Kiteboarding',
    ],
    images: [
      'https://images.bikeexif.com/2023/03/custom-yamaha-xs650-simone-conti.jpg',
      'https://images.bikeexif.com/2023/03/custom-yamaha-xs650-simone-conti-1.jpg',
      'https://images.bikeexif.com/2023/03/custom-yamaha-xs650-simone-conti-11.jpg',
      'https://images.bikeexif.com/2023/03/custom-yamaha-xs650-simone-conti-5.jpg',
      'https://images.bikeexif.com/2023/03/custom-yamaha-xs650-simone-conti-6.jpg',
      'https://images.bikeexif.com/2023/03/custom-yamaha-xs650-simone-conti-4.jpg',
      'https://images.bikeexif.com/2023/03/custom-yamaha-xs650-simone-conti-7.jpg',
      'https://images.bikeexif.com/2023/03/custom-yamaha-xs650-simone-conti-8.jpg',
      'https://images.bikeexif.com/2023/03/custom-yamaha-xs650-simone-conti-10.jpg',
    ],
  },

  {
    title: 'BMW K75 Café Racer — 72 HKG Performance',
    make: 'BMW Motorrad',
    model: 'K75',
    year: 1993,
    style: 'cafe_racer',
    cc: 750,
    description: `"Das beste BMW-K-Modell, das gebaut werden kann" — so der Anspruch von 72 HKG Performance in Burgos, Spanien. Hinter dem Projekt steht die Kollaboration von Antonio (72 Cycles Performance) und Jorge (Hell's Kitchen Garage). Commissioned von einem Sushi-Chef aus Madrid mit Sinn für kreative Exzellenz.

Die originale Tourer-Geometrie des Flying Bricks wurde komplett neu gedacht: aggressive Café-Racer-Ergonomie, scharfe Linien, Competition-Optik. Der 750 cm³ Dreizylinder bleibt serienmäßig zuverlässig und atmet durch eine maßgefertigte 3-in-1 Anlage mit LED-integriertem Endtopf-Gehäuse.

Fahrwerk aus dem Regal der Superbikes: Öhlins-Gabel aus einer Aprilia RSV4 Factory (gekürzt), Öhlins-Monoshock vertikal montiert mit separatem Ausgleichsbehälter. Einarm-Schwinge einer BMW R1100RS, Kardanantrieb einer BMW R850. Radstand um 5 cm verlängert. Bremse: Brembo Serie Oro Radialzangen, 320 mm Scheiben vorne. 18" vorne / 17" hinten auf Speichenrädern mit Michelin Pilot.

Karosserie: Custom-Heckrahmen aus Stahlrohr mit Heck, Carbon-Seitenverkleidungen über dem Kühler, gelochter Carbon-Heckkotflügel, windabweisender Frontkotflügel, Solo-Sitz von Senen Leather Works.

Cockpit: Tarozzi Alu Clip-Ons, Rear-Sets, aggressive Sitzposition. Elektrik: Motogadget mo.unit, Motoscope Pro Tacho, schlüssellose Zündung, smartphone-steuerbare LED-Beleuchtung im Sitz, Alarmanlage, integrierte Monitoring-Systeme. Minimale LED-Kennzeichenbeleuchtung an der Hinterachse.

Lackierung: tiefes Candy Green mit scharfem orangem Streifen über Tank, Seitenverkleidungen und Bauchspoiler.`,
    modifications: [
      'Serienmäßiger BMW K75 "Flying Brick" Dreizylinder',
      'Custom 3-in-1 Auspuffanlage mit LED-integriertem Endtopf',
      'Öhlins Gabel aus Aprilia RSV4 Factory (gekürzt)',
      'Öhlins Monoshock vertikal + Ausgleichsbehälter',
      'Einarm-Schwinge aus BMW R1100RS',
      'Kardanantrieb aus BMW R850',
      'Radstand um 5 cm verlängert',
      'Brembo Serie Oro Radialbremszangen',
      '320 mm Bremsscheiben vorne',
      '18" vorne / 17" hinten Speichenräder',
      'Michelin Pilot Bereifung',
      'Custom Stahlrohr-Heckrahmen + Heck',
      'Carbon-Seitenverkleidungen über Kühler',
      'Gelochter Carbon-Heckkotflügel',
      'Windabweisender Custom-Frontkotflügel',
      'Solo-Sitz von Senen Leather Works',
      'Tarozzi Aluminium Clip-Ons',
      'Rear-Set Fußrasten',
      'Motogadget mo.unit Steuerung',
      'Motoscope Pro Tacho',
      'Schlüssellose Zündung',
      'Smartphone-steuerbare LED-Beleuchtung im Sitz',
      'Alarmanlage + integrierte Monitoring-Systeme',
      'Minimale LED-Kennzeichenbeleuchtung an Hinterachse',
      'Candy Green Lackierung mit orangem Streifen',
    ],
    images: [
      'https://images.bikeexif.com/2023/01/custom-bmw-k75-cafe-racer.jpg',
      'https://images.bikeexif.com/2023/01/custom-bmw-k75-cafe-racer-1.jpg',
      'https://images.bikeexif.com/2023/01/custom-bmw-k75-cafe-racer-2.jpg',
      'https://images.bikeexif.com/2023/01/custom-bmw-k75-cafe-racer-3.jpg',
      'https://images.bikeexif.com/2023/01/custom-bmw-k75-cafe-racer-4.jpg',
      'https://images.bikeexif.com/2023/01/custom-bmw-k75-cafe-racer-5.jpg',
      'https://images.bikeexif.com/2023/01/custom-bmw-k75-cafe-racer-6.jpg',
      'https://images.bikeexif.com/2023/01/custom-bmw-k75-cafe-racer-7.jpg',
      'https://images.bikeexif.com/2023/01/custom-bmw-k75-cafe-racer-8.jpg',
    ],
  },

  {
    title: 'Yamaha SR150 "Neo Nostalgia" — Twentytwo Custom',
    make: 'Yamaha',
    model: 'SR150',
    year: 2022,
    style: 'cafe_racer',
    cc: 230,
    description: `Twentytwo Custom — die Custom-Sparte von Persist Motorcycle Company in Taiwan — verwandelt ein schlichtes taiwanesisches Lieferbike in einen sci-fi-inspirierten Straßenracer. "Neo Nostalgia": Cyberpunk-Ästhetik trifft auf 90er-JDM-Einflüsse. Die Originalsilhouette wurde bewahrt, aber in eine moderne, angular-scharfe Erscheinung übersetzt.

Motor: aufgebohrt von 150 auf 230 cm³. Zylinderkopf einer Yamaha TW225 nachgerüstet, optimierte Nockenwelle mit Kanalarbeit, verstärkte Kurbelwelle und Pleuel, Yoshimura Keihin FCR-MJN28 Vergaser mit K&N-Filter, verstärkte Kupplung, Banai Auspuffanlage.

Fahrwerk: modifizierte SYM Wolf 125 Gabel mit Yamaha FZ-Serie Gabelbrücken, MJP Factory Federbeine mit verlängerter Schwinge von Mark Motorcycle. Einzelne neon-gelbe Brembo-Bremszange. 18" vorne / 17" hinten auf Dunlop Sportmax.

Karosserie: Original-Tank beibehalten, Aluminium-"Winglets" am Tank, Origami-Style Alu-Seitenverkleidungen von Tough Tracker, mehrteiliges zerlegbares Custom-Heck, handgefertigtes 6" Scheinwerfer-Gehäuse. Minimale Rahmen-Modifikationen. Clip-Ons, Daytona Tacho, tiefer montierte Fußrasten, gekürzter Heckrahmen. Elektrik komplett neu verlegt, LED-Rückleuchte.

Lack: Kombination aus glänzendem und mattem Schwarz mit Grau, akzentuiert durch die neon-gelbe Brembo-Zange — eckige Bodywork kontrastiert mit der fließenden Auspufflinie.`,
    modifications: [
      'Hubraum auf 230 cc aufgebohrt (Original 150 cc)',
      'Yamaha TW225 Zylinderkopf nachgerüstet',
      'Optimierte Nockenwelle + Kanalarbeit',
      'Verstärkte Kurbelwelle + Pleuel',
      'Yoshimura Keihin FCR-MJN28 Vergaser',
      'K&N Luftfilter',
      'Verstärkte Kupplung',
      'Banai Auspuffanlage',
      'Modifizierte SYM Wolf 125 Gabel',
      'Yamaha FZ-Serie Gabelbrücken',
      'MJP Factory Federbeine hinten',
      'Verlängerte Schwinge (Mark Motorcycle)',
      'Brembo Bremszange (neon-gelb)',
      '18" vorne / 17" hinten',
      'Dunlop Sportmax Bereifung',
      'Original OEM Tank beibehalten',
      'Alu-"Winglets" am Tank',
      'Origami-Style Alu-Seitenverkleidungen (Tough Tracker)',
      'Custom mehrteiliges zerlegbares Heck',
      'Handgefertigtes 6" Scheinwerfer-Gehäuse',
      'Clip-On Stummellenker',
      'Daytona Tacho',
      'Tiefer montierte Fußrasten',
      'Gekürzter Heckrahmen',
      'Elektrik komplett neu verlegt + LED-Rückleuchte',
      'Lack: glänzend/matt Schwarz + Grau, neon-gelbe Akzente',
    ],
    images: [
      'https://images.bikeexif.com/2022/12/yamaha-sr150-cafe-racer.jpg',
      'https://images.bikeexif.com/2022/12/yamaha-sr150-cafe-racer-1.jpg',
      'https://images.bikeexif.com/2022/12/yamaha-sr150-cafe-racer-2.jpg',
      'https://images.bikeexif.com/2022/12/yamaha-sr150-cafe-racer-3.jpg',
      'https://images.bikeexif.com/2022/12/yamaha-sr150-cafe-racer-4.jpg',
      'https://images.bikeexif.com/2022/12/yamaha-sr150-cafe-racer-5.jpg',
      'https://images.bikeexif.com/2022/12/yamaha-sr150-cafe-racer-6.jpg',
      'https://images.bikeexif.com/2022/12/yamaha-sr150-cafe-racer-7.jpg',
      'https://images.bikeexif.com/2022/12/yamaha-sr150-cafe-racer-8.jpg',
      'https://images.bikeexif.com/2022/12/yamaha-sr150-cafe-racer-9.jpg',
    ],
  },
]

// ── Helpers ──────────────────────────────────────────────────────────
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
    console.log(`  ⚠ Slug "${slug}" already exists (id: ${existing.id}). Skipping.`)
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

// ── Main ─────────────────────────────────────────────────────────────
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
