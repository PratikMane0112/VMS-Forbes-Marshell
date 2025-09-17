"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { Plus, QrCode, Calendar, Users, LogOut, List, Eye } from "lucide-react"
import { CreateInvitationForm } from "@/components/invitations/create-invitation-form"
import { InvitationList } from "@/components/invitations/invitation-list"
import { QRCodeViewer } from "@/components/qr-code/qr-code-viewer"

// Mock data for resident dashboard
const mockInvitations = [
  {
    id: "1",
    visitorName: "John Smith",
    visitDate: "2024-01-15",
    status: "active",
    qrCode: "QR123456",
    parkingReserved: true,
  },
  {
    id: "2",
    visitorName: "Sarah Johnson",
    visitDate: "2024-01-18",
    status: "pending",
    qrCode: "QR789012",
    parkingReserved: false,
  },
  {
    id: "3",
    visitorName: "Mike Wilson",
    visitDate: "2024-01-12",
    status: "completed",
    qrCode: "QR345678",
    parkingReserved: true,
  },
]

type ViewMode = "dashboard" | "create" | "list" | "qr-codes"

export function ResidentDashboard() {
  const { user, logout } = useAuth()
  const [currentView, setCurrentView] = useState<ViewMode>("dashboard")
  const [invitations] = useState(mockInvitations)

  const activeInvitations = invitations.filter((inv) => inv.status === "active")
  const upcomingVisits = invitations.filter((inv) => new Date(inv.visitDate) > new Date())

  const renderContent = () => {
    switch (currentView) {
      case "create":
        return (
          <CreateInvitationForm onSuccess={() => setCurrentView("list")} onCancel={() => setCurrentView("dashboard")} />
        )
      case "list":
        return <InvitationList />
      case "qr-codes":
        return <QRCodeViewer />
      default:
        return (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Invitations</CardTitle>
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{activeInvitations.length}</div>
                  <p className="text-xs text-muted-foreground">Currently valid</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Visits</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{upcomingVisits.length}</div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{invitations.length}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-primary hover:bg-primary/90" onClick={() => setCurrentView("create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Invitation
                </Button>
                <Button variant="outline" onClick={() => setCurrentView("list")}>
                  <List className="h-4 w-4 mr-2" />
                  View All Invitations
                </Button>
                <Button variant="outline" onClick={() => setCurrentView("qr-codes")}>
                  <Eye className="h-4 w-4 mr-2" />
                  View QR Codes
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Schedule
                </Button>
              </div>
            </div>

            {/* Recent Invitations Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Invitations</CardTitle>
                <CardDescription>Your latest visitor invitations and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{invitation.visitorName}</p>
                          <p className="text-sm text-muted-foreground">Visit Date: {invitation.visitDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {invitation.parkingReserved && (
                          <Badge variant="outline" className="text-xs">
                            Parking Reserved
                          </Badge>
                        )}
                        <Badge
                          variant={
                            invitation.status === "active"
                              ? "default"
                              : invitation.status === "completed"
                                ? "secondary"
                                : "outline"
                          }
                          className={invitation.status === "active" ? "bg-secondary text-secondary-foreground" : ""}
                        >
                          {invitation.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" onClick={() => setCurrentView("list")}>
                    View All Invitations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary">Visitor Management</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
            </div>
            {currentView !== "dashboard" && (
              <Button variant="outline" size="sm" onClick={() => setCurrentView("dashboard")}>
                Back to Dashboard
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Resident
            </Badge>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{renderContent()}</main>
    </div>
  )
}
