import React, { useState } from 'react'
import { X, Star, Loader2 } from 'lucide-react'
import { createApiUrl } from '@/utils/apiConfig'

interface ModalReviewSubmitProps {
    isOpen: boolean
    onClose: () => void
    propertyId: string
    propertyTitle: string
    propertyImage: string | null
    onSuccess: () => void
}

export default function ModalReviewSubmit({
    isOpen,
    onClose,
    propertyId,
    propertyTitle,
    propertyImage,
    onSuccess,
}: ModalReviewSubmitProps) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) {
            setError('Please select a star rating')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const token = localStorage.getItem('authToken')
            const response = await fetch(createApiUrl('ratings'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    propertyId,
                    rating,
                    comment
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit review')
            }

            onSuccess()
            onClose()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="relative h-32 bg-slate-900">
                    {propertyImage && (
                        <img
                            src={propertyImage}
                            alt={propertyTitle}
                            className="w-full h-full object-cover opacity-50"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="absolute bottom-4 left-6 right-6">
                        <p className="text-slate-300 text-xs uppercase tracking-wider font-medium mb-1">Rate your stay</p>
                        <h2 className="text-white text-xl font-bold truncate">{propertyTitle}</h2>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Star Rating */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        size={32}
                                        className={`${star <= (hoverRating || rating)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-slate-200'
                                            } transition-colors duration-200`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                            {rating === 1 ? 'Terrible' :
                                rating === 2 ? 'Bad' :
                                    rating === 3 ? 'Okay' :
                                        rating === 4 ? 'Good' :
                                            rating === 5 ? 'Amazing!' : 'Select a rating'}
                        </p>
                    </div>

                    {/* Comment */}
                    <div className="mb-6">
                        <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-2">
                            Share your experience (optional)
                        </label>
                        <textarea
                            id="comment"
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none text-slate-600 placeholder-slate-400 bg-slate-50"
                            placeholder="What did you like? What could be improved?"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-start gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || rating === 0}
                            className="flex-1 px-4 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Submitting
                                </>
                            ) : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
