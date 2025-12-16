import type React from "react"
import { Shield } from "lucide-react"

export default function AuthLayout({
    children,
    }: {
    children: React.ReactNode
    }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="w-full max-w-md">
            {/* Brand Header */}
            <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
                <div className="relative">
                <Shield className="h-10 w-10 text-primary relative z-10" />
                <div className="absolute inset-0 bg-primary/30 blur-xl" />
                </div>
                <div className="flex items-baseline gap-2">
                <span className="font-bold text-3xl tracking-tight">FraudShield</span>
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">AI</span>
                </div>
            </div>
            <p className="text-sm text-muted-foreground font-mono">Secure Authentication Portal</p>
            </div>

            {children}
        </div>
        </div>
    )
}
