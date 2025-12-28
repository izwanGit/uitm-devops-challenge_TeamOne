import Image from 'next/image'

function AddListingStepThree() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Content */}
        <div className="space-y-6">
          <div className="space-y-4">
            <span className="text-lg text-slate-600 font-medium">Step 3</span>
            <h1 className="text-4xl font-serif text-slate-900 leading-tight">
              Finish up and publish
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Finally, you&apos;ll choose rent settings, set up pricing, and publish your listing.
            </p>
          </div>
        </div>

        {/* Right side - Illustration */}
        <div className="flex justify-center lg:justify-end">
          <Image
            width={640}
            height={640}
            alt="Step 3: Finish up and publish"
            className="w-80 h-80 lg:w-96 lg:h-96"
            src="https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758300392/rentverse-base/image_16_gjsg2y.png"
          />
        </div>
      </div>
    </div>
  )
}

export default AddListingStepThree
