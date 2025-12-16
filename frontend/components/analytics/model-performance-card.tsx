import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface ModelPerformanceCardProps {
  title: string
  value: string
  icon: LucideIcon
  colorClass?: string
}

export function ModelPerformanceCard({
  title,
  value,
  icon: Icon,
  colorClass = "text-primary",
}: ModelPerformanceCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-4xl font-bold mt-2 tabular-nums">{value}</p>
          </div>
          <div className={`rounded-full p-3 ${colorClass} bg-opacity-10`}>
            <Icon className={`h-7 w-7 ${colorClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
