"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Car, Plus, Edit, Trash2, Search, MapPin } from "lucide-react"
import { adminService, type ParkingSpace } from "@/lib/admin"

export function ParkingManagement() {
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([])
  const [filteredSpaces, setFilteredSpaces] = useState<ParkingSpace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSpace, setEditingSpace] = useState<ParkingSpace | null>(null)
  const [stats, setStats] = useState<any>(null)

  const [formData, setFormData] = useState({
    number: "",
    type: "standard" as ParkingSpace["type"],
    location: "",
    notes: "",
  })

  useEffect(() => {
    loadParkingSpaces()
    loadStats()
  }, [])

  useEffect(() => {
    filterSpaces()
  }, [parkingSpaces, searchTerm, typeFilter, statusFilter])

  const loadParkingSpaces = async () => {
    try {
      setIsLoading(true)
      const data = await adminService.getParkingSpaces()
      setParkingSpaces(data)
    } catch (err) {
      setError("Failed to load parking spaces")
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await adminService.getParkingStats()
      setStats(statsData)
    } catch (err) {
      console.error("Failed to load parking stats:", err)
    }
  }

  const filterSpaces = () => {
    let filtered = parkingSpaces

    if (searchTerm) {
      filtered = filtered.filter(
        (space) =>
          space.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          space.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          space.occupiedBy?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((space) => space.type === typeFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((space) => (statusFilter === "occupied" ? space.isOccupied : !space.isOccupied))
    }

    filtered.sort((a, b) => a.number.localeCompare(b.number))
    setFilteredSpaces(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      if (editingSpace) {
        await adminService.updateParkingSpace(editingSpace.id, formData)
      } else {
        await adminService.addParkingSpace({
          ...formData,
          isOccupied: false,
        })
      }

      await loadParkingSpaces()
      await loadStats()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed")
    }
  }

  const handleEdit = (space: ParkingSpace) => {
    setEditingSpace(space)
    setFormData({
      number: space.number,
      type: space.type,
      location: space.location,
      notes: space.notes || "",
    })
    setShowAddForm(true)
  }

  const handleDelete = async (spaceId: string) => {
    if (!confirm("Are you sure you want to delete this parking space?")) return

    try {
      await adminService.deleteParkingSpace(spaceId)
      await loadParkingSpaces()
      await loadStats()
    } catch (err) {
      setError("Failed to delete parking space")
    }
  }

  const resetForm = () => {
    setFormData({
      number: "",
      type: "standard",
      location: "",
      notes: "",
    })
    setEditingSpace(null)
    setShowAddForm(false)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "visitor":
        return "bg-primary/10 text-primary border-primary"
      case "handicap":
        return "bg-secondary/10 text-secondary border-secondary"
      case "reserved":
        return "bg-accent/10 text-accent border-accent"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading parking data...</p>
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

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spaces</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Parking capacity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupied</CardTitle>
              <Car className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.occupied}</div>
              <p className="text-xs text-muted-foreground">Currently in use</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Car className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.available}</div>
              <p className="text-xs text-muted-foreground">Ready for use</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <Car className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{Math.round((stats.occupied / stats.total) * 100)}%</div>
              <p className="text-xs text-muted-foreground">Current utilization</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Management Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Car className="h-5 w-5 mr-2 text-primary" />
                Parking Management
              </CardTitle>
              <CardDescription>Manage parking spaces and assignments</CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Space
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by space number, location, or occupant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="visitor">Visitor</SelectItem>
                <SelectItem value="handicap">Handicap</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingSpace ? "Edit Parking Space" : "Add New Parking Space"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Space Number *</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="P-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: ParkingSpace["type"]) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="visitor">Visitor</SelectItem>
                      <SelectItem value="handicap">Handicap</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ground Floor - Section A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or special instructions..."
                  rows={3}
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {editingSpace ? "Update Space" : "Add Space"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Parking Spaces Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSpaces.map((space) => (
          <Card
            key={space.id}
            className={`hover:shadow-md transition-shadow ${space.isOccupied ? "border-accent" : "border-secondary"}`}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-lg font-bold">{space.number}</div>
                  <Badge variant="outline" className={getTypeColor(space.type)}>
                    {space.type}
                  </Badge>
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {space.location}
                </div>

                <div className="flex items-center justify-center py-2">
                  <Car className={`h-8 w-8 ${space.isOccupied ? "text-accent" : "text-secondary"}`} />
                </div>

                <Badge
                  variant="outline"
                  className={`w-full justify-center ${
                    space.isOccupied
                      ? "bg-accent/10 text-accent border-accent"
                      : "bg-secondary/10 text-secondary border-secondary"
                  }`}
                >
                  {space.isOccupied ? "Occupied" : "Available"}
                </Badge>

                {space.isOccupied && space.occupiedBy && (
                  <div className="text-center text-sm">
                    <p className="font-medium">{space.occupiedBy}</p>
                    {space.occupiedAt && (
                      <p className="text-xs text-muted-foreground">Since {space.occupiedAt.toLocaleTimeString()}</p>
                    )}
                  </div>
                )}

                {space.notes && (
                  <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">{space.notes}</div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(space)} className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(space.id)}
                    className="text-accent border-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSpaces.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No parking spaces found</p>
              <p className="text-muted-foreground">
                {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Add your first parking space to get started"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
