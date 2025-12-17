import type {
  PredictionRequest,
  PredictionResponse,
  Transaction,
  AnalyticsSummary,
  TrendData,
  RiskDistribution,
  ModelInfo,
} from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

// Mock data for development
const mockSummary: AnalyticsSummary = {
  total_transactions: 15234,
  fraud_detected: 89,
  fraud_rate: 0.58,
  total_amount_processed: 2456789.5,
  fraud_amount_blocked: 45678.9,
  last_updated: new Date().toISOString(),
}

const generateMockTransaction = (id: number, isFraud: boolean = Math.random() > 0.95): Transaction => {
  const riskScore = isFraud ? Math.floor(Math.random() * 30 + 70) : Math.floor(Math.random() * 30)
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

  if (riskScore < 25) riskLevel = "LOW"
  else if (riskScore < 50) riskLevel = "MEDIUM"
  else if (riskScore < 75) riskLevel = "HIGH"
  else riskLevel = "CRITICAL"

  return {
    id: `txn_${id.toString().padStart(6, "0")}`,
    amount: Math.random() * 2000 + 10,
    time: Math.floor(Math.random() * 10000),
    is_fraud: isFraud,
    fraud_probability: isFraud ? Math.random() * 0.3 + 0.7 : Math.random() * 0.3,
    risk_score: riskScore,
    risk_level: riskLevel,
    confidence: Math.random() * 0.2 + 0.8,
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
  }
}

const mockTransactions = Array.from({ length: 50 }, (_, i) => generateMockTransaction(i + 1))

const mockTrends: TrendData[] = Array.from({ length: 24 }, (_, i) => ({
  timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
  total_transactions: Math.floor(Math.random() * 500 + 300),
  fraud_detected: Math.floor(Math.random() * 10 + 1),
  fraud_rate: Math.random() * 2 + 0.3,
}))

const mockRiskDistribution: RiskDistribution[] = [
  { risk_level: "LOW", count: 14234, percentage: 93.4 },
  { risk_level: "MEDIUM", count: 678, percentage: 4.5 },
  { risk_level: "HIGH", count: 234, percentage: 1.5 },
  { risk_level: "CRITICAL", count: 88, percentage: 0.6 },
]

const mockModelInfo: ModelInfo = {
  accuracy: 0.9956,
  precision: 0.8912,
  recall: 0.8534,
  f1_score: 0.872,
}

// API functions
export async function predictTransaction(data: PredictionRequest): Promise<PredictionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    
    // Ensure required fields exist
    return {
      transaction_id: result.transaction_id || `txn_${Math.random().toString(36).substr(2, 9)}`,
      is_fraud: result.is_fraud ?? false,
      fraud_probability: result.fraud_probability ?? 0,
      risk_score: result.risk_score ?? 0,
      risk_level: result.risk_level ?? "LOW",
      confidence: result.confidence ?? 0,
      factors: Array.isArray(result.factors) ? result.factors : [],
      timestamp: result.timestamp ?? new Date().toISOString(),
    }
  } catch (error) {
    // Return mock data on error
    const isFraud = Math.random() > 0.5
    const riskScore = isFraud ? Math.floor(Math.random() * 30 + 70) : Math.floor(Math.random() * 30)
    let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

    if (riskScore < 25) riskLevel = "LOW"
    else if (riskScore < 50) riskLevel = "MEDIUM"
    else if (riskScore < 75) riskLevel = "HIGH"
    else riskLevel = "CRITICAL"

    return {
      transaction_id: `txn_${Math.random().toString(36).substr(2, 9)}`,
      is_fraud: isFraud,
      fraud_probability: isFraud ? Math.random() * 0.3 + 0.7 : Math.random() * 0.2,
      risk_score: riskScore,
      risk_level: riskLevel,
      confidence: Math.random() * 0.15 + 0.85,
      factors: [
        { feature: "Amount", impact: "High", value: data.amount },
        { feature: "V14", impact: "Medium", value: data.v14 || 0 },
        { feature: "V17", impact: "Low", value: data.v17 || 0 },
      ],
      timestamp: new Date().toISOString(),
    }
  }
}

export async function getTransactions(
  page = 1,
  limit = 20,
  filters?: any,
): Promise<{ transactions: Transaction[]; total: number; page: number; totalPages: number }> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      items_per_page: limit.toString(),
    })
    
    // Add optional filters
    if (filters?.riskLevel) params.append("risk_level", filters.riskLevel)
    if (filters?.isFraud !== undefined) params.append("is_fraud", filters.isFraud.toString())
    
    const response = await fetch(`${API_BASE_URL}/predict/history?${params}`)
    if (!response.ok) throw new Error("Failed to fetch history")

    const result = await response.json()
    return {
      transactions: result.data || [],
      total: result.total_items || 0,
      page: result.page || 1,
      totalPages: result.total_pages || 1,
    }
  } catch (error) {
    console.error("Error fetching transactions:", error)
    // Return mock data on error
    const start = (page - 1) * limit
    const end = start + limit
    return {
      transactions: mockTransactions.slice(start, end),
      total: mockTransactions.length,
      page,
      totalPages: Math.ceil(mockTransactions.length / limit),
    }
  }
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    const response = await fetch(`${API_BASE_URL}/predict/history/stats`)
    const stats = await response.json()
    
    // Convert stats to AnalyticsSummary format
    return {
      total_transactions: stats.total_predictions,
      fraud_detected: stats.total_fraud_detected,
      fraud_rate: stats.fraud_rate,
      total_amount_processed: 0, // Not tracked in history
      fraud_amount_blocked: 0, // Not tracked in history
      last_updated: new Date().toISOString(),
    }
  } catch (error) {
    return mockSummary
  }
}

export async function getTrends(): Promise<TrendData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/trends`)
    return await response.json()
  } catch (error) {
    return mockTrends
  }
}

export async function getRiskDistribution(): Promise<RiskDistribution[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/predict/history/stats`)
    const stats = await response.json()
    
    // Convert to RiskDistribution format
    const total = stats.total_predictions
    return [
      { risk_level: "LOW", count: stats.risk_distribution.LOW, percentage: total > 0 ? (stats.risk_distribution.LOW / total) * 100 : 0 },
      { risk_level: "MEDIUM", count: stats.risk_distribution.MEDIUM, percentage: total > 0 ? (stats.risk_distribution.MEDIUM / total) * 100 : 0 },
      { risk_level: "HIGH", count: stats.risk_distribution.HIGH, percentage: total > 0 ? (stats.risk_distribution.HIGH / total) * 100 : 0 },
      { risk_level: "CRITICAL", count: stats.risk_distribution.CRITICAL, percentage: total > 0 ? (stats.risk_distribution.CRITICAL / total) * 100 : 0 },
    ]
  } catch (error) {
    return mockRiskDistribution
  }
}

export async function getModelInfo(): Promise<ModelInfo> {
  try {
    const response = await fetch(`${API_BASE_URL}/model/info`)
    return await response.json()
  } catch (error) {
    return mockModelInfo
  }
}

export async function clearHistory(): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/predict/history`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to clear history")
    return await response.json()
  } catch (error) {
    console.error("Error clearing history:", error)
    throw error
  }
}

