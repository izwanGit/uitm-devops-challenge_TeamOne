'use client'

import clsx from 'clsx'
import React, { useRef, useEffect } from 'react'
import { Search, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getAllLocations } from '@/data/searchbox-options'
import { usePropertyTypesForSearch } from '@/hooks/usePropertyTypes'
import usePropertiesStore from '@/stores/propertiesStore'

function SearchBoxPropertyMini(props: React.HTMLAttributes<HTMLDivElement>): React.ReactNode {
  const {
    isWhereOpen,
    isDurationOpen,
    isTypeOpen,
    whereValue,
    typeValue,
    setIsWhereOpen,
    setIsDurationOpen,
    setIsTypeOpen,
    setWhereValue,
    getDurationText,
    getTypeText,
    handleLocationSelect,
    handleTypeSelect,
    searchProperties,
    userLocation,
    setUserLocation,
  } = usePropertiesStore()

  const router = useRouter()
  const whereRef = useRef<HTMLDivElement>(null)
  const durationRef = useRef<HTMLDivElement>(null)
  const typeRef = useRef<HTMLDivElement>(null)
  const locations = getAllLocations()
  const { propertyTypes } = usePropertyTypesForSearch()
  const { className, ...propsRest } = props

  // Handle search functionality
  const handleSearch = async () => {
    const params = new URLSearchParams()

    if (userLocation) {
      params.append('lat', userLocation.lat.toString())
      params.append('lng', userLocation.lng.toString())
    } else if (whereValue) {
      params.append('city', whereValue)
    }

    if (typeValue) params.append('type', typeValue)

    // Navigate to results page with query params
    router.push(`/property/result?${params.toString()}`)
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setWhereValue('Current Location')
        setIsWhereOpen(false)

        // Trigger immediate search
        const params = new URLSearchParams()
        params.set('lat', latitude.toString())
        params.set('lng', longitude.toString())
        if (typeValue) params.set('type', typeValue)
        router.push(`/property/result?${params.toString()}`)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to get your location')
      }
    )
  }

  // Handle location selection without triggering search
  const handleLocationSelectOnly = (location: { name: string }) => {
    setUserLocation(null)
    handleLocationSelect(location)
    setIsWhereOpen(false)
  }

  // Handle type selection without triggering search
  const handleTypeSelectOnly = (type: { name: string }) => {
    handleTypeSelect(type)
    setIsTypeOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (whereRef.current && !whereRef.current.contains(event.target as Node)) {
        setIsWhereOpen(false)
      }
      if (durationRef.current && !durationRef.current.contains(event.target as Node)) {
        setIsDurationOpen(false)
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [setIsWhereOpen, setIsDurationOpen, setIsTypeOpen])

  return (
    <div className={clsx(['relative', className])} {...propsRest} >
      <div
        className="flex items-center bg-white rounded-full shadow-lg border border-slate-200 p-1 max-w-lg mx-auto overflow-hidden">
        {/* Where Section */}
        <div
          className={clsx([
            'flex-1 px-4 py-2 cursor-pointer rounded-l-full',
            'hover:bg-slate-50',
            isWhereOpen && 'bg-slate-50',
          ])}
          onClick={() => setIsWhereOpen(true)}
        >
          <div className="flex items-center">
            <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full mr-3">
              <span className="text-sm">🏛️</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-900 mb-1">Where</div>
              <input
                type="text"
                placeholder="Search destinations"
                value={whereValue}
                onChange={(e) => setWhereValue(e.target.value)}
                onFocus={() => setIsWhereOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                className="w-full text-xs text-slate-600 placeholder-slate-400 bg-transparent border-none outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Duration Section */}
        <div
          className={clsx([
            'flex-1 px-4 py-2 cursor-pointer border-l border-r border-slate-200',
            'hover:bg-slate-50',
            isDurationOpen && 'bg-slate-50',
          ])}
          onClick={() => setIsDurationOpen(!isDurationOpen)}
        >
          <div className="text-xs font-medium text-slate-900">Duration</div>
          <div className="text-xs text-slate-500 truncate">{getDurationText()}</div>
        </div>

        {/* Type Section */}
        <div
          className={clsx([
            'flex-1 px-4 py-2 cursor-pointer',
            'hover:bg-slate-50',
            isTypeOpen && 'bg-slate-50',
          ])}
          onClick={() => setIsTypeOpen(!isTypeOpen)}
        >
          <div className="text-xs font-medium text-slate-900">Type</div>
          <div className="text-xs text-slate-500 truncate">{getTypeText()}</div>
        </div>

        {/* Search Button */}
        <div className="ml-2 pr-2">
          <button
            onClick={handleSearch}
            className="flex items-center justify-center w-8 h-8 bg-teal-600 hover:bg-teal-700 rounded-full transition-colors cursor-pointer">
            <Search size={14} className="text-white" />
          </button>
        </div>
      </div>

      {/* Dropdown for Where section */}
      <div ref={whereRef}>
        {isWhereOpen && (
          <div
            className="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-200 mt-2 p-4 z-50 max-w-lg mx-auto">
            <h3 className="text-xs font-medium text-slate-900 mb-3">Suggested locations</h3>
            <div className="space-y-1 max-h-60 overflow-y-auto">

              {/* Thinking Bigger: Use Current Location Option */}
              <div
                className="flex items-center p-2 hover:bg-teal-50 rounded-lg cursor-pointer transition-colors border-b border-slate-100 mb-2 group"
                onClick={handleUseMyLocation}
              >
                <div
                  className="w-8 h-8 flex items-center justify-center bg-teal-100 rounded-lg mr-3 group-hover:bg-teal-200 transition-colors">
                  <MapPin size={14} className="text-teal-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-teal-900">Use current location</div>
                  <div className="text-[10px] text-teal-600/70">Find nearby</div>
                </div>
              </div>

              {/* Search option when there's a value */}
              {whereValue && (
                <div
                  className="flex items-center p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border-b border-slate-100 mb-2"
                  onClick={() => handleLocationSelectOnly({ name: whereValue })}
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg mr-3">
                    <Search size={14} className="text-slate-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Search &quot;{whereValue}&quot;</div>
                    <div className="text-xs text-slate-500">Search for this location</div>
                  </div>
                </div>
              )}

              {/* Filtered locations */}
              {locations
                .filter(location =>
                  location.name.toLowerCase().includes(whereValue.toLowerCase()) ||
                  location.description.toLowerCase().includes(whereValue.toLowerCase()),
                )
                .map((location, index) => (
                  <div
                    key={index}
                    className="flex items-center p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => handleLocationSelectOnly(location)}
                  >
                    <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg mr-3">
                      <span className="text-sm">{location.icon}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{location.name}</div>
                      <div className="text-xs text-slate-500">{location.description}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Dropdown for Duration section */}
      <div ref={durationRef}>
        {isDurationOpen && (
          <div
            className="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-200 mt-2 p-4 z-50 max-w-lg mx-auto">
            <div className="text-xs font-medium text-slate-900 mb-3">Select duration</div>
            <div className="grid grid-cols-2 gap-3">
              <div
                className="p-3 border border-slate-200 rounded-lg cursor-pointer hover:border-teal-300 hover:bg-teal-50 transition-colors"
                onClick={() => {
                  // Set 1 month duration
                  setIsDurationOpen(false)
                }}
              >
                <div className="text-sm font-medium text-slate-900">1 Month</div>
                <div className="text-xs text-slate-500">Short term</div>
              </div>
              <div
                className="p-3 border border-slate-200 rounded-lg cursor-pointer hover:border-teal-300 hover:bg-teal-50 transition-colors"
                onClick={() => {
                  // Set 3 months duration
                  setIsDurationOpen(false)
                }}
              >
                <div className="text-sm font-medium text-slate-900">3 Months</div>
                <div className="text-xs text-slate-500">Medium term</div>
              </div>
              <div
                className="p-3 border border-slate-200 rounded-lg cursor-pointer hover:border-teal-300 hover:bg-teal-50 transition-colors"
                onClick={() => {
                  // Set 6 months duration
                  setIsDurationOpen(false)
                }}
              >
                <div className="text-sm font-medium text-slate-900">6 Months</div>
                <div className="text-xs text-slate-500">Long term</div>
              </div>
              <div
                className="p-3 border border-slate-200 rounded-lg cursor-pointer hover:border-teal-300 hover:bg-teal-50 transition-colors"
                onClick={() => {
                  // Set 1 year duration
                  setIsDurationOpen(false)
                }}
              >
                <div className="text-sm font-medium text-slate-900">1 Year</div>
                <div className="text-xs text-slate-500">Extended</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dropdown for Type section */}
      <div ref={typeRef}>
        {isTypeOpen && (
          <div
            className="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-200 mt-2 p-4 z-50 max-w-lg mx-auto">
            <div className="text-xs font-medium text-slate-900 mb-3">Property type</div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {propertyTypes.map((type, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleTypeSelectOnly(type)}
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg mr-3">
                    <span className="text-sm">{type.icon}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{type.name}</div>
                    <div className="text-xs text-slate-500">{type.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchBoxPropertyMini
