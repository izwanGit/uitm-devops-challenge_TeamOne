'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { X, Plus, Upload, AlertCircle } from 'lucide-react'
import { usePropertyListingStore } from '@/stores/propertyListingStore'
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

function AddListingStepTwoPhotos() {
  const { data, updateData } = usePropertyListingStore()
  const [selectedPhotos, setSelectedPhotos] = useState<PhotoFile[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load existing images from store on mount
  useEffect(() => {
    if (data.images && data.images.length > 0) {
      // Convert stored image URLs to PhotoFile objects for display
      const existingPhotos: PhotoFile[] = data.images.map((url, index) => ({
        id: `existing-${index}`,
        file: new File([], `image-${index}.jpg`), // Placeholder file
        preview: url,
        uploaded: true,
        uploadUrl: url,
      }))
      setSelectedPhotos(existingPhotos)
    }
  }, [data.images])

  const handleAddPhotos = () => {
    console.log('handleAddPhotos called - setting showUploadModal to true')
    setShowUploadModal(true)
  }

  const handleBrowseFiles = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    
    // Validate files
    const { valid, invalid } = validateImageFiles(fileArray)
    
    // Show validation errors if any
    if (invalid.length > 0) {
      const errors = invalid.map(item => `${item.file.name}: ${item.reason}`)
      setValidationErrors(errors)
      console.warn('Invalid files:', invalid)
    } else {
      setValidationErrors([])
    }

    // Only process valid files
    if (valid.length > 0) {
      const newPhotos: PhotoFile[] = valid.map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        preview: URL.createObjectURL(file),
        uploaded: false,
        isUploading: false,
      }))

      setSelectedPhotos(prev => [...prev, ...newPhotos])
      setShowUploadModal(false)
      setShowPreviewModal(true)
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

    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const handleRemovePhoto = (photoId: string) => {
    setSelectedPhotos(prev => {
      const updated = prev.filter(photo => photo.id !== photoId)
      // Clean up object URL to prevent memory leaks
      const photoToRemove = prev.find(photo => photo.id === photoId)
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.preview)
      }
      return updated
    })
  }

  const handleCloseUploadModal = () => {
    setShowUploadModal(false)
  }

  const handleClosePreviewModal = () => {
    setShowPreviewModal(false)
  }

  const handleUpload = async () => {
    const filesToUpload = selectedPhotos.filter(photo => !photo.uploaded)
    
    if (filesToUpload.length === 0) {
      // All photos are already uploaded, just close modal
      setShowPreviewModal(false)
      return
    }

    setIsUploading(true)
    
    try {
      // Upload the images
      const result = await uploadImages(
        filesToUpload.map(photo => photo.file),
        {
          optimize: true,
          onProgress: (progress) => {
            // Update individual photo upload status
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
        // Get all uploaded URLs from the result
        const newlyUploadedUrls = result.data
          .filter(uploadResult => uploadResult.success)
          .map(uploadResult => uploadResult.data.url)

        // Get existing uploaded URLs from the current selectedPhotos
        const existingUrls = selectedPhotos
          .filter(photo => photo.uploaded && photo.uploadUrl)
          .map(photo => photo.uploadUrl!)

        // Combine all URLs
        const allImageUrls = [...existingUrls, ...newlyUploadedUrls]

        updateData({ images: allImageUrls })
        console.log('Images uploaded successfully:', allImageUrls)
      }

      setShowPreviewModal(false)
    } catch (error) {
      console.error('Upload failed:', error)
      setValidationErrors([error instanceof Error ? error.message : 'Upload failed'])
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <div className="max-w-6xl mx-auto p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold text-slate-900">
              Add some photos of your house
            </h2>
            <p className="text-lg text-slate-600">
              You&apos;ll need 5 photos to get started. You can add more or make changes later.
            </p>
          </div>

          {/* Validation Errors */}
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

          {/* Photo Upload Section */}
          <div className="flex flex-col items-center justify-center py-16 space-y-8">
            {/* Camera Icon */}
            <div className="flex items-center justify-center">
              <Image
                src="https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758300393/rentverse-base/image_15_schljx.png"
                alt="Upload Photos"
                width={120}
                height={120}
                className="w-30 h-30 object-contain"
              />
            </div>

            {/* Add Photos Button */}
            <button
              onClick={handleAddPhotos}
              className="px-6 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-medium hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
            >
              Add photos
            </button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Selected Photos Count */}
          {selectedPhotos.length > 0 && (
            <div className="text-center">
              <p className="text-slate-600">
                {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? 's' : ''} selected
              </p>
              <button
                onClick={() => setShowPreviewModal(true)}
                className="mt-2 text-slate-900 font-medium hover:text-slate-700 transition-colors"
              >
                View selected photos
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal (Drag & Drop) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
            onClick={handleCloseUploadModal}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl max-w-md w-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold text-slate-900">Upload photos</h3>
                <span className="text-sm text-slate-500">No items selected</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBrowseFiles}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Browse files"
                >
                  <Plus size={20} />
                </button>
                <button
                  onClick={handleCloseUploadModal}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div className="p-6">
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-xl p-12 text-center transition-all
                  ${isDragging
                  ? 'border-slate-400 bg-slate-50'
                  : 'border-slate-300 bg-slate-25'
                }
                `}
              >
                {/* Camera Icon */}
                <div className="flex justify-center mb-4">
                  <Image
                    src="https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758300393/rentverse-base/image_15_schljx.png"
                    alt="Upload"
                    width={64}
                    height={64}
                    className="w-16 h-16 object-contain"
                  />
                </div>

                {/* Text */}
                <h4 className="text-lg font-medium text-slate-900 mb-2">
                  Drag and drop
                </h4>
                <p className="text-sm text-slate-600 mb-6">
                  or browse for photos
                </p>

                {/* Browse Button */}
                <button
                  onClick={handleBrowseFiles}
                  className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                >
                  Browse
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-slate-200">
              <button
                onClick={handleCloseUploadModal}
                className="px-6 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                disabled={selectedPhotos.length === 0}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
            onClick={handleClosePreviewModal}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold text-slate-900">Upload photos</h3>
                <span className="text-sm text-slate-500">
                  {selectedPhotos.length} item{selectedPhotos.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddPhotos}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Add more photos"
                >
                  <Plus size={20} />
                </button>
                <button
                  onClick={handleClosePreviewModal}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Photos Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4">
                {selectedPhotos.map((photo, index) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                      <Image
                        src={photo.preview}
                        alt={`Selected photo ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Upload overlay */}
                      {photo.isUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <span className="text-sm">Uploading...</span>
                          </div>
                        </div>
                      )}

                      {/* Upload success indicator */}
                      {photo.uploaded && !photo.isUploading && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}

                      {/* Upload error indicator */}
                      {photo.error && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                          <AlertCircle size={14} />
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700 z-10"
                      disabled={photo.isUploading}
                    >
                      <X size={14} />
                    </button>

                    {/* Photo Index */}
                    <div
                      className="absolute top-2 left-2 w-6 h-6 bg-slate-900 bg-opacity-75 text-white text-xs rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-slate-200 flex-shrink-0">
              <button
                onClick={handleClosePreviewModal}
                className="px-6 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                disabled={selectedPhotos.length === 0 || isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Upload {selectedPhotos.filter(p => !p.uploaded).length} photos</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AddListingStepTwoPhotos