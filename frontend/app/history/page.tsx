"use client"

import { useState, useEffect } from "react"
import { FiltersBar } from "@/components/history/filters-bar"
import { TransactionsTable } from "@/components/history/transactions-table"
import { Pagination } from "@/components/history/pagination"
import { getTransactions, clearHistory } from "@/lib/api"
import type { Transaction } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [filters, setFilters] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isClearingHistory, setIsClearingHistory] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true)
      try {
        const response = await getTransactions(currentPage, itemsPerPage, filters)
        setTransactions(response.data)
        setTotalPages(response.totalPages)
        setTotalItems(response.total)
      } catch (error) {
        console.error("Error fetching transactions:", error)
        setTransactions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [currentPage, itemsPerPage, filters])

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items)
    setCurrentPage(1) // Reset to first page when items per page changes
  }

  const handleClearHistory = async () => {
    setIsClearingHistory(true)
    try {
      await clearHistory()
      setTransactions([])
      setTotalItems(0)
      setTotalPages(1)
      setCurrentPage(1)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error clearing history:", error)
    } finally {
      setIsClearingHistory(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Transaction History</h1>
          <p className="text-muted-foreground mt-2">
            Browse and search all analyzed transactions ({totalItems} total)
          </p>
        </div>
        {totalItems > 0 && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" disabled={isClearingHistory}>
                Clear History
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear History</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete all {totalItems} transactions from history? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isClearingHistory}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleClearHistory}
                  disabled={isClearingHistory}
                >
                  {isClearingHistory ? "Clearing..." : "Clear All"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-6">
        <FiltersBar filters={filters} onFilterChange={handleFilterChange} />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading transactions...</div>
          </div>
        ) : totalItems === 0 ? (
          <div className="flex items-center justify-center py-12 border border-dashed rounded-lg">
            <div className="text-center">
              <p className="text-muted-foreground text-lg mb-2">No transactions found</p>
              <p className="text-sm text-muted-foreground">
                Run fraud detection predictions to see them appear here
              </p>
            </div>
          </div>
        ) : (
          <>
            <TransactionsTable transactions={transactions} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </div>
    </div>
  )
}

