const propertiesRepository = require('./properties.repository');
const PropertyViewsRepository = require('../propertyViews/propertyViews.repository');
const { generateUniquePropertyCode } = require('../../utils/codeGenerator');
const { prisma } = require('../../config/database');

class PropertiesService {
  constructor() {
    this.propertyViewsRepository = new PropertyViewsRepository();
  }
  // Helper function to generate Google Maps URL
  generateMapsUrl(latitude, longitude) {
    if (!latitude || !longitude) return null;
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }

  // Helper function to add maps URL to property object
  addMapsUrlToProperty(property) {
    if (property) {
      if (property.latitude && property.longitude) {
        property.mapsUrl = this.generateMapsUrl(
          property.latitude,
          property.longitude
        );
      } else {
        property.mapsUrl = null;
      }
    }
    return property;
  }

  // Helper function to add maps URL to multiple properties
  addMapsUrlToProperties(properties) {
    return properties.map(property => this.addMapsUrlToProperty(property));
  }

  // Helper function to add view count to property
  async addViewCountToProperty(property) {
    if (property) {
      const viewCount = await this.propertyViewsRepository.getViewCount(
        property.id
      );
      property.viewCount = viewCount;
    }
    return property;
  }

  // Helper function to add view count to multiple properties
  async addViewCountToProperties(properties) {
    if (!properties || properties.length === 0) return properties;

    const propertyIds = properties.map(p => p.id);
    const viewCounts =
      await this.propertyViewsRepository.getViewCounts(propertyIds);

    return properties.map(property => ({
      ...property,
      viewCount: viewCounts[property.id] || 0,
    }));
  }

  // Helper function to add rating stats to property
  async addRatingStatsToProperty(property) {
    if (property) {
      const ratingStats = await this.propertyViewsRepository.getRatingStats(
        property.id
      );
      property.averageRating = ratingStats.averageRating;
      property.totalRatings = ratingStats.totalRatings;
    }
    return property;
  }

  // Helper function to add rating stats to multiple properties
  async addRatingStatsToProperties(properties) {
    if (!properties || properties.length === 0) return properties;

    const propertyIds = properties.map(p => p.id);
    const ratingStats =
      await this.propertyViewsRepository.getRatingStatsMultiple(propertyIds);

    return properties.map(property => ({
      ...property,
      averageRating: ratingStats[property.id]?.averageRating || 0,
      totalRatings: ratingStats[property.id]?.totalRatings || 0,
    }));
  }

  // Helper function to add favorite info to property (for authenticated users)
  async addFavoriteInfoToProperty(property, userId = null) {
    if (property && userId) {
      const [isFavorited, favoriteCount] = await Promise.all([
        this.propertyViewsRepository.isFavorited(property.id, userId),
        this.propertyViewsRepository.getFavoriteCount(property.id),
      ]);
      property.isFavorited = isFavorited;
      property.favoriteCount = favoriteCount;
    } else if (property) {
      // For non-authenticated users, just add favorite count
      const favoriteCount = await this.propertyViewsRepository.getFavoriteCount(
        property.id
      );
      property.isFavorited = false;
      property.favoriteCount = favoriteCount;
    }
    return property;
  }

  // Helper function to add favorite info to multiple properties
  async addFavoriteInfoToProperties(properties, userId = null) {
    if (!properties || properties.length === 0) return properties;

    const propertyIds = properties.map(p => p.id);
    const [favoriteStatus, favoriteCounts] = await Promise.all([
      userId
        ? this.propertyViewsRepository.getFavoriteStatus(propertyIds, userId)
        : null,
      this.propertyViewsRepository.getFavoriteCounts(propertyIds),
    ]);

    return properties.map(property => ({
      ...property,
      isFavorited: favoriteStatus ? favoriteStatus[property.id] : false,
      favoriteCount: favoriteCounts[property.id] || 0,
    }));
  }

