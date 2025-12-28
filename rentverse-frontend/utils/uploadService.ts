/**
 * Image Upload Service using Cloudinary
 * 
 * This service uploads images directly to Cloudinary instead of going through the backend.
 * It provides progress tracking and handles multiple file uploads efficiently.
 * 
 * Configuration:
 * - CLOUDINARY_CLOUD_NAME: Set to 'dd1f3rawl'
 * - NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: Set in environment variables (optional)
 * 
 * Troubleshooting 400 Errors:
 * 1. Create an unsigned upload preset in Cloudinary dashboard
 * 2. Set NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name
 * 3. Or use default presets: 'default_unsigned' or 'ml_default'
 * 
 * Features:
 * - Direct upload to Cloudinary
 * - Real-time progress tracking
 * - File validation (type, size)
 * - Batch upload support
 * - Automatic image optimization
 * - Fallback upload presets
 */

// Types for the Cloudinary upload response
export interface CloudinaryUploadResult {
  public_id: string
  version: number
  signature: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  tags: string[]
  bytes: number
  type: string
  etag: string
  placeholder: boolean
  url: string
  secure_url: string
  folder: string
  original_filename: string
  api_key: string
}

export interface UploadedImageData {
  publicId: string
  fileName: string
  originalName: string
  mimeType: string
  size: number
  url: string
  width: number
  height: number
  format: string
  resourceType: string
  etag: string
}

export interface UploadResult {
  success: boolean
  message: string
  data: UploadedImageData
}

export interface UploadResponse {
  success: boolean
  message: string
  data: UploadResult[]
}

import { createCloudinaryUploadUrl } from './apiConfig'

export interface UploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  result?: UploadResult
  error?: string
}

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dd1f3rawl'
const CLOUDINARY_API_URL = createCloudinaryUploadUrl('image')

/**
 * Upload a single image to Cloudinary with fallback options
 */
export async function uploadSingleImageToCloudinary(
  file: File,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult> {
  // Try different upload configurations in order
  const uploadOptions = [
    // 1. Try custom preset if configured (highest priority)
    ...(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ? [{
      preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      folder: 'rentverse-properties'
    }] : []),

    // 3. Try common default presets (often automatically created by Cloudinary)
    { preset: 'rentverse', folder: 'rentverse-properties' },
    { preset: 'ml_default', folder: 'rentverse-properties' },
    { preset: 'unsigned_upload', folder: 'rentverse-properties' },
    { preset: 'default', folder: 'rentverse-properties' },
    { preset: 'default_unsigned', folder: 'rentverse-properties' },

    // 4. Try without preset (only works if account has default unsigned upload enabled)
    { preset: undefined, folder: 'rentverse-properties' },

    // 5. Try minimal configuration as last resort
    { preset: undefined, folder: undefined },
  ]

  let lastError: Error | null = null

  for (const option of uploadOptions) {
    try {
      const presetInfo = option.preset ? `with preset: ${option.preset}` : 'without preset'
      console.log(`Trying upload ${presetInfo}`)
      const result = await attemptUpload(file, option.preset, option.folder, onProgress)
      console.log(`Upload successful ${presetInfo}`)
      return result
    } catch (error) {
      const presetInfo = option.preset ? `with preset ${option.preset}` : 'without preset'
      console.warn(`Upload failed ${presetInfo}:`, error)
      lastError = error instanceof Error ? error : new Error('Upload failed')

      // If the error is not about missing preset, it might be a network error or file size error
      // in which case we might want to stop trying other presets.
      // But for now, we'll try them all as they might have different configurations.
      continue
    }
  }

  // If all attempts failed, provide helpful error message
  const errorMessage = lastError?.message || 'All upload attempts failed'

  if (errorMessage.includes('Upload preset must be specified') || errorMessage.includes('whitelisted')) {
    const error = new Error('Cloudinary Upload Preset missing or invalid. Please set NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your environment variables (e.g., in Vercel Dashboard).')
    console.error('CRITICAL: Cloudinary configuration error. See: https://cloudinary.com/documentation/upload_images#unsigned_upload')
    throw error
  }

  throw lastError || new Error('All upload attempts failed')
}

/**
 * Attempt upload with specific configuration
 */
function attemptUpload(
  file: File,
  uploadPreset?: string,
  folder?: string,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)

    // Only add preset if provided
    if (uploadPreset) {
      formData.append('upload_preset', uploadPreset)
    }

    // Add optional parameters
    if (folder) {
      formData.append('folder', folder)
    }

    // Add tags for organization
    formData.append('tags', 'rentverse,property')

    // Add some upload options that might help
    formData.append('resource_type', 'auto')
    formData.append('quality', 'auto')

    console.log(`Uploading to Cloudinary:`)
    console.log(`- Preset: ${uploadPreset || 'none (trying default)'}`)
    console.log(`- Folder: ${folder || 'none'}`)
    console.log(`- Cloud: ${CLOUDINARY_CLOUD_NAME}`)

    const xhr = new XMLHttpRequest()

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100)
        onProgress(progress)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText)
          resolve(result)
        } catch (parseError) {
          console.error('Failed to parse Cloudinary response:', parseError)
          reject(new Error('Invalid JSON response from Cloudinary'))
        }
      } else {
        // Log the full error response for debugging
        let errorMessage = `Upload failed: ${xhr.status} ${xhr.statusText}`
        try {
          const errorResponse = JSON.parse(xhr.responseText)
          console.error('Cloudinary error response:', errorResponse)
          if (errorResponse.error && errorResponse.error.message) {
            errorMessage += ` - ${errorResponse.error.message}`
          }
        } catch (parseErr) {
          console.error('Failed to parse error response:', parseErr)
          console.error('Raw error response:', xhr.responseText)
        }
        reject(new Error(errorMessage))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'))
    })

    xhr.open('POST', CLOUDINARY_API_URL)
    xhr.send(formData)
  })
}

