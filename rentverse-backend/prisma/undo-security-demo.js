/**
 * Security Demo Data Cleanup
 *
 * Run with: node prisma/undo-security-demo.js
 *
 * This script removes demo security events created by seed-security-demo.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function undoSecurityData() {
  console.log('🧹 Cleaning up security demo data...\n');

  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // ========== 1. DELETE AUDIT LOGS ==========
  console.log('📛 Deleting demo audit logs...');
  const auditResult = await prisma.auditLog.deleteMany({
    where: {
      createdAt: { gte: last24Hours },
      OR: [
        { action: 'LOGIN_FAILED' },
        { action: 'LOGIN_SUCCESS' },
        { action: 'ACCOUNT_LOCKED' },
        { action: 'SUSPICIOUS_LOGIN' },
        { action: 'IMPOSSIBLE_TRAVEL' },
        { action: 'ACCOUNT_TAKEOVER_ATTEMPT' },
        { action: 'BRUTE_FORCE_DETECTED' },
      ],
    },
  });
  console.log(`   ✅ Deleted ${auditResult.count} audit log entries`);

  // ========== 2. DELETE SECURITY EVENTS ==========
  console.log('\n🚫 Deleting demo security events...');
  const securityResult = await prisma.securityEvent.deleteMany({
    where: {
      createdAt: { gte: last24Hours },
    },
  });
  console.log(`   ✅ Deleted ${securityResult.count} security event entries`);

  // ========== 3. UNLOCK ACCOUNTS ==========
  console.log('\n🔓 Unlocking demo-locked accounts...');
  const unlockResult = await prisma.user.updateMany({
    where: {
      lockoutUntil: { not: null },
    },
    data: {
      lockoutUntil: null,
      failedLoginAttempts: 0,
    },
  });
  console.log(`   ✅ Unlocked ${unlockResult.count} accounts`);

  // ========== SUMMARY ==========
  console.log('\n' + '='.repeat(50));
  console.log('📊 CLEANUP SUMMARY');
  console.log('='.repeat(50));
  console.log(`   Audit Logs Deleted:     ${auditResult.count}`);
  console.log(`   Security Events Deleted: ${securityResult.count}`);
  console.log(`   Accounts Unlocked:       ${unlockResult.count}`);
  console.log('='.repeat(50));
  console.log('\n✅ Security demo data cleaned up successfully!');
  console.log('🔄 Refresh your Admin Dashboard to see the cleared stats.\n');
}

undoSecurityData()
  .catch(e => {
    console.error('❌ Error cleaning up security data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
