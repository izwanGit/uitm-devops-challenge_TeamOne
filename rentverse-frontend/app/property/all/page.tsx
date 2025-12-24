'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import ContentWrapper from '@/components/ContentWrapper'
import CardProperty from '@/components/CardProperty'
import Pagination from '@/components/Pagination'
import type { Property, PropertyTypeBackend } from '@/types/property'
import { Plus, Clock, CheckCircle, Home, XCircle, User, Calendar } from 'lucide-react'
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
  activeLeaseCount: number
  hasActiveLease: boolean
  activeLease: {
    id: string
    status: string
    startDate: string
    endDate: string
    monthlyRent: string
    tenant: {
      id: string
      name: string
      email: string
    }
  } | null
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

type TabKey = 'pending' | 'approved' | 'rented' | 'rejected'

// Convert backend property to frontend property format
function convertBackendProperty(backendProperty: BackendProperty): Property & {
  activeLeaseCount: number
  hasActiveLease: boolean
  activeLease: BackendProperty['activeLease']
} {
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
    isFavorited: false,
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
    activeLeaseCount: backendProperty.activeLeaseCount,
    hasActiveLease: backendProperty.hasActiveLease,
    activeLease: backendProperty.activeLease,
  }
}

function AllMyPropertiesPage() {
  const [allProperties, setAllProperties] = useState<(Property & {
    activeLeaseCount: number
    hasActiveLease: boolean
    activeLease: BackendProperty['activeLease']
  })[]>([])
  const [activeTab, setActiveTab] = useState<TabKey>('approved')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 48,
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
          setAllProperties(convertedProperties)
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

  // Filter properties by tab
  const getFilteredProperties = () => {
    switch (activeTab) {
      case 'pending':
        return allProperties.filter(p => p.status === 'PENDING_REVIEW')
      case 'approved':
        return allProperties.filter(p => p.status === 'APPROVED' && !p.hasActiveLease)
      case 'rented':
        return allProperties.filter(p => p.status === 'APPROVED' && p.hasActiveLease)
      case 'rejected':
        return allProperties.filter(p => p.status === 'REJECTED')
      default:
        return allProperties
    }
  }

  // Get counts for each tab
  const getCounts = () => {
    return {
      pending: allProperties.filter(p => p.status === 'PENDING_REVIEW').length,
      approved: allProperties.filter(p => p.status === 'APPROVED' && !p.hasActiveLease).length,
      rented: allProperties.filter(p => p.status === 'APPROVED' && p.hasActiveLease).length,
      rejected: allProperties.filter(p => p.status === 'REJECTED').length,
    }
  }

  const filteredProperties = getFilteredProperties()
  const counts = getCounts()

  const tabs = [
    { key: 'pending' as TabKey, label: 'Pending Review', count: counts.pending, icon: Clock, color: 'yellow' },
    { key: 'approved' as TabKey, label: 'Approved', count: counts.approved, icon: CheckCircle, color: 'green' },
    { key: 'rented' as TabKey, label: 'Currently Rented', count: counts.rented, icon: Home, color: 'blue' },
    { key: 'rejected' as TabKey, label: 'Rejected', count: counts.rejected, icon: XCircle, color: 'red' },
  ]

  const getTabColorClasses = (color: string, isActive: boolean) => {
    if (isActive) {
      switch (color) {
        case 'yellow': return 'bg-yellow-600 text-white'
        case 'green': return 'bg-green-600 text-white'
        case 'blue': return 'bg-blue-600 text-white'
        case 'red': return 'bg-red-600 text-white'
        default: return 'bg-slate-900 text-white'
      }
    }
    return 'text-slate-600 hover:bg-slate-100'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Loading state
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

  // Error state
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

  // Login required state
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
      <div className="px-4 md:px-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-sans font-medium text-slate-900">My Listings</h3>
          <Link
            href="/property/new"
            className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors duration-200"
          >
            <Plus size={16} />
            <span className="text-sm font-medium">Create New Listing</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-xl border border-slate-200 p-2">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${getTabColorClasses(tab.color, isActive)}`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProperties.map((property) => (
                <div key={property.id} className="group relative">
                  <CardProperty property={property} />

                  {/* Rented Badge Overlay */}
                  {property.hasActiveLease && property.activeLease && (
                    <div className="absolute bottom-4 left-4 right-4 bg-blue-600 text-white p-3 rounded-lg shadow-lg z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <User size={14} />
                        <span className="text-xs font-medium">Currently Rented</span>
                      </div>
                      <p className="text-xs opacity-90 truncate">{property.activeLease.tenant.name}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                        <Calendar size={12} />
                        <span>{formatDate(property.activeLease.startDate)} - {formatDate(property.activeLease.endDate)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {filteredProperties.length > 0 && pagination.pages > 1 && (
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
          </>
        ) : (
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
                  {activeTab === 'pending' && 'No Pending Properties'}
                  {activeTab === 'approved' && 'No Approved Properties'}
                  {activeTab === 'rented' && 'No Rented Properties'}
                  {activeTab === 'rejected' && 'No Rejected Properties'}
                </h3>
                <p className="text-base text-slate-500 leading-relaxed">
                  {activeTab === 'approved' && 'Create your first listing to start earning rental income'}
                  {activeTab === 'pending' && 'No properties awaiting approval'}
                  {activeTab === 'rented' && 'No properties are currently being rented'}
                  {activeTab === 'rejected' && 'No properties have been rejected'}
                </p>
              </div>
              {activeTab === 'approved' && (
                <Link
                  href="/property/new"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors duration-200"
                >
                  <Plus size={16} />
                  <span>Create Your First Listing</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </ContentWrapper>
  )
}

export default AllMyPropertiesPage