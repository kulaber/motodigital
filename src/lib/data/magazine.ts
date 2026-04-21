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
    relatedSlugs: ['cafe-racer-kaufen-guide', 'cafe-racer-selber-bauen-basis-bikes', 'jakob-kraft-berlin-interview'],
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
        href: '/bikes?style=scrambler',
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
    relatedSlugs: ['max-steiner-bobber-interview', 'was-kostet-ein-custom-bike', 'tuev-eintragung-custom-bike'],
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
        type: 'quote',
        text: 'Ein Bobber ist das ehrlichste Motorrad, das du fahren kannst. Er verbirgt nichts — weder seine Herkunft noch seine Kompromisse.',
        author: 'Max Steiner, München',
      },
      {
        type: 'cta',
        text: 'Bobber bei MotoDigital ansehen',
        href: '/bikes?style=bobber',
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
    relatedSlugs: ['cafe-racer-kaufen-guide', 'warum-heisst-es-cafe-racer', 'tuev-eintragung-custom-bike'],
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
    relatedSlugs: ['cafe-racer-selber-bauen-basis-bikes', 'was-kostet-ein-custom-bike', 'bobber-kaufen-guide'],
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
    publishedAt: '2025-11-15',
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
        type: 'quote',
        text: 'Ein Custom Bike ist kein Serienprodukt — du kaufst die Arbeit und das Können des Builders.',
        author: 'Jakob Kraft, Berlin',
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
    slug: 'jakob-kraft-berlin-interview',
    title: '"Ein Bike ohne Geschichte ist nur ein Fahrzeug" — Jakob Kraft im Interview',
    metaTitle: 'Jakob Kraft Interview — Cafe Racer Builder aus Berlin',
    metaDescription:
      'Jakob Kraft über seine Philosophie als Cafe Racer Builder, seinen berühmtesten Build und warum Berlin die beste Stadt für Custom Bikes ist.',
    category: 'interview',
    categoryLabel: 'Interview',
    excerpt:
      'Der Berliner Builder über luftgekühlte Japaner, handgefertigte Einzelstücke und warum er jeden Build als Zusammenarbeit versteht.',
    coverImage:
      'https://images.unsplash.com/photo-1522850003946-16cb11d41a86?w=1200&q=85',
    publishedAt: '2025-10-20',
    readTime: '12 min',
    author: 'MotoDigital Redaktion',
    tags: ['Interview', 'Cafe Racer', 'Builder', 'Berlin', 'Honda CB750'],
    relatedSlugs: ['cafe-racer-kaufen-guide', 'cafe-racer-selber-bauen-basis-bikes', 'warum-heisst-es-cafe-racer'],
    relatedBuilderSlug: 'jakob-kraft',
    content: [
      {
        type: 'intro',
        text: 'Jakob Kraft baut in einer Berliner Hinterhofgarage Bikes, die man nicht vergisst. Seine Spezialität: luftgekühlte Japaner der 70er, verwandelt in straffe, charaktervolle Cafe Racer. Wir haben ihn in seiner Werkstatt besucht.',
      },
      {
        type: 'h2',
        text: 'Jakob, wie bist du zum Bikebau gekommen?',
      },
      {
        type: 'p',
        text: 'Ich habe mit 19 eine kaputte CB500 aus einer Garage gezogen — 80 Euro, kein TÜV, keine Hoffnung. Mein Vater hat mir beigebracht, wie man schweißt. Der Rest ist passiert. Ich war nie der Typ, der etwas kauft und fährt. Ich musste immer verstehen, wie etwas funktioniert — und dann fragen: Kann ich das besser machen? Schöner? Ehrlicher?',
      },
      {
        type: 'h2',
        text: 'Was bedeutet "ehrlich" bei einem Custom Bike?',
      },
      {
        type: 'p',
        text: 'Ein ehrliches Bike versteckt nichts. Die Schweißnähte sind sichtbar — und gut. Das Kabel verläuft, wo es Sinn ergibt, nicht wo es versteckt werden kann. Wenn ich ein Teil modifiziere, dann sieht man die Entscheidung, aber man merkt auch, dass sie durchdacht war. Ich baue keine Showbikes für Messen. Ich baue Bikes, die gefahren werden.',
      },
      {
        type: 'quote',
        text: 'Ein Bike ohne Geschichte ist nur ein Fahrzeug. Mich interessiert die Geschichte — wo kommt die Maschine her, was hat der Kunde erlebt, was soll das Bike verkörpern.',
        author: 'Jakob Kraft',
      },
      {
        type: 'h2',
        text: 'Erzähl uns vom Berlin Cafe No. 7 — deinem bislang bekanntesten Build.',
      },
      {
        type: 'p',
        text: 'Die Basis war eine Honda CB750 von 1972. Komplett eingerostet, mit einem gebrochenen Rahmen und einer Elektrik, die niemand mehr verstand. Achim, der Kunde, hatte das Bike von seinem Onkel geerbt. Es war nicht fahrbereit, aber es war geliebt. Das konnte ich spüren. Wir haben acht Monate daran gearbeitet — Rahmensanierung, komplett neuer Kabelbaum mit Motogadget, handgefertigter Aluminiumtank, Metzeler-Bereifung. Das Ergebnis ist ein Bike, das fährt, wie es aussieht: entschlossen.',
      },
      {
        type: 'h2',
        text: 'Warum Berlin?',
      },
      {
        type: 'p',
        text: 'Berlin vergibt dir Fehler. Hier kannst du eine Werkstatt aufmachen, Risiken eingehen, eine eigene Handschrift entwickeln — ohne dass sofort jemand fragt, was das kostet und wann du Gewinn machst. Die Stadt hat eine Toleranz für Ernsthaftigkeit, auch wenn sie nicht sofort ökonomisch ist. Und es gibt eine Community, die echte Bikes schätzt. Nicht Instagram-Bikes. Echte Bikes.',
      },
    ],
  },

  {
    slug: 'shovelhead-revival-kai-fuchs',
    title: 'Shovelhead Revival: 16 Monate, ein 76er Motor und ein klares Bekenntnis',
    metaTitle: 'Shovel Devil Build Story — Kai Fuchs Custom Stuttgart',
    metaDescription:
      'Wie Kai Fuchs einen 1976er Harley-Davidson Shovelhead in 16 Monaten zum Shovel Devil verwandelt hat. Die komplette Build Story.',
    category: 'build-story',
    categoryLabel: 'Build Story',
    excerpt:
      'Ein 1976er Shovelhead, 16 Monate Arbeit und eine klare Haltung: Old School ist keine Nostalgie.',
    coverImage:
      'https://images.unsplash.com/photo-1561811565-6ed172b54cbe?w=1200&q=85',
    publishedAt: '2025-09-08',
    readTime: '10 min',
    author: 'MotoDigital Redaktion',
    tags: ['Build Story', 'Chopper', 'Harley-Davidson', 'Shovelhead', 'Stuttgart'],
    relatedSlugs: ['bobber-kaufen-guide', 'max-steiner-bobber-interview', 'was-kostet-ein-custom-bike'],
    relatedBuilderSlug: 'kai-fuchs-custom',
    relatedBuildSlug: 'shovel-devil',
    content: [
      {
        type: 'intro',
        text: 'Der Shovel Devil entstand nicht aus einem Trend heraus. Er entstand aus einer Überzeugung: dass ein Shovelhead-Motor aus dem Jahr 1976 alles mitbringt, was ein Motorrad braucht — wenn man ihm die Chance gibt, das zu zeigen.',
      },
      {
        type: 'h2',
        text: 'Die Basis: Ein Motor, der schon alles erlebt hat',
      },
      {
        type: 'p',
        text: 'Kai Fuchs fand den 76er Shovelhead-Block bei einer Haushaltsauflösung in der Nähe von Stuttgart. Der Motor war seit Jahren nicht mehr gelaufen, die Elektrik fehlte komplett, und der ursprüngliche Rahmen war längst verschrottet. Was blieb, war ein 74 Kubikzoll großes Versprechen aus Gusseisen. Für Kai war das genug.',
      },
      {
        type: 'h2',
        text: 'Der Aufbau: Nichts Unnötiges',
      },
      {
        type: 'p',
        text: 'Das Konzept des Shovel Devil ist radikale Reduktion. Kai fertigte einen neuen Stahlrohrrahmen nach eigenen Maßen, der die charakteristische Silhouette eines Hardtail-Choppers definiert, ohne ins Klischee zu verfallen. Der Tank stammt von einem frühen Harley-Davidson Sportster, modifiziert und manuell lackiert in einem tiefen Oxblood-Rot. Die Gabel wurde um 2 Zoll über Standart verlängert, um die Geometrie zu betonen, ohne die Lenkbarkeit zu kompromittieren.',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1561811565-6ed172b54cbe?w=1200&q=85',
        caption: 'Der fertige Shovel Devil — 16 Monate Arbeit, eine klare Vision.',
      },
      {
        type: 'h2',
        text: 'Motorrevision: Respekt vor dem Original',
      },
      {
        type: 'p',
        text: 'Die Motorrevision dauerte allein drei Monate. Kai arbeitet prinzipiell mit Originalteilen, wo möglich, und setzt auf moderne Komponenten nur dort, wo es die Zuverlässigkeit erfordert. Neue Kolben, überarbeitete Köpfe, eine moderne Lichtmaschine — alles andere blieb soweit wie möglich original. Das Ergebnis ist ein Motor, der anders klingt als alles, was aktuell gefertigt wird: rau, rhythmisch, unverkennbar.',
      },
      {
        type: 'quote',
        text: 'Old School ist keine Nostalgie. Es ist eine Entscheidung, das Wesentliche über das Dekorative zu stellen.',
        author: 'Kai Fuchs',
      },
      {
        type: 'h2',
        text: 'Das Ergebnis: Ein Bike, das polarisiert',
      },
      {
        type: 'p',
        text: 'Der Shovel Devil ist kein Bike für alle. Die Sitzposition ist kompromisslos, die Vibrationen sind spürbar, und wer einen Kofferraum sucht, ist falsch. Aber wer einmal gefahren ist — wer den Rhythmus des alten Motors gespürt hat — versteht, warum Kai 16 Monate seines Lebens in dieses Projekt investiert hat. Es ist kein Fahrzeug. Es ist eine Haltung.',
      },
    ],
  },

  {
    slug: 'scrambler-vs-tracker-vergleich',
    title: 'Scrambler vs. Tracker: Was ist der Unterschied und welcher passt zu dir?',
    metaTitle: 'Scrambler vs. Tracker — Unterschied & Kaufentscheidung 2025',
    metaDescription:
      'Scrambler oder Tracker? Wir erklären den Unterschied, zeigen die besten Modelle und helfen dir bei der Entscheidung.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Beide Stile sind vielseitig — aber der Unterschied liegt im Detail. Wir erklären, was dich erwartet.',
    coverImage:
      'https://images.unsplash.com/photo-1582092722992-b2f960bafbfb?w=1200&q=85',
    publishedAt: '2025-08-22',
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
        type: 'quote',
        text: 'Der Scrambler fragt: Wohin kann ich fahren? Der Tracker fragt: Wie schnell kann ich es tun.',
        author: 'Anna Wolff, Freiburg',
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

  {
    slug: 'max-steiner-bobber-interview',
    title: 'Max Steiner: "Ein Bobber muss fahren. Nicht nur stehen."',
    metaTitle: 'Max Steiner Interview — Bobber Builder München',
    metaDescription:
      'Max Steiner über 22 fertiggestellte Builds, handlackierte Tanks und warum er bei Bobber-Projekten niemals Kompromisse eingeht.',
    category: 'interview',
    categoryLabel: 'Interview',
    excerpt:
      'Der Münchner Builder über Bobber-Philosophie, handlackierte Tanks und warum er nie Kompromisse eingeht.',
    coverImage:
      'https://images.unsplash.com/photo-1609202748711-feef2cdc7da3?w=1200&q=85',
    publishedAt: '2025-07-14',
    readTime: '12 min',
    author: 'MotoDigital Redaktion',
    tags: ['Interview', 'Bobber', 'Builder', 'München', 'BMW R-Serie'],
    relatedSlugs: ['bobber-kaufen-guide', 'shovelhead-revival-kai-fuchs', 'was-kostet-ein-custom-bike'],
    relatedBuilderSlug: 'max-steiner',
    content: [
      {
        type: 'intro',
        text: 'Max Steiner hat 22 Bikes fertiggestellt. Keines sieht wie das andere aus. Aber alle tragen unverkennbar seine Handschrift: reduzierten Linien, handlackierte Tanks, eine Konsequenz im Weglassen, die man nur durch Erfahrung entwickelt. Wir haben ihn in seiner Münchner Werkstatt getroffen.',
      },
      {
        type: 'h2',
        text: 'Max, 22 Builds — was hast du in dieser Zeit gelernt?',
      },
      {
        type: 'p',
        text: 'Dass weniger tatsächlich mehr ist. Mein erster Build war vollgepackt mit Ideen. Zu viele Ideen. Ein guter Bobber hat eine Aussage — eine, nicht zehn. Ich muss beim Kunden manchmal Dinge rausstreichen, die er sich wünscht, weil sie das Gesamtbild verwässern. Das ist kein angenehmes Gespräch. Aber das Ergebnis gibt mir meistens recht.',
      },
      {
        type: 'h2',
        text: 'Du lackierst Tanks ausschließlich von Hand. Warum?',
      },
      {
        type: 'p',
        text: 'Weil eine Maschine nicht lügen kann. Ein handlackierter Tank hat Tiefe — das Licht verhält sich anders, es gibt minimale Unregelmäßigkeiten, die ihn lebendig machen. Karosserielacke aus der Spritzpistole sind perfekt. Und Perfektion ist langweilig. Ich will, dass ein Bike Spuren trägt — nicht von Verschleiß, sondern von menschlicher Arbeit.',
      },
      {
        type: 'quote',
        text: 'Ein Bobber muss fahren. Nicht nur stehen. Wenn ein Kunde sagt, er will das Bike hauptsächlich ausstellen, arbeite ich mit ihm nicht zusammen.',
        author: 'Max Steiner',
      },
      {
        type: 'h2',
        text: 'Was macht die BMW R-Serie zur perfekten Bobber-Basis?',
      },
      {
        type: 'p',
        text: 'Der Boxer-Motor gibt dir die Silhouette geschenkt. Dieses markante, breite Triebwerk — das ist nicht etwas, das du nachträglich erzählen musst. Es erzählt sich von allein. Dazu kommt die Zuverlässigkeit. Eine R80 oder R100 mit ordentlicher Revision läuft ohne Probleme. Das ist wichtig, denn ich will, dass die Bikes meiner Kunden täglich gefahren werden — nicht ins Wochenende getrailert.',
      },
      {
        type: 'h2',
        text: 'Wie gehst du mit Kunden um, die sehr genaue Vorstellungen mitbringen?',
      },
      {
        type: 'p',
        text: 'Ich frage immer zuerst: Was wollt ihr mit dem Bike erleben, nicht was wollt ihr sehen? Die Antwort verändert alles. Jemand, der täglich zur Arbeit fahren will, braucht ein anderes Bike als jemand, der Sonntagstouren macht. Erst wenn ich das verstanden habe, fangen wir an zu skizzieren. Pinterest-Boards nehme ich zur Kenntnis. Aber sie bestimmen nicht meinen Entwurf.',
      },
    ],
  },

  {
    slug: 'berlin-ghost-build-story',
    title: 'Berlin Ghost: Wie Studio Nord aus einer Suzuki GS750 ein Straßenmonster gemacht hat',
    metaTitle: 'Berlin Ghost Build Story — Studio Nord Hamburg Custom',
    metaDescription:
      'Studio Nord verwandelt eine Suzuki GS750 in den Berlin Ghost: ein aggressiver Street-Custom mit Hafencharakter. Die komplette Build Story.',
    category: 'build-story',
    categoryLabel: 'Build Story',
    excerpt:
      'Das Hamburger Duo über Hafenluft, schlanke Builds und die Kunst des Weglassens.',
    coverImage:
      'https://images.unsplash.com/photo-1629628083289-009e6f87f5cf?w=1200&q=85',
    publishedAt: '2025-06-03',
    readTime: '9 min',
    author: 'MotoDigital Redaktion',
    tags: ['Build Story', 'Street', 'Suzuki', 'Hamburg', 'Custom'],
    relatedSlugs: ['cafe-racer-kaufen-guide', 'cafe-racer-selber-bauen-basis-bikes', 'was-kostet-ein-custom-bike'],
    relatedBuilderSlug: 'studio-nord',
    relatedBuildSlug: 'berlin-ghost',
    content: [
      {
        type: 'intro',
        text: 'Der Berlin Ghost ist kein sanfter Umbau. Er ist eine Transformation. Studio Nord — das Hamburger Builder-Duo Lars und Mia — hat eine 1979er Suzuki GS750 bis auf den Rahmen zerlegt und neu gedacht. Das Ergebnis ist eines der eindrücklichsten Street-Customs, das 2024 aus deutschen Workshops gekommen ist.',
      },
      {
        type: 'h2',
        text: 'Ausgangspunkt: Eine GS750 mit Geschichte',
      },
      {
        type: 'p',
        text: 'Die GS750 kam aus Schweden, via einem Online-Inserat. 79er Baujahr, erstaunlich solide Substanz, aber jahrelang ohne Pflege. Studio Nord sah in der GS750 genau das, was sie gesucht hatten: einen robusten Parallelzweizylindermotor mit einem Rahmen, der Spielraum für eine völlig neue Interpretation ließ. "Die GS ist ehrlich", sagt Lars. "Keine versteckten Konstruktionsfehler, kein Marketingversprechen. Sie ist einfach da."',
      },
      {
        type: 'h2',
        text: 'Das Konzept: Hafen und Asphalt',
      },
      {
        type: 'p',
        text: 'Studio Nord arbeitet immer mit einer atmosphärischen Referenz. Beim Berlin Ghost war es der Gegensatz zwischen dem Hamburger Hafen — rau, industriell, grau — und den nächtlichen Straßen Berlins — lebhaft, harsch beleuchtet, kontrastreich. Das Bike sollte beide Welten verkörpern: tagsüber zurückhaltend, nachts dominant.',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1629628083289-009e6f87f5cf?w=1200&q=85',
        caption: 'Berlin Ghost bei der ersten Ausfahrt in Hamburg — Morgenlicht, nasses Pflaster.',
      },
      {
        type: 'h2',
        text: 'Die Technik: Alles für die Straße',
      },
      {
        type: 'p',
        text: 'Der Rahmen wurde verkürzt und mit einer minimalistischen Hecksektion aus handgefertigtem Stahl versehen. Die Telegabel wurde überholt, Öhlins-Stoßdämpfer hinten eingebaut. Besonders aufwendig war die Elektrik: Ein vollständig neuer Kabelbaum mit einem kleinen, versteckten Lithium-Akku unter der Sitzbank. Der Tacho ist ein Acewell-Einheitsrundscheibe, in schwarzem Aluminiumgehäuse — clean, funktional.',
      },
      {
        type: 'quote',
        text: 'Wir bauen keine Bikes für Wettbewerbe. Wir bauen Bikes für Leute, die fahren wollen — und die dabei gut aussehen möchten.',
        author: 'Lars (Studio Nord)',
      },
      {
        type: 'h2',
        text: 'Das Finish: Grau in Grau, aber nicht langweilig',
      },
      {
        type: 'p',
        text: 'Die Farbgebung des Berlin Ghost ist subtil und präzise. Tiefschiefergrau am Rahmen, mit einem leichten Blauschimmer im Sonnenlicht. Der Tank in mattem Anthrazit, von Hand abgemischt. Die Motorabdeckungen wurden sandgestrahlt und klar versiegelt — keine Politur, kein Chrome. Der Berlin Ghost ist ein Bike, das seine Intension nicht laut ankündigt. Es lässt die Arbeit sprechen.',
      },
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
    title: 'Custom Motorcycle Guides & Ratgeber 2025 | MotoDigital',
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
  'jakob-kraft-berlin-interview': {
    title: '"A bike without a story is just a vehicle" — Jakob Kraft interviewed',
    metaTitle: 'Jakob Kraft interview — Café Racer builder from Berlin',
    metaDescription:
      'Berlin-based builder Jakob Kraft on custom culture, his approach to Café Racers and what makes a great build.',
    excerpt:
      "Jakob Kraft builds Café Racers in a workshop in Neukölln. No social-media theatrics, no series builds — just one-offs with a backstory. A conversation about craft, patience and why every bike gets a name.",
    categoryLabel: 'Interview',
  },
  'shovelhead-revival-kai-fuchs': {
    title: 'Shovelhead Revival: 16 months, a \'76 engine and a clear statement',
    metaTitle: 'Shovel Devil build story — Kai Fuchs Custom Stuttgart',
    metaDescription:
      'Kai Fuchs tells the full build story of the Shovel Devil — from a dusty 1976 Harley engine to a finished hand-built Shovelhead.',
    excerpt:
      "Sixteen months, a 1976 Shovelhead engine and a workshop in Stuttgart. Kai Fuchs tells the complete story of the Shovel Devil — including everything that went wrong along the way.",
    categoryLabel: 'Build Story',
  },
  'scrambler-vs-tracker-vergleich': {
    title: 'Scrambler vs. Tracker: what\'s the difference and which one suits you?',
    metaTitle: 'Scrambler vs. Tracker — differences & which to buy in 2025',
    metaDescription:
      'Scrambler or Tracker? Geometry, tyres, use cases and which bike matches which rider. With concrete examples from the used market.',
    excerpt:
      'They look similar at first glance — but scramblers and trackers are fundamentally different bikes. This comparison explains the differences, where each works best, and which one actually suits your riding style.',
    categoryLabel: 'Guide',
  },
  'max-steiner-bobber-interview': {
    title: 'Max Steiner on bobbers, patience and why every bolt matters',
    metaTitle: 'Max Steiner interview — Bobber builder Munich',
    metaDescription:
      "Munich-based builder Max Steiner on his bobber philosophy, the temptation of shortcuts and why his builds take 18 months.",
    excerpt:
      "Max Steiner builds one bobber a year — and is booked out for the next three. A conversation about slow craft, customers who understand the wait, and why 'a bobber' always means more than just a silhouette.",
    categoryLabel: 'Interview',
  },
  'berlin-ghost-build-story': {
    title: 'Berlin Ghost: the slate-grey build nobody expected',
    metaTitle: 'Berlin Ghost build story — Studio Nord Hamburg Custom',
    metaDescription:
      'Studio Nord Hamburg on the Berlin Ghost — a minimalist BMW R-series build with deliberately muted finishes and maximum attention to detail.',
    excerpt:
      'No chrome. No high-gloss paint. No Instagram-ready photoshoot. The Berlin Ghost breaks every convention of the custom scene — and that\'s exactly why it works. A conversation with Studio Nord about a build that lets the work speak.',
    categoryLabel: 'Build Story',
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
    title: 'Custom motorcycle guides & buying advice 2025 | MotoDigital',
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
