"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface FactorsChartProps {
  data?: Array<{ feature: string; importance: number }>
}

const mockFactorsData = [
  { feature: "V14", importance: 0.89 },
  { feature: "V17", importance: 0.78 },
  { feature: "V12", importance: 0.72 },
  { feature: "Amount", importance: 0.68 },
  { feature: "V10", importance: 0.61 },
  { feature: "V16", importance: 0.58 },
  { feature: "V3", importance: 0.52 },
  { feature: "V7", importance: 0.47 },
  { feature: "V11", importance: 0.43 },
  { feature: "Time", importance: 0.39 },
]

export function FactorsChart({ data = mockFactorsData }: FactorsChartProps) {
  if (!Array.isArray(data) || data.length === 0) {
    data = mockFactorsData
  }

  const getColor = (importance: number) => {
    if (importance > 0.7) return "#ef4444" // Red for high importance
    if (importance > 0.5) return "#f97316" // Orange for medium
    return "#06b6d4" // Cyan for low
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Most Influential Risk Factors</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" domain={[0, 1]} className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis
              dataKey="feature"
              type="category"
              width={80}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, "Importance"]}
            />
            <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.importance)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
