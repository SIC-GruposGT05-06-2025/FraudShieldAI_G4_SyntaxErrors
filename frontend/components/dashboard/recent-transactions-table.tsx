"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Transaction } from "@/lib/types"
import { getRiskColor, formatCurrency, formatRelativeTime } from "@/lib/utils-risk"
import { CheckCircle2, AlertTriangle, Eye, Clock } from "lucide-react"
import Link from "next/link"

interface RecentTransactionsTableProps {
  transactions: Transaction[]
}

export function RecentTransactionsTable({ transactions }: RecentTransactionsTableProps) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Recent Transactions
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1 font-mono">Latest activity feed</p>
            </div>
            <Link href="/history">
              <Button variant="ghost" size="sm" className="text-xs font-mono">
                View All →
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No transactions available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Recent Transactions
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 font-mono">Latest activity feed</p>
          </div>
          <Link href="/history">
            <Button variant="ghost" size="sm" className="text-xs font-mono">
              View All →
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  ID
                </th>
                <th className="text-right py-3 px-4 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Risk
                </th>
                <th className="text-left py-3 px-4 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Time
                </th>
                <th className="text-right py-3 px-4 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((transaction, index) => (
                <tr
                  key={`${transaction.id}-${index}`}
                  className="border-b border-border/30 hover:bg-accent/30 transition-colors group"
                >
                  <td className="py-4 px-4">
                    <span className="font-mono text-xs text-foreground/90">{transaction.id}</span>
                  </td>
                  <td className="py-4 px-4 text-right font-semibold tabular-nums text-sm">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wide border ${getRiskColor(transaction.risk_level)}`}
                    >
                      {transaction.risk_level}
                    </span>
                  </td>
                  <td                   className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wide border ${getRiskColor(transaction.risk_level)}`}
>
                    <div className="flex items-center gap-1.5">
                      {transaction.is_fraud ? (
                        <>
                          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                          <span className="text-xs text-destructive font-medium">Fraud</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                          <span className="text-xs text-success font-medium">Safe</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs text-muted-foreground font-mono">
                    {formatRelativeTime(transaction.timestamp)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

