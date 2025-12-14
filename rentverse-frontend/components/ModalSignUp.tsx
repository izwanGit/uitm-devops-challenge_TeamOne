'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'
import { ArrowLeft, Check, ShieldCheck, User, Mail, Calendar } from 'lucide-react'
import ButtonFilled from '@/components/ButtonFilled'
import InputEmail from '@/components/InputEmail'
import InputName from '@/components/InputName'
import InputDate from '@/components/InputDate'
import InputPassword from '@/components/InputPassword'
import InputPhone from '@/components/InputPhone'
import useAuthStore from '@/stores/authStore'
import BoxError from '@/components/BoxError'

interface ModalSignUpProps {
  isModal?: boolean
}

function ModalSignUp({ isModal = true }: ModalSignUpProps) {
  const {
    firstName,
    lastName,
    birthdate,
    email,
    phone,
    signUpPassword,
    isLoading,
    error,
    setFirstName,
    setLastName,
    setBirthdate,
    setEmail,
    setPhone,
    setSignUpPassword,
    isSignUpFormValid,
    submitSignUp,
  } = useAuthStore()
  const router = useRouter()

  const [showSuccess, setShowSuccess] = React.useState(false)

  const handleBackButton = () => {
    router.back()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await submitSignUp()
    if (success) {
      setShowSuccess(true)
    }
  }

  // 🛡️ A++ UI: Visual Password Validation
  const passwordRequirements = [
    { label: "8+ characters", valid: signUpPassword.length >= 8 },
    { label: "Number (0-9)", valid: /\d/.test(signUpPassword) },
    { label: "Uppercase (A-Z)", valid: /[A-Z]/.test(signUpPassword) },
  ]

  const allPasswordValid = passwordRequirements.every(r => r.valid)

  const containerContent = (
    <div className={clsx([
      isModal ? 'shadow-2xl' : 'border border-slate-200',
      'bg-white rounded-3xl max-w-lg w-full p-8 md:p-10 relative overflow-hidden',
    ])}>
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-teal-300"></div>

      {/* Header */}
      <div className="text-center mb-8 relative">
        <button
          onClick={handleBackButton}
          className="absolute left-0 top-1 p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-serif font-bold text-slate-900">
          Create your account
        </h2>
        <p className="text-slate-500 text-sm mt-1">Step 2 of 2</p>
      </div>

      {/* Error Message */}
      {error && !error.includes('already exists') && (
        <div className="mb-6 animate-pulse">
          <BoxError errorTitle="Registration Failed" errorDescription={error} />
        </div>
      )}

      {/* Success Message (Verification Required) */}
      {showSuccess ? (
        <div className="text-center py-10 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your inbox</h2>
          <p className="text-slate-600 mb-8 max-w-sm mx-auto">
            We&apos;ve sent a verification link to <strong>{email}</strong>. Please click the link to activate your account.
          </p>
          <ButtonFilled onClick={() => router.push('/auth')}>
            Back to Log in
          </ButtonFilled>
        </div>
      ) : (
        /* Account Exists Overlay */
        error && error.includes('already exists') ? (
          <div className="text-center py-10 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Account already exists</h2>
            <p className="text-slate-600 mb-8">
              It looks like <strong>{email}</strong> is already registered.
            </p>
            <div className="space-y-3">
              <ButtonFilled onClick={() => router.push('/auth')}>
                Log in instead
              </ButtonFilled>
              <button
                onClick={() => window.location.reload()}
                className="text-slate-500 hover:text-slate-800 text-sm font-medium"
              >
                Use a different email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ... existing form content ... */}
            {/* SECTION 1: IDENTITY */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-medium border-b border-slate-100 pb-2">
                <User size={18} className="text-teal-600" />
                <h3>Legal Identity</h3>
              </div>

              <div>
                <InputName
                  firstName={firstName}
                  lastName={lastName}
                  onFirstNameChange={(e) => setFirstName(e.target.value)}
                  onLastNameChange={(e) => setLastName(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-1.5 ml-1">
                  Matches your government ID.
                </p>
              </div>

              <div className="relative">
                <InputDate
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  required
                />
                <Calendar size={18} className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* SECTION 2: CONTACT */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-medium border-b border-slate-100 pb-2">
                <Mail size={18} className="text-teal-600" />
                <h3>Contact Details</h3>
              </div>

              <InputEmail
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
              />
              <InputPhone
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Mobile number"
                required
              />
            </div>

            {/* SECTION 3: SECURITY (Password) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-medium border-b border-slate-100 pb-2">
                <ShieldCheck size={18} className="text-teal-600" />
                <h3>Security</h3>
              </div>

              <div className="relative">
                <InputPassword
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  showStrengthIndicator={false}
                />
              </div>

              {/* A++ UI: Password Checklist */}
              <div className={clsx(
                "grid grid-cols-3 gap-2 p-3 rounded-xl transition-colors duration-300",
                allPasswordValid ? "bg-teal-50 border border-teal-100" : "bg-slate-50"
              )}>
                {passwordRequirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className={clsx(
                      "w-4 h-4 rounded-full flex items-center justify-center border transition-all",
                      req.valid ? "bg-teal-500 border-teal-500" : "border-slate-300 bg-white"
                    )}>
                      {req.valid && <Check size={10} className="text-white" strokeWidth={4} />}
                    </div>
                    <span className={clsx(
                      "text-xs font-medium transition-colors",
                      req.valid ? "text-teal-700" : "text-slate-500"
                    )}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Module 1 Hint */}
              <p className="text-xs text-slate-500 italic bg-blue-50 p-2 rounded text-center">
                ✨ <strong>Tip:</strong> You can enable 2-Factor Authentication (MFA) after signing up for extra security.
              </p>
            </div>

            {/* FOOTER */}
            <div className="pt-2">
              <div className="text-xs text-slate-500 text-center mb-4 leading-relaxed">
                By selecting <strong>Agree and continue</strong>, I agree to Rentverse&apos;s{' '}
                <span className="text-teal-600 font-medium cursor-pointer">Terms of Service</span> and{' '}
                <span className="text-teal-600 font-medium cursor-pointer">Privacy Policy</span>.
              </div>

              <ButtonFilled
                type="submit"
                disabled={!isSignUpFormValid() || isLoading}
                className={clsx(
                  "transform transition-all active:scale-[0.98]",
                  isLoading ? "opacity-80 cursor-wait" : "hover:shadow-lg"
                )}
              >
                {isLoading ? 'Creating Account...' : 'Agree and continue'}
              </ButtonFilled>

              <div className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link href="/auth" className="text-blue-600 font-semibold hover:underline">
                  Log in
                </Link>
              </div>
            </div>
          </form>
        )
      )}
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

export default ModalSignUp