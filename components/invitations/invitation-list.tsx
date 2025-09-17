"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Calendar, Clock, User, Mail, Phone, Car, FileText, QrCode, X, Eye } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { invitationService, type Invitation } from "@/lib/invitations"

interface InvitationListProps {
  showAllInvitations?: boolean // For receptionist/admin view
}

export function InvitationList({ showAllInvitations = false }: InvitationListProps) {
  const { user } = useAuth()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [filteredInvitations, setFilteredInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null)

  useEffect(() => {
    loadInvitations()
  }, [])

  useEffect(() => {
    filterInvitations()
  }, [invitations, searchTerm, statusFilter])

  const loadInvitations = async () => {
    try {
      setIsLoading(true)
      const data = await invitationService.getInvitations(showAllInvitations ? undefined : user?.id)
      setInvitations(data)
    } catch (err) {
      setError("Failed to load invitations")
    } finally {
      setIsLoading(false)
    }
  }

  const filterInvitations = () => {
    let filtered = invitations

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.visitorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.purpose.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((inv) => inv.status === statusFilter)
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredInvitations(filtered)
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await invitationService.cancelInvitation(invitationId, "Cancelled by resident")
      await loadInvitations()
    } catch (err) {
      setError("Failed to cancel invitation")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-secondary text-secondary-foreground"
      case "pending":
        return "bg-primary/10 text-primary border-primary"
      case "expired":
        return "bg-muted text-muted-foreground"
      case "cancelled":
        return "bg-accent/10 text-accent border-accent"
      case "completed":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading invitations...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{showAllInvitations ? "All Invitations" : "My Invitations"}</CardTitle>
          <CardDescription>
            {showAllInvitations ? "View and manage all visitor invitations" : "Manage your visitor invitations"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by visitor name, email, or purpose..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invitations List */}
      <div className="space-y-4">
        {filteredInvitations.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No invitations found</p>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Create your first visitor invitation to get started"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredInvitations.map((invitation) => (
            <Card key={invitation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Main Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center">
                          <User className="h-4 w-4 mr-2 text-primary" />
                          {invitation.visitorName}
                        </h3>
                        {showAllInvitations && (
                          <p className="text-sm text-muted-foreground">Host: {invitation.residentName}</p>
                        )}
                      </div>
                      <Badge variant="outline" className={getStatusColor(invitation.status)}>
                        {invitation.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        {invitation.visitorEmail}
                      </div>
                      {invitation.visitorPhone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          {invitation.visitorPhone}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatDate(invitation.visitDate)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatTime(invitation.visitTime)}
                      </div>
                    </div>

                    {invitation.purpose && (
                      <div className="flex items-center text-sm">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        Purpose: {invitation.purpose}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {invitation.parkingReserved && (
                        <Badge variant="outline" className="text-xs">
                          <Car className="h-3 w-3 mr-1" />
                          Parking: {invitation.parkingSpot || "Reserved"}
                        </Badge>
                      )}
                      {invitation.documentAttached && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Document Attached
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        <QrCode className="h-3 w-3 mr-1" />
                        {invitation.qrCode}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedInvitation(invitation)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>

                    {invitation.status === "pending" || invitation.status === "active" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelInvitation(invitation.id)}
                        className="text-accent border-accent hover:bg-accent hover:text-accent-foreground"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Invitation Details Modal would go here */}
      {selectedInvitation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Invitation Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedInvitation(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Visitor:</strong> {selectedInvitation.visitorName}
                </div>
                <div>
                  <strong>Status:</strong>
                  <Badge variant="outline" className={`ml-2 ${getStatusColor(selectedInvitation.status)}`}>
                    {selectedInvitation.status}
                  </Badge>
                </div>
                <div>
                  <strong>Email:</strong> {selectedInvitation.visitorEmail}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedInvitation.visitorPhone || "Not provided"}
                </div>
                <div>
                  <strong>Visit Date:</strong> {formatDate(selectedInvitation.visitDate)}
                </div>
                <div>
                  <strong>Visit Time:</strong> {formatTime(selectedInvitation.visitTime)}
                </div>
                <div>
                  <strong>Purpose:</strong> {selectedInvitation.purpose || "Not specified"}
                </div>
                <div>
                  <strong>QR Code:</strong> {selectedInvitation.qrCode}
                </div>
              </div>

              {selectedInvitation.notes && (
                <div>
                  <strong>Notes:</strong>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedInvitation.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedInvitation(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
