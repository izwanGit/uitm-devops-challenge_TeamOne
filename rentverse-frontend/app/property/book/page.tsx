'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ContentWrapper from '@/components/ContentWrapper'
import ButtonCircle from '@/components/ButtonCircle'
import { ArrowLeft, Plus, Minus } from 'lucide-react'
import { PropertiesApiClient } from '@/utils/propertiesApiClient'
import { Property } from '@/types/property'
import useAuthStore from '@/stores/authStore'
import { debugAuthState } from '@/utils/debugAuth'
import { createApiUrl } from '@/utils/apiConfig'

function BookingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyId = searchParams.get('id')
  const { isLoggedIn } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoadingProperty, setIsLoadingProperty] = useState(true)

  // Debug the route parameters
  console.log('[ROUTE] Property ID from searchParams:', propertyId)

  // Form data state for booking
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    numGuests: 1,
    message: '',
    totalAmount: 0
  })

  // Duration counters (similar to searchbar)
  const [startMonthCount, setStartMonthCount] = useState(0) // Start month from now
  const [durationMonths, setDurationMonths] = useState(1) // Duration in months

  // Helper function to get property price as number
  const getPropertyPrice = useCallback(() => {
    if (!property) return 0
    return typeof property.price === 'string' ? parseFloat(property.price) : property.price
  }, [property])

  // Update actual dates based on month counters
  const updateDatesFromCounters = useCallback((startMonth: number, duration: number) => {
    const currentDate = new Date()

    // For start month calculation, ensure we don't go to the past
    let startDate: Date
    if (startMonth === 0) {
      // If starting "this month", use tomorrow or today (whichever is later)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      startDate = tomorrow
    } else {
      // For future months, use the 1st of that month
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + startMonth, 1)
    }

    // Calculate end date by adding duration months to start date
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + duration, 0) // Last day of the end month

    // Calculate total amount based on duration and property price
    const monthlyPrice = getPropertyPrice()
    const totalAmount = monthlyPrice * duration

    setFormData(prev => ({
      ...prev,
      checkIn: startDate.toISOString().split('T')[0],
      checkOut: endDate.toISOString().split('T')[0],
      totalAmount: totalAmount
    }))
  }, [getPropertyPrice]) // Depend on getPropertyPrice

  // Helper functions for month counters
  const incrementStartMonth = () => {
    setStartMonthCount(prev => prev + 1)
    updateDatesFromCounters(startMonthCount + 1, durationMonths)
  }

  const decrementStartMonth = () => {
    if (startMonthCount > 0) {
      setStartMonthCount(prev => prev - 1)
      updateDatesFromCounters(startMonthCount - 1, durationMonths)
    }
  }

  const incrementDuration = () => {
    setDurationMonths(prev => prev + 1)
    updateDatesFromCounters(startMonthCount, durationMonths + 1)
  }

  const decrementDuration = () => {
    if (durationMonths > 1) {
      setDurationMonths(prev => prev - 1)
      updateDatesFromCounters(startMonthCount, durationMonths - 1)
    }
  }

  // Format month display text
  const getStartMonthText = () => {
    const currentDate = new Date()
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + startMonthCount, 1)
    return targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const getDurationText = () => {
    return durationMonths === 1 ? '1 month' : `${durationMonths} months`
  }

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return

      try {
        setIsLoadingProperty(true)

        // Use the same approach as the property view page
        console.log('[PROPERTY] Fetching property with ID:', propertyId)
        const viewResponse = await PropertiesApiClient.logPropertyView(propertyId)

        if (viewResponse.success && viewResponse.data.property) {
          const backendProperty = viewResponse.data.property
          console.log('[PROPERTY] Successfully loaded property:', backendProperty)
          setProperty(backendProperty)

          // Set the initial total amount from property price
          const price = typeof backendProperty.price === 'string'
            ? parseFloat(backendProperty.price)
            : backendProperty.price
          setFormData(prev => ({ ...prev, totalAmount: price || 0 }))
        } else {
          setSubmitError('Failed to load property details')
          setProperty(null)
        }

      } catch (error) {
        console.error('Error fetching property:', error)
        setSubmitError('Failed to load property details. Please try again.')
        setProperty(null)
      } finally {
        setIsLoadingProperty(false)
      }
    }

    console.log('[EFFECT] useEffect triggered, propertyId:', propertyId)
    if (propertyId && propertyId !== 'undefined' && propertyId !== 'null') {
      fetchProperty()
    } else {
      console.warn('[EFFECT] No valid propertyId found:', propertyId)
      setSubmitError('Property ID not found in URL')
      setIsLoadingProperty(false)
    }
  }, [propertyId])

  // Initialize dates on component mount
  useEffect(() => {
    const currentDate = new Date()
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)

    setFormData(prev => ({
      ...prev,
      checkIn: startDate.toISOString().split('T')[0],
      checkOut: endDate.toISOString().split('T')[0],
      totalAmount: 0 // Will be updated when property loads
    }))
  }, []) // Run once on mount

  // Update total amount when property loads or duration changes
  useEffect(() => {
    if (property) {
      updateDatesFromCounters(startMonthCount, durationMonths)
    }
  }, [property, startMonthCount, durationMonths, updateDatesFromCounters]) // Update when property or counters change

  // Get button text based on state
  const getSubmitButtonText = () => {
    if (isSubmitting) return 'Submitting...'
    if (!isLoggedIn) return 'Login Required'
    return 'Submit Booking'
  }

  const handleBack = () => {
    router.back()
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmitBooking = async () => {
    if (!formData.checkIn || !formData.checkOut) {
      setSubmitError('Please select booking dates')
      return
    }

    if (!propertyId) {
      setSubmitError('Property ID is missing')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Add comprehensive debugging
      console.log('[BOOKING] Starting booking submission...')
      const authStore = useAuthStore.getState()
      debugAuthState()

      // Check authentication state
      if (!authStore.isLoggedIn) {
        console.log('[BOOKING] User not logged in, redirecting to login')
        setSubmitError('Please log in to make a booking')
        router.push('/auth/login')
        return
      }

      // Manual token validation
      const token = localStorage.getItem('authToken')
      console.log('[BOOKING] Token from localStorage:', token ? `${token.slice(0, 20)}...` : 'null')

      if (!token) {
        console.log('[BOOKING] No token found, redirecting to login')
        setSubmitError('Authentication token not found. Please log in again.')
        router.push('/auth/login')
        return
      }

      // Test token validity with /api/auth/me
      console.log('[BOOKING] Testing token validity...')
      try {
        const authTestResponse = await fetch(createApiUrl('auth/me'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })

        console.log('[BOOKING] Auth test response status:', authTestResponse.status)
        console.log('[BOOKING] Auth test response ok:', authTestResponse.ok)

        if (!authTestResponse.ok) {
          const authError = await authTestResponse.text()
          console.log('[BOOKING] Auth test failed:', authError)
          setSubmitError('Token validation failed. Please log in again.')
          router.push('/auth/login')
          return
        }

        const authResult = await authTestResponse.json()
        console.log('[BOOKING] Auth test result:', authResult)

        if (!authResult.success) {
          console.log('[BOOKING] Auth test unsuccessful:', authResult)
          setSubmitError('Authentication failed. Please log in again.')
          router.push('/auth/login')
          return
        }

        console.log('[BOOKING] Token is valid, proceeding with booking...')
      } catch (authError) {
        console.error('[BOOKING] Auth test error:', authError)
        setSubmitError('Authentication check failed. Please try again.')
        return
      }

      // Prepare booking data with the correct schema
      const bookingData = {
        propertyId: propertyId,
        startDate: new Date(formData.checkIn + 'T12:00:00.000Z').toISOString(),
        endDate: new Date(formData.checkOut + 'T23:59:59.000Z').toISOString(),
        rentAmount: formData.totalAmount || 0,
        securityDeposit: 0, // Always 0 as requested
        notes: formData.message || ""
      }

      console.log('[BOOKING] Booking data:', bookingData)

      // Submit booking directly to backend API
      console.log('[BOOKING] Submitting booking to /api/bookings...')
      const response = await fetch(createApiUrl('bookings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData)
      })

      console.log('[BOOKING] Booking response status:', response.status)
      console.log('[BOOKING] Booking response ok:', response.ok)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[BOOKING] Booking failed:', errorData)
        throw new Error(errorData.message || `Booking failed with status: ${response.status}`)
      }

      const result = await response.json()
      console.log('[BOOKING] Booking response:', result)

      if (result && (result.id || result.success)) {
        setCurrentStep(4) // Keep on review step but show success
        console.log('[BOOKING] Booking successful!')

        // Optional: redirect to bookings page after a delay
        setTimeout(() => {
          router.push('/rents') // Redirect to user's bookings
        }, 2000)
      } else {
        setSubmitError('Failed to create booking - no confirmation received')
        console.log('[BOOKING] Booking failed - no booking ID or success confirmation')
      }
    } catch (error: unknown) {
      console.error('Booking submission error:', error)

      // Handle specific error cases
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.log('[BOOKING] Error message details:', errorMessage)

      if (errorMessage.includes('401')) {
        setSubmitError('Authentication failed. Please log in again. (Error: 401)')
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      } else if (errorMessage.includes('403')) {
        setSubmitError('You do not have permission to make bookings. (Error: 403)')
      } else if (errorMessage.includes('400')) {
        setSubmitError('Invalid booking data. Please check your information. (Error: 400)')
      } else if (errorMessage.includes('422')) {
        setSubmitError('Booking validation failed. Please check your data. (Error: 422)')
      } else if (errorMessage.includes('500')) {
        setSubmitError('Server error. Please try again later. (Error: 500)')
      } else {
        setSubmitError(`Failed to submit booking: ${errorMessage}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isLoadingProperty) {
    return (
      <ContentWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-lg text-slate-600">Loading property details...</div>
          </div>
        </div>
      </ContentWrapper>
    )
  }

  // Error state
  if (submitError && !property) {
    return (
      <ContentWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-lg text-red-600">{submitError}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </ContentWrapper>
    )
  }

  // Property not found state
  if (!property && !isLoadingProperty) {
    return (
      <ContentWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-lg text-red-600">Property not found</div>
            <button
              onClick={() => router.push('/property')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Properties
            </button>
          </div>
        </div>
      </ContentWrapper>
    )
  }

  return (
    <ContentWrapper>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <ButtonCircle icon={<ArrowLeft />} onClick={handleBack} />
        <h1 className="text-2xl font-sans font-medium text-slate-900">
          Request to book
        </h1>
      </div>

      {/* Authentication Warning */}
      {!isLoggedIn && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl">
          <p className="font-medium">Authentication Required</p>
          <p className="text-sm">You need to log in to make a booking. Please sign in to continue.</p>
        </div>
      )}

      {/* Property Loading Error */}
      {!propertyId && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">
          <p className="font-medium">Property Not Found</p>
          <p className="text-sm">Unable to detect property ID from the URL. Please check the link and try again.</p>
        </div>
      )}

      {/* Property Loading State */}
      {isLoadingProperty && propertyId && (
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl">
          <p className="font-medium">Loading Property</p>
          <p className="text-sm">Fetching property details for ID: {propertyId}</p>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Form */}
        <div className="space-y-8">
          {/* Step 1 - Add payment method */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-semibold text-slate-900">1.</span>
                <h2 className="text-lg font-semibold text-slate-900">Add payment method</h2>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-6 bg-blue-600 rounded text-white text-xs font-bold flex items-center justify-center">
                    VISA
                  </div>
                  <span className="text-slate-600">Visa credit card</span>
                </div>
                <button className="text-teal-600 font-medium text-sm hover:text-teal-700 transition-colors">
                  Change
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2 - Booking Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-semibold text-slate-900">2.</span>
                <h2 className="text-lg font-semibold text-slate-900">Booking details</h2>
              </div>

              <div className="space-y-4">
                {/* Start Month Counter */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Start Month
                  </label>
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="text-left">
                      <div className="font-medium text-slate-900">{getStartMonthText()}</div>
                      <div className="text-sm text-slate-500">Starting month for rental</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={decrementStartMonth}
                        className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-full hover:border-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={startMonthCount === 0}
                      >
                        <Minus size={16} className="text-slate-600" />
                      </button>
                      <span className="w-8 text-center font-medium text-slate-900">{startMonthCount}</span>
                      <button
                        onClick={incrementStartMonth}
                        className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-full hover:border-slate-400 transition-colors"
                      >
                        <Plus size={16} className="text-slate-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Duration Counter */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Duration
                  </label>
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="text-left">
                      <div className="font-medium text-slate-900">{getDurationText()}</div>
                      <div className="text-sm text-slate-500">Rental duration</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={decrementDuration}
                        className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-full hover:border-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={durationMonths === 1}
                      >
                        <Minus size={16} className="text-slate-600" />
                      </button>
                      <span className="w-8 text-center font-medium text-slate-900">{durationMonths}</span>
                      <button
                        onClick={incrementDuration}
                        className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-full hover:border-slate-400 transition-colors"
                      >
                        <Plus size={16} className="text-slate-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Show calculated dates for reference */}
                <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
                  <div className="text-sm font-medium text-slate-700">Calculated Dates:</div>
                  <div className="text-sm text-slate-600">
                    Check-in: {formData.checkIn ? new Date(formData.checkIn).toLocaleDateString() : 'Not set'}
                  </div>
                  <div className="text-sm text-slate-600">
                    Check-out: {formData.checkOut ? new Date(formData.checkOut).toLocaleDateString() : 'Not set'}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors duration-200"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3 - Write a message to the host */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-semibold text-slate-900">3.</span>
                <h2 className="text-lg font-semibold text-slate-900">Write a message to the host</h2>
              </div>

              <p className="text-slate-600 text-sm">
                Let your host know a little about your visit and why their place is a good fit for you.
              </p>

              <div className="space-y-4">
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Tell your message in here"
                  className="w-full h-32 px-4 py-3 border border-slate-200 rounded-xl bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />

                <div className="flex justify-between">
                  <button
                    onClick={handlePrevious}
                    className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors duration-200"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors duration-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 - Review Request */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-semibold text-slate-900">4.</span>
                <h2 className="text-lg font-semibold text-slate-900">Review your request</h2>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Payment Method:</p>
                  <p className="text-slate-900 font-medium">VISA credit card</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-2">Booking Details:</p>
                  <div className="space-y-1">
                    <p className="text-slate-900">Check-in: {formData.checkIn ? new Date(formData.checkIn).toLocaleDateString() : 'Not selected'}</p>
                    <p className="text-slate-900">Check-out: {formData.checkOut ? new Date(formData.checkOut).toLocaleDateString() : 'Not selected'}</p>
                    <p className="text-slate-900">Duration: {getDurationText()}</p>
                    <p className="text-slate-900">Total: RM {formData.totalAmount}</p>
                  </div>
                </div>

                {formData.message && (
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Message to Host:</p>
                    <p className="text-slate-900">{formData.message}</p>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                  {submitError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors duration-200 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={handleSubmitBooking}
                  disabled={isSubmitting || !isLoggedIn}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {getSubmitButtonText()}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right side - Property Summary */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="space-y-6">
              {/* Property Image */}
              <div className="relative w-full h-48 rounded-xl overflow-hidden">
                {property ? (
                  <Image
                    src={
                      property.images && property.images.length > 0
                        ? property.images[0]
                        : "https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758016984/rentverse-rooms/Gemini_Generated_Image_5hdui35hdui35hdu_s34nx6.png"
                    }
                    alt={property.title || `Property ${property.id} image`}
                    fill
                    className="object-cover"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      // Fallback to default image if the property image fails to load
                      const target = e.target as HTMLImageElement
                      target.src = "https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758016984/rentverse-rooms/Gemini_Generated_Image_5hdui35hdui35hdu_s34nx6.png"
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 animate-pulse rounded-xl flex items-center justify-center">
                    <span className="text-slate-400 text-sm">Loading image...</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-lg text-xs font-medium text-slate-700">
                  {property?.propertyType?.name || property?.type || 'Loading...'}
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-3">
                <p className="text-sm text-slate-500">
                  {property ? `${property.address}, ${property.city}, ${property.state}, ${property.country}` : 'Loading location...'}
                </p>
                <h3 className="text-lg font-semibold text-slate-900">
                  {property?.title || 'Loading property...'}
                </h3>
              </div>

              {/* Dates */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Dates</span>
                  <button className="text-teal-600 font-medium text-sm hover:text-teal-700 transition-colors">
                    Change
                  </button>
                </div>
                <p className="text-sm text-slate-600">
                  {formData.checkIn && formData.checkOut
                    ? `${new Date(formData.checkIn).toLocaleDateString()} - ${new Date(formData.checkOut).toLocaleDateString()}`
                    : 'Select dates in the form'
                  }
                </p>
              </div>

              {/* Price Details */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h4 className="text-sm font-medium text-slate-700">Price details</h4>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Monthly rent</span>
                  <span className="text-slate-900">
                    RM {getPropertyPrice()}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Duration</span>
                  <span className="text-slate-900">{getDurationText()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal (RM {getPropertyPrice()} × {durationMonths})</span>
                  <span className="text-slate-900">RM {getPropertyPrice() * durationMonths}</span>
                </div>

                <div className="flex justify-between text-sm font-medium border-t border-slate-200 pt-3">
                  <span className="text-slate-900">Total</span>
                  <span className="text-slate-900">
                    RM {formData.totalAmount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentWrapper>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <ContentWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">Loading...</div>
        </div>
      </ContentWrapper>
    }>
      <BookingPageContent />
    </Suspense>
  )
}
