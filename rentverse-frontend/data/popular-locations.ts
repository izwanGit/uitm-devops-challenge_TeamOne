import { LocationBaseType } from '@/types/location'

type getPopularLocations = () => Array<LocationBaseType>

const popularLocations: Array<LocationBaseType> = [
  {
    name: 'Kuala Lumpur',
    imageUrl: 'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758027181/rentverse-locations/kuala-lumpur_zbmm3x.png',
    latitude: 3.139,
    longitude: 101.6869,
  },
  {
    name: 'Petaling Jaya',
    imageUrl: 'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758027174/rentverse-locations/petaling-jaya_vpzude.png',
    latitude: 3.1073,
    longitude: 101.6482,
  },
  {
    name: 'Subang Jaya',
    imageUrl: 'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758027170/rentverse-locations/subang-jaya_xidmex.png',
    latitude: 3.1516,
    longitude: 101.5877,
  },
  {
    name: 'Penang Island',
    imageUrl: 'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758027170/rentverse-locations/penang-island_axjqzm.png',
    latitude: 5.4164,
    longitude: 100.3327,
  },
  {
    name: 'Johor Bahru',
    imageUrl: 'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758027166/rentverse-locations/johor-bahru_sij5vg.png',
    latitude: 1.4927,
    longitude: 103.7414,
  },
  {
    name: 'Shah Alam',
    imageUrl: 'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758027182/rentverse-locations/shah-alam_swukrl.png',
    latitude: 3.0733,
    longitude: 101.5185,
  },
  // Additional Penang locations for better dropdown options
  {
    name: 'Georgetown, Penang',
    imageUrl: 'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758027170/rentverse-locations/penang-island_axjqzm.png',
    latitude: 5.4141,
    longitude: 100.3288,
  },
  {
    name: 'Butterworth, Penang',
    imageUrl: 'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758027170/rentverse-locations/penang-island_axjqzm.png',
    latitude: 5.4012,
    longitude: 100.3629,
  },
  {
    name: 'Bayan Lepas, Penang',
    imageUrl: 'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758027170/rentverse-locations/penang-island_axjqzm.png',
    latitude: 5.2946,
    longitude: 100.2658,
  },
  {
    name: 'Bukit Mertajam, Penang',
    imageUrl: 'https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758027170/rentverse-locations/penang-island_axjqzm.png',
    latitude: 5.3619,
    longitude: 100.4689,
  },
]

export const getPopularLocations: getPopularLocations = () => {
  return popularLocations
}
