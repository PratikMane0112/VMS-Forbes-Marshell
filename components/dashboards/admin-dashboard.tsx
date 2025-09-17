"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Users, UserCheck, Settings, TrendingUp, LogOut, Shield, Car, AlertTriangle } from "lucide-react"

// Mock data for admin dashboard
const mockStats = {
  totalUsers: 156,
  activeVisitors: 23,
  todayVisits: 45,
  pendingApprovals: 8,
  parkingSpaces: { total: 50, occupied: 32 },
  systemAlerts: 3,
}

const mockVisitorData = [
  { name: "Mon", visitors: 24 },
  { name: "Tue", visitors: 32 },
  { name: "Wed", visitors: 28 },
  { name: "Thu", visitors: 45 },
  { name: "Fri", visitors: 38 },
  { name: "Sat", visitors: 15 },
  { name: "Sun", visitors: 12 },
]

const mockMonthlyData = [
  { name: "Jan", visitors: 450, invitations: 520 },
  { name: "Feb", visitors: 380, invitations: 420 },
  { name: "Mar", visitors: 520, invitations: 580 },
  { name: "Apr", visitors: 480, invitations: 540 },
  { name: "May", visitors: 620, invitations: 680 },
  { name: "Jun", visitors: 580, invitations: 640 },
]

const mockPendingUsers = [
  { id: "1", name: "John Smith", email: "john@example.com", role: "resident", requestDate: "2024-01-14" },
  { id: "2", name: "Sarah Johnson", email: "sarah@example.com", role: "receptionist", requestDate: "2024-01-13" },
]

export function AdminDashboard() {
  const { user, logout } = useAuth()
  const [stats] = useState(mockStats)
  const [pendingUsers] = useState(mockPendingUsers)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">System overview and management</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* System Alerts */}
        {stats.systemAlerts > 0 && (
          <Card className="mb-8 border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center text-accent">
                <AlertTriangle className="h-5 w-5 mr-2" />
                System Alerts ({stats.systemAlerts})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">• Parking capacity at 64% - consider expanding</p>
                <p className="text-sm">• 8 user accounts pending approval</p>
                <p className="text-sm">• System backup completed successfully</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">+12 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Visitors</CardTitle>
              <UserCheck className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.activeVisitors}</div>
              <p className="text-xs text-muted-foreground">Currently in building</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Visits</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.todayVisits}</div>
              <p className="text-xs text-muted-foreground">+8% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Parking Usage</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.parkingSpaces.occupied}/{stats.parkingSpaces.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.parkingSpaces.occupied / stats.parkingSpaces.total) * 100)}% occupied
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-primary hover:bg-primary/90">
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button variant="outline">
              <Car className="h-4 w-4 mr-2" />
              Parking Management
            </Button>
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Generate Reports
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Visitor Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Visitor Trends</CardTitle>
              <CardDescription>Daily visitor count for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockVisitorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visitors" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Overview</CardTitle>
              <CardDescription>Visitors vs Invitations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="visitors" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="invitations" stroke="hsl(var(--secondary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending User Approvals</CardTitle>
            <CardDescription>New user accounts waiting for approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">Requested: {user.requestDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-secondary border-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-accent border-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
