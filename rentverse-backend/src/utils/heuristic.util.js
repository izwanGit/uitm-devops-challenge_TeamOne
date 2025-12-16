/**
 * Heuristic Utility for Security Monitoring
 * Provides risk analysis and security context utilities
 */

const geoip = require('geoip-lite');
const { prisma } = require('../config/database');

/**
 * Generate a device fingerprint from request headers
 * @param {Request} req - Express request object
 * @returns {string} Device fingerprint hash
 */
function generateDeviceFingerprint(req) {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';

  // Create a simple fingerprint from available headers
  const fingerprintString = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(16);
}

/**
 * Get geographic context from IP address
 * @param {string} ip - IP address
 * @returns {Object} Geographic context (city, country, lat, long)
 */
function getGeoContext(ip) {
  // Handle localhost and private IPs
  if (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.')
  ) {
    return {
      city: 'Local',
      country: 'Local',
      lat: 0,
      long: 0,
    };
  }

  try {
    const geo = geoip.lookup(ip);
    if (geo) {
      return {
        city: geo.city || 'Unknown',
        country: geo.country || 'Unknown',
        lat: geo.ll ? geo.ll[0] : 0,
        long: geo.ll ? geo.ll[1] : 0,
      };
    }
  } catch (error) {
    console.error('GeoIP lookup error:', error);
  }

  return {
    city: 'Unknown',
    country: 'Unknown',
    lat: 0,
    long: 0,
  };
}

/**
 * Analyze risk based on user behavior and context
 * @param {string} userId - User ID
 * @param {Object} context - Current request context
 * @returns {Object} Risk score and reasons
 */
async function analyzeRisk(userId, context) {
  const reasons = [];
  let score = 0;

  try {
    // Skip analysis for pre-auth or anonymous users
    if (userId === 'PRE_AUTH' || userId === 'ANONYMOUS') {
      return { score: 0, reasons: ['Pre-auth or anonymous user'] };
    }

    // Get recent security events for this user
    const recentEvents = await prisma.securityEvent.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Check for IP changes
    if (recentEvents.length > 0) {
      const knownIPs = new Set(recentEvents.map(e => e.ipAddress));
      if (!knownIPs.has(context.ipAddress)) {
        score += 15;
        reasons.push('New IP address detected');
      }
    }

    // Check for device fingerprint changes
    if (recentEvents.length > 0) {
      const knownFingerprints = new Set(
        recentEvents.map(e => e.deviceFingerprint).filter(Boolean)
      );
      if (
        knownFingerprints.size > 0 &&
        !knownFingerprints.has(context.deviceFingerprint)
      ) {
        score += 10;
        reasons.push('New device fingerprint detected');
      }
    }

    // Check for geographic anomalies (impossible travel)
    if (recentEvents.length > 0 && context.lat && context.long) {
      const lastEvent = recentEvents[0];
      if (lastEvent.geoLat && lastEvent.geoLong) {
        const distance = calculateDistance(
          lastEvent.geoLat,
          lastEvent.geoLong,
          context.lat,
          context.long
        );
        const timeDiff =
          (Date.now() - new Date(lastEvent.createdAt).getTime()) /
          (1000 * 60 * 60); // hours

        // If traveled more than 500km in less than 1 hour - suspicious
        if (distance > 500 && timeDiff < 1) {
          score += 30;
          reasons.push('Impossible travel detected');
        }
      }
    }

    // Check for failed login attempts
    const failedLogins = await prisma.securityEvent.count({
      where: {
        userId,
        eventType: 'LOGIN_FAILED',
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
    });

    if (failedLogins >= 5) {
      score += 25;
      reasons.push(`${failedLogins} failed login attempts in last hour`);
    }

    // Cap score at 100
    score = Math.min(score, 100);

    return { score, reasons };
  } catch (error) {
    console.error('Risk analysis error:', error);
    // Fail open - return low risk if analysis fails
    return { score: 0, reasons: ['Risk analysis error - failing open'] };
  }
}

/**
 * Calculate distance between two coordinates in kilometers
 * Using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = {
  generateDeviceFingerprint,
  getGeoContext,
  analyzeRisk,
};
