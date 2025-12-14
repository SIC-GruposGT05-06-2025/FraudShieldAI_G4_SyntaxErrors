"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const mockConfusionData = {
  truePositive: 1247,
  trueNegative: 14156,
  falsePositive: 78,
  falseNegative: 142,
}

export function ConfusionMatrix() {
  const total =
    mockConfusionData.truePositive +
    mockConfusionData.trueNegative +
    mockConfusionData.falsePositive +
    mockConfusionData.falseNegative

  const getPercentage = (value: number) => ((value / total) * 100).toFixed(2)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Confusion Matrix</CardTitle>
        <CardDescription>Model prediction accuracy breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {/* Header row */}
          <div></div>
          <div className="text-center text-sm font-medium text-muted-foreground py-2">Predicted Safe</div>
          <div className="text-center text-sm font-medium text-muted-foreground py-2">Predicted Fraud</div>

          {/* True Safe row */}
          <div className="text-sm font-medium text-muted-foreground flex items-center">Actual Safe</div>
          <div className="bg-success/10 border-2 border-success rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success tabular-nums">
              {mockConfusionData.trueNegative.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{getPercentage(mockConfusionData.trueNegative)}%</div>
            <div className="text-xs font-medium text-success mt-1">True Negative</div>
          </div>
          <div className="bg-destructive/10 border-2 border-destructive/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-destructive tabular-nums">
              {mockConfusionData.falsePositive.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{getPercentage(mockConfusionData.falsePositive)}%</div>
            <div className="text-xs font-medium text-destructive mt-1">False Positive</div>
          </div>

          {/* True Fraud row */}
          <div className="text-sm font-medium text-muted-foreground flex items-center">Actual Fraud</div>
          <div className="bg-warning/10 border-2 border-warning/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-warning tabular-nums">
              {mockConfusionData.falseNegative.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{getPercentage(mockConfusionData.falseNegative)}%</div>
            <div className="text-xs font-medium text-warning mt-1">False Negative</div>
          </div>
          <div className="bg-success/10 border-2 border-success rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success tabular-nums">
              {mockConfusionData.truePositive.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{getPercentage(mockConfusionData.truePositive)}%</div>
            <div className="text-xs font-medium text-success mt-1">True Positive</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted/30 rounded-md">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">True Positive:</span> Correctly identified fraud |
            <span className="font-semibold"> True Negative:</span> Correctly identified safe |
            <span className="font-semibold"> False Positive:</span> Safe flagged as fraud |
            <span className="font-semibold"> False Negative:</span> Fraud missed
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
