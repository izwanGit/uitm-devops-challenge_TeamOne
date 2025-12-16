const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../../middleware/auth');
const usersController = require('./users.controller');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated UUID of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The email of the user
 *         firstName:
 *           type: string
 *           description: The first name of the user
 *         lastName:
 *           type: string
 *           description: The last name of the user
 *         name:
 *           type: string
 *           description: The computed full name of the user (firstName + lastName)
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: The date of birth of the user
 *         phone:
 *           type: string
 *           description: The phone number of the user
 *         profilePicture:
 *           type: string
 *           description: URL of the user's profile picture
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *           description: The role of the user
 *         isActive:
 *           type: boolean
 *           description: Whether the user is active
 *         verifiedAt:
 *           type: string
 *           format: date-time
 *           description: The date the user was verified
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the user was last updated
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         email: john.doe@example.com
 *         firstName: John
 *         lastName: Doe
 *         name: John Doe
 *         dateOfBirth: 1990-01-15
 *         phone: "+1234567890"
 *         role: USER
 *         isActive: true
 *         createdAt: 2023-01-01T00:00:00.000Z
 *         updatedAt: 2023-01-01T00:00:00.000Z
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email of the user
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 description: The first name of the user
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 description: The last name of the user
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: The date of birth of the user
 *               phone:
 *                 type: string
 *                 description: The phone number of the user
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: The password for the user
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *                 default: USER
 *                 description: The role of the user
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the user is active
 *             example:
 *               email: john.doe@example.com
 *               firstName: John
 *               lastName: Doe
 *               dateOfBirth: 1990-01-15
 *               phone: "+1234567890"
 *               password: "securepassword123"
 *               role: USER
 *               isActive: true
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation errors
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: User with this email already exists
 */
router.post(
  '/',
  auth,
  authorize('ADMIN'),
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('firstName')
      .trim()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage('First name is required'),
    body('lastName')
      .trim()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage('Last name is required'),
    body('dateOfBirth')
      .optional()
      .isISO8601()
      .withMessage('Date of birth must be a valid date'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('phone').optional().trim(),
    body('role')
      .optional()
      .isIn(['USER', 'ADMIN'])
      .withMessage('Role must be one of: USER, ADMIN'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
  ],
  usersController.createUser
);
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', auth, usersController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   patch:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: First name of the user
 *               lastName:
 *                 type: string
 *                 description: Last name of the user
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: Date of birth (accepts YYYY-MM-DD, ISO-8601 DateTime, or timestamp)
 *               phone:
 *                 type: string
 *                 description: Phone number
 *               profilePicture:
 *                 type: string
 *                 description: URL of profile picture
 *             example:
 *               firstName: John
 *               lastName: Doe
 *               dateOfBirth: "1990-01-15"
 *               phone: "+1234567890"
 *               profilePicture: "https://example.com/profile.jpg"
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation errors
 *       401:
 *         description: Unauthorized
 */
router.patch(
  '/profile',
  auth,
  [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('dateOfBirth')
      .optional()
      .custom(value => {
        if (!value) return true; // Allow empty/null values

        // Try to parse the date
        let parsedDate;

        // If it's already a valid ISO string, use it
        if (typeof value === 'string' && value.includes('T')) {
          parsedDate = new Date(value);
        }
        // If it's a date string like "1990-01-01" or "1990/01/01"
        else if (typeof value === 'string') {
          parsedDate = new Date(value + 'T00:00:00.000Z');
        }
        // If it's already a Date object
        else if (value instanceof Date) {
          parsedDate = value;
        }
        // If it's a timestamp
        else if (typeof value === 'number') {
          parsedDate = new Date(value);
        }

        if (!parsedDate || isNaN(parsedDate.getTime())) {
          throw new Error(
            'Invalid date format. Please use YYYY-MM-DD format or ISO-8601 DateTime string.'
          );
        }

        return true;
      }),
    body('phone').optional().trim(),
    body('profilePicture')
      .optional()
      .isURL()
      .withMessage('Profile picture must be a valid URL'),
  ],
  usersController.updateProfile
);

// =====================================================
// DASHBOARD ROUTES (must be before /:id to avoid conflicts)
// =====================================================

/**
 * @swagger
 * /api/users/me/dashboard/stats:
 *   get:
 *     summary: Get user dashboard stats
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 */
router.get('/me/dashboard/stats', auth, usersController.getDashboardStats);

/**
 * @swagger
 * /api/users/me/dashboard/places:
 *   get:
 *     summary: Get places visited by user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Places visited retrieved successfully
 */
router.get('/me/dashboard/places', auth, usersController.getPlacesVisited);

/**
 * @swagger
 * /api/users/me/dashboard/reviews:
 *   get:
 *     summary: Get reviews written by user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User reviews retrieved successfully
 */
router.get('/me/dashboard/reviews', auth, usersController.getUserReviews);

/**
 * @swagger
 * /api/users/me/dashboard/past-rents:
 *   get:
 *     summary: Get past rents
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Past rents retrieved successfully
 */
router.get('/me/dashboard/past-rents', auth, usersController.getPastRents);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, ADMIN]
 *         description: Filter by user role
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', auth, authorize('ADMIN'), usersController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the user to get
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get('/:id', auth, usersController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update user by ID (partial update)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: First name of the user
 *               lastName:
 *                 type: string
 *                 description: Last name of the user
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: Date of birth
 *               phone:
 *                 type: string
 *                 description: Phone number
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *                 description: User role (admin only)
 *               isActive:
 *                 type: boolean
 *                 description: Active status (admin only)
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.patch(
  '/:id',
  auth,
  [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('dateOfBirth').optional().isISO8601(),
    body('phone').optional().trim(),
    body('role').optional().isIn(['USER', 'ADMIN']),
    body('isActive').optional().isBoolean(),
  ],
  usersController.updateUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.delete('/:id', auth, authorize('ADMIN'), usersController.deleteUser);

module.exports = router;
