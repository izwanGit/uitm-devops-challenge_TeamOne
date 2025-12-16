import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function POST(req: NextRequest) {
    try {
        let body: string | undefined
        try {
            body = await req.text()
        } catch {
            // No body
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        }
        const authHeader = req.headers.get('Authorization')
        if (authHeader) {
            headers['Authorization'] = authHeader
        }

        const response = await fetch(`${BACKEND_URL}/api/auth/mfa/verify`, {
            method: 'POST',
            headers,
            body: body || undefined,
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('MFA Verify API Error:', error)
        return NextResponse.json(
            { success: false, message: 'Backend connection failed' },
            { status: 502 }
        )
    }
}
