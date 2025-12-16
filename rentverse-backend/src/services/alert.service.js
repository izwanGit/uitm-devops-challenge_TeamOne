const { prisma } = require('../config/database');
const emailService = require('./email.service');
const { sendSlackAlert } = require('./slack.service');

/**
 * Handle security alerts based on risk assessment.
 * @param {object} user - User object
 * @param {object} riskAnalysis - Result from detectAnomalies
 * @param {object} req - Request object
 * @param {string} status - Event status (SUCCESS/FAILURE/BLOCKED)
 */
const handleAlerts = async (user, riskAnalysis, req, status = 'SUCCESS') => {
  const { riskScore, severity, reasons, deviceHash, geo, metaData } =
    riskAnalysis;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  const location = geo ? `${geo.city}, ${geo.country}` : 'Unknown';
  const time = new Date().toLocaleString();

  // 1. Log to Database (Dashboard Feed)
  await prisma.securityEvent.create({
    data: {
      userId: user.id,
      eventType: 'LOGIN',
      status, // SUCCESS, FAILURE, BLOCKED
      riskScore,
      severity,
      ipAddress: ip,
      userAgent: userAgent,
      deviceHash,
      geoCity: geo?.city,
      geoCountry: geo?.country,
      geoLat: geo?.ll ? geo.ll[0] : null,
      geoLong: geo?.ll ? geo.ll[1] : null,
      reason: reasons,
      metaData: metaData,
    },
  });

  // 2. Dispatch Notifications
  if (severity === 'CRITICAL' || status === 'BLOCKED') {
    console.warn(
      `[SECURITY] CRITICAL ALERT for User ${user.email}: ${reasons}`
    );

    // CHANNEL: Slack Admin Alert (REAL)
    sendSlackAlert({
      severity: 'CRITICAL',
      title: 'Critical Security Threat Detected',
      userEmail: user.email,
      reason: reasons,
      ip: ip,
      location: location,
      time: time,
      riskScore: riskScore,
      userAgent: userAgent,
    }).catch(err => console.error('[SLACK] Alert failed:', err));

    // CHANNEL: Email to User
    try {
      await emailService.sendEmail(
        user.email,
        'CRITICAL SECURITY ALERT: Suspicious Activity Detected',
        'security_alert',
        {
          name: user.firstName,
          reason: reasons,
          ip: ip,
          location: location,
          time: time,
          action:
            'Your account has been temporarily locked. Please contact support.',
        }
      );
    } catch (err) {
      console.error('Failed to send critical alert email', err);
    }
  } else if (severity === 'SUSPICIOUS') {
    console.info(`[SECURITY] Suspicious login for ${user.email}: ${reasons}`);

    // CHANNEL: Slack Admin Alert (REAL)
    sendSlackAlert({
      severity: 'SUSPICIOUS',
      title: 'Suspicious Login Detected',
      userEmail: user.email,
      reason: reasons,
      ip: ip,
      location: location,
      time: time,
      riskScore: riskScore,
      userAgent: userAgent,
    }).catch(err => console.error('[SLACK] Alert failed:', err));

    // CHANNEL: Email to User
    try {
      await emailService.sendEmail(
        user.email,
        'New Login Detected',
        'new_login',
        {
          name: user.firstName,
          device: userAgent,
          location: location,
          ip: ip,
          time: time,
        }
      );
    } catch (err) {
      console.error('Failed to send suspicious alert email', err);
    }
  } else {
    // SAFE - Optional: Log to Slack for visibility (can be disabled in production)
    // Uncomment below if you want to see ALL logins in Slack
    /*
        sendSlackAlert({
            severity: 'SAFE',
            title: 'Normal Login',
            userEmail: user.email,
            reason: 'Standard login',
            ip: ip,
            location: location,
            time: time,
        }).catch(err => console.error('[SLACK] Alert failed:', err));
        */
  }
};

module.exports = {
  handleAlerts,
};
