"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Transaction } from "@/lib/types"
import { getRiskColor, formatCurrency, formatRelativeTime } from "@/lib/utils-risk"
import { CheckCircle2, AlertTriangle, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface TransactionsTableProps {
  transactions: Transaction[]
}

type SortField = "id" | "amount" | "risk_score" | "timestamp"
type SortDirection = "asc" | "desc"

function parsePossibleNumber(raw: any): number | null {
  if (raw === undefined || raw === null || raw === "") return null

  if (typeof raw === "number") {
    return Number.isFinite(raw) ? raw : null
  }

  if (typeof raw === "string") {
    // limpiar espacios
    let s = raw.trim()

    // caso: "-1,234.56" o "1,234.56" -> eliminar separador de miles
    // si contiene '.' y ',', asumimos '.' decimal y ',' miles (ej. "1,234.56")
    if (s.includes(",") && s.includes(".")) {
      s = s.replace(/,/g, "")
      const n = Number(s)
      return Number.isFinite(n) ? n : null
    }

    // si contiene solo ',' y no '.', asumimos coma decimal (ej "1234,56" -> "1234.56")
    if (s.includes(",") && !s.includes(".")) {
      s = s.replace(/\./g, "") // quitar posibles miles con '.'
      s = s.replace(/,/g, ".")
      const n = Number(s)
      return Number.isFinite(n) ? n : null
    }

    // limpiar símbolos de moneda como $ ¢ £ Q, % etc.
    const cleaned = s.replace(/[^0-9.-]+/g, "")
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : null
  }

  // si viene como objeto { value, amount, cents, units }
  if (typeof raw === "object") {
    // prioridad: value -> amount -> cents -> price
    if (raw.value !== undefined) {
      const n = parsePossibleNumber(raw.value)
      if (n !== null) return n
    }
    if (raw.amount !== undefined) {
      const n = parsePossibleNumber(raw.amount)
      if (n !== null) return n
    }
    if (raw.cents !== undefined) {
      const n = parsePossibleNumber(raw.cents)
      if (n !== null) return n
    }
    if (raw.price !== undefined) {
      const n = parsePossibleNumber(raw.price)
      if (n !== null) return n
    }
    return null
  }

  // fallback
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-muted-foreground text-center">No transactions available</p>
        </CardContent>
      </Card>
    )
  }

  // ---------- NORMALIZACIÓN ROBUSTA (dos pasos) ----------
  // 1) extraemos un candidateAmount por item (sin asumir si son cents o no)
  const withCandidates = transactions.map((t, i) => {
    const id = (t as any).transaction_id ?? (t as any).id ?? `transaction-${i}`
    const timestamp = (t as any).timestamp ?? (t as any).time ?? new Date().toISOString()

    // posibles campos alternativos pra amount
const rawCandidates = [
  (t as any).amount,
  (t as any).amt,
  (t as any).amount_usd,
  (t as any).amount_cents,
  (t as any).value,
  (t as any).price,
  (t as any).amount_value,
  (t as any).data?.amount,
  (t as any).data?.value,
  (t as any).transaction_amount,
  (t as any).transaction?.amount,
  // NUEVO: buscar en factors array
  (() => {
    const factors = (t as any).factors
    if (Array.isArray(factors)) {
      const amountFactor = factors.find((f: any) => 
        f?.feature?.toLowerCase() === "amount" || 
        f?.name?.toLowerCase() === "amount"
      )
      return amountFactor?.value
    }
    return null
  })(),
]

    // intentar parsear cada candidato
    let candidate: number | null = null
    for (const c of rawCandidates) {
      const n = parsePossibleNumber(c)
      if (n !== null) {
        candidate = n
        break
      }
    }

    // risk_score y confidence
    const riskScoreRaw = (t as any).risk_score ?? (t as any).risk_level ?? 0
    const risk_score = (() => {
      const n = Number(riskScoreRaw)
      return Number.isFinite(n) ? n : 0
    })()

    const confidenceRaw = (t as any).confidence ?? 0
    const confidence = (() => {
      const n = Number(confidenceRaw)
      return Number.isFinite(n) ? n : 0
    })()

    return {
      original: t,
      id,
      transaction_id: (t as any).transaction_id ?? (t as any).id ?? id,
      timestamp,
      candidateAmount: candidate, // puede ser null
      risk_score,
      confidence,
    } as any
  })

  // DEBUG: ver las primeras 10 entradas para entender qué te llega
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.log("__TRANSACTIONS_DEBUG_SAMPLE__", withCandidates.slice(0, 10))
  }

  // 2) decidir si los candidateAmount están en cents (enteros grandes)
  const numericCandidates = withCandidates.map((w) => w.candidateAmount).filter((v) => typeof v === "number") as number[]
  let divisor = 1
  if (numericCandidates.length > 0) {
    const max = Math.max(...numericCandidates)
    const median = numericCandidates.sort((a, b) => a - b)[Math.floor(numericCandidates.length / 2)]
    // heurística: si todos son enteros y max muy grande (ej > 10000) o mediana > 1000 -> probablemente cents
    const allIntegers = numericCandidates.every((n) => Math.abs(n - Math.round(n)) < 1e-9)
    if (allIntegers && (max > 10000 || median > 1000)) {
      divisor = 100
    }
  }

  // 3) construir normalizedTransactions finales
  const normalizedTransactions = withCandidates.map((w) => {
    const rawAmount = w.candidateAmount
    const amount = rawAmount === null ? 0 : Number(rawAmount) / divisor
    const t = w.original as any

    return {
      ...t,
      id: w.id,
      transaction_id: w.transaction_id,
      timestamp: w.timestamp,
      amount,
      risk_score: w.risk_score,
      confidence: w.confidence,
    } as Transaction
  })

  const [sortField, setSortField] = useState<SortField>("timestamp")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showVFeatures, setShowVFeatures] = useState(false)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedTransactions = useMemo(() => {
    return [...normalizedTransactions].sort((a, b) => {
      let aVal: any = (a as any)[sortField]
      let bVal: any = (b as any)[sortField]

      if (sortField === "timestamp") {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (typeof aVal === "string" && !Number.isFinite(Number(aVal))) aVal = aVal.toLowerCase()
      if (typeof bVal === "string" && !Number.isFinite(Number(bVal))) bVal = bVal.toLowerCase()

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
      }
    })
  }, [normalizedTransactions, sortField, sortDirection])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort("id")}
                    >
                      ID
                      <SortIcon field="id" />
                    </Button>
                  </th>
                  <th className="text-right py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort("amount")}
                    >
                      Amount
                      <SortIcon field="amount" />
                    </Button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort("risk_score")}
                    >
                      Risk
                      <SortIcon field="risk_score" />
                    </Button>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort("timestamp")}
                    >
                      Time
                      <SortIcon field="timestamp" />
                    </Button>
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((transaction, index) => (
                  <tr
                    key={(transaction as any).transaction_id ?? transaction.id ?? `transaction-${index}-${transaction.timestamp}`}
                    className={`border-b border-border hover:bg-muted/50 transition-colors cursor-pointer ${
                      index % 2 === 0 ? "bg-muted/20" : ""
                    }`}
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm">{(transaction as any).transaction_id ?? transaction.id}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums">
                      {formatCurrency(Number(transaction.amount ?? 0))}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getRiskColor(
                          (transaction as any).risk_level
                        )}`}
                      >
                        {Number.isFinite((transaction as any).risk_score) ? (transaction as any).risk_score : "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {(transaction as any).is_fraud ? (
                          <>
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span className="text-sm text-destructive font-medium">Fraud</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            <span className="text-sm text-success font-medium">Safe</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {formatRelativeTime(transaction.timestamp)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTransaction(transaction)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>{selectedTransaction?.id}</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-lg font-semibold tabular-nums">{formatCurrency(Number(selectedTransaction.amount ?? 0))}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {Number.isFinite((selectedTransaction as any).risk_score) ? `${(selectedTransaction as any).risk_score}/100` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getRiskColor(
                      (selectedTransaction as any).risk_level
                    )}`}
                  >
                    {(selectedTransaction as any).risk_level ?? "N/A"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-1 mt-1">
                    {(selectedTransaction as any).is_fraud ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-sm text-destructive font-medium">Fraud</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm text-success font-medium">Safe</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {Number.isFinite((selectedTransaction as any).confidence)
                      ? `${((selectedTransaction as any).confidence * 100).toFixed(1)}%`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="text-sm">{(selectedTransaction as any).time ?? "N/A"}s</p>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p className="text-sm font-mono">{new Date(selectedTransaction.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <Collapsible open={showVFeatures} onOpenChange={setShowVFeatures}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent">
                    {showVFeatures ? "Hide" : "Show"} PCA Features (V1-V28)
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-md max-h-64 overflow-y-auto">
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((num) => {
                      const key = (`v${num}`) as keyof Transaction
                      const rawValue = (selectedTransaction as any)[key]
                      const isNumber = typeof rawValue === "number" && Number.isFinite(rawValue)
                      return (
                        <div key={`v-${num}`} className="space-y-1">
                          <p className="text-xs text-muted-foreground font-mono">V{num}</p>
                          <p className="text-sm font-mono tabular-nums">
                            {isNumber ? (rawValue as number).toFixed(6) : (rawValue ?? "N/A")}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
