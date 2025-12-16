'use client'

import Link from 'next/link'
import Image from 'next/image'
import clsx from 'clsx'
import { RulerDimensionLine, Star } from 'lucide-react'
import type { Property, PropertyTypeBackend, PropertyType } from '@/types/property'
import IconPropertyType from '@/utils/IconPropertyType'
import { swapCasePropertyType, getLocaledArea, getLocaledRating } from '@/utils/property'
import { useSettingsSafe } from '@/contexts/SettingsContext'

// Convert backend property type to frontend property type
function convertPropertyType(backendType: PropertyTypeBackend): PropertyType {
  const typeMap: Record<PropertyTypeBackend, PropertyType> = {
    'APARTMENT': 'apartment',
    'HOUSE': 'house',
    'STUDIO': 'studio',
    'CONDO': 'condominium',
    'VILLA': 'villa',
    'ROOM': 'apartment', // fallback to apartment for room
  }
  return typeMap[backendType] || 'apartment'
}

function CardProperty({ property }: { readonly property: Property }) {
  const { formatPrice } = useSettingsSafe()

  // Use the first image or a fallback
  const imageUrl = property.images?.[0] || '/placeholder-property.jpg'
  const propertyType = convertPropertyType(property.type)

  return (
    <div className={clsx([
      'w-full max-w-320 bg-white rounded-2xl overflow-hidden shadow-sm',
      'hover:scale-105 hover:shadow-lg transition-all duration-300',
      'dark:bg-slate-800 dark:shadow-slate-900/20'
    ])}>
      <Link href={`/property/${property.id}`} className="block group">
        {/* Image Container */}
        <div className="relative">
          <Image
            src={imageUrl}
            alt={`Image of ${property.title}`}
            width={500}
            height={300}
            className="w-full h-48 object-cover transition-transform duration-300"
          />

          {/* Property Type Badge */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 dark:bg-slate-900/90 dark:text-slate-200">
            <IconPropertyType property_type={propertyType} size={16} />
            <span>{swapCasePropertyType(propertyType)}</span>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-4 sm:p-5">
          {/* Location */}
          <span className="text-xs sm:text-sm text-slate-500 font-medium dark:text-slate-400">{property.city}, {property.state}</span>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mt-1 mb-3 group-hover:text-teal-600 transition-colors dark:text-white">
            {property.title}
          </h3>

          {/* Price and Details Row */}
          <div className="flex items-center justify-between">
            {/* Price - Now using formatPrice from settings */}
            <span className="text-lg sm:text-xl font-bold text-orange-500">{formatPrice(Number(property.price))}/mo</span>

            {/* Area and Rating */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Area */}
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <RulerDimensionLine size={14} className="sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">{getLocaledArea(property.areaSqm || property.area || 0)}</span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <Star size={14} className="fill-yellow-400 text-yellow-400 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">{getLocaledRating(property.averageRating || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default CardProperty