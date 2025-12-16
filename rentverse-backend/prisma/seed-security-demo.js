/**
 * Security Demo Data Seeder
 * 
 * Run with: node prisma/seed-security-demo.js
 * 
 * This script populates realistic security events for demo purposes:
 * - Failed Logins (wrong password attempts)
 * - Blocked Attempts (rate limiting, suspicious IPs)
 * - Suspicious Events (impossible travel, new devices)
 * - Locked Accounts (too many failed attempts)
 * - Critical Events (account takeover attempts)
 * - Active Sessions (successful logins)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Sample data generators
const randomIPs = [
    '192.168.1.100',
    '10.0.0.55',
    '203.0.113.42',     // US
    '178.62.93.101',    // Europe
    '45.33.32.156',     // Asia
    '185.199.108.153',  // Singapore
    '52.77.247.88',     // AWS Singapore
    '13.229.188.59',    // Malaysia
    '175.176.85.234',   // Kuala Lumpur
    '1.9.212.100',      // Indonesia
];

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile',
    'Mozilla/5.0 (Linux; Android 13) Chrome/120.0.0.0 Mobile',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Firefox/121.0',
];

const cities = [
    { city: 'Kuala Lumpur', country: 'Malaysia', lat: 3.139, lng: 101.6869 },
    { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
    { city: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456 },
    { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.006 },
    { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
    { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
    { city: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6173 },
];

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomHoursAgo(maxHours) {
    const hours = Math.floor(Math.random() * maxHours);
    return new Date(Date.now() - hours * 60 * 60 * 1000);
}

async function seedSecurityData() {
    console.log('🔐 Starting security demo data seeding...\n');

    // Get some users to associate events with
    const users = await prisma.user.findMany({ take: 10 });

    if (users.length === 0) {
        console.log('❌ No users found. Please seed users first.');
        return;
    }

    console.log(`Found ${users.length} users for demo data.`);

    // ========== 1. FAILED LOGINS ==========
    console.log('\n📛 Creating Failed Login events...');
    const failedLogins = [];
    for (let i = 0; i < 12; i++) {
        const user = randomFrom(users);
        const geo = randomFrom(cities);
        failedLogins.push({
            userId: user.id,
            action: 'LOGIN_FAILED',
            status: 'FAILURE',
            severity: i < 8 ? 'WARNING' : 'CRITICAL',
            eventType: 'AUTH',
            ipAddress: randomFrom(randomIPs),
            userAgent: randomFrom(userAgents),
            details: { reason: 'Invalid credentials', attemptNumber: Math.floor(Math.random() * 4) + 1 },
            createdAt: randomHoursAgo(24),
        });
    }
    await prisma.auditLog.createMany({ data: failedLogins });
    console.log(`   ✅ Created ${failedLogins.length} failed login events`);

    // ========== 2. BLOCKED ATTEMPTS ==========
    console.log('\n🚫 Creating Blocked Attempt events...');
    const blockedEvents = [];
    for (let i = 0; i < 5; i++) {
        const user = randomFrom(users);
        const geo = randomFrom(cities);
        blockedEvents.push({
            userId: user.id,
            eventType: 'LOGIN',
            status: 'BLOCKED',
            riskScore: 75 + Math.floor(Math.random() * 25),
            severity: 'SUSPICIOUS',
            ipAddress: randomFrom(randomIPs),
            userAgent: randomFrom(userAgents),
            geoCity: geo.city,
            geoCountry: geo.country,
            geoLat: geo.lat,
            geoLong: geo.lng,
            reason: randomFrom(['Rate Limit Exceeded', 'Suspicious IP', 'Known Malicious IP', 'Too Many Requests']),
            createdAt: randomHoursAgo(24),
        });
    }
    await prisma.securityEvent.createMany({ data: blockedEvents });
    console.log(`   ✅ Created ${blockedEvents.length} blocked attempt events`);

    // ========== 3. SUSPICIOUS EVENTS ==========
    console.log('\n⚠️  Creating Suspicious events...');
    const suspiciousEvents = [];
    for (let i = 0; i < 8; i++) {
        const user = randomFrom(users);
        const geo = randomFrom(cities);
        suspiciousEvents.push({
            userId: user.id,
            eventType: 'LOGIN',
            status: 'SUCCESS',
            riskScore: 40 + Math.floor(Math.random() * 40),
            severity: 'SUSPICIOUS',
            ipAddress: randomFrom(randomIPs),
            userAgent: randomFrom(userAgents),
            geoCity: geo.city,
            geoCountry: geo.country,
            geoLat: geo.lat,
            geoLong: geo.lng,
            reason: randomFrom([
                'Impossible Travel Detected',
                'New Device Login',
                'Unusual Login Time',
                'New Location',
                'VPN/Proxy Detected',
            ]),
            createdAt: randomHoursAgo(24),
        });
    }
    await prisma.securityEvent.createMany({ data: suspiciousEvents });
    console.log(`   ✅ Created ${suspiciousEvents.length} suspicious events`);

    // ========== 4. LOCKED ACCOUNTS ==========
    console.log('\n🔒 Creating Locked Account events...');
    // Lock 2 random users temporarily
    const usersToLock = users.slice(0, 2);
    for (const user of usersToLock) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: 5,
                lockoutUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 min from now
            },
        });

        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'ACCOUNT_LOCKED',
                status: 'SUCCESS',
                severity: 'CRITICAL',
                eventType: 'AUTH',
                ipAddress: randomFrom(randomIPs),
                details: { reason: 'Too many failed login attempts', lockDuration: '15 minutes' },
                createdAt: randomHoursAgo(2),
            },
        });
    }
    console.log(`   ✅ Locked ${usersToLock.length} accounts (will unlock in 15 mins)`);

    // ========== 5. CRITICAL EVENTS ==========
    console.log('\n🚨 Creating Critical Security events...');
    const criticalEvents = [];
    for (let i = 0; i < 4; i++) {
        const user = randomFrom(users);
        const geo = randomFrom([cities[3], cities[4], cities[6]]); // Foreign countries

        criticalEvents.push({
            userId: user.id,
            action: randomFrom(['SUSPICIOUS_LOGIN', 'IMPOSSIBLE_TRAVEL', 'ACCOUNT_TAKEOVER_ATTEMPT', 'BRUTE_FORCE_DETECTED']),
            status: 'FAILURE',
            severity: 'CRITICAL',
            eventType: 'AUTH',
            ipAddress: randomFrom(randomIPs),
            userAgent: randomFrom(userAgents),
            details: {
                location: geo.city,
                reason: randomFrom([
                    'Login from blacklisted country',
                    'Impossible travel: 10,000km in 30 minutes',
                    'Multiple failed login attempts from different IPs',
                    'Password spray attack detected',
                ]),
            },
            createdAt: randomHoursAgo(24),
        });
    }
    await prisma.auditLog.createMany({ data: criticalEvents });
    console.log(`   ✅ Created ${criticalEvents.length} critical security events`);

    // ========== 6. ACTIVE SESSIONS (Successful Logins) ==========
    console.log('\n✅ Creating Successful Login events...');
    const successfulLogins = [];
    for (let i = 0; i < 20; i++) {
        const user = randomFrom(users);
        const geo = randomFrom(cities.slice(0, 3)); // Local countries
        successfulLogins.push({
            userId: user.id,
            action: 'LOGIN_SUCCESS',
            status: 'SUCCESS',
            severity: 'INFO',
            eventType: 'AUTH',
            ipAddress: randomFrom(randomIPs.slice(5)),
            userAgent: randomFrom(userAgents),
            details: { location: geo.city },
            createdAt: randomHoursAgo(24),
        });
    }
    await prisma.auditLog.createMany({ data: successfulLogins });
    console.log(`   ✅ Created ${successfulLogins.length} successful login events`);

    // ========== SUMMARY ==========
    console.log('\n' + '='.repeat(50));
    console.log('📊 SECURITY DEMO DATA SUMMARY');
    console.log('='.repeat(50));
    console.log(`   Failed Logins:     ${failedLogins.length}`);
    console.log(`   Blocked Attempts:  ${blockedEvents.length}`);
    console.log(`   Suspicious Events: ${suspiciousEvents.length}`);
    console.log(`   Locked Accounts:   ${usersToLock.length}`);
    console.log(`   Critical Events:   ${criticalEvents.length}`);
    console.log(`   Active Sessions:   ${successfulLogins.length}`);
    console.log('='.repeat(50));
    console.log('\n✅ Security demo data seeded successfully!');
    console.log('🔄 Refresh your Admin Dashboard to see the data.\n');
}

seedSecurityData()
    .catch((e) => {
        console.error('❌ Error seeding security data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
