'use client'

import { usePropertyListingStore } from '@/stores/propertyListingStore'
import { PropertyType } from '@/types/property'

export default function EditBasic() {
    const { data, updateData } = usePropertyListingStore()

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-1">Basic Information</h2>
                <p className="text-sm text-slate-500">The main details of your property listing.</p>
            </div>

            <div className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Property Title</label>
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => updateData({ title: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                        placeholder="e.g. Modern Studio in Downtown KL"
                    />
                    <p className="text-xs text-slate-400 text-right">{data.title.length}/50 characters</p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea
                        value={data.description}
                        onChange={(e) => updateData({ description: e.target.value })}
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all resize-none"
                        placeholder="Describe the key features and amenities..."
                    />
                </div>

                {/* Property Type */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Property Type</label>
                    <select
                        value={data.propertyType}
                        onChange={(e) => updateData({ propertyType: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all bg-white"
                    >
                        <option value="apartment">Apartment</option>
                        <option value="condominium">Condominium</option>
                        <option value="house">House</option>
                        <option value="studio">Studio</option>
                        <option value="villa">Villa</option>
                    </select>
                </div>
            </div>
        </div>
    )
}
