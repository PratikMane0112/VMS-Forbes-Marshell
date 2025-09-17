// Admin management system for frontend-only implementation
export interface ParkingSpace {
  id: string
  number: string
  type: "standard" | "handicap" | "visitor" | "reserved"
  isOccupied: boolean
  occupiedBy?: string
  occupiedAt?: Date
  location: string
  notes?: string
}

export interface SystemSettings {
  maxVisitorInvitations: number
  invitationValidityDays: number
  requireDocumentVerification: boolean
  allowWalkInVisitors: boolean
  parkingReservationEnabled: boolean
  faceRecognitionEnabled: boolean
  emailNotificationsEnabled: boolean
  maxGroupSize: number
  businessHours: {
    start: string
    end: string
    days: string[]
  }
}

export interface UserManagement {
  pendingApprovals: User[]
  allUsers: User[]
}

interface User {
  id: string
  name: string
  email: string
  role: "resident" | "receptionist" | "admin"
  status: "active" | "pending" | "suspended"
  createdAt: Date
  lastLogin?: Date
}

// Mock data
const mockParkingSpaces: ParkingSpace[] = [
  {
    id: "p-001",
    number: "P-001",
    type: "visitor",
    isOccupied: true,
    occupiedBy: "John Smith",
    occupiedAt: new Date("2024-01-15T09:30:00"),
    location: "Ground Floor - Section A",
  },
  {
    id: "p-002",
    number: "P-002",
    type: "visitor",
    isOccupied: false,
    location: "Ground Floor - Section A",
  },
  {
    id: "p-003",
    number: "P-003",
    type: "handicap",
    isOccupied: false,
    location: "Ground Floor - Near Entrance",
  },
  // Generate more parking spaces
  ...Array.from({ length: 47 }, (_, i) => ({
    id: `p-${String(i + 4).padStart(3, "0")}`,
    number: `P-${String(i + 4).padStart(3, "0")}`,
    type: "standard" as const,
    isOccupied: Math.random() > 0.6,
    occupiedBy: Math.random() > 0.6 ? undefined : `Visitor ${i + 4}`,
    occupiedAt: Math.random() > 0.6 ? undefined : new Date(),
    location: `Floor ${Math.floor(i / 10) + 1} - Section ${String.fromCharCode(65 + (i % 4))}`,
  })),
]

const mockSystemSettings: SystemSettings = {
  maxVisitorInvitations: 5,
  invitationValidityDays: 7,
  requireDocumentVerification: true,
  allowWalkInVisitors: true,
  parkingReservationEnabled: true,
  faceRecognitionEnabled: false,
  emailNotificationsEnabled: true,
  maxGroupSize: 10,
  businessHours: {
    start: "08:00",
    end: "18:00",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  },
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Resident",
    email: "resident@example.com",
    role: "resident",
    status: "active",
    createdAt: new Date("2024-01-01"),
    lastLogin: new Date("2024-01-15T08:30:00"),
  },
  {
    id: "2",
    name: "Jane Receptionist",
    email: "receptionist@example.com",
    role: "receptionist",
    status: "active",
    createdAt: new Date("2024-01-01"),
    lastLogin: new Date("2024-01-15T09:00:00"),
  },
  {
    id: "3",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    status: "active",
    createdAt: new Date("2024-01-01"),
    lastLogin: new Date("2024-01-15T07:45:00"),
  },
  {
    id: "4",
    name: "Pending Resident",
    email: "pending@example.com",
    role: "resident",
    status: "pending",
    createdAt: new Date("2024-01-14"),
  },
  {
    id: "5",
    name: "New Receptionist",
    email: "newreceptionist@example.com",
    role: "receptionist",
    status: "pending",
    createdAt: new Date("2024-01-13"),
  },
]

export const adminService = {
  // Parking Management
  async getParkingSpaces(): Promise<ParkingSpace[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockParkingSpaces
  },

  async addParkingSpace(space: Omit<ParkingSpace, "id">): Promise<ParkingSpace> {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const newSpace: ParkingSpace = {
      ...space,
      id: `p-${Date.now()}`,
    }
    mockParkingSpaces.push(newSpace)
    return newSpace
  },

  async updateParkingSpace(id: string, updates: Partial<ParkingSpace>): Promise<ParkingSpace> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const spaceIndex = mockParkingSpaces.findIndex((s) => s.id === id)
    if (spaceIndex === -1) {
      throw new Error("Parking space not found")
    }
    mockParkingSpaces[spaceIndex] = { ...mockParkingSpaces[spaceIndex], ...updates }
    return mockParkingSpaces[spaceIndex]
  },

  async deleteParkingSpace(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const spaceIndex = mockParkingSpaces.findIndex((s) => s.id === id)
    if (spaceIndex === -1) {
      throw new Error("Parking space not found")
    }
    mockParkingSpaces.splice(spaceIndex, 1)
  },

  async getParkingStats(): Promise<{
    total: number
    occupied: number
    available: number
    byType: Record<string, { total: number; occupied: number }>
  }> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const total = mockParkingSpaces.length
    const occupied = mockParkingSpaces.filter((s) => s.isOccupied).length
    const available = total - occupied

    const byType = mockParkingSpaces.reduce(
      (acc, space) => {
        if (!acc[space.type]) {
          acc[space.type] = { total: 0, occupied: 0 }
        }
        acc[space.type].total++
        if (space.isOccupied) {
          acc[space.type].occupied++
        }
        return acc
      },
      {} as Record<string, { total: number; occupied: number }>,
    )

    return { total, occupied, available, byType }
  },

  // System Settings
  async getSystemSettings(): Promise<SystemSettings> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return { ...mockSystemSettings }
  },

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    Object.assign(mockSystemSettings, settings)
    return { ...mockSystemSettings }
  },

  // User Management
  async getAllUsers(): Promise<User[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockUsers
  },

  async getPendingUsers(): Promise<User[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockUsers.filter((user) => user.status === "pending")
  },

  async approveUser(userId: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const user = mockUsers.find((u) => u.id === userId)
    if (!user) {
      throw new Error("User not found")
    }
    user.status = "active"
    return user
  },

  async rejectUser(userId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const userIndex = mockUsers.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      throw new Error("User not found")
    }
    mockUsers.splice(userIndex, 1)
  },

  async suspendUser(userId: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const user = mockUsers.find((u) => u.id === userId)
    if (!user) {
      throw new Error("User not found")
    }
    user.status = "suspended"
    return user
  },

  async deleteUser(userId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const userIndex = mockUsers.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      throw new Error("User not found")
    }
    mockUsers.splice(userIndex, 1)
  },

  // System Reports
  async generateReport(
    type: "visitors" | "invitations" | "parking" | "users",
    dateRange: { start: Date; end: Date },
  ): Promise<{ data: any[]; summary: any }> {
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock report data
    const mockData = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      value: Math.floor(Math.random() * 100),
    }))

    const summary = {
      total: mockData.length,
      average: mockData.reduce((sum, item) => sum + item.value, 0) / mockData.length,
      max: Math.max(...mockData.map((item) => item.value)),
      min: Math.min(...mockData.map((item) => item.value)),
    }

    return { data: mockData, summary }
  },
}
