const { prisma } = require('../config/database');
const { getGeoInfo, calculateDistance, calculateSpeed } = require('../utils/geo.utils');
const { generateDeviceHash } = require('../utils/device.utils');

/**
 * Detect anomalies in user behavior.
 * @param {object} user - The user object
 * @param {object} req - Express request object
 * @param {string} eventType - Type of event (default 'LOGIN')
 * @returns {Promise<object>} Risk analysis result { score, severity, reason, meta }
 */
const detectAnomalies = async (user, req, eventType = 'LOGIN') => {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const deviceHash = generateDeviceHash(req);
    const geo = getGeoInfo(ip); // { range, country, region, eu, timezone, city, ll, metro, area }

    let riskScore = 0; // 0-100
    let reasons = [];
    let severity = 'SAFE'; // SAFE, SUSPICIOUS, CRITICAL

    // 1. Get User's History
    const lastSuccess = await prisma.securityEvent.findFirst({
        where: {
            userId: user.id,
            eventType: 'LOGIN',
            status: 'SUCCESS',
        },
        orderBy: { createdAt: 'desc' },
    });

    // 2. CHECK: Device Anomaly
    // Check if this device has been seen before
    const knownDevice = await prisma.securityEvent.findFirst({
        where: {
            userId: user.id,
            deviceHash: deviceHash,
            status: 'SUCCESS',
        },
    });

    if (!knownDevice && lastSuccess) {
        // New device after having history
        riskScore += 30;
        reasons.push('New Device Detected');
    }

    // 3. CHECK: Impossible Travel
    if (lastSuccess && lastSuccess.geoLat && lastSuccess.geoLong && geo && geo.ll) {
        const currentLat = geo.ll[0];
        const currentLon = geo.ll[1];
        const prevLat = lastSuccess.geoLat;
        const prevLon = lastSuccess.geoLong;

        const distanceKm = calculateDistance(prevLat, prevLon, currentLat, currentLon);
        const timeDiffMs = new Date().getTime() - new Date(lastSuccess.createdAt).getTime();

        // Ignore small distances (e.g. dynamic IP in same city)
        if (distanceKm > 100) {
            const speedKmH = calculateSpeed(distanceKm, timeDiffMs);

            if (speedKmH > 800) {
                riskScore += 80;
                reasons.push(`Impossible Travel (${Math.round(speedKmH)} km/h)`);
                severity = 'CRITICAL';
            } else if (speedKmH > 500) {
                // Suspiciously fast but maybe plane?
                riskScore += 40;
                reasons.push(`High Velocity Travel (${Math.round(speedKmH)} km/h)`);
            }
        }
    }

    // 4. CHECK: Brute Force Velocity (Recent Failures)
    // Count blocked/failures in last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentFailures = await prisma.securityEvent.count({
        where: {
            userId: user.id,
            eventType: 'LOGIN',
            status: { in: ['FAILURE', 'BLOCKED'] },
            createdAt: { gte: tenMinutesAgo },
        },
    });

    if (recentFailures > 5) {
        riskScore += 50;
        reasons.push('High Failure Rate (Brute Force Detected)');
    }

    // 5. Finalize Score
    if (riskScore > 100) riskScore = 100;

    if (riskScore >= 61) severity = 'CRITICAL';
    else if (riskScore >= 21) severity = 'SUSPICIOUS';
    else severity = 'SAFE';

    // Prepare Meta
    const metaData = {
        reasons,
        geo: geo ? { city: geo.city, country: geo.country } : 'Unknown',
        distanceFromLast: lastSuccess ? 'Calculated' : 'N/A',
    };

    return {
        riskScore,
        severity,
        reasons: reasons.join(', '),
        deviceHash,
        geo,
        metaData
    };
};

module.exports = {
    detectAnomalies,
};
