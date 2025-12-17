from fastapi import APIRouter
from app.schemas import PredictionRequest, PredictionResponse, FullTransactionFeatures
from app.ml.fraud_detector import FraudDetector
from app.history import get_history_manager
import pandas as pd
from datetime import datetime
from typing import Optional
import uuid
import json
from pathlib import Path

router = APIRouter()
model = FraudDetector()

# No need for separate transactions file - use history manager only

# Lazy initialization of history manager
_history_manager = None

def get_history_mgr():
    """Get history manager instance (lazy initialization)"""
    global _history_manager
    if _history_manager is None:
        _history_manager = get_history_manager()
    return _history_manager

def get_risk_level(score: float) -> str:
    """Determine risk level based on fraud score"""
    if score < 0.2:
        return "LOW"
    elif score < 0.4:
        return "MEDIUM"
    elif score < 0.6:
        return "HIGH"
    else:
        return "CRITICAL"

@router.post("/")
def predict_fraud(data: PredictionRequest):
    """Predict fraud probability for a transaction"""
    try:
        score = model.predict(data.dict())
        fraud = score >= 0.05
        risk_level = get_risk_level(score)
        
        transaction_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        prediction = {
            "transaction_id": transaction_id,
            "id": transaction_id,
            "is_fraud": fraud,
            "fraud_probability": float(score),
            "risk_score": int(score * 100),
            "risk_level": risk_level,
            "confidence": max(score, 1 - score),
            "factors": [
                {"feature": "Amount", "impact": "High", "value": data.amount},
                {"feature": "Time", "impact": "Medium", "value": data.time},
            ],
            "timestamp": timestamp,
            "amount": data.amount,
            "merchant": "Online",
            "location": "N/A",
            "card_type": "Unknown"
        }
        
        # Save to history manager (which saves to history.json)
        try:
            get_history_mgr().add_prediction(prediction)
        except Exception as e:
            print(f"Warning: Could not save prediction to history: {e}")
        
        return prediction
    except Exception as e:
        print(f"Error in predict_fraud: {e}")
        raise

@router.post("/full")
def predict_full(data: FullTransactionFeatures):
    """Predict fraud with full feature set"""
    try:
        features = data.dict()
        score = model.predict(features)
        fraud = score > 0.005
        risk_level = get_risk_level(score)
        
        prediction = {
            "transaction_id": transaction_id,
            "is_fraud": fraud,
            "fraud_probability": float(score),
            "risk_score": score,
            "risk_level": risk_level,
            "confidence": max(score, 1 - score),
            "factors": [
                {"feature": "Amount", "impact": "High", "value": features.get("amount", 0)},
            ],
            "timestamp": datetime.now().isoformat(),
        }
        
        # Save to history
        try:
            get_history_mgr().add_prediction(prediction)
        except Exception as e:
            # Log error but don't fail the prediction
            print(f"Warning: Could not save prediction to history: {e}")
        
        return prediction
    except Exception as e:
        print(f"Error in predict_full: {e}")
        raise

@router.get("/history")
def get_history(page: int = 1, items_per_page: int = 20, risk_level: Optional[str] = None, is_fraud: Optional[bool] = None):
    """Get prediction history with pagination and optional filters"""
    filters = {}
    if risk_level:
        filters["risk_level"] = risk_level
    if is_fraud is not None:
        filters["is_fraud"] = is_fraud
    
    return get_history_mgr().get_predictions_paginated(page, items_per_page, filters if filters else None)

@router.get("/history/all")
def get_history_all():
    """Get all predictions in history"""
    return {"predictions": get_history_mgr().get_all_predictions()}

@router.get("/history/stats")
def get_history_stats():
    """Get statistics about prediction history"""
    return get_history_mgr().get_statistics()

@router.delete("/history")
def clear_history():
    """Clear all prediction history"""
    get_history_mgr().clear_history()
    return {"message": "History cleared successfully"}
