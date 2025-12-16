'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
    Building2,
    Bot,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    MapPin,
    User,
    Bed,
    Bath,
    Square,
    ExternalLink
} from 'lucide-react'
import { createApiUrl } from '@/utils/apiConfig'

interface PropertyApproval {
    id: string
    propertyId: string
    status: string
    createdAt: string
    property: {
        id: string
        title: string
        description: string
        address: string
        city: string
        state: string
        price: string
        currencyCode: string
        bedrooms: number
        bathrooms: number
        areaSqm: number
        furnished: boolean
        images: string[]
        code: string
        owner: {
            email: string
            name: string
        }
        propertyType: {
            name: string
            icon: string
        }
    }
}

export default function AdminPropertiesPage() {
    const [pendingApprovals, setPendingApprovals] = useState<PropertyApproval[]>([])
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [autoReviewEnabled, setAutoReviewEnabled] = useState(false)
    const [isTogglingAutoReview, setIsTogglingAutoReview] = useState(false)
    const [approvingProperties, setApprovingProperties] = useState<Set<string>>(new Set())
    const [rejectingProperties, setRejectingProperties] = useState<Set<string>>(new Set())

    const fetchPendingApprovals = async (showRefreshing = false) => {
        if (showRefreshing) setIsRefreshing(true)
        else setLoading(true)

        try {
            const token = localStorage.getItem('authToken')
            if (!token) return

            const response = await fetch(createApiUrl('properties/pending-approval'), {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setPendingApprovals(data.data.approvals)
                }
            }
        } catch (err) {
            console.error('Failed to fetch pending approvals', err)
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }

    const fetchAutoReviewStatus = async () => {
        try {
            const token = localStorage.getItem('authToken')
            if (!token) return

            const response = await fetch(createApiUrl('properties/auto-approve/status'), {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success && data.data.status) {
                    setAutoReviewEnabled(data.data.status.isEnabled)
                }
            }
        } catch (err) {
            console.error('Failed to fetch auto review status', err)
        }
    }

    useEffect(() => {
        fetchPendingApprovals()
        fetchAutoReviewStatus()
    }, [])

    const toggleAutoReview = async () => {
        try {
            setIsTogglingAutoReview(true)
            const token = localStorage.getItem('authToken')
            if (!token) return

            const response = await fetch(createApiUrl('properties/auto-approve/toggle'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ enabled: !autoReviewEnabled }),
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setAutoReviewEnabled(data.data.status.isEnabled)
                }
            }
        } catch (err) {
            console.error('Failed to toggle auto review', err)
        } finally {
            setIsTogglingAutoReview(false)
        }
    }

    const approveProperty = async (propertyId: string) => {
        try {
            setApprovingProperties(prev => new Set(prev).add(propertyId))
            const token = localStorage.getItem('authToken')
            if (!token) return

            const response = await fetch(createApiUrl(`properties/${propertyId}/approve`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notes: 'Approved by admin' }),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setPendingApprovals(prev => prev.filter(a => a.propertyId !== propertyId))
            } else if (response.status === 403) {
                // Conflict of interest - admin trying to approve their own property
                alert(data.message || 'You cannot approve your own property. Another admin must review.')
            } else {
                alert(data.message || 'Failed to approve property')
            }
        } catch (err) {
            console.error('Failed to approve property', err)
            alert('Failed to approve property. Please try again.')
        } finally {
            setApprovingProperties(prev => {
                const newSet = new Set(prev)
                newSet.delete(propertyId)
                return newSet
            })
        }
    }

    const rejectProperty = async (propertyId: string) => {
        try {
            setRejectingProperties(prev => new Set(prev).add(propertyId))
            const token = localStorage.getItem('authToken')
            if (!token) return

            const response = await fetch(createApiUrl(`properties/${propertyId}/reject`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notes: 'Rejected by admin' }),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setPendingApprovals(prev => prev.filter(a => a.propertyId !== propertyId))
            } else if (response.status === 403) {
                // Conflict of interest - admin trying to reject their own property
                alert(data.message || 'You cannot reject your own property. Another admin must review.')
            } else {
                alert(data.message || 'Failed to reject property')
            }
        } catch (err) {
            console.error('Failed to reject property', err)
            alert('Failed to reject property. Please try again.')
        } finally {
            setRejectingProperties(prev => {
                const newSet = new Set(prev)
                newSet.delete(propertyId)
                return newSet
            })
        }
    }

    const formatPrice = (price: string, currency: string) => {
        const num = parseFloat(price)
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: currency === 'MYR' ? 'MYR' : 'USD',
            minimumFractionDigits: 0
        }).format(num)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading properties...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-7 h-7 text-orange-600" />
                        Property Moderation
                    </h1>
                    <p className="text-slate-500 mt-1">Review and approve property submissions</p>
                </div>
                <button
                    onClick={() => fetchPendingApprovals(true)}
                    disabled={isRefreshing}
                    className={`flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors ${isRefreshing ? 'opacity-50' : ''}`}
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Pending Review</p>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{pendingApprovals.length}</p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-xl">
                            <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Submitted Today</p>
                            <p className="text-3xl font-bold text-slate-900 mt-1">
                                {pendingApprovals.filter(a => new Date(a.createdAt).toDateString() === new Date().toDateString()).length}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Auto Review Toggle */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-teal-100 rounded-xl">
                                <Bot className="w-6 h-6 text-teal-600" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">AI Auto-Review</p>
                                <p className="text-xs text-slate-500">RevAI powered</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleAutoReview}
                            disabled={isTogglingAutoReview}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${autoReviewEnabled ? 'bg-teal-600' : 'bg-slate-300'
                                } ${isTogglingAutoReview ? 'opacity-50' : ''}`}
                        >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${autoReviewEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Properties List */}
            {pendingApprovals.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">All Caught Up!</h3>
                    <p className="text-slate-500">No properties pending review. New submissions will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingApprovals.map((approval) => (
                        <div
                            key={approval.id}
                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <div className="flex flex-col lg:flex-row">
                                {/* Image */}
                                <div className="lg:w-1/4 relative">
                                    <div className="aspect-[4/3] lg:aspect-auto lg:h-full relative">
                                        <Image
                                            src={approval.property.images[0] || '/placeholder-property.jpg'}
                                            alt={approval.property.title}
                                            fill
                                            className="object-cover"
                                        />
                                        <span className="absolute top-3 left-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                            PENDING
                                        </span>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="flex-1 p-6">
                                    <div className="flex flex-col h-full">
                                        {/* Title & Price */}
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900">
                                                    {approval.property.title}
                                                </h3>
                                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                    <MapPin size={14} />
                                                    {approval.property.city}, {approval.property.state}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-teal-600">
                                                    {formatPrice(approval.property.price, approval.property.currencyCode)}
                                                </p>
                                                <p className="text-xs text-slate-400">/month</p>
                                            </div>
                                        </div>

                                        {/* Property Info */}
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                                            <span className="flex items-center gap-1">
                                                <Bed size={16} />
                                                {approval.property.bedrooms} bed
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Bath size={16} />
                                                {approval.property.bathrooms} bath
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Square size={16} />
                                                {approval.property.areaSqm} sqft
                                            </span>
                                            <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">
                                                {approval.property.propertyType.name} {approval.property.propertyType.icon}
                                            </span>
                                        </div>

                                        {/* Owner Info */}
                                        <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
                                            <User size={16} />
                                            <span>
                                                <span className="font-medium text-slate-700">{approval.property.owner.name}</span>
                                                {' · '}{approval.property.owner.email}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                                            <Link
                                                href={`/property/${approval.property.id}`}
                                                className="flex items-center gap-1 text-sm text-slate-600 hover:text-teal-600"
                                            >
                                                <ExternalLink size={14} />
                                                View Property
                                            </Link>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => rejectProperty(approval.property.id)}
                                                    disabled={rejectingProperties.has(approval.property.id)}
                                                    className={`flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors ${rejectingProperties.has(approval.property.id) ? 'opacity-50' : ''
                                                        }`}
                                                >
                                                    <XCircle size={16} />
                                                    {rejectingProperties.has(approval.property.id) ? 'Rejecting...' : 'Reject'}
                                                </button>
                                                <button
                                                    onClick={() => approveProperty(approval.property.id)}
                                                    disabled={approvingProperties.has(approval.property.id)}
                                                    className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${approvingProperties.has(approval.property.id) ? 'opacity-50' : ''
                                                        }`}
                                                >
                                                    <CheckCircle size={16} />
                                                    {approvingProperties.has(approval.property.id) ? 'Approving...' : 'Approve'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