  async getAllProperties(
    page = 1,
    limit = 10,
    filters = {},
    userId = null,
    userRole = 'USER'
  ) {
    const skip = (page - 1) * limit;
    const where = {};

    // For non-admin users, only show APPROVED properties
    if (userRole !== 'ADMIN') {
      where.status = 'APPROVED';
    }

    // Apply filters
    if (filters.propertyTypeId) where.propertyTypeId = filters.propertyTypeId;
    if (filters.city) {
      where.OR = [
        { city: { contains: filters.city, mode: 'insensitive' } },
        { state: { contains: filters.city, mode: 'insensitive' } },
        { address: { contains: filters.city, mode: 'insensitive' } },
      ];
    }
    if (filters.available !== undefined)
      where.isAvailable = filters.available === 'true';
    if (filters.bedrooms) where.bedrooms = parseInt(filters.bedrooms);
    // Only allow admin to filter by status
    if (filters.status && userRole === 'ADMIN') where.status = filters.status;
    if (filters.furnished !== undefined)
      where.furnished = filters.furnished === 'true';

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) where.price.lte = parseFloat(filters.maxPrice);
    }

    const [properties, total] = await Promise.all([
      propertiesRepository.findMany({ where, skip, take: limit }),
      propertiesRepository.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    // Add Google Maps URL, view count, rating stats, and favorite info to each property
    const propertiesWithMapsUrl = this.addMapsUrlToProperties(properties);
    const propertiesWithViewCount = await this.addViewCountToProperties(
      propertiesWithMapsUrl
    );
    const propertiesWithRatings = await this.addRatingStatsToProperties(
      propertiesWithViewCount
    );
    const propertiesWithFavorites = await this.addFavoriteInfoToProperties(
      propertiesWithRatings,
      userId
    );

    // Calculate average longitude and latitude for maps
    const validCoordinates = properties.filter(
      property => property.latitude !== null && property.longitude !== null
    );

    let maps = null;
    if (validCoordinates.length > 0) {
      const totalLat = validCoordinates.reduce(
        (sum, property) => sum + parseFloat(property.latitude),
        0
      );
      const totalLng = validCoordinates.reduce(
        (sum, property) => sum + parseFloat(property.longitude),
        0
      );

      const latMean = totalLat / validCoordinates.length;
      const longMean = totalLng / validCoordinates.length;
      const depth = validCoordinates.length;

      maps = {
        latMean: latMean,
        longMean: longMean,
        depth: depth,
      };
    }

    return {
      properties: propertiesWithFavorites,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
      maps,
    };
  }

  async getPropertyById(id, userId = null) {
    const property = await propertiesRepository.findById(id);

    if (!property) {
      throw new Error('Property not found');
    }

    // Add Google Maps URL, view count, rating stats, and favorite info to the property
    const propertyWithMapsUrl = this.addMapsUrlToProperty(property);
    const propertyWithViewCount =
      await this.addViewCountToProperty(propertyWithMapsUrl);
    const propertyWithRatings = await this.addRatingStatsToProperty(
      propertyWithViewCount
    );
    return await this.addFavoriteInfoToProperty(propertyWithRatings, userId);
  }

  async getPropertyByCode(code, userId = null) {
    const property = await propertiesRepository.findByCode(code);

    if (!property) {
      throw new Error('Property not found');
    }

    // Add Google Maps URL, view count, rating stats, and favorite info to the property
    const propertyWithMaps = this.addMapsUrlToProperty(property);
    const propertyWithViewCount =
      await this.addViewCountToProperty(propertyWithMaps);
    const propertyWithRatings = await this.addRatingStatsToProperty(
      propertyWithViewCount
    );
    return await this.addFavoriteInfoToProperty(propertyWithRatings, userId);
  }

  async createProperty(propertyData, ownerId) {
    // 🆕 Check auto-approve status
    const PropertiesController = require('./properties.controller');
    const autoApproveStatus =
      PropertiesController.constructor.getAutoApproveStatus();

    console.log('🔍 Property auto-approve status:', autoApproveStatus);

    // Generate unique property code if not provided
    let propertyCode = propertyData.code;
    if (!propertyCode) {
      // Get property type code for better code generation
      let propertyTypeCode = '';
      if (propertyData.propertyTypeId) {
        const propertyType = await prisma.propertyType.findUnique({
          where: { id: propertyData.propertyTypeId },
          select: { code: true },
        });
        propertyTypeCode = propertyType?.code || '';
      }

      propertyCode = await generateUniquePropertyCode(
        propertyData.title,
        propertyTypeCode,
        code => propertiesRepository.codeExists(code)
      );
    }

    // 🆕 Determine status based on auto-approve setting
    let propertyStatus = 'PENDING_REVIEW'; // Default
    if (autoApproveStatus.isEnabled) {
      propertyStatus = 'APPROVED'; // Auto-approve enabled
      console.log(
        '✅ Auto-approve is ON - Property will be approved automatically'
      );
    } else {
      console.log('⏳ Auto-approve is OFF - Property requires manual approval');
    }

    const cleanPropertyData = {
      code: propertyCode,
      title: propertyData.title,
      description: propertyData.description,
      address: propertyData.address,
      city: propertyData.city,
      state: propertyData.state,
      country: propertyData.country || 'ID',
      zipCode: propertyData.zipCode,
      placeId: propertyData.placeId,
      latitude: propertyData.latitude
        ? parseFloat(propertyData.latitude)
        : null,
      longitude: propertyData.longitude
        ? parseFloat(propertyData.longitude)
        : null,
      price: parseFloat(propertyData.price),
      currencyCode: propertyData.currencyCode || 'MYR',
      bedrooms: propertyData.bedrooms || 0,
      bathrooms: propertyData.bathrooms || 0,
      areaSqm: propertyData.areaSqm ? parseFloat(propertyData.areaSqm) : null,
      furnished: propertyData.furnished || false,
      isAvailable:
        propertyData.isAvailable !== undefined
          ? propertyData.isAvailable
          : true,
      status: propertyData.status || propertyStatus, // 🆕 Use auto-approve logic
      images: propertyData.images || [],
      propertyTypeId: propertyData.propertyTypeId,
      ownerId,
    };

    // Create property and approval record in transaction
    const result = await prisma.$transaction(async tx => {
      // Create property first
      const property = await tx.property.create({
        data: cleanPropertyData,
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              name: true,
            },
          },
          propertyType: true,
          amenities: {
            include: {
              amenity: true,
            },
          },
        },
      });

      // Handle amenities if provided
      if (propertyData.amenityIds && propertyData.amenityIds.length > 0) {
        const amenityConnections = propertyData.amenityIds.map(amenityId => ({
          propertyId: property.id,
          amenityId: amenityId,
        }));

        await tx.propertyAmenity.createMany({
          data: amenityConnections,
        });
      }

      // 🆕 Handle approval record based on auto-approve status
      if (property.status === 'PENDING_REVIEW') {
        // Manual approval required - create PENDING approval record
        await tx.listingApproval.create({
          data: {
            propertyId: property.id,
            status: 'PENDING',
          },
        });
        console.log('📝 Created PENDING approval record for manual review');
      } else if (property.status === 'APPROVED') {
        // Auto-approved - create APPROVED approval record
        await tx.listingApproval.create({
          data: {
            propertyId: property.id,
            status: 'APPROVED',
            reviewerId: null, // System auto-approval
            notes: 'Auto-approved by system (auto-approve enabled)',
            reviewedAt: new Date(),
          },
        });
        console.log('✅ Created APPROVED approval record (auto-approved)');
      }

      return property;
    });

    // Add Google Maps URL to the created property
    return this.addMapsUrlToProperty(result);
  }

  async updateProperty(id, updateData, requestingUser) {
    // Check if property exists
    const existingProperty = await propertiesRepository.findById(id);
    if (!existingProperty) {
      throw new Error('Property not found');
    }

    // Only property owner or admin can update
    if (
      requestingUser.role !== 'ADMIN' &&
      existingProperty.ownerId !== requestingUser.id
    ) {
      throw new Error(
        'Access denied. You can only update your own properties.'
      );
    }

    // Prepare update data
    const cleanUpdateData = {};
    const allowedFields = [
      'title',
      'description',
      'address',
      'city',
      'state',
      'country',
      'zipCode',
      'placeId',
      'latitude',
      'longitude',
      'price',
      'currencyCode',
      'bedrooms',
      'bathrooms',
      'areaSqm',
      'furnished',
      'isAvailable',
      'status',
      'images',
      'propertyTypeId',
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (
          field === 'price' ||
          field === 'areaSqm' ||
          field === 'latitude' ||
          field === 'longitude'
        ) {
          cleanUpdateData[field] = parseFloat(updateData[field]);
        } else if (field === 'bedrooms' || field === 'bathrooms') {
          cleanUpdateData[field] = parseInt(updateData[field]);
        } else if (field === 'furnished' || field === 'isAvailable') {
          cleanUpdateData[field] = Boolean(updateData[field]);
        } else {
          cleanUpdateData[field] = updateData[field];
        }
      }
    }

    await propertiesRepository.update(id, cleanUpdateData);

    // Handle amenities update if provided
    if (updateData.amenityIds !== undefined) {
      // Delete existing amenity connections
      await prisma.propertyAmenity.deleteMany({
        where: { propertyId: id },
      });

      // Add new amenity connections if provided
      if (updateData.amenityIds && updateData.amenityIds.length > 0) {
        const amenityConnections = updateData.amenityIds.map(amenityId => ({
          propertyId: id,
          amenityId: amenityId,
        }));

        await prisma.propertyAmenity.createMany({
          data: amenityConnections,
        });
      }
    }

    // Get updated property with all relations
    const finalProperty = await propertiesRepository.findById(id);

    // Add Google Maps URL to the updated property
    return this.addMapsUrlToProperty(finalProperty);
  }

  async deleteProperty(id, requestingUser) {
    // Check if property exists
    const existingProperty = await propertiesRepository.findById(id);
    if (!existingProperty) {
      throw new Error('Property not found');
    }

    // Only property owner or admin can delete
    if (
      requestingUser.role !== 'ADMIN' &&
      existingProperty.ownerId !== requestingUser.id
    ) {
      throw new Error(
        'Access denied. You can only delete your own properties.'
      );
    }

    await propertiesRepository.delete(id);
    return { message: 'Property deleted successfully' };
  }

  async getGeoJSON(params) {
    try {
      const {
        minLng,
        minLat,
        maxLng,
        maxLat,
        limit,
        centerLng,
        centerLat,
        query,
      } = params;

      const properties = await propertiesRepository.findForGeoJSON({
        minLng,
        minLat,
        maxLng,
        maxLat,
        limit,
        centerLng,
        centerLat,
        query,
      });

      // Transform to GeoJSON format
      const features = properties.map(property => {
        // Format price for display
        const formattedPrice = this.formatPrice(
          property.price,
          property.currencyCode
        );

        // Handle thumbnail - either from raw query result or from images array
        let thumbnail = null;
        if (property.thumbnail) {
          thumbnail = property.thumbnail;
        } else if (property.images && property.images.length > 0) {
          thumbnail = property.images[0];
        }

        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              parseFloat(property.longitude),
              parseFloat(property.latitude),
            ],
          },
          properties: {
            id: property.id,
            code: property.code,
            title: property.title,
            price: parseFloat(property.price),
            currencyCode: property.currencyCode,
            priceFormatted: formattedPrice,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            areaSqm: property.areaSqm ? parseFloat(property.areaSqm) : null,
            propertyType: property.propertyType?.name || property.propertyType, // Handle both object and string
            city: property.city,
            furnished: property.furnished,
            isAvailable: property.isAvailable,
            thumbnail,
          },
        };
      });

      return {
        type: 'FeatureCollection',
        features,
      };
    } catch (error) {
      console.error('Error in getGeoJSON service:', error);
      throw error;
    }
  }

  // Helper method to format price
  formatPrice(price, currencyCode = 'MYR') {
    const numPrice = parseFloat(price);

    if (currencyCode === 'MYR') {
      return `RM ${numPrice.toLocaleString('ms-MY')}`;
    } else if (currencyCode === 'USD') {
      return `$${numPrice.toLocaleString('en-US')}`;
    } else {
      return `${currencyCode} ${numPrice.toLocaleString()}`;
    }
  }

  async getFeaturedProperties(page = 1, limit = 8, userId = null) {
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      propertiesRepository.findFeaturedProperties({ skip, take: limit }),
      propertiesRepository.countFeaturedProperties(),
    ]);

    const pages = Math.ceil(total / limit);

    // Add Google Maps URL, view count, rating stats, and favorite info to each property
    const propertiesWithMapsUrl = this.addMapsUrlToProperties(properties);
    const propertiesWithViewCount = await this.addViewCountToProperties(
      propertiesWithMapsUrl
    );
    const propertiesWithRatings = await this.addRatingStatsToProperties(
      propertiesWithViewCount
    );
    const propertiesWithFavorites = await this.addFavoriteInfoToProperties(
      propertiesWithRatings,
      userId
    );

    return {
      properties: propertiesWithFavorites,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  /**
   * Log property view
   * @param {string} propertyId - Property ID
   * @param {Object} viewData - View data
   * @param {string} [viewData.userId] - User ID (optional for guests)
   * @param {string} [viewData.ipAddress] - IP address
   * @param {string} [viewData.userAgent] - User agent
   * @returns {Promise<Object>} Created view record
   */
  async logPropertyView(propertyId, viewData = {}) {
    // First check if property exists
    const property = await propertiesRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Log the view directly without anti-spam check
    await this.propertyViewsRepository.logView({
      propertyId,
      userId: viewData.userId || null,
      ipAddress: viewData.ipAddress || null,
      userAgent: viewData.userAgent || null,
    });

    // Return property with updated view count and all related data
    const propertyWithMapsUrl = this.addMapsUrlToProperty(property);
    const propertyWithViewCount =
      await this.addViewCountToProperty(propertyWithMapsUrl);
    const propertyWithRatings = await this.addRatingStatsToProperty(
      propertyWithViewCount
    );
    const propertyWithFavorites = await this.addFavoriteInfoToProperty(
      propertyWithRatings,
      viewData.userId
    );

    return {
      property: propertyWithFavorites,
      viewLogged: true,
      message: 'View logged successfully',
    };
  }

  /**
   * Get property view statistics
   * @param {string} propertyId - Property ID
   * @param {number} [days=30] - Number of days to look back
   * @returns {Promise<Object>} View statistics
   */
  async getPropertyViewStats(propertyId, days = 30) {
    const property = await propertiesRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    return await this.propertyViewsRepository.getViewStats(propertyId, days);
  }

  // ==================== RATING METHODS ====================

  /**
   * Create or update property rating
   * @param {string} propertyId - Property ID
   * @param {string} userId - User ID
   * @param {Object} ratingData - Rating data
   * @param {number} ratingData.rating - Rating (1-5)
   * @param {string} [ratingData.comment] - Optional comment
   * @returns {Promise<Object>} Created/updated rating
   */
  async createOrUpdateRating(propertyId, userId, ratingData) {
    // First check if property exists
    const property = await propertiesRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Validate rating value
    const { rating, comment } = ratingData;
    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Create or update rating
    const ratingRecord =
      await this.propertyViewsRepository.createOrUpdateRating({
        propertyId,
        userId,
        rating: parseInt(rating),
        comment: comment || null,
      });

    return {
      rating: ratingRecord,
      message: 'Rating submitted successfully',
    };
  }

  /**
   * Get property ratings with pagination
   * @param {string} propertyId - Property ID
   * @param {Object} options - Options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=10] - Items per page
   * @returns {Promise<Object>} Ratings with pagination
   */
  async getPropertyRatings(propertyId, options = {}) {
    const property = await propertiesRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    const { page = 1, limit = 10 } = options;
    return await this.propertyViewsRepository.getPropertyRatings({
      propertyId,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }

  /**
   * Get user's rating for a property
   * @param {string} propertyId - Property ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User's rating or null
   */
  async getUserRating(propertyId, userId) {
    const property = await propertiesRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    return await this.propertyViewsRepository.getUserRating(propertyId, userId);
  }

  /**
   * Delete user's rating
   * @param {string} propertyId - Property ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Result
   */
  async deleteRating(propertyId, userId) {
    const property = await propertiesRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    const existingRating = await this.propertyViewsRepository.getUserRating(
      propertyId,
      userId
    );
    if (!existingRating) {
      throw new Error('Rating not found');
    }

    await this.propertyViewsRepository.deleteRating(propertyId, userId);

    return {
      message: 'Rating deleted successfully',
    };
  }

  /**
   * Get detailed rating statistics for a property
   * @param {string} propertyId - Property ID
   * @returns {Promise<Object>} Detailed rating statistics
   */
  async getDetailedRatingStats(propertyId) {
    const property = await propertiesRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    return await this.propertyViewsRepository.getRatingStats(propertyId);
  }

  // ==================== FAVORITE METHODS ====================

  /**
   * Add or remove property from favorites
   * @param {string} propertyId - Property ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Result
   */
  async toggleFavorite(propertyId, userId) {
    // First check if property exists
    const property = await propertiesRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    const isFavorited = await this.propertyViewsRepository.isFavorited(
      propertyId,
      userId
    );

    if (isFavorited) {
      // Remove from favorites
      await this.propertyViewsRepository.removeFromFavorites(
        propertyId,
        userId
      );

      return {
        action: 'removed',
        isFavorited: false,
        favoriteCount:
          await this.propertyViewsRepository.getFavoriteCount(propertyId),
        message: 'Property removed from favorites',
      };
    } else {
      // Add to favorites
      await this.propertyViewsRepository.addToFavorites(propertyId, userId);

      return {
        action: 'added',
        isFavorited: true,
        favoriteCount:
          await this.propertyViewsRepository.getFavoriteCount(propertyId),
        message: 'Property added to favorites',
      };
    }
  }

  /**
   * Get user's favorite properties
   * @param {string} userId - User ID
   * @param {Object} options - Options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=10] - Items per page
   * @returns {Promise<Object>} Favorite properties with pagination
   */
  async getUserFavorites(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const result = await this.propertyViewsRepository.getUserFavorites({
      userId,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    // Extract properties from favorites (which contains {favoritedAt, property})
    const properties = result.favorites.map(fav => fav.property);

    // Add Maps URL, view count, rating stats, and favorite info to each property
    const propertiesWithMapsUrl = this.addMapsUrlToProperties(properties);
    const propertiesWithViewCount = await this.addViewCountToProperties(
      propertiesWithMapsUrl
    );
    const propertiesWithRatings = await this.addRatingStatsToProperties(
      propertiesWithViewCount
    );
    const propertiesWithFavorites = await this.addFavoriteInfoToProperties(
      propertiesWithRatings,
      userId
    );

    return {
      favorites: propertiesWithFavorites,
      pagination: result.pagination,
    };
  }

  /**
   * Check if property is favorited by user
   * @param {string} propertyId - Property ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Favorite status
   */
  async getFavoriteStatus(propertyId, userId) {
    const property = await propertiesRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    const [isFavorited, favoriteCount] = await Promise.all([
      this.propertyViewsRepository.isFavorited(propertyId, userId),
      this.propertyViewsRepository.getFavoriteCount(propertyId),
    ]);

    return {
      propertyId,
      isFavorited,
      favoriteCount,
    };
  }

  /**
   * Get property favorite statistics
   * @param {string} propertyId - Property ID
   * @returns {Promise<Object>} Favorite statistics
   */
  async getFavoriteStats(propertyId) {
    const property = await propertiesRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    const favoriteCount =
      await this.propertyViewsRepository.getFavoriteCount(propertyId);
    const recentFavorites =
      await this.propertyViewsRepository.getRecentFavorites(propertyId, 10);

    return {
      propertyId,
      favoriteCount,
      recentFavorites,
    };
  }

  // Get pending approvals (admin only)
  async getPendingApprovals(page = 1, limit = 10) {
    console.log(
      '🔍 getPendingApprovals called with page:',
      page,
      'limit:',
      limit
    );

    const skip = (page - 1) * limit;

    try {
      const [approvals, total] = await Promise.all([
        prisma.listingApproval.findMany({
          where: {
            status: 'PENDING',
            // 🆕 Ensure consistency: approval status PENDING AND property status PENDING_REVIEW
            property: {
              status: 'PENDING_REVIEW',
            },
          },
          include: {
            property: {
              include: {
                owner: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    name: true,
                  },
                },
                propertyType: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.listingApproval.count({
          where: {
            status: 'PENDING',
            // 🆕 Ensure consistency: approval status PENDING AND property status PENDING_REVIEW
            property: {
              status: 'PENDING_REVIEW',
            },
          },
        }),
      ]);

      console.log('📊 Found approvals:', approvals.length, 'total:', total);
      console.log('📋 Approvals data:', JSON.stringify(approvals, null, 2));

      const pages = Math.ceil(total / limit);

      return {
        approvals,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      };
    } catch (error) {
      console.error('❌ Error in getPendingApprovals:', error);
      throw error;
    }
  }

  // Approve property (admin only)
  async approveProperty(propertyId, reviewerId, notes = '') {
    // Check if property exists
    const property = await propertiesRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // 🛡️ SECURITY: Prevent self-approval (conflict of interest)
    // Admin cannot approve their own property - requires another admin
    if (property.ownerId === reviewerId) {
      throw new Error('Conflict of interest: You cannot approve your own property. Another admin must review.');
    }

    // Check if property is in PENDING_REVIEW status
    if (property.status !== 'PENDING_REVIEW') {
      throw new Error('Only PENDING_REVIEW properties can be approved');
    }

    // Find approval record (unique per property)
    const approval = await prisma.listingApproval.findUnique({
      where: { propertyId },
    });

    if (!approval) {
      throw new Error('Approval record not found');
    }

    // Update property status to APPROVED
    const [updatedProperty, updatedApproval] = await prisma.$transaction([
      prisma.property.update({
        where: { id: propertyId },
        data: { status: 'APPROVED' },
      }),
      prisma.listingApproval.update({
        where: { propertyId },
        data: {
          status: 'APPROVED',
          reviewerId,
          notes,
          reviewedAt: new Date(),
        },
      }),
    ]);

    return {
      property: updatedProperty,
      approval: updatedApproval,
    };
  }

  // Reject property (admin only)
  async rejectProperty(propertyId, reviewerId, notes) {
    // Check if property exists
    const property = await propertiesRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // 🛡️ SECURITY: Prevent self-rejection (conflict of interest)
    // Admin cannot reject their own property - requires another admin
    if (property.ownerId === reviewerId) {
      throw new Error('Conflict of interest: You cannot reject your own property. Another admin must review.');
    }

    // Check if property is in PENDING_REVIEW status
    if (property.status !== 'PENDING_REVIEW') {
      throw new Error('Only PENDING_REVIEW properties can be rejected');
    }

    // Find approval record (unique per property)
    const approval = await prisma.listingApproval.findUnique({
      where: { propertyId },
    });

    if (!approval) {
      throw new Error('Approval record not found');
    }

    // Update property status to REJECTED
    const [updatedProperty, updatedApproval] = await prisma.$transaction([
      prisma.property.update({
        where: { id: propertyId },
        data: { status: 'REJECTED' },
      }),
      prisma.listingApproval.update({
        where: { propertyId },
        data: {
          status: 'REJECTED',
          reviewerId,
          notes,
          reviewedAt: new Date(),
        },
      }),
    ]);

    return {
      property: updatedProperty,
      approval: updatedApproval,
    };
  }

  // Get approval history for a property
  async getApprovalHistory(propertyId) {
    // Check if property exists
    const property = await propertiesRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    const approvals = await prisma.listingApproval.findMany({
      where: { propertyId },
      include: {
        reviewer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      propertyId,
      approvals,
    };
  }

  // 🆕 Fix data inconsistency between properties and listing_approvals
  async fixApprovalDataInconsistency() {
    console.log('🔧 Starting approval data consistency fix...');

    try {
      // Find all inconsistent records where property is APPROVED but approval is still PENDING
      const inconsistentApprovals = await prisma.listingApproval.findMany({
        where: {
          status: 'PENDING',
          property: {
            status: 'APPROVED',
          },
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      });

      console.log(
        `🔍 Found ${inconsistentApprovals.length} inconsistent approval records`
      );

      if (inconsistentApprovals.length > 0) {
        // Update all inconsistent approval records to APPROVED
        const updatePromises = inconsistentApprovals.map(approval =>
          prisma.listingApproval.update({
            where: { id: approval.id },
            data: {
              status: 'APPROVED',
              reviewerId: null, // System fix
              notes:
                'Auto-fixed: Property was already approved but approval record was still pending',
              reviewedAt: new Date(),
            },
          })
        );

        await Promise.all(updatePromises);
        console.log(
          `✅ Fixed ${inconsistentApprovals.length} inconsistent approval records`
        );

        return {
          fixed: true,
          count: inconsistentApprovals.length,
          records: inconsistentApprovals.map(a => ({
            propertyId: a.propertyId,
            propertyTitle: a.property.title,
            oldApprovalStatus: 'PENDING',
            newApprovalStatus: 'APPROVED',
          })),
        };
      } else {
        console.log('✅ No inconsistent data found');
        return {
          fixed: false,
          count: 0,
          message: 'No inconsistent data found',
        };
      }
    } catch (error) {
      console.error('❌ Error fixing approval data inconsistency:', error);
      throw error;
    }
  }

  async getMyProperties(userId, page = 1, limit = 10, filters = {}) {
    try {
      // Build where clause
      const whereClause = {
        ownerId: userId, // Filter by owner (authenticated user)
      };

      // Add status filter if provided
      if (filters.status) {
        whereClause.status = filters.status;
      }

      // Add availability filter if provided
      if (filters.isAvailable !== undefined) {
        whereClause.isAvailable = filters.isAvailable;
      }

      // Add search filter if provided
      if (filters.search) {
        whereClause.OR = [
          {
            title: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
          {
            address: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        ];
      }

      // Get total count for pagination
      const total = await propertiesRepository.count({
        where: whereClause,
      });

      // Get properties with pagination using Prisma directly
      const properties = await prisma.property.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          propertyType: {
            select: {
              id: true,
              code: true,
              name: true,
              icon: true,
            },
          },
          amenities: {
            include: {
              amenity: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                },
              },
            },
          },
        },
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      });

      // Transform properties to include computed fields
      const transformedProperties = await Promise.all(
        properties.map(async property => {
          // Add maps URL
          const propertyWithMaps = this.addMapsUrlToProperty(property);

          // Get view count
          const viewCount = await this.propertyViewsRepository.getViewCount(
            property.id
          );

          // Get average rating
          const ratingsCount = property._count?.ratings || 0;
          const averageRating =
            ratingsCount > 0
              ? await propertiesRepository.getAverageRating(property.id)
              : 0;

          return {
            ...propertyWithMaps,
            amenities: property.amenities?.map(pa => pa.amenity) || [],
            viewCount,
            averageRating: parseFloat(averageRating.toFixed(1)),
            totalRatings: ratingsCount,
            totalLeases: property._count?.leases || 0,
            favoriteCount: property._count?.favorites || 0,
            // Remove the _count object as we've extracted the data
            _count: undefined,
          };
        })
      );

      // Get summary statistics
      const statusCounts = await propertiesRepository.getStatusCounts(userId);
      const availabilityCounts =
        await propertiesRepository.getAvailabilityCounts(userId);

      const pagination = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      };

      const summary = {
        total,
        byStatus: statusCounts,
        available: availabilityCounts.available || 0,
        unavailable: availabilityCounts.unavailable || 0,
      };

      return {
        properties: transformedProperties,
        pagination,
        summary,
      };
    } catch (error) {
      console.error('Error in getMyProperties:', error);
      throw error;
    }
  }
}

module.exports = new PropertiesService();
