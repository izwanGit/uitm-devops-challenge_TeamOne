'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import clsx from 'clsx'
import InputEmail from './InputEmail'
import ButtonFilled from './ButtonFilled'
import useAuthStore from '@/stores/authStore'
import { createApiUrl } from '@/utils/apiConfig'

interface ModalEmailCheckProps {
  isModal?: boolean
}

function ModalEmailCheck({ isModal = true }: Readonly<ModalEmailCheckProps>) {
  const router = useRouter()
  const [localError, setLocalError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const {
    email,
    setEmail,
    validateEmail,
  } = useAuthStore()

  const isEmailValid = validateEmail(email)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setIsChecking(true)

    try {
      // 1. Call API directly
      const res = await fetch(createApiUrl('auth/check-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()
      console.log("🔍 Email Check Result:", data)

      // 2. Smart Redirection Logic
      if (data.available === true) {
        // ✅ Case A: New User -> Go to Sign Up
        console.log("✨ New user detected. Going to Sign Up.")
        router.push('/auth/signup')
      } else {
        // 🏠 Case B: Existing User -> Go to Login
        console.log("👋 Existing user detected. Going to Login.")
        router.push('/auth/login')
      }

    } catch (err) {
      console.error("Check failed", err)
      setLocalError("Connection error. Please try again.")
    } finally {
      setIsChecking(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = createApiUrl('auth/google')
  }

  const containerContent = (
    <div className={clsx([
      isModal ? 'shadow-xl' : 'border border-slate-400',
      'bg-white rounded-3xl max-w-md w-full p-8',
    ])}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">
          Log in or sign up
        </h2>
        <div className="w-full h-px bg-slate-200 mt-4"></div>
      </div>

      <div className="mb-8">
        <p className="text-lg text-slate-600 text-center mb-6">
          Welcome to Rentverse
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputEmail
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setLocalError(null)
            }}
            placeholder="Email"
            required
          />

          {/* Error Box (Only for connection errors now) */}
          {localError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-red-600 font-bold text-xs">!</span>
              </div>
              <p className="text-sm font-medium">{localError}</p>
            </div>
          )}

          <ButtonFilled
            type="submit"
            disabled={!isEmailValid || isChecking}
          >
            {isChecking ? 'Checking...' : 'Continue'}
          </ButtonFilled>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="px-3 text-sm text-slate-500">or</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center px-4 py-3 border border-slate-300 rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors duration-200 font-medium"
        >
          <Image
            src="https://res.cloudinary.com/dd1f3rawl/image/upload/f_webp/v1759432485/rentverse-base/google_tsn5nt.png"
            alt="Google"
            width={20}
            height={20}
            className="mr-3"
          />
          Sign in with Google
        </button>
      </div>
    </div>
  )

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        {containerContent}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-4">
      {containerContent}
    </div>
  )
}

export default ModalEmailCheck