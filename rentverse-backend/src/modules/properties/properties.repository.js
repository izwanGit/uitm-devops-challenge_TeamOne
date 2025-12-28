const { prisma } = require('../../config/database');

class PropertiesRepository {
  async findMany(options = {}) {
    const {
      where = {},
      skip = 0,
      take = 10,
      orderBy = { createdAt: 'desc' },
      lat,
      lng,
    } = options;

    // If location provided, use raw query for distance sorting
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (!isNaN(latitude) && !isNaN(longitude)) {
        try {
          // Constructing the SQL for ID retrieval:
          // Note: Using quoted identifiers for camelCase columns
          const sql = `
            SELECT id, 
            sqrt(pow(longitude - $1, 2) + pow(latitude - $2, 2)) as distance
            FROM properties
            WHERE status = 'APPROVED' 
              AND "isAvailable" = true
              AND latitude IS NOT NULL 
              AND longitude IS NOT NULL
              AND NOT EXISTS (
                SELECT 1 FROM leases b 
                WHERE b."propertyId" = properties.id 
                AND b.status IN ('PENDING', 'APPROVED', 'ACTIVE')
              )
            ORDER BY distance ASC
            LIMIT $3 OFFSET $4
          `;

          const sortedIds = await prisma.$queryRawUnsafe(
            sql,
            longitude,
            latitude,
            take,
            skip
          );
          const ids = sortedIds.map(p => p.id);

          if (ids.length > 0) {
            const properties = await prisma.property.findMany({
              where: { id: { in: ids } },
              include: {
                owner: {
                  select: { id: true, name: true, email: true, phone: true },
                },
                propertyType: { select: { id: true, code: true, name: true } },
                amenities: {
                  include: {
                    amenity: {
                      select: { id: true, name: true, category: true },
                    },
                  },
                },
              },
            });

            // Restore order
            return ids
              .map(id => properties.find(p => p.id === id))
              .filter(Boolean);
          }
          // If no properties with coordinates found, fall back to regular query
          console.log(
            'No properties with valid coordinates found, falling back to regular query'
          );
        } catch (e) {
          console.error(
            'Geo search failed, falling back to regular query:',
            e.message
          );
        }
      }
    }

    // Exclude properties that have active bookings
    if (where.status === 'APPROVED' && where.isAvailable === true) {
      where.leases = {
        none: {
          status: {
            in: ['PENDING', 'APPROVED', 'ACTIVE'],
          },
        },
      };
    }

