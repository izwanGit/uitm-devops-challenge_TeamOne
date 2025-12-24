// API forwarding utility for Next.js API routes

// Server-side: use full URL to backend
// Client-side: use relative URL to go through Next.js rewrites
import { getApiBaseUrl as getConfigBaseUrl } from './apiConfig'

// Server-side: use full URL to backend
// Client-side: For mobile/static builds, use full URL. For web dev, use rewrites.
const getApiBaseUrl = () => {
  // Use the unified logic from apiConfig
  return getConfigBaseUrl()
}

export interface ForwardRequestOptions extends RequestInit {
  timeout?: number
  retries?: number
}

/**
 * Forward requests to backend API with error handling and retry logic
 */
export async function forwardRequest(
  endpoint: string,
  options: ForwardRequestOptions = {},
): Promise<Response> {
  const { timeout = 30000, retries = 0, ...fetchOptions } = options

  // Get base URL (empty string for browser, full URL for server)
  const apiBaseUrl = getApiBaseUrl()
  const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = baseUrl ? `${baseUrl}${cleanEndpoint}` : cleanEndpoint

  // Debug log for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${options.method || 'GET'} ${url}`)
  }

  // Don't set Content-Type for FormData - let the browser set it with boundary
  const defaultHeaders: Record<string, string> = {}
  if (!(fetchOptions.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json'
  }

  const requestOptions: RequestInit = {
    ...fetchOptions,
    headers: {
      ...defaultHeaders,
      ...fetchOptions.headers,
    },
  }

  // Add timeout using AbortController
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  requestOptions.signal = controller.signal

  let lastError: Error = new Error('Unknown error')
  let attempt = 0

  while (attempt <= retries) {
    try {
      console.log(`[API] Attempt ${attempt + 1}/${retries + 1} to ${url}`)
      const response = await fetch(url, requestOptions)
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      console.error(`[API] Attempt ${attempt + 1} failed:`, lastError.message)
      attempt++

      // Don't retry on timeout or if we've exhausted retries
      if (attempt > retries || error instanceof DOMException && error.name === 'AbortError') {
        break
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
    }
  }

  clearTimeout(timeoutId)
  const finalError = new Error(`Request failed after ${retries + 1} attempts to ${url}: ${lastError?.message || 'Unknown error'}`)
  console.error('[API] Final error:', finalError.message)
  throw finalError
}

/**
 * Extract authorization header from Next.js request
 */
export function getAuthHeader(request: Request): Record<string, string> {
  const authHeader = request.headers.get('Authorization')
  return authHeader ? { Authorization: authHeader } : {}
}

/**
 * Create error response with consistent format
 */
export function createErrorResponse(
  message: string,
  error?: Error,
  status: number = 500,
) {
  return {
    success: false,
    message,
    error: error?.message || 'Unknown error',
    timestamp: new Date().toISOString(),
    status,
  }
}

/**
 * Create cache headers based on content type and TTL
 */
export function createCacheHeaders(
  maxAge: number,
  contentType?: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    'Cache-Control': `public, max-age=${maxAge}`,
  }

  if (contentType) {
    headers['Content-Type'] = contentType
  }

  return headers
}

/**
 * Properties API request forwarder
 */
export async function propertiesApiForwarder(
  request: Request,
  endpoint: string,
): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint

    // For POST/PUT/PATCH requests, include the body
    const body = ['POST', 'PUT', 'PATCH'].includes(request.method)
      ? await request.text()
      : undefined

    const response = await forwardRequest(fullEndpoint, {
      method: request.method,
      headers: {
        ...getAuthHeader(request),
        ...(request.headers.get('Content-Type') && {
          'Content-Type': request.headers.get('Content-Type')!
        })
      },
      body,
    })

    // Handle non-JSON responses
    const contentType = response.headers.get('Content-Type') || ''
    if (!contentType.includes('application/json')) {
      return new Response(await response.text(), {
        status: response.status,
        headers: response.headers,
      })
    }

    // Return the JSON response
    const data = await response.json()
    return Response.json(data, {
      status: response.status,
    })

  } catch (error) {
    console.error('Properties API forwarding error:', error)



    return Response.json(
      createErrorResponse(
        'Failed to fetch properties',
        error instanceof Error ? error : undefined,
        500
      ),
      { status: 500 }
    )
  }
}

/**
 * Generic API Forwarder for Next.js API routes.
 * Forwards requests to the backend API preserving auth headers.
 */
export async function apiForwarder(
  req: Request,
  backendPath: string
): Promise<Response> {
  const BACKEND_URL = getConfigBaseUrl()

  try {
    // Get body if present
    let body: string | undefined
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      try {
        body = await req.text()
      } catch {
        // No body
      }
    }

    // Forward authorization header
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const response = await fetch(`${BACKEND_URL}${backendPath}`, {
      method: req.method,
      headers,
      body: body || undefined,
    })

    const data = await response.json()

    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error(`API Forwarder Error [${backendPath}]:`, error)
    return Response.json(
      { success: false, message: 'Backend connection failed' },
      { status: 502 }
    )
  }
}
