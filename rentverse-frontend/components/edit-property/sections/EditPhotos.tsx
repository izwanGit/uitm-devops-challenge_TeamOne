'use client'

import { useState, useRef } from 'react'
import { usePropertyListingStore } from '@/stores/propertyListingStore'
import { ImagePlus, Trash2, X, Plus, Upload, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { uploadImages, validateImageFiles } from '@/utils/uploadService'

interface PhotoFile {
    id: string
    file: File
    preview: string
    uploaded?: boolean
    uploadUrl?: string
    isUploading?: boolean
    error?: string
}

export default function EditPhotos() {
    const { data, updateData } = usePropertyListingStore()
    const [selectedPhotos, setSelectedPhotos] = useState<PhotoFile[]>([])
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const removeImage = (urlToRemove: string) => {
        updateData({ images: data.images.filter(url => url !== urlToRemove) })
    }

    const handleAddPhotos = () => {
        setShowUploadModal(true)
    }

    const handleBrowseFiles = () => {
        fileInputRef.current?.click()
    }

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return

        const fileArray = Array.from(files)
        const { valid, invalid } = validateImageFiles(fileArray)

        if (invalid.length > 0) {
            const errors = invalid.map(item => `${item.file.name}: ${item.reason}`)
            setValidationErrors(errors)
        } else {
            setValidationErrors([])
        }

        if (valid.length > 0) {
            const newPhotos: PhotoFile[] = valid.map(file => ({
                id: Math.random().toString(36).substring(2, 9),
                file,
                preview: URL.createObjectURL(file),
                uploaded: false,
                isUploading: false,
            }))

            setSelectedPhotos(newPhotos)
            handleUpload(newPhotos)
        }
    }

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(event.target.files)
    }

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        handleFileSelect(e.dataTransfer.files)
    }

    const handleUpload = async (photosToUpload: PhotoFile[]) => {
        setIsUploading(true)

        try {
            const result = await uploadImages(
                photosToUpload.map(photo => photo.file),
                {
                    optimize: true,
                    onProgress: (progress) => {
                        setSelectedPhotos(prev => prev.map(photo => {
                            const progressItem = progress.find(p => p.file === photo.file)
                            if (progressItem) {
                                return {
                                    ...photo,
                                    isUploading: progressItem.status === 'uploading',
                                    uploaded: progressItem.status === 'completed',
                                    uploadUrl: progressItem.result?.data.url,
                                    error: progressItem.error,
                                }
                            }
                            return photo
                        }))
                    }
                }
            )

            if (result.success) {
                const newUrls = result.data
                    .filter(uploadResult => uploadResult.success)
                    .map(uploadResult => uploadResult.data.url)

                const allImageUrls = [...(data.images || []), ...newUrls]
                updateData({ images: allImageUrls })
                setShowUploadModal(false)
                setSelectedPhotos([])
            }
        } catch (error) {
            console.error('Upload failed:', error)
            setValidationErrors([error instanceof Error ? error.message : 'Upload failed'])
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-1">Photos</h2>
                        <p className="text-sm text-slate-500">Manage your property images.</p>
                    </div>
                    <button
                        onClick={handleAddPhotos}
                        className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        <ImagePlus size={18} />
                        <span className="text-sm font-medium">Add Photos</span>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileInputChange}
                        className="hidden"
                    />
                </div>

                {validationErrors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-medium text-red-800">Upload Errors</h4>
                                <ul className="mt-1 text-sm text-red-700 space-y-1">
                                    {validationErrors.map((error) => (
                                        <li key={error}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

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
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
                        onClick={() => setShowUploadModal(false)}
                    />

                    <div className="relative bg-white rounded-2xl max-w-md w-full flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <h3 className="text-xl font-semibold text-slate-900">Upload photos</h3>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${isDragging ? 'border-teal-400 bg-teal-50' : 'border-slate-300 bg-slate-25'
                                    }`}
                            >
                                <div className="flex justify-center mb-4">
                                    <ImagePlus size={64} className="text-slate-400" />
                                </div>

                                <h4 className="text-lg font-medium text-slate-900 mb-2">
                                    Drag and drop
                                </h4>
                                <p className="text-sm text-slate-600 mb-6">
                                    or browse for photos
                                </p>

                                <button
                                    onClick={handleBrowseFiles}
                                    className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                                >
                                    Browse
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
