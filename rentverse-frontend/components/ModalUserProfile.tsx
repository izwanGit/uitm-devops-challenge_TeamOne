import React, { useEffect, useState } from 'react'
import { X, Calendar, MapPin, Shield, Star, Mail, Phone, User as UserIcon } from 'lucide-react'
import { createApiUrl } from '@/utils/apiConfig'
import Avatar from './Avatar'

interface UserProfile {
    id: string
    name: string
    email: string
    // Add other public fields if available
    createdAt: string
    role: string
    profilePicture?: string
}

interface ModalUserProfileProps {
    isOpen: boolean
    onClose: () => void
    userId: string
}

export default function ModalUserProfile({ isOpen, onClose, userId }: ModalUserProfileProps) {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && userId) {
            fetchUserProfile()
        }
    }, [isOpen, userId])

    const fetchUserProfile = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('authToken')
            // Using the existing users endpoint. Note: Might need to adjust permission or enable public profile endpoint.
            // Assuming authorized users can view basic profiles of others (e.g., reviewers).
            // If strictly admin only, we might need a specific 'public-profile' endpoint.
            // Let's try the standard ID endpoint first. If 403, we need to fix backend permissions.
            const response = await fetch(createApiUrl(`users/${userId}`), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()
            if (data.success) {
                setUser(data.data.user)
            } else {
                throw new Error(data.message)
            }
        } catch (err) {
            console.error('Failed to fetch user profile', err)
            setError('Could not load profile.')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {isLoading ? (
                    <div className="p-12 flex justify-center">
                        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : user ? (
                    <div>
                        {/* Header / Banner */}
                        <div className="h-24 bg-gradient-to-r from-teal-500 to-emerald-500" />

                        {/* Avatar & Basic Info */}
                        <div className="px-6 pb-8 -mt-12 text-center">
                            <div className="inline-block p-1 bg-white rounded-full shadow-lg mb-4">
                                <Avatar user={user} className="w-24 h-24 text-3xl" />
                            </div>

                            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                            <p className="text-slate-500 text-sm mt-1">Member since {new Date(user.createdAt).getFullYear()}</p>

                            {/* Badges / Roles */}
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                {user.role === 'ADMIN' && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                                        <Shield size={12} />
                                        Admin
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                                    <UserIcon size={12} />
                                    Verified User
                                </span>
                            </div>
                        </div>

                        {/* Contact (if public/available) - keeping generic for now */}
                        <div className="px-6 pb-6 pt-0 border-t border-slate-100">
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center gap-3 text-slate-600 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                        <Mail size={16} />
                                    </div>
                                    <span className="truncate">{user.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-500">
                        {error || 'User not found'}
                    </div>
                )}
            </div>
        </div>
    )
}
