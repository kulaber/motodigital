import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Nutzungsbedingungen — MotoDigital',
  description: 'Allgemeine Geschäftsbedingungen (AGB) & Nutzungsbedingungen von MotoDigital.',
}

export default function NutzungsbedingungenPage() {
  return (
    <>
      <Header />

      <main className="bg-[#222222] min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-5 lg:px-8 py-24">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Allgemeine Geschäfts&shy;bedingungen (AGB) &amp; Nutzungs&shy;bedingungen
          </h1>
          <p className="text-sm text-white/30 mb-12">Stand: März 2026</p>

          <div className="prose prose-invert prose-sm max-w-none space-y-8 text-white/60 [&_h2]:text-white [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-0 [&_p]:leading-relaxed [&_a]:text-[#2AABAB] [&_a]:no-underline hover:[&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:leading-relaxed">

            <section>
              <h2>1. Geltungsbereich</h2>
              <p>
                Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung
                der Plattform MotoDigital, erreichbar unter motodigital.io
                (nachfolgend „Plattform"), betrieben von [Dein vollständiger
                Name / Firmenname], [Adresse], [PLZ Stadt] (nachfolgend
                „Betreiber").
              </p>
              <p>
                Mit der Registrierung oder der Nutzung der Plattform erklärt
                der Nutzer sein Einverständnis mit diesen AGB.
              </p>
            </section>

            <section>
              <h2>2. Leistungsbeschreibung</h2>
              <p>
                MotoDigital ist eine Online-Plattform für die
                Custom-Motorrad-Community im DACH-Raum. Die Plattform
                ermöglicht:
              </p>
              <ul>
                <li>
                  die Präsentation und Vermittlung von Custom-Motorrädern
                  zwischen Privatpersonen und Händlern
                </li>
                <li>
                  die Darstellung von Werkstätten und Dienstleistern der
                  Custom-Szene
                </li>
                <li>
                  die Vernetzung von Fahrern, Werkstätten und Enthusiasten
                </li>
                <li>
                  das Veröffentlichen von Beiträgen, Fotos und
                  Projektbeschreibungen
                </li>
              </ul>
              <p>
                Der Betreiber stellt lediglich die technische Infrastruktur
                bereit. Verträge über den Kauf oder Verkauf von Motorrädern
                kommen ausschließlich zwischen den jeweiligen Nutzern
                zustande. MotoDigital ist nicht Vertragspartei solcher
                Geschäfte.
              </p>
            </section>

            <section>
              <h2>3. Registrierung &amp; Nutzerkonto</h2>
              <p>
                3.1 Die Nutzung bestimmter Funktionen setzt eine
                Registrierung voraus. Der Nutzer verpflichtet sich,
                wahrheitsgemäße und vollständige Angaben zu machen und diese
                aktuell zu halten.
              </p>
              <p>
                3.2 Das Nutzerkonto ist persönlich und nicht übertragbar.
                Zugangsdaten sind vertraulich zu behandeln.
              </p>
              <p>
                3.3 Der Betreiber behält sich das Recht vor, Konten bei
                Verstoß gegen diese AGB zu sperren oder zu löschen.
              </p>
            </section>

            <section>
              <h2>4. Nutzungspflichten</h2>
              <p>Der Nutzer verpflichtet sich:</p>
              <ul>
                <li>
                  keine falschen, irreführenden oder rechtswidrigen Inhalte
                  zu veröffentlichen
                </li>
                <li>
                  keine Inhalte zu posten, die Rechte Dritter verletzen
                  (Urheberrecht, Markenrecht, Persönlichkeitsrecht)
                </li>
                <li>
                  keine automatisierten Zugriffe oder Scraping-Aktivitäten
                  ohne ausdrückliche Genehmigung durchzuführen
                </li>
                <li>
                  die Plattform nicht für Spam, Phishing oder andere
                  missbräuchliche Aktivitäten zu verwenden
                </li>
                <li>
                  nur Motorräder und Gegenstände anzubieten, über die er
                  rechtlich verfügen darf
                </li>
              </ul>
            </section>

            <section>
              <h2>5. Inhalte &amp; Urheberrecht</h2>
              <p>
                5.1 Der Nutzer ist für alle von ihm eingestellten Inhalte
                (Texte, Bilder, Videos) selbst verantwortlich.
              </p>
              <p>
                5.2 Mit dem Hochladen von Inhalten räumt der Nutzer
                MotoDigital ein nicht exklusives, weltweites, kostenloses
                Nutzungsrecht ein, diese Inhalte im Rahmen des
                Plattformbetriebs zu verwenden, insbesondere zur Darstellung
                auf der Website und in sozialen Medien.
              </p>
              <p>
                5.3 Der Nutzer versichert, dass er über die erforderlichen
                Rechte an den hochgeladenen Inhalten verfügt und keine Rechte
                Dritter verletzt werden.
              </p>
            </section>

            <section>
              <h2>6. Werkstatt-Profile &amp; kostenpflichtige Leistungen</h2>
              <p>
                6.1 Werkstätten können ihre Profile kostenlos anlegen.
                Erweiterte Funktionen (z.&nbsp;B. Premium-Listings,
                hervorgehobene Darstellung, Analytics-Dashboard) sind
                kostenpflichtig und werden separat vereinbart.
              </p>
              <p>
                6.2 Preise, Laufzeiten und Zahlungsmodalitäten für
                kostenpflichtige Leistungen werden auf der jeweiligen
                Angebotsseite ausgewiesen.
              </p>
              <p>
                6.3 Abonnements verlängern sich automatisch, sofern sie nicht
                rechtzeitig vor Ende der Laufzeit gekündigt werden. Die
                Kündigungsfrist beträgt 14 Tage zum Ende der jeweiligen
                Abrechnungsperiode.
              </p>
            </section>

            <section>
              <h2>7. Haftungsausschluss</h2>
              <p>
                7.1 Der Betreiber übernimmt keine Haftung für die
                Richtigkeit, Vollständigkeit oder Aktualität der von Nutzern
                eingestellten Inhalte.
              </p>
              <p>
                7.2 MotoDigital haftet nicht für Schäden, die aus
                Transaktionen zwischen Nutzern entstehen. Die Plattform
                vermittelt lediglich Kontakte und übernimmt keine
                Gewährleistung für die angebotenen Fahrzeuge oder
                Dienstleistungen.
              </p>
              <p>
                7.3 Die Haftung des Betreibers ist auf Vorsatz und grobe
                Fahrlässigkeit beschränkt, soweit gesetzlich zulässig.
              </p>
            </section>

            <section>
              <h2>8. Datenschutz</h2>
              <p>
                Die Erhebung und Verarbeitung personenbezogener Daten erfolgt
                gemäß unserer{' '}
                <Link href="/datenschutz">Datenschutzerklärung</Link>. Mit
                der Nutzung der Plattform erklärt der Nutzer sein
                Einverständnis mit der Datenverarbeitung im dort
                beschriebenen Umfang.
              </p>
            </section>

            <section>
              <h2>9. Änderungen der AGB</h2>
              <p>
                Der Betreiber behält sich das Recht vor, diese AGB jederzeit
                mit Wirkung für die Zukunft zu ändern. Nutzer werden über
                wesentliche Änderungen per E-Mail oder durch einen Hinweis
                auf der Plattform informiert. Die fortgesetzte Nutzung nach
                Inkrafttreten der Änderungen gilt als Zustimmung.
              </p>
            </section>

            <section>
              <h2>10. Kündigung &amp; Sperrung</h2>
              <p>
                10.1 Nutzer können ihr Konto jederzeit ohne Angabe von
                Gründen löschen.
              </p>
              <p>
                10.2 Der Betreiber kann Nutzerkonten bei Verstoß gegen diese
                AGB ohne Vorankündigung sperren oder löschen.
              </p>
            </section>

            <section>
              <h2>11. Anwendbares Recht &amp; Gerichtsstand</h2>
              <p>
                Es gilt das Recht der Bundesrepublik Deutschland.
                Gerichtsstand für alle Streitigkeiten aus oder im
                Zusammenhang mit diesen AGB ist, soweit gesetzlich zulässig,
                der Sitz des Betreibers.
              </p>
            </section>

            <section>
              <h2>12. Salvatorische Klausel</h2>
              <p>
                Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder
                werden, bleibt die Wirksamkeit der übrigen Bestimmungen
                unberührt.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
