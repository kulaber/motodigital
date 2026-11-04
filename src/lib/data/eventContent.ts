// Researched long-form content for event pages, German only (EN event pages
// canonicalise to the German URL). Prices and opening hours belong to one
// edition: they carry `edition` (that edition's date_start) and disappear on
// their own once the events row moves on to the next date.
//
// Sources, checked 2026-11-02: glemseck101.de (Die Veranstaltung, Anreise,
// 1/8 Meile), custombike-show.de (Start, Tickets, Location),
// motorradundreisen.de (Custombike-Show 2026).
// Checked 2026-11-04: intermot.de (Termin, Tickets, Anreise, Eventcluster),
// 1000ps.de (INTERMOT 2027 Aussteller, 27.10.2026; Absage 2026, 12.02.2026).
// Ticket prices were not published yet — fill them in once the shop opens.
// Checked 2026-11-04 for the nine events added that day (official sites unless
// noted): motorbikeexpo.it (Info utili, news 20/21.10.2026), motorradwelt-bodensee.de
// (Tickets, Anreise, Best Bike Award, news 25.01.2026), imot.de, motorradmessen.de/
// hmt-hamburg + hamburg.de, motorraeder-dortmund.de (Besucher, Highlights 2026),
// custom-nationals.de (Start, FAQ, Bikeshow), bikeweek.at, veterama.de (Mannheim:
// Tickets, Öffnungszeiten, Anreise), gentlemansride.com (About, DGR 2026 wrap-up
// 29.05.2026) + motorradundreisen.de (DGR cities in Germany).
// No official 2027 date for the DGR yet (row has NULL dates) — set it once announced.

export type EventContent = {
  /** Name with article for running text, e.g. "die Custombike-Show" */
  nameInText: string
  sections: { heading: string; paragraphs: string[]; list?: string[] }[]
  facts?: { edition: string; items: { label: string; value: string }[] }
  faq?: { q: string; a: string; edition?: string }[]
  links?: { href: string; label: string }[]
  /**
   * Attribution for a freely licensed hero photo (Wikimedia Commons). Only shown
   * while `image` matches the event's image, so a new photo never keeps an old credit.
   * Rendered in every locale: the licences require it.
   */
  imageCredit?: { image: string; author: string; license: string; licenseUrl: string; source: string }
  /** No single venue (e.g. a worldwide ride): skip geocoding and the map */
  hideMap?: boolean
}

const STORAGE = 'https://ikhgfynzghfhnviwvupo.supabase.co/storage/v1/object/public/event-images/commons'

