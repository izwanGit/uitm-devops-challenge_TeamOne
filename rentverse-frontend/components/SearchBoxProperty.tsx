'use client'

import clsx from 'clsx'
import React, { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Minus } from 'lucide-react'
import { getAllLocations } from '@/data/searchbox-options'
import { usePropertyTypesForSearch } from '@/hooks/usePropertyTypes'
import usePropertiesStore from '@/stores/propertiesStore'

function SearchBoxProperty(props: Readonly<React.HTMLAttributes<HTMLDivElement>>): React.ReactNode {
  const {
    isWhereOpen,
    isDurationOpen,
    isTypeOpen,
    whereValue,
    monthCount,
    yearCount,
    typeValue,
    setIsWhereOpen,
    setIsDurationOpen,
    setIsTypeOpen,
    setWhereValue,
    incrementMonth,
    decrementMonth,
    incrementYear,
    decrementYear,
    getDurationText,
    getTypeText,
    handleLocationSelect,
    handleTypeSelect,
    searchProperties,
    loadProperties,
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
    if (whereValue) params.append('city', whereValue)
    if (typeValue) params.append('type', typeValue)

    // Navigate to results page with query params
    router.push(`/property/result?${params.toString()}`)
  }

  // Handle location selection without triggering search
  const handleLocationSelectOnly = (location: { name: string }) => {
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

  // Load initial properties
  useEffect(() => {
    loadProperties()
  }, [loadProperties])

  return (
    <div className={clsx(['relative', className])} {...propsRest}>
      <div
        className="flex items-center bg-white rounded-full shadow-lg border border-slate-200 p-0 max-w-4xl mx-auto overflow-hidden">
        {/* Where Section */}
        <div
          className={clsx([
            'flex-1 pl-8 pr-6 py-5 border-r border-slate-200 cursor-pointer flex flex-col justify-center',
            'hover:bg-slate-50',
            isWhereOpen && 'bg-slate-50',
          ])}
          onClick={() => setIsWhereOpen(true)}
        >
          <label
            className="block text-xs font-semibold text-slate-900 mb-1 uppercase tracking-wide text-left">Where</label>
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
            className="w-full text-sm text-slate-600 placeholder-slate-400 bg-transparent border-none outline-none font-medium text-left"
          />
        </div>

        {/* Duration Section */}
        <div
          className={clsx([
            'flex-1 px-6 py-5 border-r border-slate-200 cursor-pointer flex flex-col justify-center',
            'hover:bg-slate-50',
            isDurationOpen && 'bg-slate-50',
          ])}
          onClick={() => setIsDurationOpen(!isDurationOpen)}
        >
          <label
            className="block text-xs font-semibold text-slate-900 mb-1 uppercase tracking-wide text-left">Duration</label>
          <span className="text-sm text-slate-600 font-medium text-left">{getDurationText()}</span>
        </div>

        {/* Type Section */}
        <div
          className={clsx([
            'flex-1 px-6 py-5 cursor-pointer flex flex-col justify-center',
            'hover:bg-slate-50',
            isTypeOpen && 'bg-slate-50',
          ])}
          onClick={() => setIsTypeOpen(!isTypeOpen)}
        >
          <label
            className="block text-xs font-semibold text-slate-900 mb-1 uppercase tracking-wide text-left">Type</label>
          <span className="text-sm text-slate-600 font-medium text-left">{getTypeText()}</span>
        </div>

        {/* Search Button */}
        <div className="ml-4 pr-4">
          <button
            onClick={handleSearch}
            className="flex items-center justify-center w-12 h-12 bg-teal-600 hover:bg-teal-700 rounded-full transition-colors cursor-pointer">
            <Search size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Dropdown for Where section */}
      <div ref={whereRef}>
        {isWhereOpen && (
          <div
            className="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-200 mt-2 p-6 z-50 max-w-4xl mx-auto">
            <h3 className="text-sm font-medium text-slate-900 mb-4 text-left">Suggested locations</h3>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {/* Search option when there's a value */}
              {whereValue && (
                <div
                  className="flex items-center p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border-b border-slate-100 mb-2"
                  onClick={() => handleLocationSelectOnly({ name: whereValue })}
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-lg mr-4 flex-shrink-0">
                    <Search size={20} className="text-slate-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-slate-900 text-left">Search &quot;{whereValue}&quot;</div>
                    <div className="text-sm text-slate-500 text-left">Search for this location</div>
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
                    className="flex items-center p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => handleLocationSelectOnly(location)}
                  >
                    <div
                      className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-lg mr-4 flex-shrink-0">
                      <span className="text-xl">{location.icon}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-slate-900 text-left">{location.name}</div>
                      <div className="text-sm text-slate-500 text-left">{location.description}</div>
                    </div>
                  </div>
                ))}

              {/* No results message */}
              {whereValue && locations.filter(location =>
                location.name.toLowerCase().includes(whereValue.toLowerCase()) ||
                location.description.toLowerCase().includes(whereValue.toLowerCase()),
              ).length === 0 && (
                  <div className="flex items-center p-3 text-slate-500">
                    <div
                      className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-lg mr-4 flex-shrink-0">
                      <Search size={20} className="text-slate-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-slate-600 text-left">No locations found</div>
                      <div className="text-sm text-slate-400 text-left">Try searching for a different location</div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Dropdown for Duration section */}
      <div ref={durationRef}>
        {isDurationOpen && (
          <div
            className="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-200 mt-2 p-6 z-50 max-w-4xl mx-auto">
            <div className="space-y-6">
              {/* Month Counter */}
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="font-medium text-slate-900 text-left">Month</div>
                  <div className="text-sm text-slate-500 text-left">Rent monthly</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={decrementMonth}
                    className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-full hover:border-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={monthCount === 0}
                  >
                    <Minus size={16} className="text-slate-600" />
                  </button>
                  <span className="w-8 text-center font-medium text-slate-900">{monthCount}</span>
                  <button
                    onClick={incrementMonth}
                    className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-full hover:border-slate-400 transition-colors"
                  >
                    <Plus size={16} className="text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Year Counter */}
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="font-medium text-slate-900 text-left">Year</div>
                  <div className="text-sm text-slate-500 text-left">Rent yearly</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={decrementYear}
                    className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-full hover:border-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={yearCount === 0}
                  >
                    <Minus size={16} className="text-slate-600" />
                  </button>
                  <span className="w-8 text-center font-medium text-slate-900">{yearCount}</span>
                  <button
                    onClick={incrementYear}
                    className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-full hover:border-slate-400 transition-colors"
                  >
                    <Plus size={16} className="text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dropdown for Type section */}
      <div ref={typeRef}>
        {isTypeOpen && (
          <div
            className="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-200 mt-2 p-6 z-50 max-w-4xl mx-auto">
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {propertyTypes.map((type, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleTypeSelectOnly(type)}
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-lg mr-4 flex-shrink-0">
                    <span className="text-xl">{type.icon}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-slate-900 text-left">{type.name}</div>
                    <div className="text-sm text-slate-500 text-left">{type.description}</div>
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

export default SearchBoxProperty
