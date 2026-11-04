export type ArticleSection =
  | { type: 'intro'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'image'; src: string; caption?: string }
  | { type: 'list'; items: string[] }
  | { type: 'cta'; text: string; href: string; label: string }

export type Article = {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  category: 'build-story' | 'interview' | 'guide'
  categoryLabel: string
  excerpt: string
  coverImage: string
  /** Shown on the hero — required for licensed photos, e.g. CC BY-SA from Wikimedia Commons */
  coverCredit?: { author: string; href?: string; license?: string; licenseUrl?: string }
  publishedAt: string
  updatedAt?: string
  readTime: string
  author: string
  tags: string[]
  relatedSlugs?: string[]
  relatedBuilderSlug?: string
  relatedBuildSlug?: string
  faq?: { q: string; a: string }[]
  content: ArticleSection[]
}

export const ARTICLES: Article[] = [
  {
    slug: 'eicma-2026-retro-neuheiten',
    title: 'EICMA 2026: Die Retro-Neuheiten für 2027 — Cafe Racer, Classics und Factory Customs',
    metaTitle: 'EICMA 2026: Retro-Neuheiten 2027 — Cafe Racer & Classics',
    metaDescription:
      'Continental GT 750, Bonneville T40, Speed Twin 1200 TFC: alle Retro-Neuheiten der EICMA 2026 mit Daten, Preisen, Marktstart und Custom-Potenzial.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Ein neuer großer Cafe Racer von Royal Enfield, eine 400er-Bonneville für den A2-Schein und Factory Customs in Kleinserie: Das sind die Retro-Neuheiten der EICMA 2026.',
    coverImage:
      'https://ikhgfynzghfhnviwvupo.supabase.co/storage/v1/object/public/builder-media/magazine/eicma-2026-continental-gt-750.jpg',
    coverCredit: {
      author: '802xr / Wikimedia Commons',
      href: 'https://commons.wikimedia.org/wiki/File:Royal_Enfield_Continental_GT_750.jpg',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    },
    publishedAt: '2026-11-04',
    readTime: '8 min',
    author: 'MotoDigital Redaktion',
    tags: ['EICMA', 'EICMA 2026', 'Neuheiten 2027', 'Cafe Racer', 'Retro', 'Royal Enfield', 'Triumph', 'A2'],
    relatedSlugs: ['cafe-racer-kaufen-guide', 'cafe-racer-umbau', 'cafe-racer-selber-bauen-basis-bikes'],
    relatedBuilderSlug: 'classicbike-raisch',
    relatedBuildSlug: 'thruxton-rs-darth-vader',
    faq: [
      { q: 'Wann findet die EICMA 2026 statt?', a: 'Die EICMA 2026 läuft auf dem Messegelände Fiera Milano Rho bei Mailand. Der 3. und 4. November sind Presse- und Fachbesuchertage, für das Publikum ist die Messe vom 5. bis 8. November 2026 geöffnet, jeweils von 9:30 bis 18:30 Uhr.' },
      { q: 'Welche Cafe Racer wurden auf der EICMA 2026 vorgestellt?', a: 'Der wichtigste neue Cafe Racer ist die Royal Enfield Continental GT 750 mit 743-cm³-Zweizylinder, die es mit und ohne Halbverkleidung geben wird. Dazu zeigt Triumph die Speed Twin 1200 TFC, eine auf 750 Exemplare limitierte Factory-Custom-Version mit Öhlins-Fahrwerk und Carbon-Teilen.' },
      { q: 'Was kostet die Royal Enfield Continental GT 750?', a: 'Einen Preis und den Marktstart hat Royal Enfield noch nicht genannt. Zur Einordnung: Die Himalayan 750 mit demselben Grundmotor kostet in Italien ab 7.390 Euro.' },
      { q: 'Welche Retro-Motorräder für den A2-Führerschein kommen 2027?', a: 'Neu sind die Triumph Bonneville T40 mit 400-cm³-Einzylinder und 32 PS sowie die Harley-Davidson Sprint 440 mit 27 PS, die in Deutschland ab 5.700 Euro kostet. Beide bleiben deutlich unter der A2-Grenze von 35 kW.' },
      { q: 'Wann kommt die Triumph Bonneville T40?', a: 'Laut Triumph steht die Bonneville T40 im Frühjahr 2027 bei den Händlern. Die Preise für T40 und T40 Black will Triumph Anfang 2027 bekannt geben.' },
    ],
    content: [
      {
        type: 'intro',
        text: 'Die EICMA in Mailand ist die wichtigste Motorradmesse des Jahres. Hier zeigen die Hersteller, was 2027 bei den Händlern steht. Für Fans von Cafe Racern, Classics und Custom Bikes hat die Ausgabe 2026 einiges zu bieten: einen neuen großen Cafe Racer von Royal Enfield, eine 400er-Bonneville für den A2-Führerschein und gleich mehrere Factory Customs in Kleinserie. Wir haben alle Retro-Neuheiten zusammengefasst, mit Technik, Preisen, Marktstart und der Frage, welches Modell als Umbau-Basis taugt. Stand: 4. November 2026, dem zweiten Pressetag.',
      },
      { type: 'h2', text: 'Die Retro-Neuheiten der EICMA 2026 auf einen Blick' },
      {
        type: 'list',
        items: [
          'Royal Enfield Continental GT 750: Cafe Racer mit 743-cm³-Twin, mit und ohne Verkleidung. Preis und Marktstart offen.',
          'Triumph Bonneville T40 und T40 Black: 400er-Classic für den A2-Führerschein, 32 PS, ab Frühjahr 2027.',
          'Triumph Speed Twin 1200 TFC: Factory Custom mit Öhlins, Brembo und Akrapovič, limitiert auf 750 Stück.',
          'Royal Enfield Shotgun 650 „Son of a Gun“: Sonderserie mit Deus Ex Machina, 100 Stück weltweit.',
          'Harley-Davidson Sprint 440: Cruiser im Classic-Look für A2, ab 5.700 Euro.',
          'Royal Enfield Flying Flea S6: elektrischer Scrambler im Retro-Look, Marktstart Sommer 2027.',
          'Ducati Scrambler Full Throttle: neue Heritage-Lackierung in Grün und Bronze für das Modelljahr 2027.',
          'Benda Vinster 700 und Vinster X 700: Vintage-Roadster und Scrambler mit V2-Motor.',
        ],
      },
      { type: 'h2', text: 'Royal Enfield Continental GT 750: der neue große Cafe Racer' },
      {
        type: 'p',
        text: 'Die Continental GT 750 ist die wichtigste Retro-Neuheit der Messe. Royal Enfield feiert in Mailand seinen 125. Geburtstag und stellt den neuen Cafe Racer über die bekannte Continental GT 650. Sie soll das stärkste Serienmotorrad der Marke werden. Der Motor ist eine stärkere Version des neuen 743-cm³-Parallel-Twins aus der Himalayan 750, die dort 63 Nm bei 5.000/min leistet. Leistung und Drehmoment der GT 750 hat Royal Enfield noch nicht genannt.',
      },
      {
        type: 'p',
        text: 'Es wird zwei Versionen geben. Die unverkleidete behält die klassische Continental-Silhouette mit rundem Scheinwerfer und Doppelauspuff. Die verkleidete bekommt eine Halbschale und einen tieferen Lenker für eine sportlichere Sitzposition. Beide rollen auf 18-Zoll-Rädern, vorn bremsen jetzt zwei Scheiben. Dazu kommen eine Telegabel, zwei Federbeine mit einstellbarer Vorspannung, eine Einzelsitzbank mit abnehmbarer Höckerabdeckung und ein Cockpit im Doppelrundinstrument-Look mit integriertem TFT. Die Farben heißen Red Line, TT Blue und Master Clean.',
      },
      {
        type: 'p',
        text: 'Preis und Marktstart sind noch offen. Zur Einordnung: Die Himalayan 750 mit demselben Grundmotor kostet in Italien ab 7.390 Euro.',
      },
      {
        type: 'p',
        text: 'Custom-Potenzial: hoch. Die Continental GT 650 gehört zu den beliebtesten Umbau-Basen der letzten Jahre, der Zubehörmarkt für sie ist groß. Ob 650er-Teile an die 750 passen, hat Royal Enfield nicht gesagt. Rechne damit, dass Zubehör mit Teilegutachten für das neue Modell erst einige Monate nach dem Marktstart verfügbar ist.',
      },
      { type: 'cta', text: 'Schon jetzt einen Cafe Racer umbauen? Anleitung, Kosten und TÜV-Checkliste', href: '/magazine/cafe-racer-umbau', label: 'Zum Umbau-Guide' },
      { type: 'h2', text: 'Triumph Bonneville T40: Bonneville-Look für den A2-Führerschein' },
      {
        type: 'p',
        text: 'Mit der Bonneville T40 holt Triumph seinen bekanntesten Klassiker in die 400er-Klasse. Der Einzylinder stammt aus der TR-Serie, die Triumph mit Bajaj entwickelt, und wurde für die T40 überarbeitet: 32 PS bei 7.000/min und 36 Nm bei 5.000/min. Das liegt deutlich unter der A2-Grenze. Fahrbereit wiegt sie 191 kg, die Sitzhöhe beträgt 790 mm, optional 770 mm.',
      },
      {
        type: 'p',
        text: 'Optisch orientiert sich die T40 an den Bonnevilles der 1960er-Jahre: Tropfentank mit handgezogenen Zierlinien, Speichenräder, runder LED-Scheinwerfer und Peashooter-Schalldämpfer. Die Technik ist modern: Kurven-ABS, abschaltbare Traktionskontrolle, Tempomat, fünf Fahrmodi und ein rundes 4-Zoll-TFT mit Navigation. Einen Hauptständer gibt es serienmäßig, das Serviceintervall beträgt 16.000 km. Die T40 Black kommt mit schwarz glänzenden Alufelgen, Mattlack und komplett schwarzen Details.',
      },
      {
        type: 'p',
        text: 'Marktstart ist im Frühjahr 2027, die Preise nennt Triumph Anfang 2027. Achtung, Verwechslungsgefahr: In Indien gibt es eine T40 mit 349 cm³ und anderen Daten. Die Zahlen hier gelten für die europäische Version.',
      },
      { type: 'h2', text: 'Factory Customs: Speed Twin 1200 TFC und Shotgun 650 „Son of a Gun“' },
      {
        type: 'p',
        text: 'Die Speed Twin 1200 TFC ist das fünfte Modell der Triumph-Factory-Custom-Reihe. Triumph hat sie im Juli vorgestellt, die ersten Auslieferungen sind für Oktober 2026 angekündigt. Es gibt 750 einzeln nummerierte Exemplare. Der 1.200-cm³-Bonneville-Twin leistet 105 PS und 112 Nm. Dazu kommen ein voll einstellbares Öhlins-Fahrwerk, Brembo-Stylema-Bremssättel, Carbon-Teile, Akrapovič-Titanschalldämpfer und eine Lackierung in Obsidian Gold. In die geschmiedete obere Gabelbrücke ist die Seriennummer gelasert.',
      },
      {
        type: 'p',
        text: 'Royal Enfield geht einen anderen Weg und hat sich mit Deus Ex Machina zusammengetan, einem der bekanntesten Namen der Custom-Szene. Die Shotgun 650 „Son of a Gun“ entsteht 2027 in 100 Exemplaren. Sie bekommt eine Lackierung in Dunkelrot, Creme und Gold, kontrastgedrehte Alufelgen, schwarz glänzende Motordeckel, eine braune Ledersitzbank und passende Griffe. Zu jedem Motorrad gehört eine Jacke aus der Kooperation. Einen Preis gibt es noch nicht.',
      },
      {
        type: 'p',
        text: 'Beide Modelle zeigen einen Trend: Die Hersteller holen sich den Custom-Look direkt ins Werk, mit Garantie und ohne Eintragungsfragen. Ein echtes Einzelstück sind sie trotzdem nicht. Wer ein Motorrad will, das es nur einmal gibt, kommt an einer Custom-Werkstatt nicht vorbei.',
      },
      { type: 'cta', text: 'Custom-Werkstätten für Cafe Racer, Bobber und Scrambler in deiner Nähe', href: '/custom-werkstatt', label: 'Werkstatt finden' },
      { type: 'h2', text: 'Harley-Davidson Sprint 440: Einstieg unter 6.000 Euro' },
      {
        type: 'p',
        text: 'Die Sprint 440 ist das neue Einstiegsmodell von Harley-Davidson. Sie basiert auf der X440-Plattform, die Harley mit Hero MotoCorp in Indien entwickelt hat. Der luft- und ölgekühlte Einzylinder mit 440 cm³ leistet 27 PS und 38 Nm bei 4.000/min. Das Design zitiert klassische Cruiser: Tropfentank, Fastback-Sitzbank und LED-Scheinwerfer mit H-D-Logo. Die Sitzhöhe ist mit 671 mm sehr niedrig, fahrbereit wiegt sie 189 kg. Dazu kommen eine 43-mm-Upside-down-Gabel, Federbeine mit Ausgleichsbehälter, eine leichtgängige Assist-Kupplung und ein 3,5-Zoll-TFT. In Deutschland kostet sie ab 5.700 Euro.',
      },
      {
        type: 'p',
        text: 'Custom-Potenzial: interessant. Ein einfacher luft- und ölgekühlter Einzylinder, ein niedriger Preis und eine tiefe Sitzposition sind gute Voraussetzungen für kleine Bobber-Umbauten.',
      },
      { type: 'cta', text: 'Was einen guten Bobber ausmacht und was er kosten darf', href: '/magazine/bobber-kaufen-guide', label: 'Zum Bobber-Guide' },
      { type: 'h2', text: 'Scrambler und Vintage: Flying Flea S6, Ducati Heritage und Benda Vinster' },
      {
        type: 'p',
        text: 'Die Flying Flea S6 ist ein elektrischer Scrambler von Royal Enfields Elektromarke. Sie nutzt das leichte Fahrwerk der Flying Flea C6 und setzt auf Retro-Details: Speichenräder aus Aluminium, Enduro-Sitzbank und ein Akkugehäuse aus Magnesium mit Kühlrippen. Dazu kommen Dual-Purpose-Reifen, mehr Federweg, sechs Fahrmodi, abschaltbares ABS und ein rundes 3,5-Zoll-Touchdisplay. Der Marktstart ist für Sommer 2027 geplant, die Farben heißen Dart Yellow und Lightning Grey. Akkukapazität, Leistung, Reichweite und Preis sind noch nicht bekannt.',
      },
      {
        type: 'p',
        text: 'Ducati zeigt keine neue Scrambler, verpasst aber der Scrambler Full Throttle für das Modelljahr 2027 eine Heritage-Lackierung. Grün und Bronze, auch auf den Felgen, zitieren die Rennmotorräder und Rennwagen der 1970er-Jahre.',
      },
      {
        type: 'image',
        src: 'https://ikhgfynzghfhnviwvupo.supabase.co/storage/v1/object/public/builder-media/magazine/eicma-2026-benda-vinster-x-700.jpg',
        caption: 'Die Benda Vinster X 700 auf der EICMA 2026. Foto: 802xr / Wikimedia Commons, CC BY-SA 4.0',
      },
      {
        type: 'p',
        text: 'Vom chinesischen Hersteller Benda kommt die Vinster 700: ein Vintage-Roadster mit 692-cm³-V2, 73 PS und 68 Nm, Einarmschwinge, 17-Zoll-Rädern und 190 kg. Die Scrambler-Variante Vinster X 700 rollt vorn auf einem 19-Zoll-Rad. Preise gibt es für beide noch nicht.',
      },
      {
        type: 'p',
        text: 'Kleinere Updates gibt es bei Yamaha, die die XSR900 in neuen Retro-Farben zeigt, und bei Fantic, die ihre Caballero-Familie um eine 500er-Supermoto erweitert.',
      },
      { type: 'cta', text: 'Scrambler kaufen: Modelle, Preise und Prüfpunkte', href: '/magazine/scrambler-kaufen-guide', label: 'Zum Scrambler-Guide' },
      { type: 'h2', text: 'Was fehlt: kein BMW R 20' },
      {
        type: 'p',
        text: 'Viele BMW-Fans hatten auf eine Serienversion des R 20 gehofft, des 2024 gezeigten Konzepts mit 2-Liter-Boxer. In Mailand fehlte sie. BMW zeigte stattdessen die limitierte M 1000 RS und die neue A2-Familie F 450 R und F 450 RR. Wer einen klassischen Boxer will, findet ihn bei den Modellen der R-12-Familie. Auf MotoDigital gibt es außerdem Umbauten auf Basis der R nineT und älterer R-Modelle wie R60, R65 und R100.',
      },
      { type: 'h2', text: 'Was die Neuheiten für Custom-Fans bedeuten' },
      {
        type: 'list',
        items: [
          'Die A2-Retro-Klasse wächst: Mit Bonneville T40 und Sprint 440 gibt es zwei weitere günstige Classics unter 35 kW. Für Einsteiger und für kleine Umbauten sind das spannende Basen.',
          'Der Cafe Racer ab Werk wird größer: Mit der Continental GT 750 bringt Royal Enfield erstmals einen Cafe Racer über 650 cm³.',
          'Factory Customs sind gefragt: Hersteller übernehmen Ideen aus der Custom-Szene, aber in Kleinserie. Ein Einzelstück nach eigenen Vorstellungen baut weiterhin nur eine Werkstatt.',
        ],
      },
      {
        type: 'p',
        text: 'Wer ein neues Retro-Modell kauft und es später individualisieren will, sollte früh auf Teile mit ABE oder Teilegutachten achten. Gerade bei ganz neuen Modellen dauert es oft Monate, bis Zubehör mit Papieren verfügbar ist. Was ohne Eintragung geht und was nicht, steht in unserem TÜV-Guide.',
      },
      { type: 'cta', text: 'TÜV-Eintragung beim Custom Bike: Was in Deutschland legal ist', href: '/magazine/tuev-eintragung-custom-bike', label: 'Zum TÜV-Guide' },
      { type: 'h2', text: 'EICMA 2026: Termine und Anreise' },
      {
        type: 'list',
        items: [
          'Ort: Fiera Milano Rho, am nordwestlichen Stadtrand von Mailand',
          'Presse- und Fachbesuchertage: 3. und 4. November 2026',
          'Publikumstage: 5. bis 8. November 2026, täglich 9:30 bis 18:30 Uhr',
          'Anreise: Metro-Linie M1 bis zur Station Rho Fiera',
        ],
      },
      {
        type: 'p',
        text: 'Wer es nicht nach Mailand schafft: Die nächsten großen Termine im deutschsprachigen Raum sind die Custombike-Show in Bad Salzuflen vom 27. bis 29. November 2026 und die INTERMOT in Köln vom 19. bis 21. Februar 2027.',
      },
      { type: 'cta', text: 'Motorradmessen und Custom-Events 2026 und 2027', href: '/events', label: 'Alle Events' },
    ],
  },

  {
    slug: 'cafe-racer-umbau',
    title: 'Cafe Racer Umbau: Anleitung in 8 Schritten — mit Kosten und TÜV-Checkliste',
    metaTitle: 'Cafe Racer Umbau — Anleitung, Kosten & TÜV in 8 Schritten',
    metaDescription:
      'Cafe Racer Umbau Schritt für Schritt: Basis, Heck, Stummellenker, Elektrik, Auspuff und TÜV-Eintragung — mit Kosten, Checkliste und typischen Fehlern.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Vom Serienmotorrad zum Cafe Racer: Wie ein Umbau in acht Schritten abläuft, was er kostet, welche Teile eingetragen werden müssen — und wann sich Kit oder Werkstatt lohnen.',
    coverImage:
      'https://ikhgfynzghfhnviwvupo.supabase.co/storage/v1/object/public/builder-media/magazine/cafe-racer-umbau-cover.jpg',
    publishedAt: '2026-11-02',
    readTime: '10 min',
    author: 'MotoDigital Redaktion',
    tags: ['Cafe Racer', 'Umbau', 'Motorrad Umbau', 'DIY', 'TÜV', 'Eintragung', 'Stummellenker', 'Höcker'],
    relatedSlugs: ['cafe-racer-selber-bauen-basis-bikes', 'tuev-eintragung-custom-bike', 'motorrad-umbau-kosten'],
    relatedBuilderSlug: 'kaffeemaschine',
    relatedBuildSlug: 'thruxton-rs-darth-vader',
    faq: [
      { q: 'Was kostet ein Cafe Racer Umbau?', a: 'Ein Teilumbau am eigenen Motorrad mit Lenker, Sitzbank, Beleuchtung und Auspuff kostet etwa 1.500 bis 4.000 Euro. Ein kompletter Selbstbau inklusive Basis-Bike liegt realistisch bei 5.000 bis 12.000 Euro. Lässt du komplett von einer Werkstatt bauen, sind meist 15.000 bis 30.000 Euro fällig. Für die Eintragung inklusive Gutachten solltest du zusätzlich 500 bis 1.500 Euro einplanen.' },
      { q: 'Muss ein Cafe Racer Umbau beim TÜV eingetragen werden?', a: 'Teile mit EG-Genehmigung oder ABE für dein Modell darfst du ohne Abnahme verbauen, wenn du die Auflagen einhältst. Teile mit Teilegutachten brauchen eine Änderungsabnahme. Rahmenänderungen wie ein gekürztes Heck und Teile ohne Papiere erfordern eine Einzelabnahme nach §21 StVZO. Wird aus dem Zweisitzer ein Einsitzer, muss außerdem die Sitzplatzzahl in den Fahrzeugpapieren geändert werden.' },
      { q: 'Wie lange dauert ein Cafe Racer Umbau?', a: 'Ein reiner Teileumbau ist an einigen Wochenenden machbar. Für einen kompletten Selbstbau neben dem Job sind 12 bis 24 Monate realistisch, inklusive Teilebeschaffung und Abnahme. Werkstätten mit Serienerfahrung schaffen einen Umbau oft in wenigen Wochen, Einzelstücke dauern mehrere Monate.' },
      { q: 'Lohnt sich ein Cafe Racer Umbau-Kit?', a: 'Für Einsteiger oft ja. Kits mit Heckrahmen, Höcker, Sitzbank und Haltern sind auf ein Modell abgestimmt, sparen Schweißarbeit und bringen im besten Fall ein Teilegutachten mit. Prüfe vor dem Kauf, ob dein Modell und Baujahr im Gutachten aufgeführt sind. Sonst wird die Abnahme deutlich aufwendiger.' },
      { q: 'Welches Motorrad eignet sich für einen Cafe Racer Umbau?', a: 'Bewährt sind luftgekühlte Klassiker mit Stahlrohrrahmen und guter Teileversorgung: Honda CB750 und CB500, Yamaha SR500 und XS650, BMW R80 und R100 oder Kawasaki Z650. Wer moderne Technik mit ABS und Einspritzung will, startet mit Triumph Bonneville, BMW R nineT oder Royal Enfield Continental GT.' },
      { q: 'Bekommt ein Cafe Racer ein H-Kennzeichen?', a: 'Das ist möglich, aber nicht garantiert. Das Motorrad muss mindestens 30 Jahre alt sein, und Änderungen müssen zeitgenössisch sein, also in den ersten Jahren nach der Erstzulassung so üblich gewesen sein. Moderne Teile wie LED-Rückleuchten oder Digitalinstrumente sprechen meist dagegen. Die Entscheidung trifft der Prüfer, deshalb solltest du das vor dem Umbau klären.' },
    ],
    content: [
      {
        type: 'intro',
        text: 'Stummellenker, Höcker, kurzes Heck — kaum ein Umbau ist so beliebt wie der Cafe Racer. Und kaum einer wird so oft unterschätzt. Wer einfach drauflos flext, steht am Ende mit einem Motorrad da, das gut aussieht, aber nicht durch den TÜV kommt. Dieser Leitfaden zeigt dir, wie ein Cafe Racer Umbau in acht Schritten abläuft: von der Planung über Rahmen, Cockpit und Elektrik bis zur Eintragung. Dazu gibt es realistische Kosten, eine TÜV-Checkliste und die Fehler, die bei Umbauten immer wieder passieren.',
      },
      { type: 'h2', text: 'Was macht einen Cafe Racer aus?' },
      {
        type: 'p',
        text: 'Der Stil entstand im London der 1950er-Jahre: Junge Rocker bauten ihre Serienmaschinen für die Sprints zwischen den Cafés um und warfen alles ab, was nicht schnell machte. Daraus ist eine klare Formensprache geworden, an der man einen Cafe Racer bis heute erkennt:',
      },
      {
        type: 'list',
        items: [
          'Tiefe, gestreckte Linie: Tank und Sitzbank bilden eine waagerechte Achse',
          'Stummellenker (Clip-ons) oder ein flacher Lenker für die sportliche Sitzposition',
          'Einzelsitzbank mit Höcker statt Doppelsitzbank',
          'Kurzes, aufgeräumtes Heck ohne ausladenden Kotflügel',
          'Zurückverlegte Fußrasten',
          'Runder Scheinwerfer, optional mit kleiner Halbschale',
          'Reduzierte Technik: Was nicht zum Fahren nötig ist, fliegt raus',
        ],
      },
      {
        type: 'p',
        text: 'Wichtig: Ein Cafe Racer ist kein Optik-Paket. Mit dem tiefen Lenker verlagert sich das Gewicht nach vorn, die Sitzposition wird sportlich und auf langen Strecken anstrengender. Fahrwerk und Ergonomie müssen dazu passen, sonst fährt sich das Ergebnis schlechter als das Original.',
      },
      { type: 'h2', text: 'Selbst bauen, Umbau-Kit oder Werkstatt?' },
      {
        type: 'p',
        text: 'Bevor du das erste Teil bestellst, solltest du entscheiden, wie viel du selbst machen willst. Es gibt grob drei Wege:',
      },
      {
        type: 'list',
        items: [
          'Selbstbau mit Einzelteilen: maximale Freiheit und maximaler Aufwand. Du brauchst Werkzeug, Platz, Zeit und für Rahmenarbeiten jemanden, der sauber schweißt.',
          'Umbau-Kit: Heckrahmen, Höcker, Sitzbank und Halter passend für dein Modell. Das spart Schweißarbeit und bringt im besten Fall ein Teilegutachten mit. Für gängige Basen wie BMW-Boxer, Yamaha XS650 oder Triumph Bonneville ist die Auswahl groß.',
          'Werkstatt: Du lieferst die Idee und eventuell die Basis, die Werkstatt baut inklusive Eintragung. Das ist am teuersten, aber am besten planbar.',
        ],
      },
      {
        type: 'p',
        text: 'Viele Projekte landen in der Mitte: Die optischen Arbeiten erledigst du selbst, Rahmen, Bremsen und Abnahme übernimmt ein Profi. Diese Aufteilung spart Geld, ohne bei der Sicherheit zu sparen.',
      },
      { type: 'h2', text: 'Schritt 1: Planung und das richtige Basis-Bike' },
      {
        type: 'p',
        text: 'Die Basis entscheidet über Budget, Aufwand und Ergebnis. Bewährt haben sich luftgekühlte Motorräder mit Stahlrohrrahmen und guter Teileversorgung: Honda CB750 und CB500, Yamaha SR500 und XS650, BMW R80 und R100, Kawasaki Z650. Wer ABS und Einspritzung will, startet mit einer Triumph Bonneville, einer BMW R nineT oder einer Royal Enfield Continental GT.',
      },
      {
        type: 'p',
        text: 'Mach vor dem Kauf eine Skizze oder Fotomontage der Seitenansicht. Leg fest, welche Linie Tank und Sitzbank bilden sollen, und kläre früh, ob es ein Einsitzer werden soll, denn das hat Folgen für die Papiere. Plane außerdem 20 bis 30 Prozent Puffer über deiner Kostenschätzung ein. Kaum ein Umbau bleibt im Budget.',
      },
      { type: 'cta', text: 'Die 10 besten Basis-Bikes mit Preisen und Schwierigkeitsgrad', href: '/magazine/cafe-racer-selber-bauen-basis-bikes', label: 'Zum Basis-Bike-Guide' },
      { type: 'h2', text: 'Schritt 2: Zerlegen und Bestandsaufnahme' },
      {
        type: 'p',
        text: 'Bevor du etwas veränderst, baust du zurück: Sitzbank, Seitendeckel, Kotflügel, Beleuchtung, Luftfilterkasten. Fotografiere jeden Schritt und beschrifte Kabel und Schrauben, das spart später Stunden. Jetzt zeigt sich auch der tatsächliche Zustand: Rost im Rahmen, ausgeschlagene Lenkkopflager, poröse Bremsleitungen, ein müder Motor. Eine Kompressionsmessung kostet jetzt wenig. Nach dem Lackieren wird jede Motorüberraschung teuer.',
      },
      {
        type: 'image',
        src: 'https://ikhgfynzghfhnviwvupo.supabase.co/storage/v1/object/public/builder-media/31c44afa-eafc-418e-b91e-1359bccf69d8/1775409434637-cdvj590zo.jpg',
        caption: 'Bestandsaufnahme beim Cafe Racer Umbau: Jedes Teil wird geprüft, bevor neu aufgebaut wird. Werkbank bei KAFFEEMASCHINE in Hamburg.',
      },
      {
        type: 'p',
        text: 'Faustregel: Technik vor Optik. Ein frisch lackierter Tank auf einem Motor mit schlechter Kompression ist rausgeworfenes Geld.',
      },
      { type: 'h2', text: 'Schritt 3: Rahmen und Heck umbauen' },
      {
        type: 'p',
        text: 'Das Heck macht den Cafe Racer. Meist wird der hintere Rahmenteil gekürzt und mit einer Rahmenschleife (Loop) sauber abgeschlossen, damit Sitzbank und Höcker waagerecht aufliegen. Bei Rahmen mit verschraubtem Heck geht das teilweise ohne Schweißen, bei den meisten Klassikern nicht.',
      },
      {
        type: 'p',
        text: 'Achtung: Eingriffe am Rahmen sind immer abnahmepflichtig. Sprich vorher mit deinem Prüfer, was er sehen will: oft Schweißnähte, Materialangaben und die Aufnahme der Federbeine. Halter für Kennzeichen, Rückleuchte und Blinker solltest du gleich mit einplanen. Wer sie vergisst, improvisiert am Ende mit Bastellösungen.',
      },
      {
        type: 'image',
        src: 'https://ikhgfynzghfhnviwvupo.supabase.co/storage/v1/object/public/bike-images/df83b336-dbc8-4276-862e-161056fb8083/81f3151b-7da6-4477-8d68-790e78910caa/0.webp',
        caption: 'Gekürztes Heck, flache Sitzbank, freigelegter Boxer: die BMW SCHIZZO GT1 von WalzWerk Motorcycles.',
      },
      { type: 'h2', text: 'Schritt 4: Stummellenker, Fußrasten und Cockpit' },
      {
        type: 'p',
        text: 'Stummellenker werden direkt an die Gabelrohre geklemmt, über oder unter der oberen Gabelbrücke. Je tiefer, desto sportlicher und desto unbequemer. Prüf nach der Montage den vollen Lenkeinschlag: Die Hände dürfen nicht am Tank klemmen, und Gaszug, Kupplungszug und Bremsleitung müssen in jeder Stellung frei laufen. Oft sind kürzere Züge und Leitungen nötig.',
      },
      {
        type: 'p',
        text: 'Zum tieferen Lenker gehören zurückverlegte Fußrasten. Fußrastenanlagen mit Teilegutachten gibt es für viele Modelle, selbst gebaute Halter brauchen eine Einzelabnahme. Im Cockpit reichen meist ein kleiner Tacho und wenige Kontrollleuchten. Tacho, Blinker- und Fernlichtkontrolle müssen aber bleiben.',
      },
      { type: 'h2', text: 'Schritt 5: Tank, Sitzbank und Elektrik' },
      {
        type: 'p',
        text: 'Der Tank bestimmt die Silhouette. Viele Builder behalten den Originaltank und ändern nur Kniekissen und Befestigung, andere setzen auf Alutanks oder Tanks anderer Modelle. Passend dazu entsteht die Sitzbank: Höcker aus GFK oder Aluminium, Polster vom Sattler. Ein schmaler Einsitzer ist stilecht, muss aber in die Papiere (siehe Checkliste unten).',
      },
      {
        type: 'p',
        text: 'Die Elektrik ist der unterschätzte Teil jedes Umbaus. Wo vorher Seitendeckel und Batteriekasten saßen, ist jetzt Luft, und Batterie, Relais und Sicherungen brauchen einen neuen Platz. Häufig wird der Kabelbaum komplett neu aufgebaut, mit kompakter Lithium-Batterie und zentralem Steuermodul. Das ist sauber und zuverlässig, verlangt aber Sorgfalt. Viele Pannen nach einem Umbau haben ihre Ursache in der Elektrik.',
      },
      { type: 'h2', text: 'Schritt 6: Fahrwerk, Bremsen und Reifen' },
      {
        type: 'p',
        text: 'Durch die neue Sitzposition liegt mehr Gewicht auf dem Vorderrad. Überhol die Gabel mit frischem Öl und gegebenenfalls progressiven Federn und tausch müde Federbeine. Bremsen bekommen neue Beläge und Leitungen, Stahlflexleitungen mit ABE sind die übliche Wahl. Beim Cafe Racer passen sportliche Straßenreifen. Weichen Reifengrößen von den Papieren ab, brauchst du eine Freigabe oder Eintragung.',
      },
      { type: 'h2', text: 'Schritt 7: Auspuff, Luftfilter und Abstimmung' },
      {
        type: 'p',
        text: 'Ein kurzer Auspuff und Sportluftfilter statt Luftfilterkasten gehören zum Look. Beides verändert das Gemisch: Die Vergaser müssen neu abgestimmt werden, sonst läuft der Motor zu mager und wird heiß, im schlimmsten Fall mit Motorschaden. Offene Ansaugtrichter ohne Filter sehen gut aus, sind aber laut und lassen Schmutz in den Motor. Für die Straße sind Filter mit Gutachten die sichere Wahl.',
      },
      {
        type: 'p',
        text: 'Beim Auspuff gilt: nur mit E-Prüfzeichen, ABE oder Teilegutachten, und der dB-Killer bleibt drin. Ohne gültige Papiere erlischt in der Regel die Betriebserlaubnis.',
      },
      { type: 'cta', text: 'Legaler Auspuff: Prüfzeichen, Papiere und typische Fallen', href: '/magazine/legaler-motorrad-auspuff-ece-zulassung', label: 'Zum Auspuff-Ratgeber' },
      { type: 'h2', text: 'Schritt 8: Lack, Finish und Abnahme' },
      {
        type: 'p',
        text: 'Lackiert wird erst, wenn alles passt und das Motorrad probegefahren ist. Wer früher lackiert, lackiert oft zweimal. Pulverbeschichtung für Rahmen und Kleinteile ist robust und bezahlbar. Danach geht es zur Abnahme: alle Gutachten, ABEs und Belege in eine Mappe, das Motorrad sauber und vollständig. Teile mit Teilegutachten werden bei der Änderungsabnahme geprüft, alles ohne Papiere bei einer Einzelabnahme nach §21 StVZO. Ändern sich Angaben in den Fahrzeugpapieren, etwa die Zahl der Sitzplätze, lässt du sie anschließend bei der Zulassungsstelle berichtigen.',
      },
      {
        type: 'quote',
        text: 'Ein Cafe Racer entsteht nicht durch Weglassen allein. Er entsteht, wenn alles, was bleibt, einen Grund hat.',
      },
      { type: 'h2', text: 'TÜV-Checkliste: Was beim Cafe Racer eingetragen werden muss' },
      {
        type: 'p',
        text: 'Nicht jedes Teil muss eingetragen werden. Teile mit EG-Genehmigung oder ABE für dein Modell darfst du ohne Abnahme verbauen, solange du die Auflagen einhältst und die ABE mitführst. Teile mit Teilegutachten brauchen eine Änderungsabnahme, ohne Papiere hilft nur die Einzelabnahme. Diese Punkte fallen beim Cafe Racer typischerweise an:',
      },
      {
        type: 'list',
        items: [
          'Rahmen und Heck: gekürzt oder geschweißt, also immer abnahmepflichtig',
          'Sitzbank: Beim Umbau auf Einsitzer wird die Sitzplatzzahl in den Papieren geändert, Soziusrasten entfallen',
          'Stummellenker und Fußrastenanlage: mit Teilegutachten eintragen, Freigängigkeit und Leitungen werden geprüft',
          'Blinker: mit E-Prüfzeichen und Mindestabstand, bei EG-zugelassenen Motorrädern in der Regel 240 mm vorn und 180 mm hinten (Innenkante zu Innenkante)',
          'Rückleuchte, Kennzeichenbeleuchtung und roter Rückstrahler: alle mit Prüfzeichen, der Rückstrahler wird beim kurzen Heck gern vergessen',
          'Spiegel: nur mit Prüfzeichen, auch Lenkerendenspiegel',
          'Auspuff und Luftfilter: Prüfzeichen, ABE oder Teilegutachten, der dB-Killer bleibt drin',
          'Reifen: abweichende Größen nur mit Freigabe oder Eintragung',
        ],
      },
      {
        type: 'p',
        text: 'Unser Tipp: Geh mit deinen Plänen zum Prüfer, bevor du anfängst. Ein Gespräch von zehn Minuten erspart oft eine zweite Vorführung.',
      },
      { type: 'cta', text: 'Alles zur Eintragung von Umbauten', href: '/magazine/tuev-eintragung-custom-bike', label: 'Zum TÜV-Ratgeber' },
      { type: 'h2', text: 'Cafe Racer mit H-Kennzeichen?' },
      {
        type: 'p',
        text: 'Viele beliebte Basis-Bikes sind über 30 Jahre alt, da liegt das H-Kennzeichen nahe. Ein Umbau macht es allerdings schwieriger, denn Änderungen müssen zeitgenössisch sein. Vereinfacht heißt das: Sie müssen in den ersten Jahren nach der Erstzulassung so üblich gewesen sein. Stummellenker und Höcker an einer Maschine aus den 70ern lassen sich oft begründen, LED-Rückleuchten, moderne Upside-down-Gabeln oder Digitalinstrumente meist nicht. Die Auslegung liegt beim Prüfer. Ist dir das H-Kennzeichen wichtig, klär es vor dem Umbau.',
      },
      { type: 'h2', text: 'Was kostet ein Cafe Racer Umbau?' },
      {
        type: 'p',
        text: 'Die Spanne ist riesig. Sie hängt davon ab, wie viel du selbst machst und in welchem Zustand die Basis ist. Als Richtwerte für Deutschland:',
      },
      {
        type: 'list',
        items: [
          'Teilumbau am eigenen Motorrad (Lenker, Sitzbank, Beleuchtung, Auspuff): ca. 1.500 bis 4.000 €',
          'Kompletter Selbstbau inklusive Basis-Bike: realistisch 5.000 bis 12.000 €',
          'Komplettumbau durch eine Werkstatt: meist 15.000 bis 30.000 €, Einzelstücke auch deutlich mehr',
          'Eintragung inklusive Gutachten und Vorbereitung: 500 bis 1.500 €',
        ],
      },
      {
        type: 'p',
        text: 'Die größten Kostentreiber sind selten die sichtbaren Teile, sondern Motorüberholung, Elektrik und Lack. Eine ausführliche Kalkulation mit Einzelpreisen für jeden Arbeitsschritt findest du in unserem Kosten-Guide.',
      },
      { type: 'cta', text: 'Motorrad Umbau Kosten im Detail', href: '/magazine/motorrad-umbau-kosten', label: 'Zum Kosten-Guide' },
      { type: 'h2', text: 'Die 5 häufigsten Fehler beim Cafe Racer Umbau' },
      {
        type: 'list',
        items: [
          'Erst Optik, dann Technik: Lack und Anbauteile kaufen, bevor Motor, Bremsen und Rahmen geprüft sind.',
          'Heck gekürzt, Halter vergessen: Kennzeichen, Rückleuchte und Blinker werden zur Bastellösung.',
          'Luftfilter getauscht, Vergaser nicht abgestimmt: Der Motor läuft mager und wird heiß.',
          'Lenker montiert, Lenkeinschlag nicht geprüft: Züge spannen, Leitungen scheuern.',
          'Ohne Prüfer geplant: Am Ende fehlt ein Gutachten, und Teile müssen wieder runter.',
        ],
      },
      { type: 'h2', text: 'Cafe Racer umbauen lassen: Werkstätten mit Erfahrung' },
      {
        type: 'p',
        text: 'Wenn dir Zeit, Werkzeug oder die Lust auf Papierkram fehlen, bau mit einem Profi. Diese Werkstätten haben sich unter anderem auf Cafe Racer spezialisiert:',
      },
      {
        type: 'image',
        src: 'https://ikhgfynzghfhnviwvupo.supabase.co/storage/v1/object/public/builder-media/31c44afa-eafc-418e-b91e-1359bccf69d8/1775409435366-0kz7ho5ioc7p.jpg',
        caption: 'Moto-Guzzi-Cafe-Racer in der Werkstatt von KAFFEEMASCHINE in Hamburg.',
      },
      {
        type: 'p',
        text: 'KAFFEEMASCHINE (Hamburg) baut Cafe Racer auf Basis von Moto Guzzi, mit klassischer Linie und viel Liebe zum Detail. Auch das Titelbild dieses Artikels zeigt einen ihrer Umbauten.',
      },
      { type: 'cta', text: 'KAFFEEMASCHINE auf MotoDigital', href: '/custom-werkstatt/kaffeemaschine', label: 'Profil ansehen' },
      {
        type: 'p',
        text: 'hombrese bikes (Bergisch Gladbach) ist Ideenschmiede und Werkstatt in einem. Hier entstehen Cafe Racer, Scrambler und Tracker auf Basis von Serienmotorrädern.',
      },
      { type: 'cta', text: 'hombrese bikes auf MotoDigital', href: '/custom-werkstatt/hombrese-bikes', label: 'Profil ansehen' },
      {
        type: 'p',
        text: 'KASPEED Custom Motorcycles (Glauchau) ist ein Familienbetrieb für bezahlbare Klassiker-Umbauten: Cafe Racer, Brat, Scrambler und Tracker auf japanischer und europäischer Basis.',
      },
      { type: 'cta', text: 'KASPEED auf MotoDigital', href: '/custom-werkstatt/kaspeed', label: 'Profil ansehen' },
      {
        type: 'p',
        text: 'Super-Bike-Box (Kalbach in der Rhön) schraubt seit 1984 und kümmert sich neben Customizing und Tuning auch um die §21-Eintragung vor Ort. Das ist praktisch, wenn der Papierkram der größte Brocken ist.',
      },
      { type: 'cta', text: 'Super-Bike-Box auf MotoDigital', href: '/custom-werkstatt/super-bike-box', label: 'Profil ansehen' },
      {
        type: 'cta',
        text: 'Fertige Cafe Racer von Werkstätten und Privatbuildern ansehen',
        href: '/bikes/cafe-racer',
        label: 'Cafe Racer entdecken',
      },
    ],
  },

  {
    slug: 'bmw-cafe-racer-umbau-werkstaetten',
    title: 'BMW Café Racer Umbau: 10 Werkstätten in Deutschland, die es wirklich können',
    metaTitle: 'BMW Café Racer Umbau — 10 Werkstätten in Deutschland 2026',
    metaDescription:
      'Wer baut den besten BMW Café Racer? 10 spezialisierte Werkstätten von Hamburg bis Garmisch — mit Schwerpunkten, Basis-Modellen und Tipps zu Kosten & TÜV.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Vom R80-Klassiker bis zur R nineT: Diese zehn Werkstätten haben sich auf BMW-Umbauten spezialisiert. Was sie unterscheidet, was ein Umbau kostet und worauf du achten solltest.',
    coverImage:
      'https://ikhgfynzghfhnviwvupo.supabase.co/storage/v1/object/public/builder-media/7adfc0d3-8805-4877-9b74-dc0be4172107/cover-1793199586585-0.jpg',
    publishedAt: '2026-10-28',
    readTime: '9 min',
    author: 'MotoDigital Redaktion',
    tags: ['BMW', 'Cafe Racer', 'Werkstatt', 'Umbau', 'Boxer', 'R80', 'R100', 'R nineT'],
    relatedSlugs: ['cafe-racer-selber-bauen-basis-bikes', 'motorrad-umbau-werkstatt-finden', 'tuev-eintragung-custom-bike'],
    faq: [
      { q: 'Welche BMW eignet sich am besten für einen Café Racer Umbau?', a: 'Die Klassiker sind die Zweiventil-Boxer der Baureihen R65, R80 und R100 aus den 70er bis 90er Jahren: robust, gut verfügbar und mit riesigem Teileangebot. Beliebt sind außerdem die K-Modelle (K75, K100) und die moderne R nineT, die von Werk aus für Umbauten konzipiert wurde.' },
      { q: 'Was kostet ein BMW Café Racer vom Profi?', a: 'Das hängt stark vom Umfang ab. Ein Teileumbau einer vorhandenen Maschine beginnt im niedrigen vierstelligen Bereich, ein kompletter Aufbau inklusive Basisbike, Motorüberholung und Eintragung liegt meist zwischen 15.000 und 30.000 Euro. High-End-Einzelstücke können deutlich darüber liegen.' },
      { q: 'Ist ein BMW Café Racer TÜV-fähig?', a: 'Ja — wenn die verbauten Teile eine ABE, ein Teilegutachten oder eine Einzelabnahme nach §21 StVZO haben. Seriöse Werkstätten übergeben das Bike mit allen Eintragungen. Frag vor Auftragsvergabe explizit danach.' },
      { q: 'Wie lange dauert ein Café Racer Umbau?', a: 'Bei Werkstätten mit Serienerfahrung sind es oft nur wenige Wochen, bielamoto nennt zum Beispiel vier bis sechs Wochen. Komplette Einzelstücke mit Sonderanfertigungen brauchen eher mehrere Monate.' },
    ],
    content: [
      {
        type: 'intro',
        text: 'Kaum eine Marke ist in der Custom-Szene so präsent wie BMW. Der Boxer-Motor mit seinen links und rechts herausstehenden Zylindern ist wie gemacht für den reduzierten Café-Racer-Look — und die Klassiker der 70er bis 90er Jahre sind robust, verfügbar und gut dokumentiert. Doch wer einen BMW Café Racer nicht selbst bauen, sondern bauen lassen will, steht vor der Frage: Welche Werkstatt kann das wirklich? Wir stellen zehn Betriebe vor, die sich auf BMW-Umbauten spezialisiert haben — von der Kleinserie bis zum High-End-Einzelstück.',
      },
      { type: 'h2', text: 'Warum ausgerechnet BMW?' },
      {
        type: 'p',
        text: 'Die Zweiventil-Boxer der Baureihen R45 bis R100 gelten als nahezu unkaputtbar. Sie wurden in großen Stückzahlen gebaut, Ersatzteile sind bis heute erhältlich und die Technik ist überschaubar. Dazu kommt eine riesige Auswahl an Umbauteilen — von Höckern und Tanks über Fahrwerke bis zu kompletten Rahmenheck-Kits. Wer es moderner mag, greift zur R nineT, die BMW selbst als Custom-Basis entwickelt hat, oder zu den Vierzylinder-K-Modellen mit ihrem ganz eigenen Charakter.',
      },
      {
        type: 'list',
        items: [
          'R65 / R80 / R100: der Klassiker — günstig, robust, riesiges Teileangebot',
          'K75 / K100 / K1100: längs eingebauter Reihenmotor, eigenwilliger Look, oft unterschätzt',
          'R nineT: moderne Technik mit ABS und Einspritzung, ab Werk modular aufgebaut',
          'R18: großvolumiger Boxer für Bobber und Bagger, eher selten als Café Racer',
        ],
      },
      { type: 'h2', text: '1. Sport-Evolution — Neuwied' },
      {
        type: 'p',
        text: 'Sport-Evolution ist so etwas wie die Komplettlösung für Zweiventiler-Fans. Die Manufaktur baut Concept Bikes auf Basis von R-Boxern, K75/K100 und R nineT und entwickelt dafür eigene Umbauteile — vom Fahrwerk bis zur ABS-Nachrüstung für klassische Boxer. Motorenbau, Vergaserabstimmung und Leistungsmessung kommen aus dem eigenen Haus. Besonders praktisch: Mit dem 3D-Konfigurator lässt sich das Wunschbike schon vor der Fertigung zusammenstellen.',
      },
      { type: 'cta', text: 'Sport-Evolution auf MotoDigital', href: '/custom-werkstatt/sport-evolution', label: 'Profil ansehen' },
      { type: 'h2', text: '2. WalzWerk Motorcycles — Hockenheim' },
      {
        type: 'p',
        text: 'Marcus Walz und sein Team bauen seit über 35 Jahren Motorräder und haben WalzWerk zu einer der bekanntesten Custom-Marken der Welt gemacht. Rund 100 BMW-Umbauten pro Jahr verlassen die Werkstatt in Hockenheim — Café Racer, Scrambler und Roadster mit unverkennbarem Stil. Wer einen BMW-Umbau mit großem Markennamen sucht, landet früher oder später hier.',
      },
      { type: 'cta', text: 'WalzWerk Motorcycles auf MotoDigital', href: '/custom-werkstatt/walzwerk-motorcycles', label: 'Profil ansehen' },
      {
        type: 'image',
        src: 'https://ikhgfynzghfhnviwvupo.supabase.co/storage/v1/object/public/builder-media/df83b336-dbc8-4276-862e-161056fb8083/1774818633891.jpg',
        caption: 'BMW-Umbau von WalzWerk Motorcycles aus Hockenheim.',
      },
      { type: 'h2', text: '3. Diamond Atelier — München' },
      {
        type: 'p',
        text: 'Seit 2013 steht Diamond Atelier für eine radikal reduzierte Designsprache. Die durchnummerierte DA-Serie und Kleinserien wie MK II EVO oder URBAN21 basieren überwiegend auf BMW R80, R100R und R nineT. Viele Komponenten entwickelt das Münchner Atelier selbst und kombiniert dabei klassisches Handwerk mit digitaler Fertigung. Die Bikes wurden international von Pipeburn, BikeEXIF und BMW Motorrad vorgestellt — High-End mit entsprechendem Preisschild.',
      },
      { type: 'cta', text: 'Diamond Atelier auf MotoDigital', href: '/custom-werkstatt/diamond-atelier', label: 'Profil ansehen' },
      { type: 'h2', text: '4. Kingston Custom — Gelsenkirchen' },
      {
        type: 'p',
        text: 'Dirk Oehlerking, Deutscher Motocross-Meister von 1985 und ehemals bei der Hamburger Styling Garage, zählt zu den bekanntesten Customizern des Landes. Unter dem Namen Kingston Custom baut er im Ruhrgebiet außergewöhnliche BMW-Umbauten, die mit eigenwilligen Formen und perfekter Metallarbeit auffallen. Kein Großbetrieb, sondern echte Handarbeit mit klarer Handschrift.',
      },
      { type: 'cta', text: 'Kingston Custom auf MotoDigital', href: '/custom-werkstatt/kingston-custom', label: 'Profil ansehen' },
      { type: 'h2', text: '5. bielamoto — Neuss' },
      {
        type: 'p',
        text: 'Der Familienbetrieb mit Rennsport-Hintergrund hat sich auf eine Sache konzentriert: BMW R 80 Café Racer zu fairen Preisen. Zu jedem Umbau gehört eine Motorinspektion mit neuer Kupplung, Dichtungssatz und Steuerkette, alle Teile werden eingetragen und der TÜV ist bei Übergabe inklusive. Mit vier bis sechs Wochen Lieferzeit ist bielamoto eine der schnellsten Adressen für einen fahrfertigen Boxer-Café-Racer.',
      },
      { type: 'cta', text: 'bielamoto auf MotoDigital', href: '/custom-werkstatt/bielamoto', label: 'Profil ansehen' },
      {
        type: 'image',
        src: 'https://ikhgfynzghfhnviwvupo.supabase.co/storage/v1/object/public/builder-media/cd05b97e-6bf0-42b1-8977-621efb15d043/cover-1793199562872-0.jpg',
        caption: 'BMW R 80 als Café Racer — das Kerngeschäft von bielamoto.',
      },
      { type: 'h2', text: '6. NAGEL Motors — Garmisch-Partenkirchen' },
      {
        type: 'p',
        text: 'Nic Nagel baut am Fuß der Zugspitze komplette Motorräder statt bloßer Teileumbauten — über 50 nummerierte Einzelstücke sind es inzwischen. BMW R100, R75, K-Modelle und R nineT werden zu Scramblern, Café Racern und Restomods. Nebenbei ist die Werkstatt eine der gefragtesten Adressen für Custom-Vespas. Termine gibt es nach Vereinbarung.',
      },
      { type: 'cta', text: 'NAGEL Motors auf MotoDigital', href: '/custom-werkstatt/nagel-motors', label: 'Profil ansehen' },
      { type: 'h2', text: '7. Brückner Manufaktur — Magdeburg' },
      {
        type: 'p',
        text: 'Der Meisterbetrieb aus Sachsen-Anhalt baut Café Racer, Scrambler und Bobber auf einer breiten Basis — BMW-Boxer von R45 bis R100 und K-Modelle sind aber das Rückgrat. Builds wie der R100R-Scrambler „Nightfall“ oder die K100 „Black Bullet“ zeigen den Stil: klare Linien, kräftige Farben, saubere Details. Dazu gibt es einen eigenen Teile-Shop.',
      },
      { type: 'cta', text: 'Brückner Manufaktur auf MotoDigital', href: '/custom-werkstatt/brueckner-manufaktur', label: 'Profil ansehen' },
      { type: 'h2', text: '8. Boddls Bikes & Cars — Göppingen' },
      {
        type: 'p',
        text: 'Michael „Boddle“ Schellberg schraubt seit 1972 und spezialisiert sich heute auf BMW-Boxer der Baujahre 1965 bis 1995. In 200 bis 300 Arbeitsstunden entsteht bei ihm jeder Café Racer, Bobber oder Scrambler als Unikat — übergeben mit Zertifikat und Eintragung. Ein ISO-zertifizierter Schweißer im Team kümmert sich um saubere Rahmenarbeiten.',
      },
      { type: 'cta', text: 'Boddls Bikes auf MotoDigital', href: '/custom-werkstatt/boddls-bikes', label: 'Profil ansehen' },
      { type: 'h2', text: '9. Hanse Qustom — Hamburg' },
      {
        type: 'p',
        text: 'Hinter Hanse Qustom stehen ein BMW- und ein Triumph-Vertragshändler. Das Besondere: Umgebaut wird grundsätzlich auf Neu- oder Vorführmaschinen, bei BMW also vor allem auf der R nineT. Das Ergebnis sind preisgekrönte Custombikes mit moderner Technik, Garantie-Nähe und Service auf Werksniveau — ideal für alle, die ein Custombike im Alltag fahren wollen.',
      },
      { type: 'cta', text: 'Hanse Qustom auf MotoDigital', href: '/custom-werkstatt/hanse-qustom', label: 'Profil ansehen' },
      { type: 'h2', text: '10. Bullock Custom Bikes — Altendiez' },
      {
        type: 'p',
        text: 'Bei Bullock nahe Limburg stehen Harley-Umbauten und BMW-Café-Racer nebeneinander. Bekannt ist etwa eine R100 RS im GULF-Design. Lack, Pulverbeschichtung und Sattlerarbeiten kommen aus einer Hand, der TÜV kommt wöchentlich ins Haus. Wer noch kein Basisbike hat, bekommt auf Wunsch eines besorgt.',
      },
      { type: 'cta', text: 'Bullock Custom Bikes auf MotoDigital', href: '/custom-werkstatt/bullock-custom-bikes', label: 'Profil ansehen' },
      { type: 'h2', text: 'Was kostet ein BMW Café Racer Umbau?' },
      {
        type: 'p',
        text: 'Die Spanne ist groß. Ein Teileumbau einer vorhandenen Maschine — Sitzbank, Lenker, Beleuchtung, Auspuff — beginnt im niedrigen vierstelligen Bereich. Ein kompletter Aufbau mit Basisbike, Motorüberholung, Fahrwerk, Lack und Eintragung landet meist zwischen 15.000 und 30.000 Euro. High-End-Einzelstücke mit Sonderanfertigungen können deutlich darüber liegen. Wichtig: Ein günstiges Basisbike spart selten Geld, wenn Motor und Getriebe danach komplett überholt werden müssen.',
      },
      { type: 'h2', text: 'Worauf du bei der Werkstattwahl achten solltest' },
      {
        type: 'list',
        items: [
          'Eintragung: Lass dir schriftlich bestätigen, dass das Bike mit allen Eintragungen übergeben wird.',
          'Technik vor Optik: Gute Werkstätten überholen Motor, Kupplung, Bremsen und Elektrik — nicht nur die Verkleidung.',
          'Referenzen: Schau dir fertige Bikes der Werkstatt an, idealerweise live und mit Probefahrt.',
          'Basisbike: Kläre, ob du ein eigenes Motorrad mitbringst oder die Werkstatt die Basis besorgt.',
          'Zeitplan: Serienumbauten dauern Wochen, Einzelstücke Monate — frag nach einem realistischen Termin.',
        ],
      },
      {
        type: 'quote',
        text: 'Ein guter Café Racer sieht nicht nur reduziert aus. Er fährt auch so — leicht, direkt und zuverlässig.',
      },
      {
        type: 'cta',
        text: 'Noch mehr Werkstätten in deiner Nähe finden',
        href: '/custom-werkstatt',
        label: 'Alle Werkstätten',
      },
    ],
  },

  {
    slug: 'legaler-motorrad-auspuff-ece-zulassung',
    title: 'Legaler Motorrad-Auspuff: E-Nummer, EG-ABE und ECE — so erkennst du die Zulassung',
    metaTitle: 'Legaler Motorrad-Auspuff — E-Nummer, ECE & EG-ABE erklärt',
    metaDescription:
      'Ist dein Motorrad-Auspuff legal? So liest du E-Prüfzeichen, EG-Typgenehmigung, ABE und Teilegutachten richtig — plus dB-Killer, Euro 5 und Kauf-Checkliste.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Kleines Prüfzeichen, große Wirkung: Woran du einen legalen Motorrad-Auspuff erkennst, welche Papiere du brauchst und welche Fehler bei Kontrolle und HU teuer werden.',
    coverImage:
      'https://ikhgfynzghfhnviwvupo.supabase.co/storage/v1/object/public/builder-media/97bd3225-b682-4bc8-8de3-6bf96105442a/cover-1793199580243-0.jpg',
    publishedAt: '2026-10-28',
    readTime: '8 min',
    author: 'MotoDigital Redaktion',
    tags: ['Auspuff', 'TÜV', 'Eintragung', 'ECE', 'Recht', 'Lärm'],
    relatedSlugs: ['custom-auspuff-eintragung-kosten', 'tuev-eintragung-custom-bike', 'motorrad-umbau-kosten'],
    faq: [
      { q: 'Woran erkenne ich, ob ein Motorrad-Auspuff legal ist?', a: 'Am eingeschlagenen oder aufgenieteten Prüfzeichen: ein kleines „e“ mit Länderziffer im Rechteck (EG-Typgenehmigung) oder ein großes „E“ mit Ziffer im Kreis (ECE-Genehmigung). Dazu gehört eine Genehmigungsnummer. Alternativ liegt eine deutsche ABE oder ein Teilegutachten bei. Ohne eines davon ist die Anlage nicht straßenzugelassen.' },
      { q: 'Muss ein Auspuff mit E-Nummer eingetragen werden?', a: 'Ein Auspuff mit gültiger EG- oder ECE-Genehmigung für genau dein Fahrzeugmodell muss in der Regel nicht eingetragen werden. Wichtig ist, dass dein Motorrad im Verwendungsbereich der Genehmigung aufgeführt ist. Bei einem Teilegutachten ist dagegen eine Änderungsabnahme beim Prüfer nötig.' },
      { q: 'Darf ich den dB-Killer ausbauen?', a: 'Nein. Ist der dB-Killer Teil der Genehmigung, erlischt mit dem Ausbau die Zulassung der Anlage und damit in der Regel die Betriebserlaubnis des Motorrads. Das kann bei einer Kontrolle Bußgeld, das Verbot der Weiterfahrt und Ärger mit der Versicherung nach sich ziehen.' },
      { q: 'Was bedeutet „nicht für den Straßenverkehr“ oder „Racing only“?', a: 'Solche Anlagen haben keine Straßenzulassung. Sie dürfen nur auf abgesperrten Strecken gefahren werden. Eine nachträgliche Legalisierung ist allenfalls über eine aufwendige Einzelabnahme nach §21 StVZO möglich — und scheitert häufig an Lärm- oder Abgaswerten.' },
      { q: 'Gilt mein legaler Auspuff auch in Österreich?', a: 'EG- und ECE-Genehmigungen gelten EU-weit. Achtung aber bei regionalen Lärmregeln: In Tirol sind auf einigen beliebten Strecken Motorräder mit einem Standgeräusch über 95 dB(A) laut Fahrzeugpapieren gesperrt — unabhängig davon, ob der Auspuff zugelassen ist.' },
    ],
    content: [
      {
        type: 'intro',
        text: 'Ein neuer Auspuff verändert ein Motorrad wie kaum ein anderes Teil — Klang, Optik, manchmal auch Leistung. Doch bei keinem anderen Umbau ist die Frage „Ist das legal?“ so wichtig. Die gute Nachricht: Ob eine Anlage straßenzugelassen ist, lässt sich in den meisten Fällen in zwei Minuten herausfinden. Man muss nur wissen, wo man hinschaut. Dieser Ratgeber erklärt die Prüfzeichen, die verschiedenen Papiere und die typischen Fallen — von dB-Killer bis Euro 5.',
      },
      { type: 'h2', text: 'Die vier Wege zur Zulassung' },
      {
        type: 'p',
        text: 'In Deutschland darf ein Motorrad-Auspuff nur gefahren werden, wenn er auf einem dieser vier Wege zugelassen ist. Sie unterscheiden sich vor allem darin, wie viel Aufwand nach dem Einbau noch auf dich zukommt:',
      },
      {
        type: 'list',
        items: [
          'EG-Typgenehmigung (kleines „e“ im Rechteck): EU-weit gültig, keine Eintragung nötig, wenn dein Modell im Verwendungsbereich steht.',
          'ECE-Genehmigung nach UN-Regelung 92 (großes „E“ im Kreis): die internationale Genehmigung für Ersatz-Schalldämpferanlagen von Krafträdern — ebenfalls ohne Eintragung, wenn das Modell passt.',
          'ABE (Allgemeine Betriebserlaubnis) vom Kraftfahrt-Bundesamt: deutsche Zulassung, Dokument mitführen, keine Eintragung.',
          'Teilegutachten: Der Auspuff ist geprüft, aber der Einbau muss von TÜV, Dekra, GTÜ oder KÜS abgenommen und in die Papiere eingetragen werden (Änderungsabnahme).',
        ],
      },
      {
        type: 'p',
        text: 'Gibt es nichts davon — etwa bei einer handgefertigten Anlage aus der Custom-Werkstatt — bleibt nur die Einzelabnahme nach §21 StVZO. Dabei werden Geräusch und gegebenenfalls Abgas individuell gemessen. Das ist machbar, aber deutlich aufwendiger und teurer. Wie das konkret abläuft und was es kostet, steht in unserem Ratgeber zur Auspuff-Eintragung.',
      },
      { type: 'cta', text: 'Eintragung, Kosten und Hersteller im Detail', href: '/magazine/custom-auspuff-eintragung-kosten', label: 'Zum Auspuff-Ratgeber' },
      { type: 'h2', text: 'So liest du das Prüfzeichen' },
      {
        type: 'p',
        text: 'Das Prüfzeichen ist meist auf dem Endtopf eingeschlagen, eingeprägt oder als Metallplakette aufgenietet. Es besteht aus dem Kennbuchstaben, einer Ziffer für das Land, das die Genehmigung erteilt hat, und einer Genehmigungsnummer. Die Ziffer verrät nicht, wo der Auspuff gebaut wurde, sondern welche Behörde ihn geprüft hat — die „1“ steht zum Beispiel für Deutschland, die „3“ für Italien, die „4“ für die Niederlande.',
      },
      {
        type: 'list',
        items: [
          'Kleines „e“ im Rechteck + Ziffer: EG-/EU-Typgenehmigung',
          'Großes „E“ im Kreis + Ziffer: ECE-Genehmigung (UN-Regelung)',
          'Die Genehmigungsnummer muss zu den mitgelieferten Papieren passen',
          'Fehlt das Zeichen oder ist es unleserlich, gilt die Anlage im Zweifel als nicht genehmigt',
        ],
      },
      {
        type: 'p',
        text: 'Das Prüfzeichen allein reicht aber nicht. Entscheidend ist der Verwendungsbereich in den Papieren: Dort steht, für welche Fahrzeugtypen die Genehmigung gilt — meist über die Typschlüsselnummer oder die Typgenehmigungsnummer deines Motorrads. Ein Endtopf mit E-Nummer für die Triumph Bonneville ist an einer BMW R nineT trotzdem illegal.',
      },
      {
        type: 'image',
        src: 'https://ikhgfynzghfhnviwvupo.supabase.co/storage/v1/object/public/builder-media/ac0c0c8f-38d1-45d1-be6a-bea888aeb51e/gallery-1793196555878-1.jpg',
        caption: 'Gerade bei Harley-Umbauten ist die Abgasanlage oft das auffälligste Bauteil — und das am häufigsten kontrollierte.',
      },
      { type: 'h2', text: 'dB-Killer: Der häufigste Fehler' },
      {
        type: 'p',
        text: 'Viele zugelassene Anlagen sind nur mit eingesetztem dB-Killer (Geräuscheinsatz) genehmigt. Wer ihn ausbaut, weil es „besser klingt“, fährt ohne gültige Genehmigung — und damit in der Regel ohne Betriebserlaubnis. Bei einer Kontrolle drohen Bußgeld und gegebenenfalls das Verbot der Weiterfahrt. Im Schadensfall kann es zudem Probleme mit der Versicherung geben. Seriöse Anlagen sichern den dB-Killer deshalb mit einer Schraube oder Niete; manche Prüfer kontrollieren genau das.',
      },
      { type: 'h2', text: 'Euro 5, Standgeräusch und Kontrollen' },
      {
        type: 'p',
        text: 'Bei neueren Motorrädern spielt neben der Lautstärke auch das Abgas eine Rolle. Für Euro-4- und Euro-5-Modelle muss eine Zubehöranlage die Emissionsvorgaben ihres Fahrzeugtyps erfüllen — deshalb gibt es von vielen Herstellern eigene Versionen je Baujahr. Bei älteren Klassikern, die häufig als Custom-Basis dienen, ist vor allem die Geräuschmessung entscheidend.',
      },
      {
        type: 'p',
        text: 'Ein wichtiger Wert steht in deiner Zulassungsbescheinigung Teil I im Feld U.1: das Standgeräusch in dB(A) mit der zugehörigen Drehzahl in Feld U.2. Polizei und Prüfer messen bei Kontrollen nach diesem Verfahren nach. Liegt der gemessene Wert deutlich über dem eingetragenen, ist die Anlage — oder ihr Zustand — nicht in Ordnung, selbst wenn sie ein Prüfzeichen trägt.',
      },
      {
        type: 'quote',
        text: 'Ein Prüfzeichen schützt dich nur, wenn Anlage, Fahrzeug und Papiere zusammenpassen — und der dB-Killer drin ist.',
      },
      { type: 'h2', text: 'Kauf-Checkliste für einen legalen Auspuff' },
      {
        type: 'list',
        items: [
          'Steht dein Modell inklusive Baujahr im Verwendungsbereich der Genehmigung?',
          'Ist das Prüfzeichen auf der Anlage vorhanden und lesbar?',
          'Liegen die Papiere (EG-/ECE-Bescheinigung, ABE oder Teilegutachten) im Original oder als offizielle Kopie bei?',
          'Ist ein dB-Killer Teil der Genehmigung — und ist er fest verbaut?',
          'Bei Teilegutachten: Termin für die Änderungsabnahme einplanen und Kosten einkalkulieren.',
          'Gebraucht gekauft? Ohne Papiere ist eine Anlage praktisch wertlos — die Ersatzbeschaffung beim Hersteller ist nicht immer möglich.',
        ],
      },
      {
        type: 'p',
        text: 'Wer bei einem kompletten Umbau keine Lust auf Papierkram hat, ist bei einer erfahrenen Custom-Werkstatt gut aufgehoben: Gute Betriebe kennen die Anlagen mit passender Genehmigung, organisieren Änderungsabnahmen und übergeben das Bike mit allen Eintragungen.',
      },
      {
        type: 'cta',
        text: 'Werkstätten, die Umbauten inklusive Eintragung liefern',
        href: '/custom-werkstatt',
        label: 'Werkstatt finden',
      },
    ],
  },

  {
    slug: 'harley-custom-werkstatt-finden',
    title: 'Harley Custom Werkstatt finden: 6 Adressen für Bobber, Chopper und Clubstyle',
    metaTitle: 'Harley Custom Werkstatt finden — 6 Spezialisten in Deutschland',
    metaDescription:
      'Harley-Davidson umbauen lassen? 6 Custom-Werkstätten von Berlin bis Stuttgart, die richtigen Fragen an den Builder und was bei Breitreifen, Airride & TÜV zählt.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Vom Weltmeister-Showbike bis zum soliden Sportster-Bobber: Sechs Werkstätten, die Harley-Davidson können — und worauf du bei der Wahl achten solltest.',
    coverImage:
      'https://ikhgfynzghfhnviwvupo.supabase.co/storage/v1/object/public/builder-media/ac0c0c8f-38d1-45d1-be6a-bea888aeb51e/cover-1793196555542-0.jpg',
    publishedAt: '2026-10-28',
    readTime: '8 min',
    author: 'MotoDigital Redaktion',
    tags: ['Harley-Davidson', 'Bobber', 'Chopper', 'Werkstatt', 'Umbau', 'Clubstyle'],
    relatedSlugs: ['bobber-kaufen-guide', 'motorrad-umbau-werkstatt-finden', 'legaler-motorrad-auspuff-ece-zulassung'],
    relatedBuilderSlug: 'thunderbike',
    faq: [
      { q: 'Muss ich für einen Harley-Umbau zum Vertragshändler?', a: 'Nein. Viele der besten Harley-Umbauten entstehen in freien Custom-Werkstätten. Ein Vertragshändler wie Thunderbike bietet zusätzlich Neufahrzeuge, Garantiearbeiten und Service. Für reine Umbauten zählen vor allem Erfahrung mit dem Modell und saubere Eintragungen.' },
      { q: 'Welche Harley eignet sich am besten als Umbau-Basis?', a: 'Sportster sind günstig und leicht und damit der Klassiker für Bobber. Softail- und Dyna-Modelle bieten mehr Hubraum und Komfort für Chopper und Cruiser. Die aktuellen Milwaukee-Eight-Modelle wie Low Rider ST oder Breakout sind die Basis für moderne Clubstyle- und Performance-Umbauten.' },
      { q: 'Kann ein Breitreifen-Umbau eingetragen werden?', a: 'Ja, mit Teilegutachten oder Einzelabnahme. Entscheidend sind Freigängigkeit, Kettenlinie bzw. Riemenflucht, Kotflügelabdeckung und passende Felgen. Erfahrene Werkstätten planen die Eintragung von Anfang an mit.' },
      { q: 'Was kostet ein Harley-Umbau?', a: 'Kleinere Umbauten wie Lenker, Sitzbank, Auspuff und Beleuchtung bewegen sich meist im niedrigen bis mittleren vierstelligen Bereich. Komplette Umbauten mit Fahrwerk, Breitreifen, Lack und Eintragung liegen schnell im fünfstelligen Bereich, Showbikes deutlich darüber.' },
    ],
    content: [
      {
        type: 'intro',
        text: 'Keine Marke wird so oft umgebaut wie Harley-Davidson. Ob puristischer Sportster-Bobber, gestreckter Chopper oder ein aggressiver Clubstyle-Low-Rider: Die Basis ist robust, die Teileauswahl riesig und die Szene groß. Umso wichtiger ist die Wahl der richtigen Werkstatt — denn zwischen solider Schrauberarbeit und echtem Customizing liegen Welten. Wir stellen sechs Werkstätten vor, die Harley können, und zeigen, worauf du achten solltest.',
      },
      { type: 'h2', text: 'Welche Harley für welchen Stil?' },
      {
        type: 'list',
        items: [
          'Sportster (Evo, 883/1200): leicht, günstig, der Klassiker für Bobber und Café-Umbauten',
          'Softail: Hardtail-Optik mit verstecktem Federbein — ideal für Chopper, Bobber und Fat-Boy-Umbauten',
          'Dyna: die Basis für Clubstyle-Bikes mit hohem T-Bar-Lenker und Halbschale',
          'Touring (Road King, Road Glide): Bagger-Umbauten mit großen Vorderrädern und tiefem Heck',
          'Milwaukee-Eight (Low Rider ST, Breakout): moderne Performance-Basis mit viel Drehmoment',
        ],
      },
      { type: 'h2', text: '1. Thunderbike — Hamminkeln' },
      {
        type: 'p',
        text: 'Wer über Harley-Customizing in Deutschland spricht, kommt an Thunderbike nicht vorbei. Der Vertragshändler am Niederrhein hat Showbikes gebaut, die Europameister- und 2012 sogar den Weltmeistertitel in der Freestyle-Klasse der AMD World Championship geholt haben. Konstruktion, Metallbau, CNC-Fräserei und Oberflächenveredelung sitzen im eigenen Haus, über 2.500 eigene Teile werden weltweit verkauft. Ideal für alle, die Topniveau und eine große Infrastruktur suchen.',
      },
      { type: 'cta', text: 'Thunderbike auf MotoDigital', href: '/custom-werkstatt/thunderbike', label: 'Profil ansehen' },
      { type: 'h2', text: '2. Dr. Mechanik — Weinstadt bei Stuttgart' },
      {
        type: 'p',
        text: 'Max Krpanic baut unter dem Namen Dr. Mechanik seit vielen Jahren High-End-Umbauten rund um amerikanische V-Twins: Dyna-Bobber, eine Road King mit 124-Kubikinch-Motor, V-Rod-Café-Racer, eine 77er Shovelhead und zahlreiche Breitreifen-Projekte. Sitzbänke, Elektrik und Metallarbeiten entstehen in der eigenen Werkstatt.',
      },
      { type: 'cta', text: 'Dr. Mechanik auf MotoDigital', href: '/custom-werkstatt/dr-mechanik', label: 'Profil ansehen' },
      {
        type: 'image',
        src: 'https://ikhgfynzghfhnviwvupo.supabase.co/storage/v1/object/public/builder-media/97bd3225-b682-4bc8-8de3-6bf96105442a/cover-1793199580243-0.jpg',
        caption: 'Road King „Elegance“ von Dr. Mechanik — Touring-Umbau mit großvolumigem Motor.',
      },
      { type: 'h2', text: '3. Raggarbilar Custom — Leipzig' },
      {
        type: 'p',
        text: 'Inhaber Fabrice und sein Team mit eigenem Meister bauen handgemachte Custombikes, vor allem auf Harley-Basis. Markenzeichen sind individuelle Lackierungen mit Pinstriping und Airbrush. Daneben ist Raggarbilar Service- und TÜV-Anlaufstelle für Harley, Buell, Brixton und JAWA — praktisch, wenn Umbau und Wartung aus einer Hand kommen sollen.',
      },
      { type: 'cta', text: 'Raggarbilar Custom auf MotoDigital', href: '/custom-werkstatt/raggarbilar-custom', label: 'Profil ansehen' },
      { type: 'h2', text: '4. Biker Schmiede Berlin' },
      {
        type: 'p',
        text: 'Seit 1998 baut die Biker Schmiede im Osten Berlins Chopper, Bobber und Cruiser — häufig auf V-Rod-, Fat-Boy- oder Indian-Scout-Basis. Sättel, Griffe und lackierte Tanks fertigt das Team teilweise selbst. HU/AU gibt es donnerstags direkt vor Ort, dazu einen Hol- und Bringservice.',
      },
      { type: 'cta', text: 'Biker Schmiede Berlin auf MotoDigital', href: '/custom-werkstatt/biker-schmiede-berlin', label: 'Profil ansehen' },
      { type: 'h2', text: '5. Bullock Custom Bikes — Altendiez' },
      {
        type: 'p',
        text: 'Bei Bullock nahe Limburg dreht sich viel um Heck- und Breitreifenumbauten, Airride-Fahrwerke, Tanks und Auspuffanlagen — zu sehen etwa an einer Softail Slim oder einer V-Rod. Lack, Pulverbeschichtung und Sattlerarbeiten kommen aus einer Hand, der TÜV kommt wöchentlich ins Haus.',
      },
      { type: 'cta', text: 'Bullock Custom Bikes auf MotoDigital', href: '/custom-werkstatt/bullock-custom-bikes', label: 'Profil ansehen' },
      { type: 'h2', text: '6. Brückner Manufaktur — Magdeburg' },
      {
        type: 'p',
        text: 'Der Meisterbetrieb ist vor allem für BMW- und Yamaha-Umbauten bekannt, hat aber auch Harley-Projekte wie die „Black Star“ oder eine Softail in Mystic Blue im Portfolio. Eine gute Adresse für alle, die bei ihrer Harley einen eher europäisch-cleanen Stil suchen.',
      },
      { type: 'cta', text: 'Brückner Manufaktur auf MotoDigital', href: '/custom-werkstatt/brueckner-manufaktur', label: 'Profil ansehen' },
      { type: 'h2', text: 'Fünf Fragen, die du jeder Werkstatt stellen solltest' },
      {
        type: 'list',
        items: [
          'Welche Harley-Projekte habt ihr schon gebaut — und kann ich eines davon sehen oder fahren?',
          'Ist die Eintragung aller Teile im Preis enthalten, und mit welcher Prüforganisation arbeitet ihr?',
          'Was passiert mit Motor, Bremsen und Elektrik — wird nur optisch umgebaut oder auch technisch überholt?',
          'Wie läuft die Abrechnung: Festpreis, Kostenvoranschlag mit Obergrenze oder nach Aufwand?',
          'Wie lange dauert das Projekt realistisch, und wie werde ich zwischendurch informiert?',
        ],
      },
      { type: 'h2', text: 'Harley-typische Stolperfallen beim TÜV' },
      {
        type: 'p',
        text: 'Bei Harley-Umbauten scheitern Eintragungen selten am großen Ganzen, sondern an Details: Breitreifen-Kits brauchen ausreichend Freigang und eine saubere Riemenflucht, gekürzte Kotflügel müssen den Reifen noch ausreichend abdecken, und offene Auspuffanlagen ohne Genehmigung sind der Klassiker unter den Mängeln. Beim Lenker zählen Spiegelsicht, freie Lenkbarkeit und richtig verlegte Züge. Eine gute Werkstatt plant das von Anfang an mit — und spart dir die zweite Runde beim Prüfer.',
      },
      {
        type: 'cta',
        text: 'Alles zu legalen Abgasanlagen und Prüfzeichen',
        href: '/magazine/legaler-motorrad-auspuff-ece-zulassung',
        label: 'Zum Auspuff-Ratgeber',
      },
    ],
  },

  {
    slug: 'warum-heisst-es-cafe-racer',
    title: 'Warum heißt es Cafe Racer? Die Geschichte hinter dem Mythos',
    metaTitle: 'Warum heißt es Cafe Racer? Herkunft, Geschichte & Mythos',
    metaDescription:
      'Cafe Racer: Der Name stammt aus dem London der 1950er Jahre — Ace Cafe, Ton-up Boys und der Rocker-Kult. Die komplette Geschichte des Kultbikes.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Das britische Ace Cafe, die Rocker der 50er und der "Ton-up"-Wettkampf — woher der Name Cafe Racer wirklich kommt.',
    coverImage:
      'https://images.unsplash.com/photo-1713638916407-94d936da4eff?w=1200&q=85',
    publishedAt: '2026-04-10',
    readTime: '8 min',
    author: 'MotoDigital Redaktion',
    tags: ['Cafe Racer', 'Geschichte', 'Ace Cafe', 'Rocker', 'UK', 'Kultur'],
    relatedSlugs: ['cafe-racer-kaufen-guide', 'cafe-racer-selber-bauen-basis-bikes', 'cafe-racer-umbau'],
    faq: [
      { q: 'Woher kommt der Name Cafe Racer?', a: 'Der Begriff entstand in den 1950er Jahren in London, rund um das Ace Cafe an der North Circular Road. Junge Rocker — die "Ton-up Boys" — bauten ihre Motorräder für das Rennen zwischen Cafés um. Diese optimierten Maschinen hießen "Cafe Racers".' },
      { q: 'Was ist ein "Ton-up Boy"?', a: 'Ein "Ton-up Boy" war ein britischer Motorradfahrer, der 100 mph ("Ton") auf öffentlichen Straßen erreichte. Der Begriff stammt aus dem Ace-Cafe-Umfeld der 50er und 60er Jahre.' },
      { q: 'Welche Marken sind typisch für klassische Cafe Racer?', a: 'Typische Basen der Originalszene waren britische Bikes: Triumph Bonneville, Norton Dominator, BSA Gold Star und AJS. Später kamen japanische Maschinen wie die Honda CB750 hinzu.' },
      { q: 'Was unterscheidet einen Cafe Racer optisch?', a: 'Stummellenker (Clip-ons), Einzelsitzbank oder Höcker, verlängerter Tank mit Knieführung, rückwärts montierte Fußrasten, offene Auspuffanlage und spartanische Instrumente.' },
    ],
    content: [
      {
        type: 'intro',
        text: 'Der Begriff "Cafe Racer" taucht heute auf Instagram, in Magazinen und an jeder dritten Werkstattwand auf. Doch die wenigsten wissen, dass er aus einer sehr konkreten Zeit, einem sehr konkreten Ort und einem sehr konkreten Gefühl stammt — nicht aus einem Designer-Studio, sondern aus den Cafés der britischen Nachkriegszeit.',
      },
      { type: 'h2', text: 'Das London der 1950er Jahre' },
      {
        type: 'p',
        text: 'Nach dem Zweiten Weltkrieg war Großbritannien arm, grau und geprägt von Rationierung. Eine neue Generation junger Männer — geboren in der Kriegszeit, herangewachsen im Wiederaufbau — suchte nach einem Freiheitsgefühl, das ihnen keine Institution bot. Das Motorrad war die Antwort: billig, schnell, laut, unbändig. Und es war das Fahrzeug, das Eltern und Behörden gleichermaßen unbequem fanden.',
      },
      { type: 'h2', text: 'Das Ace Cafe — Geburtsstätte eines Mythos' },
      {
        type: 'p',
        text: 'An der North Circular Road im Westen Londons stand ein 24-Stunden-Truckstop: das Ace Cafe. Günstiger Kaffee, eine Jukebox mit Rock’n’Roll und ein Parkplatz, auf dem sich die Motorräder junger Rocker drängten — Triumph Tiger, Norton Dominator, BSA Gold Star. Das Ace war kein Club, es war ein Zustand. Und aus diesem Zustand entstand eine Fahrkultur, die bis heute nachhallt.',
      },
      { type: 'h2', text: '"Ton-up" — 100 mph in drei Minuten' },
      {
        type: 'p',
        text: 'Die Regeln des Spiels waren einfach: Jemand startet einen Song an der Jukebox. Der Fahrer sprintet zum Motorrad, rast zum nächsten Ort entlang der Strecke, kehrt um und muss das Ace vor dem Ende des Songs erreichen. Bei dreiminütigen Singles bedeutete das: mindestens 100 mph auf einer Landstraße, die nicht dafür gebaut war. Wer es schaffte, war ein "Ton-up Boy". 100 mph = 100 "ton". Die Bikes, die dafür umgebaut wurden, hießen "Cafe Racers". Weil sie für die Strecke zwischen zwei Cafés optimiert waren.',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1617375142398-6ed43ccfe353?w=1200&q=85',
        caption: 'Triumph- und Norton-Umbauten der 60er waren die Urform dessen, was heute ein Cafe Racer ist.',
      },
      { type: 'h2', text: 'Was macht einen Cafe Racer zum Cafe Racer?' },
      {
        type: 'p',
        text: 'Die Cafe-Racer-Ästhetik war kein Stil im heutigen Sinne — sie war das Ergebnis konkreter Optimierungen für Geschwindigkeit. Jedes gestalterische Merkmal hat einen funktionalen Ursprung:',
      },
      {
        type: 'list',
        items: [
          'Stummellenker (Clip-ons): niedrigere Sitzposition für bessere Aerodynamik',
          'Einzelsitzbank oder Höcker: weniger Gewicht, kein Platz für Beifahrer',
          'Verlängerter Tank: mehr Reichweite zwischen Cafés, Knieführung für schnelle Kurven',
          'Rückwärts montierte Fußrasten: sportliche Sitzposition, hinter dem Getriebe montiert',
          'Offene Auspuffanlage: Gewichtsreduktion und akustisches Statement',
          'Spartanische Instrumente: nur Drehzahl- und Geschwindigkeitsmesser — alles andere war Luxus',
        ],
      },
      { type: 'h2', text: 'Von der Subkultur zur Design-Ikone' },
      {
        type: 'p',
        text: 'In den 70ern verloren Cafe Racer an Bedeutung — neue japanische Bikes waren ab Werk schnell genug, der Reiz des Umbaus schwand. Erst in den 2000ern erlebte der Stil eine zweite Jugend: Builder wie Deus Ex Machina, Untitled Motorcycles oder die deutsche Szene um Kingston Custom und Jakob Kraft haben die Ästhetik neu interpretiert. Heute ist der Cafe Racer kein Sportgerät mehr, sondern eine Designentscheidung — der Verweis auf eine Zeit, in der ein Motorrad mehr war als ein Fortbewegungsmittel.',
      },
      {
        type: 'quote',
        text: 'Der Cafe Racer war nie ein Hochleistungssportgerät. Er war ein Lebensgefühl — und ist es bis heute geblieben.',
      },
      { type: 'h2', text: 'Warum der Name bleibt' },
      {
        type: 'p',
        text: 'Man könnte argumentieren, dass der Begriff "Cafe Racer" heute unpräzise geworden ist — kaum jemand rast noch von Café zu Café, und die meisten modernen Umbauten sind eher Stilübungen als Rennmaschinen. Und doch trägt der Name eine Geschichte, die kein anderer Bike-Stil so deutlich verkörpert: den Moment, in dem eine Jugendkultur ein Fahrzeug nicht nur benutzt, sondern umdeutet hat. Genau dafür steht der Cafe Racer — und genau deshalb bleibt der Name.',
      },
      {
        type: 'cta',
        text: 'Lust auf einen echten Cafe Racer?',
        href: '/bikes/cafe-racer',
        label: 'Cafe Racer ansehen',
      },
    ],
  },

  {
    slug: 'scrambler-kaufen-guide',
    title: 'Scrambler kaufen 2026: Der vollständige Kaufratgeber',
    metaTitle: 'Scrambler kaufen 2026 — Modelle, Preise & Worauf achten',
    metaDescription:
      'Scrambler kaufen: Alle Werksmodelle im Vergleich, typische Custom-Basen, Preise und die wichtigsten Prüfpunkte vor dem Kauf.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Vom Werks-Scrambler bis zum Custom-Umbau — unser vollständiger Kaufratgeber mit Modellen, Preisen und Prüfpunkten für 2026.',
    coverImage:
      'https://images.unsplash.com/photo-1615272294709-7c2966b77af7?w=1200&q=85',
    publishedAt: '2026-04-05',
    readTime: '11 min',
    author: 'MotoDigital Redaktion',
    tags: ['Scrambler', 'Kaufratgeber', 'Triumph', 'Ducati', 'BMW', 'Custom'],
    relatedSlugs: ['scrambler-vs-tracker-vergleich', 'was-kostet-ein-custom-bike', 'tuev-eintragung-custom-bike'],
    faq: [
      { q: 'Was kostet ein guter Scrambler?', a: 'Neue Werks-Scrambler beginnen bei ca. 5.300 € (Royal Enfield Scram) und reichen bis 20.000 €+ (Triumph Scrambler 1200 XE). Qualitative Custom-Scrambler-Builds starten bei 9.000 € und liegen bei spezialisierten Werkstätten häufig zwischen 14.000 und 22.000 €.' },
      { q: 'Welcher Scrambler eignet sich für Einsteiger?', a: 'Für Einsteiger empfehlen sich Royal Enfield Scram 411, Fantic Caballero 500 oder Husqvarna Svartpilen 401. Alle drei bieten geringes Gewicht, entspannte Sitzhöhe und faire Preise.' },
      { q: 'Ist ein Scrambler für den Alltag geeignet?', a: 'Ja — Scrambler sind gemacht für Straße und leichtes Gelände. Die aufrechte Sitzposition und die robusten Federwege machen sie zu sehr alltagstauglichen Motorrädern, auch für lange Pendelstrecken.' },
      { q: 'Was ist der Unterschied zwischen Scrambler und Tracker?', a: 'Scrambler haben Stollenreifen und sind für Straße + leichtes Gelände gemacht. Tracker haben glatte Straßenreifen, sind sportlicher und urbaner ausgelegt und stammen optisch vom Flat-Track-Racing ab.' },
      { q: 'Welche Motorrad-Basen eignen sich für einen Custom-Scrambler?', a: 'Klassische Basen sind Honda CB550/650, Yamaha XS650, Kawasaki W650 und BMW R80/R100. Alle bieten robuste Motoren, reichlich Platz für Umbauten und eine TÜV-freundliche Geometrie.' },
    ],
    content: [
      {
        type: 'intro',
        text: 'Ein Scrambler ist das vielseitigste Motorrad, das du kaufen kannst — halb Straße, halb Gelände, ganz Attitüde. Doch zwischen Werksmodellen, Retrobikes und echten Custom-Umbauten liegen Welten. Dieser Guide zeigt, worauf du beim Scrambler-Kauf 2026 wirklich achten musst.',
      },
      { type: 'h2', text: 'Werks-Scrambler oder Custom-Umbau?' },
      {
        type: 'p',
        text: 'Die erste und wichtigste Frage: Willst du einen modernen Serien-Scrambler mit Garantie und Zuverlässigkeit — oder einen Custom-Umbau mit Charakter und Geschichte? Beide Wege sind legitim, aber sie bedienen unterschiedliche Bedürfnisse. Der Werks-Scrambler ist die komfortable Einstiegsdroge. Der Custom-Scrambler ist die Investition in ein Einzelstück.',
      },
      { type: 'h2', text: 'Die besten Werks-Scrambler 2026' },
      {
        type: 'list',
        items: [
          'Triumph Scrambler 1200 X / XE — das Referenzmodell, kräftiger Twin, echte Offroad-Qualitäten ab 14.500 €',
          'Ducati Scrambler 800 Icon / Full Throttle — leicht, agil, urban, ab 11.300 €',
          'BMW R nineT Scrambler — Boxer-Motor, Premium-Verarbeitung, ab 15.900 €',
          'Royal Enfield Scram 411 / Himalayan — einfach, ehrlich, günstig, ab 5.300 €',
          'Fantic Caballero 500 Scrambler — die unterschätzte Empfehlung, ab 7.900 €',
          'Husqvarna Svartpilen 401 / 801 — modern interpretiert, ab 6.600 €',
        ],
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1568708167433-f71cce499682?w=1200&q=85',
        caption: 'Scrambler sind für Schotterpisten gebaut — aber die meisten werden auf Asphalt gefahren.',
      },
      { type: 'h2', text: 'Custom-Scrambler: Typische Basen und Kosten' },
      {
        type: 'p',
        text: 'Ein guter Custom-Scrambler entsteht aus einer soliden Basis. Die Klassiker sind Honda CB550/650, Yamaha XS650, Kawasaki W650 und die BMW R80/R100. Alle bieten robuste Motoren, reichlich Platz für Umbauten und eine TÜV-freundliche Geometrie. Ein qualitativ hochwertiger Custom-Scrambler startet realistisch bei 9.000 €, spezialisierte Builds aus renommierten Workshops liegen zwischen 14.000 und 22.000 €.',
      },
      { type: 'h2', text: 'Technische Prüfpunkte vor dem Kauf' },
      {
        type: 'list',
        items: [
          'Federwege: mindestens 140 mm vorn, sonst ist "Scrambler" nur ein Aufkleber',
          'Stollenreifen: sichtbare Profiltiefe, keine Risse an den Flanken, passende Dimensionen im Fahrzeugschein',
          'Auspuffanlage: hochgelegt, mit Schutzblech, mit gültigem ABE oder Einzeltragung',
          'Rahmengeometrie: ausreichende Bodenfreiheit, stabiler Unterfahrschutz',
          'Elektrik: hinreichender Schutz vor Spritzwasser und Schlamm',
          'Sitzhöhe: Scrambler sind oft hoch (820-870 mm) — unbedingt vor dem Kauf Probe sitzen',
        ],
      },
      { type: 'h2', text: 'Preise: Was realistisch ist' },
      {
        type: 'p',
        text: 'Neue Werks-Scrambler beginnen bei ca. 5.300 € (Royal Enfield) und gehen bis 20.000 €+ (Triumph XE Spezialausstattungen). Gebrauchte Werksmodelle mit wenig Kilometern liegen oft bei 60-75% des Neupreises. Custom-Scrambler-Builds aus deutschen Workshops starten bei 9.000 € und können je nach Aufwand und Teilewahl schnell 20.000 € übersteigen. Finger weg von Angeboten unter 4.500 € — entweder stimmt die Geschichte nicht oder das Bike hat Mängel, die dich später mehr kosten als der Kaufpreis.',
      },
      {
        type: 'quote',
        text: 'Ein Scrambler muss dreckig werden dürfen. Wenn dir das Bike zu schade für Feldwege ist, hast du den falschen Stil gekauft.',
      },
      {
        type: 'cta',
        text: 'Alle Scrambler im Marketplace',
        href: '/bikes/scrambler',
        label: 'Scrambler entdecken',
      },
    ],
  },

  {
    slug: 'bobber-kaufen-guide',
    title: 'Bobber kaufen: Der Kaufratgeber für echte Low-Rider',
    metaTitle: 'Bobber kaufen 2026 — Modelle, Preise & Prüfpunkte',
    metaDescription:
      'Bobber kaufen: Von Harley bis BMW — die besten Basis-Bikes, realistische Preise und worauf du beim Kauf achten musst.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Vom klassischen Harley-Bobber bis zum modernen Hardtail-Custom — was einen guten Bobber ausmacht und was er kosten darf.',
    coverImage:
      'https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=1200&q=85',
    publishedAt: '2026-03-28',
    readTime: '12 min',
    author: 'MotoDigital Redaktion',
    tags: ['Bobber', 'Kaufratgeber', 'Harley-Davidson', 'BMW', 'Custom'],
    relatedSlugs: ['harley-custom-werkstatt-finden', 'was-kostet-ein-custom-bike', 'tuev-eintragung-custom-bike'],
    faq: [
      { q: 'Was ist ein Bobber?', a: 'Ein Bobber ist ein radikal reduziertes Custom-Motorrad. Klassisch mit Hardtail-Rahmen, Monosattel und fettem Hinterreifen. Der Begriff kommt aus den USA der 1940er — Veteranen "bobbten" ihre Harleys, indem sie alles Überflüssige entfernten.' },
      { q: 'Was kostet ein Bobber?', a: 'Werks-Bobber wie Triumph Bonneville Bobber oder Indian Scout Bobber starten bei 10.500 €. Custom-Bobber-Builds beginnen bei ca. 8.000 € für einfache Umbauten und erreichen bei renommierten Buildern 20.000-30.000 €.' },
      { q: 'Welches Bike eignet sich als Bobber-Basis?', a: 'Die besten Basis-Bikes sind Harley-Davidson Sportster, BMW R-Serie (R80/R100), Triumph Bonneville, Honda Shadow und Yamaha XV-Modelle. Alle bieten genug Drehmoment und die passende Silhouette.' },
      { q: 'Ist ein Hardtail-Bobber für den Alltag geeignet?', a: 'Hardtail-Bobber übertragen jede Unebenheit direkt auf den Fahrer. Für kurze Strecken und urbane Fahrten sind sie in Ordnung, für längere Touren jedoch unkomfortabel. Softtail-Varianten sind alltagstauglicher.' },
      { q: 'Was ist der Unterschied zwischen Bobber und Chopper?', a: 'Ein Bobber ist reduziert, kurz und kompakt — Ästhetik durch Weglassen. Ein Chopper ist theatralischer, hat lange Gabeln, gestreckte Silhouette und stilistische Elemente wie "Ape Hangers"-Lenker. Bobber = Zweck, Chopper = Inszenierung.' },
    ],
    content: [
      {
        type: 'intro',
        text: 'Ein Bobber ist nicht bloß ein Motorrad mit abgesägtem Hinterteil. Er ist die radikalste Form der Reduktion, die die Custom-Welt kennt: alles, was nicht nötig ist, wird entfernt. Wer einen Bobber kauft, kauft eine Haltung. Dieser Ratgeber zeigt dir, worauf es beim Kauf ankommt.',
      },
      { type: 'h2', text: 'Was ist ein Bobber überhaupt?' },
      {
        type: 'p',
        text: 'Der Begriff "Bobber" stammt aus den USA der 1940er. Zurückgekehrte Weltkriegsveteranen "bobbten" ihre Harleys und Indians, indem sie alle überflüssigen Teile entfernten: Schutzbleche gekürzt, Beifahrersitz weg, Tank verkleinert. Das Ergebnis: ein leichteres, schnelleres, puristisches Motorrad. Der klassische Bobber hat einen Hardtail-Rahmen (also keine Hinterradfederung), einen Monosattel und einen auffällig fetten Hinterreifen.',
      },
      { type: 'h2', text: 'Werks-Bobber vs. Custom-Bobber' },
      {
        type: 'p',
        text: 'Werks-Bobber wie die Triumph Bonneville Bobber, Indian Scout Bobber oder Harley-Davidson Sportster S verbinden Bobber-Ästhetik mit moderner Technik — ABS, Einspritzung, Komfort. Custom-Bobber sind kompromissloser: oft Hardtail-Rahmen, Kickstarter, spartanische Elektrik. Wer das erste Mal einen Bobber kauft, fährt meistens besser mit einem Werksmodell. Wer die Bobber-Kultur wirklich leben will, landet früher oder später beim Custom-Build.',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1545305281-49bc3ecf5412?w=1200&q=85',
        caption: 'Ein guter Bobber ist reduziert bis zum Wesentlichen — ohne ins Karikaturistische zu kippen.',
      },
      { type: 'h2', text: 'Die besten Basis-Bikes für Bobber-Builds' },
      {
        type: 'list',
        items: [
          'Harley-Davidson Sportster (883 / 1200) — der Klassiker, unzählige Aftermarket-Teile, ab 6.000 € als Basis',
          'BMW R-Serie (R80 / R100 / R100R) — Boxer-Charakter, Zuverlässigkeit, ab 3.500 € als Basis',
          'Triumph Bonneville (alle Generationen) — ikonische Silhouette, agiler als Harleys, ab 4.500 €',
          'Honda Shadow VT600 / VT750 — günstig, robust, wenig Respekt in der Szene (aber das ist dein Problem, nicht ihres)',
          'Kawasaki VN800 / VN900 — unterschätzt, zuverlässig, ab 3.000 € als Basis',
          'Yamaha XV750 / XV1100 Virago — klassischer V-Twin, riesige Community',
        ],
      },
      { type: 'h2', text: 'Technische Prüfpunkte beim Kauf' },
      {
        type: 'list',
        items: [
          'Rahmen: Bei Hardtail-Umbauten unbedingt Schweißnähte und Geometrie prüfen — ungenügend gefertigte Rahmen sind lebensgefährlich',
          'Sitzhöhe: Bobber sind oft niedrig (680-720 mm) — das kann bei längerer Fahrt unbequem werden',
          'Reifendimensionen: Breite Hinterreifen (180-240 mm) müssen im Fahrzeugschein eingetragen sein',
          'Kickstarter-only oder E-Start: Bei Custom-Bobbern oft ohne E-Starter — für den Alltag eine echte Frage',
          'TÜV-Dokumentation: Jede Modifikation braucht eine Eintragung, sonst erlischt die Betriebserlaubnis',
          'Öl- und Vibrations-Checks: Hardtail-Rahmen übertragen alles auf den Fahrer und jede Schraube am Bike',
        ],
      },
      { type: 'h2', text: 'Preise: Realistische Budgets' },
      {
        type: 'p',
        text: 'Werks-Bobber beginnen bei 10.500 € (Indian Scout Bobber Sixty) und gehen bis 18.000 € (Triumph Bonneville Bobber Black). Gebrauchte Werksmodelle mit 10-30.000 km sind häufig 30-40% günstiger als Neupreise. Custom-Bobber-Builds starten bei 8.000 € für einfache Umbauten und erreichen bei renommierten Buildern schnell 20.000-30.000 €. Ein Hardtail-Custom mit handgefertigtem Rahmen beginnt nie unter 15.000 € — alles darunter solltest du skeptisch prüfen.',
      },
      {
        type: 'cta',
        text: 'Bobber bei MotoDigital ansehen',
        href: '/bikes/bobber',
        label: 'Bobber durchstöbern',
      },
    ],
  },

  {
    slug: 'cafe-racer-selber-bauen-basis-bikes',
    title: 'Cafe Racer selber bauen: Die 10 besten Basis-Bikes',
    metaTitle: 'Cafe Racer selber bauen — Die 10 besten Basis-Bikes 2026',
    metaDescription:
      'Cafe Racer selber bauen: Diese 10 Basis-Bikes sind für deinen ersten Umbau ideal — inkl. Schwierigkeitsgrad, Preise und Eigenheiten.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Die Basis entscheidet zu 70% über den Erfolg deines Umbaus. Diese 10 Bikes haben sich als Cafe-Racer-Basen bewährt.',
    coverImage:
      'https://images.unsplash.com/photo-1664710696445-abb080659c3d?w=1200&q=85',
    publishedAt: '2026-03-20',
    readTime: '14 min',
    author: 'MotoDigital Redaktion',
    tags: ['Cafe Racer', 'DIY', 'Umbau', 'Basis-Bike', 'Honda', 'Yamaha', 'BMW'],
    relatedSlugs: ['cafe-racer-umbau', 'cafe-racer-kaufen-guide', 'warum-heisst-es-cafe-racer', 'tuev-eintragung-custom-bike'],
    faq: [
      { q: 'Was ist die beste Basis für einen Cafe Racer?', a: 'Die Klassiker sind Honda CB750, Yamaha SR500, BMW R80/R100 und Kawasaki Z650. Alle bieten luftgekühlte Motoren, einfache Wartung und gute Teileverfügbarkeit. Die richtige Basis hängt von Budget, Erfahrung und gewünschtem Charakter ab.' },
      { q: 'Wie lange dauert ein Cafe-Racer-Umbau?', a: 'Ein professioneller Umbau umfasst 200 bis 600 Arbeitsstunden. Selbst mit guter Werkstatt-Infrastruktur solltest du für einen kompletten Selbstbau 12-24 Monate einplanen, inklusive Beschaffung und TÜV-Abnahme.' },
      { q: 'Was kostet ein Cafe-Racer-Selbstbau?', a: 'Die reinen Materialkosten liegen bei 3.000-8.000 € (Basisbike + Teile + Lack). Dazu kommen Werkzeug, Werkstattmiete und eventuelle Auftragsarbeiten (Schweißen, Pulverbeschichtung). Gesamtbudget realistisch: 5.000-12.000 €.' },
      { q: 'Kann ich einen Cafe Racer ohne Schweißkenntnisse bauen?', a: 'Teilweise — viele kosmetische Umbauten (Tank, Sitzbank, Lenker, Lack) gehen ohne Schweißen. Aber echte Cafe Racer erfordern oft Rahmenkürzungen oder neue Heckausleger. Alternative: Schweißarbeiten extern vergeben.' },
      { q: 'Welche Basis ist für Anfänger am einfachsten?', a: 'Die Yamaha SR500/400 und BMW R80/R100 sind für Einsteiger am zugänglichsten: robuste Motoren, einfache Technik, massive Community und viele vorhandene Umbau-Anleitungen.' },
    ],
    content: [
      {
        type: 'intro',
        text: 'Der größte Fehler beim ersten Cafe-Racer-Umbau: Das falsche Basis-Bike kaufen. Eine schlechte Grundlage lässt sich mit Budget nicht korrigieren — egal wie gut der Builder ist. Diese 10 Bikes eignen sich als Cafe-Racer-Basis besonders gut: ausgewogen zwischen Preis, Teileversorgung, Motorcharakter und TÜV-Fähigkeit.',
      },
      { type: 'h2', text: 'Was eine gute Cafe-Racer-Basis ausmacht' },
      {
        type: 'list',
        items: [
          'Luftgekühlter Motor: einfacher zu warten, kein Kühlerproblem beim Verkleidungsumbau',
          'Robuster Stahlrohrrahmen: schweißbar, modifizierbar, historisch stimmig',
          'Ersatzteilversorgung: Classic-Bikes mit starker Community haben verfügbare Teile',
          'Rahmen ohne Unterzug: erlaubt saubere Heckumbauten und Batteriepositionierung',
          'Eingetragene Leistung zwischen 30 und 80 PS: für den Alltag ausreichend, nicht überdimensioniert',
        ],
      },
      { type: 'h2', text: '1. Honda CB750 (1969-1978) — der Klassiker' },
      {
        type: 'p',
        text: 'Die erste moderne Serienmaschine, bekannt aus unzähligen Cafe-Racer-Builds. Luftgekühlter Vierzylinder, tadellose Zuverlässigkeit, riesige Community. Nachteil: Preise sind in den letzten Jahren deutlich gestiegen. Gebraucht ab 3.500 €, restaurierte Exemplare schnell 6.000 €+.',
      },
      { type: 'h2', text: '2. Yamaha SR500 / SR400 — Einzylinder-Ikone' },
      {
        type: 'p',
        text: 'Einer der besten Einstiegsbikes für Selbstbauer. Robuster Einzylinder, simpler Rahmen, Kickstarter. Der Umbau zum Cafe Racer ist gestalterisch fast schon vorgezeichnet. Ab 2.500 € als Basis verfügbar.',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1568708167243-438efa1d7697?w=1200&q=85',
        caption: 'Eine gute Basis gibt dir die Silhouette geschenkt — du musst nur noch das Überflüssige weglassen.',
      },
      { type: 'h2', text: '3. BMW R-Serie (R80 / R100) — Boxer-Charakter' },
      {
        type: 'p',
        text: 'Die BMW R-Serie ist für Cafe-Racer-Projekte so etwas wie die Königsdisziplin. Der Boxer-Motor definiert die Silhouette, der Rahmen ist herausragend verarbeitet, die Zuverlässigkeit legendär. Preise ab 3.500 € für ältere Exemplare, 5.500 €+ für gepflegte R100.',
      },
      { type: 'h2', text: '4. Kawasaki Z650 (1976-1983) — unterschätzte Rarität' },
      {
        type: 'p',
        text: 'Die kleine Schwester der Z900, oft günstiger und leichter. Perfekte Geometrie für Cafe Racer, starker Reihenvierzylinder, weniger Aftermarket-Teile als bei Honda — was den Build einzigartiger macht. Basis ab 2.200 €.',
      },
      { type: 'h2', text: '5. Honda CB450 / CB500T — der heimliche Favorit' },
      {
        type: 'p',
        text: 'Weniger bekannt als die CB750, aber technisch hochinteressant: DOHC-Parallel-Twin, feine Vergaser, kompakte Bauart. Ideal für urbane Cafe Racer mit schlanker Linie. Ab 1.800 € gebraucht.',
      },
      { type: 'h2', text: '6. Ducati Monster (frühe Modelle, 1993-2001)' },
      {
        type: 'p',
        text: 'Kein klassischer Cafe Racer, aber eine fantastische Basis für moderne Interpretationen. Desmodromischer V-Twin, Gitterrohrrahmen — das Ergebnis sieht nie langweilig aus. Gebrauchte 600/750er ab 2.800 €.',
      },
      { type: 'h2', text: '7. Suzuki GS550 / GS750 (1977-1983)' },
      {
        type: 'p',
        text: 'Oft günstiger als vergleichbare Hondas, technisch auf Augenhöhe, teilweise sogar robuster. Besonders die GS550 ist ein echter Geheimtipp unter Budget-Buildern. Ab 1.500 € als Basis.',
      },
      { type: 'h2', text: '8. Moto Guzzi V7 (klassische Modelle)' },
      {
        type: 'p',
        text: 'Längs eingebauter V-Twin, italienischer Charme, einzigartiger Klang. Der Umbau erfordert mehr Planung (Kardanantrieb!), aber das Ergebnis ist unverwechselbar. Ältere Exemplare ab 3.200 €.',
      },
      { type: 'h2', text: '9. Triumph Bonneville T100 (moderne Generation)' },
      {
        type: 'p',
        text: 'Modernere Technik als die Klassiker — Einspritzung, ABS-Optionen. Das Bike sieht ab Werk schon fast wie ein Cafe Racer aus, ein Umbau muss es nur freilegen. Gebraucht ab 5.800 €.',
      },
      { type: 'h2', text: '10. Honda CX500 — das Bike, das niemand sieht' },
      {
        type: 'p',
        text: 'Wasser gekühlter V-Twin, Kardanantrieb, kompakte Bauart. Wird in der Cafe-Racer-Szene konsequent unterschätzt — zu Unrecht. Wer einen wirklich eigenständigen Build möchte, startet hier. Ab 1.800 € verfügbar.',
      },
      {
        type: 'quote',
        text: 'Die beste Basis ist die, die du wirklich fährst — nicht die, die am besten auf Instagram aussieht.',
      },
      {
        type: 'cta',
        text: 'Du willst umbauen lassen statt selbst bauen?',
        href: '/custom-werkstatt',
        label: 'Werkstätten finden',
      },
    ],
  },

  {
    slug: 'was-kostet-ein-custom-bike',
    title: 'Was kostet ein Custom Bike? Preise, Aufwand & versteckte Kosten',
    metaTitle: 'Was kostet ein Custom Bike? Preise, Aufwand & versteckte Kosten',
    metaDescription:
      'Custom Bike Kosten im Überblick: Vom Einsteiger-Umbau für 6.000 € bis zum High-End-Build für 40.000 €+. Plus alle versteckten Kostenfallen.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Von 6.000 € bis 40.000 € — wir zeigen dir, was ein Custom Bike wirklich kostet und wo du Geld verlierst, wenn du nicht aufpasst.',
    coverImage:
      'https://images.unsplash.com/photo-1720722594991-35138eebe81a?w=1200&q=85',
    publishedAt: '2026-03-15',
    readTime: '10 min',
    author: 'MotoDigital Redaktion',
    tags: ['Kosten', 'Preise', 'Custom', 'Budget', 'Kaufratgeber'],
    relatedSlugs: ['cafe-racer-kaufen-guide', 'bobber-kaufen-guide', 'tuev-eintragung-custom-bike'],
    faq: [
      { q: 'Was kostet ein Custom Bike im Durchschnitt?', a: 'Ein qualitativ hochwertiger Custom-Build kostet zwischen 10.000 und 20.000 €. Einsteiger-Umbauten starten bei 6.000 €, High-End-Builds aus renommierten Workshops erreichen 20.000-40.000 €+.' },
      { q: 'Warum sind Custom Bikes so teuer?', a: 'Ein professioneller Umbau umfasst 200-600 Arbeitsstunden bei 75-95 € Stundensatz. Allein die Arbeitszeit kostet 15.000-55.000 €. Dazu kommen Materialkosten, Gutachten, Garantieleistungen und Kalkulationsrisiko.' },
      { q: 'Welche versteckten Kosten gibt es?', a: 'TÜV-Einzelabnahme (200-600 €), Teilegutachten (30-250 €), höhere Versicherungsprämien (bis zu 30% Aufschlag), Transportkosten (300-800 €) und Rücklagen für Nachjustierungen (500-2.000 €). Rechne mit 10-15% Zusatzkosten gegenüber dem Werkstattangebot.' },
      { q: 'Lohnt sich ein Custom Bike finanziell?', a: 'Finanziell rechnet sich ein Custom Bike meist nicht — der Wertverlust beim Wiederverkauf liegt oft bei 20-35%. Der Wert liegt in der Individualität, der Langlebigkeit und der persönlichen Bindung an das Objekt, nicht im Wiederverkaufswert.' },
      { q: 'Was ist günstiger: Werkstatt oder Selbstbau?', a: 'Ein Selbstbau kann Materialkosten auf 3.000-8.000 € drücken, erfordert aber 400-800 Stunden Eigenarbeit, Werkzeug und Werkstatt-Infrastruktur. Realistisch ist die Ersparnis geringer als gedacht — und das Ergebnis selten auf Werkstatt-Niveau.' },
    ],
    content: [
      {
        type: 'intro',
        text: 'Die meistgestellte Frage an jeden Custom-Builder lautet: "Was kostet sowas eigentlich?" Die ehrliche Antwort: Zwischen 6.000 € und 40.000 €+ — je nach Tiefe des Umbaus, Builder, Basis und gewünschten Komponenten. Dieser Ratgeber schlüsselt auf, wofür dein Geld geht und welche versteckten Kosten nie im Angebot stehen.',
      },
      { type: 'h2', text: 'Die drei Preiskategorien' },
      {
        type: 'list',
        items: [
          'Einsteiger (6.000 - 10.000 €): kosmetische Umbauten auf Serienbasis, Lackierung, Sitzbank, Lenker, kleinere Anpassungen',
          'Mittelklasse (10.000 - 20.000 €): substantielle Modifikationen — neue Tanks, Heckumbau, Elektrik-Neuaufbau, individuelle Lackierung, gute Fahrwerkskomponenten',
          'High-End (20.000 - 40.000 €+): handgefertigte Rahmen, vollständige Motorrevision, individuelle Anfertigungen, namhafte Builder, Schaustück-Qualität',
        ],
      },
      { type: 'h2', text: 'Was du für dein Geld bekommst' },
      {
        type: 'p',
        text: 'Ein professioneller Werkstattumbau umfasst typischerweise 200 bis 600 Arbeitsstunden. Bei einem Stundensatz von 75-95 € ergeben sich allein Arbeitskosten von 15.000 bis 55.000 €. Dazu kommen Materialkosten (Basisbike, Komponenten, Lackierung) und die Kalkulation für Garantie und Betriebsrisiko. Wer für 6.000 € einen "Custom-Umbau" verkauft, hat entweder die Arbeitszeit nicht kalkuliert oder spart massiv an Qualität.',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1522850003946-16cb11d41a86?w=1200&q=85',
        caption: 'High-End-Customs sind Investitionen — keine Fortbewegungsmittel.',
      },
      { type: 'h2', text: 'Versteckte Kosten, die nie im Angebot stehen' },
      {
        type: 'list',
        items: [
          'TÜV-Einzelabnahme: 200-600 € je nach Umfang der Modifikationen',
          'Teilegutachten für bestimmte Komponenten: 80-250 € pro Gutachten',
          'Versicherung: Custom-Bikes in der Versicherung oft teurer — bis zu 30% Aufschlag möglich',
          'Transport: Ein Custom-Bike vom Builder zu dir — realistisch 300-800 € bei professioneller Spedition',
          'Nach-Arbeiten: 500-2.000 € Rücklagen für die ersten 2.000 km (Einstellungen, kleine Nachbesserungen)',
          'Wertverlust beim Wiederverkauf: Custom-Bikes verlieren bei Privatverkauf oft 20-35% gegenüber dem Neupreis',
        ],
      },
      { type: 'h2', text: 'Werkstatt-Umbau vs. Selbstbau' },
      {
        type: 'p',
        text: 'Ein Selbstbau kann die Materialkosten auf 3.000-8.000 € drücken — aber nur, wenn du über Schweißkenntnisse, ein gut ausgestattetes Atelier und 400-800 Stunden Zeit verfügst. Realistischerweise ist ein semiprofessioneller Selbstbau nach ca. 2-3 Jahren abgeschlossen. Wer rechnet, stellt schnell fest: Die vermeintliche Ersparnis ist oft geringer als erwartet — und das Ergebnis selten auf dem Niveau einer Werkstatt.',
      },
      { type: 'h2', text: 'Wofür lohnt sich das Geld wirklich?' },
      {
        type: 'p',
        text: 'Die größten Qualitätsunterschiede bei Custom-Bikes liegen in drei Bereichen: Schweißarbeiten (sichtbare Nähte an Rahmen, Tank, Heckauslegern), Elektrik (ein sauberer neuer Kabelbaum ist die unterschätzteste Qualitätsmerkmal überhaupt) und Lackierung (Handlackierungen unterscheiden sich dramatisch von Spritzpistolen-Jobs). Wer hier spart, bereut es spätestens nach 10.000 km. Wer hier investiert, bekommt ein Bike, das 20 Jahre lang Geschichte erzählt.',
      },
      {
        type: 'quote',
        text: 'Du kaufst nicht das Material — du kaufst die Zeit eines Menschen, der weiß, was er tut.',
      },
      {
        type: 'cta',
        text: 'Custom-Werkstätten und ihre Preise vergleichen',
        href: '/custom-werkstatt',
        label: 'Werkstätten finden',
      },
    ],
  },

  {
    slug: 'tuev-eintragung-custom-bike',
    title: 'TÜV-Eintragung für Umbauten: Was in Deutschland wirklich legal ist',
    metaTitle: 'TÜV-Eintragung Custom Bike — Was in Deutschland legal ist',
    metaDescription:
      'TÜV-Abnahme für Custom Bikes: Welche Umbauten eintragungspflichtig sind, was ohne ABE erlaubt ist und was deine Betriebserlaubnis gefährdet.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Stummellenker, Tankumbau, anderes Heck — was darfst du in Deutschland wirklich und was kostet dich die Betriebserlaubnis?',
    coverImage:
      'https://images.unsplash.com/photo-1527537232679-89f0d63ea3f7?w=1200&q=85',
    publishedAt: '2026-03-08',
    readTime: '9 min',
    author: 'MotoDigital Redaktion',
    tags: ['TÜV', 'Eintragung', 'StVZO', 'Betriebserlaubnis', 'Deutschland', 'Recht'],
    relatedSlugs: ['legaler-motorrad-auspuff-ece-zulassung', 'cafe-racer-selber-bauen-basis-bikes', 'bobber-kaufen-guide'],
    faq: [
      { q: 'Was ist beim Custom-Umbau eintragungspflichtig?', a: 'Eintragungspflichtig sind alle Modifikationen, die die Betriebserlaubnis betreffen: Lenker, Sitzbank (wenn sich die Sitzhöhe ändert), Auspuffanlage, Beleuchtung, Reifen anderer Dimension, Rahmenmodifikationen, Tank und Bremsen.' },
      { q: 'Wie viel kostet eine TÜV-Einzelabnahme?', a: 'Eine Einzelabnahme nach § 21 StVZO kostet je nach Prüfumfang 150-600 €. Teilegutachten sind oft kostenlos (in Teilen enthalten) oder 30-80 € beim Hersteller. Die Eintragung bei der Zulassungsstelle kostet 15-30 €.' },
      { q: 'Brauche ich ein Gutachten für jeden Umbau?', a: 'Nicht immer. Bei Teilen mit ABE (Allgemeine Betriebserlaubnis) reicht die Eintragung beim TÜV. Bei Teilegutachten musst du die Prüfdokumente beim TÜV vorlegen. Fehlt beides, ist eine Einzelabnahme nach §21 StVZO erforderlich.' },
      { q: 'Was passiert, wenn ich einen Umbau nicht eintragen lasse?', a: 'Die Betriebserlaubnis erlischt. Bei einer Polizeikontrolle drohen Bußgeld, Punkte in Flensburg und Stilllegung. Zusätzlich greift die Kfz-Versicherung bei Unfällen nicht — im Schadensfall haftest du persönlich.' },
      { q: 'Darf ich Stummellenker an meinem Motorrad montieren?', a: 'Nur mit ABE oder nach Einzelabnahme. Die Geometrie der Lenkung (Drehradius, Anschläge) wird geprüft. Nicht eingetragene Stummellenker führen sofort zum Erlöschen der Betriebserlaubnis.' },
    ],
    content: [
      {
        type: 'intro',
        text: 'Die schlechteste Nachricht beim Custom-Bike-Kauf: Deine Betriebserlaubnis ist erloschen. Kein TÜV, keine Versicherung, keine legale Straßenfahrt. Um das zu vermeiden, solltest du wissen, was in Deutschland eintragungspflichtig ist — und welche Umbauten du mit welchen Papieren absichern musst.',
      },
      { type: 'h2', text: 'Was ist eintragungspflichtig?' },
      {
        type: 'p',
        text: 'Grundsätzlich gilt: Jede Modifikation, die die Betriebserlaubnis nach § 19 StVZO betreffen kann, ist eintragungs- oder abnahmepflichtig. Praktisch bedeutet das: Fast alles außer rein kosmetischen Veränderungen wie Lackierung oder Sitzbankbezug.',
      },
      {
        type: 'list',
        items: [
          'Lenker: Andere Form, andere Breite, anderer Biegeradius — immer eintragungspflichtig',
          'Sitzbank: Sitzhöhe ändert sich → Eintragung erforderlich',
          'Auspuffanlage: Immer prüfpflichtig, Geräuschemissionen dokumentieren',
          'Beleuchtung: LED-Umbauten, andere Scheinwerfer, Mini-Blinker — alle brauchen ABE oder Einzelabnahme',
          'Reifen: Andere Dimensionen oder Profile → Einzelabnahme, manchmal Freigabe des Fahrzeugherstellers nötig',
          'Rahmen: Kürzung, Hardtail-Umbau, Heckmodifikation — Einzelabnahme zwingend',
          'Tank: Anderes Volumen oder Form → Einzelabnahme',
          'Bremsen: Andere Systeme, andere Dimensionen → Einzelabnahme',
        ],
      },
      { type: 'h2', text: '§21 StVZO — die Einzelabnahme' },
      {
        type: 'p',
        text: 'Wenn keine ABE (Allgemeine Betriebserlaubnis) oder kein Teilegutachten für ein Bauteil existiert, greift die Einzelabnahme nach § 21 StVZO. Der Prüfingenieur (TÜV, DEKRA, GTÜ) beurteilt den Einzelfall anhand der geltenden technischen Anforderungen. Das ist der häufigste Weg für Custom-Bike-Modifikationen.',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1561811565-6ed172b54cbe?w=1200&q=85',
        caption: 'Eine saubere Dokumentation aller Teile und Gutachten ist bei der TÜV-Abnahme wichtiger als Eile.',
      },
      { type: 'h2', text: 'Welche Gutachten du brauchst' },
      {
        type: 'list',
        items: [
          'Teilegutachten: Hersteller-seitige Prüfung einzelner Komponenten (z.B. Lenker, Blinker) — kein Behördengang nötig, aber Eintragung durch TÜV',
          'Allgemeine Betriebserlaubnis (ABE): Hersteller garantiert Straßenzulassung → Eintragung nicht immer nötig',
          'Einzelabnahme nach § 21: Notwendig bei fehlender ABE/Gutachten — individuelle Prüfung',
          'Fahrzeugeinzelabnahme: Bei selbstgebauten Rahmen oder kompletten Umbauten — aufwendiger, aber möglich',
        ],
      },
      { type: 'h2', text: 'Typische Fehler, die deine Betriebserlaubnis kosten' },
      {
        type: 'list',
        items: [
          'Nicht eingetragene Lenker (selbst wenn es "nur" ein Lenkerstummel ist)',
          'Auspuffanlage ohne gültige ABE und ohne Einzelabnahme',
          'Fehlerhafte oder nicht zugelassene Beleuchtung (insbesondere Mini-Blinker)',
          'Reifen, die nicht in der Zulassungsbescheinigung Teil I (früher Fahrzeugschein) stehen',
          'Verbreiterte Hinterreifen ohne Gutachten oder Einzelabnahme',
          'Sitzbanktausch, der die Sitzhöhe wesentlich verändert, ohne Abnahme',
        ],
      },
      { type: 'h2', text: 'Der Ablauf einer TÜV-Einzelabnahme' },
      {
        type: 'p',
        text: 'Nach der Modifikation vereinbarst du einen Termin bei einer amtlich anerkannten Prüforganisation. Dein Fahrzeug muss vollständig modifiziert, straßentauglich und sauber sein. Du bringst mit: alle Kaufbelege der Komponenten, vorhandene Teilegutachten, Zulassungsbescheinigung Teil I + II, TÜV-Brief. Der Prüfingenieur kontrolliert Geometrie, Beleuchtung, Bremsen, Geräuschemissionen, Abgaswerte (wenn relevant). Bei Erfolg bekommst du einen Eintragungsvermerk — anschließend musst du diesen bei der Zulassungsstelle in die Fahrzeugpapiere eintragen lassen.',
      },
      { type: 'h2', text: 'Was das Ganze kostet' },
      {
        type: 'p',
        text: 'Eine Einzelabnahme kostet je nach Prüfumfang 150-600 €. Teilegutachten selbst kosten oft nichts (liegen den Teilen bei) oder 30-80 € beim Hersteller. Die Eintragung bei der Zulassungsstelle fällt mit etwa 15-30 € an. Insgesamt solltest du für einen gut gemachten Custom-Umbau mit 300-1.000 € Behördenkosten rechnen. Zum Vergleich: Wenn deine Betriebserlaubnis bei einer Polizeikontrolle als erloschen eingestuft wird, verlierst du nicht nur deinen Versicherungsschutz — du bekommst Punkte in Flensburg, eine Geldstrafe und musst das Bike sofort stilllegen.',
      },
      {
        type: 'quote',
        text: 'Der teuerste Umbau ist immer der, den du nicht eintragen lässt — weil ein Unfall ohne gültige Betriebserlaubnis alles andere teuer macht.',
      },
      {
        type: 'cta',
        text: 'Werkstätten, die komplette TÜV-Abnahmen übernehmen',
        href: '/custom-werkstatt',
        label: 'Werkstatt finden',
      },
    ],
  },

  {
    slug: 'cafe-racer-kaufen-guide',
    title: 'Cafe Racer kaufen: Der vollständige Leitfaden für 2026',
    metaTitle: 'Cafe Racer kaufen 2026 — Tipps, Preise & Worauf achten',
    metaDescription:
      'Cafe Racer kaufen: Alles über Rahmenprüfung, TÜV, Preise und die besten Modelle 2026. Unser Guide für Einsteiger und Kenner.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Von der Rahmenprüfung bis zur Zulassung — unser vollständiger Leitfaden für Custom-Bike-Käufer.',
    coverImage:
      'https://images.unsplash.com/photo-1568708167243-438efa1d7697?w=1200&q=85',
    publishedAt: '2026-02-27',
    readTime: '15 min',
    author: 'MotoDigital Redaktion',
    tags: ['Cafe Racer', 'Kaufratgeber', 'Custom Motorcycle', 'TÜV', 'Deutschland'],
    relatedSlugs: ['warum-heisst-es-cafe-racer', 'cafe-racer-selber-bauen-basis-bikes', 'was-kostet-ein-custom-bike'],
    content: [
      {
        type: 'intro',
        text: 'Ein Cafe Racer zu kaufen ist keine gewöhnliche Fahrzeugentscheidung — es ist der Kauf eines handgefertigten Einzelstücks mit einer Geschichte. Dieser Leitfaden zeigt dir, worauf du wirklich achten musst, damit dein Traumbike kein Alptraum wird.',
      },
      {
        type: 'h2',
        text: 'Was macht einen guten Cafe Racer aus?',
      },
      {
        type: 'p',
        text: 'Ein überzeugender Cafe Racer verbindet ästhetische Kohärenz mit technischer Zuverlässigkeit. Das bedeutet: keine Kompromisse beim Rahmen, sorgfältige Elektrik und Komponenten, die nicht nur gut aussehen, sondern auch für den Alltag taugen.',
      },
      {
        type: 'p',
        text: 'Entscheidend ist die Konsistenz des Konzepts. Die besten Builds folgen einer klaren gestalterischen Idee — jedes Teil, von der Stummellenker-Höhe bis zur Sitzposition, ist eine bewusste Entscheidung. Sobald du Kompromisse erkennst, die nicht aus gestalterischen, sondern aus Budgetgründen entstanden sind, solltest du aufmerksam werden.',
      },
      {
        type: 'h2',
        text: 'Preise & Budget',
      },
      {
        type: 'p',
        text: 'Qualitativ hochwertige Cafe Racer beginnen realistisch bei 8.000 €, handgefertigte Einzelstücke aus renommierten Workshops liegen häufig zwischen 12.000 und 25.000 €. Alles darunter sollte deine Skepsis wecken — entweder wurde beim Material gespart oder der Builder hat seine Arbeitszeit nicht angemessen kalkuliert. Beide Szenarien sind kein gutes Zeichen. Bedenke: Ein professioneller Umbau umfasst 200 bis 600 Arbeitsstunden.',
      },
      {
        type: 'h2',
        text: 'Technische Prüfpunkte vor dem Kauf',
      },
      {
        type: 'list',
        items: [
          'Rahmenprüfung: Schweißnähte auf Risse und Verarbeitungsqualität prüfen, Sichtprüfung auf Korrosion',
          'Fahrzeugpapiere: Originalfahrzeugbrief, Eintragungen der Umbauten in den Fahrzeugschein, gültige TÜV-Abnahme',
          'Elektrik: Komplette Neuverdrahtung mit modernem Kabelbaum (z. B. Motogadget m.unit) ist ein Qualitätsmerkmal',
          'Bremsen: Stahlflexleitungen, neue Bremsbeläge, Scheibenzustand — besonders wichtig bei älteren Basen',
          'Motor: Dokumentierte Revision oder Kilometernachweis, kein Ölaustritt, gleichmäßiger Kaltstart',
          'TÜV & Zulassung: Alle eingetragenen Teile im Gutachten, keine offenen Mängel, Betriebserlaubnis aktuell',
        ],
      },
      {
        type: 'cta',
        text: 'Alle Cafe Racer ansehen',
        href: '/bikes/cafe-racer',
        label: 'Jetzt durchstöbern',
      },
    ],
  },

  {
    slug: 'scrambler-vs-tracker-vergleich',
    title: 'Scrambler vs. Tracker: Was ist der Unterschied und welcher passt zu dir?',
    metaTitle: 'Scrambler vs. Tracker — Unterschied & Kaufentscheidung 2026',
    metaDescription:
      'Scrambler oder Tracker? Wir erklären den Unterschied, zeigen die besten Modelle und helfen dir bei der Entscheidung.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Beide Stile sind vielseitig — aber der Unterschied liegt im Detail. Wir erklären, was dich erwartet.',
    coverImage:
      'https://images.unsplash.com/photo-1582092722992-b2f960bafbfb?w=1200&q=85',
    publishedAt: '2026-02-06',
    readTime: '7 min',
    author: 'MotoDigital Redaktion',
    tags: ['Scrambler', 'Tracker', 'Kaufratgeber', 'Custom Motorcycle', 'Vergleich'],
    relatedSlugs: ['scrambler-kaufen-guide', 'cafe-racer-kaufen-guide', 'was-kostet-ein-custom-bike'],
    content: [
      {
        type: 'intro',
        text: 'Auf den ersten Blick sehen Scrambler und Tracker ähnlich aus — beide haben hohe Auspuffanlagen, offene Verkleidungen und strahlen eine gewisse Abenteuerlust aus. Doch ihre Philosophie, ihre Geometrie und ihr Fahrgefühl unterscheiden sich deutlich.',
      },
      {
        type: 'h2',
        text: 'Was ist ein Scrambler?',
      },
      {
        type: 'p',
        text: 'Der Scrambler entstand in den 1950ern als improvisiertes Offroad-Bike für Hobbyrennen. Charakteristisch sind hochgezogene Auspuffrohre, Stollenreifen mit breitem Profil, eine aufrechte Sitzposition und stabile Federwege. Ein Scrambler ist gemacht für Gelände und Asphalt gleichermaßen — er ist das Schweizer Taschenmesser unter den Custom-Stilen. Typische Basen sind Triumph T100, Honda CL350 oder BMW R nineT.',
      },
      {
        type: 'h2',
        text: 'Was ist ein Tracker?',
      },
      {
        type: 'p',
        text: 'Der Flat-Track-Racer war die Basis des Tracker-Stils. Ovale Staubpisten, keine Bremsen an der Vorderachse, maximale Agilität. Der moderne Street-Tracker übernimmt diese Ästhetik: Niedrige Lenker, schmale Tanks, konsequent leichte Bauweise und ein Fokus auf das Wesentliche. Ein Tracker wirkt schneller, aggressiver und städtischer als ein Scrambler. Typische Basen: Yamaha SR500, Honda CB550, Kawasaki W650.',
      },
      {
        type: 'h2',
        text: 'Die wichtigsten Unterschiede im Überblick',
      },
      {
        type: 'list',
        items: [
          'Reifen: Scrambler mit Stollenprofil (Dual-Sport), Tracker mit Slick- oder leichtem Straßenprofil',
          'Sitzposition: Scrambler aufrechter und entspannter, Tracker sportlicher und vorgeneigt',
          'Einsatzbereich: Scrambler Gelände + Straße, Tracker ausschließlich Asphalt',
          'Ästhetik: Scrambler abenteuerlich und rau, Tracker minimalistisch und urban',
          'Gewicht: Tracker tendenziell leichter, da weniger Schutzausstattung nötig',
          'Preis: Vergleichbar — qualitativ hochwertige Builds beider Stile ab ca. 9.000 €',
        ],
      },
      {
        type: 'h2',
        text: 'Welcher Stil passt zu dir?',
      },
      {
        type: 'p',
        text: 'Bist du viel in der Stadt unterwegs, möchtest gelegentlich auf Schotterwege ausweichen und schätzt Vielseitigkeit? Dann ist der Scrambler die bessere Wahl. Liebst du urbane Ästhetik, fahre fast ausschließlich auf Asphalt und möchtest ein Bike, das so aussieht, als gehört es zu einer Rennstrecke? Dann ist der Tracker dein Format. Beide Stile können als Custom-Build auf deine Anforderungen zugeschnitten werden — das Wichtigste ist, dass die Basis deiner Nutzung entspricht.',
      },
    ],
  },

  // ── E: Motorrad Umbau Kosten ─────────────────────────────────────────────
  {
    slug: 'motorrad-umbau-kosten',
    title: 'Was kostet ein Motorrad Umbau? Preise, Stufen & versteckte Kosten 2026',
    metaTitle: 'Motorrad Umbau Kosten 2026 — Preise, Stufen & Kalkulation',
    metaDescription:
      'Was kostet ein Motorrad Umbau wirklich? Einfacher Teilumbau, Komplettumbau, TÜV-Eintragung — vollständige Kostenübersicht mit Richtwerten für Deutschland 2026.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Von 1.500 € für einen Teilumbau bis 35.000 € für einen Show-Build — was ein Motorrad Umbau in Deutschland wirklich kostet.',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85',
    publishedAt: '2026-05-21',
    readTime: '10 min',
    author: 'MotoDigital Redaktion',
    tags: ['Motorrad Umbau', 'Kosten', 'Kalkulation', 'TÜV', 'Custom Bike', 'Deutschland'],
    relatedSlugs: ['tuev-eintragung-custom-bike', 'motorrad-umbau-werkstatt-finden', 'was-kostet-ein-custom-bike'],
    faq: [
      { q: 'Was kostet ein einfacher Motorrad Umbau?', a: 'Einfache Umbauten — Lenker tauschen, Sitzbank neu beziehen, Auspuff ersetzen, Beleuchtung modernisieren — kosten in einer deutschen Werkstatt zwischen 1.500 und 3.500 €. Dazu kommen Teilekosten, die stark variieren.' },
      { q: 'Was kostet ein Komplettumbau (Custom Build)?', a: 'Komplette Custom-Builds, bei denen ein Serienmodell von Grund auf neu gestaltet wird, kosten bei renommierten deutschen Werkstätten zwischen 12.000 und 30.000 €. Show-Bikes für Wettbewerbe können 50.000 € und mehr kosten.' },
      { q: 'Was kostet die TÜV-Eintragung eines Custom Bikes?', a: 'Die TÜV-Abnahme selbst kostet 80–200 €. Gutachten für einzelne Bauteile (ABE-Prüfung, §21-Gutachten) kosten 150–500 € pro Bauteil. In der Summe sollte man für die Eintragung inklusive Vorbereitung 500–1.500 € einkalkulieren.' },
      { q: 'Kann man Kosten durch Eigenleistung sparen?', a: 'Ja, erheblich. Montagearbeiten ohne TÜV-Relevanz (Lenker, Sitzbank, optische Teile) kann man oft selbst übernehmen. TÜV-relevante Arbeiten wie Schweißen am Rahmen, Bremsanlage oder Elektrik sollte man einer Werkstatt überlassen — Fehler hier können gefährlich und teuer werden.' },
    ],
    content: [
      { type: 'intro', text: 'Ein Motorrad umbauen — das klingt nach Freiheit, Handwerk und Leidenschaft. Und das ist es auch. Aber es kostet Geld. Wer ohne Kalkulation startet, erlebt schnell böse Überraschungen: Sonderanfertigungen, ungeplante TÜV-Auflagen, Teile aus Übersee mit langer Lieferzeit. Dieser Guide gibt dir ehrliche Richtwerte für Deutschland 2026.' },
      { type: 'h2', text: 'Die vier Kostenstufen im Überblick' },
      { type: 'p', text: 'Grob lassen sich Custom-Umbauten in vier Stufen einteilen: Erstens der einfache Teilumbau (1.500–4.000 €) — einzelne Komponenten werden ausgetauscht oder optisch verändert. Zweitens der mittlere Umbau (4.000–12.000 €) — mehrere Systeme werden angepasst, Lackierung, TÜV-Eintragung inklusive. Drittens der Komplettumbau (12.000–30.000 €) — das Fahrzeug wird umfassend neu gestaltet. Viertens High-End- und Show-Builds (30.000 €+) — internationale Messeniveau, handgefertigte Einzelteile, Ausstellungsstücke.' },
      { type: 'h2', text: 'Was kostet welche Arbeit konkret?' },
      { type: 'list', items: ['Lenker tauschen (Clip-ons, Superbike): 200–600 € inkl. Einbau', 'Sitzbank neu beziehen oder Heck kürzen: 300–800 €', 'Auspuffanlage einzel- oder komplett: 400–2.500 €', 'Lackierung (Tank + Schutzbleche): 800–3.000 €', 'Rahmenheck kürzen + verschweißen: 600–1.800 €', 'LED-Beleuchtungspaket (vorn + hinten): 400–900 €', 'Telegabel überholen oder ersetzen: 500–2.000 €', 'Motor revidieren: 800–3.500 €', 'TÜV-Vorbereitung + Abnahme: 500–1.500 €'] },
      { type: 'h2', text: 'Der größte Kostenfaktor: Stundenlohn' },
      { type: 'p', text: 'Renommierte Custom-Werkstätten in Deutschland berechnen 80–150 € pro Stunde. Ein einfacher Umbau mit 20 Arbeitsstunden kostet also allein in Lohn 1.600–3.000 €. Hinzu kommen Teile, Verbrauchsmaterial und eventuelle externe Dienstleistungen (Galvanik, Pulverbeschichtung, Polsterarbeiten). Wer Kosten sparen will, bringt möglichst viel in demoniertem Zustand — das spart Werkstattzeit.' },
      { type: 'h2', text: 'Versteckte Kosten beim Motorrad Umbau' },
      { type: 'p', text: 'Viele Projekte überschreiten das Budget, weil versteckte Kosten nicht eingeplant wurden. Typische Überraschungen: Verschlissene Teile, die erst beim Zerlegen sichtbar werden; Sonderanfertigungen, weil Standardmaße nicht passen; Umstellungskosten nach TÜV-Auflagen; Wartezeiten auf importierte Teile, die eine Einlagerungsgebühr verursachen; eine zweite oder dritte TÜV-Vorführung, weil Auflagen nicht erfüllt waren.' },
      { type: 'h2', text: 'Eigenleistung: Was kann ich selbst machen?' },
      { type: 'p', text: 'Rein optische Umbauten ohne TÜV-Relevanz können viele selbst übernehmen: Lenker wechseln, Sitzbank beziehen lassen und montieren, Schutzblechhalter kürzen (wenn kein Rahmeneingriff), Beleuchtung bei ordnungsgemäßer Ausführung. Schweißarbeiten am Rahmen, Bremsleitungen verlegen, Elektrik-Kabelbaum ändern — das gehört in professionelle Hände. Der TÜV prüft das Gesamtfahrzeug, nicht nur die Werkstattarbeit.' },
      { type: 'cta', text: 'Werkstatt für deinen Umbau finden', href: '/custom-werkstatt', label: 'Custom Werkstätten ansehen' },
    ],
  },

  // ── F: Custom Bike Versicherung ──────────────────────────────────────────
  {
    slug: 'custom-bike-versicherung',
    title: 'Custom Bike Versicherung: So versicherst du deinen Umbau richtig',
    metaTitle: 'Custom Bike Versicherung 2026 — Was du wissen musst',
    metaDescription:
      'Custom Bike versichern: Haftpflicht, Teilkasko, Vollkasko, Oldtimerpolicen und Einzelabnahme. Was du bei umgebauten Motorrädern beachten musst.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Umgebaute Motorräder sind kein Standardfall für Versicherungen — das musst du beim Custom Bike wissen, bevor du die Police abschließt.',
    coverImage: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&q=85',
    publishedAt: '2026-05-21',
    readTime: '8 min',
    author: 'MotoDigital Redaktion',
    tags: ['Versicherung', 'Custom Bike', 'Motorrad', 'Oldtimer', 'Recht', 'Deutschland'],
    relatedSlugs: ['tuev-eintragung-custom-bike', 'motorrad-umbau-kosten', 'was-kostet-ein-custom-bike'],
    faq: [
      { q: 'Kann ich ein Custom Bike normal versichern?', a: 'Ja, aber du musst dem Versicherer alle Umbauten offenlegen. Nicht angemeldete Umbauten können im Schadensfall zur Leistungsverweigerung führen. Spezialversicherungen für Custom Bikes sind oft günstiger und bieten besseren Schutz als Standardpolicen.' },
      { q: 'Was ist der Unterschied zwischen Haftpflicht und Kasko beim Custom Bike?', a: 'Haftpflicht ist Pflicht und deckt Schäden, die du anderen verursachst. Teilkasko deckt Diebstahl, Brand und Naturereignisse. Vollkasko deckt zusätzlich selbst verschuldete Unfälle. Für hochwertige Custom Bikes empfiehlt sich eine Vollkaskoversicherung mit vereinbartem Wiederherstellungswert.' },
      { q: 'Lohnt sich ein H-Kennzeichen für mein Custom Bike?', a: 'Das H-Kennzeichen (Oldtimer, ab 30 Jahren Fahrzeugalter) bietet deutlich günstigere Versicherungsprämien und Steuervorteile (jährliche KFZ-Steuer 46 €). Nachteil: Das Fahrzeug muss überwiegend für Ausfahrten und Messen genutzt werden, nicht als Alltagsfahrzeug.' },
    ],
    content: [
      { type: 'intro', text: 'Ein Custom Bike ist mehr als ein Fahrzeug — es ist oft ein erheblicher Vermögenswert. Trotzdem werden viele umgebaute Motorräder falsch oder unvollständig versichert. Das kann im Schadenfall teuer werden. Hier erfährst du, was du wissen musst.' },
      { type: 'h2', text: 'Das Grundproblem: Standard-Tarife decken Custom Bikes oft nicht vollständig ab' },
      { type: 'p', text: 'Standardversicherungen berechnen die Prämie auf Basis des Katalogpreises des Serienmodells. Ein Scrambler auf BMW-Basis mit 20.000 € Umbaukosten ist im Schadenfall aber viel mehr wert als der Katalogwert des Basis-Bikes. Ohne besondere Vereinbarung wirst du im Totalschadensfall nur den Zeitwert des Serienmodells erstattet bekommen.' },
      { type: 'h2', text: 'Wiederherstellungswert vereinbaren — das Wichtigste beim Custom Bike' },
      { type: 'p', text: 'Der Wiederherstellungswert (auch "Taxationswert") ist der Betrag, der nötig wäre, um das Fahrzeug in gleichem Zustand wiederherzustellen. Dieser muss mit dem Versicherer explizit vereinbart werden. Lass dein Custom Bike von einem sachkundigen Gutachter bewerten — viele Versicherer akzeptieren externe Schätzgutachten.' },
      { type: 'h2', text: 'Spezialversicherungen für Custom Bikes' },
      { type: 'p', text: 'Auf Custom Bikes und Oldtimer spezialisierte Versicherer bieten oft bessere Konditionen: Hepster (Online-Abschluss), Greenval, die Allianz Classic (für Oldtimer und Collector Vehicles), ADAC-Motorradschutz und einige Direktversicherer haben spezielle Custom-Tarife. Der Vergleich lohnt sich — oft sind die Prämien trotz besserer Leistung günstiger.' },
      { type: 'h2', text: 'Umbauten offenlegen — immer' },
      { type: 'p', text: 'Alle wesentlichen Umbauten müssen dem Versicherer gemeldet werden: geänderter Rahmen, neue Auspuffanlage, Fahrwerksänderungen, Bremsanlage, Elektrik. Nicht gemeldete Umbauten können im Schadensfall zur teilweisen oder vollständigen Leistungsverweigerung führen — das Stichwort heißt "gefahrerheblicher Umstand". Im Zweifel lieber zu viel melden als zu wenig.' },
      { type: 'h2', text: 'H-Kennzeichen: Oldtimer-Status für Custom Bikes ab 30 Jahren' },
      { type: 'p', text: 'Ein Motorrad, das mindestens 30 Jahre alt ist und sich in weitgehend originalem oder fachgerecht restauriertem Zustand befindet, kann als Oldtimer zugelassen werden (H-Kennzeichen). Die KFZ-Steuer beträgt dann pauschal 46 € pro Jahr. Die Versicherungsprämie für H-Kennzeichen-Fahrzeuge ist oft 50–70 % günstiger als für normal zugelassene Fahrzeuge. Nutzungseinschränkungen gibt es formal kaum — das Fahrzeug darf auch im Alltag genutzt werden.' },
      { type: 'cta', text: 'TÜV-Eintragung für Custom Bikes verstehen', href: '/magazine/tuev-eintragung-custom-bike', label: 'TÜV-Guide lesen' },
    ],
  },

  // ── G: Motorrad Umbau Werkstatt finden ───────────────────────────────────
  {
    slug: 'motorrad-umbau-werkstatt-finden',
    title: 'Motorrad Umbau Werkstatt finden — 7 Kriterien für die richtige Wahl',
    metaTitle: 'Motorrad Umbau Werkstatt finden — Worauf du achten musst',
    metaDescription:
      'Die richtige Custom-Werkstatt für deinen Motorrad Umbau finden: Portfolio, Erfahrung, TÜV-Kenntnis und Kommunikation. 7 Kriterien, die den Unterschied machen.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Nicht jede Werkstatt ist für jeden Umbau geeignet. Diese 7 Kriterien helfen dir, die richtige Custom-Werkstatt für dein Projekt zu finden.',
    coverImage: 'https://images.unsplash.com/photo-1490040294057-084081e0a643?w=1200&q=85',
    publishedAt: '2026-05-21',
    readTime: '7 min',
    author: 'MotoDigital Redaktion',
    tags: ['Custom Werkstatt', 'Motorrad Umbau', 'Builder', 'Ratgeber', 'Deutschland'],
    relatedSlugs: ['motorrad-umbau-kosten', 'tuev-eintragung-custom-bike', 'cafe-racer-kaufen-guide'],
    faq: [
      { q: 'Worauf sollte ich bei der Wahl einer Custom-Werkstatt achten?', a: 'Das Portfolio ist das wichtigste Kriterium: Hat die Werkstatt Erfahrung mit dem Stil, den du dir vorstellst? Weitere Kriterien: TÜV-Erfahrung (wichtig für die Eintragung), Kommunikation (reagiert sie schnell und transparent?), Referenzen (gibt es zufriedene Kunden?), und eine klare Preiskalkulation vor Projektstart.' },
      { q: 'Wie finde ich eine Custom-Werkstatt in meiner Nähe?', a: 'MotoDigital bietet ein Verzeichnis verifizierter Custom-Werkstätten mit Standort, Portfolio und Direktkontakt. Alternativ: Szene-Events, Instagram-Recherche nach lokalen Custom-Buildern, oder Empfehlungen aus Custom-Bike-Communities.' },
      { q: 'Sollte ich mehrere Werkstätten anfragen?', a: 'Ja, unbedingt. Hol dir mindestens zwei bis drei Angebote ein. Die Angebote sollten den Leistungsumfang klar definieren — nicht nur eine Gesamtpreis-Zahl, sondern eine Auflistung aller enthaltenen Arbeiten und Teile. Nur so sind Angebote vergleichbar.' },
    ],
    content: [
      { type: 'intro', text: 'Die Wahl der richtigen Werkstatt entscheidet oft über Erfolg oder Misserfolg eines Custom-Projekts. Preis allein ist kein Kriterium — eine günstige Werkstatt, die deine Vorstellung nicht versteht oder keine TÜV-Erfahrung hat, kann teurer werden als eine teurere, die alles aus einer Hand liefert.' },
      { type: 'h2', text: '1. Portfolio: Hat die Werkstatt Erfahrung mit deinem Stil?' },
      { type: 'p', text: 'Eine Werkstatt, die hauptsächlich Chopper baut, ist möglicherweise nicht die beste Wahl für einen minimalistischen Scrambler. Schau dir das Portfolio genau an: Passen die gezeigten Builds stilistisch zu dem, was du dir vorstellst? Qualität der Schweißnähte, Verarbeitung der Details, Sauberkeit der Elektrik — das sieht man an guten Portfolio-Fotos.' },
      { type: 'h2', text: '2. TÜV-Erfahrung — unverzichtbar in Deutschland' },
      { type: 'p', text: 'In Deutschland sind viele Umbauten eintragungspflichtig. Eine Werkstatt, die keine §21-Erfahrung hat oder keinen festen TÜV-Partner nennen kann, ist ein Risiko. Frag explizit: "Habt ihr Erfahrung mit TÜV-Einzelabnahmen? Unterstützt ihr mich beim Termin?" Seriöse Werkstätten begleiten ihre Kunden zum Prüftermin.' },
      { type: 'h2', text: '3. Kommunikation: Reagiert die Werkstatt transparent?' },
      { type: 'p', text: 'Wie schnell beantwortet die Werkstatt deine erste Anfrage? Gibt es ein erstes Gespräch, in dem du dein Projekt vorstellen kannst? Wird dir klar kommuniziert, was machbar ist und was nicht? Unklare Kommunikation zu Beginn eines Projekts ist ein schlechtes Zeichen — auch für den weiteren Projektverlauf.' },
      { type: 'h2', text: '4. Klare Kostenstruktur vor Projektstart' },
      { type: 'p', text: 'Ein seriöses Angebot listet Positionen auf, nicht nur Gesamtpreise. Arbeitszeit (Stunden × Stundensatz), Material und Teile, externe Dienstleistungen (Galvanik, TÜV), Lackierung. Pauschalangebote ohne Aufschlüsselung sind ein Warnsignal.' },
      { type: 'h2', text: '5. Referenzen und Bewertungen' },
      { type: 'p', text: 'Bitte die Werkstatt, dich mit einem früheren Kunden zu verbinden, der ein ähnliches Projekt hatte. Echte Kundenerfahrungen sind wertvoller als jede Werbung. Auch Google-Bewertungen, Instagram-Kommentare und Berichte in Custom-Foren geben Hinweise.' },
      { type: 'h2', text: '6. Zeitplanung und Wartezeiten' },
      { type: 'p', text: 'Gute Custom-Werkstätten sind oft für Monate ausgebucht. Frag nach dem realistischen Start- und Enddatum. Plane Puffer ein — Teile verzögern sich, TÜV-Auflagen erfordern Nacharbeit. Wer sein Bike pünktlich zu einem bestimmten Event fertig haben möchte, sollte das früh kommunizieren.' },
      { type: 'h2', text: '7. Chemie stimmt — klingt weich, ist aber entscheidend' },
      { type: 'p', text: 'Ein Custom-Projekt ist ein Vertrauensverhältnis. Du übergibst einer Werkstatt unter Umständen ein Bike im Wert von mehreren Tausend Euro und vertraust darauf, dass deine Ideen verstanden und handwerklich umgesetzt werden. Das funktioniert nur, wenn die Chemie stimmt und du dich gehört fühlst.' },
      { type: 'cta', text: 'Custom-Werkstätten auf MotoDigital entdecken', href: '/custom-werkstatt', label: 'Werkstatt finden' },
    ],
  },

  // ── H: Brat Style Motorrad ───────────────────────────────────────────────
  {
    slug: 'brat-style-motorrad',
    title: 'Brat Style Motorrad: Herkunft, Look und die besten Basis-Bikes',
    metaTitle: 'Brat Style Motorrad: Herkunft, Look, Basis-Bikes & Umbau',
    metaDescription:
      'Brat Style Motorrad: Was den japanischen Custom-Stil von Go Takamine ausmacht, die besten Basis-Bikes, Unterschiede zum Cafe Racer, Kosten und TÜV.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Flache Sitzbank, breiter Lenker, nichts Überflüssiges: Woher der Brat Style kommt, woran du ihn erkennst, welche Motorräder sich als Basis eignen und was ein Umbau kostet.',
    coverImage:
      'https://ikhgfynzghfhnviwvupo.supabase.co/storage/v1/object/public/builder-media/718fac1a-1c62-4f6b-8825-d150cc8b66eb/gallery-1793278774358-2.jpg',
    publishedAt: '2026-05-21',
    updatedAt: '2026-11-02',
    readTime: '6 min',
    author: 'MotoDigital Redaktion',
    tags: ['Brat Style', 'Bratstyle', 'Custom Bike', 'Umbau', 'Yamaha SR500', 'Honda CB', 'Japan'],
    relatedSlugs: ['cafe-racer-umbau', 'scrambler-vs-tracker-vergleich', 'motorrad-umbau-kosten'],
    relatedBuilderSlug: 'machis',
    faq: [
      { q: 'Was ist ein Brat Style Motorrad?', a: 'Ein minimalistischer Custom-Stil aus Japan: lange, flache Sitzbank, kurzes Heck, breiter Lenker und schlichte Optik. Der Name stammt von der Werkstatt „Brat Style", die Go Takamine 1998 in Tokio gegründet hat.' },
      { q: 'Wer hat den Brat Style erfunden?', a: 'Go Takamine. Er gründete 1998 im Tokioter Stadtteil Kita die Werkstatt „Brat Style". Weil sein Stil weltweit kopiert wurde, wurde der Werkstattname zum Begriff für das ganze Genre. 2014 kam ein zweiter Shop in Long Beach, Kalifornien, dazu.' },
      { q: 'Was ist der Unterschied zwischen Brat Style und Cafe Racer?', a: 'Der Cafe Racer setzt auf Rennoptik mit Höcker, Stummellenker und nach vorn gebeugter Sitzposition. Der Brat Style ist entspannter: flache Sitzbank, breiter Lenker, aufrechte Haltung. Er ist eher Stadtbike als Rennmaschine.' },
      { q: 'Welche Motorräder eignen sich für einen Brat Style Umbau?', a: 'Bewährt sind Yamaha SR400 und SR500, Honda CB450 bis CB750, Yamaha XS650, Kawasaki W650 und W800, BMW R-Boxer und die Triumph Bonneville. Wichtig ist ein schlanker Rahmen mit möglichst gerader oberer Linie.' },
      { q: 'Was kostet ein Brat Style Umbau?', a: 'Ein Teilumbau am eigenen Motorrad kostet etwa 1.500 bis 4.000 Euro. Ein kompletter Selbstbau inklusive Basis-Bike liegt realistisch bei 5.000 bis 12.000 Euro, ein Komplettumbau durch eine Werkstatt meist bei 12.000 bis 30.000 Euro.' },
      { q: 'Ist ein Brat Style Umbau TÜV-fähig?', a: 'Ja, wenn die Teile Prüfzeichen, ABE oder Teilegutachten haben und Umbauten wie Sitzbank, Lenker oder Heck eingetragen werden. Sprich am besten vor dem Umbau mit dem Prüfer.' },
    ],
    content: [
      { type: 'intro', text: 'Flache Sitzbank, breiter Lenker, nichts Überflüssiges: Der Brat Style ist einer der beliebtesten Custom-Stile der letzten Jahre und einer der am häufigsten missverstandenen. Ob Brat Style, Bratstyle oder Brat Bike, gemeint ist dasselbe. Der Begriff geht auf eine einzige Werkstatt in Tokio zurück und beschreibt heute ein ganzes Genre. Dieser Guide erklärt, woher der Stil kommt, woran du ihn erkennst, wie er sich von Cafe Racer, Scrambler und Tracker unterscheidet und welche Motorräder sich als Basis eignen.' },
      { type: 'h2', text: 'Woher kommt der Brat Style?' },
      { type: 'p', text: 'Der Name geht auf Go Takamine zurück. Der gebürtige Okinawaner eröffnete 1998 im Tokioter Stadtteil Kita seine Werkstatt „Brat Style". Seine frühen Builds setzten auf Motorräder mit mittlerem Hubraum, das Ziel war ein leichtes, urbanes Bike mit Retro-Look. Andere Werkstätten übernahmen diese Formensprache, bis sie weltweit kopiert wurde. So wurde aus dem Werkstattnamen ein Gattungsbegriff, ähnlich wie eine Marke zum Alltagswort wird. 2014 eröffnete Takamine einen zweiten Shop in Long Beach, Kalifornien.' },
      { type: 'h2', text: 'Woran erkennst du ein Brat Style Motorrad?' },
      { type: 'p', text: 'Ein Brat Bike wirkt, als hätte jemand ein Motorrad bis aufs Wesentliche ausgezogen. Typisch sind:' },
      { type: 'list', items: ['Eine lange, flache Sitzbank („Brat Seat"), die vom Tank bis zum Heck in einer geraden Linie verläuft', 'Ein kurzes, oft gekürztes Heck mit minimalem Schutzblech', 'Ein breiter, flacher Lenker, häufig im Tracker- oder MX-Stil', 'Ein runder Scheinwerfer und reduzierte Instrumente, oft nur ein Tacho', 'Speichenräder mit klassischen oder groben Reifen', 'Eine schlichte Lackierung ohne große Grafiken'] },
      { type: 'image', src: 'https://ikhgfynzghfhnviwvupo.supabase.co/storage/v1/object/public/builder-media/718fac1a-1c62-4f6b-8825-d150cc8b66eb/gallery-1793278777103-6.jpg', caption: 'Flach, gerade, oft gesteppt: Die Sitzbank prägt den Brat Style. Detail eines Umbaus von MACHIS aus den Niederlanden.' },
      { type: 'h2', text: 'Brat Style, Cafe Racer, Scrambler, Tracker: die Unterschiede' },
      { type: 'p', text: 'Die vier Stile sind verwandt, die Unterschiede liegen vor allem in Sitzposition und Einsatzzweck:' },
      { type: 'list', items: ['Brat Style: flache Sitzbank, breiter Lenker, aufrechte Sitzposition, gemacht für die Stadt', 'Cafe Racer: Höcker, Stummellenker, nach vorn gebeugte Haltung, Rennoptik für die Landstraße', 'Scrambler: hochgelegter Auspuff, Stollenreifen, längere Federwege, gebaut für Schotter', 'Tracker: vom Flat-Track-Rennsport inspiriert, schmales Heck, oft mit Startnummerntafel'] },
      { type: 'p', text: 'Die Grenzen sind fließend. Viele Builds verbinden eine Brat-Sitzbank mit Tracker-Lenker oder Scrambler-Reifen, und genau das macht den Stil so beliebt.' },
      { type: 'cta', text: 'Scrambler und Tracker im direkten Vergleich', href: '/magazine/scrambler-vs-tracker-vergleich', label: 'Zum Vergleich' },
      { type: 'h2', text: 'Die besten Basis-Bikes für einen Brat Style Umbau' },
      { type: 'p', text: 'Gute Brat-Basen haben einen schlanken Rahmen mit möglichst gerader oberer Linie, einen luftgekühlten Motor und eine aufrechte Grundgeometrie. Bewährt haben sich:' },
      { type: 'list', items: ['Yamaha SR400 und SR500: der Klassiker schlechthin, Einzylinder, simple Technik, riesiges Teileangebot', 'Honda CB-Modelle (CB450, CB550, CB750): mehr Leistung und viele Umbauteile', 'Yamaha XS650: Parallel-Twin mit Drehmoment und großer Custom-Community', 'Kawasaki W650 und W800: ab Werk im Retro-Look, dazu moderne Zuverlässigkeit', 'BMW R-Boxer (R65 bis R100): eigenständige Optik, sehr robust', 'Triumph Bonneville: moderne Technik mit Einspritzung, Umbau ohne Vergaser-Sorgen'] },
      { type: 'p', text: 'Tipp: Achte auf einen geraden Rahmen-Oberzug. Je gerader die Linie zwischen Lenkkopf und Heck, desto leichter entsteht die typische flache Brat-Silhouette.' },
      { type: 'cta', text: 'Basis-Bikes mit Preisen und Schwierigkeitsgrad', href: '/magazine/cafe-racer-selber-bauen-basis-bikes', label: 'Zum Basis-Bike-Guide' },
      { type: 'h2', text: 'Was kostet ein Brat Style Umbau?' },
      { type: 'p', text: 'Weil der Brat Style auf Reduktion setzt, kommt er oft mit weniger Sonderanfertigungen aus als ein aufwendiger Cafe Racer. Als Richtwerte für Deutschland:' },
      { type: 'list', items: ['Teilumbau am eigenen Motorrad (Sitzbank, Lenker, Beleuchtung, Heck): ca. 1.500 bis 4.000 €', 'Kompletter Selbstbau inklusive Basis-Bike: realistisch 5.000 bis 12.000 €', 'Komplettumbau durch eine Werkstatt: meist 12.000 bis 30.000 €'] },
      { type: 'cta', text: 'Motorrad Umbau Kosten im Detail', href: '/magazine/motorrad-umbau-kosten', label: 'Zum Kosten-Guide' },
      { type: 'h2', text: 'Brat Style und TÜV: Darauf musst du achten' },
      { type: 'p', text: 'Viele Brat-Umbauten sind eintragungspflichtig. Die typischen Punkte:' },
      { type: 'list', items: ['Sitzbank: Eine flache Einzelsitzbank ändert oft die Zahl der Sitzplätze, das muss in die Papiere.', 'Lenker: Breitere Lenker brauchen ein Teilegutachten oder eine Abnahme, Züge und Leitungen müssen bei vollem Einschlag passen.', 'Heck und Schutzblech: Das Hinterrad muss ausreichend abgedeckt bleiben, Kennzeichen, Rückleuchte und Rückstrahler brauchen eine zulässige Position.', 'Beleuchtung: Scheinwerfer, Blinker und Rückleuchte nur mit Prüfzeichen.', 'Reifen: Grobstollige Reifen nur in freigegebener Größe.'] },
      { type: 'p', text: 'Sprich mit dem Prüfer, bevor du anfängst. Und lass dir bei einem Werkstatt-Umbau die Eintragung schriftlich zusichern.' },
      { type: 'cta', text: 'Alles zur Eintragung von Umbauten', href: '/magazine/tuev-eintragung-custom-bike', label: 'Zum TÜV-Ratgeber' },
      { type: 'h2', text: 'Brat Style umbauen lassen' },
      { type: 'p', text: 'Wenn du lieber bauen lässt: Diese Werkstätten haben Brat Style ausdrücklich im Programm.' },
      { type: 'p', text: 'KASPEED Custom Motorcycles (Glauchau) baut als Familienbetrieb bezahlbare Klassiker-Umbauten: Café Racer, Brat, Scrambler und Tracker auf japanischer und europäischer Basis.' },
      { type: 'cta', text: 'KASPEED auf MotoDigital', href: '/custom-werkstatt/kaspeed', label: 'Profil ansehen' },
      { type: 'p', text: 'MACHIS (Heeswijk-Dinther, Niederlande): Harm van Empel und sein Team entwerfen und bauen Einzelstücke, vom Café Racer bis zum Brat Style.' },
      { type: 'cta', text: 'MACHIS auf MotoDigital', href: '/custom-werkstatt/machis', label: 'Profil ansehen' },
      { type: 'cta', text: 'Brat Style Bikes auf MotoDigital entdecken', href: '/bikes/brat-style', label: 'Brat Style Bikes ansehen' },
    ],
  },

  // ── I: Custom Auspuff ────────────────────────────────────────────────────
  {
    slug: 'custom-auspuff-eintragung-kosten',
    title: 'Custom Auspuff: Eintragung, Kosten und die besten Hersteller 2026',
    metaTitle: 'Custom Auspuff Eintragung — Kosten, Regeln & Hersteller Deutschland',
    metaDescription:
      'Custom Auspuff legal eingetragen: Was ABE bedeutet, wann TÜV-Abnahme nötig ist, was Slip-On und Komplettanlage kosten und welche Hersteller in Deutschland empfohlen werden.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Der Auspuff ist eine der wirkungsvollsten Modifikationen am Custom Bike — und eine der rechtlich sensibelsten. Was ABE bedeutet, wann TÜV-Eintragung nötig ist und was ein custom Auspuff wirklich kostet.',
    coverImage: 'https://images.unsplash.com/photo-1769537754889-8d731b83547f?w=1200&q=85',
    publishedAt: '2026-05-29',
    readTime: '9 min',
    author: 'MotoDigital Redaktion',
    tags: ['Custom Auspuff', 'TÜV Eintragung', 'Motorrad Auspuff', 'Slip-On', 'ABE', 'Custom Bike', 'Umbau'],
    relatedSlugs: ['legaler-motorrad-auspuff-ece-zulassung', 'tuev-eintragung-custom-bike', 'motorrad-umbau-kosten'],
    faq: [
      {
        q: 'Muss ein Custom-Auspuff eingetragen werden?',
        a: 'Ja, wenn die neue Anlage keine gültige ABE (Allgemeine Betriebserlaubnis) für das exakte Modell und Baujahr mitbringt. In diesem Fall ist eine individuelle TÜV- oder Dekra-Eintragung nach §21 StVZO nötig. Ohne Eintragung erlischt die Betriebserlaubnis des Fahrzeugs — mit entsprechenden Folgen für Versicherungsschutz und Hauptuntersuchung.',
      },
      {
        q: 'Was kostet eine TÜV-Eintragung für einen Auspuff?',
        a: 'Die Eintragung beim TÜV oder Dekra kostet in der Regel 80–180 Euro, je nach Prüfstelle und Aufwand. Hinzu kommen ggf. Werkstattkosten für Anpassungen (Lambdasondenausleitung, Dichtheitsprüfung). Gesamtkosten inkl. Vorbereitung: realistisch 100–300 Euro.',
      },
      {
        q: 'Welche Hersteller bauen Custom-Abgasanlagen für den deutschen Markt?',
        a: 'Empfehlenswerte Hersteller mit ABE-Erfahrung: Akrapovič (Slowenien), Arrow und SC-Project (Italien), Remus (Österreich), Zard (Italien) und der deutsche Hersteller Falcon Exhausts. Alle bieten homologierte "Street Legal"-Varianten an. Vance & Hines ist stark bei Harley-Davidson, aber oft TÜV-pflichtig in Deutschland.',
      },
      {
        q: 'Was passiert bei der Hauptuntersuchung mit einem nicht eingetragenen Auspuff?',
        a: 'Ohne Eintragung oder ABE ist der Auspuff ein erheblicher Mangel — die HU wird nicht bestanden. Der Prüfer kann außerdem die Betriebserlaubnis des Fahrzeugs als erloschen feststellen. Empfehlung: Vor der HU entweder Serienauspuff montieren oder die Eintragung nachholen.',
      },
    ],
    content: [
      {
        type: 'intro',
        text: 'Der Auspuff ist eine der wirkungsvollsten Modifikationen an einem Custom Bike — optisch, akustisch und fahrdynamisch. Gleichzeitig ist er eine der rechtlich sensibelsten. Wer hier ohne Vorbereitung umbaut, riskiert seinen Versicherungsschutz, das Bestehen der Hauptuntersuchung — und im schlimmsten Fall die Zulassung. Dieser Guide erklärt, was bei einem Custom-Auspuff in Deutschland gilt.',
      },
      { type: 'h2', text: 'Slip-On oder Komplettanlage — was ist der Unterschied?' },
      {
        type: 'p',
        text: 'Bevor es um Eintragungspflicht geht, lohnt sich die Unterscheidung nach Umbauumfang. Denn der bestimmt sowohl Kosten als auch rechtlichen Aufwand:',
      },
      {
        type: 'list',
        items: [
          'Slip-On (Endschalldämpfer-Tausch): Nur der hintere Teil der Abgasanlage wird ersetzt. Einfach montierbar, 200–900 Euro. Häufigste Wahl für optische und akustische Aufwertungen.',
          'Komplettanlage (Full System): Krümmer, Mittelrohr und Schalldämpfer werden vollständig ersetzt. Aufwendiger, 600–3.000+ Euro — aber maximaler Effekt auf Klang und Performance.',
          '2-in-1-Anlage: Beide Krümmer laufen in einen einzigen Schalldämpfer zusammen. Klassisch bei Café Racern und Scramblers — kompaktes Erscheinungsbild.',
          '2-in-2-Anlage: Jeder Zylinder hat seinen eigenen Schalldämpfer. Symmetrischer Look, teurer in Herstellung und Eintragung.',
        ],
      },
      { type: 'h2', text: 'ABE oder TÜV-Eintragung — was gilt wann?' },
      {
        type: 'p',
        text: 'Jede Abgasanlage, die am deutschen Straßenverkehr teilnimmt, braucht entweder eine Allgemeine Betriebserlaubnis (ABE) oder eine individuelle Eintragung nach §21 StVZO.',
      },
      {
        type: 'p',
        text: 'Die ABE ist die einfachere Option: Viele markenfähige Auspuffanlagen (Akrapovič "Street Legal", Arrow, SC-Project "Homologated") kommen mit einer ABE-Nummer, die für ein bestimmtes Modell und Baujahr freigegeben ist. Die ABE-Dokumentation muss beim Fahrzeug mitgeführt werden. Wichtig: Das Produkt muss exakt für Modell und Baujahr freigegeben sein — "passt auch für" reicht nicht.',
      },
      {
        type: 'p',
        text: 'Die TÜV-Eintragung ist nötig, wenn keine ABE vorliegt — zum Beispiel bei einer handgefertigten Custom-Anlage, einer Racing-Anlage ohne Straßenzulassung oder einer älteren Anlage ohne Papiere. Ein anerkannter Prüfer nimmt die Anlage dann individuell ab: Schallmessung, Sichtprüfung, Abgastest. Bei Bestehen folgt der Eintrag ins Fahrzeugschein.',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1660159523481-4058153e1bf3?w=1200&q=85',
        caption: 'Handgefertigte Auspuffanlage am Custom Scrambler — schön, aber nur mit Eintragung legal.',
      },
      { type: 'h2', text: 'So läuft die TÜV-Eintragung ab' },
      {
        type: 'list',
        items: [
          'Anlage montieren und auf Dichtheit prüfen — Rußspuren am Krümmer sind ein sofortiger Ablehnungsgrund',
          'Termin beim TÜV oder Dekra (§21-Beauftragter) mit vollständigem Fahrzeugschein buchen',
          'Schallmessung: Fahrgeräusch und Standgeräusch werden protokolliert',
          'Abgasmessung: Bei Bikes ab Euro 3 besonders relevant — Lambda-Werte müssen stimmen',
          'OBD-Check: Neuere Bikes mit Einspritzung werden auf Fehlercodes geprüft (Lambdasondenausleitung beachten)',
          'Bei Bestehen: Eintrag in den Fahrzeugschein, Gutachten im Original mitführen',
        ],
      },
      { type: 'h2', text: 'Lärm-Grenzwerte in Deutschland' },
      {
        type: 'p',
        text: 'Die häufigste Ursache für eine gescheiterte Abnahme ist Lärm. In Deutschland gelten folgende Richtwerte:',
      },
      {
        type: 'list',
        items: [
          'Fahrgeräusch: je nach Baujahr und Motorklasse 73–80 dB(A) gemäß ECE-R41',
          'Standgeräusch: im Fahrzeugschein eingetragen — die neue Anlage darf diesen Wert nicht überschreiten',
          '"Drive-by"-Messung: Einige Kommunen und Polizeistreifen messen aktiv; 80–82 dB(A) gelten als Grenzbereich',
          'Achtung: Ein Auspuff, der kalt leiser klingt, kann warm die Grenzwerte reißen — Messung immer bei Betriebstemperatur',
        ],
      },
      {
        type: 'quote',
        text: 'Seriöse Hersteller liefern Schallmessprotokolle nach UNECE-R41 mit. Diese Dokumente erleichtern die TÜV-Eintragung erheblich.',
      },
      { type: 'h2', text: 'Was kostet ein Custom-Auspuff insgesamt?' },
      {
        type: 'list',
        items: [
          'Slip-On mit ABE (Markenware): 250–900 Euro',
          'Komplettanlage mit ABE: 800–3.000 Euro',
          'Handmade Custom-Anlage (ohne ABE): 600–2.500 Euro',
          'TÜV-Einzelabnahme für Auspuff: 80–180 Euro',
          'Werkstattaufwand für Vorbereitung und Nacharbeit: 50–200 Euro',
          'Gesamtkosten bei Custom-Anlage inkl. Eintragung: realistisch ab 700 Euro aufwärts',
        ],
      },
      { type: 'h2', text: 'Empfehlenswerte Hersteller für Custom-Abgasanlagen' },
      {
        type: 'p',
        text: 'Wer auf der sicheren Seite sein will, kauft bei Herstellern mit ABE-Erfahrung und Straßenzulassung für den deutschen Markt:',
      },
      {
        type: 'list',
        items: [
          'Akrapovič (Slowenien): Marktführer im Hochleistungsbereich. "Street Legal"-Varianten mit ABE, Racing-Varianten ohne. Titan- und Edelstahloptionen — die teuerste, aber hochwertigste Wahl.',
          'Arrow (Italien): Breites Portfolio, viele ABE-fähige Anlagen für Custom-Basen (Honda CB, Triumph Bonneville). Gutes Preis-Leistungs-Verhältnis, besonders im Retrobereich.',
          'SC-Project (Italien): Bekannt für konische Schalldämpfer im Café-Racer-Look. Viele "Homologated"-Varianten. Sehr beliebt in der deutschen Custom-Szene.',
          'Remus (Österreich): Stark bei Harley-Davidson-Plattformen und Retrobikes. Lange ABE-Erfahrung in Deutschland und Österreich.',
          'Falcon Exhausts (Deutschland): Einer der wenigen deutschen Custom-Auspuff-Hersteller. Handgefertigte Einzelstücke und Kleinserien, oft mit aktiver Eintragungsunterstützung. Gut verankert in der europäischen Café-Racer-Szene.',
          'Zard (Italien): Spezialisiert auf Retro- und Classic-Bikes (Triumph, Moto Guzzi). Handwerkliche Qualität, viele TÜV-fähige Varianten mit Messprotokollen.',
          'Vance & Hines (USA): Harley-Davidson-Spezialist. In den USA uneingeschränkt, in Deutschland meist TÜV-pflichtig — aber sehr gut dokumentierte Anlagen mit umfangreichem Support-Material.',
        ],
      },
      { type: 'h2', text: 'Was beim TÜV häufig übersehen wird' },
      {
        type: 'p',
        text: 'Viele Eintragungen scheitern nicht an der Anlage selbst, sondern an leicht vermeidbaren Begleitproblemen:',
      },
      {
        type: 'list',
        items: [
          'Lambdasondenausleitung fehlt oder ist verschlossen — verursacht OBD-Fehler und Abgasprobleme',
          'Krümmerverbindungen undicht (Rußspuren am Flansch) — sofortiger Ablehnungsgrund',
          'Serienhalterungen entfernt, ohne gleichwertigen Ersatz zu dokumentieren',
          'Kein Nachweis der Abgasnorm des Bikes (bei Euro 3/4/5 besonders kritisch)',
          'Hitzeschutz fehlt — zu nah an Kabel, Rahmen oder Benzinleitung',
          'Standgeräusch nicht vorab gemessen — Überraschungen am Prüfstand vermeidbar',
        ],
      },
      {
        type: 'cta',
        text: 'Custom Bikes mit legalem Auspuff auf MotoDigital',
        href: '/bikes',
        label: 'Custom Bikes entdecken',
      },
    ],
  },

  // ── J: Street Fighter Motorrad ───────────────────────────────────────────
  {
    slug: 'street-fighter-motorrad-umbau',
    title: 'Street Fighter Motorrad: Umbau, Basis-Bikes und was den Stil definiert',
    metaTitle: 'Street Fighter Motorrad — Custom Umbau Guide 2026',
    metaDescription:
      'Street Fighter Motorrad: Aggressive Naked-Optik, Sport-DNA, keine Verkleidung. Welche Bikes sich eignen und was einen echten Street Fighter ausmacht.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Der Street Fighter ist das aggressivste Kind der Custom-Szene — eine Sport- oder Superbike-Basis, entkleidet und aufgewühlt. Was ihn ausmacht und welche Basen sich eignen.',
    coverImage: 'https://images.unsplash.com/photo-1730755372556-653fbe52c15e?w=1200&q=85',
    publishedAt: '2026-05-21',
    readTime: '7 min',
    author: 'MotoDigital Redaktion',
    tags: ['Street Fighter', 'Custom Bike', 'Naked Bike', 'Umbau', 'Superbike', 'Custom'],
    relatedSlugs: ['scrambler-vs-tracker-vergleich', 'motorrad-umbau-kosten', 'motorrad-umbau-werkstatt-finden'],
    faq: [
      { q: 'Was ist ein Street Fighter Motorrad?', a: 'Ein Street Fighter ist ein Sportmotorrad oder Superbike, das seiner Verkleidung beraubt und mit aggressivem Naked-Look umgebaut wurde. Typisch: freigelegter Motor, Minimalinstrumente, ein einzelner kleiner Scheinwerfer, oft modifizierte Fahrwerksgeometrie für mehr Agilität in der Stadt.' },
      { q: 'Was ist der Unterschied zwischen Street Fighter und Naked Bike?', a: 'Ein Naked Bike ist ein Serienmodell ohne Verkleidung (z.B. Yamaha MT-09, KTM Duke). Ein Street Fighter ist ein individueller Umbau auf Sport-Basis — aggressiver, handgemachter, oft mit Fahrwerksmodifikationen und eigener Charakteristik.' },
      { q: 'Welche Basis-Bikes eignen sich für einen Street Fighter Umbau?', a: 'Klassisch: Honda CBR-Modelle, Suzuki GSX-R, Yamaha R-Serie, Kawasaki ZX-Modelle und Ducati 748/916/996. Wer es aktueller mag: Ducati Monster als Basis, BMW S 1000 R, KTM Super Duke. Je mehr Motor, desto spektakulärer der Street Fighter.' },
    ],
    content: [
      { type: 'intro', text: 'Der Street Fighter ist kein gemütliches Bike. Er ist der Joker in der Custom-Welt — ein Sportmotorrad, das seine Verkleidung verloren hat und seitdem noch weniger Rücksicht nimmt. Aggressiv, urban, technisch. Wer einen Street Fighter fährt, tut das bewusst.' },
      { type: 'h2', text: 'Woher kommt der Street Fighter?' },
      { type: 'p', text: 'Der Street-Fighter-Trend entstand Ende der 1980er / Anfang der 1990er in Europa — besonders in Großbritannien und Italien. Fahrer, die mit vollverkleideten Superbikes auf der Straße unterwegs waren, begannen, nach Unfällen die beschädigten Verkleidungen einfach nicht zu ersetzen. Das Ergebnis: nackte Sport-DNA, direkt sichtbar. Aus dieser Pragmatik wurde eine Ästhetik.' },
      { type: 'h2', text: 'Was macht einen Street Fighter optisch aus?' },
      { type: 'list', items: ['Keine Verkleidung — Motor ist das Design-Element', 'Einzelner, kleiner Hauptscheinwerfer (oft rund oder eckig-aggressiv)', 'Hochgezogener Lenker oder breiter Superbike-Lenker', 'Freiliegender Rahmen und Motor', 'Kurzes Heck, minimalistisches Rücklicht', 'Oft aggressive Farbgebung oder kein Lack (Raw Metal)', 'Sportfahrwerk, aber auf Stadtnutzung abgestimmt'] },
      { type: 'h2', text: 'Die besten Basis-Bikes für Street Fighter Umbauten' },
      { type: 'p', text: 'Das ideale Street-Fighter-Basis-Bike hat einen leistungsstarken Motor, ein steifes Fahrwerk und genug Stil, um auch ohne Verkleidung zu überzeugen. Klassiker: Honda CBR 900 RR / 1000 RR (Fireblade), Suzuki GSX-R 750/1000 der 90er Jahre, Kawasaki ZX-9R, Yamaha R1 (Evo 1998–2001), Ducati 916/748. Neuere Basen: BMW S 1000 R, Ducati Panigale entkleidet, KTM Super Duke R.' },
      { type: 'h2', text: 'TÜV und Street Fighter: Was muss eingetragen werden?' },
      { type: 'p', text: 'Beim Street Fighter sind besonders Lenkeränderungen (Griffweite, Hebelpositionen müssen neu vermessen werden), Scheinwerfer (Lichtgeometrie muss noch den Vorschriften entsprechen), Auspuffanlage und Fußrastenanlage relevant. Wer den Rahmen kürzt oder schleift, braucht eine Einzelabnahme. Die meisten Street-Fighter-Umbauten lassen sich bei sorgfältiger Ausführung eintragen — mit dem richtigen Werkstattpartner.' },
      { type: 'h2', text: 'Street Fighter als Alltagsfahrzeug?' },
      { type: 'p', text: 'Ja — aber mit Einschränkungen. Die aufrechte Haltung (wenn der Lenker entsprechend montiert ist) macht den Street Fighter stadttauglich. Die Sport-Fahrwerksabstimmung ist auf Asphalt ausgelegt und kann auf deutschen Stadtstraßen unbequem werden. Für längere Autobahnetappen fehlt der Windschutz. Wer den Street Fighter als Hauptfahrzeug nutzen will, sollte bei der Umbauplanung Komfort-Kompromisse einrechnen.' },
      { type: 'cta', text: 'Street Fighter Bikes auf MotoDigital entdecken', href: '/bikes/street-fighter', label: 'Street Fighter Bikes ansehen' },
    ],
  },
]

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find(a => a.slug === slug)
}

export function getArticlesByCategory(category: Article['category']): Article[] {
  return ARTICLES.filter(a => a.category === category)
}

export const CATEGORY_META = {
  'build-story': {
    label: 'Build Story',
    title: 'Build Stories — Custom Motorcycle Projekte | MotoDigital',
    description:
      'Die kompletten Build Stories hinter den außergewöhnlichsten Custom-Motorcycles Europas. Von der Idee bis zur Fertigstellung.',
  },
  interview: {
    label: 'Interview',
    title: 'Builder-Interviews — Custom Motorcycle Kultur | MotoDigital',
    description:
      'Gespräche mit Custom-Buildern über Philosophie, Projekte und die Leidenschaft hinters Lenker.',
  },
  guide: {
    label: 'Guide',
    title: 'Custom Motorcycle Guides & Ratgeber 2026 | MotoDigital',
    description:
      'Kaufratgeber, Vergleiche und Leitfäden rund um Custom Motorcycles. Alles was du wissen musst, bevor du kaufst.',
  },
} as const

// ──────────────────────────────────────────────────────────────
// i18n overlays
//
// Article bodies (the `content[]` sections) stay German — they're long-form
// editorial copy and get translated in a dedicated content pass. For EN we
// override the surfaces that are indexed/displayed in previews (title,
// metaTitle, metaDescription, excerpt, categoryLabel). Readers use the
// `getArticlesForLocale` / `getArticleBySlugForLocale` helpers below and get
// a fully-overlaid Article; missing EN fields fall back to DE.
// ──────────────────────────────────────────────────────────────

