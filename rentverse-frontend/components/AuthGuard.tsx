'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/stores/authStore'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
}

/**
 * AuthGuard component to handle client-side authentication redirects
 * - For auth pages (login/signup): redirects authenticated users away
 * - For protected pages: redirects unauthenticated users to login
 */
export default function AuthGuard({
  children,
  redirectTo = '/',
  requireAuth = false
}: AuthGuardProps) {
  const { isLoggedIn, initializeAuth } = useAuthStore()
  const router = useRouter()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize auth state on mount
    initializeAuth()
    setIsInitialized(true)
  }, [initializeAuth])

  useEffect(() => {
    // Only redirect after initialization is complete
    if (!isInitialized) return

    if (requireAuth && !isLoggedIn) {
      // Redirect to login if auth is required but user is not logged in
      router.push('/auth/login')
    } else if (!requireAuth && isLoggedIn) {
      // Redirect away from auth pages if user is already logged in
      router.push(redirectTo)
    }
  }, [isLoggedIn, requireAuth, redirectTo, router, isInitialized])

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // For auth pages: don't render if user is logged in
  if (!requireAuth && isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  // For protected pages: don't render if user is not logged in
  if (requireAuth && !isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}