const bookingsService = require('./bookings.service');
const { validationResult } = require('express-validator');

class BookingsController {
  /**
   * Create new booking
   */
  async createBooking(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const booking = await bookingsService.createBooking(
        req.body,
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: { booking },
      });
    } catch (error) {
      console.error('Create booking error:', error);

      if (
        error.message.includes('not found') ||
        error.message.includes('cannot book')
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message.includes('not available') ||
        error.message.includes('already booked') ||
        error.message.includes('cannot be in the past')
      ) {
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

  /**
   * Get user's bookings (as tenant)
   */
  async getUserBookings(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await bookingsService.getUserBookings(
        req.user.id,
        page,
        limit
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get user bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get owner's bookings (as landlord)
   */
  async getOwnerBookings(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;

      const result = await bookingsService.getOwnerBookings(
        req.user.id,
        page,
        limit,
        status
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get owner bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(req, res) {
    try {
      const bookingId = req.params.id;
      const booking = await bookingsService.getBookingById(
        bookingId,
        req.user.id
      );

      res.json({
        success: true,
        data: { booking },
      });
    } catch (error) {
      console.error('Get booking error:', error);

      if (error.message === 'Booking not found') {
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

  /**
   * Approve booking (owner only)
   */
  async approveBooking(req, res) {
    try {
      const bookingId = req.params.id;
      const { notes } = req.body;

      const booking = await bookingsService.approveBooking(
        bookingId,
        req.user.id,
        notes
      );

      res.json({
        success: true,
        message: 'Booking approved successfully',
        data: { booking },
      });
    } catch (error) {
      console.error('Approve booking error:', error);

      if (error.message === 'Booking not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message.includes('Access denied') ||
        error.message.includes('Only PENDING')
      ) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('no longer available')) {
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

  /**
   * Reject booking (owner only)
   */
  async rejectBooking(req, res) {
    try {
      const bookingId = req.params.id;
      const { reason } = req.body;

      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required',
        });
      }

      const booking = await bookingsService.rejectBooking(
        bookingId,
        req.user.id,
        reason
      );

      res.json({
        success: true,
        message: 'Booking rejected successfully',
        data: { booking },
      });
    } catch (error) {
      console.error('Reject booking error:', error);

      if (error.message === 'Booking not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message.includes('Access denied') ||
        error.message.includes('Only PENDING')
      ) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('required')) {
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

  /**
   * Get property booked periods (for calendar view)
   */
  async getPropertyBookedPeriods(req, res) {
    try {
      const propertyId = req.params.propertyId;
      const startDate = req.query.startDate
        ? new Date(req.query.startDate)
        : new Date();
      const endDate = req.query.endDate
        ? new Date(req.query.endDate)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default 1 year from now

      const bookedPeriods = await bookingsService.getPropertyBookedPeriods(
        propertyId,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: { bookedPeriods },
      });
    } catch (error) {
      console.error('Get property booked periods error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get rental agreement PDF for a booking
   */
  async getRentalAgreementPDF(req, res) {
    try {
      const { id } = req.params; // Changed from bookingId to id

      const result = await bookingsService.getRentalAgreementPDF(
        id, // Use id instead of bookingId
        req.user.id
      );

      res.json(result);
    } catch (error) {
      console.error('Get rental agreement PDF error:', error);

      if (
        error.message.includes('not found') ||
        error.message.includes('access denied')
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('only available for approved')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve rental agreement PDF',
      });
    }
  }

  /**
   * Download rental agreement PDF file directly
   */
  async downloadRentalAgreementPDF(req, res) {
    try {
      const { id } = req.params;

      const result = await bookingsService.downloadRentalAgreementPDF(
        id,
        req.user.id
      );

      if (result.isLocal) {
        // For local files, send the file directly
        const path = require('path');
        const fs = require('fs');

        const fullPath = path.join(result.filePath);

        if (!fs.existsSync(fullPath)) {
          return res.status(404).json({
            success: false,
            message: 'PDF file not found on server',
          });
        }

        // Set appropriate headers for PDF viewing
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `inline; filename="${result.fileName}"`
        );
        res.setHeader('Cache-Control', 'public, max-age=31536000');

        // Stream the file
        const fileStream = fs.createReadStream(fullPath);
        fileStream.pipe(res);
      } else {
        // Fallback for any remaining remote URLs (though logic is now local-first)
        res.redirect(result.url);
      }
    } catch (error) {
      console.error('Download rental agreement PDF error:', error);

      if (
        error.message.includes('not found') ||
        error.message.includes('access denied')
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('only available for approved')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to download rental agreement PDF',
      });
    }
  }
}

module.exports = new BookingsController();
