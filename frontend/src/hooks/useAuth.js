import { useState, useEffect, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * useAuth hook
 *
 * Centralized authentication guard hook.
 * Checks localStorage token, verifies with GET /api/auth/me,
 * exposes user identity, loading state, and logout functionality.
 */
export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('token')))

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    window.location.href = '/login'
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      setIsLoading(false)
      setIsAuthenticated(false)
      setUser(null)
      return
    }

    let isMounted = true

    async function verifyUser() {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!isMounted) return

        if (response.status === 200) {
          const data = await response.json()
          if (data.success && data.user) {
            setUser(data.user)
            setIsAuthenticated(true)
            localStorage.setItem('user', JSON.stringify(data.user))
          } else {
            logout()
          }
        } else {
          // Token invalid, expired, or user deleted
          logout()
        }
      } catch {
        // Network error during verification: retain cached user if available
        if (isMounted) {
          const cachedUser = localStorage.getItem('user')
          if (cachedUser) {
            try {
              setUser(JSON.parse(cachedUser))
              setIsAuthenticated(true)
            } catch {
              logout()
            }
          } else {
            logout()
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    verifyUser()

    return () => {
      isMounted = false
    }
  }, [logout])

  return { user, isLoading, isAuthenticated, logout }
}

export default useAuth
