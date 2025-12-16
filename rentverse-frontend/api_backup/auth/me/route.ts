import { NextRequest, NextResponse } from 'next/server'
import { forwardRequest, getAuthHeader, createErrorResponse } from '@/utils/apiForwarder'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      )
    }

    try {
      // Forward to backend's /me endpoint to get current user profile
      const response = await forwardRequest('/api/auth/me', {
        method: 'GET',
        headers: {
          ...getAuthHeader(request),
          'Content-Type': 'application/json',
        },
      })

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
      } else {
        // If backend doesn't return JSON, create a generic error response
        return NextResponse.json(
          { success: false, message: 'Invalid response from backend' },
          { status: 502 }
        )
      }
    } catch (backendError) {
      console.error('Backend error during user profile fetch:', backendError)
      return NextResponse.json(
        createErrorResponse('Backend service unavailable', backendError as Error, 503),
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('Error during user profile fetch:', error)
    return NextResponse.json(
      createErrorResponse('Failed to fetch user profile', error as Error),
      { status: 500 }
    )
  }
}