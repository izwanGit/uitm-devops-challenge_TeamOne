'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ContentWrapper from '@/components/ContentWrapper'
import { BookingApiClient, BookingResponse as BaseBookingResponse } from '@/utils/bookingApiClient'
import useAuthStore from '@/stores/authStore'
import { Calendar, MapPin, Loader2, AlertCircle, ChevronRight } from 'lucide-react'
import { cleanAddress } from '@/utils/propertyNormalizer'

// Extended interface to include property details returned by backend
interface ExtendedBookingResponse extends BaseBookingResponse {
  property: {
    id: string
    title: string
    address: string
    city: string
    images: string[]
    price: string
    currencyCode: string
  }
  landlord: {
    name: string
    firstName: string
    lastName: string
  }
}

export default function MyRentsPage() {
  const [bookings, setBookings] = useState<ExtendedBookingResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isLoggedIn, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // If not logged in, redirect to auth
    if (!isLoggedIn && !isLoading) {
      router.push('/auth')
      return
    }

    const fetchBookings = async () => {
      try {
        setIsLoading(true)
        const response = await BookingApiClient.getUserBookings()
        // Cast to extended type since we know backend sends more data
        setBookings(response as unknown as ExtendedBookingResponse[])
      } catch (err) {
        console.error('Failed to fetch bookings:', err)
        setError('Failed to load your bookings. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoggedIn) {
      fetchBookings()
    }
  }, [isLoggedIn, router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-teal-100 text-teal-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <ContentWrapper>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-4" />
          <p className="text-slate-500">Loading your bookings...</p>
        </div>
      </ContentWrapper>
    )
  }

  if (!isLoggedIn) return null

  return (
    <ContentWrapper hideFooterOnMobile={true}>
      <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">My Rents</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {bookings.length === 0 && !error ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No bookings yet</h3>
            <p className="text-slate-500 mb-6">You haven't made any rental bookings yet.</p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors"
            >
              Explore Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Link
                href={`/rents/view?id=${booking.id}`}
                key={booking.id}
                className="block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow active:scale-[0.99] transition-transform"
              >
                <div className="flex h-36">
                  {/* Image Section - Fixed width */}
                  <div className="w-32 relative flex-shrink-0 bg-slate-100">
                    {booking.property?.images?.[0] ? (
                      <Image
                        src={booking.property.images[0]}
                        alt={booking.property.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <MapPin size={24} />
                      </div>
                    )}
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(booking.status)} shadow-sm`}>
                      {booking.status}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden">
                    <div className="min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-slate-900 truncate mb-1 text-sm sm:text-base">
                          {booking.property?.title || 'Unknown Property'}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-500 mb-2 truncate">
                        {cleanAddress(booking.property)}
                      </p>

                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded w-fit">
                        <Calendar size={12} className="flex-shrink-0" />
                        <span className="truncate">{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-2">
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Rent</p>
                        <p className="font-bold text-teal-600 text-base sm:text-lg truncate">
                          {booking.property?.currencyCode} {parseFloat(booking.rentAmount.toString()).toLocaleString()}
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 flex-shrink-0 mb-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ContentWrapper>
  )
}
