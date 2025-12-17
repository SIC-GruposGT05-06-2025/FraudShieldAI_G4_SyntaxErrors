from fastapi import APIRouter, Query
from app.schemas import TransactionCreate
from datetime import datetime, timedelta
import random
import json
import os
from pathlib import Path

router = APIRouter()

# Path to JSON file for persistence
DATA_DIR = Path(__file__).parent.parent.parent / "data"
HISTORY_FILE = DATA_DIR / "history.json"

def load_transactions():
    """Load transactions from history.json file"""
    if HISTORY_FILE.exists():
        try:
            with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Extract predictions array from history.json structure
                return data.get("predictions", [])
        except Exception as e:
            print(f"Error loading transactions: {e}")
            return []
    return []

def save_transactions(transactions):
    """Save transactions to history.json file"""
    try:
        DATA_DIR.mkdir(exist_ok=True)
        # Maintain history.json structure with predictions array
        data = {"predictions": transactions}
        with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving transactions: {e}")

@router.post("/")
def create_transaction(t: TransactionCreate):
    """Create a new transaction"""
    transactions = load_transactions()
    transaction = {
        **t.dict(),
        "id": f"txn_{len(transactions) + 1:06d}",
        "timestamp": datetime.now().isoformat(),
        "risk_score": random.randint(0, 100),
    }
    transactions.append(transaction)
    save_transactions(transactions)
    return {"msg": "Transaction received", "transaction": transaction}

@router.get("/")
def get_transactions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=1000),
    risk_level: str = Query(None, alias="risk_level"),
    is_fraud: bool = Query(None, alias="is_fraud"),
):
    """Get transactions with pagination and filters"""
    # Load fresh data from file
    transactions = load_transactions()
    
    # Filter transactions
    filtered = transactions
    
    if risk_level:
        filtered = [t for t in filtered if get_risk_level(t.get("risk_score", 0)) == risk_level.upper()]
    
    if is_fraud is not None:
        filtered = [t for t in filtered if t.get("is_fraud", False) == is_fraud]
    
    # Paginate
    start = (page - 1) * limit
    end = start + limit
    
    return {
        "transactions": filtered[start:end],
        "total": len(filtered),
        "page": page,
        "totalPages": max(1, (len(filtered) + limit - 1) // limit),
    }

@router.get("/{transaction_id}")
def get_transaction(transaction_id: str):
    """Get a specific transaction by ID"""
    transactions = load_transactions()
    for t in transactions:
        if t.get("id") == transaction_id or t.get("transaction_id") == transaction_id:
            return t
    return {"error": "Transaction not found"}

def get_risk_level(score: int) -> str:
    """Determine risk level based on score"""
    if score < 25:
        return "LOW"
    elif score < 50:
        return "MEDIUM"
    elif score < 75:
        return "HIGH"
    else:
        return "CRITICAL"

@router.delete("/")
def clear_transactions():
    """Clear all transactions"""
    save_transactions([])
    return {"msg": "All transactions cleared", "count": 0}
