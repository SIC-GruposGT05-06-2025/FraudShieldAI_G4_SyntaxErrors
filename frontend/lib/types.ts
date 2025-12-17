export interface Transaction {
  id: string
  amount: number
  time: number
  is_fraud: boolean
  fraud_probability: number
  risk_score: number
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  confidence: number
  timestamp: string
  v1?: number
  v2?: number
  v3?: number
  v4?: number
  v5?: number
  v6?: number
  v7?: number
  v8?: number
  v9?: number
  v10?: number
  v11?: number
  v12?: number
  v13?: number
  v14?: number
  v15?: number
  v16?: number
  v17?: number
  v18?: number
  v19?: number
  v20?: number
  v21?: number
  v22?: number
  v23?: number
  v24?: number
  v25?: number
  v26?: number
  v27?: number
  v28?: number
}

export interface PredictionRequest {
  amount: number
  time: number
  v1?: number
  v2?: number
  v3?: number
  v4?: number
  v5?: number
  v6?: number
  v7?: number
  v8?: number
  v9?: number
  v10?: number
  v11?: number
  v12?: number
  v13?: number
  v14?: number
  v15?: number
  v16?: number
  v17?: number
  v18?: number
  v19?: number
  v20?: number
  v21?: number
  v22?: number
  v23?: number
  v24?: number
  v25?: number
  v26?: number
  v27?: number
  v28?: number
}

export interface PredictionResponse {
  transaction_id: string
  is_fraud: boolean
  fraud_probability: number
  risk_score: number
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  confidence: number
  factors: {
    feature: string
    impact: string
    value: number
  }[]
  timestamp: string
}

export interface AnalyticsSummary {
  total_transactions: number
  fraud_detected: number
  fraud_rate: number
  total_amount_processed: number
  fraud_amount_blocked: number
  last_updated: string
}

export interface TrendData {
  timestamp: string
  total_transactions: number
  fraud_detected: number
  fraud_rate: number
}

export interface RiskDistribution {
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  count: number
  percentage: number
}

export interface ModelInfo {
  accuracy: number
  precision: number
  recall: number
  f1_score: number
}
