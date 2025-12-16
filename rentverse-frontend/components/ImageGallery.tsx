'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
}

function ImageGallery({ images }: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Ensure we have at least 1 image, pad with first image if needed
  const displayImages = images.length > 0 ? images : ['/placeholder.jpg']

  // Take up to 5 images for gallery, pad with the first image if less than 5
  const paddedImages = [...displayImages]
  while (paddedImages.length < 5) {
    paddedImages.push(displayImages[0])
  }
  const [mainImage, ...gridImages] = paddedImages.slice(0, 5)

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }

  const closeLightbox = () => {
    setIsOpen(false)
  }

  const showNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length)
  }

  const showPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto grid grid-cols-2 gap-2 h-96">
        {/* Main large image on the left */}
        <div
          className="relative rounded-l-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={mainImage}
            alt="Main property image"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={mainImage.includes('fazwaz.com') || mainImage.includes('cloudinary.com')}
          />
        </div>

        {/* Grid of 4 smaller images on the right */}
        <div className="grid grid-cols-2 grid-rows-2 gap-2">
          {gridImages.map((image, index) => (
            <div
              key={index}
              className={`relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${index === 1 ? 'rounded-tr-lg' : index === 3 ? 'rounded-br-lg' : ''
                }`}
              onClick={() => openLightbox(index + 1)}
            >
              <Image
                src={image}
                alt={`Property image ${index + 2}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
                unoptimized={image.includes('fazwaz.com') || image.includes('cloudinary.com')}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Close"
          >
            <X size={32} />
          </button>

          {/* Previous button */}
          {displayImages.length > 1 && (
            <button
              onClick={showPrev}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={48} />
            </button>
          )}

          {/* Image */}
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={displayImages[currentIndex]}
              alt={`Property image ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized={displayImages[currentIndex].includes('fazwaz.com') || displayImages[currentIndex].includes('cloudinary.com')}
            />
          </div>

          {/* Next button */}
          {displayImages.length > 1 && (
            <button
              onClick={showNext}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight size={48} />
            </button>
          )}

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full">
            {currentIndex + 1} / {displayImages.length}
          </div>
        </div>
      )}
    </>
  )
}

export default ImageGallery
