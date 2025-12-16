'use client'

import { usePropertyListingStore } from '@/stores/propertyListingStore'

export default function EditLocation() {
    const { data, updateData } = usePropertyListingStore()

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-1">Location</h2>
                <p className="text-sm text-slate-500">Address and map position.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Street Address */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-slate-700">Street Address</label>
                    <input
                        type="text"
                        value={data.address}
                        onChange={(e) => updateData({ address: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                        placeholder="e.g. 123 Jalan Ampang"
                    />
                </div>

                {/* City */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">City</label>
                    <input
                        type="text"
                        value={data.city}
                        onChange={(e) => updateData({ city: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                    />
                </div>

                {/* State */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">State</label>
                    <input
                        type="text"
                        value={data.state}
                        onChange={(e) => updateData({ state: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                    />
                </div>

                {/* Zip Code */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Zip / Postal Code</label>
                    <input
                        type="text"
                        value={data.zipCode}
                        onChange={(e) => updateData({ zipCode: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                    />
                </div>

                {/* District */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">District (Optional)</label>
                    <input
                        type="text"
                        value={data.district}
                        onChange={(e) => updateData({ district: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-500">
                <p>Map coordinates are currently managed automatically based on address. Advanced map editing coming soon.</p>
                {(data.latitude && data.longitude) && (
                    <p className="mt-2 text-xs font-mono">Current: {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}</p>
                )}
            </div>
        </div>
    )
}
