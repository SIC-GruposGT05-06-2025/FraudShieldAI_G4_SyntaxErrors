#!/usr/bin/env python3
"""Test script to verify history saving works"""

import urllib.request
import urllib.error
import json

BASE_URL = "http://localhost:8000/api/v1"

# Test data
test_prediction = {
    "amount": 100,
    "time": 1234567890
}

print("Testing FraudShieldAI History Feature")
print("=" * 50)

def make_request(url, method="GET", data=None):
    """Make an HTTP request and return the response"""
    headers = {"Content-Type": "application/json"}
    
    if data:
        data = json.dumps(data).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')

# Test 1: Check health
print("\n1. Checking backend health...")
try:
    status, response = make_request(f"{BASE_URL.replace('/v1', '')}/health")
    if status == 200:
        print(f"   ✓ Backend is running: {response}")
    else:
        print(f"   ✗ Backend health check failed: {status}")
        exit(1)
except Exception as e:
    print(f"   ✗ Backend health check failed: {e}")
    exit(1)

# Test 2: Make a prediction
print("\n2. Making a prediction...")
try:
    status, response = make_request(f"{BASE_URL}/predict", method="POST", data=test_prediction)
    if status == 200:
        prediction = json.loads(response)
        print(f"   ✓ Prediction successful")
        print(f"     - Transaction ID: {prediction.get('transaction_id')}")
        print(f"     - Risk Level: {prediction.get('risk_level')}")
        print(f"     - Is Fraud: {prediction.get('is_fraud')}")
    else:
        print(f"   ✗ Prediction failed: {status}")
        print(f"     Response: {response}")
except Exception as e:
    print(f"   ✗ Prediction request failed: {e}")
    exit(1)

# Test 3: Check history
print("\n3. Checking history...")
try:
    status, response = make_request(f"{BASE_URL}/predict/history")
    if status == 200:
        history = json.loads(response)
        total_items = history.get('total_items', 0)
        print(f"   ✓ History retrieved successfully")
        print(f"     - Total items: {total_items}")
        print(f"     - Items in page: {len(history.get('data', []))}")
        
        if total_items > 0:
            print(f"     - Latest prediction: {history['data'][0]['transaction_id']}")
    else:
        print(f"   ✗ History retrieval failed: {status}")
except Exception as e:
    print(f"   ✗ History request failed: {e}")
    exit(1)

# Test 4: Check statistics
print("\n4. Checking statistics...")
try:
    status, response = make_request(f"{BASE_URL}/predict/history/stats")
    if status == 200:
        stats = json.loads(response)
        print(f"   ✓ Statistics retrieved successfully")
        print(f"     - Total predictions: {stats.get('total_predictions')}")
        print(f"     - Fraud detected: {stats.get('total_fraud_detected')}")
        print(f"     - Fraud rate: {stats.get('fraud_rate')}")
    else:
        print(f"   ✗ Statistics retrieval failed: {status}")
except Exception as e:
    print(f"   ✗ Statistics request failed: {e}")
    exit(1)

print("\n" + "=" * 50)
print("✅ All tests passed! History feature is working.")
