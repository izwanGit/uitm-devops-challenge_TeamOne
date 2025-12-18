'use client'

import { useEffect } from 'react'
import useAuthStore from '@/stores/authStore'
import { useBackButton } from '@/hooks/useBackButton'

export default function AuthInitializer({ children }: { children?: React.ReactNode }) {
  const { initializeAuth } = useAuthStore()
  useBackButton()

  useEffect(() => {
    // Initialize auth state from localStorage on app start
    initializeAuth()
  }, [initializeAuth])

  // This component doesn't render anything
  return null
}
