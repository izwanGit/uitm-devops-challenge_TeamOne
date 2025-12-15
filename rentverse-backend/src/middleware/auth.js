const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found or inactive.',
      });
    }

    // Attach decoded user payload (including userId and role) to req object
    // We attach specific fields to avoid leaking sensitive data if req.user is logged
    req.user = {
      id: user.id,
      userId: user.id, // For backward compatibility if needed, though id is cleaner
      role: user.role,
      email: user.email,
    };

    // Also attach full user object if needed by legacy code, but prefer using req.user.id/role
    req.userData = user;

    // 🛡️ ZERO-TRUST SECURITY CHECK (Continuous Monitoring)
    // Skip security check for MFA setup tokens (new users setting up MFA)
    if (decoded.purpose === 'mfa_setup') {
      return next(); // Allow MFA setup without running anomaly detection
    }

    // Runs anomaly detection on every authenticated request (e.g., blocks IP change/Impossible Travel)
    const securityCheck = require('./securityMonitor.middleware')(
      'CONTINUOUS_AUTH'
    );
    return securityCheck(req, res, next);
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Access denied. Invalid token.',
    });
  }
};

/**
 * RBAC Middleware Factory
 * @param {(string|string[])} allowedRoles - Single role string or array of allowed roles
 */
const authorize = allowedRoles => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.',
      });
    }

    // Normalize input to array
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};

module.exports = { auth, authorize };
