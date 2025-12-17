'use client'

import { useEffect } from 'react'
import { App } from '@capacitor/app'
import { useRouter } from 'next/navigation'
import { Capacitor } from '@capacitor/core'

export const useBackButton = () => {
    const router = useRouter()

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return

        const handleBackButton = async () => {
            const canGoBack = window.history.length > 1
            // OR use router specific logic if needed, but window.history is standard

            App.addListener('backButton', ({ canGoBack: appCanGoBack }) => {
                // If we have history or if the App API says we can go back
                if (canGoBack || appCanGoBack) {
                    router.back()
                } else {
                    App.exitApp()
                }
            })
        }

        handleBackButton()

        return () => {
            App.removeAllListeners()
        }
    }, [router])
}
