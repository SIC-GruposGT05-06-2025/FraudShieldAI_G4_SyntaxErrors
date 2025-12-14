"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { RiskDistribution } from "@/lib/types"
import { ShieldAlert } from "lucide-react"

interface RiskPieChartProps {
  data: RiskDistribution[]
}

const RISK_COLORS = {
  CRITICAL: "#dc2626", // red-600
  HIGH: "#f97316", // orange-500
  MEDIUM: "#eab308", // yellow-500
  LOW: "#22c55e", // green-500
}

export function RiskPieChart({ data }: RiskPieChartProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-warning" />
            Risk Distribution
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1 font-mono">Current status</p>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No data available</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((item) => ({
    name: item.risk_level,
    value: item.count,
    percentage: item.percentage,
  }))

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-warning" />
          Risk Distribution
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1 font-mono">Current status</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              label={(entry) => `${entry.percentage}%`}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={RISK_COLORS[entry.name as keyof typeof RISK_COLORS]}
                  strokeWidth={2}
                  stroke="hsl(var(--background))"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
