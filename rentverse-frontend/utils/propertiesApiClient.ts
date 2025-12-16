import type { Property, PropertyViewResponse, PropertiesResponse, SearchFilters } from '@/types/property'
import { forwardRequest } from './apiForwarder'
import { normalizeProperty, normalizePropertiesResponse } from './propertyNormalizer'

/**
 * Properties API client
 */
export class PropertiesApiClient {
  
  /**
   * Log a property view
   */
  static async logPropertyView(propertyId: string): Promise<PropertyViewResponse> {
    try {
      const response = await forwardRequest(`/api/properties/${propertyId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Empty body as per the curl example
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to log property view')
      }

      if (data?.data?.property) {
        const normalizedProperty = normalizeProperty(data.data.property)

        const normalizedResponse: PropertyViewResponse = {
          ...data,
          data: {
            ...data.data,
            property: normalizedProperty,
          },
        }

        return normalizedResponse
      }

      return data as PropertyViewResponse
    } catch (error) {
      console.error('Property view logging API error:', error)
      throw error instanceof Error ? error : new Error('Network error occurred')
    }
  }

  /**
   * Get property details
   */
  static async getProperty(propertyId: string): Promise<Property> {
    try {
      const response = await forwardRequest(`/api/properties/${propertyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get property details')
      }

      // The backend returns property data in data.property structure
      const backendProperty = data.data?.property || data.data
      if (!backendProperty) {
        throw new Error('No property data found in response')
      }

      return normalizeProperty(backendProperty)
    } catch (error) {
      console.error('Get property API error:', error)
      throw error instanceof Error ? error : new Error('Network error occurred')
    }
  }

  /**
   * Search properties
   */
  static async searchProperties(filters: SearchFilters = {}): Promise<PropertiesResponse> {
    try {
      // Build query parameters
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })

      const queryString = params.toString()
      const endpoint = `/api/properties${queryString ? `?${queryString}` : ''}`

      const response = await forwardRequest(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to search properties')
      }

      const normalizedResponse = normalizePropertiesResponse(data as PropertiesResponse)
      return normalizedResponse
    } catch (error) {
      console.error('Search properties API error:', error)
      throw error instanceof Error ? error : new Error('Network error occurred')
    }
  }

  /**
   * Create a new property
   */
  static async createProperty(propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    try {
      const response = await forwardRequest('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create property')
      }

      return data.data as Property
    } catch (error) {
      console.error('Create property API error:', error)
      throw error instanceof Error ? error : new Error('Network error occurred')
    }
  }

  /**
   * Update an existing property
   */
  static async updateProperty(propertyId: string, updates: Partial<Property>): Promise<Property> {
    try {
      const response = await forwardRequest(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update property')
      }

      return data.data as Property
    } catch (error) {
      console.error('Update property API error:', error)
      throw error instanceof Error ? error : new Error('Network error occurred')
    }
  }

  /**
   * Delete a property
   */
  static async deleteProperty(propertyId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await forwardRequest(`/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete property')
      }

      return data
    } catch (error) {
      console.error('Delete property API error:', error)
      throw error instanceof Error ? error : new Error('Network error occurred')
    }
  }
}