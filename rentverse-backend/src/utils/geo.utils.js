const geoip = require('geoip-lite');

/**
 * Get geographical information for an IP address.
 * @param {string} ip - IP address
 * @returns {object} { city, country, ll: [lat, long] }
 */
const getGeoInfo = (ip) => {
    // Handle localhost/private IPs
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.')) {
        return null;
    }
    const geo = geoip.lookup(ip);
    return geo;
};

/**
 * Calculate distance between two coordinates in km (Haversine Formula).
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distance in km
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};

/**
 * Calculate speed in km/h.
 * @param {number} distanceKm
 * @param {number} timeDiffMs
 * @returns {number} Speed in km/h
 */
const calculateSpeed = (distanceKm, timeDiffMs) => {
    if (timeDiffMs <= 0) return 99999; // Instant travel = infinite speed
    const hours = timeDiffMs / (1000 * 60 * 60);
    return distanceKm / hours;
};

module.exports = {
    getGeoInfo,
    calculateDistance,
    calculateSpeed,
};
