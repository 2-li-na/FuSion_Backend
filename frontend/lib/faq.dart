import 'package:flutter/material.dart';

class FAQPage extends StatelessWidget {
  final List<FAQItem> faqItems = [
    FAQItem(
      question: 'Was ist FuSion?',
      answer: [
          'FuSion ist die erste hochschuleigene App, die dich zu täglicher Bewegung animiert. '
          'Du kannst nicht nur deine täglich gelaufenen Schritte hinzufügen und diese in tolle Prämien umwandeln sondern auch in zahlreichen Challenges gegen deine Kommiliton*innen und Kolleg*innen antreten und so noch mehr Punkte erhalten.',
      ],
    ),
    FAQItem(
      question: 'Wie genau funktioniert das Hinzufügen der Schritte?',
      answer: [
      'Damit deine gelaufenen Schritte in der App auftauchen, musst du auf der Hauptseite auf das + rechts oben im Bildschrim klicken.' 
      '\nHier werden dir dann deine heutigen Schritte angezeigt und du kannst sie über "hinzufügen" deinem Konto gutschreiben lassen,'
      '\nWenn du nach dem Hinzufügen noch weiterlaufen bist, kannst du das am gleichen Tag ganz einfach nochmal machen. Leider kannst du immer nur die Schritte des heutigen Tages hinzufügen, also denk dran, sie immer einzutragen!',
      ],
    ),
    FAQItem(
      question: 'Woher kommt FuSion?',
      answer: [
      'FuSion wurde als Teil des Hochschulprojektes „Bewegt studieren-Studieren bewegt 2.0“ des Allgemeinen Deutschen Hochschulsportverbandes und der Techniker Krankenkassen entwickelt, um die Studierenden der Hochschule Fulda zu mehr Bewegung im Alltag zu animieren. \nDer Hochschulsport der Hochschule Fulda hat sich für die Entwicklung tatkräftige Unterstützung aus einem Projekt des Studiengangs Gesundheitstechnik und einer Master-Arbeit geholt und wird nur von einem Team aus Studierenden unter der Regie des Hochschulsportes weiterentwickelt und betrieben. ',
      ],
    ),
    FAQItem(
      question: 'Was war denn nochmal diese Fachbereichs-Challenge?',
      answer: [
      'Dies ist zukünftig in Planung. Die Fachbereichs-Challenge ist ein Wettbewerb, bei dem die Fachbereiche gegeneinander antreten. Beim ersten Log-in wirst du nach deinem Fachbereich, an dem du arbeitest oder studierst, gefragt. Das Team für die Mitarbeiter*innen der Verwaltung heißt Administration“ Bei diesem Wettbewerb werden alle Schritte des jeweiligen Fachbereichs berücksichtigt und ein Schrittdurchschnitt berechnet. \nAuf Basis dieses Durchschnitts gibt es ein Ranking der Fachbereiche. Dieses Ranking kannst du dir in der App unter dem Menüpunkt Ranking ansehen. Die Teams/die Fachbereiche, die ganz oben im Ranking stehen, bekommen noch einmal extra Prämien-Punkte.',
      ],
    ),
    FAQItem(
      question: 'Ich habe gelesen, dass ich für meine Leistung Prämien erhalten kann?',
      answer: [
      'Ja, da hast du richtig gelesen! Für jede Woche wird dein persönlicher Tagesdurchschnitt berechnet. Am Sonntagabend werden dir dann für deinen persönlichen Durchschnitt eine bestimmte Anzahl an Punkten gutgeschrieben. \nWie viele Punkte du für wie viele Schritte (Wochendurchschnitt) bekommst, kannst du in der untenstehenden Tabelle sehen. Nach einer Woche wird dein Durchschnitt wieder auf null gesetzt und du beginnst jede Woche am Montag an einem neuen Durchschnitt zu arbeiten. Deine erarbeiteten Punkte kannst du dann ganz einfach beim Hochschulsport gegen tolle Prämien einlösen. Eine Liste der Prämien kannst du auch unten finden.'
      '\n\n2000 Schritte/Tag = 1 Punkt\n'
      '3500 Schritte/Tag = 2 Punkte\n'
      '5000 Schritte/Tag = 3 Punkte\n'
      '6500 Schritte/Tag = 4 Punkte\n'
      '8000 Schritte/Tag = 5 Punkte\n'
      '10.000 Schritte/Tag = 6 Punkte\n'
      '11.5000 Schritte/Tag = 7 Punkte',
      ],
    ),
    FAQItem(
      question: 'Wie erhalte ich die Prämie?',
      answer: [
      'Willst du eine Prämie gegen deine Punkte einlösen, dann schreib uns eine Mail. \nBitte schreib in die Mail deinen Namen, deine E-mail Adresse deines Fusion-Kontos, deinen Benutzernamen und die Prämie, die du gerne möchtest. \nAlle weiteren Infos, wie zum Beispiel wo du dir deine Prämie abholen kannst, lassen wir die dann zukommen.'
      '\n\nsamuel.rill@hs-fulda.de\n',
      ],
    ),
    FAQItem(
      question: 'Ich habe Technische Fragen, an wen kann ich mich denn wenden?',
      answer: [
      'Für technische Fragen haben wir eine extra E-Mail-Adresse eingerichtet – bitte habe etwas Geduld, wenn wir nicht sofort antworten, wir werden deine E-Mail auf jeden Fall beantworten.'
        '\n\nfusion.hsfulda@gmail.com\n',
      ],
    ),
    FAQItem(
      question: 'Kann ich Extra-Punkte erhalten?',
      answer: [
      'Ja, dass kannst du. Wir schenken die fünf Punkte, wenn du uns bei der Entwicklung ein wenig weiterhilfst. \nGehe dafür in der App auf den Menüpunkt "Feedback" und nehme an der hinterlegten Befragung teil. \nBitte halte deine E-mail Adresse bereit, mit der du dich bei der App angemeldet hast, damit wird deinen Fragebogen deinem Account zuordnen und dir deinen wohlverdienten Punkt gutschreiben können.',
      ],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('FAQ'),
        backgroundColor: Colors.green,
      ),
      body: ListView.builder(
        itemCount: faqItems.length,
        itemBuilder: (context, index) {
          return FAQTile(faqItem: faqItems[index]);
        },
      ),
      backgroundColor: Colors.green[50], // Light green background
    );
  }
}

class FAQItem {
  final String question;
  final List<String> answer;  // Changed to List of paragraphs
  bool isExpanded;

  FAQItem({
    required this.question,
    required this.answer,
    this.isExpanded = false,
  });
}

class FAQTile extends StatefulWidget {
  final FAQItem faqItem;

  FAQTile({required this.faqItem});

  @override
  _FAQTileState createState() => _FAQTileState();
}

class _FAQTileState extends State<FAQTile> {
  @override
  Widget build(BuildContext context) {
    return ExpansionTile(
      title: Text(
        widget.faqItem.question,
        style: TextStyle(fontWeight: FontWeight.bold),
        ),
      onExpansionChanged: (isExpanded) {
        setState(() {
          widget.faqItem.isExpanded = isExpanded;
        });
      },
      initiallyExpanded: widget.faqItem.isExpanded,
      children: widget.faqItem.answer.map((paragraph) {
        return Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Text(
            paragraph,
            style: TextStyle(
              fontStyle: FontStyle.italic,
              fontSize: 16,
              fontWeight: FontWeight.normal,
              color: const Color.fromARGB(221, 24, 69, 36),
              height: 1.5,  // Line height for better readability
            ),
          ),
        );
      }).toList(),
    );
  }
}
