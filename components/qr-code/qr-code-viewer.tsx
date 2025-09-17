"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, Search, Eye, Mail } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { invitationService, type Invitation } from "@/lib/invitations"
import { QRCodeGenerator } from "./qr-code-generator"

export function QRCodeViewer() {
  const { user } = useAuth()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [filteredInvitations, setFilteredInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    loadInvitations()
  }, [])

  useEffect(() => {
    filterInvitations()
  }, [invitations, searchTerm])

  const loadInvitations = async () => {
    try {
      setIsLoading(true)
      const data = await invitationService.getInvitations(user?.id)
      // Only show invitations with QR codes (active or pending)
      const withQRCodes = data.filter((inv) => inv.status === "active" || inv.status === "pending")
      setInvitations(withQRCodes)
    } catch (err) {
      setError("Failed to load invitations")
    } finally {
      setIsLoading(false)
    }
  }

  const filterInvitations = () => {
    let filtered = invitations

    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.qrCode.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredInvitations(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-secondary text-secondary-foreground"
      case "pending":
        return "bg-primary/10 text-primary border-primary"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (selectedInvitation) {
    return (
      <div className="max-w-md mx-auto">
        <QRCodeGenerator invitation={selectedInvitation} onClose={() => setSelectedInvitation(null)} />
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading QR codes...</p>
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

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="h-5 w-5 mr-2 text-primary" />
            QR Code Viewer
          </CardTitle>
          <CardDescription>View and manage QR codes for your visitor invitations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by visitor name or QR code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* QR Codes List */}
      {filteredInvitations.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No QR codes found</p>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search criteria" : "Create visitor invitations to generate QR codes"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvitations.map((invitation) => (
            <Card key={invitation.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{invitation.visitorName}</CardTitle>
                    <CardDescription className="text-sm">
                      {new Date(invitation.visitDate).toLocaleDateString()} at {invitation.visitTime}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={getStatusColor(invitation.status)}>
                    {invitation.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                    <QrCode className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">
                    {invitation.qrCode}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Purpose:</span>
                    <span className="font-medium">{invitation.purpose || "Not specified"}</span>
                  </div>
                  {invitation.parkingReserved && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Parking:</span>
                      <Badge variant="outline" className="text-xs">
                        Reserved
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedInvitation(invitation)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View QR
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const subject = `Visitor QR Code - ${invitation.visitorName}`
                      const body = `Your QR code: ${invitation.qrCode}`
                      window.open(
                        `mailto:${invitation.visitorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
                      )
                    }}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
