// Mock invitation management system for frontend-only implementation
export interface Invitation {
  id: string
  visitorName: string
  visitorEmail: string
  visitorPhone: string
  visitDate: string
  visitTime: string
  purpose: string
  residentId: string
  residentName: string
  status: "pending" | "active" | "expired" | "cancelled" | "completed"
  qrCode: string
  parkingReserved: boolean
  parkingSpot?: string
  documentAttached: boolean
  documentUrl?: string
  createdAt: Date
  updatedAt: Date
  notes?: string
}

// Mock invitation data
const mockInvitations: Invitation[] = [
  {
    id: "inv-001",
    visitorName: "John Smith",
    visitorEmail: "john.smith@email.com",
    visitorPhone: "+1234567890",
    visitDate: "2024-01-15",
    visitTime: "14:00",
    purpose: "Business meeting",
    residentId: "1",
    residentName: "John Resident",
    status: "active",
    qrCode: "QR-INV-001-2024",
    parkingReserved: true,
    parkingSpot: "P-15",
    documentAttached: true,
    documentUrl: "/documents/john-smith-id.pdf",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
    notes: "VIP visitor, please provide assistance",
  },
  {
    id: "inv-002",
    visitorName: "Sarah Johnson",
    visitorEmail: "sarah.j@email.com",
    visitorPhone: "+1234567891",
    visitDate: "2024-01-18",
    visitTime: "10:30",
    purpose: "Personal visit",
    residentId: "1",
    residentName: "John Resident",
    status: "pending",
    qrCode: "QR-INV-002-2024",
    parkingReserved: false,
    documentAttached: false,
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
  },
]

export const invitationService = {
  async createInvitation(
    invitation: Omit<Invitation, "id" | "qrCode" | "createdAt" | "updatedAt" | "status">,
  ): Promise<Invitation> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Validate visit date is not in the past
    const visitDateTime = new Date(`${invitation.visitDate}T${invitation.visitTime}`)
    if (visitDateTime < new Date()) {
      throw new Error("Cannot create invitation for past dates")
    }

    // Generate unique ID and QR code
    const id = `inv-${Date.now()}`
    const qrCode = `QR-${id.toUpperCase()}-${new Date().getFullYear()}`

    const newInvitation: Invitation = {
      ...invitation,
      id,
      qrCode,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockInvitations.push(newInvitation)

    // Simulate sending email notification
    console.log(`Email sent to ${invitation.visitorEmail} with QR code: ${qrCode}`)

    return newInvitation
  },

  async getInvitations(residentId?: string): Promise<Invitation[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (residentId) {
      return mockInvitations.filter((inv) => inv.residentId === residentId)
    }

    return mockInvitations
  },

  async getInvitationById(id: string): Promise<Invitation | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockInvitations.find((inv) => inv.id === id) || null
  },

  async updateInvitation(id: string, updates: Partial<Invitation>): Promise<Invitation> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const invitationIndex = mockInvitations.findIndex((inv) => inv.id === id)
    if (invitationIndex === -1) {
      throw new Error("Invitation not found")
    }

    mockInvitations[invitationIndex] = {
      ...mockInvitations[invitationIndex],
      ...updates,
      updatedAt: new Date(),
    }

    return mockInvitations[invitationIndex]
  },

  async cancelInvitation(id: string, reason?: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const invitation = mockInvitations.find((inv) => inv.id === id)
    if (!invitation) {
      throw new Error("Invitation not found")
    }

    invitation.status = "cancelled"
    invitation.updatedAt = new Date()
    if (reason) {
      invitation.notes = `Cancelled: ${reason}`
    }

    // Simulate sending cancellation email
    console.log(`Cancellation email sent to ${invitation.visitorEmail}`)
  },

  async validateInvitation(qrCode: string): Promise<{ valid: boolean; invitation?: Invitation; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const invitation = mockInvitations.find((inv) => inv.qrCode === qrCode)

    if (!invitation) {
      return { valid: false, message: "Invalid QR code" }
    }

    if (invitation.status === "cancelled") {
      return { valid: false, invitation, message: "Invitation has been cancelled" }
    }

    if (invitation.status === "expired") {
      return { valid: false, invitation, message: "Invitation has expired" }
    }

    if (invitation.status === "completed") {
      return { valid: false, invitation, message: "Invitation has already been used" }
    }

    const visitDateTime = new Date(`${invitation.visitDate}T${invitation.visitTime}`)
    const now = new Date()

    // Check if invitation is for today or future
    if (visitDateTime.toDateString() === now.toDateString() || visitDateTime > now) {
      return { valid: true, invitation, message: "Valid invitation" }
    } else {
      // Mark as expired
      invitation.status = "expired"
      return { valid: false, invitation, message: "Invitation has expired" }
    }
  },
}
