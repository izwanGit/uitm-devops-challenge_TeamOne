'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SignatureCanvas from 'react-signature-canvas'
import { AgreementsApiClient, Agreement } from '@/utils/agreementsApiClient'
import ContentWrapper from '@/components/ContentWrapper'
import { Loader2 } from 'lucide-react'
import { getApiBaseUrl } from '@/utils/apiConfig'
import dynamic from 'next/dynamic'

const MobilePdfViewer = dynamic(() => import('@/components/MobilePdfViewer'), {
    ssr: false,
    loading: () => <div className="h-[400px] flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-slate-400" /></div>
})

function SigningPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const leaseId = searchParams.get('id')
    const sigCanvas = useRef<SignatureCanvas>(null)

    const [agreement, setAgreement] = useState<Agreement | null>(null)
    const [loading, setLoading] = useState(false)
    const [signing, setSigning] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [token, setToken] = useState<string | null>(null)
    const [countdown, setCountdown] = useState(15)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        setIsMobile(window.innerWidth < 768)
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        // Client-side token retrieval
        const storedToken = localStorage.getItem('authToken')
        if (storedToken) {
            setToken(storedToken)
        }
    }, [])

    const generateAndLoad = useCallback(async () => {
        if (!token || !leaseId) return
        setLoading(true)
        setError('')
        try {
            // First, try to fetch existing or generate
            const res = await AgreementsApiClient.generate(leaseId, token)
            setAgreement(res.agreement)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load agreement')
        } finally {
            setLoading(false)
        }
    }, [token, leaseId])

    useEffect(() => {
        if (token && leaseId) {
            generateAndLoad()
        }
    }, [token, leaseId, generateAndLoad])

    const clearSignature = () => {
        sigCanvas.current?.clear()
    }

    const submitSignature = async () => {
        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
            setError('Please draw your signature first')
            return
        }

        if (!agreement?.id || !token) return

        setSigning(true)
        setError('')

        try {
            const signatureBase64 = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
            await AgreementsApiClient.sign(agreement.id, signatureBase64, token)
            setSuccess(true)
            setSigning(false)
            // Refresh agreement to show signed status
            generateAndLoad()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to submit signature')
            setSigning(false)
        }
    }

    // Redirect to rents view 15 seconds after signing
    useEffect(() => {
        if (!success || !leaseId) return

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    router.push(`/rents/view?id=${leaseId}`)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [success, leaseId, router])

    const getStatusColor = (status: string) => {
        return status === 'SIGNED'
            ? 'bg-teal-50 text-teal-700 border-teal-200'
            : 'bg-orange-50 text-orange-700 border-orange-200';
    }

    if (!token || !leaseId) {
        return (
            <ContentWrapper>
                <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
                    <div className="text-center space-y-4">
                        <div className="animate-pulse w-12 h-12 bg-slate-200 rounded-full mx-auto"></div>
                        <p className="text-slate-500">
                            {!token ? 'Please log in to sign your lease.' : 'Lease ID missing.'}
                        </p>
                    </div>
                </div>
            </ContentWrapper>
        )
    }

    if (loading && !agreement) {
        return (
            <ContentWrapper>
                <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                        <p className="text-slate-500 font-medium">Retrieving Secure Agreement...</p>
                    </div>
                </div>
            </ContentWrapper>
        )
    }

    return (
        <ContentWrapper>
            <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Header Section */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight">
                            Digital Lease Agreement
                        </h1>
                        <p className="text-slate-500 max-w-2xl mx-auto">
                            Review and securely sign your rental contract. This document is cryptographically verified to ensure authenticity.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm max-w-3xl mx-auto flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-teal-50 border border-teal-200 text-teal-800 px-6 py-4 rounded-lg shadow-sm max-w-3xl mx-auto flex items-center gap-3">
                            <div className="bg-teal-100 p-2 rounded-full">
                                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <div>
                                <p className="font-bold">Successfully Signed!</p>
                                <p className="text-sm text-teal-700">The document is now legally binding and secured with a tamper-evident digital hash.</p>
                            </div>
                        </div>
                    )}

                    {agreement && (
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200/60">
                            {/* Toolbar */}
                            <div className="bg-white border-b border-slate-100 p-4 sm:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg">
                                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Document ID</p>
                                        <p className="text-sm font-semibold text-slate-700 font-mono">{agreement.documentId?.split('-')[0]}...</p>
                                    </div>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border tracking-wide uppercase ${getStatusColor(agreement.status)}`}>
                                    {agreement.status.replace('_', ' ')}
                                </span>
                            </div>

                            {/* Split Layout for Desktop */}
                            <div className="flex flex-col lg:flex-row">

                                {/* PDF Viewer - Dominant Area */}
                                <div className="lg:w-2/3 bg-slate-100/50 p-4 md:p-6 lg:border-r border-slate-200">
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[450px] md:h-[600px] overflow-hidden relative">
                                        {isMobile ? (
                                            <MobilePdfViewer
                                                url={`${getApiBaseUrl()}${agreement.pdfUrl || ''}`}
                                                className="w-full h-full"
                                            />
                                        ) : (
                                            /* Use backend URL directly for proper Android WebView support */
                                            <iframe
                                                src={`${getApiBaseUrl()}${agreement.pdfUrl || ''}`}
                                                className="w-full h-full border-0"
                                                title="Lease Agreement"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Action Panel - Sidebar */}
                                <div className="lg:w-1/3 p-6 sm:p-8 flex flex-col justify-center bg-white">
                                    {agreement.status !== 'SIGNED' && !success ? (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 font-serif mb-1">Sign Document</h3>
                                                <p className="text-sm text-slate-500">Please sign in the box below to execute this agreement.</p>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Signature</label>
                                                <div className="border-2 border-slate-200 border-dashed rounded-xl bg-slate-50 hover:bg-white hover:border-slate-300 transition-colors relative overflow-hidden">
                                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-200 text-4xl font-serif italic select-none">
                                                        Sign Here
                                                    </div>
                                                    <SignatureCanvas
                                                        ref={sigCanvas}
                                                        canvasProps={{
                                                            className: 'w-full h-40 relative z-10 cursor-crosshair',
                                                            style: { width: '100%', height: '160px' }
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <p className="text-slate-400">Use your mouse or finger to draw</p>
                                                    <button
                                                        onClick={clearSignature}
                                                        className="text-teal-600 hover:text-teal-700 font-medium hover:underline"
                                                    >
                                                        Clear & Redraw
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-slate-100">
                                                <button
                                                    onClick={submitSignature}
                                                    disabled={signing}
                                                    className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                                                >
                                                    {signing ? (
                                                        <><Loader2 className="w-5 h-5 animate-spin" /> Finalizing...</>
                                                    ) : (
                                                        <>Sign & Finalize Agreement <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
                                                    )}
                                                </button>
                                                <p className="mt-4 text-[10px] text-slate-400 text-center leading-relaxed">
                                                    By signing, you consent to the terms outlined in this document.
                                                    A digital signature hash {agreement.originalHash?.substring(0, 8)}... has been generated for verification.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-6 py-8">
                                            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-teal-50/50">
                                                <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 font-serif mb-2">Agreement Verified</h3>
                                                <p className="text-sm text-slate-500">This document has been securely signed and timestamped.</p>
                                            </div>

                                            {/* Countdown redirect notice */}
                                            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                                                <p className="text-sm text-teal-700">
                                                    Redirecting to your rentals in <span className="font-bold text-lg">{countdown}</span> seconds...
                                                </p>
                                            </div>

                                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-left">
                                                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Final Checksum</p>
                                                <p className="font-mono text-xs text-slate-600 break-all">{agreement.finalHash}</p>
                                            </div>

                                            <a
                                                href={`/api/pdf${agreement.pdfUrl?.replace('/uploads', '') || ''}`}
                                                target="_blank"
                                                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                Download Signed PDF
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ContentWrapper>
    )
}

export default function SigningPage() {
    return (
        <Suspense fallback={
            <ContentWrapper>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">Loading...</div>
                </div>
            </ContentWrapper>
        }>
            <SigningPageContent />
        </Suspense>
    )
}
