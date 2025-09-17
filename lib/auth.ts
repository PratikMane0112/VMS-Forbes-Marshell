// Mock authentication system for frontend-only implementation
export type UserRole = "resident" | "receptionist" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  verified: boolean
  createdAt: Date
}

export interface AuthState {
  user: User | null
  isLoading: boolean
}

// Mock user data
const mockUsers: User[] = [
  {
    id: "1",
    email: "resident@example.com",
    name: "John Resident",
    role: "resident",
    verified: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "receptionist@example.com",
    name: "Jane Receptionist",
    role: "receptionist",
    verified: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    verified: true,
    createdAt: new Date("2024-01-01"),
  },
]

// Mock authentication functions
export const authService = {
  async login(email: string, password: string): Promise<User> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = mockUsers.find((u) => u.email === email)
    if (!user) {
      throw new Error("Invalid credentials")
    }

    // Store in localStorage for persistence
    localStorage.setItem("currentUser", JSON.stringify(user))
    return user
  },

  async register(email: string, password: string, name: string, role: UserRole): Promise<User> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    if (mockUsers.find((u) => u.email === email)) {
      throw new Error("User already exists")
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
      verified: false, // Requires verification
      createdAt: new Date(),
    }

    mockUsers.push(newUser)
    return newUser
  },

  async logout(): Promise<void> {
    localStorage.removeItem("currentUser")
  },

  getCurrentUser(): User | null {
    const stored = localStorage.getItem("currentUser")
    return stored ? JSON.parse(stored) : null
  },

  async verifyEmail(userId: string): Promise<void> {
    // Simulate email verification
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const user = mockUsers.find((u) => u.id === userId)
    if (user) {
      user.verified = true
    }
  },
}
