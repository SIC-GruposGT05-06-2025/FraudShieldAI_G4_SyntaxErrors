"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Loader2, ChevronDown, Zap, Dices } from "lucide-react"
import type { PredictionRequest } from "@/lib/types"

interface TransactionFormProps {
  onSubmit: (data: PredictionRequest) => Promise<void>
  isLoading: boolean
}

export function TransactionForm({ onSubmit, isLoading }: TransactionFormProps) {
  const [amount, setAmount] = useState("")
  const [time, setTime] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [vFeatures, setVFeatures] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !time) {
      alert("Please fill in both Amount and Time fields")
      return
    }


    const data: PredictionRequest = {
      amount: Number.parseFloat(amount),
      time: Number.parseFloat(time),
    }

    // Add V features if provided
    for (let i = 1; i <= 28; i++) {
      const key = `v${i}` as keyof PredictionRequest
      if (vFeatures[`v${i}`]) {
        data[key] = Number.parseFloat(vFeatures[`v${i}`])
      }
    }

    await onSubmit(data)
  }

  const generateSampleData = (isFraud: boolean) => {
    if (isFraud) {
      setAmount((Math.random() * 3000 + 2000).toFixed(2))
      setTime((Math.random() * 100 + 10).toFixed(0))
    } else {
      setAmount((Math.random() * 200 + 10).toFixed(2))
      setTime((Math.random() * 5000 + 500).toFixed(0))
    }

    // Generate random V features
    const newVFeatures: Record<string, string> = {}
    for (let i = 1; i <= 28; i++) {
      newVFeatures[`v${i}`] = (Math.random() * 4 - 2).toFixed(6)
    }
    setVFeatures(newVFeatures)
    setShowAdvanced(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check Transaction for Fraud</CardTitle>
        <CardDescription>Enter transaction details to analyze fraud probability</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Transaction Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="149.99"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time Since First Transaction (seconds)</Label>
            <Input
              id="time"
              type="number"
              step="1"
              placeholder="406"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Seconds elapsed since customer&apos;s first transaction</p>
          </div>

          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" type="button" className="w-full bg-transparent">
                Advanced Features
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">These are anonymized features from PCA transformation</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-1">
                {Array.from({ length: 28 }, (_, i) => i + 1).map((num) => (
                  <div key={num} className="space-y-1">
                    <Label htmlFor={`v${num}`} className="text-xs">
                      V{num}
                    </Label>
                    <Input
                      id={`v${num}`}
                      type="number"
                      step="any"
                      placeholder="0.0"
                      value={vFeatures[`v${num}`] || ""}
                      onChange={(e) => setVFeatures({ ...vFeatures, [`v${num}`]: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="space-y-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Analyze Transaction
                </>
              )}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={() => generateSampleData(false)} disabled={isLoading}>
                <Dices className="mr-2 h-4 w-4" />
                Sample Safe
              </Button>
              <Button type="button" variant="outline" onClick={() => generateSampleData(true)} disabled={isLoading}>
                <Dices className="mr-2 h-4 w-4" />
                Sample Fraud
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
