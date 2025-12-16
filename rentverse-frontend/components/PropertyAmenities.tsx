import { PropertyAmenity } from '@/types/property'
import { Check, Wifi, Car, Utensils, Monitor, Shield, Award, Droplets, Dumbbell, BookOpen, Leaf, Star } from 'lucide-react'

interface PropertyAmenitiesProps {
    amenities: string[] | PropertyAmenity[]
}

export default function PropertyAmenities({ amenities }: PropertyAmenitiesProps) {
    if (!amenities || amenities.length === 0) return null

    // Normalize amenities to PropertyAmenity object structure
    const normalizedAmenities = amenities.map(a => {
        if (typeof a === 'string') {
            return {
                propertyId: '',
                amenityId: '',
                amenity: { id: '', name: a, category: 'General' }
            }
        }
        return a
    })

    // Group by category
    const grouped = normalizedAmenities.reduce((acc, curr) => {
        const category = curr.amenity.category || 'General'
        if (!acc[category]) acc[category] = []
        acc[category].push(curr.amenity.name)
        return acc
    }, {} as Record<string, string[]>)

    // Helper to get icon for category
    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'technology': return <Wifi size={20} />
            case 'parking': return <Car size={20} />
            case 'transportation': return <Car size={20} />
            case 'commercial': return <Utensils size={20} />
            case 'facilities': return <Monitor size={20} />
            case 'security': return <Shield size={20} />
            case 'special': return <Award size={20} />
            case 'comfort': return <Leaf size={20} />
            case 'recreation': return <Droplets size={20} /> // Pool etc
            case 'health': return <Dumbbell size={20} />
            case 'education': return <BookOpen size={20} />
            case 'environment': return <Leaf size={20} />
            default: return <Check size={20} />
        }
    }

    return (
        <div className="py-8 border-t border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">What this place offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                {Object.entries(grouped).map(([category, items]) => (
                    <div key={category} className="mb-4 break-inside-avoid">
                        <div className="flex items-center gap-2 mb-2 text-slate-800 font-medium">
                            {getCategoryIcon(category)}
                            <span>{category}</span>
                        </div>
                        <ul className="space-y-2 ml-7">
                            {items.map((item, idx) => (
                                <li key={idx} className="text-slate-600 text-sm">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    )
}
