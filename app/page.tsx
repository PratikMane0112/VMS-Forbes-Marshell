"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { Button } from "@/components/ui/button"
import { AuthProvider, useAuth } from "@/hooks/use-auth"
import { ResidentDashboard } from "@/components/dashboards/resident-dashboard"
import { ReceptionistDashboard } from "@/components/dashboards/receptionist-dashboard"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"

function AuthenticatedApp() {
  const { user, logout } = useAuth()

  if (!user) {
    return <AuthPage />
  }

  if (!user.verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Email Verification Required</h1>
          <p className="text-muted-foreground">Please check your email and verify your account to continue.</p>
          <Button onClick={logout} variant="outline">
            Back to Login
          </Button>
        </div>
      </div>
    )
  }

  // Render appropriate dashboard based on user role
  switch (user.role) {
    case "resident":
      return <ResidentDashboard />
    case "receptionist":
      return <ReceptionistDashboard />
    case "admin":
      return <AdminDashboard />
    default:
      return <div>Unknown user role</div>
  }
}

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Visitor Management</h1>
          <p className="text-muted-foreground mt-2">Secure visitor tracking and invitation system</p>
        </div>

        {isLogin ? <LoginForm /> : <RegisterForm />}

        <div className="text-center">
          <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="text-sm">
            {isLogin ? "Don't have an account? Register" : "Already have an account? Sign in"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  )
}
