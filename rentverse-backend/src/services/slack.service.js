/**
 * Slack Notification Service
 * Sends real-time security alerts to Slack for admin monitoring
 * Enhanced with risk scores, action buttons, and dashboard links
 */

const axios = require('axios');

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

/**
 * Send a security alert to Slack
 * @param {object} options - Alert options
 * @param {string} options.severity - SAFE, SUSPICIOUS, CRITICAL
 * @param {string} options.title - Alert title
 * @param {string} options.userEmail - Affected user email
 * @param {string} options.reason - Threat reason
 * @param {string} options.ip - Source IP
 * @param {string} options.location - Geo location
 * @param {string} options.time - Timestamp
 * @param {number} options.riskScore - Risk score (0-100)
 * @param {string} options.userAgent - Device info
 * @param {string} options.eventId - Event ID for linking
 */
const sendSlackAlert = async ({
  severity,
  title,
  userEmail,
  reason,
  ip,
  location,
  time,
  riskScore = 0,
  userAgent = 'Unknown Device',
  eventId = null,
}) => {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('[SLACK] Webhook URL not configured, skipping alert');
    return { success: false, message: 'Slack webhook not configured' };
  }

  // Color coding by severity
  const colors = {
    SAFE: '#22c55e', // Green
    SUSPICIOUS: '#f59e0b', // Amber
    CRITICAL: '#ef4444', // Red
  };

  const emoji = {
    SAFE: '✅',
    SUSPICIOUS: '⚠️',
    CRITICAL: '🚨',
  };

  // Parse device type from user agent
  const getDeviceType = (ua) => {
    if (!ua) return '🖥️ Unknown';
    const lower = ua.toLowerCase();
    if (lower.includes('mobile') || lower.includes('android')) return '📱 Mobile';
    if (lower.includes('iphone') || lower.includes('ipad')) return '📱 iOS Device';
    if (lower.includes('mac')) return '💻 Mac';
    if (lower.includes('windows')) return '🖥️ Windows';
    if (lower.includes('linux')) return '🐧 Linux';
    return '🖥️ Desktop';
  };

  // Get threat level indicator
  const getThreatLevel = (score) => {
    if (score >= 80) return '🔴 CRITICAL';
    if (score >= 60) return '🟠 HIGH';
    if (score >= 40) return '🟡 MEDIUM';
    if (score >= 20) return '🟢 LOW';
    return '⚪ MINIMAL';
  };

  // Get recommended action
  const getRecommendedAction = (sev, reasons) => {
    if (sev === 'CRITICAL') {
      if (reasons?.includes('Impossible Travel')) {
        return '🚫 Account auto-locked. Verify user identity before unlocking.';
      }
      return '🚫 Account locked. Immediate investigation required.';
    }
    if (sev === 'SUSPICIOUS') {
      return '👁️ Monitor closely. Consider contacting user for verification.';
    }
    return '✓ No action required.';
  };

  const payload = {
    attachments: [
      {
        color: colors[severity] || '#6b7280',
        blocks: [
          // Header
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${emoji[severity] || '📢'} ${title}`,
              emoji: true,
            },
          },
          // Risk Score Banner (for non-safe events)
          ...(severity !== 'SAFE' ? [{
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Risk Score:* ${riskScore}/100 ${getThreatLevel(riskScore)}`,
            },
          }] : []),
          // Divider
          { type: 'divider' },
          // Main Info Grid
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*👤 User:*\n${userEmail}`,
              },
              {
                type: 'mrkdwn',
                text: `*⚠️ Severity:*\n${severity}`,
              },
              {
                type: 'mrkdwn',
                text: `*🌐 IP Address:*\n\`${ip || 'Unknown'}\``,
              },
              {
                type: 'mrkdwn',
                text: `*📍 Location:*\n${location || 'Unknown'}`,
              },
              {
                type: 'mrkdwn',
                text: `*${getDeviceType(userAgent)}*\n${userAgent?.substring(0, 50) || 'Unknown'}...`,
              },
              {
                type: 'mrkdwn',
                text: `*🕐 Time:*\n${time}`,
              },
            ],
          },
          // Divider
          { type: 'divider' },
          // Threat Details
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*🔍 Detection Reason:*\n${reason || 'Standard security check'}`,
            },
          },
          // Recommended Action
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*📋 Recommended Action:*\n${getRecommendedAction(severity, reason)}`,
            },
          },
          // Divider
          { type: 'divider' },
          // Action Buttons
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '📊 View Dashboard',
                  emoji: true,
                },
                url: `${APP_URL}/admin`,
                style: 'primary',
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '📜 View Security Logs',
                  emoji: true,
                },
                url: `${APP_URL}/admin/logs${eventId ? `?search=${eventId}` : ''}`,
              },
              ...(severity === 'CRITICAL' ? [{
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '🔓 Unlock Account',
                  emoji: true,
                },
                url: `${APP_URL}/admin/users?action=unlock&email=${encodeURIComponent(userEmail)}`,
                style: 'danger',
              }] : []),
            ],
          },
          // Footer
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `🔒 *RentVerse Security Operations Center* | ${new Date().toISOString()}`,
              },
            ],
          },
        ],
      },
    ],
  };

  try {
    await axios.post(SLACK_WEBHOOK_URL, payload);
    console.log('[SLACK] Alert sent successfully');
    return { success: true };
  } catch (error) {
    console.error('[SLACK] Failed to send alert:', error.message);
    return { success: false, message: error.message };
  }
};

module.exports = {
  sendSlackAlert,
};
