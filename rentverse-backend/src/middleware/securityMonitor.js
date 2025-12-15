const { prisma } = require('../config/database');
const anomalyService = require('../services/anomaly.service');
const alertService = require('../services/alert.service');

/**
 * Security Middleware to monitor authenticated critical actions.
 * Assumes `req.user` is populated (after auth middleware).
 * Usage: router.post('/change-password', auth, securityMonitor('PASSWORD_CHANGE'), controller);
 */
const securityMonitor = (eventType) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                // If used on non-auth route, we can't track user history purely by ID yet.
                // For login, we handle it inside the controller manually.
                return next();
            }

            const user = await prisma.user.findUnique({ where: { id: req.user.id } });
            if (!user) return next();

            // Run Analysis
            const riskAnalysis = await anomalyService.detectAnomalies(user, req, eventType);

            // Handle Alerts
            // We pass 'SUCCESS' tentatively, IF the action proceeds. 
            // Strictly speaking, we should log 'ATTEMPT' here, and 'SUCCESS' after.
            // But for simplicity in this module, we'll log the check itself.
            // If critical, we BLOCK.

            if (riskAnalysis.severity === 'CRITICAL') {
                // Block request
                await alertService.handleAlerts(user, riskAnalysis, req, 'BLOCKED');
                return res.status(403).json({
                    success: false,
                    message: 'Action blocked due to critical security alert. Please contact support.',
                    reason: riskAnalysis.reasons
                });
            }

            // If Suspicious, we might alert but allow
            if (riskAnalysis.severity === 'SUSPICIOUS') {
                // Async alert to not block thread
                alertService.handleAlerts(user, riskAnalysis, req, 'SUCCESS').catch(err => console.error(err));
            } else {
                // Safe - optional: log or just proceed
                // To avoid spamming DB, we might only log SAFE events for Login, not every action?
                // But requirement says "Data Capture: For every request...". 
                // We'll log it asynchronously.
                alertService.handleAlerts(user, riskAnalysis, req, 'SUCCESS').catch(err => console.error(err));
            }

            // Continue
            next();

        } catch (error) {
            console.error('Security Monitor Error:', error);
            next(); // Fail open or closed? Fail open for now to avoid breaking app on error.
        }
    };
};

module.exports = { securityMonitor };