type ArticleOverlay = Partial<
  Pick<Article, 'title' | 'metaTitle' | 'metaDescription' | 'excerpt' | 'categoryLabel' | 'readTime'>
>

const ARTICLE_OVERLAYS_EN: Record<string, ArticleOverlay> = {
  'eicma-2026-retro-neuheiten': {
    title: 'EICMA 2026: the retro highlights for 2027 — Café Racers, classics and factory customs',
    metaTitle: 'EICMA 2026: retro highlights 2027 — Café Racers & classics',
    metaDescription:
      'Continental GT 750, Bonneville T40, Speed Twin 1200 TFC: every retro launch at EICMA 2026 with specs, prices, release dates and custom potential.',
    excerpt:
      'A new flagship Café Racer from Royal Enfield, a 400 cc Bonneville for A2 riders and limited factory customs: the retro highlights of EICMA 2026.',
    categoryLabel: 'Guide',
  },
  'cafe-racer-umbau': {
    title: 'Café Racer conversion: an 8-step guide with costs and a TÜV checklist',
    metaTitle: 'Café Racer conversion — guide, costs & TÜV in 8 steps',
    metaDescription:
      'Café Racer conversion step by step: donor bike, rear frame, clip-ons, wiring, exhaust and TÜV registration — with costs, a checklist and common mistakes.',
    excerpt:
      'From stock motorcycle to Café Racer: how a conversion works in eight steps, what it costs, which parts need registering — and when a kit or a workshop makes sense.',
    categoryLabel: 'Guide',
  },
  'legaler-motorrad-auspuff-ece-zulassung': {
    title: 'Street-legal motorcycle exhaust: E-mark, EC approval and ECE explained',
    metaTitle: 'Street-legal motorcycle exhaust — E-mark, ECE & EC approval',
    metaDescription:
      'Is your motorcycle exhaust legal? How to read E-marks, EC type approval, ABE and part certificates — plus dB killers, Euro 5 and a buying checklist.',
    excerpt:
      'A small stamp with big consequences: how to tell if a motorcycle exhaust is street-legal, which papers you need and which mistakes get expensive.',
    categoryLabel: 'Guide',
  },
  'harley-custom-werkstatt-finden': {
    title: 'Finding a Harley custom workshop: 6 builders for bobbers, choppers and clubstyle',
    metaTitle: 'Harley custom workshops — 6 specialists in Germany',
    metaDescription:
      'Want your Harley-Davidson customised? 6 German custom workshops, the right questions to ask and what matters for wide tyres, air ride and TÜV.',
    excerpt:
      'From world-championship show bikes to solid Sportster bobbers: six workshops that know Harley-Davidson — and what to look for when choosing one.',
    categoryLabel: 'Guide',
  },
  'bmw-cafe-racer-umbau-werkstaetten': {
    title: 'BMW Café Racer builds: 10 German workshops that really know how',
    metaTitle: 'BMW Café Racer builders — 10 workshops in Germany 2026',
    metaDescription:
      'Who builds the best BMW Café Racer? 10 specialist workshops from Hamburg to Garmisch — focus, donor models and tips on cost and TÜV registration.',
    excerpt:
      'From the classic R80 to the R nineT: these ten workshops specialise in BMW conversions. What sets them apart, what a build costs and what to look out for.',
    categoryLabel: 'Guide',
  },
  'warum-heisst-es-cafe-racer': {
    title: 'Why is it called Café Racer? The story behind the myth',
    metaTitle: 'Why is it called Café Racer? Origin, history & myth',
    metaDescription:
      "Café Racer: the name was born in 1950s London — the Ace Cafe, the Ton-up Boys and the rocker cult. The full story behind the iconic bike.",
    excerpt:
      "The name 'Café Racer' came from 1950s London — from the Ace Cafe on the North Circular, from young rockers racing between cafes on ton-up motorcycles. The complete story of how a cultural subculture became one of the most iconic bike styles.",
    categoryLabel: 'Guide',
  },
  'scrambler-kaufen-guide': {
    title: 'Buying a scrambler in 2026: the complete guide',
    metaTitle: 'Buying a scrambler in 2026 — models, prices & what to check',
    metaDescription:
      'Everything you need to know before buying a scrambler: the best models, typical prices, key checks and the difference between retro and modern builds.',
    excerpt:
      'Scramblers are back — and the choice has never been bigger. From the Ducati Scrambler to the Triumph Street Scrambler to classic conversions, this guide walks you through models, prices and what to look for before you sign.',
    categoryLabel: 'Guide',
  },
  'bobber-kaufen-guide': {
    title: 'Buying a bobber: the guide for real low riders',
    metaTitle: 'Buying a bobber 2026 — models, prices & check points',
    metaDescription:
      'Everything that matters when buying a bobber: the best models on the used market, realistic prices, typical problem areas and how to spot a well-built custom.',
    excerpt:
      "Bobbers stand for stripped-down minimalism, fat rear tyres and rebellious soul. This guide shows you which bobbers are genuinely worth the money, what to look out for on the used market and where the hidden costs are hiding.",
    categoryLabel: 'Guide',
  },
  'cafe-racer-selber-bauen-basis-bikes': {
    title: 'Building your own Café Racer: the 10 best donor bikes',
    metaTitle: 'Building a Café Racer — the 10 best donor bikes in 2026',
    metaDescription:
      'The best donor bikes for a Café Racer conversion: classic Hondas, reliable Yamahas, characterful BMWs. With typical prices, parts availability and difficulty.',
    excerpt:
      'You want to build your own Café Racer but don\'t know where to start? This guide ranks the 10 best donor platforms — from Honda CB to Yamaha XS to BMW R — with realistic prices, conversion effort and what to watch out for.',
    categoryLabel: 'Guide',
  },
  'was-kostet-ein-custom-bike': {
    title: 'What does a custom bike cost? Prices, effort & hidden costs',
    metaTitle: 'What does a custom bike cost? Prices, effort & hidden costs',
    metaDescription:
      'Realistic prices for custom motorcycles — from simple conversions to full builds. Plus: the hidden costs no one mentions up front.',
    excerpt:
      "A custom bike from €3,000? From €15,000? From €40,000? The honest answer: it depends — but not on what you think. A realistic look at what a custom really costs and where the hidden line items are.",
    categoryLabel: 'Guide',
  },
  'tuev-eintragung-custom-bike': {
    title: 'TÜV registration for custom bikes: what\'s actually legal in Germany',
    metaTitle: 'TÜV registration custom bike — what\'s legal in Germany',
    metaDescription:
      'What can be registered and what can\'t: fender mods, exhaust, lighting, seat. With a practical checklist and tips for the TÜV appointment.',
    excerpt:
      "Every rider knows the fear: 'Will the TÜV pass my custom?' This guide shows which mods are actually legal in Germany, how the registration process works in practice, and where most builds fail.",
    categoryLabel: 'Guide',
  },
  'cafe-racer-kaufen-guide': {
    title: 'Buying a Café Racer: the complete guide for 2026',
    metaTitle: 'Buying a Café Racer 2026 — tips, prices & what to check',
    metaDescription:
      'The complete buying guide for Café Racers: the best models, fair prices, red flags and pro tips for the first viewing and test ride.',
    excerpt:
      'Whether you\'re buying new, used or custom — a Café Racer is a big decision. This guide gives you the full picture: models at every price point, what to check at the first viewing, and how to tell a well-built conversion from a dressed-up disaster.',
    categoryLabel: 'Guide',
  },
  'scrambler-vs-tracker-vergleich': {
    title: 'Scrambler vs. Tracker: what\'s the difference and which one suits you?',
    metaTitle: 'Scrambler vs. Tracker — differences & which to buy in 2026',
    metaDescription:
      'Scrambler or Tracker? Geometry, tyres, use cases and which bike matches which rider. With concrete examples from the used market.',
    excerpt:
      'They look similar at first glance — but scramblers and trackers are fundamentally different bikes. This comparison explains the differences, where each works best, and which one actually suits your riding style.',
    categoryLabel: 'Guide',
  },
  'custom-auspuff-eintragung-kosten': {
    title: 'Custom exhaust: registration, costs and the best manufacturers',
    metaTitle: 'Custom exhaust registration Germany — costs, rules & brands 2026',
    metaDescription:
      'Everything about registering a custom exhaust in Germany: what ABE means, when TÜV approval is required, realistic costs and which manufacturers to trust.',
    excerpt:
      'A custom exhaust is one of the most impactful modifications on a custom bike — and one of the most legally complex. This guide explains ABE vs. TÜV registration, noise limits and what the whole thing actually costs.',
    categoryLabel: 'Guide',
  },
}

