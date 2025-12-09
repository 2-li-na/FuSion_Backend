import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class FeedbackPage extends StatefulWidget {
  final String username;
  final String backendBaseUrl; // Fixed: Add backendBaseUrl parameter

  FeedbackPage({required this.username, required this.backendBaseUrl});

  @override
  _FeedbackPageState createState() => _FeedbackPageState();
}

class _FeedbackPageState extends State<FeedbackPage> {
  double _rating = 0.0;
  final TextEditingController _problemController = TextEditingController();
  final TextEditingController _additionalFeedbackController = TextEditingController();

  Future<void> _sendFeedback() async {
    final response = await http.post(
      Uri.parse('${widget.backendBaseUrl}/send-feedback'), // Fixed: Use passed backendBaseUrl
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode({
        'rating': _rating.toString(),
        'problem': _problemController.text,
        'additionalFeedback': _additionalFeedbackController.text,
        'username': widget.username,
      }),
    );

    if (!mounted) return; 

    if (response.statusCode == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Feedback sent successfully!')),
      );

      // Clear the fields after sending
      _problemController.clear();
      _additionalFeedbackController.clear();
      setState(() {
        _rating = 0.0; // Reset the rating
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to send feedback. Please try again.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Feedback'),
        backgroundColor: Colors.green,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'How would you rate the mobile app?',
              style: TextStyle(fontSize: 18, color: Colors.green[700]),
            ),
            RatingBar.builder(
              initialRating: 0,
              minRating: 1,
              direction: Axis.horizontal,
              allowHalfRating: true,
              itemCount: 5,
              itemPadding: EdgeInsets.symmetric(horizontal: 4.0),
              itemBuilder: (context, _) => Icon(
                Icons.star,
                color: Colors.amber,
              ),
              onRatingUpdate: (rating) {
                setState(() {
                  _rating = rating;
                });
              },
            ),
            SizedBox(height: 20),
            Text(
              'Please describe the problem you encountered in more detail.',
              style: TextStyle(fontSize: 18, color: Colors.green[700]),
            ),
            TextField(
              controller: _problemController,
              maxLines: 3,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                filled: true,
                fillColor: Colors.green[50],
              ),
            ),
            SizedBox(height: 20),
            Text(
              'Anything else you would like to share about the mobile app?',
              style: TextStyle(fontSize: 18, color: Colors.green[700]),
            ),
            TextField(
              controller: _additionalFeedbackController,
              maxLines: 3,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                filled: true,
                fillColor: Colors.green[50],
              ),
            ),
            SizedBox(height: 20),
            Center(
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  minimumSize: Size(150, 50),
                ),
                onPressed: _sendFeedback,
                child: Text('SEND', style: TextStyle(fontSize: 18, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}