from pydantic import BaseModel

class TransactionCreate(BaseModel):
    user_id: str
    amount: float
    location: str
    device: str

class PredictionRequest(BaseModel):
    amount: float
    time: float
    v1: float = 0.0
    v2: float = 0.0
    v3: float = 0.0
    v4: float = 0.0
    v5: float = 0.0
    v6: float = 0.0
    v7: float = 0.0
    v8: float = 0.0
    v9: float = 0.0
    v10: float = 0.0
    v11: float = 0.0
    v12: float = 0.0
    v13: float = 0.0
    v14: float = 0.0
    v15: float = 0.0
    v16: float = 0.0
    v17: float = 0.0
    v18: float = 0.0
    v19: float = 0.0
    v20: float = 0.0
    v21: float = 0.0
    v22: float = 0.0
    v23: float = 0.0
    v24: float = 0.0
    v25: float = 0.0
    v26: float = 0.0
    v27: float = 0.0
    v28: float = 0.0

class PredictionResponse(BaseModel):
    transaction_id: str
    amount: float
    time: float
    is_fraud: bool
    fraud_probability: float
    risk_score: int
    risk_level: str
    confidence: float
    factors: list
    timestamp: str

class FullTransactionFeatures(BaseModel):
    time: float
    amount: float
    V1: float
    V2: float
    ...
    V28: float

