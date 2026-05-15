// Style-spezifische Inhalte für die Hub-Seiten unter /bikes/[style].
// Heading, Intro und FAQs werden zusätzlich zur Listing-Komponente
// gerendert und füttern den FAQPage-LD.

export interface StyleFaq {
  q: string
  a: string
}

export interface StyleContent {
  heading: string
  lead: string
  intro: string[]
  faqs: StyleFaq[]
}

export const BIKE_STYLE_CONTENT: Record<string, StyleContent> = {
  'cafe-racer': {
    heading: 'Cafe Racer kaufen — handgefertigte Custom Bikes',
    lead: 'Klare Linie, Stummellenker, Höcker: Cafe Racer aus europäischen Werkstätten — von der Honda CB750 bis zur BMW R nineT.',
    intro: [
      'Der Cafe Racer ist die ikonische Custom-Form, die in den 1950er Jahren rund um das Londoner Ace Cafe entstand. Junge Rocker — die „Ton-up Boys" — bauten ihre Maschinen für die 100-Meilen-Sprints zwischen den Cafés der North Circular Road um. Heute steht der Cafe Racer für eine bestimmte Designsprache: reduziert, schnell, fokussiert.',
      'Auf MotoDigital findest du Cafe-Racer-Builds aus Deutschland, Österreich und der Schweiz — von der Yamaha XS650 bis zur BMW K1100RS. Die Plattform verbindet dich direkt mit der Werkstatt oder dem Privatbuilder. Kein Mittelmann, keine versteckten Gebühren.',
    ],
    faqs: [
      {
        q: 'Was macht ein Motorrad zu einem Cafe Racer?',
        a: 'Typische Merkmale sind Stummellenker (Clip-ons), eine Einzelsitzbank mit Höcker, ein verlängerter Tank mit Knieführung, rückwärts montierte Fußrasten und eine spartanische Instrumentierung. Optisch dominiert eine flache, langgestreckte Linie vom Tank über den Sitz bis zum Heck.',
      },
      {
        q: 'Welche Basis-Bikes eignen sich für einen Cafe Racer Umbau?',
        a: 'Klassiker sind Honda CB750/CB550, Yamaha XS650, Kawasaki Z900, Triumph Bonneville, Moto Guzzi V7 und BMW R-Modelle (Boxer + K-Serie). Moderne Basen: BMW R nineT, Triumph Thruxton, Royal Enfield Continental GT.',
      },
      {
        q: 'Was kostet ein Custom Cafe Racer?',
        a: 'Hochwertige Werkstatt-Builds starten bei etwa 8.000–12.000 € (gebrauchte Basis, Teilumbau). Komplettumbauten mit individueller Lackierung und neuwertigen Komponenten liegen häufig zwischen 18.000 und 35.000 €. Limited Editions oder Show-Bikes können deutlich darüber liegen.',
      },
      {
        q: 'Was muss ich beim TÜV / bei der Eintragung beachten?',
        a: 'In Deutschland sind Umbauten wie geänderte Lenker, Auspuffanlagen, Beleuchtung und Sitzbank eintragungspflichtig. Empfehlung: Vor dem Kauf das Gutachten, die Einzelbetriebserlaubnis nach §21 StVZO und die Übereinstimmungsbestätigung prüfen. Seriöse Werkstätten liefern alle Papiere mit.',
      },
    ],
  },

  'bobber': {
    heading: 'Bobber kaufen — kompromisslos reduzierte Custom Bikes',
    lead: 'Bobbed Fender, Solo-Sattel, fetter Hinterreifen: Bobber-Custom-Bikes auf Basis von Harley-Davidson, Triumph Bonneville oder Yamaha XV.',
    intro: [
      'Der Bobber entstand in den späten 1940er Jahren in den USA — Heimkehrer aus dem Zweiten Weltkrieg „bobbten" (verkürzten) die Schutzbleche ihrer Harleys und Indians, um Gewicht zu sparen und schneller zu fahren. Daraus entwickelte sich eine eigene Custom-Schule, die bis heute prägt.',
      'Auf MotoDigital findest du Bobber-Builds aus dem deutschsprachigen Raum — von puristischen Harley-Sportster-Umbauten bis zu modernen Triumph-Bonneville-Bobbern.',
    ],
    faqs: [
      {
        q: 'Was unterscheidet einen Bobber von einem Chopper?',
        a: 'Der Bobber ist puristisch und kurz: gekürzte Schutzbleche, Solo-Sitz, gerne ein rigid frame oder Hardtail-Optik. Der Chopper hingegen ist extrem gestreckt mit langer Gabel, hohem Lenker und meist extravagantem Tank. Bobber = funktional minimalistisch, Chopper = expressiv überlängert.',
      },
      {
        q: 'Welche Basis-Bikes werden typischerweise zu Bobbern umgebaut?',
        a: 'Harley-Davidson Sportster und Softail sind die Klassiker. In Europa beliebt: Triumph Bonneville Bobber (ab Werk), Yamaha XV 535/750, Honda Shadow, Kawasaki Vulcan. Auch BMW R nineT lässt sich zum modernen Bobber umbauen.',
      },
      {
        q: 'Sind Bobber alltagstauglich?',
        a: 'Bedingt. Der Solo-Sitz, die meist tiefe Sitzposition und das oft fehlende Soziuspedal machen längere Touren unbequem. Für 100–200 km Wochenendrunden ideal, für Pendlerverkehr oder Reisen weniger geeignet. Vor dem Kauf eine ausgiebige Probefahrt einplanen.',
      },
    ],
  },

  'scrambler': {
    heading: 'Scrambler kaufen — Custom Bikes für Straße und Schotter',
    lead: 'Hochgelegte Auspuffanlage, grobstollige Reifen, breiter Lenker: Scrambler-Builds, die auf Asphalt und losem Untergrund funktionieren.',
    intro: [
      'Scrambler entstanden in den 1960er Jahren, als die On-Road-Maschinen mit zusätzlichen Stollenreifen, Sumpfschutz und hochgelegtem Auspuff für leichte Geländefahrten fit gemacht wurden. Die Triumph T120 TT Special und die Honda CL77 sind Klassiker der Ära.',
      'Heute steht der Scrambler für eine Lifestyle-orientierte Custom-Schule: roher Look, gutmütige Sitzposition, Allround-Tauglichkeit. Beliebte Basen: Ducati Scrambler, Triumph Street Scrambler, Yamaha XSR700, BMW R nineT Scrambler.',
    ],
    faqs: [
      {
        q: 'Was ist der Unterschied zwischen Scrambler und Enduro?',
        a: 'Der Scrambler ist primär ein Straßenmotorrad mit Offroad-Optik — kurzer Federweg, On/Off-Reifen, oft auch Gussräder. Eine Enduro hat langen Federweg, Speichenräder und ist für echte Gelände-Einsätze gebaut. Scrambler = 80 % Straße, Enduro = 50/50.',
      },
      {
        q: 'Welche Reifen passen auf einen Scrambler?',
        a: 'Klassisch sind 50/50-Reifen wie Pirelli MT60 RS, Continental TKC 70 oder Heidenau K60 Scout. Wer mehr Straßenanteil fährt, greift zu Block-Profilreifen wie Metzeler Karoo Street. Für echtes Gelände: Continental TKC 80.',
      },
      {
        q: 'Welche Werkstätten bauen Scrambler in Deutschland?',
        a: 'Auf MotoDigital findest du verifizierte Custom-Werkstätten mit Scrambler-Schwerpunkt — gefiltert nach Standort und Stil. Über die Map-Suche kannst du dir direkt die nächste Werkstatt anzeigen lassen.',
      },
    ],
  },

  'tracker': {
    heading: 'Tracker kaufen — Flat Track inspirierte Custom Bikes',
    lead: 'Lenkernummer-Schilder, schmaler Tank, hoher Heck-Aufstellwinkel: Tracker-Builds im Flat-Track-Stil.',
    intro: [
      'Der Tracker hat seine Wurzeln im amerikanischen Flat-Track-Rennsport — kurze Ovalbahnen, ABS gesperrt, schnelle Driftkurven. Die Bikes sind extrem reduziert: keine Frontbremse (im Rennsport), schmaler Lenker, kurzer Heckaufsatz. Custom-Tracker für die Straße übernehmen die Optik, behalten aber zwei funktionierende Bremsen.',
      'Beliebte Basen für Tracker-Umbauten: Yamaha SR400/500, Suzuki DR-Z400, Honda CB-Modelle, KTM 690 Duke, Husqvarna Vitpilen 401/701. Moderne Werks-Tracker: Indian FTR 1200, Triumph Speed Twin (umgebaut).',
    ],
    faqs: [
      {
        q: 'Was ist der Unterschied zwischen Tracker und Scrambler?',
        a: 'Beide haben einen rohen, sportlichen Look. Der Tracker ist enger und sprintorientiert — schmaler Tank, kurzer Heckhöcker, oft 19"-Räder, kein Sumpfschutz. Der Scrambler ist breiter, höher und auf Komfort/Offroad ausgelegt. Tracker = Ovalbahn-DNA, Scrambler = Allround-Lifestyle.',
      },
      {
        q: 'Sind Custom-Tracker straßenzulassungsfähig?',
        a: 'Ja, wenn alle Pflichtkomponenten vorhanden und eingetragen sind: zwei funktionierende Bremsen, Beleuchtung (Front + Heck + Blinker), Spiegel, Hupe, Kennzeichenträger. Werkstatt-Builds liefern in der Regel die Einzelbetriebserlaubnis nach §21 StVZO mit.',
      },
    ],
  },

  'chopper': {
    heading: 'Chopper kaufen — extrem gestreckte Custom Bikes',
    lead: 'Lange Gabel, hoher Lenker, gestreckter Rahmen: Chopper-Custom-Bikes mit klassischen V-Twin-Motoren.',
    intro: [
      'Der Chopper wurde in den 1960er Jahren in den USA zum Inbegriff der Outlaw-Biker-Kultur — „Easy Rider" (1969) prägte die Optik weltweit. Charakteristisch: extrem nach vorne verlagerte Vorderradachse, hohe Lenker („Apehangers"), aufwändige Lackierungen, oft Sissybars.',
      'Auf MotoDigital findest du europäische Chopper-Builds — von puristischen Harley-Davidson-Umbauten bis zu Kustom-Show-Bikes mit Airbrush-Lackierung und handgeschmiedeten Teilen.',
    ],
    faqs: [
      {
        q: 'Wie viel länger ist ein Chopper als ein Standard-Motorrad?',
        a: 'Der Radstand wird typischerweise um 10–30 cm verlängert. Die Gabel ist 6–12 Zoll länger als die Originalgabel — bei extremen Custom-Bikes auch deutlich mehr. Wichtig: Jede Verlängerung muss separat eingetragen werden, und die Geometrie beeinflusst das Fahrverhalten erheblich.',
      },
      {
        q: 'Welche Motoren werden typischerweise verwendet?',
        a: 'V-Twins dominieren: Harley-Davidson Big Twin (Shovelhead, Panhead, Evolution, Twin Cam), Indian-Motoren, S&S-Motoren. Auch japanische V-Twins (Yamaha XV, Suzuki Intruder) und europäische Boxer (BMW R-Modelle) werden für eigenständige Chopper-Builds genutzt.',
      },
    ],
  },

  'brat-style': {
    heading: 'Brat Style Bikes — japanischer Custom-Minimalismus',
    lead: 'Flache Sitzbank, niedriger Lenker, schlichte Linie: Brat-Style-Builds in der Tradition von Go Takamine und Brat Style Tokyo.',
    intro: [
      'Brat Style entstand in den 2000er Jahren in Tokio rund um Go Takamine und seine Werkstatt „Brat Style". Die Idee: ein zurückgenommener, fast schon „roher" Look, der Cafe Racer, Bobber und Tracker zu einer eigenen Schule verbindet. Wichtig sind eine durchgehende, flache Sitzlinie, ein niedriger Lenker und eine möglichst unaufgeregte Lackierung.',
      'Typische Basen: Yamaha SR400, Honda CB-Modelle, Kawasaki W650, Triumph Bonneville. Die Builds sind oft mit Vintage-Komponenten kombiniert und bleiben technisch eher konservativ.',
    ],
    faqs: [
      {
        q: 'Was unterscheidet Brat Style von Cafe Racer?',
        a: 'Der Brat hat eine flache, gerade Sitzbank ohne Höcker und einen niedrigen, geraden Lenker (oft Drag Bar oder Tracker Bar). Der Cafe Racer hat einen Höcker, Stummellenker und ist sportlicher abgestimmt. Brat = entspannter Cruiser-Vibe, Cafe Racer = Sprintbike.',
      },
      {
        q: 'Welche Marken sind typisch für Brat Style?',
        a: 'Japanische Singles und Twins dominieren: Yamaha SR400/500, Honda CB400SS/CB350F, Kawasaki W650/W800, Suzuki TU250. Auch europäische Singles wie Royal Enfield Bullet 500 passen gut.',
      },
    ],
  },

  'street-fighter': {
    heading: 'Street Fighter kaufen — aggressive Naked-Custom-Bikes',
    lead: 'Verkleidung weg, Lenker breit, Beleuchtung kompromisslos: Street-Fighter-Custom-Bikes auf Basis sportlicher Vierzylinder.',
    intro: [
      'Street Fighter entstand in den 1980er Jahren in Großbritannien, als Fahrer beschädigte Sportbikes ohne Verkleidung wieder aufbauten. Daraus wurde eine eigene Schule: nackt, aggressiv, mit großem Lenker und kompakter Lichtanlage.',
      'Beliebte Basen: Suzuki GSX-R, Yamaha R1, Kawasaki ZX-Modelle, Honda CBR. Die Builds tragen die Leistungs-DNA des Spenders, sehen aber komplett anders aus.',
    ],
    faqs: [
      {
        q: 'Brauche ich für einen Street Fighter eine starke Basis?',
        a: 'Ja — der Street-Fighter-Look lebt vom Leistungspotenzial. Vier-Zylinder-Supersportler (600 ccm aufwärts) sind klassisch, aber auch leistungsstarke Twins (Ducati Monster, Aprilia Tuono) eignen sich. Für Einsteiger reicht eine 600er völlig aus.',
      },
      {
        q: 'Was kostet ein Street-Fighter-Umbau?',
        a: 'Wenn die Basis vorhanden ist, liegen Umbauten zwischen 2.000 € (Eigenleistung, gebrauchte Komponenten) und 8.000 € (Werkstatt-Build mit Custom-Heck, neuer Lichtanlage, Auspuff, Lackierung). Komplette Show-Bikes deutlich darüber.',
      },
    ],
  },

  'enduro': {
    heading: 'Enduro & Adventure Custom Bikes',
    lead: 'Lang gefedert, hoch gebaut, ausgelegt für Strecke und Schotter: Enduro- und Adventure-Custom-Builds.',
    intro: [
      'Enduros und Adventure-Bikes sind für lange Strecken, raues Gelände und mehrwöchige Touren ausgelegt — Federweg jenseits der 200 mm, Speichenräder, robuste Rahmen. Custom-Versionen heben sich durch eigenständige Aufbauten ab: maßgefertigte Tank-Sitzeinheiten, Spezialgepäckträger, individuelle Federabstimmungen.',
      'Typische Basen: KTM 690/790/890, Yamaha Ténéré 700, Honda Africa Twin, BMW R 1250 GS, Suzuki DR-Z 400. Auch klassische Enduros (Honda XR, Suzuki DR Big) werden zu Resto-Mod-Builds umgebaut.',
    ],
    faqs: [
      {
        q: 'Was unterscheidet eine Enduro von einer Adventure-Maschine?',
        a: 'Eine Enduro ist leichter (bis ca. 180 kg), gelände-orientiert und meist mit einem Einzylinder. Ein Adventure-Bike ist größer, schwerer (220+ kg), tourentauglich, oft Twin oder Boxer, mit großem Tank und Komfortausstattung. Enduro = primär Gelände, Adventure = lange Strecken plus moderates Gelände.',
      },
    ],
  },

  'old-school': {
    heading: 'Old School Custom Bikes',
    lead: 'Vintage-Optik, klassische Lackierungen, originalgetreue Komponenten: Old-School-Builds mit Tradition.',
    intro: [
      'Old School steht für Custom-Bikes, die bewusst auf moderne Komponenten verzichten und stattdessen den Look der 1950er bis 1970er Jahre zitieren — Flathead-Optik, klassische Lackierungen, vernickelte Teile, Speichenräder. Die Schule überschneidet sich mit Bobber und Chopper, ist aber stärker auf historische Korrektheit ausgerichtet.',
    ],
    faqs: [
      {
        q: 'Welche Basis-Bikes eignen sich für einen Old-School-Build?',
        a: 'Klassiker sind Harley-Davidson Panhead, Shovelhead, Knucklehead (originalgetreu schwer zu finden, aber gefragt), Triumph Pre-Unit, BSA Gold Star. Bezahlbarere Alternativen: Yamaha XV 535/750, Honda CB-Modelle, Royal Enfield Bullet.',
      },
    ],
  },

  'street': {
    heading: 'Street Custom Bikes',
    lead: 'Alltagstaugliche Custom-Builds für Stadt und Landstraße.',
    intro: [
      'Street-Customs sind die pragmatische Mitte zwischen Cafe Racer, Bobber und Scrambler — alltagstauglich, mit angenehmer Sitzposition, vernünftiger Beleuchtung und Soziustauglichkeit. Ideal für Pendler, die einen individuellen Look ohne Funktionsverlust suchen.',
    ],
    faqs: [
      {
        q: 'Was macht einen Street-Custom alltagstauglich?',
        a: 'Eine bequeme Sitzposition, eine Soziusbank (oder die Möglichkeit, eine zu montieren), ausreichende Tankgröße (mind. 12 L für 200 km Reichweite), funktionierende Tagfahrlichter und ABS (bei Bedarf). Die Optik darf reduziert sein, die Praxistauglichkeit darf nicht leiden.',
      },
    ],
  },

  'naked': {
    heading: 'Naked Custom Bikes',
    lead: 'Verkleidung weg, Linie pur: Naked-Bike-Custom-Builds.',
    intro: [
      'Naked Bikes sind Motorräder ohne Verkleidung — der Motor, der Rahmen und die Komponenten bleiben sichtbar. Custom-Naked-Builds gehen einen Schritt weiter und bringen die rohe Mechanik mit individuellem Sitzaufbau, Lackierung und Lichtanlage zur Geltung. Übergänge zu Street Fighter, Cafe Racer und Brat Style sind fließend.',
    ],
    faqs: [
      {
        q: 'Was ist der Unterschied zwischen Naked und Street Fighter?',
        a: 'Naked Bikes sind oft Werks-Modelle ohne Verkleidung (BMW R nineT, Yamaha MT-09, KTM Duke) — ausgewogen und alltagstauglich. Street Fighter sind aggressiver, sportlicher abgestimmt, oft aus Supersportlern umgebaut. Naked = balanciert, Street Fighter = kompromisslos sportlich.',
      },
    ],
  },

  'basis-bike': {
    heading: 'Basis-Bikes & Stock Motorcycles',
    lead: 'Originalzustand-Bikes als Ausgangspunkt für eigene Custom-Projekte.',
    intro: [
      'Basis-Bikes sind Motorräder im weitgehend originalen Zustand — als Spender oder Ausgangspunkt für ein eigenes Custom-Projekt. Auf MotoDigital findest du gut erhaltene Klassiker, die sich für Cafe Racer-, Bobber-, Scrambler- oder Tracker-Umbauten eignen.',
    ],
    faqs: [
      {
        q: 'Worauf sollte ich beim Kauf eines Basis-Bikes achten?',
        a: 'Wichtig sind ein dokumentierter Wartungsverlauf, Originalzustand des Rahmens (keine versteckten Schweißnähte), klare Papiere mit Fahrgestellnummer und ein gepflegter Motor. Vor dem Kauf eine ausführliche Probefahrt und idealerweise eine Werkstatt-Inspektion einplanen.',
      },
    ],
  },
}

/** Slugs in der Reihenfolge, in der sie in der Plattform existieren. */
export const STYLE_SLUGS = Object.keys(BIKE_STYLE_CONTENT)
