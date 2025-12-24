'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'
import Image from 'next/image'

const APK_URL = 'https://github.com/izwanGit/uitm-devops-challenge_TeamOne/releases/download/v1.0.0/rentverse-android.apk'

export default function MobileAppBanner() {
    const [isVisible, setIsVisible] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        // Detect mobile web (width <= 768px) and not native
        const isMobile = window.innerWidth <= 768
        const isNative = (window as any).Capacitor?.isNative || false
        const hasDismissed = localStorage.getItem('dismissedAppBanner')

        if (isMobile && !isNative && !hasDismissed) {
            // Show it after 3 seconds
            const timer = setTimeout(() => setIsVisible(true), 3000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleDismiss = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsVisible(false)
        setIsDismissed(true)
        localStorage.setItem('dismissedAppBanner', 'true')
    }

    const handleDownload = () => {
        window.open(APK_URL, '_blank')
    }

    if (!isVisible || isDismissed) return null

    return (
        <div className="fixed bottom-20 left-4 right-4 z-[9998] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-teal-100 shadow-2xl p-3 flex items-center justify-between gap-3 ring-1 ring-black/5">
                {/* Close Button */}
                <button
                    onClick={handleDismiss}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                >
                    <X size={14} />
                </button>

                {/* App Info */}
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-12 h-12 rounded-xl bg-teal-600 flex-shrink-0 flex items-center justify-center overflow-hidden p-1.5 shadow-inner">
                        <img
                            src="/logo-square.png"
                            alt="RentVerse"
                            className="w-full h-full object-contain brightness-0 invert"
                        />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate tracking-tight">RentVerse App</p>
                        <p className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1">
                            <Smartphone size={10} className="text-teal-500" />
                            Get the native experience
                        </p>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleDownload}
                    className="flex-shrink-0 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-200 active:scale-95 transition-all flex items-center gap-1.5"
                >
                    <Download size={14} />
                    INSTALL
                </button>
            </div>
        </div>
    )
}
