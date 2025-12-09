import 'package:flutter/material.dart';

class ImpressumPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Impressum'),
        backgroundColor: Colors.green, // background color of the AppBar
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0), // padding around the body content
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start, // Align text to the left
          children: [
            Text(
              'Impressum',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16), // space between the title and content
            Text(
              'Verantwortlicher im Sinne des Art. 13 Abs. 1 lit. a DS-GVO ist die:',
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 16),
            Text(
              'Hochschule Fulda\n'
              'University of Applied Sciences\n'
              'Leipziger Straße 123\n' // Fixed encoding
              '36037 Fulda\n'
              'Telefon: +49 661 9640-0\n'
              'Fax: +49 661 9640-1229',
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 16),
            Text(
              'Die Hochschule Fulda ist eine Körperschaft des öffentlichen Rechts. ' // Fixed encoding
              'Sie wird durch den*die Präsident*in gesetzlich vertreten.\n', // Fixed encoding
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 16),
            Text(
              'E-Mail: praesident@hs-fulda.de',
              style: TextStyle(fontSize: 16),
            ),
          ],
        ),
      ),
      backgroundColor: Colors.white, // background color of the page
    );
  }
}