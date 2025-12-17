# Arquitectura FraudShieldAI

## Diagrama General del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       FraudShieldAI System                              │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     USER LAYER                                  │  │
│  │  ┌──────────┐  ┌────────────┐  ┌──────────────┐  ┌───────────┐ │  │
│  │  │  Check   │  │  History   │  │  Analytics   │  │  Settings │ │  │
│  │  │ Fraud    │  │  Txn       │  │  Dashboard   │  │           │ │  │
│  │  └──────────┘  └────────────┘  └──────────────┘  └───────────┘ │  │
│  └──────────────────────────┬──────────────────────────────────────┘  │
│                             │                                          │
│  ┌──────────────────────────▼──────────────────────────────────────┐  │
│  │                  PRESENTATION LAYER                            │  │
│  │                    Next.js Frontend                            │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │
│  │  │  Components:                                           │   │  │
│  │  │  • TransactionForm (Input)                            │   │  │
│  │  │  • ResultCard (Output)                                │   │  │
│  │  │  • TransactionsTable (History)                        │   │  │
│  │  │  • AnalyticsCharts (Metrics)                          │   │  │
│  │  │  • RiskGauge (Visual Risk)                            │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │
│  │  │  lib/api.ts - API Client Functions                     │   │  │
│  │  │  • predictTransaction()                               │   │  │
│  │  │  • getTransactions()                                  │   │  │
│  │  │  • getAnalyticsSummary()                              │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │
│  │  │  Types: TypeScript Interfaces                         │   │  │
│  │  │  • PredictionRequest/Response                         │   │  │
│  │  │  • Transaction                                        │   │  │
│  │  │  • AnalyticsSummary                                   │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────┬──────────────────────────────────────┘  │
│                             │                                          │
│                   HTTP/REST API (POST, GET)                           │
│                      /api/v1/* Endpoints                              │
│                   CORS Enabled & Validated                            │
│                             │                                          │
│  ┌──────────────────────────▼──────────────────────────────────────┐  │
│  │                    API LAYER                                    │  │
│  │                  FastAPI Backend                               │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │
│  │  │  main.py - Application Setup                           │   │  │
│  │  │  • CORS Middleware                                     │   │  │
│  │  │  • Router Registration                                │   │  │
│  │  │  • Error Handling                                      │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │
│  │  │  routers/predict.py                                    │   │  │
│  │  │  POST /api/v1/predict                                 │   │  │
│  │  │  • Input Validation                                    │   │  │
│  │  │  • ML Model Prediction                                │   │  │
│  │  │  • Risk Calculation                                    │   │  │
│  │  │  • Response Formatting                                │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │
│  │  │  routers/transactions.py                               │   │  │
│  │  │  GET  /api/v1/transactions (Paginated)                │   │  │
│  │  │  POST /api/v1/transactions (Create)                   │   │  │
│  │  │  GET  /api/v1/transactions/{id} (Detail)              │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │
│  │  │  schemas.py - Pydantic Models                          │   │  │
│  │  │  • PredictionRequest/Response                         │   │  │
│  │  │  • TransactionCreate                                  │   │  │
│  │  │  • FullTransactionFeatures                            │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────┬──────────────────────────────────────┘  │
│                             │                                          │
│  ┌──────────────────────────▼──────────────────────────────────────┐  │
│  │                   ML LAYER                                      │  │
│  │                Machine Learning Model                          │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │
│  │  │  fraud_detector.py                                     │   │  │
│  │  │  • FraudDetector Class                                │   │  │
│  │  │  • Model Prediction                                    │   │  │
│  │  │  • Feature Processing                                 │   │  │
│  │  │  • Score Normalization                                │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │
│  │  │  model.joblib                                          │   │  │
│  │  │  • Trained Scikit-learn Model                         │   │  │
│  │  │  • Serialized & Loaded on Startup                     │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────┬──────────────────────────────────────┘  │
│                             │                                          │
│  ┌──────────────────────────▼──────────────────────────────────────┐  │
│  │                  DATA LAYER                                     │  │
│  │           (Currently In-Memory, ready for DB)                  │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │
│  │  │  In-Memory Storage (Development)                       │   │  │
│  │  │  • Transactions List                                   │   │  │
│  │  │  • Predictions Cache                                   │   │  │
│  │  │  • Analytics Aggregation                               │   │  │
│  │  │                                                         │   │  │
│  │  │  Future: PostgreSQL / MongoDB                          │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Flujo de Solicitud Completo

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  1. USER INTERACTION                                                    │
│  ─────────────────────────────────────────────────────────────────────  │
│     User enters transaction details in form                             │
│     • Amount: 100                                                       │
│     • Location: USA                                                     │
│     • Device: mobile                                                    │
│     Clicks: "Analyze"                                                   │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  2. FRONTEND PROCESSING (React Component)                              │
│  ─────────────────────────────────────────────────────────────────────  │
│     TransactionForm captures input                                      │
│     ↓                                                                    │
│     Validates using React Hook Form                                     │
│     ↓                                                                    │
│     Converts to PredictionRequest type                                  │
│     ↓                                                                    │
│     Calls: predictTransaction(data)                                     │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  3. API CLIENT (lib/api.ts)                                             │
│  ─────────────────────────────────────────────────────────────────────  │
│     fetch('http://localhost:8000/api/v1/predict', {                    │
│       method: 'POST',                                                   │
│       headers: {'Content-Type': 'application/json'},                   │
│       body: JSON.stringify({amount: 100, location: 'USA'...})         │
│     })                                                                   │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  4. NETWORK LAYER                                                       │
│  ─────────────────────────────────────────────────────────────────────  │
│     HTTP POST request crosses network                                   │
│     ↓                                                                    │
│     CORS Headers checked at backend                                     │
│     ↓                                                                    │
│     Request authorized ✓                                                │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  5. BACKEND ROUTING (main.py)                                           │
│  ─────────────────────────────────────────────────────────────────────  │
│     FastAPI application receives request                                │
│     ↓                                                                    │
│     Matches to router: /api/v1/predict → predict.py                   │
│     ↓                                                                    │
│     Routes to: predict_fraud() function                                 │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  6. VALIDATION (Pydantic)                                               │
│  ─────────────────────────────────────────────────────────────────────  │
│     Input validated against PredictionRequest schema                    │
│     ↓                                                                    │
│     • Checks amount is number                                           │
│     • Checks location is string                                         │
│     • Checks device is string                                           │
│     ↓                                                                    │
│     Validation passed ✓                                                 │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  7. ML MODEL PREDICTION (fraud_detector.py)                             │
│  ─────────────────────────────────────────────────────────────────────  │
│     Data passed to FraudDetector.predict()                              │
│     ↓                                                                    │
│     Model loads (scikit-learn, joblib)                                  │
│     ↓                                                                    │
│     Features extracted and normalized                                   │
│     ↓                                                                    │
│     Model.predict() called                                              │
│     ↓                                                                    │
│     Returns fraud probability: 0.23                                     │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  8. RISK CALCULATION (predict.py)                                       │
│  ─────────────────────────────────────────────────────────────────────  │
│     fraud_probability = 0.23                                            │
│     ↓                                                                    │
│     Calculate risk_score = 0.23 * 100 = 23                             │
│     ↓                                                                    │
│     Determine risk_level:                                               │
│     • 23 < 25 → "LOW" ✓                                                │
│     ↓                                                                    │
│     Calculate confidence = 1 - 0.23 = 0.77                             │
│     ↓                                                                    │
│     Create factors list                                                 │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  9. RESPONSE FORMATTING                                                 │
│  ─────────────────────────────────────────────────────────────────────  │
│     {                                                                    │
│       "transaction_id": "uuid-xxx",                                     │
│       "is_fraud": false,                                                │
│       "fraud_probability": 0.23,                                        │
│       "risk_score": 23,                                                 │
│       "risk_level": "LOW",                                              │
│       "confidence": 0.77,                                               │
│       "factors": [...],                                                 │
│       "timestamp": "2025-12-10T15:30:00Z"                               │
│     }                                                                    │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  10. RESPONSE DELIVERY (HTTP)                                           │
│  ─────────────────────────────────────────────────────────────────────  │
│      HTTP 200 OK                                                        │
│      ↓                                                                   │
│      Content-Type: application/json                                     │
│      ↓                                                                   │
│      JSON body with response                                            │
│      ↓                                                                   │
│      Back to frontend                                                   │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  11. FRONTEND HANDLING (React State)                                    │
│  ─────────────────────────────────────────────────────────────────────  │
│      API Client returns PredictionResponse                              │
│      ↓                                                                   │
│      Update React state with response                                   │
│      ↓                                                                   │
│      ResultCard component receives new data                             │
│      ↓                                                                   │
│      Component re-renders                                               │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  12. DISPLAY TO USER                                                    │
│  ─────────────────────────────────────────────────────────────────────  │
│      ┌─────────────────────────────────┐                               │
│      │  FRAUD DETECTION RESULT         │                               │
│      │                                 │                               │
│      │  Status: ✅ LOW RISK            │                               │
│      │  Confidence: 77%                │                               │
│      │  Probability: 23%               │                               │
│      │  Score: 23/100                  │                               │
│      │  Time: 2025-12-10 15:30:00      │                               │
│      │                                 │                               │
│      │  [View Details] [New Analysis]  │                               │
│      └─────────────────────────────────┘                               │
│                                                                          │
│      User sees result immediately                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Componentes Clave

### Frontend Components
```
App (page.tsx)
├── Navbar (Navegación)
├── Home/Check Page
│   └── TransactionForm
│       ├── Input Fields
│       ├── Submit Button
│       └── Loading State
└── ResultCard
    ├── Risk Gauge
    ├── Risk Level Display
    ├── Confidence Indicator
    └── Details Expandable

History Page
├── TransactionsTable
│   ├── Filters
│   ├── Pagination
│   └── Row Details

Analytics Page
├── ModelPerformanceCard
├── FraudTrendsChart
├── RiskDistributionChart
└── ConfusionMatrix
```

### Backend Components
```
FastAPI App (main.py)
├── CORS Middleware
├── Routers
│   ├── predict.py
│   │   ├── POST /predict
│   │   └── POST /predict/full
│   └── transactions.py
│       ├── GET /transactions
│       ├── POST /transactions
│       └── GET /transactions/{id}
├── Models
│   └── FraudDetector
└── Utilities
    └── Risk Level Calculator
```

## Flujo de Datos

```
User Input
   ↓
Frontend Form Validation
   ↓
API Request (HTTP POST)
   ↓
CORS Validation ✓
   ↓
Backend Routing
   ↓
Pydantic Validation
   ↓
ML Model Prediction
   ↓
Risk Calculation
   ↓
Response Formatting
   ↓
HTTP Response (JSON)
   ↓
Frontend State Update
   ↓
React Re-render
   ↓
User Sees Result
```

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│          Docker Container 1             │
│    ┌───────────────────────────────┐   │
│    │   Frontend (Next.js)          │   │
│    │   Port: 3000                  │   │
│    └───────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │
                  │ HTTP/REST
                  │
┌─────────────────▼───────────────────────┐
│          Docker Container 2             │
│    ┌───────────────────────────────┐   │
│    │   Backend (FastAPI)           │   │
│    │   Port: 8000                  │   │
│    │                               │   │
│    │   ┌───────────────────────┐  │   │
│    │   │  In-Memory Database   │  │   │
│    │   │  (Development)        │  │   │
│    │   └───────────────────────┘  │   │
│    └───────────────────────────────┘   │
└─────────────────────────────────────────┘

Both containers in same Docker network (fraudshield-network)
Can communicate using container names as hostnames
```


