'use client'

import { usePropertyListingStore } from '@/stores/propertyListingStore'
import { ImagePlus, Trash2 } from 'lucide-react'
import Image from 'next/image'

export default function EditPhotos() {
    const { data, updateData } = usePropertyListingStore()

    const removeImage = (urlToRemove: string) => {
        updateData({ images: data.images.filter(url => url !== urlToRemove) })
    }

    // NOTE: Full upload functionality is complex to replicate here without the full Uploader component
    // For now, we allow removing images. Adding images would ideally use the same widget.
    // To keep it simple for this iteration, we'll verify viewing/deleting.
    // Adding requires handling file inputs -> upload API -> URL.

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-1">Photos</h2>
                    <p className="text-sm text-slate-500">Manage your property images.</p>
                </div>
                {/* Placeholder for Add Photo button - typically triggers a file input */}
                <button className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                    <ImagePlus size={18} />
                    <span className="text-sm font-medium">Add Photos</span>
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.images && data.images.map((url, index) => (
                    <div key={url} className="group relative aspect-video bg-slate-100 rounded-xl overflow-hidden">
                        <Image
                            src={url}
                            alt={`Property ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <button
                                onClick={() => removeImage(url)}
                                className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                        {index === 0 && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded font-medium">
                                Cover
                            </div>
                        )}
                    </div>
                ))}

                {(!data.images || data.images.length === 0) && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <ImagePlus size={48} className="mb-4 opacity-50" />
                        <p>No photos added yet</p>
                    </div>
                )}
            </div>

            <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                Note: Image uploading is currently optimized for the wizard view. Please use the wizard for bulk uploads until the new dashboard uploader is ready.
            </p>
        </div>
    )
}
