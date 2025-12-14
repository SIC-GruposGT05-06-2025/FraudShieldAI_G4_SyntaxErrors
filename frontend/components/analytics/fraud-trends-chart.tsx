"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { TrendData } from "@/lib/types"

interface FraudTrendsChartProps {
  data: TrendData[]
}

export function FraudTrendsChart({ data }: FraudTrendsChartProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Fraud Detection Trends (7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No data available</p>
        </CardContent>
      </Card>
    )
  }

  const formattedData = data.map((item) => ({
    time: new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    Total: item.total_transactions,
    Fraud: item.fraud_detected,
    Rate: item.fraud_rate.toFixed(2),
  }))

  const chartColors = {
    total: "#06b6d4", // cyan-500
    fraud: "#ef4444", // red-500
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Fraud Detection Trends (7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.total} stopOpacity={0.4} />
                <stop offset="95%" stopColor={chartColors.total} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.fraud} stopOpacity={0.4} />
                <stop offset="95%" stopColor={chartColors.fraud} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="time" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="Total"
              stroke={chartColors.total}
              fillOpacity={1}
              fill="url(#colorTotal)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="Fraud"
              stroke={chartColors.fraud}
              fillOpacity={1}
              fill="url(#colorFraud)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
