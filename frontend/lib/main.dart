import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'login.dart';
import 'step_tracker.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Replace with your laptop's local IP (for real phone testing on same Wi-Fi)
  const backendBaseUrl = "http://192.168.0.42:3000/api";

  runApp(MyApp(backendBaseUrl: backendBaseUrl));
}

class MyApp extends StatelessWidget {
  final String backendBaseUrl;

  const MyApp({super.key, required this.backendBaseUrl});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => StepTracker(),
        ),
      ],
      child: MaterialApp(
        title: 'Hochschulsport Fulda',
        theme: ThemeData(
          primarySwatch: Colors.green,
        ),
        home: LoginPage(
          backendBaseUrl: backendBaseUrl,
        ),
      ),
    );
  }
}



 
/* 
void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Hochschulsport Fulda',
      theme: ThemeData(
        primarySwatch: Colors.green,
      ),
      home: DashboardPage(), // Set LoginPage as the home widget
    );
  }
} */
