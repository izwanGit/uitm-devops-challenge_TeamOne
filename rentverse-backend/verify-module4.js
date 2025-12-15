const { prisma } = require('./src/config/database');
const { detectAnomalies } = require('./src/services/anomaly.service');
const { handleAlerts } = require('./src/services/alert.service');

const runVerification = async () => {
    console.log('🧪 Starting Security Module 4 Verification...');

    // 1. Setup Test User
    const email = 'security_test_' + Date.now() + '@rentverse.com';
    const user = await prisma.user.create({
        data: {
            email,
            password: 'hashedpassword123',
            firstName: 'Sec',
            lastName: 'Tester',
            name: 'Sec Tester',
            role: 'USER',
        },
    });
    console.log(`[SETUP] Created User: ${user.email}`);

    try {
        // 2. Scenario A: Initial Login (Safe, set baseline)
        console.log('\n--- Scenario A: Initial Login (Kuala Lumpur) ---');
        const reqA = {
            ip: '115.132.128.0', // KL IP
            headers: { 'user-agent': 'Mozilla/5.0 (Macintosh)...' },
            get: (h) => (h === 'User-Agent' ? 'Mozilla/5.0 (Macintosh)...' : ''),
            connection: { remoteAddress: '115.132.128.0' }
        };

        // Detect
        const resultA = await detectAnomalies(user, reqA, 'LOGIN');
        console.log(`RISK SCORE: ${resultA.riskScore} | SEVERITY: ${resultA.severity}`);

        // Log Success
        await handleAlerts(user, resultA, reqA, 'SUCCESS');

        if (resultA.severity === 'SAFE') console.log('✅ PASS: Initial login is SAFE');
        else console.error('❌ FAIL: Initial login should be SAFE');


        // 3. Scenario B: New Device (Safe IP)
        console.log('\n--- Scenario B: New Device (Same Location) ---');
        const reqB = {
            ip: '115.132.128.0', // KL IP
            headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10)...' },
            get: (h) => (h === 'User-Agent' ? 'Mozilla/5.0 (Windows NT 10)...' : ''), // Different UA
            connection: { remoteAddress: '115.132.128.0' }
        };

        const resultB = await detectAnomalies(user, reqB, 'LOGIN');
        console.log(`RISK SCORE: ${resultB.riskScore} | SEVERITY: ${resultB.severity}`);

        // Log Success
        await handleAlerts(user, resultB, reqB, 'SUCCESS');

        if (resultB.riskScore >= 20 && resultB.severity === 'SUSPICIOUS') console.log('✅ PASS: New Device flagged as SUSPICIOUS');
        else console.error(`❌ FAIL: Expected SUSPICIOUS, got ${resultB.severity}`);


        // 4. Scenario C: Impossible Travel (London, 1 sec later)
        console.log('\n--- Scenario C: Impossible Travel (London) ---');
        const reqC = {
            ip: '212.58.244.23', // London IP
            headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10)...' },
            get: (h) => (h === 'User-Agent' ? 'Mozilla/5.0 (Windows NT 10)...' : ''),
            connection: { remoteAddress: '212.58.244.23' }
        };

        const resultC = await detectAnomalies(user, reqC, 'LOGIN');
        console.log(`RISK SCORE: ${resultC.riskScore} | SEVERITY: ${resultC.severity}`);
        console.log(`REASONS: ${resultC.reasons}`); // Should show speed

        if (resultC.severity === 'CRITICAL' && resultC.reasons.includes('Impossible Travel')) {
            console.log('✅ PASS: Impossible Travel flagged as CRITICAL');
        } else {
            console.error('❌ FAIL: Failed to detect Impossible Travel');
        }

    } catch (err) {
        console.error('Verification Error:', err);
    } finally {
        // Cleanup
        await prisma.securityEvent.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
        console.log('\n[CLEANUP] Deleted test user and events.');
    }
};

runVerification();
