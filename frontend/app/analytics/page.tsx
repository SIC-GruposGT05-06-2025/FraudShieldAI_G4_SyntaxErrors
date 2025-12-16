"use client"

import { useState, useEffect } from "react"
import { BarChart3, CheckCircle, Eye } from "lucide-react"
import { ModelPerformanceCard } from "@/components/analytics/model-performance-card"
import { FraudTrendsChart } from "@/components/analytics/fraud-trends-chart"
import { RiskPieChart } from "@/components/dashboard/risk-pie-chart"
import { FactorsChart } from "@/components/analytics/factors-chart"
import { ConfusionMatrix } from "@/components/analytics/confusion-matrix"
import { getModelInfo, getTrends, getRiskDistribution } from "@/lib/api"
import type { ModelInfo, TrendData, RiskDistribution } from "@/lib/types"

export default function AnalyticsPage() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [trends, setTrends] = useState<TrendData[]>([])
  const [riskDist, setRiskDist] = useState<RiskDistribution[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [modelData, trendsData, riskData] = await Promise.all([
          getModelInfo(),
          getTrends(),
          getRiskDistribution(),
        ])
        setModelInfo(modelData)
        setTrends(trendsData)
        setRiskDist(riskData)
      } catch (error) {
        console.error("Error loading analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!modelInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-linear-to-br from-background to-muted/10 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance">Analytics</h1>
        <p className="text-muted-foreground mt-2">Deep insights into model performance and fraud patterns</p>
      </div>

      {/* Model Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ModelPerformanceCard
          title="Model Accuracy"
          value={`${(modelInfo.accuracy * 100).toFixed(2)}%`}
          icon={BarChart3}
          colorClass="text-primary"
        />
        <ModelPerformanceCard
          title="Fraud Precision"
          value={`${(modelInfo.precision * 100).toFixed(2)}%`}
          icon={CheckCircle}
          colorClass="text-success"
        />
      </div>



      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <FactorsChart />
        <ConfusionMatrix />
      </div>
    </div>
  )
}
