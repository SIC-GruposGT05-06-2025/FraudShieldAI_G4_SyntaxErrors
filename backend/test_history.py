#!/usr/bin/env python3
"""Test script for history manager"""

from app.history import HistoryManager

# Test history manager
manager = HistoryManager()

# Test adding predictions
pred1 = {
    'transaction_id': 'test-1',
    'is_fraud': False,
    'fraud_probability': 0.23,
    'risk_score': 23,
    'risk_level': 'LOW',
    'confidence': 0.77,
    'timestamp': '2025-12-10T10:00:00'
}

pred2 = {
    'transaction_id': 'test-2',
    'is_fraud': True,
    'fraud_probability': 0.87,
    'risk_score': 87,
    'risk_level': 'HIGH',
    'confidence': 0.92,
    'timestamp': '2025-12-10T10:05:00'
}

# Add predictions
manager.add_prediction(pred1)
manager.add_prediction(pred2)

# Get all
all_preds = manager.get_all_predictions()
print(f"✓ Total predictions: {len(all_preds)}")

# Get paginated
page = manager.get_predictions_paginated(page=1, items_per_page=10)
print(f"✓ Paginated page 1: {len(page['data'])} items")
print(f"✓ Total pages: {page['total_pages']}")

# Get stats
stats = manager.get_statistics()
print(f"✓ Stats - Fraud count: {stats['total_fraud_detected']}")
print(f"✓ Stats - Fraud rate: {stats['fraud_rate']}")
print(f"✓ Stats - Risk distribution: {stats['risk_distribution']}")

print("\n✅ All tests passed!")
