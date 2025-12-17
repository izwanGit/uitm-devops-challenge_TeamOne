'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Home, Building2, Warehouse, Hotel, MapPin, TrendingUp } from 'lucide-react'

// Define categories with better contrast and "premium" feel
const categories = [
    { id: 'apartment', label: 'Apartment', icon: Building2, color: 'bg-teal-50 text-teal-600 border border-teal-100' },
    { id: 'house', label: 'House', icon: Home, color: 'bg-blue-50 text-blue-600 border border-blue-100' },
    { id: 'condo', label: 'Condo', icon: Hotel, color: 'bg-purple-50 text-purple-600 border border-purple-100' },
    { id: 'room', label: 'Room', icon: Warehouse, color: 'bg-orange-50 text-orange-600 border border-orange-100' },
]

const quickActions = [
    { id: 'nearby', label: 'Nearby', icon: MapPin, color: 'from-rose-500 to-pink-600 text-white' },
    { id: 'trending', label: 'Trending', icon: TrendingUp, color: 'from-amber-400 to-orange-500 text-white' },
]

export default function QuickCategories() {
    const router = useRouter()

    const handleCategoryClick = (type: string) => {
        router.push(`/?type=${type}`)
    }

    return (
        <div className="md:hidden w-full px-4 mb-8">
            <h3 className="font-serif text-lg text-white drop-shadow-md mb-4 px-1 text-left">Browse by Category</h3>

            {/* Main Categories Grid */}
            <div className="grid grid-cols-4 gap-3">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className="flex flex-col items-center space-y-2 group"
                    >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${cat.color} shadow-lg group-active:scale-95 transition-all duration-200`}>
                            <cat.icon size={26} strokeWidth={1.5} />
                        </div>
                        <span className="text-xs font-semibold text-white drop-shadow-md tracking-wide">{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Quick Actions - Stretched Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
                {quickActions.map((action) => (
                    <button
                        key={action.id}
                        onClick={() => router.push(action.id === 'nearby' ? '/?sort=distance' : '/?sort=popular')}
                        className={`relative overflow-hidden flex items-center justify-center p-4 rounded-xl bg-gradient-to-br ${action.color} shadow-md active:scale-95 transition-transform duration-200`}
                    >
                        <div className="flex items-center space-x-2 relative z-10">
                            <action.icon size={18} strokeWidth={2.5} />
                            <span className="font-bold text-sm tracking-wide">{action.label}</span>
                        </div>

                        {/* Decorative background circle */}
                        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white opacity-20 rounded-full blur-xl"></div>
                    </button>
                ))}
            </div>
        </div>
    )
}
