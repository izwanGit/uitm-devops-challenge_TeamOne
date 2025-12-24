'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, ArrowRight, Loader } from 'lucide-react'
import Image from 'next/image'
import { createApiUrl } from '@/utils/apiConfig'

export default function MfaSetupPage() {
    const router = useRouter()
    const [step, setStep] = useState<'loading' | 'scan' | 'verify' | 'success'>('loading')
    const [qrCode, setQrCode] = useState('')
    const [_secret, setSecret] = useState('')
    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // On mount, fetch QR code
    useEffect(() => {
        const fetchSetup = async () => {
            try {
                const token = localStorage.getItem('tempAuthToken') || localStorage.getItem('authToken')
                if (!token) {
                    router.push('/auth')
                    return
                }

                const res = await fetch(createApiUrl('auth/mfa/setup'), {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await res.json()

                if (res.ok && data.success) {
                    setQrCode(data.data.qrCode)
                    setSecret(data.data.secret)
                    setStep('scan')
                } else {
                    setError('Failed to load MFA setup.')
                }
            } catch (_err) {
                setError('Connection error.')
            }
        }
        fetchSetup()
    }, [router])

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const token = localStorage.getItem('tempAuthToken') || localStorage.getItem('authToken')
            const res = await fetch(createApiUrl('auth/mfa/verify'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ token: code }) // Backend expects 'token' as the TOTP code
            })
            const data = await res.json()

            if (res.ok && data.success) {
                setStep('success')

                // If we got a full token back, store it and initialize auth!
                if (data.token) {
                    localStorage.setItem('authToken', data.token)
                    // Import and set cookie for server-side consistency
                    const { setCookie } = await import('@/utils/cookies')
                    setCookie('authToken', data.token, 7)

                    // Re-initialize auth store to pick up the new token immediately
                    const { default: useAuthStore } = await import('@/stores/authStore')
                    useAuthStore.getState().initializeAuth()
                }

                localStorage.removeItem('tempAuthToken') // cleanup
                setTimeout(() => {
                    window.location.href = '/'
                }, 2000)
            } else {
                setError(data.message || 'Invalid code. Please try again.')
            }
        } catch (_err) {
            setError('Verification failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8">

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Secure Your Account</h1>
                    <p className="text-slate-500 mt-2">Set up Two-Factor Authentication (2FA)</p>
                </div>

                {step === 'loading' && !error && (
                    <div className="flex justify-center py-10">
                        <Loader className="animate-spin text-blue-500" />
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center mb-6 text-sm font-medium">
                        {error}
                    </div>
                )}

                {(step === 'scan' || step === 'verify') && (
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                            {qrCode ? (
                                <div className="relative w-48 h-48 mx-auto">
                                    <Image src={qrCode} alt="Scan QR Code" fill className="object-contain" />
                                </div>
                            ) : (
                                <div className="h-48 flex items-center justify-center text-slate-400">Loading QR...</div>
                            )}
                            <p className="text-xs text-slate-500 mt-4">
                                Scan this QR code with <strong>Google Authenticator</strong> or your preferred 2FA app.
                            </p>
                        </div>

                        <form onSubmit={handleVerify}>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Enter 6-digit code
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-6"
                                placeholder="000000"
                                maxLength={6}
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={loading || code.length !== 6}
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? 'Verifying...' : 'Verify and Activate'}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>
                    </div>
                )}

                {step === 'success' && (
                    <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                        <div className="text-green-500 text-5xl mb-4">🎉</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">You&apos;re all set!</h3>
                        <p className="text-slate-600">Your account is now protected with 2FA.</p>
                        <p className="text-xs text-slate-400 mt-4">Redirecting you to dashboard...</p>
                    </div>
                )}
            </div>
        </div>
    )
}
