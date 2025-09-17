"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { Search, UserCheck, Users, LogOut, Clock, Scan, UserPlus, Package } from "lucide-react"
import { QRCodeScanner } from "@/components/qr-code/qr-code-scanner"
import { ManualCheckInForm } from "@/components/visitors/manual-checkin-form"
import { VisitorList } from "@/components/visitors/visitor-list"
import { TrayManagement } from "@/components/visitors/tray-management"

// Mock data for receptionist dashboard
const mockVisitors = [
  {
    id: "1",
    name: "John Smith",
    resident: "Alice Johnson",
    checkInTime: "09:30 AM",
    status: "checked-in",
    trayNumber: "T-001",
    hasInvitation: true,
  },
  {
    id: "2",
    name: "Sarah Wilson",
    resident: "Bob Davis",
    checkInTime: "10:15 AM",
    status: "checked-in",
    trayNumber: "T-002",
    hasInvitation: true,
  },
  {
    id: "3",
    name: "Mike Brown",
    resident: "Carol Smith",
    checkInTime: "11:00 AM",
    status: "waiting",
    trayNumber: null,
    hasInvitation: false,
  },
]

const mockPendingInvitations = [
  {
    id: "1",
    visitorName: "Emma Davis",
    resident: "John Resident",
    visitDate: "2024-01-15",
    visitTime: "2:00 PM",
    status: "pending",
  },
  {
    id: "2",
    visitorName: "Tom Wilson",
    resident: "Jane Smith",
    visitDate: "2024-01-15",
    visitTime: "3:30 PM",
    status: "pending",
  },
]

type ViewMode = "dashboard" | "scanner" | "manual-checkin" | "visitor-list" | "tray-management"

export function ReceptionistDashboard() {
  const { user, logout } = useAuth()
  const [currentView, setCurrentView] = useState<ViewMode>("dashboard")
  const [visitors] = useState(mockVisitors)
  const [pendingInvitations] = useState(mockPendingInvitations)
  const [searchTerm, setSearchTerm] = useState("")

  const checkedInVisitors = visitors.filter((v) => v.status === "checked-in")
  const waitingVisitors = visitors.filter((v) => v.status === "waiting")

  const renderContent = () => {
    switch (currentView) {
      case "scanner":
        return <QRCodeScanner />
      case "manual-checkin":
        return (
          <ManualCheckInForm
            onSuccess={() => setCurrentView("visitor-list")}
            onCancel={() => setCurrentView("dashboard")}
          />
        )
      case "visitor-list":
        return <VisitorList />
      case "tray-management":
        return <TrayManagement />
      default:
        return (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Checked In</CardTitle>
                  <UserCheck className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{checkedInVisitors.length}</div>
                  <p className="text-xs text-muted-foreground">Currently in building</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Waiting</CardTitle>
                  <Clock className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{waitingVisitors.length}</div>
                  <p className="text-xs text-muted-foreground">Pending check-in</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingInvitations.length}</div>
                  <p className="text-xs text-muted-foreground">Today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Trays</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">47</div>
                  <p className="text-xs text-muted-foreground">Out of 50</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-secondary hover:bg-secondary/90" onClick={() => setCurrentView("scanner")}>
                  <Scan className="h-4 w-4 mr-2" />
                  Scan QR Code
                </Button>
                <Button variant="outline" onClick={() => setCurrentView("manual-checkin")}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Manual Check-in
                </Button>
                <Button variant="outline" onClick={() => setCurrentView("visitor-list")}>
                  <Users className="h-4 w-4 mr-2" />
                  Manage Visitors
                </Button>
                <Button variant="outline" onClick={() => setCurrentView("tray-management")}>
                  <Package className="h-4 w-4 mr-2" />
                  Tray Management
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Current Visitors */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Visitors</CardTitle>
                  <CardDescription>Visitors currently in the building</CardDescription>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search visitors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {visitors.map((visitor) => (
                      <div
                        key={visitor.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{visitor.name}</p>
                            <p className="text-sm text-muted-foreground">Visiting: {visitor.resident}</p>
                            <p className="text-xs text-muted-foreground">Check-in: {visitor.checkInTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {visitor.trayNumber && (
                            <Badge variant="outline" className="text-xs">
                              {visitor.trayNumber}
                            </Badge>
                          )}
                          <Badge
                            variant={visitor.status === "checked-in" ? "default" : "outline"}
                            className={
                              visitor.status === "checked-in"
                                ? "bg-secondary text-secondary-foreground"
                                : "text-accent border-accent"
                            }
                          >
                            {visitor.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            {visitor.status === "checked-in" ? "Check Out" : "Check In"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => setCurrentView("visitor-list")}>
                      View All Visitors
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Invitations */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Invitations</CardTitle>
                  <CardDescription>Scheduled visitor invitations for today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingInvitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                            <Clock className="h-5 w-5 text-secondary" />
                          </div>
                          <div>
                            <p className="font-medium">{invitation.visitorName}</p>
                            <p className="text-sm text-muted-foreground">Host: {invitation.resident}</p>
                            <p className="text-xs text-muted-foreground">Expected: {invitation.visitTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="text-xs">
                            {invitation.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
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
              <h1 className="text-2xl font-bold text-primary">Reception Desk</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
            </div>
            {currentView !== "dashboard" && (
              <Button variant="outline" size="sm" onClick={() => setCurrentView("dashboard")}>
                Back to Dashboard
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-secondary/10 text-secondary">
              Receptionist
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
