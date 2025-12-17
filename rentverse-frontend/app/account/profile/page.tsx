'use client'
import { getApiBaseUrl } from '@/utils/apiConfig'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import AuthGuard from '@/components/AuthGuard'
import useCurrentUser from '@/hooks/useCurrentUser'
import { ArrowLeft, Save, Loader2, Check } from 'lucide-react'

export default function EditProfilePage() {
    const router = useRouter()
    const { user, refreshUserData } = useCurrentUser()

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '',
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Populate form with user data
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
            })
        }
    }, [user])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setIsSaved(false)
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const token = localStorage.getItem('authToken')
            const baseUrl = getApiBaseUrl()

            const response = await fetch(`${baseUrl}/api/users/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile')
            }

            // Refresh user data in store
            await refreshUserData()

            setIsSaved(true)
            setTimeout(() => setIsSaved(false), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthGuard requireAuth={true}>
            <div className="min-h-screen bg-slate-50">
                <NavBar searchBoxType="none" />

                <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
                    {/* Back Link */}
                    <Link
                        href="/account"
                        className="inline-flex items-center text-slate-600 hover:text-teal-600 mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Account
                    </Link>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
                        <p className="mt-2 text-slate-600">
                            Update your personal information
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* First Name */}
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                    placeholder="Enter your first name"
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                    placeholder="Enter your last name"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                    placeholder="+60 12-345 6789"
                                />
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-700 mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    id="dateOfBirth"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            {/* Success Message */}
                            {isSaved && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                                    <Check size={18} className="text-green-600 mr-2" />
                                    <p className="text-sm text-green-600">Profile updated successfully!</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 focus:ring-4 focus:ring-teal-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={20} className="mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} className="mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Email Note */}
                    <div className="mt-6 p-4 bg-slate-100 rounded-lg">
                        <p className="text-sm text-slate-600">
                            <strong>Email:</strong> {user?.email}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            To change your email, please contact support.
                        </p>
                    </div>
                </main>
            </div>
        </AuthGuard>
    )
}
