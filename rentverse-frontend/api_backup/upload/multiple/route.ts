import { NextRequest } from 'next/server'
import { forwardRequest } from '@/utils/apiForwarder'

export async function POST(request: NextRequest) {
  try {
    console.log('[Upload API] Received upload request')
    
    // Get the FormData from the request
    const formData = await request.formData()
    
    console.log('[Upload API] FormData entries:', Array.from(formData.entries()).map(([key, value]) => 
      `${key}: ${value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value}`
    ))

    // Forward the request to the backend
    const response = await forwardRequest('/api/upload/multiple', {
      method: 'POST',
      body: formData,
      // Headers will be set automatically by forwardRequest for FormData
    })

    console.log('[Upload API] Backend response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Upload API] Backend error:', errorText)
      return new Response(
        JSON.stringify({
          success: false,
          message: `Upload failed: ${response.status} ${response.statusText}`,
          error: errorText
        }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Return the successful response from backend
    const result = await response.json()
    console.log('[Upload API] Upload successful:', result)
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[Upload API] Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}