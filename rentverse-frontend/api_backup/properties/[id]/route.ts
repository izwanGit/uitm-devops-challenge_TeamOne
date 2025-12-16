import { NextRequest } from 'next/server'
import { propertiesApiForwarder } from '@/utils/apiForwarder'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: propertyId } = await params
  return propertiesApiForwarder(request, `/api/properties/${propertyId}`)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: propertyId } = await params
  return propertiesApiForwarder(request, `/api/properties/${propertyId}`)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: propertyId } = await params
  return propertiesApiForwarder(request, `/api/properties/${propertyId}`)
}
