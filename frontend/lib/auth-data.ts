export interface User {
    id: string
    email: string
    password: string
    name: string
    role: "admin" | "analyst"
    createdAt: string
    }

    // Hardcoded users for demo
    export const MOCK_USERS: User[] = [
    {
        id: "1",
        email: "admin@fraudshield.com",
        password: "admin123",
        name: "Admin User",
        role: "admin",
        createdAt: "2024-01-01",
    },
    {
        id: "2",
        email: "analyst@fraudshield.com",
        password: "analyst123",
        name: "Security Analyst",
        role: "analyst",
        createdAt: "2024-01-15",
    },
    {
        id: "3",
        email: "demo@fraudshield.com",
        password: "demo123",
        name: "Demo User",
        role: "analyst",
        createdAt: "2024-02-01",
    },
    ]

    // Auth response type
    export interface AuthResponse {
    success: boolean
    user?: Omit<User, "password">
    token?: string
    message?: string
    }

    // Mock login function - Replace with API call
    export async function mockLogin(email: string, password: string): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const user = MOCK_USERS.find((u) => u.email === email && u.password === password)

    if (!user) {
        return {
        success: false,
        message: "Invalid email or password",
        }
    }

    const { password: _, ...userWithoutPassword } = user

    return {
        success: true,
        user: userWithoutPassword,
        token: `mock_token_${user.id}_${Date.now()}`,
    }
    }

    // Mock signup function - Replace with API call
    export async function mockSignup(email: string, password: string, name: string): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Check if user already exists
    const existingUser = MOCK_USERS.find((u) => u.email === email)
    if (existingUser) {
        return {
        success: false,
        message: "Email already registered",
        }
    }

    // Create new user
    const newUser: User = {
        id: `${MOCK_USERS.length + 1}`,
        email,
        password,
        name,
        role: "analyst",
        createdAt: new Date().toISOString(),
    }

    MOCK_USERS.push(newUser)

    const { password: _, ...userWithoutPassword } = newUser

    return {
        success: true,
        user: userWithoutPassword,
        token: `mock_token_${newUser.id}_${Date.now()}`,
    }
}
