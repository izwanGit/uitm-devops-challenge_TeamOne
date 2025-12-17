// API Configuration utility
// Centralized API base URL management

/**
 * Get the API base URL from environment variables
 * Falls back to production URL if not set
 */
import { Capacitor } from '@capacitor/core'

/**
 * Get the API base URL from environment variables
 * Falls back to production URL if not set
 */
export const getApiBaseUrl = (): string => {
  let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://rentverse-be.jokoyuliyanto.my.id'

  // Platform-specific logic to handle localhost vs emulator IP
  if (baseUrl.includes('10.0.2.2')) {
    const isServer = typeof window === 'undefined'
    const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform()

    // If we are on the server (Mac) OR on the browser (Mac), we must use localhost
    // We only keep 10.0.2.2 if we are actually natively on Android
    if (isServer || !isNative) {
      baseUrl = baseUrl.replace('10.0.2.2', 'localhost')
    }
  }

  // Remove trailing slash if present
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

/**
 * Get the AI service base URL from environment variables
 * Falls back to production URL if not set
 */
export const getAiServiceBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'https://rentverse-ai.jokoyuliyanto.my.id'

  // Remove trailing slash if present
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

/**
 * Get the Cloudinary base URL from environment variables
 * Falls back to default Cloudinary URL if not set
 */
export const getCloudinaryBaseUrl = (): string => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dqhuvu22u'
  const baseUrl = process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL || 'https://api.cloudinary.com'

  // Remove trailing slash if present
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  return `${cleanBaseUrl}/v1_1/${cloudName}`
}

/**
 * Get the MapTiler base URL from environment variables
 * Falls back to default MapTiler URL if not set
 */
export const getMapTilerBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_MAPTILER_BASE_URL || 'https://api.maptiler.com'

  // Remove trailing slash if present
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

/**
 * Get the full API URL with /api path
 */
export const getApiUrl = (): string => {
  return `${getApiBaseUrl()}/api`
}

/**
 * Get the full AI service API URL with /api/v1 path
 */
export const getAiServiceApiUrl = (): string => {
  return `${getAiServiceBaseUrl()}/api/v1`
}

/**
 * Create a full API endpoint URL
 * @param endpoint - The API endpoint (e.g., 'properties', 'bookings/123')
 */
export const createApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${getApiUrl()}/${cleanEndpoint}`
}

/**
 * Create a full AI service API endpoint URL
 * @param endpoint - The AI API endpoint (e.g., 'classify/price')
 */
export const createAiServiceApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${getAiServiceApiUrl()}/${cleanEndpoint}`
}

/**
 * Create a full Cloudinary upload URL
 * @param uploadType - The upload type (e.g., 'image', 'video')
 */
export const createCloudinaryUploadUrl = (uploadType: string = 'image'): string => {
  return `${getCloudinaryBaseUrl()}/${uploadType}/upload`
}

/**
 * Create a full MapTiler API URL
 * @param endpoint - The MapTiler endpoint (e.g., 'geocoding/lng,lat.json')
 */
export const createMapTilerApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${getMapTilerBaseUrl()}/${cleanEndpoint}`
}

/**
 * Create a Cloudinary asset URL for images
 * @param publicId - The public ID of the image
 * @param transformations - Optional transformations (e.g., 'f_webp,w_400')
 */
export const createCloudinaryAssetUrl = (publicId: string, transformations?: string): string => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dqhuvu22u'
  const baseUrl = process.env.NEXT_PUBLIC_CLOUDINARY_ASSET_BASE_URL || 'https://res.cloudinary.com'
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl

  if (transformations) {
    return `${cleanBaseUrl}/${cloudName}/image/upload/${transformations}/${publicId}`
  }
  return `${cleanBaseUrl}/${cloudName}/image/upload/${publicId}`
}

// Export constants for convenience
export const API_BASE_URL = getApiBaseUrl()
export const API_URL = getApiUrl()
export const AI_SERVICE_BASE_URL = getAiServiceBaseUrl()
export const AI_SERVICE_API_URL = getAiServiceApiUrl()
export const CLOUDINARY_BASE_URL = getCloudinaryBaseUrl()
export const MAPTILER_BASE_URL = getMapTilerBaseUrl()

// Export additional configuration getters for dynamic usage
export const CONFIG = {
  api: {
    baseUrl: getApiBaseUrl,
    url: getApiUrl,
    createUrl: createApiUrl,
  },
  ai: {
    baseUrl: getAiServiceBaseUrl,
    apiUrl: getAiServiceApiUrl,
    createUrl: createAiServiceApiUrl,
  },
  cloudinary: {
    baseUrl: getCloudinaryBaseUrl,
    createUploadUrl: createCloudinaryUploadUrl,
    createAssetUrl: createCloudinaryAssetUrl,
  },
  maptiler: {
    baseUrl: getMapTilerBaseUrl,
    createUrl: createMapTilerApiUrl,
  },
}