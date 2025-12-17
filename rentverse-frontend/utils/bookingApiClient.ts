import { forwardRequest } from './apiForwarder'

export interface BookingRequest {
  propertyId: string
  startDate: string
  endDate: string
  rentAmount: number
  securityDeposit: number
  notes: string
}

export interface BookingResponse {
  id: string
  propertyId: string
  startDate: string
  endDate: string
  rentAmount: number
  securityDeposit: number
  notes: string
  status: string
  createdAt: string
  updatedAt: string
}

/**
 * Get authentication headers with token from localStorage
 */
function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[BookingAPI] Token exists:', !!token)
    if (token) {
      console.log('[BookingAPI] Token preview:', token.substring(0, 20) + '...')
    }
  }

  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

export class BookingApiClient {
  /**
   * Create a new booking
   */
  static async createBooking(bookingData: BookingRequest): Promise<BookingResponse> {
    try {
      const headers = getAuthHeaders()

      // Enhanced debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('[BookingAPI] Request headers:', headers)
        console.log('[BookingAPI] Booking data:', bookingData)
      }

      const response = await forwardRequest('/api/bookings', {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingData)
      })

      // Log response details
      if (process.env.NODE_ENV === 'development') {
        console.log('[BookingAPI] Response status:', response.status)
        console.log('[BookingAPI] Response headers:', Object.fromEntries(response.headers.entries()))
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[BookingAPI] Error response:', errorData)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`)
      }

      const result = await response.json()
      console.log('[BookingAPI] Success response:', result)
      return result
    } catch (error) {
      console.error('Error creating booking:', error)
      throw error
    }
  }

  /**
   * Get user's bookings
   */
  static async getUserBookings(): Promise<BookingResponse[]> {
    try {
      const response = await forwardRequest('/api/bookings/my-bookings', {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data?.bookings || []
    } catch (error) {
      console.error('Error fetching user bookings:', error)
      throw error
    }
  }

  /**
   * Get booking by ID
   */
  static async getBookingById(bookingId: string): Promise<BookingResponse> {
    try {
      const response = await forwardRequest(`/api/bookings/${bookingId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching booking:', error)
      throw error
    }
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(bookingId: string): Promise<BookingResponse> {
    try {
      const response = await forwardRequest(`/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      throw error
    }
  }
}