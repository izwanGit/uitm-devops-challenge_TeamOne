import type { PropertyBase } from '@/types/property'

type GetAllPropertiesType = (limit?: number) => Array<PropertyBase>

const sampleProperties: Array<PropertyBase> = [
  {
    id: 'a4b2-1c3d-4e5f-6789-0abcde123456',
    title: 'Modern Apartment in City Center',
    location: 'New York, NY',
    price: 412,
    imageUrl: 'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758016984/rentverse-rooms/Gemini_Generated_Image_5hdui35hdui35hdu_s34nx6.png',
    area: 1200,
    rating: 4.5,
    propertyType: 'apartment',
  },
  {
    id: 'a4b2-1c3d-4e5f-6789-0abcde123457',
    title: 'Modern Apartment in City Center',
    location: 'New York, NY',
    price: 412,
    imageUrl: 'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758016984/rentverse-rooms/Gemini_Generated_Image_5hdui35hdui35hdu_s34nx6.png',
    area: 1200,
    rating: 4.5,
    propertyType: 'condominium',
  },
  {
    id: 'a4b2-1c3d-4e5f-6789-0abcde123458',
    title: 'Modern Apartment in City Center',
    location: 'New York, NY',
    price: 412,
    imageUrl: 'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758016984/rentverse-rooms/Gemini_Generated_Image_5hdui35hdui35hdu_s34nx6.png',
    area: 1200,
    rating: 4.5,
    propertyType: 'villa',
  },
  {
    id: 'a4b2-1c3d-4e5f-6789-0abcde123459',
    title: 'Modern Apartment in City Center',
    location: 'New York, NY',
    price: 412,
    imageUrl: 'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758016984/rentverse-rooms/Gemini_Generated_Image_5hdui35hdui35hdu_s34nx6.png',
    area: 1200,
    rating: 4.5,
    propertyType: 'townhouse',
  },
  {
    id: 'a4b2-1c3d-4e5f-6789-0abcde123460',
    title: 'Modern Apartment in City Center',
    location: 'New York, NY',
    price: 412,
    imageUrl: 'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758016984/rentverse-rooms/Gemini_Generated_Image_5hdui35hdui35hdu_s34nx6.png',
    area: 1200,
    rating: 4.5,
    propertyType: 'townhouse',
  },
  {
    id: 'a4b2-1c3d-4e5f-6789-0abcde123461',
    title: 'Modern Apartment in City Center',
    location: 'New York, NY',
    price: 412,
    imageUrl: 'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758016984/rentverse-rooms/Gemini_Generated_Image_5hdui35hdui35hdu_s34nx6.png',
    area: 1200,
    rating: 4.5,
    propertyType: 'townhouse',
  },
  {
    id: 'a4b2-1c3d-4e5f-6789-0abcde123462',
    title: 'Modern Apartment in City Center',
    location: 'New York, NY',
    price: 412,
    imageUrl: 'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758016984/rentverse-rooms/Gemini_Generated_Image_5hdui35hdui35hdu_s34nx6.png',
    area: 1200,
    rating: 4.5,
    propertyType: 'townhouse',
  },
  {
    id: 'a4b2-1c3d-4e5f-6789-0abcde123463',
    title: 'Modern Apartment in City Center',
    location: 'New York, NY',
    price: 412,
    imageUrl: 'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758016984/rentverse-rooms/Gemini_Generated_Image_5hdui35hdui35hdu_s34nx6.png',
    area: 1200,
    rating: 4.5,
    propertyType: 'townhouse',
  },
]

export const getAllProperties: GetAllPropertiesType = (limit = 4) => {
  return sampleProperties.slice(0, limit)
}
