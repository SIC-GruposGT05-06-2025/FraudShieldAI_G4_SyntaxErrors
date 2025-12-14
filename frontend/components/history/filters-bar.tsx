"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface FiltersBarProps {
  onFilterChange: (filters: any) => void
  filters: any
}

export function FiltersBar({ onFilterChange, filters }: FiltersBarProps) {
  const handleRiskLevelChange = (value: string) => {
    onFilterChange({ ...filters, riskLevel: value === "all" ? undefined : value })
  }

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value })
  }

  const handleClearFilters = () => {
    onFilterChange({})
  }

  const hasActiveFilters = filters.riskLevel || filters.search

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="search" className="text-sm">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by transaction ID..."
                value={filters.search || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="w-full md:w-48 space-y-2">
            <Label htmlFor="risk-level" className="text-sm">
              Risk Level
            </Label>
            <Select value={filters.riskLevel || "all"} onValueChange={handleRiskLevelChange}>
              <SelectTrigger id="risk-level">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
            <Button variant="outline" className="md:hidden bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
