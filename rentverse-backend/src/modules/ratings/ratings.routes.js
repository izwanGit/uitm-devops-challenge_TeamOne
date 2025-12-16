const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../../middleware/auth');
const ratingsController = require('./ratings.controller');

const router = express.Router();

/**
 * @swagger
 * /api/ratings:
 *   post:
 *     summary: Submit a property rating
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *               - rating
 *             properties:
 *               propertyId:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rating submitted
 *       403:
 *         description: Not authorized (did not rent)
 */
router.post(
    '/',
    auth,
    [
        body('propertyId').isUUID().withMessage('Invalid Property ID'),
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        body('comment').optional().trim(),
    ],
    ratingsController.createRating
);

/**
 * @swagger
 * /api/ratings/property/{propertyId}:
 *   get:
 *     summary: Get ratings for a property
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of ratings
 */
router.get('/property/:propertyId', ratingsController.getPropertyRatings);

module.exports = router;
