'use client'

import { useEffect } from 'react'
import { usePropertyListingStore } from '../stores/propertyListingStore'

function AddListingStepOneBasic() {
  const { data, updateData } = usePropertyListingStore()

  // Initialize data if not set
  useEffect(() => {
    if (data.bedrooms === 0 && data.bathrooms === 0 && data.areaSqm === 0) {
      updateData({
        bedrooms: 1,
        bathrooms: 1,
        areaSqm: 0
      })
    }
  }, [data.bedrooms, data.bathrooms, data.areaSqm, updateData])

  const incrementCount = (field: 'bedrooms' | 'bathrooms', value: number) => {
    console.log(`Incrementing ${field} from ${value} to ${value + 1}`)
    updateData({ [field]: value + 1 })
  }

  const decrementCount = (field: 'bedrooms' | 'bathrooms', value: number) => {
    if (value > 0) {
      console.log(`Decrementing ${field} from ${value} to ${value - 1}`)
      updateData({ [field]: value - 1 })
    }
  }

  const handleAreaChange = (value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value)
    if (!isNaN(numValue)) {
      console.log(`Updating areaSqm to ${numValue}`)
      updateData({ areaSqm: numValue })
    }
  }

  // Debug log current data
  useEffect(() => {
    console.log('Basic info component data:', {
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      areaSqm: data.areaSqm
    })
  }, [data.bedrooms, data.bathrooms, data.areaSqm])

  return (
    <div className="max-w-6xl w-full mx-auto p-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <h2 className="text-3xl font-serif text-slate-900">
            Share some basics about your place
          </h2>
          <p className="text-base text-slate-500 leading-relaxed">
            You&apos;ll add more details later, like bed types.
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-8">
          {/* Bedrooms */}
          <div className="flex items-center justify-between py-4 border-b border-slate-200">
            <span className="text-lg text-slate-900">Bedrooms</span>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => decrementCount('bedrooms', data.bedrooms)}
                className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-slate-400 transition-colors"
                disabled={data.bedrooms === 0}
              >
                <span className="text-lg leading-none">−</span>
              </button>
              <span className="text-lg font-medium text-slate-900 min-w-[3rem] text-center">
                {data.bedrooms === 0 ? 'Studio' : data.bedrooms}
              </span>
              <button
                onClick={() => incrementCount('bedrooms', data.bedrooms)}
                className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-slate-400 transition-colors"
              >
                <span className="text-lg leading-none">+</span>
              </button>
            </div>
          </div>

          {/* Bathrooms */}
          <div className="flex items-center justify-between py-4 border-b border-slate-200">
            <span className="text-lg text-slate-900">Bathrooms</span>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => decrementCount('bathrooms', data.bathrooms)}
                className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-slate-400 transition-colors"
                disabled={data.bathrooms === 0}
              >
                <span className="text-lg leading-none">−</span>
              </button>
              <span className="text-lg font-medium text-slate-900 min-w-[2rem] text-center">
                {data.bathrooms}
              </span>
              <button
                onClick={() => incrementCount('bathrooms', data.bathrooms)}
                className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-slate-400 transition-colors"
              >
                <span className="text-lg leading-none">+</span>
              </button>
            </div>
          </div>

          {/* Total area */}
          <div className="space-y-3">
            <label htmlFor="total-area" className="block text-lg text-slate-900">Total area</label>
            <div className="relative">
              <input
                id="total-area"
                type="number"
                value={data.areaSqm || ''}
                onChange={(e) => handleAreaChange(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 pr-12 text-base border border-slate-200 rounded-full bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500">
                sqft
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Total area of the property in square feet.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddListingStepOneBasic