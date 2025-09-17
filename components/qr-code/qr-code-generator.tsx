"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, Download, Mail, Copy, Check } from "lucide-react"
import { qrCodeService } from "@/lib/qr-code"
import type { Invitation } from "@/lib/invitations"

interface QRCodeGeneratorProps {
  invitation: Invitation
  onClose?: () => void
}

export function QRCodeGenerator({ invitation, onClose }: QRCodeGeneratorProps) {
  const [qrCodeURL, setQRCodeURL] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    generateQRCode()
  }, [invitation])

  const generateQRCode = async () => {
    try {
      setIsLoading(true)

      // Create QR code data
      const qrData = {
        invitationId: invitation.id,
        visitorName: invitation.visitorName,
        residentName: invitation.residentName,
        visitDate: invitation.visitDate,
        visitTime: invitation.visitTime,
        qrCode: invitation.qrCode,
        purpose: invitation.purpose,
        parkingReserved: invitation.parkingReserved,
      }

      // Generate QR code URL
      const url = qrCodeService.generateQRCodeURL(JSON.stringify(qrData))
      setQRCodeURL(url)
    } catch (error) {
      console.error("Failed to generate QR code:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyQRCode = async () => {
    try {
      await navigator.clipboard.writeText(invitation.qrCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy QR code:", error)
    }
  }

  const handleDownloadQR = () => {
    if (qrCodeURL) {
      const link = document.createElement("a")
      link.href = qrCodeURL
      link.download = `qr-code-${invitation.qrCode}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleSendEmail = () => {
    const subject = `Visitor Invitation QR Code - ${invitation.visitorName}`
    const body = `Dear ${invitation.visitorName},

Your visitor invitation has been approved! Please use the QR code below to check in when you arrive.

Visit Details:
- Date: ${new Date(invitation.visitDate).toLocaleDateString()}
- Time: ${invitation.visitTime}
- Host: ${invitation.residentName}
- Purpose: ${invitation.purpose}

QR Code: ${invitation.qrCode}

Please present this QR code at the reception desk upon arrival.

Best regards,
Visitor Management System`

    const mailtoLink = `mailto:${invitation.visitorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center">
          <QrCode className="h-5 w-5 mr-2 text-primary" />
          QR Code
        </CardTitle>
        <CardDescription>Secure access code for {invitation.visitorName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="flex justify-center">
          {isLoading ? (
            <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="p-4 bg-white rounded-lg border-2 border-muted">
              <img
                src={qrCodeURL || "/placeholder.svg"}
                alt={`QR Code for ${invitation.visitorName}`}
                className="w-40 h-40"
              />
            </div>
          )}
        </div>

        {/* QR Code Info */}
        <div className="space-y-3">
          <div className="text-center">
            <Badge variant="outline" className="text-xs font-mono">
              {invitation.qrCode}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Visitor:</span>
              <span className="font-medium">{invitation.visitorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{new Date(invitation.visitDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">{invitation.visitTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge
                variant={invitation.status === "active" ? "default" : "outline"}
                className={invitation.status === "active" ? "bg-secondary text-secondary-foreground" : ""}
              >
                {invitation.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        {invitation.status === "active" && (
          <Alert className="border-secondary bg-secondary/10">
            <QrCode className="h-4 w-4" />
            <AlertDescription>This QR code is active and ready for use at the reception desk.</AlertDescription>
          </Alert>
        )}

        {invitation.status === "pending" && (
          <Alert>
            <AlertDescription>
              This invitation is pending approval. The QR code will be activated once approved.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" onClick={handleCopyQRCode} className="flex items-center bg-transparent">
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>

            <Button variant="outline" size="sm" onClick={handleDownloadQR} disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleSendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Send to Visitor
          </Button>

          {onClose && (
            <Button variant="outline" className="w-full bg-transparent" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
