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

export type EventContent = {
  /** Name with article for running text, e.g. "die Custombike-Show" */
  nameInText: string
  sections: { heading: string; paragraphs: string[]; list?: string[] }[]
  facts?: { edition: string; items: { label: string; value: string }[] }
  faq?: { q: string; a: string; edition?: string }[]
  links?: { href: string; label: string }[]
}

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
}
