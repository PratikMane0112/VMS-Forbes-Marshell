"use client"

import { useState, useEffect } from "react"
import { adminService, type SystemSettings } from "@/lib/admin"

export function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const data = await adminService.getSystemSettings()
      setSettings(data)
    } catch (err) {
      setError("Failed to load system settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setIsSaving(true)
      setError("")
      setSuccess("")

      await adminService.updateSystemSettings(settings)
      setSuccess("Settings saved successfully!")
    } catch (err) {
      setError("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all settings to default values?")) return

    try {
      setIsLoading(true)
// In a real implementation, this would reset
