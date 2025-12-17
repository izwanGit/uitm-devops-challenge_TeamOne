const ratingsRepository = require('./ratings.repository');
const { prisma } = require('../../config/database');

class RatingsService {
  /**
   * Create or update a property rating
   */
  async createRating(userId, ratingData) {
    const { propertyId, rating, comment } = ratingData;

    // 1. Verify user has rented this property
    const hasRented = await prisma.lease.findFirst({
      where: {
        tenantId: userId,
        propertyId: propertyId,
        status: { in: ['APPROVED', 'ACTIVE', 'COMPLETED'] },
      },
    });

    if (!hasRented) {
      throw new Error('You can only rate properties you have rented.');
    }

    // 2. Create or Update Rating (Upsert)
    const savedRating = await ratingsRepository.upsertRating({
      userId,
      propertyId,
      rating,
      comment,
    });

    // 3. Update Property Average Rating
    await this.updatePropertyAggregateRating(propertyId);

    return savedRating;
  }

  /**
   * Get ratings for a property
   */
  async getPropertyRatings(propertyId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [ratings, total] = await Promise.all([
      ratingsRepository.findMany({
        where: { propertyId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
            },
          },
        },
        orderBy: { ratedAt: 'desc' },
        skip,
        take: limit,
      }),
      ratingsRepository.count({ where: { propertyId } }),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      ratings,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  /**
   * Helper: Recalculate and update property average rating
   */
  async updatePropertyAggregateRating(propertyId) {
    const aggregations = await prisma.propertyRating.aggregate({
      where: { propertyId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const averageRating = aggregations._avg.rating || 0;
    const totalRatings = aggregations._count.rating || 0;

    await prisma.property.update({
      where: { id: propertyId },
      data: {
        averageRating,
        totalRatings,
      },
    });
  }
}

module.exports = new RatingsService();
