import Image from 'next/image'

function BoxError({ errorTitle, errorDescription }: { errorTitle: string, errorDescription: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl my-4">
      <div className="flex-shrink-0">
        <Image
          src="https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758183654/rentverse-base/alert-sign_rkqgue.png"
          alt={'Error'}
          width={40}
          height={40}
          className={'w-10 h-auto aspect-square'}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="text-base font-semibold text-slate-900 mb-1">
          {errorTitle}
        </h5>
        <p className="text-xs text-slate-600 leading-relaxed">
          {errorDescription}
        </p>
      </div>
    </div>
  )
}

export default BoxError
