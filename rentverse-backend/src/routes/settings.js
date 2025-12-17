/**
 * User Settings Routes
 *
 * GET  /api/settings - Get user preferences
 * PUT  /api/settings - Update user preferences
 * POST /api/settings/delete-account - Soft delete account
 */

const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get user preferences
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        prefEmailNotifications: true,
        prefMarketingEmails: true,
        prefLanguage: true,
        prefCurrency: true,
        prefDarkMode: true,
        prefProfilePublic: true,
        prefShowActivity: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        emailNotifications: user.prefEmailNotifications,
        marketingEmails: user.prefMarketingEmails,
        language: user.prefLanguage,
        currency: user.prefCurrency,
        darkMode: user.prefDarkMode,
        profilePublic: user.prefProfilePublic,
        showActivity: user.prefShowActivity,
      },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to get settings' });
  }
});

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update user preferences
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailNotifications:
 *                 type: boolean
 *               marketingEmails:
 *                 type: boolean
 *               language:
 *                 type: string
 *               currency:
 *                 type: string
 *               darkMode:
 *                 type: boolean
 *               profilePublic:
 *                 type: boolean
 *               showActivity:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
router.put('/', auth, async (req, res) => {
  try {
    const {
      emailNotifications,
      marketingEmails,
      language,
      currency,
      darkMode,
      profilePublic,
      showActivity,
    } = req.body;

    const updateData = {};

    if (typeof emailNotifications === 'boolean') {
      updateData.prefEmailNotifications = emailNotifications;
    }
    if (typeof marketingEmails === 'boolean') {
      updateData.prefMarketingEmails = marketingEmails;
    }
    if (typeof language === 'string' && ['en', 'ms'].includes(language)) {
      updateData.prefLanguage = language;
    }
    if (
      typeof currency === 'string' &&
      ['MYR', 'USD', 'SGD', 'EUR'].includes(currency)
    ) {
      updateData.prefCurrency = currency;
    }
    if (typeof darkMode === 'boolean') {
      updateData.prefDarkMode = darkMode;
    }
    if (typeof profilePublic === 'boolean') {
      updateData.prefProfilePublic = profilePublic;
    }
    if (typeof showActivity === 'boolean') {
      updateData.prefShowActivity = showActivity;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid preferences to update',
      });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to update settings' });
  }
});

/**
 * @swagger
 * /api/settings/delete-account:
 *   post:
 *     summary: Soft delete user account
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - confirmEmail
 *             properties:
 *               confirmEmail:
 *                 type: string
 *                 description: User must confirm by entering their email
 *     responses:
 *       200:
 *         description: Account deleted successfully
 */
router.post('/delete-account', auth, async (req, res) => {
  try {
    const { confirmEmail } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // Verify email confirmation
    if (confirmEmail !== user.email) {
      return res.status(400).json({
        success: false,
        message:
          'Email confirmation does not match. Please enter your email to confirm deletion.',
      });
    }

    // Soft delete: set deletedAt and deactivate
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        email: `deleted_${Date.now()}_${user.email}`, // Prevent email reuse
      },
    });

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'ACCOUNT_DELETED',
        status: 'SUCCESS',
        severity: 'WARNING',
        eventType: 'DATA',
        details: { reason: 'User requested account deletion' },
      },
    });

    res.json({
      success: true,
      message: 'Account deleted successfully. We are sorry to see you go.',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to delete account' });
  }
});

module.exports = router;
