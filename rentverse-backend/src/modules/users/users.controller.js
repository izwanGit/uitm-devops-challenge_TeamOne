const usersService = require('./users.service');
const { validationResult } = require('express-validator');

class UsersController {
  async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { role } = req.query;

      const result = await usersService.getAllUsers(page, limit, role);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async getUserById(req, res) {
    try {
      const userId = req.params.id;

      // Check access permissions
      await usersService.checkUserAccess(userId, req.user);

      const user = await usersService.getUserById(userId);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      console.error('Get user error:', error);

      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('Access denied')) {
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

  async updateUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const userId = req.params.id;
      const updateData = req.body;

      const user = await usersService.updateUser(userId, updateData, req.user);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user },
      });
    } catch (error) {
      console.error('Update user error:', error);

      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('Access denied')) {
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

  async createUser(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const userData = req.body;
      const newUser = await usersService.createUser(userData);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user: newUser },
      });
    } catch (error) {
      console.error('Create user error:', error);

      if (error.message === 'User with this email already exists') {
        return res.status(409).json({
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

  async deleteUser(req, res) {
    try {
      const userId = req.params.id;

      const result = await usersService.deleteUser(userId, req.user);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Delete user error:', error);

      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('cannot delete')) {
        return res.status(400).json({
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

  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await usersService.getUserById(userId);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      console.error('Get profile error:', error);

      if (error.message === 'User not found') {
        return res.status(404).json({
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

  async updateProfile(req, res) {
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
      const updateData = req.body;

      // Filter out role and isActive since users can't change these for themselves
      const allowedFields = [
        'firstName',
        'lastName',
        'dateOfBirth',
        'phone',
        'profilePicture',
      ];
      const profileUpdateData = {};

      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          if (field === 'dateOfBirth') {
            // Convert dateOfBirth to proper DateTime format for Prisma
            const dateValue = updateData[field];
            if (dateValue) {
              // Handle different date formats
              let parsedDate;

              // If it's already a valid ISO string, use it
              if (typeof dateValue === 'string' && dateValue.includes('T')) {
                parsedDate = new Date(dateValue);
              }
              // If it's a date string like "1990-01-01" or "1990/01/01"
              else if (typeof dateValue === 'string') {
                // Add time component to make it a full DateTime
                parsedDate = new Date(dateValue + 'T00:00:00.000Z');
              }
              // If it's already a Date object
              else if (dateValue instanceof Date) {
                parsedDate = dateValue;
              }
              // If it's a timestamp
              else if (typeof dateValue === 'number') {
                parsedDate = new Date(dateValue);
              }

              // Validate the parsed date
              if (!parsedDate || isNaN(parsedDate.getTime())) {
                throw new Error(
                  'Invalid date format for dateOfBirth. Please use YYYY-MM-DD format or ISO-8601 DateTime string.'
                );
              }

              // Store as ISO string for Prisma DateTime
              profileUpdateData[field] = parsedDate.toISOString();
            } else {
              profileUpdateData[field] = null;
            }
          } else {
            profileUpdateData[field] = updateData[field];
          }
        }
      });

      const user = await usersService.updateUser(
        userId,
        profileUpdateData,
        req.user
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
      });
    } catch (error) {
      console.error('Update profile error:', error);

      if (error.message === 'User not found') {
        return res.status(404).json({
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

  /**
   * Get user dashboard stats
   * GET /api/users/me/dashboard/stats
   */
  async getDashboardStats(req, res) {
    try {
      const userId = req.user.id;
      const stats = await usersService.getDashboardStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard stats',
      });
    }
  }

  /**
   * Get places visited by user
   * GET /api/users/me/dashboard/places
   */
  async getPlacesVisited(req, res) {
    try {
      const userId = req.user.id;
      const places = await usersService.getPlacesVisited(userId);

      res.json({
        success: true,
        data: { places },
      });
    } catch (error) {
      console.error('Get places visited error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get places visited',
      });
    }
  }

  /**
   * Get reviews written by user
   * GET /api/users/me/dashboard/reviews
   */
  async getUserReviews(req, res) {
    try {
      const userId = req.user.id;
      const reviews = await usersService.getUserReviews(userId);

      res.json({
        success: true,
        data: { reviews },
      });
    } catch (error) {
      console.error('Get user reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user reviews',
      });
    }
  }

  /**
   * Get past rents
   * GET /api/users/me/dashboard/past-rents
   */
  async getPastRents(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 10;
      const pastRents = await usersService.getPastRents(userId, limit);

      res.json({
        success: true,
        data: { pastRents },
      });
    } catch (error) {
      console.error('Get past rents error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get past rents',
      });
    }
  }
}

module.exports = new UsersController();
