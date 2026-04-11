import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Datenschutzerklärung — MotoDigital',
  description: 'Datenschutzerklärung von MotoDigital — Informationen zur Verarbeitung personenbezogener Daten.',
  robots: 'noindex, nofollow',
}

export default function DatenschutzPage() {
  return (
    <>
      <Header />

      <main className="bg-[#222222] min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-5 lg:px-8 py-24">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-10">
            Datenschutz&shy;erklärung
          </h1>

          <div className="prose prose-invert prose-xs max-w-none space-y-6 text-xs text-white/60 [&_h2]:text-white [&_h2]:text-sm [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-0 [&_h3]:text-white/80 [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:mb-1 [&_h3]:mt-0 [&_p]:leading-relaxed [&_a]:text-[#2AABAB] [&_a]:no-underline hover:[&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:leading-relaxed">

            <section>
              <h2>1. Datenschutz auf einen Blick</h2>

              <h3>Allgemeine Hinweise</h3>
              <p>
                Die folgenden Hinweise geben einen einfachen Überblick
                darüber, was mit Ihren personenbezogenen Daten passiert, wenn
                Sie diese Website besuchen. Personenbezogene Daten sind alle
                Daten, mit denen Sie persönlich identifiziert werden können.
                Ausführliche Informationen zum Thema Datenschutz entnehmen
                Sie unserer unter diesem Text aufgeführten
                Datenschutzerklärung.
              </p>

              <h3>Datenerfassung auf dieser Website</h3>
              <p>
                <strong className="text-white/80">
                  Wer ist verantwortlich für die Datenerfassung auf dieser
                  Website?
                </strong>
                <br />
                Die Datenverarbeitung auf dieser Website erfolgt durch den
                Websitebetreiber. Dessen Kontaktdaten können Sie dem
                Abschnitt &bdquo;Hinweis zur verantwortlichen Stelle&ldquo; in dieser
                Datenschutzerklärung entnehmen.
              </p>
              <p>
                <strong className="text-white/80">
                  Wie erfassen wir Ihre Daten?
                </strong>
                <br />
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns
                diese mitteilen. Hierbei kann es sich z.&nbsp;B. um Daten
                handeln, die Sie bei der Registrierung oder beim Anlegen
                eines Profils eingeben.
              </p>
              <p>
                Andere Daten werden automatisch oder nach Ihrer Einwilligung
                beim Besuch der Website durch unsere IT-Systeme erfasst. Das
                sind vor allem technische Daten (z.&nbsp;B. Internetbrowser,
                Betriebssystem oder Uhrzeit des Seitenaufrufs). Die
                Erfassung dieser Daten erfolgt automatisch, sobald Sie diese
                Website betreten.
              </p>
            </section>

            <section>
              <h2>2. Hosting</h2>
              <p>
                Wir hosten die Inhalte unserer Website bei folgendem
                Anbieter:
              </p>

              <h3>Vercel</h3>
              <p>
                Anbieter ist die Vercel Inc., 340 S Lemon Ave #4133, Walnut,
                CA 91789, USA. Details entnehmen Sie der
                Datenschutzerklärung von Vercel:{' '}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
                  https://vercel.com/legal/privacy-policy
                </a>
              </p>
              <p>
                Die Verwendung von Vercel erfolgt auf Grundlage von Art. 6
                Abs. 1 lit. f DSGVO. Wir haben ein berechtigtes Interesse an
                einer möglichst zuverlässigen Darstellung unserer Website.
              </p>
            </section>

            <section>
              <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>

              <h3>Datenschutz</h3>
              <p>
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer
                persönlichen Daten sehr ernst. Wir behandeln Ihre
                personenbezogenen Daten vertraulich und entsprechend den
                gesetzlichen Datenschutzvorschriften sowie dieser
                Datenschutzerklärung.
              </p>

              <h3>Hinweis zur verantwortlichen Stelle</h3>
              <p>
                Die verantwortliche Stelle für die Datenverarbeitung auf
                dieser Website ist:
              </p>
              <p>
                Joe Mel Ramos / MotoDigital<br />
                Hudeweg 1<br />
                33607 Bielefeld<br />
                Deutschland
              </p>
              <p>
                E-Mail: info@motodigital.de
              </p>
              <p>
                Verantwortliche Stelle ist die natürliche oder juristische
                Person, die allein oder gemeinsam mit anderen über die Zwecke
                und Mittel der Verarbeitung von personenbezogenen Daten
                entscheidet.
              </p>

              <h3>Speicherdauer</h3>
              <p>
                Soweit innerhalb dieser Datenschutzerklärung keine speziellere
                Speicherdauer genannt wurde, verbleiben Ihre
                personenbezogenen Daten bei uns, bis der Zweck für die
                Datenverarbeitung entfällt. Wenn Sie ein berechtigtes
                Löschersuchen geltend machen oder eine Einwilligung zur
                Datenverarbeitung widerrufen, werden Ihre Daten gelöscht,
                sofern wir keine anderen rechtlich zulässigen Gründe für die
                Speicherung Ihrer personenbezogenen Daten haben.
              </p>

              <h3>Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
              <p>
                Viele Datenverarbeitungsvorgänge sind nur mit Ihrer
                ausdrücklichen Einwilligung möglich. Sie können eine bereits
                erteilte Einwilligung jederzeit widerrufen. Die
                Rechtmäßigkeit der bis zum Widerruf erfolgten
                Datenverarbeitung bleibt vom Widerruf unberührt.
              </p>

              <h3>Recht auf Datenübertragbarkeit</h3>
              <p>
                Sie haben das Recht, Daten, die wir auf Grundlage Ihrer
                Einwilligung oder in Erfüllung eines Vertrags automatisiert
                verarbeiten, an sich oder an einen Dritten in einem
                gängigen, maschinenlesbaren Format aushändigen zu lassen.
              </p>

              <h3>Auskunft, Löschung und Berichtigung</h3>
              <p>
                Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen
                jederzeit das Recht auf unentgeltliche Auskunft über Ihre
                gespeicherten personenbezogenen Daten, deren Herkunft und
                Empfänger und den Zweck der Datenverarbeitung und ggf. ein
                Recht auf Berichtigung oder Löschung dieser Daten. Hierzu
                sowie zu weiteren Fragen zum Thema personenbezogene Daten
                können Sie sich jederzeit an uns wenden.
              </p>

              <h3>Recht auf Einschränkung der Verarbeitung</h3>
              <p>
                Sie haben das Recht, die Einschränkung der Verarbeitung
                Ihrer personenbezogenen Daten zu verlangen. Das Recht auf
                Einschränkung der Verarbeitung besteht in folgenden Fällen:
              </p>
              <ul>
                <li>
                  Wenn Sie die Richtigkeit Ihrer bei uns gespeicherten
                  personenbezogenen Daten bestreiten.
                </li>
                <li>
                  Wenn die Verarbeitung Ihrer personenbezogenen Daten
                  unrechtmäßig geschah/geschieht.
                </li>
                <li>
                  Wenn Sie die Löschung Ihrer personenbezogenen Daten
                  verlangen, wir diese aber noch benötigen.
                </li>
                <li>
                  Wenn Sie Widerspruch gegen die Verarbeitung eingelegt
                  haben.
                </li>
              </ul>
            </section>

            <section>
              <h2>4. Datenerfassung auf dieser Website</h2>

              <h3>Cookies</h3>
              <p>
                Unsere Internetseiten verwenden so genannte &bdquo;Cookies&ldquo;.
                Cookies sind kleine Datenpakete und richten auf Ihrem
                Endgerät keinen Schaden an. Sie werden entweder
                vorübergehend für die Dauer einer Sitzung
                (Session-Cookies) oder dauerhaft (permanente Cookies) auf
                Ihrem Endgerät gespeichert. Session-Cookies werden nach Ende
                Ihres Besuchs automatisch gelöscht. Permanente Cookies
                bleiben auf Ihrem Endgerät gespeichert, bis Sie diese
                selbst löschen oder eine automatische Löschung durch Ihren
                Webbrowser erfolgt.
              </p>
              <p>
                Cookies, die zur Durchführung des elektronischen
                Kommunikationsvorgangs, zur Bereitstellung bestimmter, von
                Ihnen erwünschter Funktionen (z.&nbsp;B. Login) oder zur
                Optimierung der Website erforderlich sind, werden auf
                Grundlage von Art. 6 Abs. 1 lit. f DSGVO gespeichert. Der
                Websitebetreiber hat ein berechtigtes Interesse an der
                Speicherung von Cookies zur technisch fehlerfreien und
                optimierten Bereitstellung seiner Dienste.
              </p>

              <h3>Server-Log-Dateien</h3>
              <p>
                Der Provider der Seiten erhebt und speichert automatisch
                Informationen in so genannten Server-Log-Dateien, die Ihr
                Browser automatisch an uns übermittelt. Dies sind:
              </p>
              <ul>
                <li>Browsertyp und Browserversion</li>
                <li>Verwendetes Betriebssystem</li>
                <li>Referrer URL</li>
                <li>Hostname des zugreifenden Rechners</li>
                <li>Uhrzeit der Serveranfrage</li>
                <li>IP-Adresse</li>
              </ul>
              <p>
                Eine Zusammenführung dieser Daten mit anderen Datenquellen
                wird nicht vorgenommen. Die Erfassung dieser Daten erfolgt
                auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
              </p>

              <h3>Registrierung / Anmeldung (Magic Link)</h3>
              <p>
                Sie können sich auf dieser Website per Magic Link (E-Mail)
                registrieren und anmelden. Dabei wird Ihre E-Mail-Adresse
                gespeichert, um die Authentifizierung durchzuführen. Die
                Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b
                DSGVO (Vertragserfüllung). Ihre Registrierungsdaten werden
                solange gespeichert, wie Sie auf unserer Website registriert
                sind, und werden danach gelöscht.
              </p>
            </section>

            <section>
              <h2>5. Drittanbieter und externe Dienste</h2>

              <h3>Supabase</h3>
              <p>
                Wir nutzen Supabase als Backend-Dienst für Datenbank,
                Authentifizierung und Speicher. Anbieter ist die Supabase
                Inc., 970 Toa Payoh North #07-04, Singapore 318992. Weitere
                Informationen:{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
                  https://supabase.com/privacy
                </a>
              </p>

              <h3>Mapbox</h3>
              <p>
                Für die Darstellung interaktiver Karten nutzen wir Mapbox.
                Anbieter ist die Mapbox Inc., 740 15th Street NW, Suite 500,
                Washington, DC 20005, USA. Beim Aufruf der Kartenfunktion
                werden Daten (u.&nbsp;a. Ihre IP-Adresse) an Mapbox
                übertragen. Details:{' '}
                <a href="https://www.mapbox.com/legal/privacy" target="_blank" rel="noopener noreferrer">
                  https://www.mapbox.com/legal/privacy
                </a>
              </p>

              <h3>Cloudinary</h3>
              <p>
                Für die Bildverwaltung und -optimierung nutzen wir
                Cloudinary. Anbieter ist die Cloudinary Ltd., 3400 Central
                Expressway, Suite 110, Santa Clara, CA 95051, USA. Details:{' '}
                <a href="https://cloudinary.com/privacy" target="_blank" rel="noopener noreferrer">
                  https://cloudinary.com/privacy
                </a>
              </p>

              <h3>Vercel Analytics</h3>
              <p>
                Diese Website nutzt Vercel Analytics zur Analyse des
                Nutzerverhaltens. Es werden dabei keine personenbezogenen
                Daten gespeichert und keine Cookies gesetzt. Details:{' '}
                <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer">
                  https://vercel.com/docs/analytics/privacy-policy
                </a>
              </p>
            </section>

            <section>
              <h2>6. Kontakt</h2>
              <p>
                Bei Fragen zum Datenschutz können Sie sich jederzeit an uns
                wenden:
              </p>
              <p>
                E-Mail: info@motodigital.de
              </p>
            </section>

            <section className="pt-4 border-t border-white/10">
              <p className="text-xs text-white/30">
                Stand: März 2026
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
