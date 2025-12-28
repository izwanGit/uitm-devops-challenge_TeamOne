'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, Download, Smartphone } from 'lucide-react'
import { Capacitor } from '@capacitor/core'

const APK_DOWNLOAD_URL = 'https://github.com/izwanGit/uitm-devops-challenge_TeamOne/raw/main/releases/rentverse-android.apk'

export default function AndroidAppPromo() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // PERMANENT FIX: If this is native platform, NEVER show this.
        if (Capacitor.isNativePlatform()) {
            return;
        }

        // Check if user has already seen this popup in this session
        const hasSeenPromo = sessionStorage.getItem('hasSeenAndroidPromo')

        // Only show on desktop (width > 768px)
        const isDesktop = window.innerWidth > 768

        // Detect if we are already in the native app
        const isNative = Capacitor.isNativePlatform()

        if (!hasSeenPromo && isDesktop && !isNative) {
            // Show after a short delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 2000)
            return () => clearTimeout(timer)
        }
    }, [])

    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNative) {
        return null;
    }

    const handleClose = () => {
        setIsVisible(false)
        sessionStorage.setItem('hasSeenAndroidPromo', 'true')
    }

    const handleDownload = () => {
        sessionStorage.setItem('hasSeenAndroidPromo', 'true')
        window.open(APK_DOWNLOAD_URL, '_blank')
        setIsVisible(false)
    }

    if (!isVisible) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-300"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-4 animate-in zoom-in-95 fade-in duration-300">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 p-6 relative">
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                            aria-label="Close"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-2xl p-2 shadow-lg flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/logo-square.png"
                                    alt="Rentverse"
                                    className="w-12 h-12 object-contain"
                                />
                            </div>
                            <div className="text-white">
                                <h2 className="text-xl font-bold">Try Rentverse on Android!</h2>
                                <p className="text-white/80 text-sm mt-1">Get the mobile experience</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                                <Smartphone className="text-teal-600" size={20} />
                            </div>
                            <div>
                                <p className="text-slate-700 text-sm">
                                    Experience RentVerse on your Android device! Download the APK and enjoy seamless property browsing on the go.
                                </p>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="bg-slate-50 rounded-xl p-4 mb-6">
                            <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Features</p>
                            <ul className="text-sm text-slate-600 space-y-1">
                                <li>✓ Native Android experience</li>
                                <li>✓ Push notifications</li>
                                <li>✓ Offline access to saved properties</li>
                            </ul>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                            >
                                Maybe later
                            </button>
                            <button
                                onClick={handleDownload}
                                className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Download size={18} />
                                Download APK
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
