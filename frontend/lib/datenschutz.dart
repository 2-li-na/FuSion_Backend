import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class DatenschutzPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Datenschutz'),
        backgroundColor: Colors.green,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'DATENSCHUTZINFORMATION ZUR NUTZUNG DER FUSION-APP -\nSTAND 07.10.2021',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            Text(
              'Weil uns die Privatsphäre unserer Nutzer*innen wichtig ist und wir das Recht unserer Nutzer*innen auf Privatsphäre respektieren, stimmen Sie bei Nutzung unserer App der Verarbeitung Ihrer persönlichen Informationen zu, die in dieser Datenschutzerklärung aufgeführt werden.',
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 8),
            Text(
              'Wenn Sie mit den aufgeführten Datenverarbeitungsvorgängen nicht einverstanden sind, können Sie die FuSion-App nicht nutzen. Mit den folgenden Informationen geben wir Ihnen einen Überblick über die Verarbeitung Ihrer personenbezogenen Daten (E-Mail-Adresse, s. auch unten Ziff. 3.), durch die Hochschule Fulda.',
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 16),
            Text(
              '1. WER IST FÜR DIE DATENVERARBEITUNG VERANTWORTLICH UND AN WEN KANN ICH MICH WENDEN?',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            Text(
              'Betrieben wird die FuSion-App durch den Hochschulsport der Hochschule Fulda. Verantwortlicher im Sinne des Art. 13 Abs. 1 lit. a DS-GVO ist die',
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 16),
            Text(
              'Hochschule Fulda\n'
              'University of Applied Sciences\n'
              'Leipziger Straße 123\n'
              '36037 Fulda\n'
              'Telefon: +49 661 9640-0\n'
              'Fax: +49 661 9640-1229\n'
              'Die Hochschule Fulda ist eine Körperschaft des öffentlichen Rechts. Sie wird durch den*die Präsident*in gesetzlich vertreten.\n'
              'E-Mail: praesident@hs-fulda.de',
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 16),
            Text(
              '2. WIE KANN ICH DIE DATENSCHUTZBEAUFTRAGTE* DER HOCHSCHULE ERREICHEN?',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            Text(
              'Unsere Datenschutzbeauftragte* erreichen Sie unter:\n'
              'Datenschutzbeauftragte der Hochschule Fulda\n'
              'Leipziger Straße 123\n'
              '36037 Fulda\n'
              'Telefon: +49 661 9640-1051\n'
              'E-Mail: datenschutz@hs-fulda.de',
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 16),
            Text(
              '3. ZU WELCHEM ZWECK WERDEN MEINE DATEN VERARBEITET?',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            RichText(
              text: TextSpan(
                style: TextStyle(fontSize: 16, color: Colors.black),
                children: [
                  TextSpan(
                    text: 'FuSion verwendet die personenbezogenen Daten ausschließlich für folgende Zwecke:\n\n',
                  ),
                  _buildIndentedText('1. Um Ihnen Ihre Aktivität anzuzeigen\n'),
                  _buildIndentedText('2. Um Ihnen Statistiken zur Aktivität aller Nutzer*innen bereitzustellen\n'),
                  _buildIndentedText('3. Um einen Wettbewerb zwischen den App-Anwender*innen zu ermöglichen\n\n'),
                  TextSpan(
                    text: 'Dabei werden folgende Daten von den App-Anwender*innen erhoben:\n\n',
                  ),
                  _buildIndentedText('1. Zur Identifizierung der nutzenden Personen muss eine E-Mail-Adresse bereitgestellt werden. Die E-Mail-Adresse kann den persönlichen Namen des Nutzers enthalten.\n'),
                  _buildIndentedText('2. Zur Registrierung muss das nutzende Personen sein*ihr Alter angeben. Dies dient der Erstellung von Aktivitätsstatistiken.\n'),
                  _buildIndentedText('3. Die App kann auf die Schrittzählerdaten der Nutzer*innen zugreifen und diese Daten auf dem Server abspeichern. Die Schrittdaten der Nutzer*innen umfassen:\n'),
                  _buildIndentedText('   - Seit Beginn des Tages gelaufene Schritte\n', level: 2),
                  _buildIndentedText('   - Zeitpunkt der erfassten Schritte\n', level: 2),
                  _buildIndentedText('4. Die gelaufenen Schritte der nutzenden Person werden ebenfalls dem Fachbereich in einem Wettbewerb zwischen den Fachbereichen angerechnet. Deshalb muss die nutzende Person sein*ihr Fachbereich an der Hochschule Fulda angeben. Mitarbeiter*innen der Verwaltung bilden die Gruppe „Verwaltung".\n'),
                  _buildIndentedText('5. Bei der Sammlung der personenbezogenen Daten wird darauf geachtet, dass nur das Minimum an benötigten Daten erhoben und gespeichert wird. Außerhalb der oben aufgeführten Daten werden von der nutzenden Person keine weiteren Daten gesammelt.\n'),
                  _buildIndentedText('6. Zum Erfassen der Schrittdaten benutzt die Hochschule für Androidsysteme die „Google Fitness API" und für IOS-Systeme das „HealthKit-Framework".\n'),
                  _buildIndentedText('   - Die Hochschule Fulda verwendet das Fit SDK von Google ', level: 2),
                  _buildLinkText('https://developers.google.com/fit/policy\n', 'https://developers.google.com/fit/policy'),
                  _buildIndentedText('   - Die Hochschule Fulda verwendet das HealthKit-Framework ', level: 2),
                  _buildLinkText('https://developer.apple.com/documentation/healthkit/', 'https://developer.apple.com/documentation/healthkit/'),
                  _buildIndentedText('7. Die Hochschule veranlasst alle zumutbaren und angemessenen Maßnahmen, um einen unbefugten Zugriff durch Dritte auf die gesammelten Daten oder die Anwendung zu vermeiden.\n'),
                ],
              ),
            ),
            SizedBox(height: 16),
            Text(
              '4. AUF WELCHER RECHTGRUNDLAGE WERDEN MEINE DATEN VERARBEITET?',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            Text(
              'Die Rechtmäßigkeit der Verarbeitung Ihrer personenbezogenen Daten durch die Hochschule beruht auf Art. 6 Abs. 1 lit. a) i.V.m. Art. 7 DS-GVO.',
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 16),
            Text(
              '5. MUSS ICH MEINE DATEN BEREITSTELLEN?',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            Text(
              'Nein, Ihre Angaben sind freiwillig; aber ohne die Angabe Ihrer Daten können Sie die App nicht nutzen.',
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 16),
            Text(
              '6. WER BEKOMMT MEINE DATEN?',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            Text(
              'Ihre Daten werden ausschließlich durch die betr. Beschäftigten der Hochschule in der Abteilung eingesehen und verarbeitet. Eine Übermittlung an Dritte erfolgt nicht.',
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 16),
            Text(
              '7. WIE LANGE WERDEN MEINE DATEN GESPEICHERT?',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            RichText(
              text: TextSpan(
                style: TextStyle(fontSize: 16, color: Colors.black),
                children: [
                  TextSpan(
                    text: 'Die Hochschule löscht Ihre personenbezogenen Daten (E-Mailaddresse und Schrittdaten), wie folgt:\n\n',
                  ),
                  _buildIndentedText('   - Die E-Mailadresse wird unverzüglich beim Auflösen des Accounts gelöscht.\n', level: 2),
                  _buildIndentedText('   - Die Schrittdaten nach 30 Tagen und die aus den Schritten berechneten Punktedaten nach 365 Tagen.\n', level: 2),
                ],
              ),
            ),
            SizedBox(height: 16),
            Text(
              '8. WAS PASSIERT, WENN SICH DIESE DATENSCHUTZERKLÄRUNG ÄNDERT?',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            Text(
              'Im Falle einer Änderung der Datenschutzerklärung werden die Nutzer*innen sofort informiert. Mit der weiteren Nutzung der App nach einer Datenschutz-Änderung stimmt die nutzende Person automatisch den Änderungen zu.',
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 16),
            Text(
              '9. WELCHE RECHTE HABEN SIE?',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            RichText(
              text: TextSpan(
                style: TextStyle(fontSize: 16, color: Colors.black),
                children: [
                  TextSpan(
                    text: 'Das Datenschutzrecht räumt Ihnen folgende Rechte ein: Recht auf Auskunft (Art. 15 DS-GVO), das Recht auf Berichtigung (Art. 16 DS-GVO), das Recht auf Löschung (Art. 17 DS-GVO), das Recht auf Einschränkung der Verarbeitung (Art. 18 DS-GVO), das Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DS-GVO) sowie ein Recht auf Datenübertragbarkeit (Art. 20 DS-GVO). \n\n',
                  ),
                  TextSpan(
                    text: 'Ihnen steht ferner ein Beschwerderecht bei der Aufsichtsbehörde für den Datenschutz zu:\n\n',
                  ),
                  TextSpan(
                    text: 'Hessischer Beauftragter für Datenschutz und Informationsfreiheit\n',
                  ),
                  TextSpan(
                    text: 'Gustav-Stresemann-Ring 1\n',
                  ),
                  TextSpan(
                    text: '65189 Wiesbaden\n',
                  ),
                  TextSpan(
                    text: 'poststelle@datenschutz.hessen.de\n\n',
                  ),
                  _buildIndentedText('Weitere Infos erhalten Sie unter'),
                  _buildLinkText(' www.hs-fulda.de/datenschutz\n', 'https://www.hs-fulda.de/datenschutz'),
                ],
              ),
            ),
          ],
        ),
      ),
      backgroundColor: Colors.white,
    );
  }

  TextSpan _buildIndentedText(String text, {int level = 1}) {
    return TextSpan(
      text: text,
      style: TextStyle(
        height: 1.5,
        fontSize: 16,
      ),
    );
  }

  TextSpan _buildLinkText(String text, String url) {
    return TextSpan(
      text: text,
      style: TextStyle(
        color: Colors.blue,
        decoration: TextDecoration.underline,
      ),
      recognizer: TapGestureRecognizer()
        ..onTap = () async {
          final Uri uri = Uri.parse(url);
          if (await canLaunchUrl(uri)) {
            await launchUrl(uri);
          } else {
            throw 'Could not launch $url';
          }
        },
    );
  }
}