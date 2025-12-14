const { prisma } = require('../config/database');

class AuditService {
  /**
   * Log a security event
   * @param {Object} params
   * @param {string} params.userId - ID of the user (optional)
   * @param {string} params.action - Event action (e.g., LOGIN_SUCCESS)
   * @param {string} params.status - SUCCESS or FAILURE
   * @param {string} params.severity - INFO, WARNING, CRITICAL
   * @param {string} params.eventType - AUTH, DATA, SYSTEM
   * @param {string} params.ipAddress - IP Address
   * @param {string} params.userAgent - User Agent string
   * @param {Object} params.details - Additional metadata
   */
  async logEvent({
    userId,
    action,
    status,
    severity = 'INFO',
    eventType = 'SYSTEM',
    ipAddress,
    userAgent,
    details,
  }) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          status,
          severity,
          eventType,
          ipAddress,
          userAgent,
          details: details || {},
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * Get paginated logs for admin
   * @param {number} page
   * @param {number} limit
   * @param {Object} filters
   */
  async getLogs(page = 1, limit = 20, filters = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    if (filters.severity) where.severity = filters.severity;
    if (filters.eventType) where.eventType = filters.eventType;
    if (filters.userId) where.userId = filters.userId;
    if (filters.action)
      where.action = { contains: filters.action, mode: 'insensitive' };
    if (filters.status) where.status = filters.status;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new AuditService();
