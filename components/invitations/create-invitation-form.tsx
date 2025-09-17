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
import { Upload, Send } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { invitationService } from "@/lib/invitations"

interface CreateInvitationFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CreateInvitationForm({ onSuccess, onCancel }: CreateInvitationFormProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    visitorName: "",
    visitorEmail: "",
    visitorPhone: "",
    visitDate: "",
    visitTime: "",
    purpose: "",
    parkingReserved: false,
    documentAttached: false,
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.visitorName || !formData.visitorEmail || !formData.visitDate || !formData.visitTime) {
        throw new Error("Please fill in all required fields")
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.visitorEmail)) {
        throw new Error("Please enter a valid email address")
      }

      // Validate phone format (basic)
      if (formData.visitorPhone && !/^\+?[\d\s-()]+$/.test(formData.visitorPhone)) {
        throw new Error("Please enter a valid phone number")
      }

      await invitationService.createInvitation({
        ...formData,
        residentId: user!.id,
        residentName: user!.name,
      })

      setSuccess("Invitation created successfully! QR code has been sent to the visitor's email.")

      // Reset form
      setFormData({
        visitorName: "",
        visitorEmail: "",
        visitorPhone: "",
        visitDate: "",
        visitTime: "",
        purpose: "",
        parkingReserved: false,
        documentAttached: false,
        notes: "",
      })

      if (onSuccess) {
        setTimeout(onSuccess, 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invitation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Get today's date for min date validation
  const today = new Date().toISOString().split("T")[0]

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Send className="h-5 w-5 mr-2 text-primary" />
          Create Visitor Invitation
        </CardTitle>
        <CardDescription>Generate a secure invitation with QR code for your visitor</CardDescription>
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
                <Label htmlFor="visitorName">Full Name *</Label>
                <Input
                  id="visitorName"
                  value={formData.visitorName}
                  onChange={(e) => handleInputChange("visitorName", e.target.value)}
                  placeholder="Enter visitor's full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitorEmail">Email Address *</Label>
                <Input
                  id="visitorEmail"
                  type="email"
                  value={formData.visitorEmail}
                  onChange={(e) => handleInputChange("visitorEmail", e.target.value)}
                  placeholder="visitor@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitorPhone">Phone Number</Label>
              <Input
                id="visitorPhone"
                value={formData.visitorPhone}
                onChange={(e) => handleInputChange("visitorPhone", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Visit Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Visit Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visitDate">Visit Date *</Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) => handleInputChange("visitDate", e.target.value)}
                  min={today}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitTime">Visit Time *</Label>
                <Input
                  id="visitTime"
                  type="time"
                  value={formData.visitTime}
                  onChange={(e) => handleInputChange("visitTime", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Visit</Label>
              <Select value={formData.purpose} onValueChange={(value) => handleInputChange("purpose", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose of visit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal Visit</SelectItem>
                  <SelectItem value="business">Business Meeting</SelectItem>
                  <SelectItem value="maintenance">Maintenance/Repair</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
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
                placeholder="Any special instructions or notes..."
                rows={3}
              />
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Options</h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="parkingReserved"
                  checked={formData.parkingReserved}
                  onCheckedChange={(checked) => handleInputChange("parkingReserved", checked)}
                />
                <Label htmlFor="parkingReserved" className="text-sm">
                  Reserve parking space (if available)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="documentAttached"
                  checked={formData.documentAttached}
                  onCheckedChange={(checked) => handleInputChange("documentAttached", checked)}
                />
                <Label htmlFor="documentAttached" className="text-sm">
                  Visitor will provide verification document
                </Label>
              </div>

              {formData.documentAttached && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="document">Upload Document (Optional)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="document"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">Accepted formats: PDF, JPG, PNG (Max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-primary/90">
              {isLoading ? "Creating Invitation..." : "Create Invitation"}
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
