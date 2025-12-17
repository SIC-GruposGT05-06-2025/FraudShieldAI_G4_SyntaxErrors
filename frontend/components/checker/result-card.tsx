"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle2, Eye } from "lucide-react"
import type { PredictionResponse } from "@/lib/types"
import { RiskGauge } from "./risk-gauge"
import { getRiskColor } from "@/lib/utils-risk"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

function formatRiskScore(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "0"

  // Project spec: `risk_score` is 0-100. If a fractional value <= 1 is provided,
  // assume it's a 0-1 probability and convert to percentage. Then clamp to [0,100].
  let percent = value
  if (percent <= 1) percent = percent * 100

  if (!Number.isFinite(percent)) return "0"
  if (percent < 0) percent = 0
  if (percent > 100) percent = 100

  return percent.toFixed(2)
}

interface ResultCardProps {
  result: PredictionResponse
  onCheckAnother: () => void
}

export function ResultCard({ result, onCheckAnother }: ResultCardProps) {
  const [showDetailModal, setShowDetailModal] = useState(false)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Analysis Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <RiskGauge riskScore={result.fraud_probability} riskLevel={result.risk_level} />

            <div className="flex-1 space-y-4">
              <div className="text-center md:text-left">
                {result.is_fraud ? (
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                    <h3 className="text-2xl font-bold text-destructive">FRAUD DETECTED</h3>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                    <h3 className="text-2xl font-bold text-success">SAFE TRANSACTION</h3>
                  </div>
                )}
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border mt-2 ${getRiskColor(result.risk_level)}`}
                >
                  {result.risk_level} RISK
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-semibold tabular-nums">{(result.confidence * 100).toFixed(1)}%</span>
                </div>
                <Progress value={result.confidence * 100} className="h-2" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Key Risk Factors</h4>
            <div className="space-y-2">
              {Array.isArray(result.factors) && result.factors.length > 0 ? (
                result.factors.slice(0, 5).map((factor, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        factor.impact === "High"
                          ? "bg-destructive"
                          : factor.impact === "Medium"
                            ? "bg-warning"
                            : "bg-muted-foreground"
                      }`}
                    />
                    <span className="flex-1">{factor.feature}</span>
                    <span className="text-muted-foreground">{factor.impact} impact</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No risk factors available</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowDetailModal(true)}>
              <Eye className="mr-2 h-4 w-4" />
              View Full Report
            </Button>
            <Button variant="default" className="flex-1" onClick={onCheckAnother}>
              Check Another
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Full Transaction Report</DialogTitle>
            <DialogDescription>Transaction ID: {result.transaction_id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Fraud Probability</p>
                <p className="text-lg font-semibold tabular-nums">{result.fraud_probability ? (result.fraud_probability * 100).toFixed(2) : "0"}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className="text-lg font-semibold tabular-nums">{formatRiskScore(result.risk_score)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-lg font-semibold tabular-nums">{result.confidence ? (result.confidence * 100).toFixed(2) : "0"}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Timestamp</p>
                <p className="text-sm font-mono">{result.timestamp ? new Date(result.timestamp).toLocaleString() : "N/A"}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">All Risk Factors</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Array.isArray(result.factors) && result.factors.length > 0 ? (
                  result.factors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                      <span className="text-sm font-medium">{factor.feature}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground tabular-nums">{factor.value.toFixed(6)}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            factor.impact === "High"
                              ? "bg-destructive/20 text-destructive"
                              : factor.impact === "Medium"
                                ? "bg-warning/20 text-warning"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {factor.impact}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No risk factors available</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
