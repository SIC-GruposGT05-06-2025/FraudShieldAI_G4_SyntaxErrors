import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRiskColor(riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"): string {
  switch (riskLevel) {
    case "LOW":
      return "text-success bg-success/10 border-success/20"
    case "MEDIUM":
      return "text-warning bg-warning/10 border-warning/20"
    case "HIGH":
      return "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-900"
    case "CRITICAL":
      return "text-destructive bg-destructive/10 border-destructive/20"
    default:
      return "text-muted-foreground bg-muted border-border"
  }
}

export function getRiskColorValue(riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"): string {
  switch (riskLevel) {
    case "LOW":
      return "#10B981"
    case "MEDIUM":
      return "#F59E0B"
    case "HIGH":
      return "#FB923C"
    case "CRITICAL":
      return "#EF4444"
    default:
      return "#6B7280"
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const past = new Date(timestamp)
  const diffMs = now.getTime() - past.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return `${diffSecs}s ago`
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`
}
