"use client"

import { getRiskColorValue } from "@/lib/utils-risk"

interface RiskGaugeProps {
  riskScore: number
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
}

export function RiskGauge({ riskScore, riskLevel }: RiskGaugeProps) {
  const color = getRiskColorValue(riskLevel)
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (riskScore / 100) * circumference

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="transform -rotate-90" width="200" height="200">
        {/* Background circle */}
        <circle cx="100" cy="100" r={radius} stroke="hsl(var(--muted))" strokeWidth="12" fill="none" />
        {/* Progress circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums" style={{ color }}>
          {riskScore}%
        </span>
        <span className="text-sm text-muted-foreground mt-1">Risk Score</span>
      </div>
    </div>
  )
}