/**
 * Convert Cloudinary result to our format
 */
function convertCloudinaryResult(cloudinaryResult: CloudinaryUploadResult): UploadedImageData {
  return {
    publicId: cloudinaryResult.public_id,
    fileName: cloudinaryResult.public_id.split('/').pop() || '',
    originalName: cloudinaryResult.original_filename || '',
    mimeType: `image/${cloudinaryResult.format}`,
    size: cloudinaryResult.bytes,
    url: cloudinaryResult.secure_url,
    width: cloudinaryResult.width,
    height: cloudinaryResult.height,
    format: cloudinaryResult.format,
    resourceType: cloudinaryResult.resource_type,
    etag: cloudinaryResult.etag
  }
}

/**
 * Upload multiple images to Cloudinary
 */
export async function uploadImages(
  files: File[],
  options?: {
    optimize?: boolean
    onProgress?: (progress: UploadProgress[]) => void
  }
): Promise<UploadResponse> {
  const { onProgress } = options || {}

  // Initialize progress tracking
  const progressList: UploadProgress[] = files.map(file => ({
    file,
    progress: 0,
    status: 'pending'
  }))

  if (onProgress) {
    onProgress([...progressList])
  }

  try {
    const uploadPromises = files.map(async (file, index) => {
      try {
        // Update status to uploading
        progressList[index].status = 'uploading'
        if (onProgress) {
          onProgress([...progressList])
        }

        console.log(`Starting Cloudinary upload for file: ${file.name}`)

        // Upload to Cloudinary
        const cloudinaryResult = await uploadSingleImageToCloudinary(
          file,
          (progress) => {
            progressList[index].progress = progress
            if (onProgress) {
              onProgress([...progressList])
            }
          }
        )

        console.log(`Cloudinary upload success for ${file.name}:`, cloudinaryResult)

        // Convert to our format
        const uploadData = convertCloudinaryResult(cloudinaryResult)

        const result: UploadResult = {
          success: true,
          message: 'Upload successful',
          data: uploadData
        }

        // Update progress to completed
        progressList[index].status = 'completed'
        progressList[index].progress = 100
        progressList[index].result = result

        if (onProgress) {
          onProgress([...progressList])
        }

        return result
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error)

        // Update progress to error
        progressList[index].status = 'error'
        progressList[index].error = error instanceof Error ? error.message : 'Upload failed'

        if (onProgress) {
          onProgress([...progressList])
        }

        return {
          success: false,
          message: error instanceof Error ? error.message : 'Upload failed',
          data: {} as UploadedImageData
        }
      }
    })

    const results = await Promise.all(uploadPromises)

    const successfulUploads = results.filter((result): result is UploadResult => result?.success === true)
    const failedUploads = results.filter((result): result is UploadResult => result?.success === false)

    if (failedUploads.length > 0) {
      console.warn(`${failedUploads.length} uploads failed out of ${files.length}`)
    }

    return {
      success: successfulUploads.length > 0,
      message: failedUploads.length > 0
        ? `${successfulUploads.length} uploads succeeded, ${failedUploads.length} failed`
        : 'All uploads successful',
      data: successfulUploads
    }
  } catch (error) {
    console.error('Upload batch failed:', error)

    // Update all progress to error
    progressList.forEach(item => {
      if (item.status !== 'completed') {
        item.status = 'error'
        item.error = error instanceof Error ? error.message : 'Upload failed'
      }
    })

    if (onProgress) {
      onProgress([...progressList])
    }

    throw error
  }
}

