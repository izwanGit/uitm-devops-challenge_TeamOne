const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // 1. Define the password hash for 'password123'
  // (The user provided hash looks like it might be one, but let's regenerate to be sure or use theirs if we want exact match.
  // actually, the provided hash $2a$12$HFwG20fGpCPTeDXAYAwU9.BozxBN.6hiu0PloyCoheCoO.XUsVl4a IS password123 probably.
  // Let's just generate a fresh one to be safe across all users)
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 12);

  // 2. Identify the dummy emails
  const dummyEmails = [
    'tenant2@rentverse.com',
    'landlord3@rentverse.com',
    'landlord@rentverse.com',
    'superadmin@rentverse.com',
    'landlord2@rentverse.com',
    'tenant@rentverse.com',
    'admin@rentverse.com',
  ];

  console.log('Fixing dummy users...');

  // 3. Update all dummy users
  // - Set isVerified = true
  // - Set mfaEnabled = false (so they can just login without needing a code generator app)
  // - Set password = 'password123'
  // - Set role = ADMIN for superadmin/admin emails, USER for others

  for (const email of dummyEmails) {
    const role =
      email.includes('admin') || email.includes('super') ? 'ADMIN' : 'USER';

    try {
      await prisma.user.update({
        where: { email },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
          mfaEnabled: true, // Enable it so they are asked for code
          mfaSecret: 'CMFWKGBGEQMAUKJW', // Dummy secret
          password: hashedPassword,
          role: role,
        },
      });
      console.log(
        `✅ Updated ${email}: Verified, MFA Enabled, Password fixed, Role: ${role}`
      );
    } catch (e) {
      console.log(`❌ Failed to update ${email}: ${e.message}`);
    }
  }

  // 4. Also fix the specific ALIMI user if needed, or leave as is since they are already verified/MFA active?
  // User said "make ALL of them to be the same". So let's include Alimi but maybe keep them as USER?
  // Actually Alimi is already Verified and MFA Enabled.
  // To make it "usable" easily without the authenticator app, we should probably DISABLE MFA for Alimi too.

  try {
    await prisma.user.update({
      where: { email: '2024568765@student.uitm.edu.my' },
      data: {
        isVerified: true, // already true
        mfaEnabled: false, // Disabling so they can login easily
        mfaSecret: null,
        password: hashedPassword,
      },
    });
    console.log(`✅ Updated ALIMI: Verified, MFA Disabled, Password fixed`);
  } catch (e) {
    // Ignore if not found
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
