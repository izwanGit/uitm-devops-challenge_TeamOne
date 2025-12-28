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

    if (!markers || markers.length === 0) return

    markers.forEach((markerData, index) => {
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
  }, [markers, clearMarkers])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    try {
      // Use the SDK's built-in style or a full URL
      const mapStyle = style.includes('http') || style.includes(':')
        ? style
        : `https://api.maptiler.com/maps/${style}/style.json?key=${getMapTilerApiKey()}`

      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [center.lng, center.lat],
        zoom: zoom,
        interactive: interactive,
      })

      // Handle map load event
      map.current.on('load', () => {
        isMapLoaded.current = true

        if (map.current && onMapLoad) {
          onMapLoad(map.current)
        }

        // Add initial markers
        if (map.current) {
          addMarkers(map.current)
        }
      })

      // Handle map click event
      map.current.on('click', (e) => {
        if (onMapClick) {
          onMapClick({
            lng: e.lngLat.lng,
            lat: e.lngLat.lat,
          })
        }
      })

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // ONLY run on mount/unmount

  // Separate effect for style updates
  useEffect(() => {
    if (map.current && isMapLoaded.current) {
      const mapStyle = style.includes('http') || style.includes(':')
        ? style
        : `https://api.maptiler.com/maps/${style}/style.json?key=${getMapTilerApiKey()}`
      map.current.setStyle(mapStyle)
    }
  }, [style])

  // Update map center and zoom when props change
  useEffect(() => {
    if (map.current && isMapLoaded.current) {
      // Check if current center is significantly different to avoid unnecessary jumps
      const currentCenter = map.current.getCenter()
      const diffLng = Math.abs(currentCenter.lng - center.lng)
      const diffLat = Math.abs(currentCenter.lat - center.lat)
      const diffZoom = Math.abs(map.current.getZoom() - zoom)

      if (diffLng > 0.0001 || diffLat > 0.0001 || diffZoom > 0.1) {
        map.current.flyTo({
          center: [center.lng, center.lat],
          zoom: zoom,
          duration: 1000,
        })
      }
    }
  }, [center.lng, center.lat, zoom])

  // Update markers when markers prop changes
  useEffect(() => {
    if (map.current && isMapLoaded.current) {
      addMarkers(map.current)
    }
  }, [markers, addMarkers])

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
