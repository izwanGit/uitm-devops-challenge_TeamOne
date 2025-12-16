import { NextRequest } from 'next/server'
import { propertiesApiForwarder } from '@/utils/apiForwarder'

export async function GET(request: NextRequest) {
  return propertiesApiForwarder(request, '/api/properties')
}

export async function POST(request: NextRequest) {
  return propertiesApiForwarder(request, '/api/properties')
}