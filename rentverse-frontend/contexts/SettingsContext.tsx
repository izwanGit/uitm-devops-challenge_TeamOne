'use client'

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useMemo } from 'react'

// Import translations
import en from '@/translations/en.json'
import ms from '@/translations/ms.json'

type TranslationData = typeof en

const translations: Record<string, TranslationData> = { en, ms }

interface SettingsContextType {
    darkMode: boolean
    language: string
    currency: string
    setDarkMode: (val: boolean) => void
    setLanguage: (val: string) => void
    setCurrency: (val: string) => void
    formatPrice: (priceInMYR: number) => string
    t: (key: string) => string
    isLoading: boolean
    reload: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

import { createApiUrl } from '@/utils/apiConfig'

// Exchange rates (approximate - for demo)
const EXCHANGE_RATES: Record<string, number> = {
    MYR: 1,
    USD: 0.21,
    SGD: 0.28,
    EUR: 0.19,
}

const CURRENCY_SYMBOLS: Record<string, string> = {
    MYR: 'RM',
    USD: '$',
    SGD: 'S$',
    EUR: '€',
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [darkMode, setDarkModeState] = useState(false)
    const [language, setLanguageState] = useState('en')
    const [currency, setCurrencyState] = useState('MYR')
    const [isLoading, setIsLoading] = useState(true)
    const hasLoadedRef = useRef(false)

    // Load settings only once on mount
    useEffect(() => {
        if (hasLoadedRef.current) return
        hasLoadedRef.current = true

        const loadSettings = async () => {
            try {
                // First load from localStorage (instant, source of truth for appearance)
                const storedDarkMode = localStorage.getItem('darkMode')
                const storedLanguage = localStorage.getItem('language')
                const storedCurrency = localStorage.getItem('currency')

                // Apply localStorage values immediately (this is the source of truth)
                if (storedDarkMode !== null) setDarkModeState(storedDarkMode === 'true')
                if (storedLanguage) setLanguageState(storedLanguage)
                if (storedCurrency) setCurrencyState(storedCurrency)

                // Then try to load from API if logged in
                // But DON'T override localStorage preferences for appearance settings
                const token = localStorage.getItem('authToken')
                if (token) {
                    const res = await fetch(createApiUrl('settings'), {
                        headers: { Authorization: `Bearer ${token}` }
                    })

                    if (res.ok) {
                        const data = await res.json()
                        if (data.success) {
                            // Only override from API if localStorage doesn't have a preference set
                            // This prevents the "flash" where API overrides user's local choice
                            if (storedDarkMode === null && data.data.darkMode !== undefined) {
                                setDarkModeState(data.data.darkMode)
                                localStorage.setItem('darkMode', String(data.data.darkMode))
                            }
                            if (!storedLanguage && data.data.language) {
                                setLanguageState(data.data.language)
                                localStorage.setItem('language', data.data.language)
                            }
                            if (!storedCurrency && data.data.currency) {
                                setCurrencyState(data.data.currency)
                                localStorage.setItem('currency', data.data.currency)
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to load settings:', err)
            } finally {
                setIsLoading(false)
            }
        }

        loadSettings()
    }, [])

    // Apply dark mode to document
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [darkMode])

    const setDarkMode = (val: boolean) => {
        setDarkModeState(val)
        localStorage.setItem('darkMode', String(val))
    }

    const setLanguage = (val: string) => {
        setLanguageState(val)
        localStorage.setItem('language', val)
    }

    const setCurrency = (val: string) => {
        setCurrencyState(val)
        localStorage.setItem('currency', val)
    }

    const reload = async () => {
        const token = localStorage.getItem('authToken')
        if (!token) return

        try {
            const res = await fetch(createApiUrl('settings'), {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                const data = await res.json()
                if (data.success) {
                    setDarkMode(data.data.darkMode)
                    setLanguage(data.data.language)
                    setCurrency(data.data.currency)
                }
            }
        } catch (err) {
            console.error('Failed to reload settings:', err)
        }
    }

    const formatPrice = (priceInMYR: number): string => {
        const rate = EXCHANGE_RATES[currency] || 1
        const symbol = CURRENCY_SYMBOLS[currency] || 'RM'
        const converted = priceInMYR * rate

        // Format with appropriate decimals
        if (currency === 'MYR') {
            return `${symbol}${converted.toLocaleString()}`
        }
        return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    // Translation function - memoized to prevent re-renders
    const t = useMemo(() => {
        const currentTranslations = translations[language] || translations.en

        return (key: string): string => {
            // Key format: "section.key" e.g. "nav.home"
            const parts = key.split('.')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let value: any = currentTranslations

            for (const part of parts) {
                if (value && typeof value === 'object' && part in value) {
                    value = value[part]
                } else {
                    // Return key if translation not found
                    return key
                }
            }

            return typeof value === 'string' ? value : key
        }
    }, [language])

    return (
        <SettingsContext.Provider value={{
            darkMode,
            language,
            currency,
            setDarkMode,
            setLanguage,
            setCurrency,
            formatPrice,
            t,
            isLoading,
            reload
        }}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext)
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider')
    }
    return context
}

// Safe hook that returns defaults if outside provider
export function useSettingsSafe() {
    const context = useContext(SettingsContext)
    if (context === undefined) {
        return {
            darkMode: false,
            language: 'en',
            currency: 'MYR',
            formatPrice: (price: number) => `RM${price.toLocaleString()}`,
            t: (key: string) => key,
            isLoading: false,
            reload: async () => { }
        }
    }
    return context
}
