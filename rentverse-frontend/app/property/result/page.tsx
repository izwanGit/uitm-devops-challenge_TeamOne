'use client'

import { useState, useEffect, useMemo, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowDownWideNarrow, MapPin } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Scrollbar, Mousewheel } from 'swiper/modules'
import usePropertiesStore from '@/stores/propertiesStore'
import MapViewer from '@/components/MapViewer'
import Pagination from '@/components/Pagination'
import CardProperty from '@/components/CardProperty'
import ContentWrapper from '@/components/ContentWrapper'
import ButtonSecondary from '@/components/ButtonSecondary'
import ButtonMapViewSwitcher from '@/components/ButtonMapViewSwitcher'
import { getCoordinatesForCity } from '@/utils/cityCoordinates'

function ResultsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { properties, isLoading, loadProperties, mapData, pagination } = usePropertiesStore()
  const [isMapView, setIsMapView] = useState(false)

  // Parse search params on mount and when they change
  useEffect(() => {
    const city = searchParams.get('city') || undefined
    const type = searchParams.get('type') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined

    loadProperties({ city, type, page, limit, lat, lng })
  }, [loadProperties, searchParams])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/property/result?${params.toString()}`)
  }

  const toggleView = () => {
    setIsMapView(!isMapView)
  }

  // Helper function to group properties based on screen size
  const getGroupedProperties = (itemsPerSlide: number) => {
    const grouped = []
    for (let i = 0; i < properties.length; i += itemsPerSlide) {
      grouped.push(properties.slice(i, i + itemsPerSlide))
    }
    return grouped
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const params = new URLSearchParams(searchParams.toString())
        params.delete('city') // Location search overrides city
        params.set('lat', latitude.toString())
        params.set('lng', longitude.toString())
        router.push(`/property/result?${params.toString()}`)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to get your location')
      }
    )
  }

  // Map configuration - use real data from backend if available (memoized)
  const mapCenter = useMemo(() => {
    // 1. Try search params first (user's selected location)
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')
    if (latParam && lngParam) {
      return { lat: parseFloat(latParam), lng: parseFloat(lngParam) }
    }

    // 2. Try backend returned mean coordinates
    if (mapData?.latMean && mapData?.longMean) {
      return { lng: mapData.longMean, lat: mapData.latMean }
    }

    // 3. Try to get coordinates from the searched city
    const cityParam = searchParams.get('city');
    if (cityParam) {
      const cityCoords = getCoordinatesForCity(cityParam);
      if (cityCoords) return cityCoords;
    }

    // 4. Fallback to default
    return getCoordinatesForCity('DEFAULT');
  }, [mapData, searchParams])

  const mapZoom = mapData?.depth || (searchParams.get('lat') ? 14 : 12)

  // Create markers from properties data (memoized to prevent re-rendering)
  const propertyMarkers = useMemo(() => {
    return properties.map((property, index) => {
      let lng, lat

      if (property.longitude && property.latitude) {
        lng = property.longitude
        lat = property.latitude
      } else {
        const gridSize = Math.ceil(Math.sqrt(properties.length))
        const gridX = index % gridSize
        const gridY = Math.floor(index / gridSize)
        const offsetRange = 0.02
        lng = mapCenter.lng + (gridX - gridSize / 2) * (offsetRange / gridSize) + (Math.random() - 0.5) * 0.005
        lat = mapCenter.lat + (gridY - gridSize / 2) * (offsetRange / gridSize) + (Math.random() - 0.5) * 0.005
      }

      const imageUrl = property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80'

      return {
        lng,
        lat,
        popup: `
          <div class="p-0 min-w-[180px] overflow-hidden rounded-xl bg-white shadow-xl border border-slate-100">
            <div class="h-28 w-full relative">
                <img src="${imageUrl}" alt="${property.title}" class="w-full h-full object-cover" />
                <div class="absolute top-2 right-2 px-2 py-1 bg-white/95 rounded-lg text-[10px] font-bold text-teal-700 shadow-sm border border-teal-100">$${property.price}</div>
            </div>
            <div class="p-3">
                <h3 class="font-bold text-xs mb-0.5 line-clamp-1 text-slate-900">${property.title}</h3>
                <p class="text-[9px] text-slate-500 mb-2 line-clamp-1 italic">${property.city}, ${property.state}</p>
                <div class="flex items-center gap-2 mb-3">
                    <span class="text-[8px] font-semibold px-2 py-0.5 bg-slate-50 text-slate-600 rounded-full border border-slate-100">🛏️ ${property.bedrooms}</span>
                    <span class="text-[8px] font-semibold px-2 py-0.5 bg-slate-50 text-slate-600 rounded-full border border-slate-100">🛁 ${property.bathrooms}</span>
                    <span class="text-[8px] font-semibold px-2 py-0.5 bg-slate-50 text-slate-600 rounded-full border border-slate-100">📐 ${property.areaSqm || property.area}m²</span>
                </div>
                <a href="/property/view?id=${property.id}" class="block text-center w-full py-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white text-[9px] font-bold rounded-lg hover:from-teal-700 hover:to-teal-600 transition-all shadow-md shadow-teal-100">
                    View Property
                </a>
            </div>
          </div>
        `,
        color: '#0D9488',
        propertyId: property.id,
      }
    })
  }, [properties, mapCenter])

  const handleMapClick = useCallback((coords: { lng: number; lat: number }) => {
    console.log('Map Clicked:', coords)
  }, [])

  return (
    <ContentWrapper searchBoxType="compact">
      <div className="w-full py-4 px-2 sm:px-4 md:px-8 lg:px-12 flex flex-col md:flex-row justify-between items-start gap-5">

        {/* Results List */}
        <div className={`w-full md:w-1/2 ${isMapView ? 'hidden' : 'block'}`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col gap-1">
              <h3 className="font-serif text-xl text-teal-900">
                {pagination?.total || 0} Properties Found
              </h3>
              <p className="text-sm text-slate-500">
                Page {pagination?.page || 1} of {pagination?.pages || 1}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ButtonSecondary
                iconLeft={<MapPin size={16} />}
                label="Nearby"
                onClick={handleUseMyLocation}
                className="!py-2 !px-3 text-sm"
              />
              <ButtonSecondary
                iconLeft={<ArrowDownWideNarrow size={16} />}
                label="Sort"
                className="!py-2 !px-3 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {properties.map((property) => (
              <CardProperty key={property.id} property={property} />
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="py-6 flex justify-center">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        {/* Map Section */}
        <div className={`w-full md:w-1/2 ${isMapView ? 'block' : 'hidden md:block'}`}>
          <div className="h-[80vh] sticky top-24">
            {isLoading ? (
              <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-3xl border border-slate-100 shadow-inner">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto mb-3"></div>
                  <p className="text-slate-500 text-sm">Mapping results...</p>
                </div>
              </div>
            ) : properties.length === 0 ? (
              <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-3xl border border-slate-100 shadow-inner">
                <div className="text-center p-8">
                  <div className="bg-slate-200/50 p-4 rounded-full w-fit mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-semibold mb-1">No results in this area</p>
                  <p className="text-slate-400 text-sm">Try zooming out or moving the map</p>
                </div>
              </div>
            ) : (
              <MapViewer
                center={mapCenter}
                zoom={mapZoom}
                markers={propertyMarkers}
                onMapClick={handleMapClick}
                className="shadow-2xl border border-white"
                height="100%"
              />
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <ButtonMapViewSwitcher
          onClick={toggleView}
          isMapView={isMapView}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 shadow-bubble"
        />
      </div>
    </ContentWrapper>
  )
}

function ResultsPageLoading() {
  return (
    <ContentWrapper searchBoxType="compact">
      <div className="w-full py-20 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Fetching real-time data...</p>
        </div>
      </div>
    </ContentWrapper>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsPageLoading />}>
      <ResultsPageContent />
    </Suspense>
  )
}
