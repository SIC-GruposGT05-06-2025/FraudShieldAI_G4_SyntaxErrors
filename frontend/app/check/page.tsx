"use client"

import { useState } from "react"
import { TransactionForm } from "@/components/checker/transaction-form"
import { ResultCard } from "@/components/checker/result-card"
import type { PredictionRequest, PredictionResponse } from "@/lib/types"
import { predictTransaction } from "@/lib/api"

export default function CheckPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PredictionResponse | null>(null)

  const handleSubmit = async (data: PredictionRequest) => {
    setIsLoading(true)
    try {
      const response = await predictTransaction(data)
      setResult(response)
    } catch (error) {
      console.error("Error predicting transaction:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckAnother = () => {
    setResult(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance">Transaction Checker</h1>
        <p className="text-muted-foreground mt-2">Analyze transactions in real-time for fraud detection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <TransactionForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
        <div>{result && <ResultCard result={result} onCheckAnother={handleCheckAnother} />}</div>
      </div>
    </div>
  )
}
