"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  email: string
  fullName: string
  role: string
  isLoggedIn: boolean
}

interface AuthContextType {
  user: User | null
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  logout: () => {},
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const loadUserFromStorage = () => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user")
      const token = localStorage.getItem("access_token")

      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        } catch (error) {
          console.error("Failed to parse user from localStorage", error)
          localStorage.clear()
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    } else {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("AuthProvider: Initializing user from storage")
    loadUserFromStorage()

    const handleStorageUpdate = () => {
      console.log("AuthProvider: Storage updated")
      loadUserFromStorage()
    }

    window.addEventListener("storageUpdated", handleStorageUpdate)
    return () => window.removeEventListener("storageUpdated", handleStorageUpdate)
  }, [])

  useEffect(() => {
    if (loading || typeof window === "undefined") {
      console.log("AuthProvider: Skipping redirect check", { loading, pathname })
      return
    }

    const isLoginPage = pathname === "/login"
    console.log("AuthProvider: Checking redirect", { user: !!user, isLoginPage, pathname })

    if (!user && !isLoginPage) {
      console.log("AuthProvider: Redirecting to /login")
      router.replace("/login")
    } else if (user && isLoginPage) {
      console.log("AuthProvider: Redirecting to /courses")
      router.replace("/courses")
    }
  }, [user, loading, pathname, router])

  const logout = () => {
    if (typeof window !== "undefined") {
      console.log("AuthProvider: Initiating logout")
      setUser(null)
      localStorage.clear()
      window.dispatchEvent(new Event("storageUpdated"))
      router.replace("/login") 
    }
  }

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}