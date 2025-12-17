#!/usr/bin/env python3
"""Quick test runner for FraudDetector.predict
"""
import importlib.util
from pathlib import Path
import sys

p = Path(__file__).resolve().parents[1] / 'app' / 'ml' / 'fraud_detector.py'
spec = importlib.util.spec_from_file_location('fraud_detector', str(p))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
FraudDetector = mod.FraudDetector

fd = FraudDetector()

cases = [
    {'amount': 1.0, 'time': 10.0, 'v1':0.0, 'v2':0.0},
    {'amount': 10000.0, 'time': 1000.0, 'v1':5.0, 'v2':-5.0},
    {'amount': 500.0, 'time': 10000.0, 'v1':10.0, 'v2':-10.0},
]

for c in cases:
    print('\nInput:', c)
    try:
        score = fd.predict(c)
        print('Score:', score)
    except Exception as e:
        print('Error calling predict:', e)
