'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { User, Settings, Home, Heart, Search, LogOut, Calendar, Shield, X, Smartphone, Download } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { Capacitor } from '@capacitor/core'
import useCurrentUser from '@/hooks/useCurrentUser'
import { useSettingsSafe } from '@/contexts/SettingsContext'
import clsx from 'clsx'

interface MobileUserMenuProps {
    isOpen: boolean
    onClose: () => void
}

export default function MobileUserMenu({ isOpen, onClose }: MobileUserMenuProps) {
    const { user } = useCurrentUser()
    const { logout } = useAuthStore()
    const { t } = useSettingsSafe()

    // Prevent background scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const handleLogout = () => {
        logout()
        onClose()
        window.location.href = '/'
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Slide-up Menu */}
            <div className={clsx(
                "relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-4 pb-16 shadow-xl transform transition-transform duration-300 ease-out max-h-[90vh] overflow-y-auto",
                isOpen ? "translate-y-0" : "translate-y-full"
            )}>

                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg">
                            {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User'}</h3>
                            <p className="text-xs text-slate-500">{user?.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                        <X size={20} />
                    </button>
                </div>

                {/* Menu Items Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {/* Account */}
                    <Link href="/account" onClick={onClose} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl hover:bg-teal-50 active:scale-95 transition-all scroll-smooth">
                        <User size={24} className="text-teal-600 mb-2" />
                        <span className="text-sm font-medium text-slate-700">{t('nav.account')}</span>
                    </Link>

                    {/* My Listings */}
                    <Link href="/property/all" onClick={onClose} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl hover:bg-teal-50 active:scale-95 transition-all">
                        <Home size={24} className="text-teal-600 mb-2" />
                        <span className="text-sm font-medium text-slate-700">{t('nav.myListings')}</span>
                    </Link>

                    {/* My Rents */}
                    <Link href="/rents" onClick={onClose} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl hover:bg-teal-50 active:scale-95 transition-all">
                        <Calendar size={24} className="text-teal-600 mb-2" />
                        <span className="text-sm font-medium text-slate-700">{t('nav.myRents')}</span>
                    </Link>

                    {/* Wishlist */}
                    <Link href="/wishlist" onClick={onClose} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl hover:bg-teal-50 active:scale-95 transition-all scroll-smooth">
                        <Heart size={24} className="text-teal-600 mb-2" />
                        <span className="text-sm font-medium text-slate-700">{t('nav.wishlist')}</span>
                    </Link>
                </div>

                {/* List Items */}
                <div className="space-y-1">
                    <Link href="/account/settings" onClick={onClose} className="flex items-center p-3 rounded-lg hover:bg-slate-50 text-slate-700">
                        <Settings size={20} className="text-slate-400 mr-3" />
                        <span className="font-medium text-sm">{t('nav.settings')}</span>
                        <span className="ml-auto text-slate-400">›</span>
                    </Link>

                    {user?.role === 'ADMIN' && (
                        <Link href="/admin" onClick={onClose} className="flex items-center p-3 rounded-lg bg-teal-50 text-teal-700 border border-teal-100">
                            <Shield size={20} className="text-teal-600 mr-3" />
                            <span className="font-medium text-sm">{t('nav.admin')}</span>
                            <span className="ml-auto text-teal-400">›</span>
                        </Link>
                    )}

                    <button onClick={handleLogout} className="flex items-center w-full p-3 rounded-lg hover:bg-red-50 text-red-600 mt-2">
                        <LogOut size={20} className="text-red-500 mr-3" />
                        <span className="font-medium text-sm">{t('nav.logout')}</span>
                    </button>
                </div>

                {/* Permanent App Download Section (Mobile Web only) */}
                {!Capacitor.isNativePlatform() && (
                    <div className="mt-8 p-6 bg-gradient-to-br from-teal-600 to-emerald-700 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-teal-100">
                        <div className="absolute top-0 right-0 p-3 opacity-20">
                            <Smartphone size={120} className="rotate-12 translate-x-8 translate-y-4" />
                        </div>

                        <div className="relative z-10">
                            <h4 className="text-lg font-bold mb-1">RentVerse is better in the app</h4>
                            <p className="text-white/80 text-xs mb-4 max-w-[80%]">Get real-time security alerts and a smoother native experience on your Android phone.</p>

                            <a
                                href="https://github.com/izwanGit/uitm-devops-challenge_TeamOne/raw/main/releases/rentverse-android.apk"
                                className="inline-flex items-center gap-2 bg-white text-teal-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-50 active:scale-95 transition-all"
                            >
                                <Download size={16} />
                                Download APK
                            </a>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
