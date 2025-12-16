import type { LocationBaseType } from '@/types/location'
import Image from 'next/image'
import clsx from 'clsx'

function CardPopularLocation({ location }: { location: LocationBaseType }) {
  return (
    <div className={clsx([
      'flex flex-col items-center justify-center gap-y-2 cursor-pointer',
      'hover:scale-105 transition-all duration-300',
    ])}>
      <Image
        src={location.imageUrl}
        alt={location.name}
        width={320}
        height={320}
        className='h-auto aspect-square object-cover rounded-3xl'
        unoptimized={location.imageUrl.includes('fazwaz.com')}
      />
      <h3 className='text-lg font-semibold text-slate-600'>{location.name}</h3>
    </div>
  )
}

export default CardPopularLocation
