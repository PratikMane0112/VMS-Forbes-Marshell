// Visitor check-in/out management system for frontend-only implementation
export interface Visitor {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  purpose: string
  hostName: string
  hostId?: string
  invitationId?: string
  hasInvitation: boolean
  checkInTime: Date
  checkOutTime?: Date
  status: "checked-in" | "checked-out" | "waiting"
  trayNumber?: string
  notes?: string
  groupSize: number
  documentVerified: boolean
  parkingSpot?: string
  createdAt: Date
  updatedAt: Date
}

export interface TrayInfo {
  number: string
  isAvailable: boolean
  assignedTo?: string
  assignedAt?: Date
}

// Mock visitor data
const mockVisitors: Visitor[] = [
  {
    id: "vis-001",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1234567890",
    company: "Tech Corp",
    purpose: "Business meeting",
    hostName: "Alice Johnson",
    hostId: "1",
    invitationId: "inv-001",
    hasInvitation: true,
    checkInTime: new Date("2024-01-15T09:30:00"),
    status: "checked-in",
    trayNumber: "T-001",
    notes: "VIP visitor",
    groupSize: 1,
    documentVerified: true,
    parkingSpot: "P-15",
    createdAt: new Date("2024-01-15T09:30:00"),
    updatedAt: new Date("2024-01-15T09:30:00"),
  },
  {
    id: "vis-002",
    name: "Sarah Wilson",
    email: "sarah.w@email.com",
    purpose: "Personal visit",
    hostName: "Bob Davis",
    hostId: "2",
    hasInvitation: false,
    checkInTime: new Date("2024-01-15T10:15:00"),
    status: "checked-in",
    trayNumber: "T-002",
    groupSize: 2,
    documentVerified: true,
    createdAt: new Date("2024-01-15T10:15:00"),
    updatedAt: new Date("2024-01-15T10:15:00"),
  },
]

// Mock tray management
const mockTrays: TrayInfo[] = Array.from({ length: 50 }, (_, i) => ({
  number: `T-${String(i + 1).padStart(3, "0")}`,
  isAvailable: i >= 2, // First 2 trays are assigned
  assignedTo: i < 2 ? mockVisitors[i]?.name : undefined,
  assignedAt: i < 2 ? mockVisitors[i]?.checkInTime : undefined,
}))

export const visitorService = {
  async checkInVisitor(
    visitorData: Omit<Visitor, "id" | "checkInTime" | "status" | "createdAt" | "updatedAt">,
  ): Promise<Visitor> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Assign tray number
    const availableTray = mockTrays.find((tray) => tray.isAvailable)
    if (!availableTray) {
      throw new Error("No trays available")
    }

    const id = `vis-${Date.now()}`
    const now = new Date()

    const newVisitor: Visitor = {
      ...visitorData,
      id,
      checkInTime: now,
      status: "checked-in",
      trayNumber: availableTray.number,
      createdAt: now,
      updatedAt: now,
    }

    // Update tray availability
    availableTray.isAvailable = false
    availableTray.assignedTo = newVisitor.name
    availableTray.assignedAt = now

    mockVisitors.push(newVisitor)
    return newVisitor
  },

  async checkOutVisitor(visitorId: string): Promise<Visitor> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const visitorIndex = mockVisitors.findIndex((v) => v.id === visitorId)
    if (visitorIndex === -1) {
      throw new Error("Visitor not found")
    }

    const visitor = mockVisitors[visitorIndex]
    if (visitor.status === "checked-out") {
      throw new Error("Visitor already checked out")
    }

    // Update visitor status
    visitor.status = "checked-out"
    visitor.checkOutTime = new Date()
    visitor.updatedAt = new Date()

    // Free up tray
    if (visitor.trayNumber) {
      const tray = mockTrays.find((t) => t.number === visitor.trayNumber)
      if (tray) {
        tray.isAvailable = true
        tray.assignedTo = undefined
        tray.assignedAt = undefined
      }
    }

    return visitor
  },

  async bulkCheckOut(visitorIds: string[]): Promise<Visitor[]> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const checkedOutVisitors: Visitor[] = []

    for (const visitorId of visitorIds) {
      try {
        const visitor = await this.checkOutVisitor(visitorId)
        checkedOutVisitors.push(visitor)
      } catch (error) {
        console.error(`Failed to check out visitor ${visitorId}:`, error)
      }
    }

    return checkedOutVisitors
  },

  async getVisitors(status?: Visitor["status"]): Promise<Visitor[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (status) {
      return mockVisitors.filter((v) => v.status === status)
    }

    return mockVisitors.sort((a, b) => b.checkInTime.getTime() - a.checkInTime.getTime())
  },

  async getVisitorById(id: string): Promise<Visitor | null> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockVisitors.find((v) => v.id === id) || null
  },

  async updateVisitor(id: string, updates: Partial<Visitor>): Promise<Visitor> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const visitorIndex = mockVisitors.findIndex((v) => v.id === id)
    if (visitorIndex === -1) {
      throw new Error("Visitor not found")
    }

    mockVisitors[visitorIndex] = {
      ...mockVisitors[visitorIndex],
      ...updates,
      updatedAt: new Date(),
    }

    return mockVisitors[visitorIndex]
  },

  async getAvailableTrays(): Promise<TrayInfo[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockTrays.filter((tray) => tray.isAvailable)
  },

  async getAllTrays(): Promise<TrayInfo[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockTrays
  },

  async getTrayStats(): Promise<{ total: number; available: number; occupied: number }> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const available = mockTrays.filter((t) => t.isAvailable).length
    return {
      total: mockTrays.length,
      available,
      occupied: mockTrays.length - available,
    }
  },
}
