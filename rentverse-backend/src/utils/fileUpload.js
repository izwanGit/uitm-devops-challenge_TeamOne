const {
  cloudinary,
  CLOUD_FOLDER_PREFIX,
  isCloudinaryConfigured,
} = require('../config/storage');
const { v4: uuidv4 } = require('uuid');
const streamifier = require('streamifier');

class FileUploadService {
  constructor() {
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default
    this.allowedImageTypes = (
      process.env.ALLOWED_IMAGE_TYPES ||
      'image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/svg+xml'
    ).split(',');
    this.allowedVideoTypes = (
      process.env.ALLOWED_VIDEO_TYPES ||
      'video/mp4,video/avi,video/mov,video/wmv,video/flv,video/webm'
    ).split(',');
    this.allowedFileTypes = (
      process.env.ALLOWED_FILE_TYPES ||
      'image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/svg+xml,video/mp4,video/avi,video/mov,video/wmv,video/flv,video/webm,application/pdf'
    ).split(',');
  }

  /**
   * Check if Cloudinary is configured
   */
  checkCloudinaryConfig() {
    if (!isCloudinaryConfigured) {
      throw new Error(
        'Cloudinary storage is not configured. Please check your environment variables.'
      );
    }
  }

  /**
   * Validate file type and size
   */
  validateFile(file, allowedTypes = null) {
    const types = allowedTypes || this.allowedFileTypes;

    if (!types.includes(file.mimetype)) {
      throw new Error(
        `File type ${file.mimetype} is not allowed. Allowed types: ${types.join(', ')}`
      );
    }

    if (file.size > this.maxFileSize) {
      throw new Error(
        `File size ${file.size} exceeds maximum allowed size ${this.maxFileSize} bytes`
      );
    }

    return true;
  }

  /**
   * Generate unique public ID (simplified and compact)
   */
  generatePublicId() {
    // Create timestamp in YYYYMMDDHHMMSS format
    const now = new Date();
    const timestamp = now
      .toISOString()
      .replace(/[-T:.Z]/g, '')
      .slice(0, 14);

    // Generate short UUID (first 8 characters)
    const shortId = uuidv4().split('-')[0];

    // Create compact public ID: rentverse_YYYYMMDDHHMMSS_shortId
    return `${CLOUD_FOLDER_PREFIX}_${timestamp}_${shortId}`;
  }

  /**
   * Get upload options based on file type
   */
  getUploadOptions(file, publicId) {
    const baseOptions = {
      public_id: publicId,
      use_filename: false,
      unique_filename: false,
      overwrite: true,
      quality: 'auto:good',
    };

    // Image upload options with WebP conversion
    if (this.allowedImageTypes.includes(file.mimetype)) {
      return {
        ...baseOptions,
        resource_type: 'image',
        format: 'webp', // Auto convert to WebP
        transformation: [
          {
            quality: 'auto:good',
            fetch_format: 'auto',
            width: 1920,
            height: 1080,
            crop: 'limit',
          },
        ],
      };
    }

    // Video upload options with WebM conversion
    if (this.allowedVideoTypes.includes(file.mimetype)) {
      return {
        ...baseOptions,
        resource_type: 'video',
        format: 'webm', // Auto convert to WebM
        transformation: [
          {
            quality: 'auto:good',
            width: 1920,
            height: 1080,
            crop: 'limit',
            video_codec: 'vp9', // Use VP9 codec for WebM
          },
        ],
      };
    }

    // Other files (PDF, etc.)
    return {
      ...baseOptions,
      resource_type: 'raw',
    };
  }

  /**
   * Upload file to Cloudinary
   */
  async uploadFile(file) {
    try {
      // Check if Cloudinary is configured
      this.checkCloudinaryConfig();

      // Validate file
      this.validateFile(file, this.allowedFileTypes);

      // Generate unique public ID
      const publicId = this.generatePublicId(file.originalname);

      // Get upload options based on file type
      const uploadOptions = this.getUploadOptions(file, publicId);

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
              return;
            }

            // Return file info
            resolve({
              publicId: result.public_id,
              fileName: result.public_id,
              originalName: file.originalname,
              mimeType: result.format
                ? `${result.resource_type}/${result.format}`
                : file.mimetype,
              size: result.bytes,
              url: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format,
              resourceType: result.resource_type,
              etag: result.etag,
            });
          }
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files) {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file));
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Multiple file upload error:', error);
      throw error;
    }
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId, resourceType = 'image') {
    try {
      this.checkCloudinaryConfig();

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      if (result.result === 'ok') {
        return { success: true, message: 'File deleted successfully' };
      } else {
        throw new Error(`Delete failed: ${result.result}`);
      }
    } catch (error) {
      console.error('File delete error:', error);
      throw error;
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMultipleFiles(publicIds) {
    try {
      this.checkCloudinaryConfig();

      const result = await cloudinary.api.delete_resources(publicIds);

      return { success: true, message: 'Files deleted successfully', result };
    } catch (error) {
      console.error('Multiple file delete error:', error);
      throw error;
    }
  }

  /**
   * Get file URL with transformations
   */
  getFileUrl(publicId, options = {}) {
    if (!isCloudinaryConfigured) {
      return null;
    }

    return cloudinary.url(publicId, {
      secure: true,
      ...options,
    });
  }

  /**
   * Create thumbnail for image
   */
  async createThumbnail(file) {
    try {
      this.checkCloudinaryConfig();

      if (!this.allowedImageTypes.includes(file.mimetype)) {
        throw new Error('File is not an image');
      }

      // Generate unique public ID for thumbnail with 'thumb' prefix
      const now = new Date();
      const timestamp = now
        .toISOString()
        .replace(/[-T:.Z]/g, '')
        .slice(0, 14);
      const shortId = uuidv4().split('-')[0];
      const publicId = `${CLOUD_FOLDER_PREFIX}_thumb_${timestamp}_${shortId}`;

      const uploadOptions = {
        public_id: publicId,
        resource_type: 'image',
        format: 'webp',
        transformation: [
          {
            width: 300,
            height: 300,
            crop: 'fill',
            gravity: 'center',
            quality: 'auto:good',
          },
        ],
      };
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Thumbnail creation error:', error);
              reject(error);
              return;
            }

            resolve({
              publicId: result.public_id,
              fileName: result.public_id,
              url: result.secure_url,
              size: result.bytes,
              width: result.width,
              height: result.height,
              format: result.format,
              etag: result.etag,
            });
          }
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    } catch (error) {
      console.error('Thumbnail creation error:', error);
      throw error;
    }
  }

  /**
   * Get video thumbnail
   */
  async getVideoThumbnail(publicId, options = {}) {
    try {
      this.checkCloudinaryConfig();

      const thumbnailOptions = {
        resource_type: 'video',
        format: 'webp',
        transformation: [
          {
            width: 300,
            height: 300,
            crop: 'fill',
            gravity: 'center',
            quality: 'auto:good',
            start_offset: options.startOffset || '1s', // Get frame at 1 second
          },
        ],
        ...options,
      };

      return this.getFileUrl(publicId, thumbnailOptions);
    } catch (error) {
      console.error('Video thumbnail error:', error);
      throw error;
    }
  }
}

module.exports = new FileUploadService();
