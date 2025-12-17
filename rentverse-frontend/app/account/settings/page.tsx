'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ContentWrapper from '@/components/ContentWrapper'
import useAuthStore from '@/stores/authStore'
import { useSettings } from '@/contexts/SettingsContext'
import {
    Bell,
    Moon,
    Globe,
    Mail,
    Eye,
    Trash2,
    Check,
    AlertTriangle,
    Loader2
} from 'lucide-react'
import { getApiBaseUrl } from '@/utils/apiConfig'

export default function SettingsPage() {
    const router = useRouter()
    const { logout } = useAuthStore()

    // Use global settings context
    const {
        darkMode, setDarkMode,
        language, setLanguage,
        currency, setCurrency,
        t
    } = useSettings()

    // Loading states
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    // Notification preferences (local state, synced with backend)
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [marketingEmails, setMarketingEmails] = useState(false)

    // Privacy
    const [profilePublic, setProfilePublic] = useState(true)
    const [showActivity, setShowActivity] = useState(false)

    // Delete account modal
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [confirmEmail, setConfirmEmail] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    const API_URL = getApiBaseUrl()

    // Load notification/privacy settings from API (dark mode, language, currency come from context)
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const token = localStorage.getItem('authToken')
                if (!token) {
                    router.push('/login')
                    return
                }

                // Load notification and privacy settings from backend
                const res = await fetch(`${API_URL}/api/settings`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                if (res.ok) {
                    const data = await res.json()
                    if (data.success) {
                        setEmailNotifications(data.data.emailNotifications)
                        setMarketingEmails(data.data.marketingEmails)
                        setProfilePublic(data.data.profilePublic)
                        setShowActivity(data.data.showActivity)
                        // Note: dark mode, language, currency are managed by SettingsContext
                    }
                }
            } catch (err) {
                console.error('Failed to load settings:', err)
            } finally {
                setIsLoading(false)
            }
        }

        loadSettings()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Only run once on mount

    const handleSave = async () => {
        setIsSaving(true)
        setSaveError(null)
        setSaveSuccess(false)

        try {
            const token = localStorage.getItem('authToken')

            const res = await fetch(`${API_URL}/api/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    emailNotifications,
                    marketingEmails,
                    language,
                    currency,
                    darkMode,
                    profilePublic,
                    showActivity
                })
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setSaveSuccess(true)
                setTimeout(() => setSaveSuccess(false), 3000)
            } else {
                setSaveError(data.message || 'Failed to save settings')
            }
        } catch {
            setSaveError('Network error. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteAccount = async () => {
        setIsDeleting(true)
        setDeleteError(null)

        try {
            const token = localStorage.getItem('authToken')

            const res = await fetch(`${API_URL}/api/settings/delete-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ confirmEmail })
            })

            const data = await res.json()

            if (res.ok && data.success) {
                // Logout and redirect
                logout()
                router.push('/')
            } else {
                setDeleteError(data.message || 'Failed to delete account')
            }
        } catch (err) {
            setDeleteError('Network error. Please try again.')
        } finally {
            setIsDeleting(false)
        }
    }

    const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) => (
        <button
            onClick={() => onChange(!enabled)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-teal-600' : 'bg-slate-300'
                }`}
        >
            <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
            />
        </button>
    )

    if (isLoading) {
        return (
            <ContentWrapper>
                <div className="max-w-4xl mx-auto py-8 px-4 flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
                        <p className="text-slate-500">Loading settings...</p>
                    </div>
                </div>
            </ContentWrapper>
        )
    }

    return (
        <ContentWrapper>
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-serif font-bold text-slate-900">{t('settings.title')}</h1>
                    <p className="text-slate-600 mt-2">{t('settings.subtitle')}</p>
                </div>

                <div className="grid gap-8">

                    {/* Notifications Section */}
                    <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-teal-100 rounded-lg">
                                    <Bell className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900">{t('settings.notifications')}</h2>
                                    <p className="text-sm text-slate-500">{t('settings.notificationsDesc')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            <div className="px-8 py-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Mail className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="font-medium text-slate-900">{t('settings.emailNotifications')}</p>
                                        <p className="text-sm text-slate-500">{t('settings.emailNotificationsDesc')}</p>
                                    </div>
                                </div>
                                <Toggle enabled={emailNotifications} onChange={setEmailNotifications} />
                            </div>

                            <div className="px-8 py-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Mail className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="font-medium text-slate-900">{t('settings.marketingEmails')}</p>
                                        <p className="text-sm text-slate-500">{t('settings.marketingEmailsDesc')}</p>
                                    </div>
                                </div>
                                <Toggle enabled={marketingEmails} onChange={setMarketingEmails} />
                            </div>
                        </div>
                    </section>

                    {/* Appearance & Language Section */}
                    <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Globe className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900">{t('settings.appearance')}</h2>
                                    <p className="text-sm text-slate-500">{t('settings.appearanceDesc')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            <div className="px-8 py-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Moon className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="font-medium text-slate-900">{t('settings.darkMode')}</p>
                                        <p className="text-sm text-slate-500">{t('settings.darkModeDesc')}</p>
                                    </div>
                                </div>
                                <Toggle enabled={darkMode} onChange={setDarkMode} />
                            </div>

                            <div className="px-8 py-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Globe className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="font-medium text-slate-900">{t('settings.language')}</p>
                                        <p className="text-sm text-slate-500">{t('settings.languageDesc')}</p>
                                    </div>
                                </div>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="en">English</option>
                                    <option value="ms">Bahasa Melayu</option>
                                </select>
                            </div>

                            <div className="px-8 py-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Globe className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="font-medium text-slate-900">{t('settings.currency')}</p>
                                        <p className="text-sm text-slate-500">{t('settings.currencyDesc')}</p>
                                    </div>
                                </div>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="MYR">MYR (RM)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="SGD">SGD (S$)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Privacy Section */}
                    <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Eye className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900">{t('settings.privacy')}</h2>
                                    <p className="text-sm text-slate-500">{t('settings.privacyDesc')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            <div className="px-8 py-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Eye className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="font-medium text-slate-900">Public Profile</p>
                                        <p className="text-sm text-slate-500">Allow others to see your profile</p>
                                    </div>
                                </div>
                                <Toggle enabled={profilePublic} onChange={setProfilePublic} />
                            </div>

                            <div className="px-8 py-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Eye className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="font-medium text-slate-900">Show Activity</p>
                                        <p className="text-sm text-slate-500">Display your recent activity to others</p>
                                    </div>
                                </div>
                                <Toggle enabled={showActivity} onChange={setShowActivity} />
                            </div>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="bg-white border border-red-200 rounded-2xl overflow-hidden">
                        <div className="px-8 py-5 border-b border-red-100 bg-red-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-red-900">Danger Zone</h2>
                                    <p className="text-sm text-red-600">Irreversible actions</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Trash2 className="w-5 h-5 text-red-400" />
                                    <div>
                                        <p className="font-medium text-slate-900">Delete Account</p>
                                        <p className="text-sm text-slate-500">Permanently delete your account and all data</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="px-4 py-2 bg-red-100 text-red-600 font-medium rounded-lg hover:bg-red-200 transition-colors"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Save Button */}
                    <div className="flex items-center justify-between">
                        {saveSuccess && (
                            <div className="flex items-center gap-2 text-green-600">
                                <Check size={20} />
                                <span>Settings saved successfully!</span>
                            </div>
                        )}
                        {saveError && (
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertTriangle size={20} />
                                <span>{saveError}</span>
                            </div>
                        )}
                        {!saveSuccess && !saveError && <div />}

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check size={20} />
                                    Save Preferences
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Delete Account?</h2>
                            <p className="text-slate-600 mt-2">
                                This action cannot be undone. All your data, bookings, and listings will be permanently deleted.
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Type your email to confirm
                            </label>
                            <input
                                type="email"
                                value={confirmEmail}
                                onChange={(e) => setConfirmEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>

                        {deleteError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                {deleteError}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false)
                                    setConfirmEmail('')
                                    setDeleteError(null)
                                }}
                                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || !confirmEmail}
                                className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Account'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ContentWrapper>
    )
}
