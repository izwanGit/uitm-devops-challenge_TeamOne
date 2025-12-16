import { NextRequest, NextResponse } from 'next/server'
import { forwardRequest, getAuthHeader, createErrorResponse } from '@/utils/apiForwarder'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate email in the request body
    if (!body.email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 },
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 },
      )
    }

    try {
      // Forward to backend
      const response = await forwardRequest('/api/auth/check-email', {
        method: 'POST',
        headers: {
          ...getAuthHeader(request),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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
      console.error('Backend error during email check:', backendError)
      return NextResponse.json(
        createErrorResponse('Backend service unavailable', backendError as Error, 503),
        { status: 503 }
      )
    }

  } catch (error) {
    console.error('Error checking email:', error)
    return NextResponse.json(
      createErrorResponse('Failed to check email', error as Error),
      { status: 500 },
    )
  }
}
