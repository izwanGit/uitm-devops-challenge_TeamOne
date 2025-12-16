const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAgreementAndPayment() {
    const documentIdPrefix = '4011ad87';

    try {
        const agreement = await prisma.rentalAgreement.findFirst({
            where: {
                documentId: { startsWith: documentIdPrefix }
            }
        });

        if (!agreement) {
            console.log('Agreement not found');
            return;
        }

        console.log('Found agreement:', agreement.documentId);
        const leaseId = agreement.leaseId;

        // Find and delete invoices/payments
        const invoices = await prisma.invoice.findMany({
            where: { leaseId }
        });

        console.log('Found', invoices.length, 'invoices');

        for (const invoice of invoices) {
            await prisma.payment.deleteMany({ where: { invoiceId: invoice.id } });
            await prisma.invoice.delete({ where: { id: invoice.id } });
            console.log('Deleted invoice + payments:', invoice.id);
        }

        await prisma.rentalAgreement.delete({ where: { id: agreement.id } });
        console.log('Deleted rental agreement');

        await prisma.lease.delete({ where: { id: leaseId } });
        console.log('Deleted lease');

        console.log('✅ Done!');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

deleteAgreementAndPayment();
