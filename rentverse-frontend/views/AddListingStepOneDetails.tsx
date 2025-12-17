'use client'

import { useState, useEffect } from 'react'
import usePropertyListingStore from '@/stores/propertyListingStore'
import { Check } from 'lucide-react'

interface Amenity {
  id: string
  name: string
  category: string
  icon?: string
}

function AddListingStepOneDetails() {
  const { data, updateData } = usePropertyListingStore()
  const [selectedFurnishing, setSelectedFurnishing] = useState(data.furnished ? (data.images.length > 0 ? 'fully-furnished' : 'unfurnished') : '') // Basic init, can be improved
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loadingAmenities, setLoadingAmenities] = useState(true)

  // Load amenities on mount
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const res = await fetch(`${API_URL}/api/amenities?limit=100`)
        if (res.ok) {
          const json = await res.json()
          if (json.success && Array.isArray(json.data)) {
            setAmenities(json.data)
          }
        }
      } catch (error) {
        console.error('Failed to load amenities', error)
      } finally {
        setLoadingAmenities(false)
      }
    }
    fetchAmenities()
  }, [])

  // Sync furnishing with store (existing logic was just local state)
  const handleFurnishingSelect = (value: string) => {
    setSelectedFurnishing(value)
    // Map string value to boolean/data concept if needed,
    // though the store expects boolean 'furnished'.
    // For now, let's just assume 'unfurnished' is false, others true?
    // Or better, let's keep the user request focused: "choose amenities".
    // I will primarily focus on Amenities, but I should probably sync this too if I touch it.
    updateData({ furnished: value !== 'unfurnished' })
  }

  const toggleAmenity = (id: string, name: string) => {
    const currentIds = data.amenityIds || []
    const currentNames = data.amenities || []

    let newIds: string[]
    let newNames: string[]

    if (currentIds.includes(id)) {
      newIds = currentIds.filter(i => i !== id)
      newNames = currentNames.filter(n => n !== name)
    } else {
      newIds = [...currentIds, id]
      newNames = [...currentNames, name]
    }

    updateData({
      amenityIds: newIds,
      amenities: newNames
    })
  }


  const furnishingOptions = [
    { value: 'unfurnished', label: 'Unfurnished' },
    { value: 'fully-furnished', label: 'Fully furnished' },
    { value: 'partly-furnished', label: 'Partly furnished' },
    { value: 'negotiable', label: 'Negotiable' },
  ]



  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <h2 className="text-3xl font-serif text-slate-900">
            Add more details
          </h2>
          <p className="text-lg text-slate-600">
            Enhance your list with additional information
          </p>
        </div>

        {/* Furnishing Options */}
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-lg font-medium text-slate-900">
              How is your house available?
            </label>

            {/* Furnishing Selection Grid */}
            <div className="grid grid-cols-2 gap-4">
              {furnishingOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFurnishingSelect(option.value)}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                    ${selectedFurnishing === option.value
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                    }
                  `}
                >
                  {/* Radio button indicator */}
                  <div className="flex items-center space-x-3">
                    <div
                      className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                        ${selectedFurnishing === option.value
                          ? 'border-slate-900 bg-slate-900'
                          : 'border-slate-300'
                        }
                      `}
                    >
                      {selectedFurnishing === option.value && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span
                      className={`
                        font-medium transition-colors
                        ${selectedFurnishing === option.value
                          ? 'text-slate-900'
                          : 'text-slate-700'
                        }
                      `}
                    >
                      {option.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Amenities Selection */}
      <div className="space-y-6 pt-6 border-t border-slate-200">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-900">
            What amenities does your place offer?
          </h3>
          <p className="text-slate-600">
            Select all that apply to help guests find your place.
          </p>
        </div>

        {loadingAmenities ? (
          <div className="py-8 text-center text-slate-500">Loading amenities...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {amenities.map((amenity) => {
              const isSelected = (data.amenityIds || []).includes(amenity.id)
              return (
                <button
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id, amenity.name)}
                  className={`
                      flex items-center p-4 rounded-xl border-2 transition-all duration-200 text-left hover:border-slate-300
                      ${isSelected
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                      : 'border-slate-200 bg-white'
                    }
                    `}
                >
                  <div className={`
                      w-6 h-6 rounded-md border mr-3 flex items-center justify-center transition-colors
                      ${isSelected ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300 bg-white'}
                    `}>
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </div>
                  <div>
                    <span className={`font-medium ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                      {amenity.name}
                    </span>
                    {amenity.category && (
                      <p className="text-xs text-slate-500 mt-0.5 capitalize">{amenity.category.toLowerCase()}</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>

  )
}

export default AddListingStepOneDetails