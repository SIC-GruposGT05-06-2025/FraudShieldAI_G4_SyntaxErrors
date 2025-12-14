from fastapi import APIRouter, Query
from app.schemas import TransactionCreate
from datetime import datetime, timedelta
import random

router = APIRouter()

# In-memory database (replace with real database in production)
TRANSACTIONS_DB = []

@router.post("/")
def create_transaction(t: TransactionCreate):
    """Create a new transaction"""
    transaction = {
        **t.dict(),
        "id": f"txn_{len(TRANSACTIONS_DB) + 1:06d}",
        "timestamp": datetime.now().isoformat(),
        "risk_score": random.randint(0, 100),
    }
    TRANSACTIONS_DB.append(transaction)
    return {"msg": "Transaction received", "transaction": transaction}

@router.get("/")
def get_transactions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    risk_level: str = Query(None),
    is_fraud: bool = Query(None),
):
    """Get transactions with pagination and filters"""
    # Filter transactions
    filtered = TRANSACTIONS_DB
    
    if risk_level:
        filtered = [t for t in filtered if get_risk_level(t.get("risk_score", 0)) == risk_level]
    
    if is_fraud is not None:
        filtered = [t for t in filtered if t.get("is_fraud", False) == is_fraud]
    
    # Paginate
    start = (page - 1) * limit
    end = start + limit
    
    return {
        "data": filtered[start:end],
        "total": len(filtered),
        "page": page,
        "totalPages": (len(filtered) + limit - 1) // limit,
    }

@router.get("/{transaction_id}")
def get_transaction(transaction_id: str):
    """Get a specific transaction by ID"""
    for t in TRANSACTIONS_DB:
        if t["id"] == transaction_id:
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
