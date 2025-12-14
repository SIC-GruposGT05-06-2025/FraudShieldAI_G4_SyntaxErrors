"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, Menu, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/check", label: "Check" },
  { href: "/history", label: "History" },
  { href: "/analytics", label: "Analytics" },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-14 items-center px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3 mr-8 group">
          <div className="relative">
            <Shield className="h-5 w-5 text-primary relative z-10" />
            <div className="absolute inset-0 bg-primary/20 blur-md group-hover:blur-lg transition-all" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-lg tracking-tight">FraudShield</span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">AI</span>
          </div>
        </Link>

        {/* Desktop Navigation - Tab-like style */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative px-5 py-1.5 text-[13px] font-medium tracking-wide transition-all",
                pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
              {pathname === item.href && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
              )}
            </Link>
          ))}
        </nav>

        {/* Live Status Indicator */}
        <div className="hidden md:flex items-center gap-2 mr-4">
          <Activity className="h-3.5 w-3.5 text-success animate-pulse" />
          <span className="text-xs font-mono text-muted-foreground">LIVE</span>
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden ml-auto">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <nav className="flex flex-col gap-1 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2.5 rounded text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
