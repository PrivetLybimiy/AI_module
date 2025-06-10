"use client"

import { useEffect } from "react"
import { useAuth } from "@/components/auth-provider"

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading || !user) {
    return null 
  }

  return <>{children}</>
}