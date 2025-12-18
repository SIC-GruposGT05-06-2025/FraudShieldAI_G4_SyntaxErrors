"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { User } from "./auth-data.ts"
import { mockLogin, mockSignup } from "./auth-data"

interface AuthContextType {
    user: Omit<User, "password"> | null
    token: string | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
    signup: (email: string, password: string, name: string) => Promise<{ success: boolean; message?: string }>
    logout: () => void
    faceLogin: () => Promise<{ success: boolean; message?: string }>
    }

    const AuthContext = createContext<AuthContextType | undefined>(undefined)

    export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Omit<User, "password"> | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("fraudshield_user")
        const storedToken = localStorage.getItem("fraudshield_token")

        if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser))
        setToken(storedToken)
        }

        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string) => {
        setIsLoading(true)
        const response = await mockLogin(email, password)

        if (response.success && response.user && response.token) {
        setUser(response.user)
        setToken(response.token)
        localStorage.setItem("fraudshield_user", JSON.stringify(response.user))
        localStorage.setItem("fraudshield_token", response.token)
        setIsLoading(false)
        router.push("/")
        return { success: true }
        }

        setIsLoading(false)
        return { success: false, message: response.message }
    }

    const signup = async (email: string, password: string, name: string) => {
        setIsLoading(true)
        const response = await mockSignup(email, password, name)

        if (response.success && response.user && response.token) {
        setUser(response.user)
        setToken(response.token)
        localStorage.setItem("fraudshield_user", JSON.stringify(response.user))
        localStorage.setItem("fraudshield_token", response.token)
        setIsLoading(false)
        router.push("/")
        return { success: true }
        }

        setIsLoading(false)
        return { success: false, message: response.message }
    }

    const faceLogin = async () => {
        setIsLoading(true)
        // Mock response for demo purposes (in real app, call backend with face descriptor)
        const response = {
            success: true,
            user: { id: "face-1", email: "face@example.com", name: "Face User" } as Omit<User, "password">,
            token: "mock-face-token"
        }

        if (response.success && response.user && response.token) {
            setUser(response.user)
            setToken(response.token)
            localStorage.setItem("fraudshield_user", JSON.stringify(response.user))
            localStorage.setItem("fraudshield_token", response.token)
            setIsLoading(false)
            router.push("/")
            return { success: true }
        }

        setIsLoading(false)
        return { success: false, message: "Face login failed" }
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem("fraudshield_user")
        localStorage.removeItem("fraudshield_token")
        router.push("/auth/login")
    }

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, faceLogin }}>{children}</AuthContext.Provider>
    )
    }

    export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
    }