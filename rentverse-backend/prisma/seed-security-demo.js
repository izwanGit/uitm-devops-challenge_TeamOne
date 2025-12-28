/**
 * Security Demo Data Seeder (SIMPLE VERSION)
 *
 * Run with: node prisma/seed-security-demo.js
 *
 * This script:
 * - ONLY inserts data into AuditLog and SecurityEvent tables
 * - Does NOT send any emails
 * - Does NOT send any Slack alerts
 * - Does NOT use @rentverse.com emails
 *
 * Purpose: Populate the admin dashboard stats for demo/presentation
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Random data generators
const randomIPs = [
  '192.168.1.100',
  '10.0.0.55',
  '203.0.113.42',
  '178.62.93.101',
  '45.33.32.156',
  '185.199.108.153',
  '52.77.247.88',
  '13.229.188.59',
];

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile Safari',
  'Mozilla/5.0 (Linux; Android 13) Chrome/120.0.0.0 Mobile',
];

const geoLocations = [
  { city: 'Kuala Lumpur', country: 'Malaysia', lat: 3.139, lng: 101.686 },
  { city: 'Singapore', country: 'Singapore', lat: 1.352, lng: 103.819 },
  { city: 'New York', country: 'USA', lat: 40.712, lng: -74.006 },
  { city: 'London', country: 'UK', lat: 51.507, lng: -0.127 },
];

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function hoursAgo(h) {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

async function seedSecurityDemo() {
  console.log('🔐 Seeding security demo data...\n');
  console.log('ℹ️  This ONLY inserts database records.');
  console.log('ℹ️  NO emails will be sent.');
  console.log('ℹ️  NO Slack alerts will be sent.\n');

  // ========== 1. Failed Logins (AuditLog) ==========
  console.log('📛 Creating failed login events...');
  const failedLogins = [];
  for (let i = 0; i < 12; i++) {
    failedLogins.push({
      userId: null, // Anonymous - no user associated
      action: 'LOGIN_FAILED',
      status: 'FAILURE',
      severity: i < 8 ? 'WARNING' : 'CRITICAL',
      eventType: 'AUTH',
      ipAddress: random(randomIPs),
      userAgent: random(userAgents),
      details: { reason: 'Invalid credentials', attemptNumber: i + 1 },
      createdAt: hoursAgo(Math.random() * 24),
    });
  }
  await prisma.auditLog.createMany({ data: failedLogins });
  console.log(`   ✅ ${failedLogins.length} failed login events`);

  // ========== 2. Blocked Attempts (SecurityEvent) ==========
  console.log('🚫 Creating blocked attempt events...');
  const blockedEvents = [];
  for (let i = 0; i < 5; i++) {
    const geo = random(geoLocations);
    blockedEvents.push({
      userId: null,
      eventType: 'LOGIN',
      status: 'BLOCKED',
      severity: 'SUSPICIOUS',
      riskScore: 75 + Math.floor(Math.random() * 25),
      ipAddress: random(randomIPs),
      userAgent: random(userAgents),
      geoCity: geo.city,
      geoCountry: geo.country,
      geoLat: geo.lat,
      geoLong: geo.lng,
      reason: random([
        'Rate Limit Exceeded',
        'Suspicious IP',
        'Known Malicious IP',
      ]),
      createdAt: hoursAgo(Math.random() * 24),
    });
  }
  await prisma.securityEvent.createMany({ data: blockedEvents });
  console.log(`   ✅ ${blockedEvents.length} blocked attempts`);

  // ========== 3. Suspicious Events (SecurityEvent) ==========
  console.log('⚠️  Creating suspicious events...');
  const suspiciousEvents = [];
  for (let i = 0; i < 8; i++) {
    const geo = random(geoLocations);
    suspiciousEvents.push({
      userId: null,
      eventType: 'LOGIN',
      status: 'SUCCESS',
      severity: 'SUSPICIOUS',
      riskScore: 40 + Math.floor(Math.random() * 30),
      ipAddress: random(randomIPs),
      userAgent: random(userAgents),
      geoCity: geo.city,
      geoCountry: geo.country,
      geoLat: geo.lat,
      geoLong: geo.lng,
      reason: random([
        'Impossible Travel',
        'New Device',
        'Unusual Time',
        'VPN Detected',
      ]),
      createdAt: hoursAgo(Math.random() * 24),
    });
  }
  await prisma.securityEvent.createMany({ data: suspiciousEvents });
  console.log(`   ✅ ${suspiciousEvents.length} suspicious events`);

  // ========== 4. Critical Events (AuditLog) ==========
  console.log('🚨 Creating critical security events...');
  const criticalEvents = [];
  for (let i = 0; i < 4; i++) {
    criticalEvents.push({
      userId: null,
      action: random([
        'BRUTE_FORCE_DETECTED',
        'ACCOUNT_TAKEOVER_ATTEMPT',
        'SUSPICIOUS_LOGIN',
      ]),
      status: 'FAILURE',
      severity: 'CRITICAL',
      eventType: 'AUTH',
      ipAddress: random(randomIPs),
      userAgent: random(userAgents),
      details: {
        reason: random([
          'Multiple failed attempts',
          'Impossible travel detected',
        ]),
      },
      createdAt: hoursAgo(Math.random() * 24),
    });
  }
  await prisma.auditLog.createMany({ data: criticalEvents });
  console.log(`   ✅ ${criticalEvents.length} critical events`);

  // ========== 5. Successful Logins (AuditLog) ==========
  console.log('✅ Creating successful login events...');
  const successfulLogins = [];
  for (let i = 0; i < 20; i++) {
    successfulLogins.push({
      userId: null,
      action: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      severity: 'INFO',
      eventType: 'AUTH',
      ipAddress: random(randomIPs),
      userAgent: random(userAgents),
      details: { location: random(geoLocations).city },
      createdAt: hoursAgo(Math.random() * 24),
    });
  }
  await prisma.auditLog.createMany({ data: successfulLogins });
  console.log(`   ✅ ${successfulLogins.length} successful logins`);

  // ========== Summary ==========
  console.log('\n' + '='.repeat(50));
  console.log('📊 DEMO DATA SUMMARY');
  console.log('='.repeat(50));
  console.log(`   Failed Logins:    ${failedLogins.length}`);
  console.log(`   Blocked:          ${blockedEvents.length}`);
  console.log(`   Suspicious:       ${suspiciousEvents.length}`);
  console.log(`   Critical:         ${criticalEvents.length}`);
  console.log(`   Active Sessions:  ${successfulLogins.length}`);
  console.log('='.repeat(50));
  console.log('\n✅ Done! Refresh /admin/security to see the stats.');
  console.log('\n⚠️  NOTE: This data is for DISPLAY ONLY.');
  console.log('    To test REAL Slack alerts, use the login API.\n');
}

seedSecurityDemo()
  .catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
