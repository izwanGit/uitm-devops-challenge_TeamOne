const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const auditService = require('../services/audit.service');
const { prisma } = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * /api/admin/logs:
 *   get:
 *     summary: Get audit logs (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [INFO, WARNING, CRITICAL]
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [AUTH, DATA, SYSTEM]
 *     responses:
 *       200:
 *         description: List of audit logs
 *       403:
 *         description: Access denied
 */
router.get('/logs', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      severity: req.query.severity,
      eventType: req.query.eventType,
      action: req.query.action,
      userId: req.query.userId,
      status: req.query.status,
    };

    const result = await auditService.getLogs(page, limit, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get admin logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/admin/security-stats:
 *   get:
 *     summary: Get security statistics for dashboard (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security statistics
 *       403:
 *         description: Access denied
 */
router.get('/security-stats', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get all stats in parallel for performance
    const [
      failedLogins24h,
      criticalEvents24h,
      blockedAttempts24h,
      lockedAccounts,
      totalUsers,
      activeSessionsToday,
      suspiciousEvents24h,
      passwordChanges24h,
      mfaEvents24h,
      recentCriticalEvents,
    ] = await Promise.all([
      // Failed logins in last 24h
      prisma.auditLog.count({
        where: {
          action: 'LOGIN_FAILED',
          createdAt: { gte: last24Hours },
        },
      }),
      // Critical events in last 24h
      prisma.auditLog.count({
        where: {
          severity: 'CRITICAL',
          createdAt: { gte: last24Hours },
        },
      }),
      // Blocked attempts (from security events)
      prisma.securityEvent.count({
        where: {
          status: 'BLOCKED',
          createdAt: { gte: last24Hours },
        },
      }),
      // Currently locked accounts
      prisma.user.count({
        where: {
          lockoutUntil: { gt: new Date() },
        },
      }),
      // Total users
      prisma.user.count(),
      // Successful logins today
      prisma.auditLog.count({
        where: {
          action: 'LOGIN_SUCCESS',
          createdAt: { gte: last24Hours },
        },
      }),
      // Suspicious events
      prisma.securityEvent.count({
        where: {
          severity: 'SUSPICIOUS',
          createdAt: { gte: last24Hours },
        },
      }),
      // Password changes
      prisma.auditLog.count({
        where: {
          action: 'PASSWORD_CHANGED',
          createdAt: { gte: last7Days },
        },
      }),
      // MFA events
      prisma.auditLog.count({
        where: {
          action: { in: ['MFA_ENABLED', 'MFA_FAILED'] },
          createdAt: { gte: last7Days },
        },
      }),
      // Recent critical events (for live feed)
      prisma.auditLog.findMany({
        where: {
          severity: { in: ['CRITICAL', 'WARNING'] },
          createdAt: { gte: last24Hours },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: {
            select: { email: true, name: true },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        realTimeStats: {
          failedLogins: failedLogins24h,
          criticalEvents: criticalEvents24h,
          blockedAttempts: blockedAttempts24h,
          suspiciousEvents: suspiciousEvents24h,
          lockedAccounts,
          activeSessions: activeSessionsToday,
        },
        weeklyStats: {
          passwordChanges: passwordChanges24h,
          mfaEvents: mfaEvents24h,
        },
        systemHealth: {
          totalUsers,
          threatLevel: criticalEvents24h > 5 ? 'HIGH' : criticalEvents24h > 0 ? 'MEDIUM' : 'LOW',
        },
        recentThreats: recentCriticalEvents,
      },
    });
  } catch (error) {
    console.error('Get security stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
