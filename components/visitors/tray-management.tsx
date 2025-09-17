"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Package, User, Clock, RefreshCw } from "lucide-react"
import { visitorService, type TrayInfo } from "@/lib/visitors"

export function TrayManagement() {
  const [trays, setTrays] = useState<TrayInfo[]>([])
  const [filteredTrays, setFilteredTrays] = useState<TrayInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState({ total: 0, available: 0, occupied: 0 })

  useEffect(() => {
    loadTrays()
    loadStats()
  }, [])

  useEffect(() => {
    filterTrays()
  }, [trays, searchTerm])

  const loadTrays = async () => {
    try {
      setIsLoading(true)
      const data = await visitorService.getAllTrays()
      setTrays(data)
    } catch (err) {
      setError("Failed to load tray information")
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const trayStats = await visitorService.getTrayStats()
      setStats(trayStats)
    } catch (err) {
      console.error("Failed to load tray stats:", err)
    }
  }

  const filterTrays = () => {
    let filtered = trays

    if (searchTerm) {
      filtered = filtered.filter(
        (tray) =>
          tray.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tray.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Sort by tray number
    filtered.sort((a, b) => a.number.localeCompare(b.number))

    setFilteredTrays(filtered)
  }

  const handleRefresh = async () => {
    await loadTrays()
    await loadStats()
  }

  const formatTime = (date?: Date) => {
    if (!date) return "N/A"
    return date.toLocaleTimeString("en-US", {
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
            <p className="text-muted-foreground">Loading tray information...</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trays</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">System capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Package className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.available}</div>
            <p className="text-xs text-muted-foreground">Ready for assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <Package className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.occupied}</div>
            <p className="text-xs text-muted-foreground">Currently assigned</p>
          </CardContent>
        </Card>
      </div>

      {/* Tray Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                Tray Management
              </CardTitle>
              <CardDescription>Monitor and manage visitor tray assignments</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by tray number or assigned visitor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tray Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredTrays.map((tray) => (
              <Card
                key={tray.number}
                className={`hover:shadow-md transition-shadow ${
                  tray.isAvailable ? "border-secondary" : "border-accent"
                }`}
              >
                <CardContent className="p-4 text-center">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center">
                      <Package className={`h-6 w-6 ${tray.isAvailable ? "text-secondary" : "text-accent"}`} />
                    </div>

                    <div className="font-mono text-sm font-medium">{tray.number}</div>

                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        tray.isAvailable
                          ? "bg-secondary/10 text-secondary border-secondary"
                          : "bg-accent/10 text-accent border-accent"
                      }`}
                    >
                      {tray.isAvailable ? "Available" : "Occupied"}
                    </Badge>

                    {!tray.isAvailable && tray.assignedTo && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-center text-xs text-muted-foreground">
                          <User className="h-3 w-3 mr-1" />
                          <span className="truncate" title={tray.assignedTo}>
                            {tray.assignedTo.length > 10 ? `${tray.assignedTo.substring(0, 10)}...` : tray.assignedTo}
                          </span>
                        </div>
                        <div className="flex items-center justify-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(tray.assignedAt)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTrays.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No trays found</p>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search criteria" : "No tray data available"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
