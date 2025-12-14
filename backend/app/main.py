from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import transactions, predict
import os

app = FastAPI(
    title="Fraud Shield API",
    version="1.0"
)

# CORS configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["Transactions"])
app.include_router(predict.router, prefix="/api/v1/predict", tags=["Fraud Detection"])

@app.get("/")
def root():
    return {"status": "Fraud Shield API running", "version": "1.0"}

@app.get("/health")
def health():
    return {"status": "ok"}
