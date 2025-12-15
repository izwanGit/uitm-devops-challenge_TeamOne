/**
 * Slack Notification Service
 * Sends real-time security alerts to Slack for admin monitoring
 */

const axios = require('axios');

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

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
 */
const sendSlackAlert = async ({
  severity,
  title,
  userEmail,
  reason,
  ip,
  location,
  time,
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

  const payload = {
    attachments: [
      {
        color: colors[severity] || '#6b7280',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${emoji[severity] || '📢'} ${title}`,
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Severity:*\n${severity}`,
              },
              {
                type: 'mrkdwn',
                text: `*User:*\n${userEmail}`,
              },
              {
                type: 'mrkdwn',
                text: `*Reason:*\n${reason || 'N/A'}`,
              },
              {
                type: 'mrkdwn',
                text: `*IP Address:*\n${ip || 'Unknown'}`,
              },
              {
                type: 'mrkdwn',
                text: `*Location:*\n${location || 'Unknown'}`,
              },
              {
                type: 'mrkdwn',
                text: `*Time:*\n${time}`,
              },
            ],
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: '🔒 RentVerse Security Alert System',
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
