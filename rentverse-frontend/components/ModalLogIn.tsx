'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import React, { ChangeEvent, useState } from 'react'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import BoxError from '@/components/BoxError'
import InputPassword from '@/components/InputPassword'
import InputEmail from '@/components/InputEmail'
import ButtonFilled from '@/components/ButtonFilled'
import useAuthStore from '@/stores/authStore'
import { createApiUrl } from '@/utils/apiConfig'

interface ModalLogInProps {
  isModal?: boolean
}

function ModalLogIn({ isModal = true }: ModalLogInProps) {
  const {
    email,
    password,
    error,
    setEmail,
    setPassword,
    isLoginFormValid,
    validateToken, // Uses existing validation method
  } = useAuthStore()

  const router = useRouter()

  // 🛡️ MFA State
  const [showMfaInput, setShowMfaInput] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ssoStatus, setSsoStatus] = useState<{ title: string; message: string } | null>(null)
  const [showResend, setShowResend] = useState(false)
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleBackButton = () => {
    router.back()
  }

  const handleResendVerification = async () => {
    if (!email) return
    setResendStatus('loading')
    try {
      const res = await fetch(createApiUrl('auth/resend-verification'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setResendStatus('success')
        setLocalError(null)
      } else {
        setResendStatus('error')
        setLocalError(data.message || 'Failed to resend email')
      }
    } catch (err) {
      setResendStatus('error')
      setLocalError('Connection error mapping resend.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setShowResend(false)
    setIsSubmitting(true)

    try {
      // 1. Call API directly for the custom MFA flow
      const res = await fetch(createApiUrl('auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          mfaCode: showMfaInput ? mfaCode : undefined
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Handle errors
        if (res.status === 403 && data.code === 'UNVERIFIED_EMAIL') {
          setLocalError('Please verify your email address first. Check your inbox.')
          setShowResend(true)
        } else if (res.status === 403 && data.message.includes('locked')) {
          setLocalError(data.message) // Account Locked
        } else {
          setLocalError(data.message || 'Login failed')
        }
        setIsSubmitting(false)
        return
      }

      // 🛡️ 2. Check for MFA Requirement

      // CASE A: Force Setup (First Login)
      if (data.requireMfaSetup) {
        // Store temp token for setup page
        if (data.tempToken) {
          localStorage.setItem('tempAuthToken', data.tempToken)
        }
        router.push('/mfa-setup')
        return
      }

      // CASE B: Verify Code
      if (data.requireMfa) {
        setShowMfaInput(true)
        setLocalError(null)
        setIsSubmitting(false)
        return
      }

      // ✅ 3. Success!
      if (data.data?.token) {
        // Store token
        localStorage.setItem('authToken', data.data.token)

        // Sync Store using valid function
        await validateToken()

        // Redirect
        router.push('/')
      }

    } catch (err) {
      console.error(err)
      setLocalError('Connection error. Please try again.')
      setIsSubmitting(false)
    }
  }

  const containerContent = (
    <div className={clsx([
      isModal ? 'shadow-xl' : 'border border-slate-400',
      'bg-white rounded-3xl max-w-md w-full p-8 transition-all duration-300',
    ])}>
      {/* Header */}
      <div className="text-center mb-6 relative">
        <ArrowLeft onClick={handleBackButton} size={20}
          className="absolute left-0 top-1 text-slate-800 cursor-pointer hover:text-slate-600" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          {showMfaInput ? 'Security Verification' : 'Login or Sign up'}
        </h2>
        <div className="w-full h-px bg-slate-200 mt-4"></div>
      </div>

      {/* Content */}
      <div className="mb-8">
        {(error || localError) && (
          <div className="mb-6">
            <BoxError errorTitle="Login Failed" errorDescription={error || localError || ''} />
            {showResend && resendStatus !== 'success' && (
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendStatus === 'loading'}
                  className="text-sm text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  {resendStatus === 'loading' ? (
                    'Sending new link...'
                  ) : (
                    <>Didn&apos;t get the email? Resend link</>
                  )}
                </button>
              </div>
            )}
            {resendStatus === 'success' && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                <p className="text-sm text-green-700 font-medium">✅ Verification email resent! Check your inbox.</p>
              </div>
            )}
          </div>
        )}

        {/* SSO Status Message */}
        {ssoStatus && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <ShieldAlert className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-blue-900 text-sm">{ssoStatus.title}</h5>
              <p className="text-xs text-blue-700 mt-1">{ssoStatus.message}</p>
            </div>
          </div>
        )}


        <div className="space-y-4">
          {/* STANDARD LOGIN FORM */}
          {!showMfaInput && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Email</label>
                <InputEmail
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-900">Password</label>
                  <a href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                    Forgot password?
                  </a>
                </div>
                <InputPassword
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  showStrengthIndicator={false}
                />
              </div>

              <ButtonFilled
                type="submit"
                disabled={isSubmitting || !isLoginFormValid()}
              >
                {isSubmitting ? 'Logging in...' : 'Log in'}
              </ButtonFilled>
            </form>
          )}

          {/* 🛡️ MFA CHALLENGE FORM */}
          {showMfaInput && (
            <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4 text-center">
                <ShieldAlert className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="text-blue-900 font-semibold">2-Factor Authentication</h3>
                <p className="text-xs text-blue-700 mt-1">
                  Enter the 6-digit code from your authenticator app.
                </p>
              </div>

              <label className="block text-sm font-medium text-slate-900 mb-2 text-center">
                Authentication Code
              </label>
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none mb-6"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />

              <ButtonFilled
                type="submit"
                disabled={isSubmitting || mfaCode.length !== 6}
              >
                {isSubmitting ? 'Verifying...' : 'Verify Code'}
              </ButtonFilled>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setShowMfaInput(false)}
                  className="text-sm text-slate-500 hover:text-slate-800 underline"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}

          {!showMfaInput && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSsoStatus({
                  title: 'Security Compliance Mode',
                  message: 'External SSO providers are disabled during security audit to enforce MFA testing.'
                })}
                className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-4 rounded-xl transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>

              <div className="mt-6 text-center text-sm text-slate-600">
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="text-blue-600 font-semibold hover:underline">
                  Sign up
                </Link>
              </div>
            </>
          )}
        </div>
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

export default ModalLogIn