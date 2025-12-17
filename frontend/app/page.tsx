"use client"

import { useState, useEffect } from "react"
import { Activity, AlertTriangle, TrendingUp, DollarSign, Shield, Zap } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { TrendChart } from "@/components/dashboard/trend-chart"
import { RiskPieChart } from "@/components/dashboard/risk-pie-chart"
import { RecentTransactionsTable } from "@/components/dashboard/recent-transactions-table"
import { getAnalyticsSummary, getTrends, getRiskDistribution, getTransactions } from "@/lib/api"
import { formatCurrency } from "@/lib/utils-risk"
import type { AnalyticsSummary, TrendData, RiskDistribution } from "@/lib/types"

export default function DashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [trends, setTrends] = useState<TrendData[]>([])
  const [riskDist, setRiskDist] = useState<RiskDistribution[]>([])
  const [transactionsData, setTransactionsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryData, trendsData, riskDistData, txData] = await Promise.all([
          getAnalyticsSummary(),
          getTrends(),
          getRiskDistribution(),
          getTransactions(1, 20),
        ])
        console.log('Dashboard data:', { summaryData, trendsData, riskDistData, txData })
        setSummary(summaryData)
        
        setTrends(Array.isArray(trendsData) ? trendsData : trendsData?.data ?? [])
        if (Array.isArray(riskDistData)) {
          setRiskDist(riskDistData)
        } else if (Array.isArray(riskDistData?.data)) {
          setRiskDist(riskDistData.data)
        } else if (riskDistData?.risk_distribution) {
          // convert from counting object to array
          const rd = riskDistData.risk_distribution
          const total = Object.values(rd).reduce((s: number, v: any) => s + (Number(v) || 0), 0)
          setRiskDist([
            { risk_level: "LOW", count: rd.LOW || 0, percentage: total > 0 ? ((rd.LOW || 0) / total) * 100 : 0 },
            { risk_level: "MEDIUM", count: rd.MEDIUM || 0, percentage: total > 0 ? ((rd.MEDIUM || 0) / total) * 100 : 0 },
            { risk_level: "HIGH", count: rd.HIGH || 0, percentage: total > 0 ? ((rd.HIGH || 0) / total) * 100 : 0 },
            { risk_level: "CRITICAL", count: rd.CRITICAL || 0, percentage: total > 0 ? ((rd.CRITICAL || 0) / total) * 100 : 0 },
          ])
        } else {
          setRiskDist([])
        }

        // transactions: accept either the wrapper or direct array
        if (txData?.transactions) setTransactionsData(txData)
        else if (Array.isArray(txData)) setTransactionsData({ transactions: txData, total: txData.length, page: 1, totalPages: 1 })
        else setTransactionsData(null)
      } catch (error) {
        console.error("Error loading dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-6 md:py-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-6 md:py-10">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-6 md:py-10">
      {/* Hero Header Section */}
      <div className="mb-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <Shield className="h-8 w-8 text-primary relative z-10" />
                <div className="absolute inset-0 bg-primary/30 blur-lg" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Command Center</h1>
            </div>
            <p className="text-muted-foreground text-sm md:text-base font-mono">
              Real-time fraud detection / Powered by AI
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-success/30 bg-success/5">
            <Zap className="h-3.5 w-3.5 text-success" />
            <span className="text-xs font-mono text-success font-medium">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Asymmetric Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6 mb-8">
        <div className="md:col-span-2">
            <StatsCard
              title="Total Transactions"
              value={summary?.total_transactions?.toLocaleString() ?? "0"}
              icon={Activity}
              colorClass="text-primary"
            />
        </div>
        <div className="md:col-span-2">
          <StatsCard
            title="Fraud Detected"
            value={summary?.fraud_detected?.toLocaleString() ?? "0"}
            icon={AlertTriangle}
            colorClass="text-destructive"
          />
        </div>
        <div className="md:col-span-2">
          <StatsCard
            title="Fraud Rate"
            value={`${(((summary?.fraud_detected || 0) / (summary?.total_transactions || 1)) * 100).toFixed(2)}%`}
            icon={TrendingUp}
            colorClass="text-warning"
          />
        </div>
      </div>

      {/* Charts Row - Asymmetric layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-3">
          <TrendChart data={trends} />
        </div>
        <div className="lg:col-span-2">
          <RiskPieChart data={riskDist} />
        </div>
      </div>

      {/* Recent Transactions */}
      <RecentTransactionsTable transactions={transactionsData?.transactions || []} />
    </div>
  )
}
