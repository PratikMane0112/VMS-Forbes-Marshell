"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, UserX, Users, Clock, Building, Phone, Mail, FileText, LogOut } from "lucide-react"
import { visitorService, type Visitor } from "@/lib/visitors"

interface VisitorListProps {
  showAllVisitors?: boolean
  allowBulkOperations?: boolean
}

export function VisitorList({ showAllVisitors = true, allowBulkOperations = true }: VisitorListProps) {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedVisitors, setSelectedVisitors] = useState<string[]>([])
  const [isBulkOperating, setIsBulkOperating] = useState(false)

  useEffect(() => {
    loadVisitors()
  }, [])

  useEffect(() => {
    filterVisitors()
  }, [visitors, searchTerm, statusFilter])

  const loadVisitors = async () => {
    try {
      setIsLoading(true)
      const data = await visitorService.getVisitors()
      setVisitors(data)
    } catch (err) {
      setError("Failed to load visitors")
    } finally {
      setIsLoading(false)
    }
  }

  const filterVisitors = () => {
    let filtered = visitors

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (visitor) =>
          visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          visitor.hostName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          visitor.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          visitor.purpose.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((visitor) => visitor.status === statusFilter)
    }

    // Sort by check-in time (newest first)
    filtered.sort((a, b) => b.checkInTime.getTime() - a.checkInTime.getTime())

    setFilteredVisitors(filtered)
  }

  const handleCheckOut = async (visitorId: string) => {
    try {
      await visitorService.checkOutVisitor(visitorId)
      await loadVisitors()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check out visitor")
    }
  }

  const handleBulkCheckOut = async () => {
    if (selectedVisitors.length === 0) return

    try {
      setIsBulkOperating(true)
      await visitorService.bulkCheckOut(selectedVisitors)
      setSelectedVisitors([])
      await loadVisitors()
    } catch (err) {
      setError("Failed to perform bulk check-out")
    } finally {
      setIsBulkOperating(false)
    }
  }

  const handleSelectVisitor = (visitorId: string, checked: boolean) => {
    if (checked) {
      setSelectedVisitors((prev) => [...prev, visitorId])
    } else {
      setSelectedVisitors((prev) => prev.filter((id) => id !== visitorId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const checkedInVisitors = filteredVisitors.filter((v) => v.status === "checked-in").map((v) => v.id)
      setSelectedVisitors(checkedInVisitors)
    } else {
      setSelectedVisitors([])
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "checked-in":
        return "bg-secondary text-secondary-foreground"
      case "checked-out":
        return "bg-muted text-muted-foreground"
      case "waiting":
        return "bg-accent/10 text-accent border-accent"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDuration = (checkIn: Date, checkOut?: Date) => {
    const end = checkOut || new Date()
    const duration = end.getTime() - checkIn.getTime()
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading visitors...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const checkedInCount = filteredVisitors.filter((v) => v.status === "checked-in").length
  const canSelectAll = filteredVisitors.some((v) => v.status === "checked-in")

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Visitor Management
            </span>
            <Badge variant="outline" className="text-sm">
              {checkedInCount} currently checked in
            </Badge>
          </CardTitle>
          <CardDescription>Manage visitor check-ins and check-outs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by visitor name, host, company, or purpose..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="checked-in">Checked In</SelectItem>
                <SelectItem value="checked-out">Checked Out</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Operations */}
          {allowBulkOperations && canSelectAll && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={
                    selectedVisitors.length > 0 &&
                    selectedVisitors.length === filteredVisitors.filter((v) => v.status === "checked-in").length
                  }
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedVisitors.length > 0
                    ? `${selectedVisitors.length} visitor(s) selected`
                    : "Select all checked-in visitors"}
                </span>
              </div>
              {selectedVisitors.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkCheckOut}
                  disabled={isBulkOperating}
                  className="text-accent border-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isBulkOperating ? "Checking Out..." : "Bulk Check-Out"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visitors List */}
      <div className="space-y-4">
        {filteredVisitors.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No visitors found</p>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "No visitors have been checked in yet"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredVisitors.map((visitor) => (
            <Card key={visitor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Selection Checkbox */}
                  {allowBulkOperations && visitor.status === "checked-in" && (
                    <Checkbox
                      checked={selectedVisitors.includes(visitor.id)}
                      onCheckedChange={(checked) => handleSelectVisitor(visitor.id, checked as boolean)}
                      className="mt-1"
                    />
                  )}

                  {/* Main Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center">
                          <Users className="h-4 w-4 mr-2 text-primary" />
                          {visitor.name}
                          {visitor.groupSize > 1 && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Group of {visitor.groupSize}
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">Visiting: {visitor.hostName}</p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(visitor.status)}>
                        {visitor.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        Check-in: {formatTime(visitor.checkInTime)}
                      </div>

                      {visitor.checkOutTime && (
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2 text-muted-foreground" />
                          Check-out: {formatTime(visitor.checkOutTime)}
                        </div>
                      )}

                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        Duration: {formatDuration(visitor.checkInTime, visitor.checkOutTime)}
                      </div>

                      {visitor.company && (
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                          {visitor.company}
                        </div>
                      )}

                      {visitor.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          {visitor.email}
                        </div>
                      )}

                      {visitor.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          {visitor.phone}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      Purpose: {visitor.purpose}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {visitor.trayNumber && (
                        <Badge variant="outline" className="text-xs">
                          Tray: {visitor.trayNumber}
                        </Badge>
                      )}
                      {visitor.hasInvitation && (
                        <Badge variant="outline" className="text-xs bg-secondary/10 text-secondary">
                          Has Invitation
                        </Badge>
                      )}
                      {visitor.documentVerified && (
                        <Badge variant="outline" className="text-xs bg-secondary/10 text-secondary">
                          ID Verified
                        </Badge>
                      )}
                      {visitor.parkingSpot && (
                        <Badge variant="outline" className="text-xs">
                          Parking: {visitor.parkingSpot}
                        </Badge>
                      )}
                    </div>

                    {visitor.notes && (
                      <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                        <strong>Notes:</strong> {visitor.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {visitor.status === "checked-in" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCheckOut(visitor.id)}
                        className="text-accent border-accent hover:bg-accent hover:text-accent-foreground"
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Check Out
                      </Button>
                    )}

                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
