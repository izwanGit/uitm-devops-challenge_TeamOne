import Image from 'next/image'

function AddListingStepTwo() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="space-y-4">
            <span className="text-lg text-slate-600 font-medium">Step 2</span>
            <h1 className="text-4xl font-serif text-slate-900 leading-tight">
              Make your place stand out
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              In this step, you&apos;ll add amenities and photos.
            </p>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <Image
            width={640}
            height={640}
            alt="Step 2"
            className="w-80 h-80 lg:w-96 lg:h-96"
            src="https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758300393/rentverse-base/image_14_isvxd9.png"
          />
        </div>
      </div>
    </div>
  )
}

export default AddListingStepTwo
