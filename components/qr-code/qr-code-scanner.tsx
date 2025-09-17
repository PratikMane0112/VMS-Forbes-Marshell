"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Scan, Type, CheckCircle, XCircle, User, Calendar, Clock } from "lucide-react"
import { qrCodeService } from "@/lib/qr-code"
import { invitationService } from "@/lib/invitations"

interface ScanResult {
  valid: boolean
  data?: any
  message: string
}

export function QRCodeScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [manualCode, setManualCode] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [scanMode, setScanMode] = useState<"camera" | "manual">("camera")
  const videoRef = useRef<HTMLVideoElement>(null)

  const startCameraScanning = async () => {
    try {
      setIsScanning(true)
      setScanResult(null)

      // Simulate camera scanning
      const scannedData = await qrCodeService.scanQRCode()
      const result = await qrCodeService.validateQRCode(scannedData)

      setScanResult(result)
    } catch (error) {
      setScanResult({
        valid: false,
        message: "Failed to access camera or scan QR code",
      })
    } finally {
      setIsScanning(false)
    }
  }

  const validateManualCode = async () => {
    if (!manualCode.trim()) {
      setScanResult({
        valid: false,
        message: "Please enter a QR code",
      })
      return
    }

    try {
      setIsValidating(true)
      setScanResult(null)

      // Try to validate with invitation service first
      const invitationResult = await invitationService.validateInvitation(manualCode)

      if (invitationResult.valid && invitationResult.invitation) {
        setScanResult({
          valid: true,
          data: {
            invitationId: invitationResult.invitation.id,
            visitorName: invitationResult.invitation.visitorName,
            residentName: invitationResult.invitation.residentName,
            visitDate: invitationResult.invitation.visitDate,
            visitTime: invitationResult.invitation.visitTime,
            purpose: invitationResult.invitation.purpose,
            parkingReserved: invitationResult.invitation.parkingReserved,
          },
          message: invitationResult.message,
        })
      } else {
        setScanResult({
          valid: false,
          message: invitationResult.message,
        })
      }
    } catch (error) {
      setScanResult({
        valid: false,
        message: "Invalid QR code format",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleCheckIn = async () => {
    if (scanResult?.valid && scanResult.data) {
      // In a real implementation, this would update the invitation status
      console.log("Checking in visitor:", scanResult.data)

      // Simulate check-in process
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setScanResult({
        ...scanResult,
        message: "Visitor successfully checked in!",
      })
    }
  }

  const resetScanner = () => {
    setScanResult(null)
    setManualCode("")
    setIsScanning(false)
    setIsValidating(false)
  }

  return (
    <div className="space-y-6">
      {/* Scanner Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Scan className="h-5 w-5 mr-2 text-primary" />
            QR Code Scanner
          </CardTitle>
          <CardDescription>Scan visitor QR codes for check-in validation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button
              variant={scanMode === "camera" ? "default" : "outline"}
              onClick={() => setScanMode("camera")}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera Scan
            </Button>
            <Button
              variant={scanMode === "manual" ? "default" : "outline"}
              onClick={() => setScanMode("manual")}
              className="flex-1"
            >
              <Type className="h-4 w-4 mr-2" />
              Manual Entry
            </Button>
          </div>

          {/* Camera Scanning Mode */}
          {scanMode === "camera" && (
            <div className="space-y-4">
              <div className="relative">
                <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                  {isScanning ? (
                    <div className="text-center">
                      <div className="animate-pulse">
                        <Camera className="h-12 w-12 mx-auto mb-4 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">Scanning for QR code...</p>
                      <div className="mt-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click "Start Scanning" to begin</p>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={startCameraScanning}
                disabled={isScanning}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isScanning ? "Scanning..." : "Start Scanning"}
              </Button>
            </div>
          )}

          {/* Manual Entry Mode */}
          {scanMode === "manual" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qrCode">QR Code</Label>
                <Input
                  id="qrCode"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter QR code (e.g., QR-INV-001-2024)"
                  className="font-mono"
                />
              </div>

              <Button
                onClick={validateManualCode}
                disabled={isValidating || !manualCode.trim()}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isValidating ? "Validating..." : "Validate QR Code"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scan Results */}
      {scanResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {scanResult.valid ? (
                <CheckCircle className="h-5 w-5 mr-2 text-secondary" />
              ) : (
                <XCircle className="h-5 w-5 mr-2 text-accent" />
              )}
              Scan Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant={scanResult.valid ? "default" : "destructive"}>
              <AlertDescription className={scanResult.valid ? "text-secondary-foreground" : ""}>
                {scanResult.message}
              </AlertDescription>
            </Alert>

            {scanResult.valid && scanResult.data && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground">Visitor: </span>
                      <span className="font-medium">{scanResult.data.visitorName}</span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground">Host: </span>
                      <span className="font-medium">{scanResult.data.residentName}</span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground">Date: </span>
                      <span className="font-medium">{new Date(scanResult.data.visitDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground">Time: </span>
                      <span className="font-medium">{scanResult.data.visitTime}</span>
                    </div>
                  </div>
                </div>

                {scanResult.data.purpose && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Purpose: </span>
                    <span className="font-medium">{scanResult.data.purpose}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {scanResult.data.parkingReserved && (
                    <Badge variant="outline" className="text-xs">
                      Parking Reserved
                    </Badge>
                  )}
                  <Badge variant="default" className="text-xs bg-secondary text-secondary-foreground">
                    Valid Invitation
                  </Badge>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleCheckIn} className="flex-1 bg-secondary hover:bg-secondary/90">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Check In Visitor
                  </Button>
                  <Button variant="outline" onClick={resetScanner} className="flex-1 bg-transparent">
                    Scan Another
                  </Button>
                </div>
              </div>
            )}

            {!scanResult.valid && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={resetScanner}>
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
