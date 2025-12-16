import { NextResponse } from 'next/server'
import { forwardRequest } from '@/utils/apiForwarder'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || 'stats'

    // Get auth token from request headers
    const authHeader = request.headers.get('Authorization')

    const response = await forwardRequest(`/api/users/me/dashboard/${endpoint}`, {
        method: 'GET',
        headers: authHeader ? { 'Authorization': authHeader } : {},
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
}
