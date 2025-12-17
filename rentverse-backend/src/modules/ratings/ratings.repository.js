const { prisma } = require('../../config/database');

class RatingsRepository {
  async upsertRating(data) {
    return await prisma.propertyRating.upsert({
      where: {
        propertyId_userId: {
          propertyId: data.propertyId,
          userId: data.userId,
        },
      },
      update: {
        rating: data.rating,
        comment: data.comment,
        updatedAt: new Date(),
      },
      create: {
        userId: data.userId,
        propertyId: data.propertyId,
        rating: data.rating,
        comment: data.comment,
      },
    });
  }

  async findMany(params) {
    return await prisma.propertyRating.findMany(params);
  }

  async count(params) {
    return await prisma.propertyRating.count(params);
  }
}

module.exports = new RatingsRepository();
