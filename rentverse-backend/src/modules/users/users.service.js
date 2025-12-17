const usersRepository = require('./users.repository');

class UsersService {
  async getAllUsers(page = 1, limit = 10, role = null) {
    const skip = (page - 1) * limit;
    const where = {};

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      usersRepository.findMany({ where, skip, take: limit }),
      usersRepository.count(where),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  async getUserById(id) {
    const user = await usersRepository.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUser(id, updateData, requestingUser) {
    // Check if user exists
    const existingUser = await usersRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Authorization check
    if (requestingUser.role !== 'ADMIN' && requestingUser.id !== id) {
      throw new Error('Access denied. You can only update your own profile.');
    }

    // Only admins can change role and isActive
    if (
      (updateData.role || updateData.isActive !== undefined) &&
      requestingUser.role !== 'ADMIN'
    ) {
      throw new Error(
        'Access denied. Only admins can change role or active status.'
      );
    }

    // Prepare update data
    const cleanUpdateData = {};
    if (updateData.firstName !== undefined)
      cleanUpdateData.firstName = updateData.firstName;
    if (updateData.lastName !== undefined)
      cleanUpdateData.lastName = updateData.lastName;
    if (updateData.dateOfBirth !== undefined)
      cleanUpdateData.dateOfBirth = updateData.dateOfBirth;
    if (updateData.phone !== undefined)
      cleanUpdateData.phone = updateData.phone;
    if (updateData.profilePicture !== undefined)
      cleanUpdateData.profilePicture = updateData.profilePicture;
    if (updateData.role && requestingUser.role === 'ADMIN')
      cleanUpdateData.role = updateData.role;
    if (updateData.isActive !== undefined && requestingUser.role === 'ADMIN') {
      cleanUpdateData.isActive = updateData.isActive;
    }

    return await usersRepository.update(id, cleanUpdateData);
  }

  async deleteUser(id, requestingUser) {
    // Check if user exists
    const existingUser = await usersRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Prevent admin from deleting themselves
    if (requestingUser.id === id) {
      throw new Error('You cannot delete your own account');
    }

    await usersRepository.delete(id);
    return { message: 'User deleted successfully' };
  }

  async createUser(userData) {
    const bcryptjs = require('bcryptjs');

    // Check if user already exists
    const existingUser = await usersRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcryptjs.hash(userData.password, saltRounds);

    // Create user with new schema fields
    const newUser = await usersRepository.create({
      email: userData.email,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : null,
      phone: userData.phone,
      password: hashedPassword,
      role: userData.role || 'USER',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
    });

    return newUser;
  }

  async checkUserAccess(userId, requestingUser) {
    // Users can only view their own profile, admins can view any profile
    if (requestingUser.role !== 'ADMIN' && requestingUser.id !== userId) {
      throw new Error('Access denied. You can only view your own profile.');
    }
    return true;
  }

  /**
   * Get user dashboard stats
   */
  async getDashboardStats(userId) {
    const { prisma } = require('../../config/database');

    const [totalStays, placesResult, reviewsWritten, user] = await Promise.all([
      // Count completed leases
      prisma.lease.count({
        where: {
          tenantId: userId,
          status: { in: ['APPROVED', 'ACTIVE', 'COMPLETED'] },
        },
      }),
      // Count unique cities
      prisma.lease.findMany({
        where: {
          tenantId: userId,
          status: { in: ['APPROVED', 'ACTIVE', 'COMPLETED'] },
        },
        select: {
          property: {
            select: { city: true },
          },
        },
        distinct: ['propertyId'],
      }),
      // Count reviews written
      prisma.propertyRating.count({
        where: { userId },
      }),
      // Get member since date
      prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      }),
    ]);

    // Calculate unique places
    const uniqueCities = new Set(placesResult.map(l => l.property.city));

    return {
      totalStays,
      uniquePlaces: uniqueCities.size,
      reviewsWritten,
      memberSince: user?.createdAt || null,
    };
  }

  /**
   * Get places the user has stayed
   */
  async getPlacesVisited(userId) {
    const { prisma } = require('../../config/database');

    const leases = await prisma.lease.findMany({
      where: {
        tenantId: userId,
        status: { in: ['APPROVED', 'ACTIVE', 'COMPLETED'] },
      },
      select: {
        startDate: true,
        property: {
          select: {
            city: true,
            state: true,
            images: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    // Group by city
    const placesMap = new Map();
    leases.forEach(lease => {
      const city = lease.property.city;
      const key = `${city}-${lease.property.state}`;
      if (!placesMap.has(key)) {
        placesMap.set(key, {
          city: lease.property.city,
          state: lease.property.state,
          count: 0,
          lastStay: lease.startDate,
          images: [],
        });
      }
      const place = placesMap.get(key);
      place.count++;
      if (lease.property.images && lease.property.images.length > 0) {
        // Add unique images (up to 3)
        if (
          place.images.length < 3 &&
          !place.images.includes(lease.property.images[0])
        ) {
          place.images.push(lease.property.images[0]);
        }
      }
    });

    return Array.from(placesMap.values());
  }

  /**
   * Get reviews written by user
   */
  async getUserReviews(userId) {
    const { prisma } = require('../../config/database');

    const reviews = await prisma.propertyRating.findMany({
      where: { userId },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            images: true,
          },
        },
      },
      orderBy: { ratedAt: 'desc' },
      take: 10,
    });

    return reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      ratedAt: review.ratedAt,
      property: {
        id: review.property.id,
        title: review.property.title,
        city: review.property.city,
        image: review.property.images?.[0] || null,
      },
    }));
  }

  /**
   * Get past/completed rents
   */
  async getPastRents(userId, limit = 10) {
    const { prisma } = require('../../config/database');

    const pastRents = await prisma.lease.findMany({
      where: {
        tenantId: userId,
        status: { in: ['APPROVED', 'ACTIVE', 'COMPLETED'] },
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            state: true,
            images: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
      take: limit,
    });

    // Check if user has rated these properties
    const propertyIds = pastRents.map(r => r.property.id);
    const userRatings = await prisma.propertyRating.findMany({
      where: {
        userId,
        propertyId: { in: propertyIds },
      },
      select: {
        propertyId: true,
        rating: true,
      },
    });

    const ratingMap = new Map();
    userRatings.forEach(r => ratingMap.set(r.propertyId, r.rating));

    return pastRents.map(rent => ({
      id: rent.id,
      startDate: rent.startDate,
      endDate: rent.endDate,
      status: rent.status,
      myRating: ratingMap.get(rent.property.id) || null, // null if not rated, int if rated
      property: {
        id: rent.property.id,
        title: rent.property.title,
        city: rent.property.city,
        state: rent.property.state,
        image: rent.property.images?.[0] || null,
      },
    }));
  }
}

module.exports = new UsersService();
