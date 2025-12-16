import type { Property, PropertiesResponse } from '@/types/property'

// Normalize image field so Next/Image always receives a single valid URL
export function normalizeImages(images: unknown): string[] {
  if (Array.isArray(images)) {
    return images
      .map((img) => (typeof img === 'string' ? img.trim() : String(img)))
      .filter(Boolean)
  }

  if (typeof images === 'string') {
    return images
      .split(',')
      .map((img) => img.trim())
      .filter(Boolean)
  }

  return []
}

// Normalize a single property coming from the backend
export function normalizeProperty(raw: any): Property {
  const normalizedImages = normalizeImages(raw?.images)

  return {
    ...raw,
    type: raw?.propertyType?.code || raw?.type || 'APARTMENT',
    price: typeof raw?.price === 'string' ? parseFloat(raw.price) : raw?.price ?? 0,
    area: raw?.area ?? raw?.areaSqm ?? 0,
    areaSqm: raw?.areaSqm ?? raw?.area ?? 0,
    images: normalizedImages,
  } as Property
}

// Normalize the properties array inside a PropertiesResponse
export function normalizePropertiesResponse(response: PropertiesResponse): PropertiesResponse {
  if (!response?.data?.properties) return response

  const normalizedProperties = response.data.properties.map((property) => normalizeProperty(property))

  return {
    ...response,
    data: {
      ...response.data,
      properties: normalizedProperties,
    },
  }
}

// Clean and deduplicate address components
export function cleanAddress(property: { address?: string; city?: string; state?: string; zipCode?: string; country?: string }): string {
  const rawParts = [
    property.address,
    property.city,
    property.state,
    property.zipCode,
    property.country === 'MY' ? 'Malaysia' : property.country
  ].filter(Boolean).join(', ');

  // Split by comma and deduplicate each segment
  const segments = rawParts.split(',').map(s => s.trim()).filter(Boolean);
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const segment of segments) {
    const normalized = segment.toLowerCase().trim();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(segment);
    }
  }

  return unique.join(', ');
}
