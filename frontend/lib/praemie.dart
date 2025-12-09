import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:provider/provider.dart';
import 'step_tracker.dart'; 

// Define a class for each reward
class PraemieItem {
  final String title;
  final String image;
  final int points;
  PraemieItem({required this.title, required this.image, required this.points});
}

class PraemiePage extends StatelessWidget {
  final String? backendBaseUrl; // Fixed: Add backendBaseUrl parameter
  final String? username; // Fixed: Add username parameter

  PraemiePage({this.backendBaseUrl, this.username});

  // List of items to display
  final List<PraemieItem> praemieItems = [
    PraemieItem(title: 'Liegestuhl', image: 'assets/images/Liegestuhl.png', points: 130),
    PraemieItem(title: 'So fresh Tasche', image: 'assets/images/Tasche.png', points: 20),
    PraemieItem(title: 'Bewegung Gutschein', image: 'assets/images/Bewegung.png', points: 25),
    PraemieItem(title: 'Frisbee', image: 'assets/images/Frisbee.png', points: 30),
    PraemieItem(title: 'Klingeling', image: 'assets/images/Klingeling.png', points: 10),
  ];

  @override
  Widget build(BuildContext context) {
    final stepTracker = Provider.of<StepTracker>(context);

    return Scaffold(
      appBar: AppBar(
        title: Text('Prämienkatalog'), // Fixed encoding
        backgroundColor: Colors.green,
      ),
      body: ListView.builder(
        itemCount: praemieItems.length,
        itemBuilder: (context, index) {
          final item = praemieItems[index];
          return GestureDetector(
            onTap: () {
              // Navigate to details page when image is tapped
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => PraemieDetailsPage(
                    item: item,
                    backendBaseUrl: backendBaseUrl,
                    username: username ?? stepTracker.username, // Fixed: Pass username
                  ),
                ),
              );
            },
            child: Card(
              margin: EdgeInsets.all(10),
              child: Column(
                children: [
                  Image.asset(item.image, height: 150), // Image of the item
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(
                      item.title,
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// Create a new page to show item details when tapped
class PraemieDetailsPage extends StatelessWidget {
  final PraemieItem item;
  final String? backendBaseUrl; // Fixed: Add backendBaseUrl parameter
  final String username; // Fixed: Add username parameter

  PraemieDetailsPage({
    required this.item,
    this.backendBaseUrl,
    required this.username,
  });

  Future<void> redeemReward(BuildContext context, String username, int userPoints) async {
    // Fixed: Use passed backendBaseUrl or fallback to localhost
    String apiUrl = backendBaseUrl ?? 'http://localhost:3000/api';
    
    final response = await http.post(
      Uri.parse('$apiUrl/redeem-reward'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode({
        'username': username,
        'itemTitle': item.title,
        'pointsRequired': item.points,
      }),
    );


    if (response.statusCode == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('You have redeemed ${item.title} for ${item.points} points')),
      );

      // Deduct points locally
      Provider.of<StepTracker>(context, listen: false).deductPoints(item.points);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to redeem the item. Please try again.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final stepTracker = Provider.of<StepTracker>(context); // Access points
    final int userPoints = stepTracker.points; // Get the user's points

    return Scaffold(
      appBar: AppBar(
        title: Text(item.title),
        backgroundColor: Colors.green,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Image.asset(item.image, height: 200),
            SizedBox(height: 20),
            Text(
              '${item.points} PUNKTE',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: userPoints >= item.points
                  ? () => redeemReward(context, username, userPoints) // Fixed: Use passed username
                  : null, // Disable button if not enough points
              style: ElevatedButton.styleFrom(
                backgroundColor: userPoints >= item.points ? Colors.green : Colors.grey, // Change color based on points
                padding: EdgeInsets.symmetric(horizontal: 30, vertical: 15),
              ),
              child: Text('Buy with Points', style: TextStyle(fontSize: 18)),
            ),
          ],
        ),
      ),
    );
  }
}