const crypto = require('crypto');

/**
 * Generate a consistent device hash/fingerprint from request headers.
 * Adds entropy via common headers.
 * @param {object} req - Express request object
 * @returns {string} SHA-256 hash or 'unknown'
 */
const generateDeviceHash = req => {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  // Note: Standard headers might be too generic, but enough for basic anomaly detection (Browser change).
  // A real fingerprinting library (e.g. FingerprintJS) is client-side. Server-side we rely on UA + Headers.

  if (!userAgent) return 'unknown';

  const data = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

module.exports = {
  generateDeviceHash,
};
