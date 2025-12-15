'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import ContentWrapper from '@/components/ContentWrapper'
import { Search, Calendar, MapPin, User, Download, FileSignature } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { createApiUrl } from '@/utils/apiConfig'

interface Booking {
  id: string
  startDate: string
  endDate: string
  rentAmount: string
  currencyCode: string
  status: string
  notes: string
  createdAt: string
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
    id: string
    email: string
    firstName: string
    lastName: string
    name: string
  }
  agreement?: {
    id: string
    status: string
    pdfUrl: string | null
    documentId: string
    signedAt: string | null
  } | null
}

interface BookingsResponse {
  success: boolean
  data: {
    bookings: Booking[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

function RentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const { isLoggedIn } = useAuthStore()

  useEffect(() => {
    const fetchBookings = async () => {
      if (!isLoggedIn) {
        setIsLoading(false)
        return
      }

      try {
        const token = localStorage.getItem('authToken')
        if (!token) {
          setError('Authentication token not found')
          setIsLoading(false)
          return
        }

        const response = await fetch('/api/bookings/my-bookings', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch bookings: ${response.status}`)
        }

        const data: BookingsResponse = await response.json()

        if (data.success) {
          setBookings(data.data.bookings)
        } else {
          setError('Failed to load bookings')
        }
      } catch (err) {
        console.error('Error fetching bookings:', err)
        setError(err instanceof Error ? err.message : 'Failed to load bookings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [isLoggedIn])

  const downloadRentalAgreement = async (bookingId: string) => {
    try {
      setDownloadingId(bookingId)
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication token not found')
      }

      const response = await fetch(createApiUrl(`bookings/${bookingId}/rental-agreement`), {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch rental agreement: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.data.pdf) {
        // Use the PDF proxy route to download from the backend
        const pdfPath = data.data.pdf.url.replace('/uploads', '')
        const proxyUrl = `/api/pdf${pdfPath}`

        // Create a temporary link element and trigger download
        const link = document.createElement('a')
        link.href = proxyUrl
        link.download = data.data.pdf.fileName || 'rental-agreement.pdf'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        console.log('Rental agreement downloaded successfully')
      } else {
        throw new Error('Failed to get rental agreement PDF')
      }
    } catch (error) {
      console.error('Error downloading rental agreement:', error)
      alert('Failed to download rental agreement. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatAmount = (amount: string, currency: string) => {
    const num = parseFloat(amount)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'IDR' ? 'IDR' : 'MYR',
      minimumFractionDigits: 0
    }).format(num)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isLoggedIn) {
    return (
      <ContentWrapper>
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="text-center space-y-6 max-w-md">
            <h3 className="text-xl font-sans font-medium text-slate-900">
              Please log in to view your rents
            </h3>
            <Link
              href="/auth/login"
              className="inline-block px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </ContentWrapper>
    )
  }

  return (
    <ContentWrapper>
      {/* Header */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <h3 className="text-2xl font-serif text-slate-900">My rents</h3>
        <Link
          href="/property"
          className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <Search size={16} />
          <span className="text-sm font-medium">Explore</span>
        </Link>
      </div>

      {/* Contents */}
      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
              <p className="text-slate-600">Loading your bookings...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-10">
            {/* If list empty */}
            <div className="text-center space-y-6 max-w-md">
              <div className="flex justify-center">
                <Image
                  src="https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758310328/rentverse-base/image_17_hsznyz.png"
                  alt="No rents illustration"
                  width={240}
                  height={240}
                  className="w-60 h-60 object-contain"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-sans font-medium text-slate-900">
                  Your rental list is still empty
                </h3>
                <p className="text-base text-slate-500 leading-relaxed">
                  Explore properties to get your best rental property
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Property Image */}
                  <div className="md:w-1/3">
                    <div className="relative h-48 md:h-full">
                      <Image
                        src={booking.property.images[0] || '/placeholder-property.jpg'}
                        alt={booking.property.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900 mb-1">
                            {booking.property.title}
                          </h3>
                          <div className="flex items-center text-slate-600 text-sm">
                            <MapPin size={14} className="mr-1" />
                            <span>{booking.property.address}, {booking.property.city}</span>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </div>
                      </div>

                      {/* Rental Period */}
                      <div className="flex items-center text-slate-600 mb-4">
                        <Calendar size={16} className="mr-2" />
                        <span className="text-sm">
                          {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                        </span>
                      </div>

                      {/* Landlord */}
                      <div className="flex items-center text-slate-600 mb-4">
                        <User size={16} className="mr-2" />
                        <span className="text-sm">
                          Landlord: {booking.landlord.name}
                        </span>
                      </div>

                      {/* Notes */}
                      {booking.notes && (
                        <div className="mb-4">
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Notes:</span> {booking.notes}
                          </p>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mt-auto space-y-3 sm:space-y-0">
                        <div>
                          <p className="text-2xl font-bold text-slate-900">
                            {formatAmount(booking.rentAmount, booking.currencyCode)}
                          </p>
                          <p className="text-sm text-slate-500">Total amount</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                          {/* Conditionally show Sign or Download based on agreement status */}
                          {booking.agreement?.status === 'SIGNED' ? (
                            <button
                              onClick={() => downloadRentalAgreement(booking.id)}
                              disabled={downloadingId === booking.id}
                              className="flex items-center justify-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                              <Download size={16} />
                              <span>
                                {downloadingId === booking.id ? 'Downloading...' : 'Download Agreement'}
                              </span>
                            </button>
                          ) : (
                            <Link
                              href={`/leases/${booking.id}/sign`}
                              className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                            >
                              <FileSignature size={16} />
                              <span>Sign Agreement</span>
                            </Link>
                          )}
                          <Link
                            href={`/rents/${booking.id}`}
                            className="flex items-center justify-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                          >
                            View detail
                          </Link>
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
    </ContentWrapper>
  )
}

export default RentsPage