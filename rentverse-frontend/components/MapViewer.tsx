'use client'

import React, { useRef, useEffect, useCallback, memo } from 'react'
import * as maptilersdk from '@maptiler/sdk'

import { getMapTilerApiKey } from '@/utils/apiConfig'

interface MapViewerProps {
  center?: {
    lng: number
    lat: number
  }
  zoom?: number
  style?: string
  className?: string
  height?: string
  width?: string
  markers?: Array<{
    lng: number
    lat: number
    popup?: string
    color?: string
  }>
  onMapLoad?: (map: maptilersdk.Map) => void
  onMapClick?: (coordinates: { lng: number; lat: number }) => void
  interactive?: boolean
}

const MapViewer = memo(function MapViewer({
  center = { lng: 139.753, lat: 35.6844 }, // Default to Tokyo
  zoom = 14,
  style = 'streets-v2',
  className = '',
  height = '100%',
  width = '100%',
  markers = [],
  onMapLoad,
  onMapClick,
  interactive = true,
}: MapViewerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maptilersdk.Map | null>(null)
  const markersRef = useRef<maptilersdk.Marker[]>([])
  const isMapLoaded = useRef(false)

  // Initialize API key once
  useEffect(() => {
    const apiKey = getMapTilerApiKey()
    console.log('[MapViewer] Initializing with API key prefix:', apiKey ? apiKey.substring(0, 5) + '...' : 'NONE')
    if (!maptilersdk.config.apiKey) {
      maptilersdk.config.apiKey = apiKey
    }
  }, [])

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
  }, [])

  // Add markers to map
  const addMarkers = useCallback((mapInstance: maptilersdk.Map) => {
    clearMarkers()

    console.log('Adding markers to map:', markers.length)

    markers.forEach((markerData, index) => {
      console.log(`Creating marker ${index}:`, markerData)

      const marker = new maptilersdk.Marker({
        color: markerData.color || '#3B82F6',
      })
        .setLngLat([markerData.lng, markerData.lat])
        .addTo(mapInstance)

      if (markerData.popup) {
        const popup = new maptilersdk.Popup({ offset: 25 })
          .setHTML(markerData.popup)
        marker.setPopup(popup)
      }

      markersRef.current.push(marker)
    })

    console.log('Total markers added:', markersRef.current.length)
  }, [markers, clearMarkers])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    try {
      console.log('Initializing map with center:', [center.lng, center.lat])

      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: style,
        center: [center.lng, center.lat],
        zoom: zoom,
        interactive: interactive,
      })

      // Handle map load event
      map.current.on('load', () => {
        console.log('Map loaded, setting isMapLoaded to true')
        isMapLoaded.current = true

        if (map.current && onMapLoad) {
          onMapLoad(map.current)
        }

        // Add markers once map is loaded
        if (markers.length > 0 && map.current) {
          console.log('Map loaded, adding initial markers')
          addMarkers(map.current)
        }
      })

      // Handle map click event
      if (onMapClick) {
        map.current.on('click', (e) => {
          onMapClick({
            lng: e.lngLat.lng,
            lat: e.lngLat.lat,
          })
        })
      }
    } catch (error) {
      console.error('Error initializing map:', error)
    }

    return () => {
      clearMarkers()
      if (map.current) {
        map.current.remove()
        map.current = null
        isMapLoaded.current = false
      }
    }
  }, [style, center.lng, center.lat, zoom, interactive, onMapLoad, onMapClick, clearMarkers, markers, addMarkers])

  // Update map center and zoom when props change
  useEffect(() => {
    if (map.current && isMapLoaded.current) {
      console.log('Updating map center to:', [center.lng, center.lat])

      try {
        map.current.flyTo({
          center: [center.lng, center.lat],
          zoom: zoom,
          duration: 1000,
        })
      } catch (error) {
        console.error('Error updating map center:', error)
      }
    } else {
      console.log('Skipping map center update - map not ready:', {
        mapExists: !!map.current,
        mapLoaded: isMapLoaded.current
      })
    }
  }, [center.lng, center.lat, zoom])

  // Update markers when markers prop changes
  useEffect(() => {
    if (map.current && isMapLoaded.current) {
      console.log('Markers changed, updating map markers')
      addMarkers(map.current)
    } else {
      console.log('Map not ready for markers yet:', {
        mapExists: !!map.current,
        mapLoaded: isMapLoaded.current
      })
    }
  }, [markers, addMarkers])

  // Update map style when style prop changes
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(style)
    }
  }, [style])

  return (
    <div
      className={`map-wrap ${className} rounded-3xl overflow-hidden`}
      style={{ height, width }}
    >
      <div
        ref={mapContainer}
        className="map w-full h-full rounded-3xl overflow-hidden"
        style={{
          height: '100%',
          width: '100%',
          boxShadow: 'none',
          touchAction: 'none', // Enable map panning on touch devices
        }}
      />
    </div>
  )
})

export default MapViewer
