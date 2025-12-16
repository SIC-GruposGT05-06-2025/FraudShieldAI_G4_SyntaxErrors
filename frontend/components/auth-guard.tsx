"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Allow auth pages without authentication
        if (pathname?.startsWith("/auth")) {
        return
        }

        // Redirect to login if not authenticated
        if (!isLoading && !user) {
        router.push("/auth/login")
        }
    }, [user, isLoading, router, pathname])

    // Show loading while checking auth
    if (isLoading) {
        return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        )
    }

    // Don't render protected content if not authenticated
    if (!user && !pathname?.startsWith("/auth")) {
        return null
    }

    return <>{children}</>
}
