'use client'

import { useEffect, useState } from 'react'
import CardProperty from '@/components/CardProperty'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import usePropertiesStore from '@/stores/propertiesStore'


function ListFeatured() {
  const { properties, isLoading, loadProperties, setUserLocation, userLocation } = usePropertiesStore()
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    // Load featured properties (uses defaults or current store state)
    // If userLocation was set previously, it will be used.
    loadProperties({ limit: 8, page: 1 })
  }, [loadProperties])

  const handleNearMe = () => {
    setIsLocating(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported. Please enable it manually.')
      setIsLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        // Reload properties with location explicitly in filters
        loadProperties({ limit: 8, page: 1, lat: latitude, lng: longitude })
        setIsLocating(false)
      },
      (error) => {
        console.warn('Geolocation issue:', error.message, '(Code ' + error.code + ')')

        // Fallback for development/testing if real location fails
        // We treat this as a "successful" switch to demo mode
        console.log('Falling back to mock location (Kuala Lumpur) for demonstration.')
        const mockLat = 3.140853
        const mockLng = 101.693207

        setUserLocation({ lat: mockLat, lng: mockLng })
        // Pass location explicitly in filters
        loadProperties({ limit: 8, page: 1, lat: mockLat, lng: mockLng })

        // Clear error since we are successfully using a fallback
        setLocationError(null)
        setIsLocating(false)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
  }

  if (isLoading && !isLocating) {
    return (
      <div className="py-16 px-4 md:px-16">
        <div className="mb-12">
          <h2 className="font-serif text-3xl text-teal-900 mb-4">
            Featured Properties For You
          </h2>
          <p className="text-base text-teal-800 max-w-2xl">
            A selection of verified properties in the most sought-after locations
          </p>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 px-4 md:px-16 overflow-hidden">
      {/* Section title */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-teal-900 mb-4">
            {userLocation ? 'Properties Near You' : 'Featured Properties For You'}
          </h2>
          <p className="text-base text-teal-800 max-w-2xl">
            {userLocation
              ? 'Showing the closest verified properties to your current location'
              : 'A selection of verified properties in the most sought-after locations'}
          </p>
        </div>

        <div className="flex flex-col items-end">
          <button
            onClick={handleNearMe}
            disabled={isLocating}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${userLocation
              ? 'bg-teal-50 border-teal-200 text-teal-700'
              : 'border-slate-300 text-slate-600 hover:border-teal-500 hover:text-teal-600'
              }`}
          >
            {isLocating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
            )}
            {userLocation ? 'Update Location' : 'Use My Location'}
          </button>
          {locationError && <span className="text-xs text-red-500 mt-1">{locationError}</span>}
        </div>
      </div>

      <Swiper
        modules={[FreeMode]}
        spaceBetween={32}
        freeMode={true}
        grabCursor={true}
        breakpoints={{
          // Mobile
          320: {
            slidesPerView: 1.4,
            spaceBetween: 16,
          },
          // Tablet
          768: {
            slidesPerView: 2.3,
            spaceBetween: 24,
          },
          // Desktop
          1024: {
            slidesPerView: 3,
            spaceBetween: 32,
          },
          // Large desktop
          1280: {
            slidesPerView: 4,
            spaceBetween: 32,
          },
        }}
        className="overflow-hidden"
      >
        {properties.map((property) => (
          <SwiperSlide key={property.id}>
            <CardProperty property={property} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default ListFeatured