const ratingsService = require('./ratings.service');
const { validationResult } = require('express-validator');

class RatingsController {
    async createRating(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array(),
                });
            }

            const userId = req.user.id;
            const ratingData = req.body;

            const rating = await ratingsService.createRating(userId, ratingData);

            res.status(201).json({
                success: true,
                message: 'Rating submitted successfully',
                data: { rating },
            });
        } catch (error) {
            console.error('Create rating error:', error);
            if (error.message.includes('only rate properties you have rented')) {
                return res.status(403).json({
                    success: false,
                    message: error.message,
                });
            }
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }

    async getPropertyRatings(req, res) {
        try {
            const propertyId = req.params.propertyId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await ratingsService.getPropertyRatings(propertyId, page, limit);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            console.error('Get property ratings error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }
}

module.exports = new RatingsController();
