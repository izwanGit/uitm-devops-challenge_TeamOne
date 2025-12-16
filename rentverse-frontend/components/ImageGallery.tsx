import Image from 'next/image'

interface ImageGalleryProps {
  images: [string, string, string, string, string]
}

function ImageGallery({ images }: ImageGalleryProps) {
  const [mainImage, ...gridImages] = images

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-2 gap-2 h-96">
      {/* Main large image on the left */}
      <div className="relative rounded-l-lg overflow-hidden">
        <Image
          src={mainImage}
          alt="Main property image"
          fill
          className="object-cover"
          priority
          unoptimized={mainImage.includes('fazwaz.com')}
        />
      </div>

      {/* Grid of 4 smaller images on the right */}
      <div className="grid grid-cols-2 grid-rows-2 gap-2">
        {gridImages.map((image, index) => (
          <div
            key={index}
            className={`relative overflow-hidden ${index === 1 ? 'rounded-tr-lg' :
                index === 3 ? 'rounded-br-lg' : ''
              }`}
          >
            <Image
              src={image}
              alt={`Property image ${index + 2}`}
              fill
              className="object-cover"
              unoptimized={image.includes('fazwaz.com')}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImageGallery
