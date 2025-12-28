const app = require('./src/app');
const { disconnectDB } = require('./src/config/database');
const { sendServerCrashAlert } = require('./src/services/slack.service');

const PORT = process.env.PORT || 3000;

// Graceful shutdown
const gracefulShutdown = async signal => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);

  try {
    await disconnectDB();
    console.log('👋 Database disconnected successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ===================================');
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 ===================================');
  console.log('');
  console.log('📚 API Documentation:');
  console.log(`   http://localhost:${PORT}/docs`);
  console.log('');
  console.log('🏥 Health Check:');
  console.log(`🏥   http://localhost:${PORT}/health`);
  console.log('');
  console.log('🔗 API Base URL:');
  console.log(`🔗   http://localhost:${PORT}/api`);
  console.log('');
});

// ===================================
// 🔥 CRITICAL: Server Crash Monitoring
// ===================================

/**
 * Catch uncaught exceptions (synchronous errors)
 * These are critical errors that could crash the server
 */
process.on('uncaughtException', async (error, origin) => {
  console.error('');
  console.error('💥 ============================================');
  console.error('💥 CRITICAL: Uncaught Exception Detected!');
  console.error('💥 ============================================');
  console.error('Origin:', origin);
  console.error('Error:', error);
  console.error('Stack:', error.stack);
  console.error('💥 ============================================');
  console.error('');

  // Send Slack alert
  try {
    await sendServerCrashAlert({
      error,
      errorType: 'uncaughtException',
      service: 'RentVerse Backend API',
    });
  } catch (slackError) {
    console.error('Failed to send Slack crash alert:', slackError);
  }

  // Give some time for the alert to be sent before exiting
  setTimeout(() => {
    console.error('🛑 Server shutting down due to uncaught exception...');
    process.exit(1);
  }, 1000);
});

/**
 * Catch unhandled promise rejections (async errors)
 * These occur when promises are rejected but not caught
 */
process.on('unhandledRejection', async (reason, promise) => {
  console.error('');
  console.error('🔴 ============================================');
  console.error('🔴 CRITICAL: Unhandled Promise Rejection!');
  console.error('🔴 ============================================');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  console.error('🔴 ============================================');
  console.error('');

  // Send Slack alert
  try {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    await sendServerCrashAlert({
      error,
      errorType: 'unhandledRejection',
      service: 'RentVerse Backend API',
    });
  } catch (slackError) {
    console.error('Failed to send Slack crash alert:', slackError);
  }

  // Don't exit immediately for promise rejections (they might be recoverable)
  // But log it critically so we can fix the code
});

/**
 * Catch warnings (less critical but should be monitored)
 */
process.on('warning', warning => {
  console.warn('');
  console.warn('⚠️  ============================================');
  console.warn('⚠️  Warning Detected:');
  console.warn('⚠️  ============================================');
  console.warn('Name:', warning.name);
  console.warn('Message:', warning.message);
  console.warn('Stack:', warning.stack);
  console.warn('⚠️  ============================================');
  console.warn('');
});

console.log('');
console.log('🛡️  ============================================');
console.log('🛡️  Server Crash Monitoring: ACTIVE');
console.log('🛡️  Slack Alerts: ENABLED');
console.log('🛡️  ============================================');
console.log('');