const CATEGORY_META_EN = {
  'build-story': {
    label: 'Build Story',
    title: 'Build Stories — Custom Motorcycle Projects | MotoDigital',
    description:
      "The complete build stories behind Europe's most exceptional custom motorcycles. From the first sketch to the finished bike.",
  },
  interview: {
    label: 'Interview',
    title: 'Builder interviews — Custom motorcycle culture | MotoDigital',
    description:
      "Conversations with custom builders about philosophy, projects and the passion behind the handlebars.",
  },
  guide: {
    label: 'Guide',
    title: 'Custom motorcycle guides & buying advice 2026 | MotoDigital',
    description:
      "Buying guides, comparisons and how-tos around custom motorcycles. Everything you need to know before you buy.",
  },
} as const

function applyOverlay(article: Article, locale: string): Article {
  if (locale === 'de') return article
  const overlay = ARTICLE_OVERLAYS_EN[article.slug]
  if (!overlay) return article
  return { ...article, ...overlay }
}

export function getArticlesForLocale(locale: string): Article[] {
  return ARTICLES.map((a) => applyOverlay(a, locale))
}

export function getArticleBySlugForLocale(slug: string, locale: string): Article | undefined {
  const raw = ARTICLES.find((a) => a.slug === slug)
  return raw ? applyOverlay(raw, locale) : undefined
}

export function getArticlesByCategoryForLocale(
  category: Article['category'],
  locale: string,
): Article[] {
  return getArticlesForLocale(locale).filter((a) => a.category === category)
}

export function getCategoryMetaForLocale(locale: string) {
  return locale === 'en' ? CATEGORY_META_EN : CATEGORY_META
}
