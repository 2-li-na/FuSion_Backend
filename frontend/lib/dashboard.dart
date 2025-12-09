import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import 'step_tracker.dart';
import 'faq.dart';
import 'login.dart';
import 'praemie.dart';
import 'datenschutz.dart';
import 'feedback.dart';
import 'impressum.dart';

class DashboardPage extends StatefulWidget {
  final String username;
  final String backendBaseUrl;

  const DashboardPage({
    super.key,
    required this.username,
    required this.backendBaseUrl,
  });

  @override
  DashboardPageState createState() => DashboardPageState();
}

class DashboardPageState extends State<DashboardPage> {
  File? _profileImage;

  Future<void> _pickImage() async {
    final pickedFile =
        await ImagePicker().pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _profileImage = File(pickedFile.path);
      });
    }
  }

  void _launchURL(String url) async {
    final Uri uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      throw 'Could not launch $url';
    }
  }

  @override
  void initState() {
    super.initState();

    final stepTracker = Provider.of<StepTracker>(context, listen: false);
    stepTracker.configure(
      backendBaseUrl: widget.backendBaseUrl,
      username: widget.username,
    );
    stepTracker.initialize();
  }

  @override
  void dispose() {
    final stepTracker = Provider.of<StepTracker>(context, listen: false);
    stepTracker.stopTracking();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final stepTracker = Provider.of<StepTracker>(context);
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 151, 207, 153),
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(screenHeight * 0.15),
        child: Container(
          margin: EdgeInsets.symmetric(horizontal: screenWidth * 0.03),
          padding: EdgeInsets.symmetric(horizontal: screenWidth * 0.03),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: Colors.green, width: 2.0),
            borderRadius: BorderRadius.circular(12.0),
          ),
          child: SafeArea(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Builder(
                  builder: (context) => IconButton(
                    icon: Icon(Icons.menu, size: screenWidth * 0.08, color: Colors.black),
                    onPressed: () {
                      Scaffold.of(context).openDrawer();
                    },
                  ),
                ),
                Flexible(
                  child: Text(
                    'Übersicht',
                    style: TextStyle(
                      fontSize: screenWidth * 0.06,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Image.asset('assets/images/logo.png', height: screenHeight * 0.08),
              ],
            ),
          ),
        ),
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            UserAccountsDrawerHeader(
              accountName: Text(widget.username),
              accountEmail: Text('tulinamaharjan@gmail.com'),
              currentAccountPicture: GestureDetector(
                onTap: _pickImage,
                child: CircleAvatar(
                  backgroundImage: _profileImage != null
                      ? FileImage(_profileImage!)
                      : AssetImage('assets/images/profile_picture.png') as ImageProvider,
                ),
              ),
            ),
            ListTile(
              leading: Icon(Icons.home),
              title: Text('Übersicht'),
              onTap: () {
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: Icon(Icons.emoji_events),
              title: Text('Prämienkatalog'),
              onTap: () {
                _launchURL(
                    'https://www.hs-fulda.de/unsere-hochschule/a-z-alle-institutionen/hochschulsport/fusion/praemienkatalog');
              },
            ),
            ListTile(
              leading: Icon(Icons.help),
              title: Text('FAQ'),
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) => FAQPage()));
              },
            ),
            ListTile(
              leading: Icon(Icons.info),
              title: Text('Impressum'),
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) => ImpressumPage()));
              },
            ),
            ListTile(
              leading: Icon(Icons.lock),
              title: Text('Datenschutz'),
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) => DatenschutzPage()));
              },
            ),
            ListTile(
              leading: Icon(Icons.feedback),
              title: Text('Feedback'),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => FeedbackPage(username: widget.username, backendBaseUrl: '',)),
                );
              },
            ),
            ListTile(
              leading: Icon(Icons.card_giftcard),
              title: Text('Prämie Einlösen'),
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) => PraemiePage()));
              },
            ),
            Divider(),
            ListTile(
              leading: Icon(Icons.language),
              title: Text('Sprache'),
              subtitle: Row(
                children: [
                  TextButton(
                    onPressed: () {},
                    child: Text('Englisch'),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: Text('Deutsch'),
                  ),
                ],
              ),
            ),
            Divider(),
            ListTile(
              leading: Icon(Icons.logout, color: Colors.red),
              title: Text('Abmelden', style: TextStyle(color: Colors.green)),
              onTap: () {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (context) => LoginPage(backendBaseUrl: widget.backendBaseUrl)),
                  (route) => false,
                );
              },
            ),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: screenWidth * 0.04),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Activity Chart Section
            Container(
              padding: EdgeInsets.all(screenWidth * 0.04),
              margin: EdgeInsets.only(top: screenHeight * 0.02, bottom: screenHeight * 0.03),
              decoration: BoxDecoration(
                color: const Color.fromARGB(255, 236, 245, 235),
                border: Border.all(color: Colors.green, width: 2.0),
                borderRadius: BorderRadius.circular(12.0),
              ),
              child: Column(
                children: [
                  Text(
                    'Hallo ${widget.username}!',
                    style: TextStyle(fontSize: screenWidth * 0.06, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: screenHeight * 0.01),
                  Divider(color: Colors.green, thickness: 1),
                  SizedBox(height: screenHeight * 0.01),
                  Text('Deine Aktivität', style: TextStyle(fontSize: screenWidth * 0.05)),
                  SizedBox(height: screenHeight * 0.02),
                  // Google Fit status and refresh
                  Container(
                    padding: EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: stepTracker.isAuthorized ? Colors.green[100] : Colors.orange[100],
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: stepTracker.isAuthorized ? Colors.green[300]! : Colors.orange[300]!
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          stepTracker.isAuthorized ? Icons.fitness_center : Icons.warning,
                          color: stepTracker.isAuthorized ? Colors.green[700] : Colors.orange[700],
                          size: 16,
                        ),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            stepTracker.isAuthorized 
                              ? 'Google Fit verbunden - Automatische Schrittverfolgung aktiv'
                              : 'Google Fit nicht verbunden - Testdaten werden verwendet',
                            style: TextStyle(
                              fontSize: screenWidth * 0.035,
                              color: stepTracker.isAuthorized ? Colors.green[700] : Colors.orange[700],
                            ),
                          ),
                        ),
                        IconButton(
                          onPressed: () => stepTracker.syncStepsWithBackend(),
                          icon: Icon(
                            Icons.refresh,
                            color: stepTracker.isAuthorized ? Colors.green[700] : Colors.orange[700],
                            size: 20,
                          ),
                          tooltip: 'Schritte aktualisieren',
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: screenHeight * 0.02),
                  Row(
                    children: [
                      Flexible(
                        child: SizedBox(
                          height: screenHeight * 0.25,
                          child: PieChart(
                            PieChartData(
                              sections: [
                                PieChartSectionData(
                                  value: stepTracker.dailySteps.toDouble(),
                                  color: Colors.green,
                                  title: '${stepTracker.dailySteps}',
                                  radius: 60,
                                  titleStyle: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                PieChartSectionData(
                                  value: (10000 - stepTracker.dailySteps).toDouble().clamp(0, 10000),
                                  color: Colors.grey[300]!,
                                  title: '',
                                  radius: 60,
                                ),
                              ],
                              centerSpaceRadius: 40,
                              sectionsSpace: 2,
                            ),
                          ),
                        ),
                      ),
                      SizedBox(width: screenWidth * 0.03),
                      Flexible(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.circle, color: Colors.green, size: screenWidth * 0.04),
                                SizedBox(width: screenWidth * 0.02),
                                Flexible(
                                  child: Text(
                                    '${stepTracker.dailySteps} Heutige Schritte',
                                    style: TextStyle(fontSize: screenWidth * 0.04),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: screenHeight * 0.01),
                            Row(
                              children: [
                                Icon(Icons.circle, color: Colors.red, size: screenWidth * 0.04),
                                SizedBox(width: screenWidth * 0.02),
                                Flexible(
                                  child: Text(
                                    '${stepTracker.points} Punkte',
                                    style: TextStyle(fontSize: screenWidth * 0.04),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: screenHeight * 0.01),
                            Row(
                              children: [
                                Icon(Icons.circle, color: Colors.blue, size: screenWidth * 0.04),
                                SizedBox(width: screenWidth * 0.02),
                                Flexible(
                                  child: Text(
                                    stepTracker.isAuthorized ? 'Automatisch synchronisiert' : 'Testmodus',
                                    style: TextStyle(fontSize: screenWidth * 0.04),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // Bar Chart Section
            Container(
              padding: EdgeInsets.all(screenWidth * 0.04),
              decoration: BoxDecoration(
                color: Colors.green[50],
                border: Border.all(color: Colors.green, width: 1.5),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  Text(
                    'Die Stärke der Fachbereiche',
                    style: TextStyle(fontSize: screenWidth * 0.05, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: screenHeight * 0.02),
                  SizedBox(
                    height: screenHeight * 0.3,
                    child: BarChart(
                      BarChartData(
                        alignment: BarChartAlignment.spaceAround,
                        maxY: 100,
                        barTouchData: BarTouchData(enabled: false),
                        titlesData: FlTitlesData(
                          show: true,
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              getTitlesWidget: (value, meta) {
                                const titles = ['GW', 'LT', 'V', 'SW', 'W', 'SK', 'OE', 'AI'];
                                return Text(
                                  titles[value.toInt()],
                                  style: TextStyle(fontSize: 12),
                                );
                              },
                            ),
                          ),
                          leftTitles: AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                          topTitles: AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                          rightTitles: AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                        ),
                        borderData: FlBorderData(show: false),
                        barGroups: [
                          BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: 80, color: Colors.cyan)]),
                          BarChartGroupData(x: 1, barRods: [BarChartRodData(toY: 46, color: Colors.teal)]),
                          BarChartGroupData(x: 2, barRods: [BarChartRodData(toY: 32, color: Colors.green)]),
                          BarChartGroupData(x: 3, barRods: [BarChartRodData(toY: 80, color: Colors.yellow)]),
                          BarChartGroupData(x: 4, barRods: [BarChartRodData(toY: 49, color: Colors.blue)]),
                          BarChartGroupData(x: 5, barRods: [BarChartRodData(toY: 62, color: Colors.orange)]),
                          BarChartGroupData(x: 6, barRods: [BarChartRodData(toY: 15, color: Colors.pink)]),
                          BarChartGroupData(x: 7, barRods: [BarChartRodData(toY: 57, color: Colors.indigo)]),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final stepTracker = Provider.of<StepTracker>(context, listen: false);
          
          // Show debug dialog
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: Text('Step Tracker Debug'),
              content: SingleChildScrollView(
                child: Text(stepTracker.getDebugInfo()),
              ),
              actions: [
                TextButton(
                  onPressed: () async {
                    stepTracker.syncStepsWithBackend();
                    if (mounted) Navigator.pop(context);
                  },
                  child: Text('Schritte synchronisieren'),
                ),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text('OK'),
                ),
              ],
            ),
          );
        },
        backgroundColor: Colors.green,
        tooltip: 'Debug Info',
        child: Icon(Icons.directions_walk),
      ),
    );
  }
}