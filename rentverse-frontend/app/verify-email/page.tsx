'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, CheckCircle, XCircle } from 'lucide-react'

function VerifyEmailContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
    const [message, setMessage] = useState('Verifying your email...')

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setMessage('Invalid verification link.')
            return
        }

        const verify = async () => {
            try {
                const res = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                })
                const data = await res.json()

                if (res.ok && data.success) {
                    setStatus('success')
                    setMessage(data.message)
                    setTimeout(() => {
                        router.push('/auth')
                    }, 3000)
                } else {
                    setStatus('error')
                    setMessage(data.message || 'Verification failed.')
                }
            } catch (_err) {
                setStatus('error')
                setMessage('Connection error. Please try again.')
            }
        }

        verify()
    }, [token, router])

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center">
                {status === 'verifying' && (
                    <div className="animate-pulse">
                        <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Verifying Email</h2>
                        <p className="text-slate-600">Please wait while we verify your account...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="animate-in fade-in zoom-in duration-300">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Email Verified!</h2>
                        <p className="text-slate-600 mb-6">{message}</p>
                        <p className="text-sm text-slate-400">Redirecting to login...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="animate-in fade-in zoom-in duration-300">
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Verification Failed</h2>
                        <p className="text-slate-600 mb-6">{message}</p>
                        <button
                            onClick={() => router.push('/auth')}
                            className="bg-slate-900 text-white px-6 py-2 rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
                <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center animate-pulse">
                    <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Loading...</h2>
                </div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    )
}
