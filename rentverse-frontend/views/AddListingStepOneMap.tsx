'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin, Navigation } from 'lucide-react'
import * as maptilersdk from '@maptiler/sdk'
import { getPopularLocations } from '@/data/popular-locations'
import { LocationBaseType } from '@/types/location'
import { usePropertyListingStore } from '@/stores/propertyListingStore'
import { reverseGeocode, isValidMalaysiaCoordinates, formatCoordinates } from '@/utils/geocoding'
import { getMapTilerApiKey } from '@/utils/apiConfig'

function AddListingStepOneMap() {
  // Initialize API key once
  useEffect(() => {
    const apiKey = getMapTilerApiKey()
    if (!maptilersdk.config.apiKey) {
      maptilersdk.config.apiKey = apiKey
    }
  }, [])

  // Store integration
  const { updateData, markStepCompleted, nextStep } = usePropertyListingStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<LocationBaseType | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredLocations, setFilteredLocations] = useState<LocationBaseType[]>([])
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maptilersdk.Map | null>(null)
  const marker = useRef<maptilersdk.Marker | null>(null)
  const isProgrammaticUpdate = useRef(false)

  const popularLocations = getPopularLocations()

  // Auto-fill address from coordinates
  const handleAutoFillAddress = useCallback(async (lat: number, lng: number) => {
    if (!isValidMalaysiaCoordinates(lat, lng)) {
      console.warn('Coordinates are outside Malaysia bounds')
      return
    }

    setIsGeocodingLoading(true)
    try {
      const result = await reverseGeocode(lat, lng)
      if (result.success && result.address) {
        updateData({
          latitude: lat,
          longitude: lng,
          district: result.address.district,
          subdistrict: result.address.subdistrict,
          state: result.address.state,
          city: result.address.city,
          streetAddress: result.address.streetAddress,
          autoFillDistance: result.distance,
        })

        // Mark this step as completed since coordinates are selected
        markStepCompleted(3) // Step 3 is location-map step

        console.log('Distance-based auto-fill successful:', {
          state: result.address.state,
          district: result.address.district,
          subdistrict: result.address.subdistrict,
          distance: result.distance ? `${result.distance.toFixed(2)}km` : 'unknown'
        })
      } else {
        console.warn('Auto-fill failed:', result.error)
        // Still save coordinates even if address lookup failed
        updateData({
          latitude: lat,
          longitude: lng,
        })
        markStepCompleted(3)
      }
    } catch (error) {
      console.error('Auto-fill failed:', error)
      // Still save coordinates even if there was an error
      updateData({
        latitude: lat,
        longitude: lng,
      })
      markStepCompleted(3)
    } finally {
      setIsGeocodingLoading(false)
    }
  }, [updateData, markStepCompleted])

  // Initialize MapTiler API key
  useEffect(() => {
    if (!maptilersdk.config.apiKey) {
      maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API || ''
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const defaultCenter: [number, number] = selectedLocation
      ? [selectedLocation.longitude, selectedLocation.latitude]
      : [100.3327, 5.4164] // Default to Penang

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: 'streets-v2',
      center: defaultCenter,
      zoom: 13,
      interactive: true,
    })

    // Add click handler for map
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat

      // Remove existing marker
      if (marker.current) {
        marker.current.remove()
      }

      // Add new marker at clicked location
      marker.current = new maptilersdk.Marker({
        color: '#1A6B5E', // red-500
      })
        .setLngLat([lng, lat])
        .addTo(map.current!)

      // Update selected location with clicked coordinates
      setSelectedLocation({
        name: `Custom Location`,
        imageUrl: '',
        latitude: lat,
        longitude: lng,
      })

      isProgrammaticUpdate.current = true // Apply fix here
      setSearchQuery(formatCoordinates(lat, lng))

      // Auto-fill address unless in manual mode
      if (!manualMode) {
        handleAutoFillAddress(lat, lng)
      }
    })

    return () => {
      if (marker.current) {
        marker.current.remove()
      }
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [handleAutoFillAddress, manualMode, selectedLocation])

  // Update map center and marker when location changes
  useEffect(() => {
    if (map.current && selectedLocation) {
      map.current.flyTo({
        center: [selectedLocation.longitude, selectedLocation.latitude],
        zoom: 15,
        duration: 1000,
      })

      // Remove existing marker
      if (marker.current) {
        marker.current.remove()
      }

      // Add new marker
      marker.current = new maptilersdk.Marker({
        color: '#1A6B5E', // red-500
      })
        .setLngLat([selectedLocation.longitude, selectedLocation.latitude])
        .addTo(map.current)
    }
  }, [selectedLocation])


  useEffect(() => {
    // If update was programmatic, reset flag and DO NOT show dropdown
    if (isProgrammaticUpdate.current) {
      isProgrammaticUpdate.current = false
      return
    }

    // Filter locations based on search query
    if (searchQuery.trim()) {
      const filtered = popularLocations.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredLocations(filtered)
      setShowDropdown(true)
    } else {
      setFilteredLocations(popularLocations)
      setShowDropdown(false)
    }
  }, [searchQuery, popularLocations])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLocationSelect = (location: LocationBaseType) => {
    setSelectedLocation(location)
    setSearchQuery(location.name)
    setShowDropdown(false)
  }

  const handleAddNewLocation = () => {
    // Navigate to add new location page
    console.log('Navigate to add new location page')
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl text-slate-900">
            Where&apos;s your place located?
          </h2>
          <p className="text-lg text-slate-600">
            Your address is only shared with guests after they&apos;ve made a reservation.
          </p>
        </div>

        {/* Map Container with Overlaid Search */}
        <div className="relative">
          {/* Real MapTiler Map */}
          <div className="w-full h-96 rounded-xl overflow-hidden border border-slate-200 relative">
            <div
              ref={mapContainer}
              className="map w-full h-full"
              style={{ height: '100%', width: '100%' }}
            />
          </div>

          {/* Overlaid Search Bar */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
            <div className="relative" ref={searchRef}>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Enter your address"
                  className="w-full pl-12 pr-4 py-4 rounded-full text-lg focus:border-slate-400 focus:outline-none transition-colors bg-white shadow-md"
                />
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
                  {filteredLocations.length > 0 ? (
                    filteredLocations.map((location, index) => (
                      <button
                        key={index}
                        onClick={() => handleLocationSelect(location)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 border-b border-slate-100 last:border-b-0"
                      >
                        <MapPin size={16} className="text-slate-400 flex-shrink-0" />
                        <span className="text-slate-900">{location.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4">
                      <p className="text-slate-600 mb-3">Location not found.</p>
                      <button
                        onClick={handleAddNewLocation}
                        className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        Add new location
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Location Info */}
        {selectedLocation && (
          <div className="p-4 bg-slate-50 rounded-lg max-w-md mx-auto">
            <h4 className="font-medium text-slate-900 mb-1">Selected Location</h4>
            <p className="text-slate-600">{selectedLocation.name}</p>
            <p className="text-sm text-slate-500">
              Lat: {selectedLocation.latitude.toFixed(6)}, Lng: {selectedLocation.longitude.toFixed(6)}
            </p>
            {isGeocodingLoading && (
              <p className="text-sm text-blue-600 mt-2">Loading address details...</p>
            )}
          </div>
        )}

        {/* Manual Entry Toggle */}
        <div className="text-center">
          <button
            onClick={() => setManualMode(!manualMode)}
            className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Navigation size={16} />
            {manualMode ? 'Enable auto-fill from map' : 'Enter location manually'}
          </button>
          {manualMode && (
            <p className="text-sm text-slate-500 mt-2">
              Auto-fill is disabled. You can manually enter address details in the next step.
            </p>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-center pt-6">
          <button
            onClick={() => {
              if (selectedLocation) {
                markStepCompleted(3) // Mark map step as completed
                nextStep()
              }
            }}
            disabled={!selectedLocation}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${selectedLocation
              ? 'bg-slate-900 text-white hover:bg-slate-800'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            {selectedLocation ? 'Continue to Address Details' : 'Select a location to continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddListingStepOneMap