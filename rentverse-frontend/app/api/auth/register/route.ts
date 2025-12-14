import { NextRequest, NextResponse } from 'next/server'
import { forwardRequest } from '@/utils/apiForwarder'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { email, password, firstName, lastName, dateOfBirth, phone } = body

    if (!email || !password || !firstName || !lastName || !dateOfBirth || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: 'All fields are required: email, password, firstName, lastName, dateOfBirth, phone'
        },
        { status: 400 }
      )
    }

    // Forward the request to the backend
    console.log('Registering with backend at:', process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL);

    // Forward the request to the backend
    const response = await forwardRequest('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        dateOfBirth,
        phone
      }),
    })

    const data = await response.json()

    // Return the response from backend
    return NextResponse.json(data, { status: response.status })

  } catch (error) {
    console.error('Registration API route error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    )
  }
}