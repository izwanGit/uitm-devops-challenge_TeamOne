import { NextRequest } from 'next/server'
import { apiForwarder } from '@/utils/apiForwarder'

export async function GET(request: NextRequest) {
    return apiForwarder(request, '/api/invoices')
}
