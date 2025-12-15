'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowDownWideNarrow } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Scrollbar, Mousewheel } from 'swiper/modules'
import usePropertiesStore from '@/stores/propertiesStore'
import MapViewer from '@/components/MapViewer'
import Pagination from '@/components/Pagination'
import CardProperty from '@/components/CardProperty'
import ContentWrapper from '@/components/ContentWrapper'
import ButtonSecondary from '@/components/ButtonSecondary'
import ButtonMapViewSwitcher from '@/components/ButtonMapViewSwitcher'

function ResultsPage() {
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

    loadProperties({ city, type, page, limit })
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

  // Map configuration - use real data from backend if available (memoized)
  const mapCenter = useMemo(() => {
    console.log('Computing map center with mapData:', mapData)

    if (mapData?.latMean && mapData?.longMean) {
      console.log('Using API map center:', { lng: mapData.longMean, lat: mapData.latMean })
      return { lng: mapData.longMean, lat: mapData.latMean }
    }

    console.log('Using fallback map center')
    return { lng: -74.006, lat: 40.7128 } // Fallback to NYC center
  }, [mapData])

  const mapZoom = mapData?.depth || 12

  console.log('Map center result:', mapCenter)
  console.log('Map zoom:', mapZoom)

  // Create markers from properties data (memoized to prevent re-rendering)
  const propertyMarkers = useMemo(() => {
    return properties.map((property, index) => {
      let lng, lat

      if (property.longitude && property.latitude) {
        // Use real coordinates if available
        lng = property.longitude
        lat = property.latitude
      } else {
        // Fallback: distribute properties in a grid pattern around map center
        const gridSize = Math.ceil(Math.sqrt(properties.length))
        const gridX = index % gridSize
        const gridY = Math.floor(index / gridSize)
        const offsetRange = 0.02 // Roughly 2km range

        lng = mapCenter.lng + (gridX - gridSize / 2) * (offsetRange / gridSize) + (Math.random() - 0.5) * 0.005
        lat = mapCenter.lat + (gridY - gridSize / 2) * (offsetRange / gridSize) + (Math.random() - 0.5) * 0.005
      }

      return {
        lng,
        lat,
        popup: `
          <div class="p-3 max-w-xs">
            <h3 class="font-semibold text-sm mb-1">${property.title}</h3>
            <p class="text-xs text-gray-600 mb-1">${property.address}</p>
            <p class="text-xs text-gray-600 mb-2">${property.city}, ${property.state}</p>
            <div class="flex justify-between items-center">
              <p class="text-sm font-bold text-teal-600">$${property.price}/month</p>
              <p class="text-xs text-gray-500">${property.bedrooms}br ${property.bathrooms}ba</p>
            </div>
            <p class="text-xs text-gray-500 mt-1">${property.areaSqm || property.area || 0} sq ft</p>
            <div class="mt-2">
              <a href="/property/${property.id}" class="text-xs text-teal-600 hover:text-teal-700 font-medium">
                View Details →
              </a>
            </div>
          </div>
        `,
        color: '#0D9488', // Teal color to match the theme
        propertyId: property.id, // Add property ID for potential click handling
      }
    })
  }, [properties, mapCenter])

  // Debug logging
  console.log('Properties count:', properties.length)
  console.log('Map center:', mapCenter)
  console.log('Property markers:', propertyMarkers)

  return (
    <ContentWrapper searchBoxType="compact">
      <div className="w-full py-4 px-2 sm:px-4 md:px-8 lg:px-12 flex justify-between items-start gap-x-5">
        {/* Property Card Results */}
        <div className={`w-full md:w-1/2 ${isMapView ? 'hidden' : 'block'}`}>
          {/* Header Result */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex flex-col gap-2">
              <h3 className="font-serif text-xl text-teal-900">
                {pagination.total} Properties Found (Page {pagination.page} of {pagination.pages})
              </h3>
              <p className="text-base text-teal-800">
                Showing 1 – {properties.length}
              </p>
            </div>
            <ButtonSecondary
              iconLeft={<ArrowDownWideNarrow size={16} />}
              label="Sort"
            />
          </div>

          {/* Vertical Scrollable Results */}
          <div className="h-[60vh] overflow-hidden">
            {/* Mobile: 1 column */}
            <div className="block sm:hidden h-full">
              <Swiper
                direction="vertical"
                slidesPerView="auto"
                spaceBetween={16}
                scrollbar={{
                  hide: false,
                  draggable: true,
                }}
                mousewheel={{
                  enabled: true,
                  forceToAxis: true,
                }}
                modules={[Scrollbar, Mousewheel]}
                className="h-full"
                style={{ height: '100%' }}
              >
                {properties.map((property) => (
                  <SwiperSlide key={property.id} className="!h-auto">
                    <div className="pr-4 mb-4">
                      <CardProperty property={property} />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Small screens: 2 columns */}
            <div className="hidden sm:block md:hidden h-full">
              <Swiper
                direction="vertical"
                slidesPerView="auto"
                spaceBetween={16}
                scrollbar={{
                  hide: false,
                  draggable: true,
                }}
                mousewheel={{
                  enabled: true,
                  forceToAxis: true,
                }}
                modules={[Scrollbar, Mousewheel]}
                className="h-full"
                style={{ height: '100%' }}
              >
                {getGroupedProperties(2).map((group, index) => (
                  <SwiperSlide key={index} className="!h-auto">
                    <div className="grid grid-cols-2 gap-4 pr-4 mb-4">
                      {group.map((property) => (
                        <CardProperty key={property.id} property={property} />
                      ))}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Medium screens (tablets): 1 column */}
            <div className="hidden md:block lg:hidden h-full">
              <Swiper
                direction="vertical"
                slidesPerView="auto"
                spaceBetween={16}
                scrollbar={{
                  hide: false,
                  draggable: true,
                }}
                mousewheel={{
                  enabled: true,
                  forceToAxis: true,
                }}
                modules={[Scrollbar, Mousewheel]}
                className="h-full"
                style={{ height: '100%' }}
              >
                {properties.map((property) => (
                  <SwiperSlide key={property.id} className="!h-auto">
                    <div className="pr-4 mb-4">
                      <CardProperty property={property} />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Large screens: 2 columns */}
            <div className="hidden lg:block h-full">
              <Swiper
                direction="vertical"
                slidesPerView="auto"
                spaceBetween={16}
                scrollbar={{
                  hide: false,
                  draggable: true,
                }}
                mousewheel={{
                  enabled: true,
                  forceToAxis: true,
                }}
                modules={[Scrollbar, Mousewheel]}
                className="h-full"
                style={{ height: '100%' }}
              >
                {getGroupedProperties(2).map((group, index) => (
                  <SwiperSlide key={index} className="!h-auto">
                    <div className="grid grid-cols-2 gap-4 pr-4 mb-4">
                      {group.map((property) => (
                        <CardProperty key={property.id} property={property} />
                      ))}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* Pagination - Outside Swiper for proper click handling */}
          {pagination.pages > 1 && (
            <div className="py-4 flex justify-center items-center">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        {/* Map Results */}
        <div className={`w-full md:w-1/2 ${isMapView ? 'block' : 'hidden md:block'}`}>
          {isLoading ? (
            <div className="w-full h-[80vh] bg-gray-100 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading properties...</p>
              </div>
            </div>
          ) : properties.length === 0 ? (
            <div className="w-full h-[80vh] bg-gray-100 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <p className="text-gray-600 text-lg mb-2">No properties found</p>
                <p className="text-gray-500">Try adjusting your search criteria</p>
              </div>
            </div>
          ) : (
            // Only render MapViewer if we're not loading and have map data
            !isLoading ? (
              <MapViewer
                center={mapCenter}
                zoom={mapZoom}
                markers={propertyMarkers}
                onMapClick={(coords) => console.log('Clicked:', coords)}
                className="shadow-lg"
                height="80vh"
              />
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                <div className="text-center">
                  <p className="text-gray-600 text-lg mb-2">Loading map...</p>
                  <p className="text-gray-500">Fetching location data</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Map/List View Switcher Button - Mobile/Tablet Only */}
      <div className="md:hidden">
        <ButtonMapViewSwitcher
          onClick={toggleView}
          isMapView={isMapView}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
        />
      </div>
    </ContentWrapper>
  )
}

export default ResultsPage
