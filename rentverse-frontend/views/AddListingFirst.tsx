import Image from 'next/image'

function AddListingFirst() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Title */}
        <div>
          <h1 className="font-serif text-4xl text-slate-900 leading-tight">
            It&apos;s easy to get started<br />
            with Rentverse
          </h1>
        </div>

        {/* Right side - Steps */}
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-slate-700">1</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-900 mb-1">
                Tell us about your place
              </h3>
              <p className="text-slate-600">
                The little details help tenants fall in love.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Image
                width={64}
                height={64}
                alt="Step 1: Tell us about your place"
                className="w-16 h-16"
                src="https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758248220/rentverse-base/image_7_io8dyu.png"
              />
            </div>
          </div>

          {/* Divider */}
          <hr className="border-slate-200" />

          {/* Step 2 */}
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-slate-700">2</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-900 mb-1">
                Upload pretty pictures
              </h3>
              <p className="text-slate-600">
                Great photos always grab attention!
              </p>
            </div>
            <div className="flex-shrink-0">
              <Image
                width={64}
                height={64}
                alt="Step 2: Upload pretty pictures"
                className="w-16 h-16"
                src="https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758248219/rentverse-base/image_8_go4eeo.png"
              />
            </div>
          </div>

          {/* Divider */}
          <hr className="border-slate-200" />

          {/* Step 3 */}
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-slate-700">3</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-900 mb-1">
                We check, then you&apos;re live!
              </h3>
              <p className="text-slate-600">
                Our team reviews, then your place is ready to be found.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Image
                width={64}
                height={64}
                alt="Step 3: We check, then you're live"
                className="w-16 h-16"
                src="https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758248219/rentverse-base/image_9_pputgm.png"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddListingFirst
