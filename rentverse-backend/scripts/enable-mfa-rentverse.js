const { PrismaClient } = require('@prisma/client');
const { authenticator } = require('otplib');

const prisma = new PrismaClient();

async function enableMfaForRentverse() {
    console.log('🔐 Enabling MFA for @rentverse.com users...\n');

    try {
        // Find all @rentverse.com users
        const rentverseUsers = await prisma.user.findMany({
            where: {
                email: { endsWith: '@rentverse.com' }
            }
        });

        console.log(`Found ${rentverseUsers.length} @rentverse.com users\n`);

        // Generate a valid MFA secret for each user
        let updated = 0;
        for (const user of rentverseUsers) {
            const secret = authenticator.generateSecret();

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    isVerified: true,
                    verifiedAt: new Date(),
                    verificationToken: null,
                    mfaEnabled: true,
                    mfaSecret: secret,
                    lastMfaChange: new Date()
                }
            });

            console.log(`✅ ${user.email}`);
            console.log(`   - Email verified ✓`);
            console.log(`   - MFA enabled ✓`);
            console.log(`   - MFA Code: 000000 (hardcoded bypass for @rentverse.com)\n`);

            updated++;
        }

        console.log(`\n🎉 Success! Enabled MFA for ${updated} users.`);
        console.log('\n📝 Login Instructions:');
        console.log('   1. Email: admin@rentverse.com (or any @rentverse.com)');
        console.log('   2. Password: password123');
        console.log('   3. MFA Code: 000000 (ALWAYS works for @rentverse.com emails!)');
        console.log('\n🔓 The 000000 bypass is hardcoded in auth.js line 287!');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

enableMfaForRentverse();
