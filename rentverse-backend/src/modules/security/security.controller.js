const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Register device for push notifications
 * Updates the user's pushToken
 */
const registerDevice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pushToken, platform } = req.body;

    if (!pushToken) {
      return res.status(400).json({
        success: false,
        message: 'Push token is required',
      });
    }

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: { pushToken },
    });

    // Log security event
    await prisma.securityEvent.create({
      data: {
        userId,
        eventType: 'DEVICE_REGISTER',
        status: 'SUCCESS',
        riskScore: 0,
        severity: 'SAFE',
        reason: platform
          ? `New device registered (${platform})`
          : 'New device registered',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        deviceHash: pushToken, // Using token as unique identifier for now
        metaData: { platform, pushToken },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Device registered successfully',
    });
  } catch (error) {
    console.error('Device registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register device',
      error: error.message,
    });
  }
};

/**
 * Update device location
 * Logs a location update security event (used for velocity checks)
 */
const updateLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    // Log security event with geolocation
    await prisma.securityEvent.create({
      data: {
        userId,
        eventType: 'LOCATION_UPDATE',
        status: 'SUCCESS',
        riskScore: 0,
        severity: 'SAFE',
        reason: 'Periodic location update',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        geoLat: parseFloat(latitude),
        geoLong: parseFloat(longitude),
        metaData: { source: 'mobile_app' },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Location updated',
    });
  } catch (error) {
    console.error('Location update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message,
    });
  }
};

module.exports = {
  registerDevice,
  updateLocation,
};
