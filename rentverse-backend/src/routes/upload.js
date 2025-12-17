const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
} = require('../middleware/upload');
const uploadController = require('../utils/uploadController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     FileUploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             publicId:
 *               type: string
 *               description: Cloudinary public ID
 *             fileName:
 *               type: string
 *               description: Generated filename (same as publicId)
 *             originalName:
 *               type: string
 *               description: Original uploaded filename
 *             mimeType:
 *               type: string
 *               description: File MIME type (may be converted)
 *             size:
 *               type: number
 *               description: File size in bytes
 *             url:
 *               type: string
 *               description: Cloudinary secure URL
 *             width:
 *               type: number
 *               description: Image/Video width (if applicable)
 *             height:
 *               type: number
 *               description: Image/Video height (if applicable)
 *             format:
 *               type: string
 *               description: Final format (webp for images, webm for videos)
 *             resourceType:
 *               type: string
 *               description: Cloudinary resource type (image, video, raw)
 *             etag:
 *               type: string
 *               description: File etag
 */

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload management API
 */

/**
 * @swagger
 * /api/upload/single:
 *   post:
 *     summary: Upload a single file with auto WebP/WebM conversion
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               optimize:
 *                 type: boolean
 *                 description: Whether to optimize files (default true)
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUploadResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/single',
  auth,
  uploadSingle('file'),
  uploadController.uploadSingle
);

/**
 * @swagger
 * /api/upload/multiple:
 *   post:
 *     summary: Upload multiple files with auto WebP/WebM conversion
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               optimize:
 *                 type: boolean
 *                 description: Whether to optimize files (default true)
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FileUploadResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/multiple',
  auth,
  uploadMultiple('files', 10),
  uploadController.uploadMultiple
);

/**
 * @swagger
 * /api/upload/property-images:
 *   post:
 *     summary: Upload property images with thumbnails
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Property images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     images:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FileUploadResponse'
 *                     thumbnails:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FileUploadResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/property-images',
  auth,
  authorize(['USER', 'ADMIN']),
  uploadMultiple('files', 10),
  uploadController.uploadPropertyImages
);

/**
 * @swagger
 * /api/upload/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     avatar:
 *                       $ref: '#/components/schemas/FileUploadResponse'
 *                     thumbnail:
 *                       $ref: '#/components/schemas/FileUploadResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/avatar',
  auth,
  uploadSingle('file'),
  uploadController.uploadAvatar
);

/**
 * @swagger
 * /api/upload/delete/{publicId}:
 *   delete:
 *     summary: Delete a file from Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         schema:
 *           type: string
 *         required: true
 *         description: Public ID of the file to delete
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resourceType:
 *                 type: string
 *                 enum: [image, video, raw]
 *                 default: image
 *                 description: Type of resource to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.delete('/delete/:publicId', auth, uploadController.deleteFile);

/**
 * @swagger
 * /api/upload/delete-multiple:
 *   delete:
 *     summary: Delete multiple files from Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publicIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of public IDs to delete
 *     responses:
 *       200:
 *         description: Files deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.delete('/delete-multiple', auth, uploadController.deleteMultipleFiles);

/**
 * @swagger
 * /api/upload/video-thumbnail/{publicId}:
 *   get:
 *     summary: Get video thumbnail URL
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         schema:
 *           type: string
 *         required: true
 *         description: Public ID of the video
 *       - in: query
 *         name: startOffset
 *         schema:
 *           type: string
 *           default: "1s"
 *         description: Time offset to extract thumbnail from
 *     responses:
 *       200:
 *         description: Video thumbnail URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     thumbnailUrl:
 *                       type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/video-thumbnail/:publicId',
  auth,
  uploadController.getVideoThumbnail
);

// Error handling middleware
router.use(handleUploadError);

module.exports = router;
