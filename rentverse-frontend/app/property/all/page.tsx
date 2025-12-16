'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import ContentWrapper from '@/components/ContentWrapper'
import CardProperty from '@/components/CardProperty'
import Pagination from '@/components/Pagination'
import type { Property, PropertyTypeBackend } from '@/types/property'
import { Plus } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { createApiUrl } from '@/utils/apiConfig'

// Backend property response interfaces
interface BackendProperty {
  id: string
  title: string
  description: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  price: string
  currencyCode: string
  bedrooms: number
  bathrooms: number
  areaSqm: number
  furnished: boolean
  isAvailable: boolean
  images: string[]
  latitude: number
  longitude: number
  code: string
  status: string
  createdAt: string
  updatedAt: string
  ownerId: string
  propertyTypeId: string
  propertyType: {
    id: string
    code: string
    name: string
    icon: string
  }
  amenities: string[]
  mapsUrl: string
  viewCount: number
  averageRating: number
  totalRatings: number
  totalLeases: number
  favoriteCount: number
}

interface MyPropertiesResponse {
  success: boolean
  message: string
  data: {
    properties: BackendProperty[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
    summary: {
      total: number
      byStatus: {
        DRAFT: number
        PENDING_REVIEW: number
        APPROVED: number
        REJECTED: number
        ARCHIVED: number
      }
      available: number
      unavailable: number
    }
  }
}

// Status utility functions
function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-600'
    case 'PENDING_REVIEW':
      return 'bg-yellow-100 text-yellow-600'
    case 'REJECTED':
      return 'bg-red-100 text-red-600'
    case 'DRAFT':
      return 'bg-slate-100 text-slate-600'
    case 'ARCHIVED':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

function getStatusDisplayName(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'Published'
    case 'PENDING_REVIEW':
      return 'Pending Review'
    case 'REJECTED':
      return 'Rejected'
    case 'DRAFT':
      return 'Draft'
    case 'ARCHIVED':
      return 'Archived'
    default:
      return status
  }
}

// Convert backend property to frontend property format
function convertBackendProperty(backendProperty: BackendProperty): Property {
  return {
    id: backendProperty.id,
    code: backendProperty.code,
    title: backendProperty.title,
    description: backendProperty.description,
    address: backendProperty.address,
    city: backendProperty.city,
    state: backendProperty.state,
    zipCode: backendProperty.zipCode,
    country: backendProperty.country,
    price: parseFloat(backendProperty.price),
    currencyCode: backendProperty.currencyCode,
    type: backendProperty.propertyType.code as PropertyTypeBackend,
    bedrooms: backendProperty.bedrooms,
    bathrooms: backendProperty.bathrooms,
    area: backendProperty.areaSqm,
    areaSqm: backendProperty.areaSqm,
    furnished: backendProperty.furnished,
    isAvailable: backendProperty.isAvailable,
    viewCount: backendProperty.viewCount,
    averageRating: backendProperty.averageRating,
    totalRatings: backendProperty.totalRatings,
    isFavorited: false, // Would need separate API call to determine this
    favoriteCount: backendProperty.favoriteCount,
    images: backendProperty.images,
    amenities: backendProperty.amenities || [],
    latitude: backendProperty.latitude,
    longitude: backendProperty.longitude,
    createdAt: backendProperty.createdAt,
    updatedAt: backendProperty.updatedAt,
    ownerId: backendProperty.ownerId,
    propertyTypeId: backendProperty.propertyTypeId,
    status: backendProperty.status,
  }
}

function AllMyPropertiesPage() {
  const [myProperties, setMyProperties] = useState<Property[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 48, // Updated to 48 to fit grid layout better (multiples of 2, 3, 4)
    total: 0,
    pages: 1
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isLoggedIn } = useAuthStore()

  useEffect(() => {
    const fetchMyProperties = async () => {
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

        const response = await fetch(createApiUrl(`properties/my-properties?page=${pagination.page}&limit=${pagination.limit}`), {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch properties: ${response.status}`)
        }

        const data: MyPropertiesResponse = await response.json()

        if (data.success) {
          const convertedProperties = data.data.properties.map(convertBackendProperty)
          setMyProperties(convertedProperties)
          // Update pagination state from response
          setPagination(prev => ({
            ...prev,
            total: data.data.pagination.total,
            pages: data.data.pagination.pages
          }))
        } else {
          setError('Failed to load properties')
        }
      } catch (err) {
        console.error('Error fetching properties:', err)
        setError(err instanceof Error ? err.message : 'Failed to load properties')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMyProperties()
  }, [isLoggedIn, pagination.page, pagination.limit])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Show loading state
  if (isLoading) {
    return (
      <ContentWrapper>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="text-slate-600">Loading your properties...</p>
          </div>
        </div>
      </ContentWrapper>
    )
  }

  // Show error state
  if (error) {
    return (
      <ContentWrapper>
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
      </ContentWrapper>
    )
  }

  // Show login required state
  if (!isLoggedIn) {
    return (
      <ContentWrapper>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <Image
                src="https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758310328/rentverse-base/image_17_hsznyz.png"
                alt="Login required"
                width={240}
                height={240}
                className="w-60 h-60 object-contain"
              />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-sans font-medium text-slate-900">
                Login Required
              </h3>
              <p className="text-base text-slate-500 leading-relaxed">
                Please log in to view your property listings
              </p>
            </div>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </ContentWrapper>
    )
  }

  return (
    <ContentWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-sans font-medium text-slate-900">My listings</h3>
        <Link
          href="/property/new"
          className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors duration-200"
        >
          <Plus size={16} />
          <span className="text-sm font-medium">Create new listing</span>
        </Link>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {myProperties.map((property) => (
          <div key={property.id} className="group relative">
            {/* Status Badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(property.status)}`}>
                {getStatusDisplayName(property.status)}
              </span>
            </div>

            <CardProperty property={property} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {myProperties.length > 0 && pagination.pages > 1 && (
        <div className="mt-8 py-4 border-t border-slate-100">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
          />
          <p className="text-center text-sm text-slate-500 mt-4">
            Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} properties
          </p>
        </div>
      )}

      {/* Empty state fallback */}
      {myProperties.length === 0 && (
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <Image
                src="https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758310328/rentverse-base/image_17_hsznyz.png"
                alt="No properties"
                width={240}
                height={240}
                className="w-60 h-60 object-contain"
              />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-sans font-medium text-slate-900">
                No properties listed yet
              </h3>
              <p className="text-base text-slate-500 leading-relaxed">
                Start by creating your first property listing to earn rental income
              </p>
            </div>
            <Link
              href="/property/new"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors duration-200"
            >
              <Plus size={16} />
              <span>Create your first listing</span>
            </Link>
          </div>
        </div>
      )}
    </ContentWrapper>
  )
}

export default AllMyPropertiesPage