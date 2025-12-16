'use client'

import { usePropertyListingStore } from '@/stores/propertyListingStore'
import { getPriceRecommendation, type PriceRecommendationRequest } from '@/utils/priceRecommendationApi'
import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

export default function EditPricing() {
    const { data, updateData } = usePropertyListingStore()
    const [isLoading, setIsLoading] = useState(false)

    const handleGetRecommendation = async () => {
        setIsLoading(true)
        try {
            // Basic recommendation logic adapted from wizard
            const propertyData: PriceRecommendationRequest = {
                area: data.areaSqm || 1200,
                bathrooms: data.bathrooms || 2,
                bedrooms: data.bedrooms || 3,
                furnished: data.amenities?.some(a => a.toLowerCase().includes('furnished')) ? "Yes" : "No",
                location: [data.district, data.city, data.state].filter(Boolean).join(', ') || "Kuala Lumpur",
                property_type: data.propertyType === 'apartment' ? 'Apartment' : 'Condominium'
            }

            const response = await getPriceRecommendation(propertyData)
            updateData({ price: response.predicted_price })
        } catch (error) {
            console.error('Recommendation failed', error)
            alert("Could not get recommendation")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-1">Pricing</h2>
                <p className="text-sm text-slate-500">Set your monthly rental price.</p>
            </div>

            <div className="space-y-6 max-w-md">
                <label className="text-sm font-medium text-slate-700">Monthly Rent (MYR)</label>

                <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">RM</span>
                        <input
                            type="number"
                            value={data.price}
                            onChange={(e) => updateData({ price: parseFloat(e.target.value) || 0 })}
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all text-2xl font-bold text-slate-900"
                        />
                    </div>
                </div>

                <button
                    onClick={handleGetRecommendation}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-teal-50 text-teal-700 rounded-xl hover:bg-teal-100 transition-colors border border-teal-100"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    <span className="font-medium">Get AI Recommendation</span>
                </button>

                <div className="text-xs text-slate-400 leading-relaxed">
                    Rentverse charges a 3% service fee to tenants. You will receive the full amount listed above.
                </div>
            </div>
        </div>
    )
}
