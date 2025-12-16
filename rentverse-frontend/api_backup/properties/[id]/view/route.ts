import { NextRequest, NextResponse } from 'next/server'
import { forwardRequest } from '@/utils/apiForwarder'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params

    if (!propertyId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Property ID is required' 
        },
        { status: 400 }
      )
    }

    // Forward the request to the backend
    const response = await forwardRequest(`/api/properties/${propertyId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Empty body as per the curl example
    })

    const data = await response.json()

    // Return the response from backend
    return NextResponse.json(data, { status: response.status })

  } catch (error) {
    console.error('Property view logging API route error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}