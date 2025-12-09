import 'dart:async';
import 'package:flutter/material.dart';
import 'package:health/health.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class StepTracker extends ChangeNotifier {
  // Configuration
  late String backendBaseUrl;
  late String username;

  // State
  int _dailySteps = 0;
  int _points = 0;
  bool _isAuthorized = false;
  bool _isInitialized = false;
  DateTime _lastFetchTime = DateTime.now();
  Timer? _syncTimer;

  // Health instance (new singleton pattern)
  final Health _health = Health();

  // Getters
  int get dailySteps => _dailySteps;
  int get points => _points;
  bool get isAuthorized => _isAuthorized;
  bool get isInitialized => _isInitialized;

  StepTracker();

  void configure({
    required String backendBaseUrl,
    required String username,
  }) {
    this.backendBaseUrl = backendBaseUrl;
    this.username = username;
  }

  Future<void> initialize() async {
    if (_isInitialized) return;
    
    print("Initializing Step Tracker for: $username");
    
    try {
      await _requestPermissions();
      
      if (_isAuthorized) {
        await _fetchAndSyncSteps();
        _startTimers();
      } else {
        print("Not authorized - using test data");
        _setTestData();
      }
      
      _isInitialized = true;
      notifyListeners();
      
    } catch (e) {
      print("Error initializing step tracker: $e");
      _setTestData();
      _isInitialized = true;
      notifyListeners();
    }
  }

  Future<void> _requestPermissions() async {
    print("Requesting health permissions...");
    
    List<HealthDataType> types = [HealthDataType.STEPS];
    
    try {
      _isAuthorized = await _health.requestAuthorization(types);
      print("Health Authorization: $_isAuthorized");
    } catch (e) {
      print("Error requesting health authorization: $e");
      _isAuthorized = false;
    }
  }

  Future<int> _fetchTodaysSteps() async {
    if (!_isAuthorized) return 0;

    try {
      final now = DateTime.now();
      final startOfDay = DateTime(now.year, now.month, now.day);
      
      print("Fetching steps from $startOfDay to $now");

      List<HealthDataPoint> healthData = await _health.getHealthDataFromTypes(
        types: [HealthDataType.STEPS],
        startTime: startOfDay,
        endTime: now,
      );

      int totalSteps = 0;
      for (var point in healthData) {
        if (point.value is NumericHealthValue) {
          totalSteps += (point.value as NumericHealthValue).numericValue.toInt();
        }
      }

      print("Retrieved $totalSteps steps from Health Connect/HealthKit");
      _dailySteps = totalSteps;
      _lastFetchTime = now;
      
      return totalSteps;
      
    } catch (e) {
      print("Error fetching steps: $e");
      return 0;
    }
  }

  Future<bool> _sendStepsToBackend(int steps) async {
    if (steps <= 0) return false;
    
    try {
      final url = Uri.parse('$backendBaseUrl/steps');
      final body = {
        "username": username,
        "steps": steps,
        "date": DateTime.now().toIso8601String(),
        "source": "HEALTH_CONNECT"
      };

      print("Sending $steps steps to backend...");

      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(body),
      ).timeout(Duration(seconds: 30));

      if (response.statusCode == 200 || response.statusCode == 201) {
        print("Steps synced successfully");
        return true;
      } else {
        print("Backend sync failed: ${response.statusCode}");
        return false;
      }
      
    } catch (e) {
      print("Error sending steps to backend: $e");
      return false;
    }
  }

  Future<void> _fetchPointsFromBackend() async {
    try {
      final url = Uri.parse('$backendBaseUrl/points/total/$username');
      
      final response = await http.get(url).timeout(Duration(seconds: 30));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _points = data['totalPoints'] ?? 0;
        print("Retrieved $_points points from backend");
      }
      
    } catch (e) {
      print("Error fetching points: $e");
    }
  }

  Future<void> _fetchAndSyncSteps() async {
    print("Starting step sync...");
    
    try {
      int steps = await _fetchTodaysSteps();
      
      if (steps > 0) {
        await _sendStepsToBackend(steps);
      }
      
      await _fetchPointsFromBackend();
      
      print("Sync complete: $steps steps, $_points points");
      notifyListeners();
      
    } catch (e) {
      print("Sync failed: $e");
    }
  }

  void _startTimers() {
    print("Starting automatic sync timers");
    
    _syncTimer?.cancel();
    _syncTimer = Timer.periodic(Duration(minutes: 30), (timer) {
      print("30-min sync trigger");
      _fetchAndSyncSteps();
    });
  }

  Future<void> refreshSteps() async {
    print("Manual refresh triggered");
    await _fetchAndSyncSteps();
  }

  void _setTestData() {
    _dailySteps = 1500 + (DateTime.now().hour * 200);
    _points = 5;
    print("Using test data: $_dailySteps steps, $_points points");
    notifyListeners();
  }

  void deductPoints(int pointsToDeduct) {
    if (_points >= pointsToDeduct) {
      _points -= pointsToDeduct;
      print("Deducted $pointsToDeduct points (remaining: $_points)");
      notifyListeners();
    }
  }

  void stopTracking() {
    print("Stopping step tracking");
    _syncTimer?.cancel();
  }

  String getDebugInfo() {
    return """
STEP TRACKER DEBUG INFO
Platform: Health Connect/HealthKit
Authorized: $_isAuthorized
Initialized: $_isInitialized
Daily Steps: $_dailySteps
Points: $_points
Last Sync: ${_lastFetchTime.toString()}
Sync Timer: ${_syncTimer?.isActive ?? false}
Backend: $backendBaseUrl
Username: $username
    """;
  }

  void syncStepsWithBackend() {
    refreshSteps();
  }
}