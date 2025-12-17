const {
  analyzeRisk,
  getGeoContext,
  generateDeviceFingerprint,
} = require('../utils/heuristic.util');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const emailService = require('../services/email.service');

const detectAnomaly = eventType => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        // If middleware is placed before auth, we might skip or handle login separately
        // For 'LOGIN_ATTEMPT' (pre-auth), we might need to rely on email provided in body
        // But usually we apply this AFTER successful auth, OR inside the controller for login.
        // Let's assume this is for authenticated routes OR we extract user from previous middleware.
        // IF eventType is LOGIN_ATTEMPT, we might not have req.user yet if it's a pre-check.
        // BUT the requirement says "intercepts critical actions", so for Login it might be a wrapper.

        if (eventType !== 'LOGIN_ATTEMPT') {
          return next();
        }
      }

      const ip =
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
        '127.0.0.1';
      const userAgent = req.headers['user-agent'];
      const deviceFingerprint = generateDeviceFingerprint(req);
      const geoContext = getGeoContext(ip);

      const userId = req.user
        ? req.user.id
        : req.body.email
          ? 'PRE_AUTH'
          : 'ANONYMOUS';
      // Note: If PRE_AUTH, we can't easily query history by ID unless we find user by email.
      // For this implementation, we will assume req.user is populated (post-auth) OR we look it up.

      let targetUserId = userId;
      if (userId === 'PRE_AUTH') {
        const user = await prisma.user.findUnique({
          where: { email: req.body.email },
        });
        if (user) targetUserId = user.id;
        else return next(); // Unknown user, let standard auth handle it
      }

      const currentContext = {
        ipAddress: ip,
        userAgent,
        deviceFingerprint,
        ...geoContext,
      };

      // Analyze Risk
      const { score, reasons } = await analyzeRisk(
        targetUserId,
        currentContext
      );

      // Log Security Event
      const severity =
        score > 60 ? 'CRITICAL' : score > 30 ? 'SUSPICIOUS' : 'SAFE';
      const status = score > 60 ? 'BLOCKED' : 'SUCCESS';

      await prisma.securityEvent.create({
        data: {
          userId: targetUserId,
          eventType,
          status,
          severity,
          riskScore: score,
          ipAddress: ip,
          userAgent,
          deviceHash: deviceFingerprint,
          geoCity: geoContext.city,
          geoCountry: geoContext.country,
          geoLat: geoContext.lat,
          geoLong: geoContext.long,
          reason: reasons.join(', ') || null,
          metaData: { reasons },
        },
      });

      // BLOCK if Critical
      if (score > 60) {
        // 🔒 AUTO-RESPONSE: Lock Account
        if (
          targetUserId &&
          targetUserId !== 'ANONYMOUS' &&
          targetUserId !== 'PRE_AUTH'
        ) {
          await prisma.user.update({
            where: { id: targetUserId },
            data: {
              lockoutUntil: new Date(Date.now() + 30 * 60 * 1000), // Lock for 30 mins
              isActive: true, // keep active but locked
            },
          });

          // 📧 SEND ALERT
          const userEmail = req.user?.email || req.body.email; // Try to get email
          if (userEmail) {
            await emailService.sendEmail(
              userEmail,
              'CRITICAL: Account Locked due to Suspicious Activity',
              'security_alert',
              {
                name: req.user?.name || 'User',
                reason: reasons,
                time: new Date().toISOString(),
                location: `${geoContext.city}, ${geoContext.country}`,
                ip: ip,
                action: 'Account has been temporarily locked for 30 minutes.',
              }
            );
          }
        }

        return res.status(403).json({
          error: 'Security Alert: Suspicious activity detected.',
          details:
            'Account temporarily locked due to critical risk. Please verify identity.',
          riskScore: score,
        });
      }

      // Add risk info to request for downstream use
      req.securityContext = { riskScore: score, reasons };

      next();
    } catch (error) {
      console.error('Security Monitor Error:', error);
      // Fail open or closed? Fail open to avoid blocking valid users on system error,
      // but log error critical.
      next();
    }
  };
};

module.exports = detectAnomaly;
