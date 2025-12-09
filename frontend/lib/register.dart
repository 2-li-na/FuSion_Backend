import 'dart:convert'; 
import 'package:flutter/material.dart'; 
import 'package:http/http.dart' as http; 
import 'appBar.dart'; 

class RegisterPage extends StatefulWidget {
  final String backendBaseUrl; // Fixed: Accept backendBaseUrl

  const RegisterPage({Key? key, required this.backendBaseUrl}) : super(key: key);

  @override
  RegisterPageState createState() => RegisterPageState();
}

class RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();

  String _selectedDepartment = 'Select Your Department';
  String _selectedGender = 'Männlich'; // Fixed encoding

  Future<void> registerUser(BuildContext context) async {
    final String username = _usernameController.text;
    final String password = _passwordController.text;
    final String email = _emailController.text;
    final String department = _selectedDepartment;
    final String gender = _selectedGender;

    try {
      final response = await http.post(
        Uri.parse('${widget.backendBaseUrl}/users/register'), // Fixed: Use passed backendBaseUrl
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode(<String, String>{
          'username': username,
          'password': password,
          'email': email,
          'department': department,
          'gender': gender,
        }),
      );

      if (!mounted) return; 

      if (response.statusCode == 201) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Registration successful!')),
        );
      } else if (response.statusCode == 400) {
        final data = jsonDecode(response.body);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Registration failed: ${data['message']}')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Registration failed: Please try again later.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      appBar: CustomAppBar(),
      body: Stack(
        children: [
          Align(
            alignment: Alignment.topLeft,
            child: Padding(
              padding: EdgeInsets.all(screenWidth * 0.04), 
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  foregroundColor: Colors.green,
                  backgroundColor: Colors.white,
                  side: BorderSide(color: Colors.green, width: 2.0),
                  minimumSize: Size(screenWidth * 0.25, screenHeight * 0.06),
                ),
                onPressed: () {
                  Navigator.pop(context);
                },
                child: Text('Zurück', style: TextStyle(fontSize: screenWidth * 0.045)), // Fixed encoding
              ),
            ),
          ),
          Center(
            child: Container(
              margin: EdgeInsets.all(screenWidth * 0.04),
              padding: EdgeInsets.symmetric(
                horizontal: screenWidth * 0.05,
                vertical: screenHeight * 0.02,
              ),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: Colors.green, width: 2.0),
                borderRadius: BorderRadius.circular(12.0),
              ),
              child: SingleChildScrollView(
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        'Jetzt Registrieren!!!',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: screenWidth * 0.07,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: screenHeight * 0.02),
                      TextFormField(
                        controller: _usernameController,
                        decoration: InputDecoration(
                          border: OutlineInputBorder(),
                          labelText: 'Benutzername',
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Bitte Benutzername eingeben';
                          }
                          return null;
                        },
                      ),
                      SizedBox(height: screenHeight * 0.02),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: true,
                        decoration: InputDecoration(
                          border: OutlineInputBorder(),
                          labelText: 'Passwort',
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Bitte Passwort eingeben';
                          }
                          return null;
                        },
                      ),
                      SizedBox(height: screenHeight * 0.02),
                      TextFormField(
                        controller: _confirmPasswordController,
                        obscureText: true,
                        decoration: InputDecoration(
                          border: OutlineInputBorder(),
                          labelText: 'Passwort bestätigen', // Fixed encoding
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Bitte Passwort bestätigen'; // Fixed encoding
                          }
                          if (value != _passwordController.text) {
                            return 'Passwörter stimmen nicht überein'; // Fixed encoding
                          }
                          return null;
                        },
                      ),
                      SizedBox(height: screenHeight * 0.02),
                      TextFormField(
                        controller: _emailController,
                        decoration: InputDecoration(
                          border: OutlineInputBorder(),
                          labelText: 'Email-Adresse',
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Bitte Email-Adresse eingeben';
                          }
                          if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(value)) {
                            return 'Bitte gültige Email-Adresse eingeben'; // Fixed encoding
                          }
                          return null;
                        },
                      ),
                      SizedBox(height: screenHeight * 0.02),
                      DropdownButtonFormField<String>(
                        initialValue: _selectedDepartment,
                        decoration: InputDecoration(
                          border: OutlineInputBorder(),
                          labelText: 'Fachbereich',
                        ),
                        isExpanded: true, 
                        items: [
                          'Select Your Department',
                          'Angewandte Informatik',
                          'Elektrotechnik und Informationstechnik',
                          'Gesundheitswissenschaften',
                          'Lebensmitteltechnologie',
                          'Oecotrophologie',
                          'Sozial- und Kulturwissenschaften',
                          'Sozialwesen',
                          'Wirtschaft',
                          'Verwaltung'
                        ].map((String value) {
                          return DropdownMenuItem<String>(
                            value: value,
                            child: Text(value),
                          );
                        }).toList(),
                        onChanged: (newValue) {
                          setState(() {
                            _selectedDepartment = newValue!;
                          });
                        },
                        validator: (value) {
                          if (value == 'Select Your Department') {
                            return 'Bitte Fachbereich auswählen'; // Fixed encoding
                          }
                          return null;
                        },
                      ),
                      SizedBox(height: screenHeight * 0.02),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          'Geschlecht:',
                          style: TextStyle(fontSize: screenWidth * 0.045),
                        ),
                      ),
                      Column(
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: RadioListTile<String>(
                                  title: Text('Männlich', style: TextStyle(fontSize: screenWidth * 0.04)), // Fixed encoding
                                  value: 'Männlich', // Fixed encoding
                                  groupValue: _selectedGender,
                                  onChanged: (value) {
                                    setState(() {
                                      _selectedGender = value!;
                                    });
                                  },
                                ),
                              ),
                              Expanded(
                                child: RadioListTile<String>(
                                  title: Text('Weiblich', style: TextStyle(fontSize: screenWidth * 0.04)),
                                  value: 'Weiblich',
                                  groupValue: _selectedGender,
                                  onChanged: (value) {
                                    setState(() {
                                      _selectedGender = value!;
                                    });
                                  },
                                ),
                              ),
                            ],
                          ),
                          RadioListTile<String>(
                            title: Text('Divers', style: TextStyle(fontSize: screenWidth * 0.04)),
                            value: 'Divers',
                            groupValue: _selectedGender,
                            onChanged: (value) {
                              setState(() {
                                _selectedGender = value!;
                              });
                            },
                          ),
                        ],
                      ),
                      SizedBox(height: screenHeight * 0.03),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          foregroundColor: Colors.green,
                          backgroundColor: Colors.white,
                          side: BorderSide(color: Colors.green, width: 2.0),
                          minimumSize: Size(screenWidth * 0.4, screenHeight * 0.06),
                        ),
                        onPressed: () {
                          if (_formKey.currentState!.validate()) {
                            registerUser(context);
                          }
                        },
                        child: Text(
                          'Registrieren',
                          style: TextStyle(color: Colors.green, fontSize: screenWidth * 0.05),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      backgroundColor: Colors.green[100],
    );
  }
}