import Image from 'next/image'
import React from 'react'


function AddListingStepOne() {
  return (
    <div className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <span className="text-lg text-slate-600 font-medium">Step 1</span>
              <h1 className="text-4xl font-serif text-slate-900 leading-tight">
                Let&apos;s start with the basics
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Tell us where your property is located and what kind of home it is. This helps tenants find you.
              </p>
            </div>
          </div>

          {/* Right side - Illustration */}
          <div className="flex justify-center lg:justify-end">
            <Image
              width={640}
              height={640}
              alt="Step 1: Tell us about your place"
              className="w-80 h-80 lg:w-96 lg:h-96"
              src="https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758249314/rentverse-base/image_12_ffs0nz.png"
            />
          </div>
        </div>
      </div>
  )
}

export default AddListingStepOne