export const EVENT_CONTENT: Record<string, EventContent> = {
  'glemseck-101': {
    nameInText: 'das Glemseck 101',
    sections: [
      {
        heading: 'Was ist das Glemseck 101?',
        paragraphs: [
          'Seit 2006 trifft sich die Custom-Szene am ersten Septemberwochenende am Glemseck bei Leonberg, direkt an der Start-Ziel-Geraden der ehemaligen Solitude-Rennstrecke, auf der bis in die 1960er-Jahre Rennen gefahren wurden. Aus einem Treffen am Hotel Glemseck ist eines der bekanntesten Custom-Motorrad-Events Europas geworden: drei Tage, zwei lange Nächte, Sprintrennen, Livemusik und eine über drei Kilometer lange Händlermeile mit mehr als 100 Ausstellern auf zwei gesperrten Landstraßen.',
          '2027 feiert das Glemseck 101 seine 20. Ausgabe. Der Eintritt bleibt auch im Jubiläumsjahr frei, für die Händlermeile, das Bühnenprogramm und die Tribüne an der Sprintstrecke.',
        ],
      },
      {
        heading: 'Die Achtelmeile: Sprint ganz analog',
        paragraphs: [
          'Herzstück sind die Sprints über die Achtelmeile, rund 201 Meter. Gestartet wird nicht per Ampel, sondern von einem Flag Girl mit karierter Flagge. Im Ziel entscheidet keine Lichtschranke, sondern ein Zielrichter mit roter Flagge. Gesprintet wird am Samstag und Sonntag, die Tribüne bietet über 1.200 Plätze.',
          'Am Start stehen vor allem umgebaute Motorräder im Old-School-Street-Style. Reine Dragster und Rennstreckenmaschinen sind nicht zugelassen. Die wichtigsten Klassen:',
        ],
        list: [
          '101 Sprint International',
          '101 Big Coffee',
          '101 Cafe Racer',
          '101 Classic Racer, als einzige Klasse auch für Serienmotorräder',
          'Gastsprints, unter anderem Rocket Race Club, StarrWars und Tiny Torquer',
        ],
      },
      {
        heading: 'Programm an den drei Tagen',
        paragraphs: ['Die Händlermeile öffnet am Freitagabend, die Rennen laufen am Wochenende:'],
        list: [
          'Freitag: Händlermeile und Livebands auf der 101-Bühne',
          'Samstag: Sprints über die Achtelmeile, abends Livebands',
          'Sonntag: Motorradgottesdienst am Vormittag an der Main Stage, danach Sprints',
          'Jeden Abend: Bühnenprogramm mit Rock und Rockabilly bis 1 Uhr',
        ],
      },
      {
        heading: 'Anreise, Parken und Camping',
        paragraphs: [
          'Das Gelände liegt zwischen Leonberg und Stuttgart. Fürs Navi: Hotel Restaurant Glemseck, Glemseck 1, 71229 Leonberg. Am besten kommst du über die A8 oder A81 und nimmst die Ausfahrt Leonberg-Ost. Aus Richtung Stuttgart ist die Zufahrt über das Krummbachtal am ganzen Eventwochenende gesperrt.',
          'Motorräder mit Straßenzulassung dürfen aufs Gelände. Bei großem Andrang wird es am Samstag und Sonntag ab 11 Uhr für Motorräder geschlossen, dann parkst du nach Anweisung vor den Eingängen. Autos parken auf dem Rappenberg vor dem Westeingang. Gezeltet wird hinter dem Hotel Glemseck, Wohnmobile stehen auf einer eigenen Wiese am Fuß des Rappenbergs.',
        ],
      },
      {
        heading: 'Tipps für deinen Besuch',
        paragraphs: [],
        list: [
          'Früh kommen: Am Wochenende kann das Gelände ab 11 Uhr für Motorräder gesperrt werden.',
          'Bargeld einstecken: Parken und Camping werden nur bar bezahlt.',
          'Helm und Jacke gibst du gegen eine Spende an der Helmgarderobe der Streetbunnycrew auf der Händlermeile ab.',
          'Wer mit dem Motorrad aus Stuttgart kommt, fährt über Leonberg an, nicht durchs Krummbachtal.',
        ],
      },
    ],
    facts: {
      edition: '2027-09-03',
      items: [
        { label: 'Ort', value: 'Glemseck, 71229 Leonberg' },
        { label: 'Eintritt', value: 'frei, auch für die Tribüne' },
        { label: 'Sprints', value: 'Samstag und Sonntag' },
        { label: 'Parken', value: 'Auto 15 € (Sonntag 10 €), Wohnmobil 60 €, Motorrad frei' },
        { label: 'Camping', value: 'Zelt bis 2 Personen 25 €, nur bar' },
      ],
    },
    faq: [
      {
        q: 'Was kostet der Eintritt beim Glemseck 101?',
        a: 'Nichts. Der Eintritt ist am ganzen Wochenende frei, auch für die Händlermeile, das Bühnenprogramm und die Tribüne an der Achtelmeile. Kosten fallen nur fürs Parken mit dem Auto und fürs Camping an.',
      },
      {
        q: 'Wie lang ist die Sprintstrecke beim Glemseck 101?',
        a: 'Gesprintet wird über die Achtelmeile, also rund 201 Meter, auf der Start-Ziel-Geraden der ehemaligen Solitude-Rennstrecke. Start und Ziel werden mit Flaggen entschieden, ohne elektronische Zeitmessung.',
      },
      {
        q: 'Darf ich mit dem Motorrad aufs Gelände fahren?',
        a: 'Ja, Motorräder mit Straßenzulassung dürfen aufs Gelände. Bei großem Andrang wird es am Samstag und Sonntag ab 11 Uhr für Motorräder gesperrt. Dann parkst du vor den Eingängen.',
      },
      {
        q: 'Gibt es beim Glemseck 101 einen Campingplatz?',
        a: 'Ja, für Zelte hinter dem Hotel Glemseck: 25 Euro pro Zelt für bis zu zwei Personen, unabhängig von der Aufenthaltsdauer, nur bar. Reservieren kann man nicht, der Platz öffnet am Donnerstag vor dem Event. Wohnmobile stehen auf einer separaten Wiese.',
        edition: '2027-09-03',
      },
    ],
    links: [
      { href: '/magazine/cafe-racer-umbau', label: 'Cafe Racer Umbau: Anleitung in 8 Schritten' },
      { href: '/bikes/cafe-racer', label: 'Cafe Racer Custom Bikes entdecken' },
      { href: '/custom-werkstatt/stuttgart', label: 'Custom Werkstätten in Stuttgart' },
    ],
  },

  'custombike-show': {
    nameInText: 'die Custombike-Show',
    sections: [
      {
        heading: 'Was ist die Custombike-Show?',
        paragraphs: [
          'Die Custombike-Show in Bad Salzuflen gilt als größte Messe für umgebaute Motorräder in Europa. Jedes Jahr Ende November füllt sie die Hallen 20 bis 22 des Messezentrums mit rund 17.000 Quadratmetern Ausstellungsfläche: Custom Bikes vom seriennahen Umbau bis zum radikalen Showbike, dazu Teile, Zubehör, Bekleidung, Helme, Airbrush und Schmuck.',
          'Für viele in der Szene ist sie der Saisonabschluss und der Ort, an dem die Umbauten des Jahres gezeigt werden. Wer einen Umbau plant, trifft hier viele Builder persönlich, bevor er einen Auftrag vergibt.',
        ],
      },
      {
        heading: 'European Custombike Championship',
        paragraphs: [
          'Herzstück ist die European Custombike Championship. Amateure und Profis treten in vierzehn Kategorien gegeneinander an, gezeigt werden Chopper, Cruiser, Bobber, Fighter, Trikes, Gespanne und Einzelanfertigungen. Jeder Klassensieger erhält 500 Euro, der Gesamtsieger über alle Klassen 5.000 Euro.',
        ],
      },
      {
        heading: 'Programm',
        paragraphs: ['Neben der Championship erwartet dich:'],
        list: [
          'Live-Customizing',
          'Bühnenprogramm und Partyformate',
          'Monster-Bike-Show',
          'Händler für Teile, Zubehör, Bekleidung und Helme',
        ],
      },
      {
        heading: 'Anreise und Parken',
        paragraphs: [
          'Die Messe findet im Messezentrum Bad Salzuflen statt, Benzstraße 23, 32108 Bad Salzuflen. Mit dem Auto kommst du über die A2, Ausfahrt 28 (Ostwestfalen/Lippe) oder 29 (Herford/Bad Salzuflen). Fürs Navi zum Parkplatz: Heerserheider Straße 2. Geparkt wird kostenlos, vor allem auf dem Zentralparkplatz P2 neben Halle 12, von dort sind es nur wenige Schritte zum Eingang von Halle 20.',
          'Mit der Bahn fährst du bis Bad Salzuflen oder Schötmar, die nächsten ICE-Halte sind Herford und Bielefeld. Die Buslinie 942 fährt stündlich bis zur Haltestelle Benzstraße am Messegelände.',
        ],
      },
    ],
    facts: {
      edition: '2026-11-27',
      items: [
        { label: 'Ort', value: 'Messezentrum Bad Salzuflen, Hallen 20–22' },
        { label: 'Öffnungszeiten', value: 'Fr 11–19 Uhr, Sa 10–18 Uhr, So 10–17 Uhr' },
        { label: 'Tickets', value: 'Tageskasse 20 € (Wochenende 40 €), Vorverkauf 19 € (38 €) zzgl. Gebühr' },
        { label: 'Unter 18', value: 'frei in Begleitung Erwachsener' },
        { label: 'Parken', value: 'kostenlos' },
      ],
    },
    faq: [
      {
        q: 'Was kostet der Eintritt zur Custombike-Show 2026?',
        a: 'Im Vorverkauf kostet ein Tagesticket 19 Euro und das Wochenendticket 38 Euro, jeweils zuzüglich Vorverkaufsgebühr. An der Tageskasse zahlst du 20 beziehungsweise 40 Euro. Kinder und Jugendliche unter 18 Jahren haben in Begleitung Erwachsener freien Eintritt.',
        edition: '2026-11-27',
      },
      {
        q: 'Wann hat die Custombike-Show geöffnet?',
        a: 'Freitag von 11 bis 19 Uhr, Samstag von 10 bis 18 Uhr und Sonntag von 10 bis 17 Uhr.',
        edition: '2026-11-27',
      },
      {
        q: 'Kann man an der Custombike-Show parken?',
        a: 'Ja, das Parken ist kostenlos. Der Zentralparkplatz P2 liegt neben Halle 12, nur wenige Schritte vom Eingang zu Halle 20. Ist er voll, weisen Ordner dich zu weiteren kostenlosen Flächen in der Nähe.',
      },
      {
        q: 'Was ist die European Custombike Championship?',
        a: 'Der Custom-Bike-Wettbewerb der Messe: Amateure und Profis treten in vierzehn Kategorien an. Jeder Klassensieger erhält 500 Euro, der Gesamtsieger 5.000 Euro.',
      },
    ],
    links: [
      { href: '/custom-werkstatt', label: 'Custom Werkstätten finden' },
      { href: '/magazine/was-kostet-ein-custom-bike', label: 'Was kostet ein Custom Bike?' },
      { href: '/bikes/bobber', label: 'Bobber Custom Bikes entdecken' },
    ],
  },

  intermot: {
    nameInText: 'die INTERMOT',
    sections: [
      {
        heading: 'Was ist die INTERMOT?',
        paragraphs: [
          'Die INTERMOT in Köln ist die große deutsche Motorradmesse. Veranstalter ist die Koelnmesse, ideeller Träger der Industrie-Verband Motorrad Deutschland (IVM). Hersteller zeigen hier ihre Neuheiten für die Saison, dazu kommen Bekleidung, Helme, Reifen, Zubehör und Technik.',
          '2026 gab es keine INTERMOT. Im Februar 2026 beschloss der IVM, die Messe vom Herbst auf den Saisonstart zu verlegen. Die erste Ausgabe im neuen Rhythmus läuft vom 19. bis 21. Februar 2027, mit drei Messetagen und vier statt zwei Hallen. Mitte Oktober 2026 lag die angemeldete Ausstellungsfläche laut Veranstalter rund 20 Prozent über dem Gesamtergebnis von 2025.',
        ],
      },
      {
        heading: 'Welche Marken sind dabei?',
        paragraphs: [
          'Mehr als 50 Marken haben ihre Teilnahme angekündigt. Bei den Motorradherstellern sind das unter anderem:',
        ],
        list: [
          'BMW Motorrad, Ducati, Honda, Kawasaki, KTM, Husqvarna und Yamaha',
          'Royal Enfield, Brixton, BSA, Horex und Moto Morini',
          'Benda, CFMOTO, Hero, Kove, QJMotor, Voge und Segway Powersports',
          'Zero Motorcycles als Elektro-Hersteller',
        ],
      },
      {
        heading: 'Probefahrten und Programm',
        paragraphs: [
          'Das Highlight für Besucher ist der Indoor-Testparcours in Halle 11.3: rund 500 Meter Strecke auf lackiertem Quarzsand, mehr als 1.000 Probefahrten pro Messetag. Helm, Jacke und Handschuhe werden gestellt. Die Aktionsflächen sind gegenüber 2025 doppelt so groß. Auf dem PLAYGROUND, einer 20 mal 45 Meter großen Fläche, zeigen Hersteller Aktionen und Shows.',
          'Dazu kommen Themenbereiche:',
        ],
        list: [
          'Adventure Travel: Reiseenduros, Reiseberichte und eine kleine Bühne',
          'Innovation Walk: neue Antriebe und Sicherheitstechnik, etwa die Honda V3R 900 mit elektrischem Kompressor',
          '100 Jahre Nürburgring-Nordschleife: historische Rennmaschinen aus den 1920er- bis 1990er-Jahren, dazu Motorradmuseen aus ganz Deutschland',
          'Rennsport-Area mit Boxengasse, Superbikes und Motorrädern der Rallye Dakar',
          'Urban Mobility rund um Zweiräder in der Stadt',
          '#motorradazubi: Wettbewerb für angehende Zweiradmechatroniker und Berufsberatung',
          'Creator-Meet-and-Greet mit bekannten Motorrad-Creatorn und die INTERMOT Stage für Talks und Musik',
        ],
      },
      {
        heading: 'Custom Bikes auf der INTERMOT',
        paragraphs: [
          'Einen eigenen Custom-Bereich hat die INTERMOT für 2027 bislang nicht angekündigt. Interessant für Fans von Classics und Cafe Racern sind die Retro-Marken unter den Ausstellern wie Royal Enfield, Brixton und BSA. Viele Neuheiten der EICMA in Mailand dürften in Köln ihren ersten großen Auftritt in Deutschland haben. Wer vor allem Umbauten und Builder sucht, ist auf der Custombike-Show in Bad Salzuflen Ende November richtig.',
        ],
      },
      {
        heading: 'Anreise',
        paragraphs: [
          'Die Messe findet auf dem Gelände der Koelnmesse statt, Messeplatz 1, 50679 Köln, direkt gegenüber der Altstadt auf der rechten Rheinseite. Am bequemsten kommst du mit der Bahn: Der Bahnhof Köln Messe/Deutz liegt am Eingang Süd und wird von ICE-Zügen und den S-Bahn-Linien S6, S11, S12 und S19 angefahren. Die Stadtbahnlinien 1 und 9 halten ebenfalls dort, die Linien 3 und 4 an der Haltestelle Koelnmesse für die Eingänge Ost, West und Nord.',
        ],
      },
    ],
    facts: {
      edition: '2027-02-19',
      items: [
        { label: 'Ort', value: 'Koelnmesse, Messeplatz 1, 50679 Köln' },
        { label: 'Öffnungszeiten', value: 'Fr–So 9–18 Uhr' },
        { label: 'Tickets', value: 'Preise noch nicht veröffentlicht' },
        { label: 'Probefahrten', value: 'Indoor-Parcours in Halle 11.3, Ausrüstung wird gestellt' },
        { label: 'Bahn', value: 'Köln Messe/Deutz, ICE und S-Bahn' },
      ],
    },
    faq: [
      {
        q: 'Warum findet die INTERMOT jetzt im Februar statt?',
        a: 'Der Industrie-Verband Motorrad (IVM) hat im Februar 2026 beschlossen, die Messe vom Herbst auf den Saisonstart zu verlegen. 2026 fiel die INTERMOT deshalb aus. Die erste Ausgabe im neuen Rhythmus läuft vom 19. bis 21. Februar 2027 und belegt vier statt zwei Hallen.',
      },
      {
        q: 'Kann man auf der INTERMOT Motorräder probefahren?',
        a: 'Ja. In Halle 11.3 gibt es einen rund 500 Meter langen Indoor-Testparcours mit mehr als 1.000 Probefahrten pro Messetag. Helm, Jacke und Handschuhe werden gestellt.',
        edition: '2027-02-19',
      },
      {
        q: 'Was kostet der Eintritt zur INTERMOT 2027?',
        a: 'Die Ticketpreise hat die Koelnmesse noch nicht veröffentlicht (Stand November 2026). Laut Veranstalter haben Kinder und Jugendliche bis einschließlich 16 Jahre im Rahmen der IVM-Aktion #motorradazubi freien Eintritt. Mit dem Ticket fährst du außerdem kostenlos mit Bus und Bahn im Verkehrsverbund Rhein-Sieg zur Messe.',
        edition: '2027-02-19',
      },
      {
        q: 'Gibt es auf der INTERMOT Custom Bikes?',
        a: 'Einen eigenen Custom-Bereich hat die INTERMOT 2027 bislang nicht angekündigt. Retro-Marken wie Royal Enfield, Brixton und BSA haben ihre Teilnahme zugesagt. Für Umbauten und Builder ist die Custombike-Show in Bad Salzuflen die bessere Adresse.',
      },
    ],
    links: [
      { href: '/magazine/eicma-2026-retro-neuheiten', label: 'EICMA 2026: Die Retro-Neuheiten für 2027' },
      { href: '/magazine/cafe-racer-kaufen-guide', label: 'Cafe Racer kaufen: der Leitfaden' },
      { href: '/custom-werkstatt/koeln', label: 'Custom Werkstätten in Köln' },
    ],
  },

  'motor-bike-expo': {
    nameInText: 'die Motor Bike Expo',
    sections: [
      {
        heading: 'Was ist die Motor Bike Expo?',
        paragraphs: [
          'Die Motor Bike Expo, kurz MBE, eröffnet jedes Jahr im Januar die Messesaison. Auf dem Messegelände Veronafiere stellen rund 720 Aussteller auf etwa 120.000 Quadratmetern in acht Hallen aus, zur letzten Ausgabe kamen laut Veranstalter 180.000 Besucher. 2027 ist die 19. Ausgabe, die Wurzeln reichen aber 33 Jahre zurück: Angefangen hat die Messe als Chopper & Custom Show, später hieß sie Bike Expo.',
          'Die großen Hersteller zeigen in Verona ihre Neuheiten, von Straße und Adventure über Racing und Offroad bis zur Stadtmobilität. Das Besondere bleibt aber der Custom-Bereich: Builder, Teilehersteller und Lackierer aus aller Welt bringen ihre Einzelstücke mit. Viele Produkte kannst du direkt am Stand kaufen, deshalb nutzen viele Besucher die Messe, um sich für die neue Saison auszurüsten.',
        ],
      },
      {
        heading: 'MBE Award und Premium Selection',
        paragraphs: [
          'Zwei Wettbewerbe machen Verona zum wichtigsten Custom-Termin im Winter. Beim MBE Award bewertet eine Fachjury die besten Umbauten der Aussteller. Die Premium Selection, organisiert zusammen mit dem italienischen Custom-Magazin Lowride, richtet sich an Garagen, private Schrauber und junge Werkstätten aus Italien und dem Ausland.',
          'Wer sein Bike in der Premium Selection zeigen will, bewirbt sich über die Website der Messe. Die Teilnahme kostet 300 Euro zuzüglich Mehrwertsteuer. Dafür gibt es ein Podest von 3 × 1 Metern im Bike-Show-Bereich, Zugang zur Lounge, ein Fotoshooting und zwei Pässe für alle drei Tage. Angeliefert wird am Donnerstag vor der Messe.',
        ],
      },
      {
        heading: 'Shows und Probefahrten',
        paragraphs: [
          'Im Außenbereich gibt es mindestens fünf Pisten für Rennen, Contests und Shows, dazu Fahrkurse für Einsteiger, Frauen und Kinder. Auf dem Programm stehen unter anderem:',
        ],
        list: [
          'Super Enduro, Freestyle und Trial Indoor',
          'Stuntshows und Supermoto',
          'Probefahrten mit Neuheiten der Hersteller, auf der Straße und auf Parcours in der Messe',
          'Gebrauchtmotorrad-Bereich (Area Usato)',
        ],
      },
      {
        heading: 'Anreise und Parken',
        paragraphs: [
          'Veronafiere liegt an der Viale del Lavoro 8, rund drei Kilometer vom Zentrum, wenige Minuten von der Autobahnausfahrt Verona Sud an der A4 und vom Bahnhof Verona Porta Nuova. Aus Deutschland kommst du über den Brenner und die A22. Für Autos gibt es die Parkplätze P3, P4 (Parkhaus) und P7 Re Teodorico.',
          'Motorräder parken kostenlos, die Zufahrt ist über Tor C. Samstags und sonntags fährt von 8 bis 20 Uhr alle 20 Minuten ein kostenloser Shuttle vom Parkplatz Genovesa zur Messe.',
        ],
      },
    ],
    facts: {
      edition: '2027-01-22',
      items: [
        { label: 'Ort', value: 'Veronafiere, Viale del Lavoro 8, Verona' },
        { label: 'Öffnungszeiten', value: 'Fr–So 9–19 Uhr' },
        { label: 'Tickets', value: 'online 21 € zzgl. Gebühr, Tageskasse 25 €' },
        { label: 'Ermäßigt', value: '8–13 Jahre 18 €, ab 65 Jahren 20 € (nur vor Ort)' },
        { label: 'Motorrad-Parkplatz', value: 'kostenlos, Zufahrt über Tor C' },
      ],
    },
    faq: [
      {
        q: 'Was kostet der Eintritt zur Motor Bike Expo 2027?',
        a: 'Bis zum 18. November 2026 kostet das Online-Ticket im Early-Bird-Angebot 18 Euro zuzüglich Gebühr. Danach zahlst du online 21 Euro plus Gebühr, insgesamt 23 Euro, und an der Tageskasse 25 Euro. Kinder von 8 bis 13 Jahren zahlen 18 Euro, Besucher ab 65 Jahren 20 Euro. Diese ermäßigten Tickets gibt es nur an den Kassen vor Ort.',
        edition: '2027-01-22',
      },
      {
        q: 'Wann hat die Motor Bike Expo geöffnet?',
        a: 'Freitag bis Sonntag jeweils von 9 bis 19 Uhr.',
        edition: '2027-01-22',
      },
      {
        q: 'Kann ich mit dem Motorrad zur Motor Bike Expo fahren?',
        a: 'Ja, Motorräder parken kostenlos, die Zufahrt ist über Tor C. Plane bei der Anreise über die Alpen im Januar aber Schnee und Glätte ein.',
      },
      {
        q: 'Kann ich mein eigenes Custom Bike in Verona ausstellen?',
        a: 'Ja, über die Premium Selection, die sich an Garagen, Privatleute und junge Werkstätten richtet. Die Teilnahme kostet 300 Euro zuzüglich Mehrwertsteuer. Bewerbungen müssen bis zum 15. Januar 2027 eingehen, die Plätze werden vergeben, solange Fläche frei ist.',
        edition: '2027-01-22',
      },
    ],
    links: [
      { href: '/custom-werkstatt', label: 'Custom Werkstätten finden' },
      { href: '/bikes/chopper', label: 'Chopper Custom Bikes entdecken' },
      { href: '/magazine/was-kostet-ein-custom-bike', label: 'Was kostet ein Custom Bike?' },
    ],
  },

  'motorradwelt-bodensee': {
    nameInText: 'die Motorradwelt Bodensee',
    sections: [
      {
        heading: 'Was ist die Motorradwelt Bodensee?',
        paragraphs: [
          'Die Motorradwelt Bodensee auf dem Messegelände Friedrichshafen gilt als größte Motorradmesse Süddeutschlands. Sie läuft jedes Jahr Ende Januar und ist damit eine der ersten Messen der Saison. Auf rund 70.000 Quadratmetern zeigen Aussteller aus zwölf Nationen Motorräder, Roller, Trikes und Quads, dazu Zubehör, Bekleidung und Reisen. 2026 kamen rund 40.870 Besucher, im Jahr davor 41.480.',
          'Durch die Lage am Bodensee kommen viele Besucher aus Österreich, der Schweiz und Liechtenstein. Bekannt ist die Messe für ihr großes Rahmenprogramm.',
        ],
      },
      {
        heading: 'Best Bike Award: Custom Bikes im Foyer West',
        paragraphs: [
          'Für die Custom-Szene ist der Best Bike Award der wichtigste Programmpunkt. Amateure und Profis stellen ihre Umbauten im Foyer West aus, eine Fachjury bewertet. 2027 gibt es erstmals die Kategorie „Best Amateur Performance“ für Projekte, die mit begrenztem Budget in der heimischen Werkstatt entstanden sind.',
          'Bewerben kannst du dich online bis zum 15. Dezember 2026. Die Auswahl läuft ab Dezember, Teilnehmer werden per E-Mail informiert. Die Gewinner werden am Sonntag, 31. Januar 2027, auf der Rock-Antenne-Bühne gekürt.',
        ],
      },
      {
        heading: 'Programm',
        paragraphs: ['Neben den Ständen erwarten dich:'],
        list: [
          'Trial-Shows, FMX-Sprünge und Stuntshows',
          'Indoor-Cross-Rennen, 2026 zum ersten Mal im Programm',
          'Ein Gebraucht-Motorrad-Markt',
          'Neuheiten der Hersteller zum Anfassen und Probesitzen',
        ],
      },
      {
        heading: 'Anreise und Parken',
        paragraphs: [
          'Die Adresse fürs Navi: Messe Friedrichshafen, Neue Messe 1, 88046 Friedrichshafen. Von Westen fährst du über die A81 und A98 bis zum Autobahnende und weiter über die B31, alternativ über die A8 bis Ulm-West und dann über die B30. Die Besucherparkplätze an der Messe sind kostenlos.',
        ],
      },
    ],
    facts: {
      edition: '2027-01-29',
      items: [
        { label: 'Ort', value: 'Messe Friedrichshafen, Neue Messe 1' },
        { label: 'Öffnungszeiten', value: 'Fr und Sa 9–18 Uhr, So 9–17 Uhr' },
        { label: 'Tageskarte', value: 'online 20 €, Kasse 24 €' },
        { label: '3-Tageskarte', value: 'online 42 €, Kasse 50 €' },
        { label: 'Parken', value: 'kostenlos' },
      ],
    },
    faq: [
      {
        q: 'Was kostet der Eintritt zur Motorradwelt Bodensee 2027?',
        a: 'Eine Tageskarte kostet online 20 Euro und an der Kasse 24 Euro, die 3-Tageskarte 42 beziehungsweise 50 Euro. Kinder und Jugendliche zahlen online 13 Euro und an der Kasse 17 Euro, die Familienkarte kostet 43 beziehungsweise 50 Euro. Freitags gibt es ab 15 Uhr ein Nachmittagsticket für 15 Euro online.',
        edition: '2027-01-29',
      },
      {
        q: 'Wie kann ich beim Best Bike Award mitmachen?',
        a: 'Über das Bewerbungsformular auf der Website der Messe, Anmeldeschluss ist der 15. Dezember 2026. Teilnehmen können Amateure und Profis. Neu ist 2027 die Kategorie „Best Amateur Performance“ für Umbauten aus der heimischen Werkstatt.',
        edition: '2027-01-29',
      },
      {
        q: 'Wo parke ich bei der Motorradwelt Bodensee?',
        a: 'Die Besucherparkplätze der Messe Friedrichshafen sind kostenlos.',
      },
    ],
    links: [
      { href: '/custom-werkstatt/stuttgart', label: 'Custom Werkstätten in Stuttgart' },
      { href: '/custom-werkstatt/zuerich', label: 'Custom Werkstätten in Zürich' },
      { href: '/magazine/tuev-eintragung-custom-bike', label: 'TÜV-Eintragung für Custom Bikes' },
    ],
  },

  imot: {
    nameInText: 'die IMOT',
    sections: [
      {
        heading: 'Was ist die IMOT?',
        paragraphs: [
          'Die IMOT, ausgeschrieben Internationale Motorrad Ausstellung, ist die Motorradmesse für München und Bayern. Sie läuft jedes Jahr im Februar auf dem Messegelände München in Riem, der Veranstalter blickt auf 33 Jahre Erfahrung zurück. Laut eigenen Angaben stellen über 250 Aussteller aus, und jährlich kommen mehr als 130.000 Besucher.',
          'Für BMW Motorrad ist die IMOT ein Heimspiel, die Marke sitzt schließlich in München. Neben den Herstellern zeigen Händler, Zubehöranbieter, Bekleidungsmarken und Reiseveranstalter ihre Angebote für die neue Saison.',
        ],
      },
      {
        heading: 'Programm',
        paragraphs: [
          'Das Rahmenprogramm verteilt sich auf drei Bühnen: Shows in der IMOT-Arena, Neuvorstellungen auf der großen Showbühne und Gespräche im IMOT-Forum. 2026 lief die Messe parallel zur Freizeitmesse f.re.e und zu den Münchner Autotagen.',
        ],
      },
      {
        heading: 'Custom Bikes auf der IMOT',
        paragraphs: [
          'Einen eigenen Custom-Wettbewerb hat die IMOT für 2027 bislang nicht angekündigt. Umbauten siehst du vor allem an den Ständen von Händlern und Werkstätten. Wer gezielt Builder und Custom-Wettbewerbe sucht, findet sie im Januar auf der Motor Bike Expo in Verona und beim Best Bike Award der Motorradwelt Bodensee.',
        ],
      },
      {
        heading: 'Anreise',
        paragraphs: [
          'Das Messegelände liegt im Osten Münchens in Riem. Mit der U-Bahn-Linie U2 fährst du bis Messestadt West oder Messestadt Ost, mit dem Auto über die A94. Welche Hallen und Eingänge geöffnet sind, gibt der Veranstalter vor der Messe bekannt.',
        ],
      },
    ],
    facts: {
      edition: '2027-02-12',
      items: [
        { label: 'Ort', value: 'Messegelände München-Riem' },
        { label: 'Aussteller', value: 'über 250 (laut Veranstalter)' },
        { label: 'U-Bahn', value: 'U2, Messestadt West oder Ost' },
        { label: 'Tickets', value: 'Preise noch nicht veröffentlicht' },
      ],
    },
    faq: [
      {
        q: 'Was kostet der Eintritt zur IMOT 2027?',
        a: 'Die Ticketpreise für 2027 hat der Veranstalter noch nicht veröffentlicht (Stand November 2026). Tickets gibt es über imot.de.',
        edition: '2027-02-12',
      },
      {
        q: 'Gibt es auf der IMOT Custom Bikes?',
        a: 'Einen eigenen Custom-Wettbewerb hat die IMOT für 2027 nicht angekündigt, Umbauten zeigen vor allem Händler und Werkstätten an ihren Ständen. Custom-Wettbewerbe gibt es im Januar auf der Motor Bike Expo in Verona und auf der Motorradwelt Bodensee.',
      },
      {
        q: 'Wie komme ich mit öffentlichen Verkehrsmitteln zur IMOT?',
        a: 'Mit der U-Bahn-Linie U2 bis Messestadt West oder Messestadt Ost, je nachdem, welcher Eingang geöffnet ist.',
      },
    ],
    links: [
      { href: '/custom-werkstatt/muenchen', label: 'Custom Werkstätten in München' },
      { href: '/magazine/bmw-cafe-racer-umbau-werkstaetten', label: 'BMW Cafe Racer: Umbau-Werkstätten' },
      { href: '/marken/bmw', label: 'BMW Custom Bikes' },
    ],
  },

  'hamburger-motorradtage': {
    nameInText: 'die Hamburger Motorrad Tage',
    sections: [
      {
        heading: 'Was sind die Hamburger Motorrad Tage?',
        paragraphs: [
          'Die Hamburger Motorrad Tage, kurz HMT, gelten als größte Motorradmesse Norddeutschlands. Ende Februar zeigen Hersteller in den Hamburger Messehallen ihre Neuheiten für die Saison, dazu kommen Zubehör, Bekleidung und Helme sowie Motorradreisen, geführte Touren und Bikerhotels. 2026 waren es über 450 Aussteller. Veranstalter ist die DiCoN aus Altenholz bei Kiel.',
        ],
      },
      {
        heading: 'Customshow, Clubmeile und Stunts',
        paragraphs: [
          'Für Custom-Fans lohnt sich der Customshow-Bereich, in dem die Individualisten der Szene ihre Umbauten zeigen. Auf der Clubmeile stellen sich Motorradclubs vor. In Halle B5 läuft ein Fahr- und Stuntprogramm, 2026 waren es drei Freestyle-Motocross-Shows am Tag. Zwischendurch gibt es Biergarten-Gastronomie in den Hallen.',
        ],
      },
      {
        heading: 'Hamburger Tattoo Tage inklusive',
        paragraphs: [
          'Parallel finden in Halle B1 die Hamburger Tattoo Tage mit über 200 Tätowierern statt. Das Ticket der Motorrad Tage gilt für beide Messen.',
        ],
      },
      {
        heading: 'Anreise',
        paragraphs: [
          'Die Messehallen liegen mitten in der Stadt, Messeplatz 1, 20357 Hamburg. Mit der Bahn fährst du bis Dammtor (Fernverkehr und S-Bahn), mit der U2 bis Messehallen oder mit der U1 bis Stephansplatz.',
        ],
      },
    ],
    facts: {
      edition: '2027-02-26',
      items: [
        { label: 'Ort', value: 'Hamburg Messe, Messeplatz 1' },
        { label: 'Bahn', value: 'Dammtor, U2 Messehallen, U1 Stephansplatz' },
        { label: 'Ticket', value: 'gilt auch für die Hamburger Tattoo Tage' },
        { label: 'Custom', value: 'eigener Customshow-Bereich' },
      ],
    },
    faq: [
      {
        q: 'Gibt es auf den Hamburger Motorrad Tagen Custom Bikes?',
        a: 'Ja, im Customshow-Bereich zeigen die Individualisten der Szene ihre Umbauten. Dazu kommen die Clubmeile und ein Stuntprogramm in Halle B5.',
      },
      {
        q: 'Gilt das Ticket auch für die Hamburger Tattoo Tage?',
        a: 'Ja. Die Tattoo Tage laufen parallel in Halle B1, das Ticket gilt für beide Messen.',
        edition: '2027-02-26',
      },
      {
        q: 'Wie komme ich zu den Hamburger Motorrad Tagen?',
        a: 'Am besten mit Bahn oder U-Bahn: bis Dammtor, mit der U2 bis Messehallen oder mit der U1 bis Stephansplatz. Die Adresse ist Messeplatz 1, 20357 Hamburg.',
      },
    ],
    links: [
      { href: '/custom-werkstatt/hamburg', label: 'Custom Werkstätten in Hamburg' },
      { href: '/bikes/bobber', label: 'Bobber Custom Bikes entdecken' },
      { href: '/magazine/bobber-kaufen-guide', label: 'Bobber kaufen: der Guide' },
    ],
    imageCredit: {
      image: `${STORAGE}/hamburger-motorradtage.jpg`,
      author: 'San Andreas',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
      source: 'https://commons.wikimedia.org/wiki/File:BMW_R_nineT_-_Hamburger_Motorradtage_2014.jpg',
    },
  },

  'motorraeder-dortmund': {
    nameInText: 'die Motorräder Dortmund',
    sections: [
      {
        heading: 'Was ist die Motorräder Dortmund?',
        paragraphs: [
          'Die MOTORRÄDER Dortmund gehört seit Jahrzehnten zu den wichtigsten Motorradmessen zum Saisonstart. Vier Tage lang, von Donnerstag bis Sonntag, zeigen Hersteller, Händler, Zubehöranbieter, Bekleidungsmarken und Customizer in fünf Hallen der Messe Dortmund ihre Neuheiten. Dazu kommen Reiseangebote und Clubs. Erwartet werden zehntausende Besucher.',
        ],
      },
      {
        heading: 'Probefahrten und Programm',
        paragraphs: [
          'Das Highlight sind die Probefahrten in der Test & Ride Area, wo du aktuelle Modelle direkt vor Ort fahren kannst. Dazu kommen Shows und Vorträge. 2026 gab es außerdem:',
        ],
        list: [
          'Eine Racing Area: auf echten Motorrädern durch eine virtuelle Rennwelt',
          'Einen Kids-Parcours mit Elektro-Balance-Bikes für Kinder ab sechs Jahren',
          'Eine Aftershow-Party von Rock Antenne, mit eigenen Tickets',
        ],
      },
      {
        heading: 'Custom Bikes in Dortmund',
        paragraphs: [
          'Customizer gehören zu den Ausstellern, und viele Stände zeigen individuelles Customizing und Zubehör für den eigenen Umbau. Einen eigenen Custom-Wettbewerb hat die Messe für 2027 bislang nicht angekündigt.',
        ],
      },
      {
        heading: 'Anreise und Parken',
        paragraphs: [
          'Die Adresse: Messe Dortmund, Rheinlanddamm 200, 44139 Dortmund. Mit der U-Bahn U45 erreichst du die Haltestelle Westfalenhallen in rund zehn Minuten vom Hauptbahnhof, die U46 braucht etwa fünf Minuten. Autos parken auf den Parkplätzen rund um die Messe, wer mit dem Motorrad kommt, parkt kostenlos auf Parkplatz A3. Hunde dürfen nicht in die Hallen, Assistenzhunde mit Nachweis schon.',
        ],
      },
    ],
    facts: {
      edition: '2027-03-04',
      items: [
        { label: 'Ort', value: 'Messe Dortmund, Rheinlanddamm 200' },
        { label: 'Öffnungszeiten', value: 'Do–Sa 9–18 Uhr, So 9–17 Uhr' },
        { label: 'Motorrad-Parkplatz', value: 'A3, kostenlos' },
        { label: 'U-Bahn', value: 'U45 oder U46 bis Westfalenhallen' },
        { label: 'Tickets', value: 'Preise noch nicht veröffentlicht' },
      ],
    },
    faq: [
      {
        q: 'Wann hat die Motorräder Dortmund 2027 geöffnet?',
        a: 'Donnerstag bis Samstag von 9 bis 18 Uhr, am Sonntag von 9 bis 17 Uhr.',
        edition: '2027-03-04',
      },
      {
        q: 'Kann man auf der Motorräder Dortmund Probe fahren?',
        a: 'Ja, in der Test & Ride Area kannst du aktuelle Modelle direkt auf der Messe fahren.',
      },
      {
        q: 'Wo parke ich mit dem Motorrad?',
        a: 'Motorräder parken kostenlos auf Parkplatz A3 an der Messe Dortmund.',
      },
      {
        q: 'Dürfen Hunde mit auf die Messe?',
        a: 'Nein, Hunde haben keinen Zutritt zu den Messehallen. Ausgebildete Assistenzhunde sind erlaubt, wenn der Halter einen Nachweis dabei hat.',
      },
    ],
    links: [
      { href: '/custom-werkstatt/koeln', label: 'Custom Werkstätten in Köln' },
      { href: '/magazine/motorrad-umbau-werkstatt-finden', label: 'Die richtige Umbau-Werkstatt finden' },
      { href: '/magazine/motorrad-umbau-kosten', label: 'Was kostet ein Motorrad-Umbau?' },
    ],
  },

  'custom-nationals': {
    nameInText: 'die Custom Nationals',
    sections: [
      {
        heading: 'Was sind die Custom Nationals?',
        paragraphs: [
          'Die Custom Nationals sind ein Treffen für Custom- und Classic-Motorräder, US-Cars, Hot Rods und Muscle Cars am Eventzentrum Strohofer in Geiselwind, direkt an der A3 zwischen Würzburg und Nürnberg. Zwei Tage lang gibt es eine Bike-Show in der Eventhalle, eine US-Car-Show auf dem Freigelände, eine Händlermeile, Foodtrucks und abends Livemusik. Das Motto: Bikes, US-Cars & Rock ’n’ Roll. Der Szenetreff in Geiselwind hat über 25 Jahre Tradition.',
        ],
      },
      {
        heading: 'Die Bike-Show: 16 Klassen',
        paragraphs: [
          'Die Bike-Show ist der Kern der Veranstaltung. Moderiert wird sie von Frank Sander, eine Jury bewertet am Samstag, die Pokale gibt es am Samstagnachmittag und -abend. 2026 saßen 15 Juroren in der Jury. Die Klassen reichen vom Roller bis zum radikalen Eigenbau:',
        ],
        list: [
          'Scooter & Junior Bikes bis 125 ccm',
          'Ratbike, Classic/Vintage (Originale bis 1990) und Custom Classic/Vintage',
          'Café Racer, Streetfighter, Custom Streetbikes und Custom Sportbikes',
          'Clubstyle, Custom Touring und Custom Metric Cruiser',
          'US Bikes bis 1.250 ccm und über 1.250 ccm',
          'Custom, Radical Custom und Custom 3-Wheel',
        ],
      },
      {
        heading: 'US-Car-Show und Livemusik',
        paragraphs: [
          'Draußen läuft die US-Car-Show mit zwölf Klassen, moderiert von Otto Meyer-Spelbrink. Die Fahrzeuge werden am Freitag und Samstag auf der Bühne vorgestellt. Abends spielen Bands aus Rock ’n’ Roll und Classic Rock.',
        ],
      },
      {
        heading: 'Anreise und Camping',
        paragraphs: [
          'Die Adresse: Eventzentrum Strohofer, Scheinfelder Straße 23, 96160 Geiselwind, A3 Ausfahrt 76. Wer Zeit hat, fährt eine Ausfahrt früher ab: Aus Richtung Nürnberg geht es ab Schlüsselfeld rund 20 Kilometer durch den Steigerwald, aus Richtung Würzburg ab Wiesentheid rund 15 Kilometer.',
          'Gezeltet wird direkt am Gelände, Camping-Tickets gibt es nur online. Anreisen kannst du erst ab Freitag. Duschen gibt es auf dem Gelände und rund um die Uhr im Autohof nebenan.',
        ],
      },
    ],
    facts: {
      edition: '2027-08-06',
      items: [
        { label: 'Ort', value: 'Eventzentrum Strohofer, Geiselwind' },
        { label: 'Anfahrt', value: 'A3, Ausfahrt 76 Geiselwind' },
        { label: 'Early Bird', value: '24 € zzgl. Vorverkaufsgebühr' },
        { label: 'Kinder', value: 'bis 13 Jahre frei in Begleitung' },
        { label: 'Bike-Show', value: '16 Klassen, Jury am Samstag' },
      ],
    },
    faq: [
      {
        q: 'Was kostet ein Ticket für die Custom Nationals 2027?',
        a: 'Aktuell gibt es limitierte Early-Bird-Tickets für 24 Euro zuzüglich Vorverkaufsgebühr, online als E-Ticket. Kinder bis einschließlich 13 Jahre haben in Begleitung eines Erziehungsberechtigten freien Eintritt. Ermäßigte Tickets für 14- und 15-Jährige gibt es nur an der Tageskasse.',
        edition: '2027-08-06',
      },
      {
        q: 'Kann ich mein Motorrad bei der Bike-Show anmelden?',
        a: 'Ja, Firmen und Privatleute bewerben sich über ein Formular auf custom-nationals.de, mit bis zu vier Fotos des Bikes. Die Zahl der Plätze ist begrenzt, der Veranstalter meldet sich nach der Auswahl.',
      },
      {
        q: 'Gibt es bei den Custom Nationals einen Campingplatz?',
        a: 'Ja, direkt am Eventzentrum. Camping-Tickets werden nur online verkauft, die Anreise ist ab Freitag möglich. Duschen gibt es auf dem Gelände und rund um die Uhr im Autohof Strohofer.',
      },
    ],
    links: [
      { href: '/bikes/chopper', label: 'Chopper Custom Bikes entdecken' },
      { href: '/magazine/harley-custom-werkstatt-finden', label: 'Harley Custom Werkstatt finden' },
      { href: '/marken/harley-davidson', label: 'Harley-Davidson Custom Bikes' },
    ],
  },

  'european-bike-week': {
    nameInText: 'die European Bike Week',
    sections: [
      {
        heading: 'Was ist die European Bike Week?',
        paragraphs: [
          'Jedes Jahr in der ersten vollen Septemberwoche wird die Region Villach – Faaker See – Ossiacher See in Kärnten zum Treffpunkt der Harley-Szene. Die European Bike Week gilt als eines der bekanntesten Motorradtreffen der Welt, wird von Harley-Davidson präsentiert und zieht laut Veranstalter jedes Jahr Hunderttausende Motorradfans an den Faaker See, längst nicht nur auf Harleys. 2027 findet sie zum 29. Mal statt. Der Eintritt ist frei.',
        ],
      },
      {
        heading: 'Die Treffpunkte rund um den See',
        paragraphs: ['Die Bike Week verteilt sich auf mehrere Orte und Angebote:'],
        list: [
          'Harley-Village, das Zentrum der Veranstaltung',
          'Arneitz Village mit Biker-Markt, Livemusik und Custom-Bike-Areal',
          'Carinthian Corner',
          'Kostenlose Probefahrten mit aktuellen Harley-Davidson-Modellen',
          'Geführte Touren mit Harry’s Biketours über Kärntens Panoramastraßen und Alpenpässe',
        ],
      },
      {
        heading: 'Die Harley-Parade',
        paragraphs: [
          'Den traditionellen Höhepunkt bildet am Samstag Europas größte Harley-Parade. Das genaue Programm für 2027 veröffentlicht der Veranstalter ab Ende August auf bikeweek.at.',
        ],
      },
      {
        heading: 'Unterkunft und Anreise',
        paragraphs: [
          'Die Woche ist in der Region sehr gefragt, früh buchen lohnt sich. Wer bei teilnehmenden Gastgebern übernachtet, bekommt ab der ersten Nacht die Gästekarte „Erlebnis CARD“. Während der Bike Week ist sie das kostenlose Ticket für die geführten Ausfahrten mit Harry’s Biketours.',
          'Aus Deutschland fährst du über die Tauernautobahn A10 bis Villach, der Faaker See liegt wenige Kilometer östlich. Denk an die Vignette: Auch Motorräder brauchen sie auf Österreichs Autobahnen.',
        ],
      },
    ],
    facts: {
      edition: '2027-09-07',
      items: [
        { label: 'Ort', value: 'Faaker See, Region Villach, Kärnten' },
        { label: 'Eintritt', value: 'frei' },
        { label: 'Harley-Parade', value: 'Samstag, 11. September 2027' },
        { label: 'Probefahrten', value: 'kostenlos, aktuelle Harley-Davidson-Modelle' },
        { label: 'Ausgabe', value: '29. European Bike Week' },
      ],
    },
    faq: [
      {
        q: 'Kostet die European Bike Week Eintritt?',
        a: 'Nein. Die European Bike Week ist kostenlos und für alle zugänglich.',
      },
      {
        q: 'Wann ist die Harley-Parade?',
        a: 'Traditionell am Samstag der Bike Week, 2027 also am 11. September.',
        edition: '2027-09-07',
      },
      {
        q: 'Wann ist die European Bike Week 2028?',
        a: 'Vom 5. bis 10. September 2028. 2029 folgt sie vom 4. bis 9. September, ab 2030 immer in der ersten vollen Septemberwoche.',
      },
      {
        q: 'Muss ich mit einer Harley kommen?',
        a: 'Nein. Harley-Davidson präsentiert das Treffen, willkommen sind aber Motorradfans aller Marken und Stile.',
      },
    ],
    links: [
      { href: '/marken/harley-davidson', label: 'Harley-Davidson Custom Bikes' },
      { href: '/bikes/chopper', label: 'Chopper Custom Bikes entdecken' },
      { href: '/custom-werkstatt/wien', label: 'Custom Werkstätten in Wien' },
    ],
    imageCredit: {
      image: `${STORAGE}/european-bike-week.jpg`,
      author: 'Greta Ceresini',
      license: 'CC BY 2.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
      source: 'https://commons.wikimedia.org/wiki/File:European_Bike_Week_2014,_Faaker_See_(15266519751).jpg',
    },
  },

  'veterama-mannheim': {
    nameInText: 'die Veterama',
    sections: [
      {
        heading: 'Was ist die Veterama?',
        paragraphs: [
          'Seit 1975 treffen sich auf der Veterama Sammler, Händler und Schrauber. Die Herbstausgabe auf dem Maimarktgelände in Mannheim gilt als Europas größter Oldtimer- und Teilemarkt: Rund 4.000 Anbieter verkaufen auf etwa 260.000 Quadratmetern Ersatzteile, komplette Fahrzeuge, Werkzeug und Literatur für Autos und Motorräder. Im Frühjahr gibt es eine zweite Veterama am Hockenheimring.',
        ],
      },
      {
        heading: 'Warum die Veterama für Custom-Bauer interessant ist',
        paragraphs: [
          'Wer einen Cafe Racer, Scrambler oder Bobber auf Basis eines älteren Motorrads aufbaut, sucht oft Teile, die es neu nicht mehr gibt: Tanks, Schutzbleche, Vergaser, Instrumente, Lampen oder ganze Motoren. Auf kaum einem anderen Markt ist die Auswahl so groß. Neben Teilen werden auch komplette Fahrzeuge angeboten.',
        ],
      },
      {
        heading: 'Ablauf an den drei Tagen',
        paragraphs: [],
        list: [
          'Freitag 12–20 Uhr: nur mit Early-Bird- oder Premium-Ticket, in ruhigerer Atmosphäre',
          'Samstag 8:30–18 Uhr',
          'Sonntag 8:30–16 Uhr',
        ],
      },
      {
        heading: 'Große Teile abholen',
        paragraphs: [
          'Für sperrige Teile darfst du mit dem Auto aufs Gelände: Am Tor zeigst du deine Besucherkarte, hinterlegst 100 Euro Kaution und bekommst einen Zufahrtsschein. Innerhalb von 60 Minuten lädst du ein und fährst wieder raus, dann gibt es die Kaution vollständig zurück.',
        ],
      },
      {
        heading: 'Anreise und Parken',
        paragraphs: [
          'Das Maimarktgelände liegt an der Xaver-Fuhr-Straße, 68163 Mannheim. Über die A6 nimmst du die Ausfahrt Mannheim-City, über die A5 die Ausfahrt Mannheim-Sandhofen. Vom Hauptbahnhof fährt die Straßenbahnlinie 6 in rund 15 Minuten zum Maimarktgelände.',
          'Motorräder parken kostenlos. Autos zahlen 10 Euro pro Tag, am Freitag 15 Euro, ein Parkticket für alle drei Tage kostet 25 Euro. Wohnmobile stehen für 40 Euro auf eigenen Flächen, einen Campingplatz mit Strom gibt es nicht. Toiletten und Duschen sind auf dem Gelände.',
        ],
      },
    ],
    facts: {
      edition: '2027-10-08',
      items: [
        { label: 'Ort', value: 'Maimarktgelände, Xaver-Fuhr-Straße, Mannheim' },
        { label: 'Öffnungszeiten', value: 'Fr 12–20 Uhr (Early Bird/Premium), Sa 8:30–18 Uhr, So 8:30–16 Uhr' },
        { label: 'Tickets', value: 'Sa oder So 15 €, Sa+So 25 €, Fr–So 40 €, zzgl. 2,50 € Gebühr' },
        { label: 'Kinder', value: 'bis 14 Jahre frei' },
        { label: 'Motorräder', value: 'parken kostenlos' },
      ],
    },
    faq: [
      {
        q: 'Was kostet der Eintritt zur Veterama Mannheim 2027?',
        a: 'Ein Tagesticket für Samstag oder Sonntag kostet 15 Euro, das Kombiticket für beide Tage 25 Euro. Mit dem Early-Bird-Ticket für 30 Euro kommst du schon am Freitag rein, das Premium-Ticket für alle drei Tage kostet 40 Euro. Dazu kommen jeweils 2,50 Euro Systemgebühr. Kinder bis 14 Jahre haben freien Eintritt, Schüler und Studenten erhalten eine Ermäßigung.',
        edition: '2027-10-08',
      },
      {
        q: 'Wie bekomme ich große Teile zum Auto?',
        a: 'Mit einem Zufahrtsschein: Am Tor 100 Euro Kaution hinterlegen, innerhalb von 60 Minuten am Stand laden und das Gelände wieder verlassen. Bei pünktlicher Ausfahrt gibt es die Kaution vollständig zurück.',
      },
      {
        q: 'Kann ich auf der Veterama mit dem Wohnmobil übernachten?',
        a: 'Ja, Wohnmobile parken für 40 Euro auf ausgewiesenen Flächen. Einen Campingplatz mit Strom gibt es nicht, Toiletten und Duschen sind auf dem Gelände.',
      },
    ],
    links: [
      { href: '/magazine/cafe-racer-selber-bauen-basis-bikes', label: 'Basis-Bikes für den Cafe-Racer-Umbau' },
      { href: '/magazine/cafe-racer-umbau', label: 'Cafe Racer Umbau: Anleitung in 8 Schritten' },
      { href: '/custom-werkstatt/frankfurt', label: 'Custom Werkstätten in Frankfurt' },
    ],
    imageCredit: {
      image: `${STORAGE}/veterama-mannheim.jpg`,
      author: 'Rolf Kickuth',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      source: 'https://commons.wikimedia.org/wiki/File:MannheimMaimarktVeterama2018-10-12-12-25-21.jpg',
    },
  },

  'distinguished-gentlemans-ride': {
    nameInText: 'der Distinguished Gentleman’s Ride',
    hideMap: true,
    sections: [
      {
        heading: 'Was ist der Distinguished Gentleman’s Ride?',
        paragraphs: [
          'Der Distinguished Gentleman’s Ride, kurz DGR, bringt Motorradfahrer auf klassischen und klassisch gestylten Motorrädern weltweit an einem Tag auf die Straße. Gefahren wird in feiner Kleidung und für einen guten Zweck: Die Spenden gehen an Movember, den offiziellen Charity-Partner, und fließen in die Prostatakrebsforschung und in Programme für die psychische Gesundheit von Männern.',
          'Gegründet hat den Ride Mark Hawwa 2012 in Sydney. Die Idee kam ihm durch ein Foto von Don Draper aus der Serie Mad Men, im feinen Anzug auf einem klassischen Motorrad.',
        ],
      },
      {
        heading: 'Der DGR 2026 in Zahlen',
        paragraphs: [
          'Zur 15. Ausgabe am 17. Mai 2026 fuhren über 123.000 Teilnehmer in 1.071 Städten und 109 Ländern. Zusammen sammelten sie 7,53 Millionen US-Dollar. Seit 2012 sind über 66 Millionen US-Dollar für Männergesundheit zusammengekommen. Offizieller Motorrad-Partner ist seit 13 Jahren Triumph.',
        ],
      },
      {
        heading: 'Welche Motorräder passen?',
        paragraphs: [
          'Der Ride ist für klassische und Vintage-Motorräder gedacht. Typisch sind Cafe Racer, Bobber, Scrambler, Brat-Style-Bikes, Classics und Oldtimer, aber auch neue Motorräder im Retro-Stil. Wichtiger als das Baujahr ist der Stil, von Fahrer und Maschine.',
        ],
      },
      {
        heading: 'So machst du mit',
        paragraphs: [],
        list: [
          'Registriere dich auf gentlemansride.com und such dir einen Ride in deiner Stadt. In Deutschland gibt es unter anderem Rides in Berlin, Hamburg, München, Köln, Frankfurt und Stuttgart.',
          'Sammle Spenden im Freundes- und Kollegenkreis über deine Spendenseite.',
          'Zieh dich passend an: Anzug, Weste, Tweed, Hemd mit Krawatte oder Fliege.',
          'Fahr mit Stil und guten Manieren, es geht nicht ums Tempo.',
        ],
      },
    ],
    faq: [
      {
        q: 'Wann ist der Distinguished Gentleman’s Ride 2027?',
        a: 'Den offiziellen Termin für 2027 hat der Veranstalter noch nicht bekanntgegeben (Stand November 2026). Der Ride findet traditionell an einem Sonntag im Mai statt, zuletzt am 17. Mai 2026.',
      },
      {
        q: 'Muss man beim Distinguished Gentleman’s Ride einen Anzug tragen?',
        a: 'Der Stil gehört dazu: Erwartet wird ein elegantes Outfit, etwa Anzug, Tweed, Weste oder Fliege, dazu ein klassisches oder klassisch gestyltes Motorrad.',
      },
      {
        q: 'Wofür werden beim DGR Spenden gesammelt?',
        a: 'Für Männergesundheit. Die Spenden gehen an Movember und finanzieren Programme zur Früherkennung von Prostatakrebs, zur psychischen Gesundheit und zur Suizidprävention bei Männern.',
      },
      {
        q: 'In welchen deutschen Städten gibt es einen Ride?',
        a: 'In vielen, darunter Berlin, Hamburg, München, Köln, Frankfurt und Stuttgart. Alle Rides in deiner Nähe findest du nach der Registrierung auf gentlemansride.com.',
      },
    ],
    links: [
      { href: '/bikes/cafe-racer', label: 'Cafe Racer Custom Bikes entdecken' },
      { href: '/magazine/beste-cafe-racer-modelle', label: 'Die besten Cafe Racer ab Werk' },
      { href: '/marken/triumph', label: 'Triumph Custom Bikes' },
    ],
    imageCredit: {
      image: `${STORAGE}/distinguished-gentlemans-ride.jpg`,
      author: 'Miomir Magdevski',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      source: 'https://commons.wikimedia.org/wiki/File:Distinguished_Gentleman%27s_Ride_in_Belgrade_2024_15.jpg',
    },
  },
}

/**
 * Groups for the SEO overview on /events (German). Events not listed here fall
 * into "Weitere Events", so a new row never disappears from the overview.
 */
export const EVENT_HUB_GROUPS: { heading: string; intro: string; slugs: string[] }[] = [
  {
    heading: 'Motorradmessen',
    intro: 'Von Januar bis März zeigen die Hersteller auf den Messen ihre Neuheiten für die Saison, Händler und Builder ihre Umbauten. Im November schließt die Custombike-Show das Jahr ab.',
    slugs: ['motor-bike-expo', 'motorradwelt-bodensee', 'imot', 'intermot', 'hamburger-motorradtage', 'motorraeder-dortmund', 'custombike-show'],
  },
  {
    heading: 'Treffen, Festivals und Rides',
    intro: 'Im Sommer trifft sich die Szene draußen: bei Sprints und Festivals, auf Bike-Shows unter freiem Himmel und bei Charity-Ausfahrten in feinem Zwirn.',
    slugs: ['distinguished-gentlemans-ride', 'wheels-and-waves', 'custom-nationals', 'glemseck-101', 'european-bike-week', 'eindhoven-motor-show'],
  },
  {
    heading: 'Teilemärkte',
    intro: 'Wer ein altes Motorrad umbaut, findet auf Teilemärkten, was es neu nicht mehr gibt.',
    slugs: ['veterama-mannheim'],
  },
]

export const EVENT_HUB_FAQ_STATIC: { q: string; a: string }[] = [
  {
    q: 'Welche Events lohnen sich für Cafe-Racer- und Custom-Fans?',
    a: 'Für Cafe Racer ist das Glemseck 101 bei Leonberg der wichtigste Termin, mit Sprints über die Achtelmeile und freiem Eintritt. Die größten Custom-Messen sind die Motor Bike Expo in Verona im Januar und die Custombike-Show in Bad Salzuflen Ende November. Im Sommer treffen sich Builder bei Wheels & Waves in Biarritz und bei den Custom Nationals in Geiselwind. Wer klassisch unterwegs ist, fährt im Mai beim Distinguished Gentleman’s Ride mit.',
  },
  {
    q: 'Bei welchen Motorrad-Events ist der Eintritt frei?',
    a: 'Beim Glemseck 101 und bei der European Bike Week am Faaker See zahlst du keinen Eintritt. Für eine Tageskarte auf den großen Messen zahlst du meist um die 20 Euro, die genauen Preise stehen auf der jeweiligen Event-Seite.',
  },
]