    return await prisma.property.findMany({
      where,
      skip,
      take,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        propertyType: {
          select: {
            id: true,
            code: true,
            name: true,
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
      orderBy,
    });
  }

  async count(options = {}) {
    const { where = {} } = options;
    return await prisma.property.count({ where });
  }

  async findById(id) {
    return await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        propertyType: {
          select: {
            id: true,
            code: true,
            name: true,
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
    });
  }

  async findByCode(code) {
    return await prisma.property.findUnique({
      where: { code },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        propertyType: {
          select: {
            id: true,
            code: true,
            name: true,
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
    });
  }

  async create(propertyData) {
    return await prisma.property.create({
      data: propertyData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async update(id, updateData) {
    return await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async delete(id) {
    return await prisma.property.delete({
      where: { id },
    });
  }

  async findForGeoJSON(params) {
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

    // Build raw SQL query for maximum performance
    let sql = `
      SELECT 
        p.id,
        p.code,
        p.title,
        p.price,
        p.currency_code as "currencyCode",
        p.bedrooms,
        p.bathrooms,
        p.area_sqm as "areaSqm",
        p.city,
        p.furnished,
        p.is_available as "isAvailable",
        p.latitude,
        p.longitude,
        pt.name as "propertyType",
        CASE 
          WHEN array_length(p.images, 1) > 0 
          THEN p.images[1] 
          ELSE NULL 
        END as thumbnail
      FROM properties p
      INNER JOIN property_types pt ON p.property_type_id = pt.id
      WHERE 
        p.status = 'APPROVED' 
        AND p.is_available = true
        AND NOT EXISTS (
          SELECT 1 FROM leases b 
          WHERE b."propertyId" = p.id 
          AND b.status IN ('PENDING', 'APPROVED', 'ACTIVE')
        )
        AND p.latitude IS NOT NULL 
        AND p.longitude IS NOT NULL
        AND p.latitude BETWEEN $1 AND $3
        AND p.longitude BETWEEN $2 AND $4
    `;

    const queryParams = [minLat, minLng, maxLat, maxLng];
    let paramIndex = 5;

    // Add text search if query provided
    if (query && query.trim()) {
      sql += ` AND (
        p.title ILIKE $${paramIndex} 
        OR p.city ILIKE $${paramIndex}
        OR p.address ILIKE $${paramIndex}
      )`;
      queryParams.push(`%${query.trim()}%`);
      paramIndex++;
    }

    // Add distance-based ordering if center coordinates provided
    if (centerLng && centerLat) {
      sql += ` ORDER BY 
        sqrt(pow(p.longitude - $${paramIndex}, 2) + pow(p.latitude - $${paramIndex + 1}, 2)) ASC,
        p.price ASC
      `;
      queryParams.push(centerLng, centerLat);
    } else {
      // Default ordering by price
      sql += ` ORDER BY p.price ASC`;
    }

    sql += ` LIMIT $${queryParams.length + 1}`;
    queryParams.push(limit);

    try {
      const results = await prisma.$queryRawUnsafe(sql, ...queryParams);
      return results;
    } catch (error) {
      console.error('Raw query error:', error);
      // Fallback to regular Prisma query if raw query fails
      return await this.findForGeoJSONFallback({
        minLng,
        minLat,
        maxLng,
        maxLat,
        limit,
        query,
      });
    }
  }

  // Fallback method using regular Prisma query
  async findForGeoJSONFallback(params) {
    const { minLng, minLat, maxLng, maxLat, limit, query } = params;

    const where = {
      status: 'APPROVED',
      isAvailable: true,
      leases: {
        none: {
          status: {
            in: ['PENDING', 'APPROVED', 'ACTIVE'],
          },
        },
      },
      latitude: {
        gte: minLat,
        lte: maxLat,
        not: null,
      },
      longitude: {
        gte: minLng,
        lte: maxLng,
        not: null,
      },
    };

    // Add text search
    if (query && query.trim()) {
      where.OR = [
        { title: { contains: query.trim(), mode: 'insensitive' } },
        { city: { contains: query.trim(), mode: 'insensitive' } },
        { address: { contains: query.trim(), mode: 'insensitive' } },
      ];
    }

    return await prisma.property.findMany({
      where,
      select: {
        id: true,
        code: true,
        title: true,
        price: true,
        currencyCode: true,
        bedrooms: true,
        bathrooms: true,
        areaSqm: true,
        city: true,
        furnished: true,
        isAvailable: true,
        latitude: true,
        longitude: true,
        images: true,
        propertyType: {
          select: {
            name: true,
          },
        },
      },
      take: limit,
      orderBy: {
        price: 'asc',
      },
    });
  }

  async codeExists(code) {
    const property = await prisma.property.findUnique({
      where: { code },
      select: { id: true },
    });
    return !!property;
  }

  async findFeaturedProperties(options = {}) {
    const { skip = 0, take = 8, lat, lng } = options;

    // If user location is provided, sort by distance
    if (lat && lng) {
      // Validate inputs to prevent SQL injection (double check type)
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Invalid coordinates provided');
      }

      const sql = `
        SELECT 
          p.id
        FROM properties p
        WHERE p.status = 'APPROVED' 
          AND p."isAvailable" = true
          AND p.latitude IS NOT NULL
          AND p.longitude IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM leases b 
            WHERE b."propertyId" = p.id 
            AND b.status IN ('PENDING', 'APPROVED', 'ACTIVE')
          )
        ORDER BY sqrt(pow(p.longitude - $1, 2) + pow(p.latitude - $2, 2)) ASC
        LIMIT $3 OFFSET $4
      `;

      try {
        const result = await prisma.$queryRawUnsafe(
          sql,
          longitude,
          latitude,
          take,
          skip
        );

        if (result && result.length > 0) {
          const ids = result.map(r => r.id);
          const properties = await prisma.property.findMany({
            where: { id: { in: ids } },
            include: {
              owner: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
              propertyType: {
                select: {
                  id: true,
                  code: true,
                  name: true,
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
          });

          // Re-sort in memory to match the distance order
          const sorted = ids
            .map(id => properties.find(p => p.id === id))
            .filter(Boolean);
          return sorted;
        }

        console.log('No featured properties with coordinates found');
      } catch (error) {
        console.error(
          'Featured properties location search error:',
          error.message
        );
      }
    }

    // Default behavior (no location provided or error)
    return await prisma.property.findMany({
      where: {
        status: 'APPROVED',
        isAvailable: true,
        leases: {
          none: {
            status: {
              in: ['PENDING', 'APPROVED', 'ACTIVE'],
            },
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        propertyType: {
          select: {
            id: true,
            code: true,
            name: true,
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
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }

  async countFeaturedProperties() {
    return await prisma.property.count({
      where: {
        status: 'APPROVED',
        isAvailable: true,
      },
    });
  }

  // Get counts by status for a specific owner
  async getStatusCounts(ownerId) {
    const statusCounts = await prisma.property.groupBy({
      by: ['status'],
      where: {
        ownerId: ownerId,
      },
      _count: {
        status: true,
      },
    });

    // Transform to object format
    const result = {
      DRAFT: 0,
      PENDING_REVIEW: 0,
      APPROVED: 0,
      REJECTED: 0,
      ARCHIVED: 0,
    };

    statusCounts.forEach(item => {
      result[item.status] = item._count.status;
    });

    return result;
  }

  // Get counts by availability for a specific owner
  async getAvailabilityCounts(ownerId) {
    const availabilityCounts = await prisma.property.groupBy({
      by: ['isAvailable'],
      where: {
        ownerId: ownerId,
      },
      _count: {
        isAvailable: true,
      },
    });

    const result = {
      available: 0,
      unavailable: 0,
    };

    availabilityCounts.forEach(item => {
      if (item.isAvailable) {
        result.available = item._count.isAvailable;
      } else {
        result.unavailable = item._count.isAvailable;
      }
    });

    return result;
  }

  // Get average rating for a property
  async getAverageRating(propertyId) {
    const result = await prisma.propertyRating.aggregate({
      where: {
        propertyId: propertyId,
      },
      _avg: {
        rating: true,
      },
    });

    return result._avg.rating || 0;
  }
}

module.exports = new PropertiesRepository();
