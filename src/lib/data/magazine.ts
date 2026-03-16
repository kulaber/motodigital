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
  readTime: string
  author: string
  tags: string[]
  relatedBuilderSlug?: string
  relatedBuildSlug?: string
  content: ArticleSection[]
}

export const ARTICLES: Article[] = [
  {
    slug: 'cafe-racer-kaufen-guide',
    title: 'Cafe Racer kaufen: Der vollständige Leitfaden für 2025',
    metaTitle: 'Cafe Racer kaufen 2025 — Tipps, Preise & Worauf achten',
    metaDescription:
      'Cafe Racer kaufen: Alles über Rahmenprüfung, TÜV, Preise und die besten Modelle 2025. Unser Guide für Einsteiger und Kenner.',
    category: 'guide',
    categoryLabel: 'Guide',
    excerpt:
      'Von der Rahmenprüfung bis zur Zulassung — unser vollständiger Leitfaden für Custom-Bike-Käufer.',
    coverImage:
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&q=85',
    publishedAt: '2025-11-15',
    readTime: '15 min',
    author: 'MotoDigital Redaktion',
    tags: ['Cafe Racer', 'Kaufratgeber', 'Custom Motorcycle', 'TÜV', 'Deutschland'],
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
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85',
    publishedAt: '2025-10-20',
    readTime: '12 min',
    author: 'MotoDigital Redaktion',
    tags: ['Interview', 'Cafe Racer', 'Builder', 'Berlin', 'Honda CB750'],
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
      'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&q=85',
    publishedAt: '2025-09-08',
    readTime: '10 min',
    author: 'MotoDigital Redaktion',
    tags: ['Build Story', 'Chopper', 'Harley-Davidson', 'Shovelhead', 'Stuttgart'],
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
        src: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&q=85',
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
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=85',
    publishedAt: '2025-08-22',
    readTime: '7 min',
    author: 'MotoDigital Redaktion',
    tags: ['Scrambler', 'Tracker', 'Kaufratgeber', 'Custom Motorcycle', 'Vergleich'],
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
      'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=1200&q=85',
    publishedAt: '2025-07-14',
    readTime: '12 min',
    author: 'MotoDigital Redaktion',
    tags: ['Interview', 'Bobber', 'Builder', 'München', 'BMW R-Serie'],
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
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&q=85',
    publishedAt: '2025-06-03',
    readTime: '9 min',
    author: 'MotoDigital Redaktion',
    tags: ['Build Story', 'Street', 'Suzuki', 'Hamburg', 'Custom'],
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
        src: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&q=85',
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
      'Exklusive Interviews mit den bekanntesten Custom-Motorcycle-Buildern Deutschlands. Ihre Philosophie, ihre Projekte, ihre Haltung.',
  },
  guide: {
    label: 'Guide',
    title: 'Custom Motorcycle Guides & Ratgeber 2025 | MotoDigital',
    description:
      'Kaufratgeber, Vergleiche und Leitfäden rund um Custom Motorcycles. Alles was du wissen musst, bevor du kaufst.',
  },
} as const
