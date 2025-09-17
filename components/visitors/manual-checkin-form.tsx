"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus } from "lucide-react"
import { visitorService } from "@/lib/visitors"

interface ManualCheckInFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ManualCheckInForm({ onSuccess, onCancel }: ManualCheckInFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    purpose: "",
    hostName: "",
    groupSize: 1,
    notes: "",
    documentVerified: false,
    hasInvitation: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.hostName || !formData.purpose) {
        throw new Error("Please fill in all required fields")
      }

      // Validate email format if provided
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error("Please enter a valid email address")
      }

      // Validate phone format if provided
      if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
        throw new Error("Please enter a valid phone number")
      }

      const visitor = await visitorService.checkInVisitor({
        ...formData,
        hasInvitation: false, // Manual check-in means no prior invitation
      })

      setSuccess(`Visitor checked in successfully! Tray number: ${visitor.trayNumber}`)

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        purpose: "",
        hostName: "",
        groupSize: 1,
        notes: "",
        documentVerified: false,
        hasInvitation: false,
      })

      if (onSuccess) {
        setTimeout(onSuccess, 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check in visitor")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserPlus className="h-5 w-5 mr-2 text-primary" />
          Manual Visitor Check-In
        </CardTitle>
        <CardDescription>Check in visitors without prior invitations</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-secondary text-secondary-foreground bg-secondary/10">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Visitor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Visitor Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter visitor's full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company/Organization</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  placeholder="Company name (optional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="visitor@example.com (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567 (optional)"
                />
              </div>
            </div>
          </div>

          {/* Visit Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Visit Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hostName">Host Name *</Label>
                <Input
                  id="hostName"
                  value={formData.hostName}
                  onChange={(e) => handleInputChange("hostName", e.target.value)}
                  placeholder="Name of person being visited"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupSize">Group Size</Label>
                <Select
                  value={formData.groupSize.toString()}
                  onValueChange={(value) => handleInputChange("groupSize", Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select group size" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size} {size === 1 ? "person" : "people"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Visit *</Label>
              <Select value={formData.purpose} onValueChange={(value) => handleInputChange("purpose", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose of visit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal Visit</SelectItem>
                  <SelectItem value="business">Business Meeting</SelectItem>
                  <SelectItem value="maintenance">Maintenance/Repair</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any special instructions, visit reason details, or notes..."
                rows={3}
              />
            </div>
          </div>

          {/* Verification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Verification</h3>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="documentVerified"
                checked={formData.documentVerified}
                onCheckedChange={(checked) => handleInputChange("documentVerified", checked)}
              />
              <Label htmlFor="documentVerified" className="text-sm">
                Visitor ID/document has been verified
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1 bg-secondary hover:bg-secondary/90">
              {isLoading ? "Checking In..." : "Check In Visitor"}
            </Button>

            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
