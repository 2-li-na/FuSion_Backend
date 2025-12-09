import 'package:flutter/material.dart';

class ForgotPasswordPage extends StatelessWidget {
  final TextEditingController emailController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Passwort vergessen"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Geben Sie Ihre registrierte E-Mail-Adresse ein, um ein neues Passwort zu erhalten.",
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 20),
            TextField(
              controller: emailController,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Email-Adresse',
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                String email = emailController.text.trim();
                if (email.isNotEmpty) {
                  // Call your backend service to send the password reset email
                  // Example: YourBackendService.sendPasswordResetEmail(email);

                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text("Wenn diese E-Mail existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet."), // Fixed encoding
                  ));
                }
              },
              child: Text('Passwort zurücksetzen'), // Fixed encoding
            ),
          ],
        ),
      ),
    );
  }
}