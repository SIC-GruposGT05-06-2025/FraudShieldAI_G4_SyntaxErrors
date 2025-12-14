import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  colorClass?: string
}

export function StatsCard({ title, value, icon: Icon, trend, colorClass = "text-primary" }: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-border transition-all group">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{title}</p>
            <div className={`relative rounded-lg p-2 bg-background/50 border border-border/30`}>
              <Icon className={`h-4 w-4 ${colorClass}`} />
              <div
                className={`absolute inset-0 ${colorClass} opacity-20 blur-md group-hover:opacity-30 transition-opacity`}
              />
            </div>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold tabular-nums tracking-tight">{value}</p>
            {trend && <p className="text-xs text-muted-foreground mt-2 font-mono">{trend}</p>}
          </div>
        </div>
      </CardContent>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Card>
  )
}