/**
 * Check if Cloudinary is properly configured
 */
export function checkCloudinaryConfig(): { configured: boolean, issues: string[] } {
  const issues: string[] = []

  if (!CLOUDINARY_CLOUD_NAME) {
    issues.push('CLOUDINARY_CLOUD_NAME is not set')
  }

  if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
    issues.push('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not set in environment variables')
    issues.push('Create an unsigned upload preset in Cloudinary dashboard')
  }

  console.log('Cloudinary Configuration Check:')
  console.log('- Cloud Name:', CLOUDINARY_CLOUD_NAME || 'NOT SET')
  console.log('- Upload Preset:', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'NOT SET')
  console.log('- Upload URL:', CLOUDINARY_API_URL)

  return {
    configured: issues.length === 0,
    issues
  }
}

/**
 * Test Cloudinary configuration by checking available upload presets
 */
export async function testCloudinaryConfig(): Promise<{ working: boolean, error?: string, suggestions: string[] }> {
  const suggestions: string[] = []

  // Test with a small dummy file
  const dummyFile = new File(['test'], 'test.txt', { type: 'text/plain' })

  try {
    await uploadSingleImageToCloudinary(dummyFile)
    return { working: true, suggestions: ['Configuration is working correctly!'] }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    suggestions.push('1. Create an unsigned upload preset in Cloudinary dashboard')
    suggestions.push('2. Set NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local')
    suggestions.push('3. Make sure the preset is set to "Unsigned" mode')
    suggestions.push('4. Check that your Cloudinary cloud name is correct: dd1f3rawl')

    if (errorMessage.includes('400')) {
      suggestions.push('5. 400 error usually means invalid upload preset or configuration')
    }

    return {
      working: false,
      error: errorMessage,
      suggestions
    }
  }
}

/**
 * Validate image files before upload
 */
export function validateImageFiles(files: File[]): { valid: File[], invalid: { file: File, reason: string }[] } {
  const valid: File[] = []
  const invalid: { file: File, reason: string }[] = []

  const maxFileSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  files.forEach(file => {
    if (!allowedTypes.includes(file.type)) {
      invalid.push({ file, reason: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' })
    } else if (file.size > maxFileSize) {
      invalid.push({ file, reason: 'File too large. Maximum size is 10MB.' })
    } else {
      valid.push(file)
    }
  })

  return { valid, invalid }
}