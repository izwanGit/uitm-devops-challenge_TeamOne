// Backend property response structure
export interface Property {
  id: string
  code: string
  title: string
  description: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  price: string | number
  currencyCode: string
  type: PropertyTypeBackend
  bedrooms: number
  bathrooms: number
  area: number
  areaSqm: number
  furnished: boolean
  isAvailable: boolean
  viewCount: number
  averageRating: number
  totalRatings: number
  isFavorited: boolean
  favoriteCount: number
  images: string[]
  amenities: string[] | PropertyAmenity[]
  latitude?: number
  longitude?: number
  placeId?: string | null
  projectName?: string | null
  developer?: string | null
  status: string
  createdAt: string
  updatedAt: string
  ownerId: string
  propertyTypeId: string
  owner?: PropertyOwner
  propertyType?: PropertyTypeDetail
  mapsUrl?: string
}

// Property owner information
export interface PropertyOwner {
  id: string
  name: string
  email: string
  phone: string
}

// Property type details
export interface PropertyTypeDetail {
  id: string
  code: string
  name: string
  description?: string | null
  icon?: string | null
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

// Property types API response
export interface PropertyTypesResponse {
  success: boolean
  message: string
  data: PropertyTypeDetail[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Property amenity structure
export interface PropertyAmenity {
  propertyId: string
  amenityId: string
  amenity: {
    id: string
    name: string
    category: string
  }
}

// Property view logging response
export interface PropertyViewResponse {
  success: boolean
  message: string
  data: {
    property: Property
    viewLogged: boolean
  }
}

// Legacy property structure for backward compatibility
export interface PropertyBase {
  id: string
  title: string
  location: string
  price: number
  imageUrl: string
  area: number
  rating: number
  propertyType: PropertyType
}

// Backend property types
export type PropertyTypeBackend = 'APARTMENT' | 'HOUSE' | 'STUDIO' | 'CONDO' | 'VILLA' | 'ROOM'

// Frontend property types (legacy)
export type PropertyType = 'apartment' | 'condominium' | 'villa' | 'townhouse' | 'house' | 'studio' | 'penthouse'

// Properties API response structure
export interface PropertiesResponse {
  success: boolean
  data: {
    properties: Property[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
    maps: {
      latMean: number
      longMean: number
      depth: number
    }
  }
}

// Property management state
export interface PropertiesState {
  properties: Property[]
  filteredProperties: Property[]
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  } | null
  mapData: {
    latMean: number
    longMean: number
    depth: number
  } | null
}

// Enhanced search filters to match backend API
export interface SearchFilters {
  page?: number
  limit?: number
  type?: string
  city?: string
  available?: boolean
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  lat?: number
  lng?: number

  // Legacy fields for backward compatibility
  location?: string
  monthCount?: number
  yearCount?: number
  propertyType?: string
  minArea?: number
  maxArea?: number
}
