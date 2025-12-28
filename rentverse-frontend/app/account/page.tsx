'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import NavBar from '@/components/NavBar'
import Avatar from '@/components/Avatar'
import useCurrentUser from '@/hooks/useCurrentUser'
import AuthGuard from '@/components/AuthGuard'
import { createApiUrl } from '@/utils/apiConfig'
import ModalReviewSubmit from '@/components/ModalReviewSubmit'
import {
    Shield,
    Settings,
    User,
    MapPin,
    Calendar,
    Star,
    ChevronRight,
    Home,
    Clock,
    CheckCircle,
    ArrowRight,
    Building,
} from 'lucide-react'

interface DashboardStats {
    totalStays: number
    uniquePlaces: number
    reviewsWritten: number
    memberSince: string | null
}

interface Place {
    city: string
    state: string
    count: number
    lastStay: string
    images: string[]
}

interface PastRent {
    id: string
    startDate: string
    endDate: string
    status: string
    myRating?: number | null
    property: {
        id: string
        title: string
        city: string
        state: string
        image: string | null
    }
}

interface Review {
    id: string
    rating: number
    comment: string | null
    ratedAt: string
    property: {
        id: string
        title: string
        city: string
        image: string | null
    }
}

export default function AccountPage() {
    const { user } = useCurrentUser()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [places, setPlaces] = useState<Place[]>([])
    const [pastRents, setPastRents] = useState<PastRent[]>([])
    const [reviews, setReviews] = useState<Review[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [reviewModalOpen, setReviewModalOpen] = useState(false)
    const [selectedPropertyForReview, setSelectedPropertyForReview] = useState<{ id: string, title: string, image: string | null } | null>(null)

    const handleOpenReviewModal = (property: { id: string, title: string, image: string | null }) => {
        setSelectedPropertyForReview(property)
        setReviewModalOpen(true)
    }

    const handleReviewSuccess = () => {
        // Refresh data to show new review
        setReviewModalOpen(false)
        window.location.reload() // Simple reload to refresh state, ideally should refetch
    }

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('authToken')
                if (!token) return

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }

                // Fetch all dashboard data in parallel
                // Use createApiUrl to ensure correct full URL is used (bypassing next.js rewrite issues)

                const [statsRes, placesRes, pastRentsRes, reviewsRes] = await Promise.all([
                    fetch(createApiUrl('users/me/dashboard/stats'), { headers }),
                    fetch(createApiUrl('users/me/dashboard/places'), { headers }),
                    fetch(createApiUrl('users/me/dashboard/past-rents'), { headers }),
                    fetch(createApiUrl('users/me/dashboard/reviews'), { headers }),
                ])

                const [statsData, placesData, pastRentsData, reviewsData] = await Promise.all([
                    statsRes.json(),
                    placesRes.json(),
                    pastRentsRes.json(),
                    reviewsRes.json(),
                ])

                if (statsData.success) setStats(statsData.data)
                if (placesData.success) setPlaces(placesData.data.places || [])
                if (pastRentsData.success) setPastRents(pastRentsData.data.pastRents || [])
                if (reviewsData.success) setReviews(reviewsData.data.reviews || [])
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
        })
    }

    const formatFullDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    const calculateNights = (start: string, end: string) => {
        const startDate = new Date(start)
        const endDate = new Date(end)
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={14}
                className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}
            />
        ))
    }

    const settingsItems = [
        {
            title: 'Edit Profile',
            description: 'Update your personal information',
            icon: User,
            href: '/account/profile',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50'
        },
        {
            title: 'Login & Security',
            description: 'Password, MFA, and sessions',
            icon: Shield,
            href: '/account/security',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Settings',
            description: 'Preferences and notifications',
            icon: Settings,
            href: '/account/settings',
            color: 'text-slate-600',
            bgColor: 'bg-slate-50'
        },
    ]

    return (
        <AuthGuard requireAuth={true}>
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <NavBar searchBoxType="none" />

                <main className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

                    {/* ========================================== */}
                    {/* PROFILE HERO SECTION */}
                    {/* ========================================== */}
                    <div className="relative mb-12">
                        {/* Background Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 rounded-3xl h-40" />

                        <div className="relative pt-16 px-8 pb-8">
                            {/* Profile Card */}
                            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                    {/* Left: Avatar + Name */}
                                    <div className="flex items-center gap-5">
                                        {user && (
                                            <div className="ring-4 ring-white shadow-lg rounded-full">
                                                <Avatar user={user} className="w-24 h-24 text-3xl" />
                                            </div>
                                        )}
                                        <div>
                                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                                                {user?.name || 'User'}
                                            </h1>
                                            <p className="text-slate-500 mt-1">{user?.email}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-3">
                                                <div className="flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-teal-50 text-teal-700 text-[10px] md:text-sm font-medium">
                                                    <CheckCircle size={10} className="md:w-3.5 md:h-3.5" />
                                                    <span>Verified</span>
                                                </div>
                                                {stats?.memberSince && (
                                                    <div className="flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] md:text-sm">
                                                        <Clock size={10} className="md:w-3.5 md:h-3.5" />
                                                        <span>{formatDate(stats.memberSince)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Stats */}
                                    <div className="flex justify-between md:justify-end gap-4 sm:gap-8 md:gap-12 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 line-clamp-1">
                                        <div className="text-center">
                                            <p className="text-xl md:text-3xl font-bold text-slate-900">
                                                {isLoading ? '...' : stats?.totalStays || 0}
                                            </p>
                                            <p className="text-[10px] md:text-sm text-slate-500 mt-1 uppercase tracking-wider">Stays</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xl md:text-3xl font-bold text-slate-900">
                                                {isLoading ? '...' : stats?.uniquePlaces || 0}
                                            </p>
                                            <p className="text-[10px] md:text-sm text-slate-500 mt-1 uppercase tracking-wider">Places</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xl md:text-3xl font-bold text-slate-900">
                                                {isLoading ? '...' : stats?.reviewsWritten || 0}
                                            </p>
                                            <p className="text-[10px] md:text-sm text-slate-500 mt-1 uppercase tracking-wider">Reviews</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================== */}
                    {/* PAST RENTS SECTION (Airbnb-style) */}
                    {/* ========================================== */}
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">Your stays</h2>
                                <p className="text-sm text-slate-500 mt-1">Properties you&apos;ve rented</p>
                            </div>
                            {pastRents.length > 0 && (
                                <Link
                                    href="/rents"
                                    className="flex items-center gap-1 text-teal-600 hover:text-teal-700 text-sm font-medium"
                                >
                                    View all
                                    <ArrowRight size={16} />
                                </Link>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="flex gap-4 overflow-x-auto pb-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="min-w-[300px] h-[200px] bg-slate-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : pastRents.length === 0 ? (
                            <div className="bg-slate-50 rounded-2xl p-8 text-center">
                                <Building size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-600 font-medium">No stays yet</p>
                                <p className="text-slate-500 text-sm mt-1">Your rental history will appear here</p>
                                <Link
                                    href="/property"
                                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                                >
                                    <Home size={16} />
                                    Explore properties
                                </Link>
                            </div>
                        ) : (
                            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
                                {pastRents.map((rent) => (
                                    <Link
                                        key={rent.id}
                                        href={`/rents/view?id=${rent.id}`}
                                        className="group min-w-[280px] sm:min-w-[320px] md:min-w-[340px] bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg hover:border-teal-200 transition-all snap-start"
                                    >
                                        {/* Image */}
                                        <div className="relative h-40 overflow-hidden">
                                            {rent.property.image ? (
                                                <Image
                                                    src={rent.property.image}
                                                    alt={rent.property.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    unoptimized={rent.property.image?.includes('fazwaz.com')}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                                                    <Home size={32} className="text-slate-400" />
                                                </div>
                                            )}
                                            {/* Status badge */}
                                            <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${rent.status === 'COMPLETED' ? 'bg-slate-800 text-white' :
                                                rent.status === 'ACTIVE' ? 'bg-green-500 text-white' :
                                                    'bg-blue-500 text-white'
                                                }`}>
                                                {rent.status === 'COMPLETED' ? 'Past' : rent.status}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors truncate">
                                                {rent.property.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                <MapPin size={14} />
                                                {rent.property.city}, {rent.property.state}
                                            </p>
                                            <div className="flex items-center gap-2 mt-3 text-sm text-slate-600 mb-3">
                                                <Calendar size={14} />
                                                <span>{formatDate(rent.startDate)} • {calculateNights(rent.startDate, rent.endDate)} nights</span>
                                            </div>

                                            {/* RATING BUTTON / DISPLAY */}
                                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                                {rent.myRating ? (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs font-medium text-slate-500">You rated:</span>
                                                        <div className="flex">
                                                            {renderStars(rent.myRating)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            handleOpenReviewModal(rent.property)
                                                        }}
                                                        className="w-full py-2 px-3 bg-teal-50 text-teal-700 text-sm font-medium rounded-lg hover:bg-teal-100 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Star size={14} />
                                                        Rate this stay
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* MODAL WINDOW */}
                    {selectedPropertyForReview && (
                        <ModalReviewSubmit
                            isOpen={reviewModalOpen}
                            onClose={() => setReviewModalOpen(false)}
                            propertyId={selectedPropertyForReview.id}
                            propertyTitle={selectedPropertyForReview.title}
                            propertyImage={selectedPropertyForReview.image}
                            onSuccess={handleReviewSuccess}
                        />
                    )}


                    {/* ========================================== */}
                    {/* PLACES I'VE STAYED */}
                    {/* ========================================== */}
                    {
                        places.length > 0 && (
                            <section className="mb-12">
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-slate-900">Places you&apos;ve been</h2>
                                    <p className="text-sm text-slate-500 mt-1">Cities and districts you&apos;ve explored</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {places.map((place, index) => (
                                        <div
                                            key={index}
                                            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform"
                                        >
                                            {/* Background image overlay */}
                                            {place.images[0] && (
                                                <Image
                                                    src={place.images[0]}
                                                    alt={place.city}
                                                    fill
                                                    className="object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                                                    unoptimized={place.images[0]?.includes('fazwaz.com')}
                                                />
                                            )}
                                            <div className="relative z-10">
                                                <h3 className="font-semibold text-lg">{place.city}</h3>
                                                <p className="text-slate-300 text-sm">{place.state}</p>
                                                <div className="flex items-center gap-2 mt-4">
                                                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                                                        {place.count} {place.count === 1 ? 'stay' : 'stays'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )
                    }

                    {/* ========================================== */}
                    {/* REVIEWS I'VE WRITTEN */}
                    {/* ========================================== */}
                    {
                        reviews.length > 0 && (
                            <section className="mb-12">
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-slate-900">Your reviews</h2>
                                    <p className="text-sm text-slate-500 mt-1">Reviews you&apos;ve written for properties</p>
                                </div>

                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex gap-4">
                                                {/* Property image */}
                                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                    {review.property.image ? (
                                                        <Image
                                                            src={review.property.image}
                                                            alt={review.property.title}
                                                            width={64}
                                                            height={64}
                                                            className="object-cover w-full h-full"
                                                            unoptimized={review.property.image?.includes('fazwaz.com')}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                            <Home size={24} className="text-slate-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Review content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0 flex-1">
                                                            <h3 className="font-medium text-slate-900 truncate">
                                                                {review.property.title}
                                                            </h3>
                                                            <p className="text-sm text-slate-500 truncate">{review.property.city}</p>
                                                        </div>
                                                        <div className="flex items-center gap-0.5 flex-shrink-0 pt-1">
                                                            {renderStars(review.rating)}
                                                        </div>
                                                    </div>
                                                    {review.comment && (
                                                        <div className="mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                            <p className="text-slate-600 text-sm italic break-words line-clamp-3">
                                                                &quot;{review.comment}&quot;
                                                            </p>
                                                        </div>
                                                    )}
                                                    <p className="text-[10px] text-slate-400 mt-3 font-medium flex items-center gap-1 uppercase tracking-wider">
                                                        <Clock size={10} />
                                                        Written on {formatFullDate(review.ratedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )
                    }

                    {/* ========================================== */}
                    {/* ACCOUNT SETTINGS */}
                    {/* ========================================== */}
                    <section>
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-slate-900">Account settings</h2>
                            <p className="text-sm text-slate-500 mt-1">Manage your profile and preferences</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {settingsItems.map((item) => {
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        className="group bg-white rounded-xl p-5 border border-slate-200 hover:shadow-md hover:border-teal-200 transition-all duration-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className={`p-3 rounded-lg ${item.bgColor} ${item.color} group-hover:scale-110 transition-transform duration-200`}>
                                                <Icon size={20} />
                                            </div>
                                            <ChevronRight className="text-slate-300 group-hover:text-teal-500 transition-colors" size={18} />
                                        </div>

                                        <h3 className="text-base font-semibold text-slate-900 mt-4 group-hover:text-teal-600 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm mt-1">
                                            {item.description}
                                        </p>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>

                </main >
            </div >
        </AuthGuard >
    )
}
