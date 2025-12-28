'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import ContentWrapper from '@/components/ContentWrapper'
import BarProperty from '@/components/BarProperty'
import ImageGallery from '@/components/ImageGallery'
import MobileBookingBar from '@/components/MobileBookingBar'
import BoxPropertyPrice from '@/components/BoxPropertyPrice'
import MapViewer from '@/components/MapViewer'
import { PropertiesApiClient } from '@/utils/propertiesApiClient'
import { ShareService } from '@/utils/shareService'
import type { Property } from '@/types/property'
import { getCoordinatesForCity } from '@/utils/cityCoordinates'
import { Star } from 'lucide-react'
import { createApiUrl } from '@/utils/apiConfig'
import PropertyReviews from '@/components/PropertyReviews'
import PropertyAmenities from '@/components/PropertyAmenities'

function DetailPageContent() {
  const searchParams = useSearchParams()
  const propertyId = searchParams.get('id')
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch property data and log view in one call
  useEffect(() => {
    const fetchPropertyAndLogView = async () => {
      if (!propertyId) return

      try {
        setIsLoading(true)
        // Use the view logging API which returns complete property data
        const viewResponse = await PropertiesApiClient.logPropertyView(propertyId)

        if (viewResponse.success && viewResponse.data.property) {
          setProperty(viewResponse.data.property)
        } else {
          setError('Failed to load property details')
        }
      } catch (err) {
        console.error('Error fetching property:', err)
        setError('Failed to load property details')
      } finally {
        setIsLoading(false)
      }
    }

    if (propertyId) {
      fetchPropertyAndLogView()
    } else {
      setIsLoading(false)
      setError('No property ID provided')
    }
  }, [propertyId])

  // Handle favorite change callback
  const handleFavoriteChange = (isFavorited: boolean, favoriteCount: number) => {
    if (property) {
      setProperty(prev => prev ? {
        ...prev,
        isFavorited,
        favoriteCount
      } : null)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <ContentWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-lg text-slate-600">Loading property details...</div>
          </div>
        </div>
      </ContentWrapper>
    )
  }

  // Error state
  if (error || !property) {
    return (
      <ContentWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-lg text-red-600">{error || 'Property not found'}</div>
          </div>
        </div>
      </ContentWrapper>
    )
  }

  // Fallback images if property doesn't have images
  const tempImage: [string, string, string, string, string] = [
    'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758016984/rentverse-rooms/Gemini_Generated_Image_5hdui35hdui35hdu_s34nx6.png',
    'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758211360/rentverse-rooms/Gemini_Generated_Image_ockiwbockiwbocki_vmmlhm.png',
    'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758211360/rentverse-rooms/Gemini_Generated_Image_5ckgfc5ckgfc5ckg_k9uzft.png',
    'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758211360/rentverse-rooms/Gemini_Generated_Image_7seyqi7seyqi7sey_jgzhig.png',
    'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758211362/rentverse-rooms/Gemini_Generated_Image_2wt0y22wt0y22wt0_ocdafo.png',
  ]

  // Use property images if available, fallback to temp images only if none
  const displayImages = property.images && property.images.length > 0
    ? property.images
    : tempImage

  // Format price for display
  const displayPrice = typeof property.price === 'string' ? parseFloat(property.price) : property.price

  // Create share data using ShareService
  const shareData = ShareService.createPropertyShareData({
    title: property.title,
    bedrooms: property.bedrooms,
    city: property.city,
    state: property.state,
    price: property.price
  })

  // Clean Address Logic
  const cleanAddress = (() => {
    const parts: string[] = [];
    const seenLower = new Set<string>();

    const addPart = (part: string | undefined) => {
      if (!part) return;
      const trimmed = part.trim();
      const lower = trimmed.toLowerCase();
      if (trimmed && !seenLower.has(lower)) {
        seenLower.add(lower);
        parts.push(trimmed);
      }
    };

    if (property.address) {
      property.address.split(',').forEach(p => addPart(p.trim()));
    }
    addPart(property.city);
    addPart(property.state);
    const country = property.country === 'MY' ? 'Malaysia' : property.country;
    addPart(country);

    return parts.join(', ');
  })();

  // Map Coordinates Logic
  const mapCenter = (() => {
    if (property.latitude && property.longitude) {
      return { lat: property.latitude, lng: property.longitude };
    }
    // Fallback to City Center
    return getCoordinatesForCity(property.city);
  })();

  return (
    <ContentWrapper hideFooterOnMobile={true}>
      <BarProperty
        title={property.title}
        propertyId={property.id}
        isFavorited={property.isFavorited}
        onFavoriteChange={handleFavoriteChange}
        shareUrl={shareData.url}
        shareText={shareData.text}
      />

      <section className="space-y-6">
        <ImageGallery images={displayImages} />

        {/* Main content area */}
        <div className="mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 pb-24 lg:pb-0">
          {/* Left side - Property details and description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property header */}
            <div className="flex flex-col md:flex-row md:justify-between space-y-4 md:space-y-0">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-teal-600">
                  {property.isAvailable ? 'Available to rent now!' : 'Currently not available'}
                </h1>
                <p className="text-slate-600 text-base md:text-lg">
                  {property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} bedrooms`} • {property.bathrooms} bathroom • {property.areaSqm} sqft
                </p>
              </div>

              {/* Stats section */}
              <div className="flex items-center space-x-6 md:space-x-8">
                {property.totalRatings > 0 ? (
                  <div className="flex items-center space-x-2">
                    <Image
                      src="https://res.cloudinary.com/dqhuvu22u/image/upload/v1758219434/rentverse-base/icon-star_kwohms.png"
                      width={24}
                      height={24}
                      alt="Star icon"
                      className="w-6 h-6 md:w-8 md:h-8"
                    />
                    <div className="text-center">
                      <div className="text-lg md:text-xl font-semibold text-slate-900">
                        {property.averageRating.toFixed(1)}
                      </div>
                      <div className="text-xs md:text-sm text-slate-500">
                        {property.totalRatings} reviews
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 opacity-50">
                    <Image
                      src="https://res.cloudinary.com/dqhuvu22u/image/upload/v1758219434/rentverse-base/icon-star_kwohms.png"
                      width={24}
                      height={24}
                      alt="Star icon"
                      className="w-6 h-6 md:w-8 md:h-8 grayscale"
                    />
                    <div className="text-center">
                      <div className="text-sm font-medium text-slate-500">
                        New
                      </div>
                      <div className="text-xs text-slate-400">
                        No reviews
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <div className="text-lg md:text-xl font-semibold text-slate-900">
                    {property.viewCount > 1000 ? `${Math.floor(property.viewCount / 1000)}K` : property.viewCount}
                  </div>
                  <div className="text-xs md:text-sm text-slate-500">Viewers</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {property.description || 'No description available.'}
              </p>
            </div>

            {/* AMENITIES SECTION */}
            <PropertyAmenities amenities={property.amenities} />

            {/* REVIEWS SECTION */}
            <div className="pt-8 border-t border-slate-200">
              <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-6">
                {property.totalRatings > 0 ? (
                  <span className="flex items-center gap-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={20} />
                    {property.averageRating.toFixed(1)} · {property.totalRatings} reviews
                  </span>
                ) : (
                  'No reviews (yet)'
                )}
              </h2>

              <PropertyReviews propertyId={property.id} />
            </div>
          </div>

          {/* Right side - Booking box (Desktop only) */}
          <div className="hidden lg:block lg:col-span-1">
            <BoxPropertyPrice
              price={displayPrice}
              propertyId={property.id}
              ownerId={property.ownerId}
              isAvailable={property.isAvailable}
              status={property.status}
            />
          </div>
        </div>
      </section>

      {/* Location section */}
      <section className="mx-auto w-full max-w-6xl space-y-6 py-8 px-4 mb-20 lg:mb-0">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl md:text-3xl text-teal-900">Where you will be</h2>
          <p className="text-base md:text-lg text-slate-600">
            {cleanAddress}
          </p>
        </div>

        {/* MapTiler Map */}
        <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-slate-200 relative">
          <MapViewer
            center={mapCenter}
            zoom={12}
            style="streets-v2"
            height="100%"
            width="100%"
            markers={[
              {
                lng: mapCenter.lng,
                lat: mapCenter.lat,
                popup: `
                  <div class="p-0 min-w-[160px] overflow-hidden rounded-xl">
                    <div class="h-24 w-full relative">
                        <img src="${displayImages[0]}" class="w-full h-full object-cover" />
                        <div class="absolute top-2 right-2 px-2 py-1 bg-white/95 rounded-lg text-[10px] font-bold text-teal-700 shadow-sm">$${property.price}</div>
                    </div>
                    <div class="p-3 bg-white">
                        <h3 class="font-bold text-xs text-slate-900 line-clamp-1">${property.title}</h3>
                        <p class="text-[10px] text-slate-500">${property.city}, ${property.state}</p>
                    </div>
                  </div>
                `,
                color: '#0d9488',
              },
            ]}
            className="rounded-2xl"
          />
          {/* Overlay notice if using approximate location */}
          {!property.latitude && (
            <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur px-2 py-1 round text-xs text-slate-500 rounded shadow-sm z-10">
              Approximate Location
            </div>
          )}
        </div>
      </section>

      {/* Mobile Sticky Booking Bar */}
      <div className="lg:hidden">
        <MobileBookingBar
          price={displayPrice}
          propertyId={property.id}
          ownerId={property.ownerId}
          isAvailable={property.isAvailable}
          status={property.status}
        />
      </div>
    </ContentWrapper>
  )
}

export default function DetailPage() {
  return (
    <Suspense fallback={
      <ContentWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">Loading...</div>
        </div>
      </ContentWrapper>
    }>
      <DetailPageContent />
    </Suspense>
  )
}