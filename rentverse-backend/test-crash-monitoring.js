/**
 * Test Server Crash Monitoring
 * This script tests if crash alerts are sent to Slack correctly
 */

require('dotenv').config();
const { sendServerCrashAlert } = require('./src/services/slack.service');

async function testCrashAlert() {
    console.log('🧪 Testing Server Crash Alert to Slack...\n');

    // Test 1: Uncaught Exception Simulation
    console.log('Test 1: Simulating Uncaught Exception...');
    const testError1 = new Error('Database connection failed - Simulated crash');
    testError1.name = 'DatabaseError';
    testError1.stack = `DatabaseError: Database connection failed - Simulated crash
    at Database.connect (/app/db/connection.js:45:11)
    at async startServer (/app/index.js:23:5)`;

    const result1 = await sendServerCrashAlert({
        error: testError1,
        errorType: 'uncaughtException',
        service: 'RentVerse Backend API',
    });

    console.log('Result:', result1);
    console.log('');

    // Test 2: Unhandled Promise Rejection Simulation
    console.log('Test 2: Simulating Unhandled Promise Rejection...');
    const testError2 = new Error('Failed to fetch external API - Timeout');
    testError2.name = 'TimeoutError';
    testError2.stack = `TimeoutError: Failed to fetch external API - Timeout
    at Timeout._onTimeout (/app/services/api.js:67:13)
    at listOnTimeout (node:internal/timers:569:17)`;

    const result2 = await sendServerCrashAlert({
        error: testError2,
        errorType: 'unhandledRejection',
        service: 'RentVerse Backend API',
    });

    console.log('Result:', result2);
    console.log('');

    // Test 3: Memory Exhaustion Simulation
    console.log('Test 3: Simulating Memory Exhaustion Error...');
    const testError3 = new Error('JavaScript heap out of memory');
    testError3.name = 'OutOfMemoryError';
    testError3.stack = `OutOfMemoryError: JavaScript heap out of memory
    at Array.push (native)
    at processLargeData (/app/utils/processor.js:123:18)`;

    const result3 = await sendServerCrashAlert({
        error: testError3,
        errorType: 'uncaughtException',
        service: 'RentVerse Backend API',
    });

    console.log('Result:', result3);
    console.log('');

    console.log('✅ All crash alert tests completed!');
    console.log('📱 Check your RentVerse Security Slack channel for alerts');
    process.exit(0);
}

testCrashAlert().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
