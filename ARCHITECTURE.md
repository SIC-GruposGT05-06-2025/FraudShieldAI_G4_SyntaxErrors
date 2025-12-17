# Arquitectura FraudShieldAI

## Stack Tecnológico

**Frontend**
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- React Hook Form + Zod para validaciones

**Backend**
- FastAPI (Python 3.11+)
- Pydantic para schemas
- Scikit-learn para el modelo ML
- Joblib para serialización del modelo

**Infraestructura**
- Docker + Docker Compose
- Nginx (reverse proxy en producción)
- PostgreSQL (cuando se implemente persistencia)

---

## Estructura del Proyecto

```
fraudshield-ai/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Home con formulario
│   │   │   ├── history/page.tsx      # Historial de transacciones
│   │   │   └── analytics/page.tsx    # Dashboard de métricas
│   │   ├── components/
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── ResultCard.tsx
│   │   │   └── RiskGauge.tsx
│   │   ├── lib/
│   │   │   ├── api.ts               # Cliente HTTP
│   │   │   └── types.ts             # Interfaces TypeScript
│   │   └── utils/
│   ├── package.json
│   └── Dockerfile
│
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app + CORS
│   │   ├── routers/
│   │   │   ├── predict.py           # POST /api/v1/predict
│   │   │   └── transactions.py      # CRUD transacciones
│   │   ├── ml/
│   │   │   ├── fraud_detector.py    # Wrapper del modelo
│   │   │   └── model.joblib         # Modelo serializado
│   │   ├── schemas.py               # Pydantic models
│   │   └── storage.py               # In-memory storage (temporal)
│   ├── requirements.txt
│   └── Dockerfile
│
└── docker-compose.yml
```

---

## Flujo de una Predicción

### 1. Usuario ingresa datos en el form
```typescript
// frontend/src/components/TransactionForm.tsx
{
  amount: 150.50,
  merchant_category: "retail",
  location: "US",
  device_type: "mobile",
  time_of_day: "14:30",
  // ... más campos
}
```

### 2. Frontend valida y envía POST
```typescript
// frontend/src/lib/api.ts
const response = await fetch('http://localhost:8000/api/v1/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(transactionData)
});
```

### 3. Backend recibe y valida con Pydantic
```python
# backend/app/schemas.py
class PredictionRequest(BaseModel):
    amount: float
    merchant_category: str
    location: str
    device_type: str
    # ...
```

### 4. Se ejecuta la predicción
```python
# backend/app/routers/predict.py
@router.post("/predict")
async def predict_fraud(request: PredictionRequest):
    # Llamar al modelo ML
    prediction = fraud_detector.predict(request.dict())
    
    # Calcular risk score (0-100)
    risk_score = prediction['fraud_probability'] * 100
    
    # Determinar nivel de riesgo
    if risk_score < 25:
        risk_level = "LOW"
    elif risk_score < 75:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"
    
    return PredictionResponse(
        transaction_id=str(uuid4()),
        is_fraud=risk_score >= 50,
        fraud_probability=prediction['fraud_probability'],
        risk_score=risk_score,
        risk_level=risk_level,
        confidence=1 - prediction['fraud_probability'],
        timestamp=datetime.utcnow()
    )
```

### 5. Modelo ML procesa features
```python
# backend/app/ml/fraud_detector.py
class FraudDetector:
    def predict(self, transaction_data: dict) -> dict:
        # Cargar modelo
        model = joblib.load('model.joblib')
        
        # Preparar features (one-hot encoding, scaling, etc)
        features = self._prepare_features(transaction_data)
        
        # Predicción
        probability = model.predict_proba(features)[0][1]
        
        return {
            'fraud_probability': probability,
            'features_used': list(features.columns)
        }
```

### 6. Response regresa al frontend
```json
{
  "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
  "is_fraud": false,
  "fraud_probability": 0.23,
  "risk_score": 23,
  "risk_level": "LOW",
  "confidence": 0.77,
  "factors": ["Amount within normal range", "Trusted location"],
  "timestamp": "2025-12-17T10:30:00Z"
}
```

### 7. React actualiza el UI
```typescript
// frontend/src/components/ResultCard.tsx
<div className="result-card">
  <RiskGauge score={result.risk_score} level={result.risk_level} />
  <p>Probabilidad de fraude: {(result.fraud_probability * 100).toFixed(1)}%</p>
  <p>Confianza: {(result.confidence * 100).toFixed(1)}%</p>
</div>
```

---

## API Endpoints

### Predicción
```
POST /api/v1/predict
Content-Type: application/json

Request:
{
  "amount": 150.50,
  "merchant_category": "retail",
  "location": "US",
  "device_type": "mobile"
}

Response: 200 OK
{
  "transaction_id": "uuid",
  "is_fraud": false,
  "fraud_probability": 0.23,
  "risk_score": 23,
  "risk_level": "LOW",
  "confidence": 0.77
}
```

### Historial de Transacciones
```
GET /api/v1/transactions?skip=0&limit=50
Response: 200 OK
{
  "transactions": [...],
  "total": 150,
  "skip": 0,
  "limit": 50
}
```

### Analytics (futura implementación)
```
GET /api/v1/analytics/summary
Response: 200 OK
{
  "total_transactions": 1500,
  "fraud_detected": 45,
  "fraud_rate": 0.03,
  "avg_risk_score": 32.5
}
```

---

## Storage Actual (In-Memory)

Por ahora, todo vive en memoria durante la ejecución:

```python
# backend/app/storage.py
class InMemoryStorage:
    def __init__(self):
        self.transactions: List[Dict] = []
        self.predictions: List[Dict] = []
    
    def save_transaction(self, txn: dict):
        self.transactions.append(txn)
    
    def get_transactions(self, skip: int = 0, limit: int = 50):
        return self.transactions[skip:skip+limit]
```

**Nota**: Se reinicia cuando se detiene el servidor. Próximo paso es migrar a PostgreSQL.

---

## Deployment con Docker

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend/app:/app
    environment:
      - MODEL_PATH=/app/ml/model.joblib
```

Levantar todo:
```bash
docker-compose up --build
```

Frontend: http://localhost:3000  
Backend API: http://localhost:8000/docs (Swagger UI)

---
