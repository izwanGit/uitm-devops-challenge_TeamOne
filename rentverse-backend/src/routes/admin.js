const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const auditService = require('../services/audit.service');

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

module.exports = router;
