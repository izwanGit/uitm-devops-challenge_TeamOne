'use client'

import { usePropertyListingStore } from '@/stores/propertyListingStore'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'

const COMMON_AMENITIES = [
    'Wifi', 'Air conditioning', 'Kitchen', 'Washer', 'Dryer',
    'Iron', 'TV', 'Heating', 'Pool', 'Gym', 'Parking', 'Elevator'
]

export default function EditDetails() {
    const { data, updateData } = usePropertyListingStore()
    const [newAmenity, setNewAmenity] = useState('')

    const toggleAmenity = (amenity: string) => {
        const current = data.amenities || []
        if (current.includes(amenity)) {
            updateData({ amenities: current.filter(a => a !== amenity) })
        } else {
            updateData({ amenities: [...current, amenity] })
        }
    }

    const handleAddCustomAmenity = () => {
        if (newAmenity.trim()) {
            const current = data.amenities || []
            if (!current.includes(newAmenity.trim())) {
                updateData({ amenities: [...current, newAmenity.trim()] })
            }
            setNewAmenity('')
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-1">Property Details</h2>
                <p className="text-sm text-slate-500">Specifications and amenities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bedrooms */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Bedrooms</label>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => updateData({ bedrooms: Math.max(0, data.bedrooms - 1) })}
                            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                        >-</button>
                        <span className="text-xl font-medium w-8 text-center">{data.bedrooms}</span>
                        <button
                            onClick={() => updateData({ bedrooms: data.bedrooms + 1 })}
                            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                        >+</button>
                    </div>
                </div>

                {/* Bathrooms */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Bathrooms</label>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => updateData({ bathrooms: Math.max(0, data.bathrooms - 0.5) })}
                            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                        >-</button>
                        <span className="text-xl font-medium w-8 text-center">{data.bathrooms}</span>
                        <button
                            onClick={() => updateData({ bathrooms: data.bathrooms + 0.5 })}
                            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                        >+</button>
                    </div>
                </div>

                {/* Area */}
                <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Area (Square Feet)</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={data.areaSqm}
                            onChange={(e) => updateData({ areaSqm: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all pl-4"
                            placeholder="e.g. 1200"
                        />
                        <span className="absolute right-4 top-3.5 text-slate-400 text-sm">sqft</span>
                    </div>
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* Amenities */}
            <div className="space-y-4">
                <label className="text-sm font-medium text-slate-700">Amenities</label>

                <div className="flex flex-wrap gap-3">
                    {COMMON_AMENITIES.map(amenity => (
                        <button
                            key={amenity}
                            onClick={() => toggleAmenity(amenity)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${(data.amenities || []).includes(amenity)
                                ? 'bg-teal-50 text-teal-700 border-teal-200 border'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            {amenity}
                        </button>
                    ))}
                </div>

                {/* Custom Amenity Input */}
                <div className="flex gap-2 max-w-sm mt-4">
                    <input
                        type="text"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCustomAmenity()}
                        placeholder="Add other amenity..."
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none"
                    />
                    <button
                        onClick={handleAddCustomAmenity}
                        className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                {/* Display selected custom amenities */}
                <div className="flex flex-wrap gap-2 mt-2">
                    {data.amenities?.filter(a => !COMMON_AMENITIES.includes(a)).map(amenity => (
                        <span key={amenity} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100">
                            {amenity}
                            <button onClick={() => toggleAmenity(amenity)} className="ml-2 hover:text-teal-900">
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}
