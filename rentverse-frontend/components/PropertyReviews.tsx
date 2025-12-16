'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Star, User as UserIcon } from 'lucide-react'
import { createApiUrl } from '@/utils/apiConfig'
import ModalUserProfile from './ModalUserProfile'

export default function PropertyReviews({ propertyId }: { propertyId: string }) {
    const [reviews, setReviews] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(createApiUrl(`ratings/property/${propertyId}`))
                const data = await res.json()
                if (data.success) {
                    setReviews(data.data.ratings || [])
                }
            } catch (err) {
                console.error('Failed to fetch reviews', err)
            } finally {
                setIsLoading(false)
            }
        }
        if (propertyId) {
            fetchReviews()
        }
    }, [propertyId])

    if (isLoading) return <div className="text-slate-400 text-sm">Loading reviews...</div>
    if (reviews.length === 0) return <div className="text-slate-500 italic">No reviews yet. Be the first to rent and review!</div>

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reviews.map((review) => (
                    <div key={review.id} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedUserId(review.userId)} className="hover:opacity-80 transition-opacity">
                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative">
                                    {review.user?.profilePicture ? (
                                        <Image
                                            src={review.user.profilePicture}
                                            alt={review.user.name || 'User'}
                                            fill
                                            className="object-cover"
                                            unoptimized={review.user.profilePicture.includes('cloudinary') || review.user.profilePicture.includes('google')}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <UserIcon size={20} />
                                        </div>
                                    )}
                                </div>
                            </button>
                            <div>
                                <button onClick={() => setSelectedUserId(review.userId)} className="font-semibold text-slate-900 hover:text-teal-600 transition-colors block text-left">
                                    {review.user?.firstName || 'User'}
                                </button>
                                <p className="text-sm text-slate-500">
                                    {new Date(review.ratedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex text-yellow-500 space-x-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} className={i < review.rating ? 'fill-current' : 'text-slate-200 fill-slate-200'} />
                            ))}
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            {review.comment}
                        </p>
                    </div>
                ))}
            </div>

            <ModalUserProfile
                isOpen={!!selectedUserId}
                onClose={() => setSelectedUserId(null)}
                userId={selectedUserId || ''}
            />
        </>
    )
}
