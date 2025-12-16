const { prisma } = require('../../config/database');

/**
 * Invoice Service
 * Handles invoice creation, retrieval, and management
 */
class InvoicesService {
    /**
     * Generate unique invoice number
     * Format: INV-YYYYMMDD-XXXXX
     * @returns {string}
     */
    generateInvoiceNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `INV-${year}${month}${day}-${random}`;
    }

    /**
     * Create invoice for a lease
     * @param {string} leaseId
     * @param {Object} options - Additional invoice options
     * @returns {Promise<Object>}
     */
    async createInvoiceForLease(leaseId, options = {}) {
        // Get lease details
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: {
                property: true,
                tenant: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        name: true,
                    },
                },
                landlord: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        name: true,
                    },
                },
            },
        });

        if (!lease) {
            throw new Error('Lease not found');
        }

        // Check if invoice already exists for this lease
        const existingInvoice = await prisma.invoice.findFirst({
            where: { leaseId },
        });

        if (existingInvoice) {
            console.log(`📋 Invoice already exists for lease ${leaseId}: ${existingInvoice.id}`);
            return existingInvoice;
        }

        // Calculate due date (7 days from start date or creation)
        const dueDate = options.dueDate || new Date(lease.startDate);
        dueDate.setDate(dueDate.getDate() + 7);

        // Create invoice
        const invoice = await prisma.invoice.create({
            data: {
                leaseId,
                type: options.type || 'RENT',
                amount: parseFloat(lease.rentAmount),
                currencyCode: lease.currencyCode || 'MYR',
                dueDate,
                status: 'DUE',
                memo: options.memo || `Rent payment for ${lease.property?.title || 'property'}`,
            },
            include: {
                lease: {
                    include: {
                        property: {
                            select: {
                                id: true,
                                title: true,
                                address: true,
                                city: true,
                            },
                        },
                        tenant: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        console.log(`✅ Invoice created: ${invoice.id} for lease ${leaseId}`);
        return invoice;
    }

    /**
     * Get invoice by ID with access control
     * @param {string} invoiceId
     * @param {string} userId
     * @returns {Promise<Object>}
     */
    async getInvoiceById(invoiceId, userId) {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                lease: {
                    include: {
                        property: {
                            select: {
                                id: true,
                                title: true,
                                address: true,
                                city: true,
                                images: true,
                            },
                        },
                        tenant: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                name: true,
                            },
                        },
                        landlord: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                name: true,
                            },
                        },
                    },
                },
                payments: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        // Check access: user must be either tenant or landlord
        if (
            invoice.lease.tenantId !== userId &&
            invoice.lease.landlordId !== userId
        ) {
            throw new Error('Access denied: You can only view your own invoices');
        }

        return invoice;
    }

    /**
     * Get invoices for a specific lease
     * @param {string} leaseId
     * @param {string} userId
     * @returns {Promise<Array>}
     */
    async getInvoicesForLease(leaseId, userId) {
        // First verify user has access to this lease
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
        });

        if (!lease) {
            throw new Error('Lease not found');
        }

        if (lease.tenantId !== userId && lease.landlordId !== userId) {
            throw new Error('Access denied');
        }

        const invoices = await prisma.invoice.findMany({
            where: { leaseId },
            include: {
                payments: {
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { issuedAt: 'desc' },
        });

        return invoices;
    }

    /**
     * Get all invoices for a user (as tenant)
     * @param {string} userId
     * @param {Object} options - Pagination and filter options
     * @returns {Promise<Object>}
     */
    async getUserInvoices(userId, options = {}) {
        const { page = 1, limit = 10, status } = options;
        const skip = (page - 1) * limit;

        const where = {
            lease: {
                tenantId: userId,
            },
        };

        if (status) {
            where.status = status;
        }

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                include: {
                    lease: {
                        include: {
                            property: {
                                select: {
                                    id: true,
                                    title: true,
                                    address: true,
                                    city: true,
                                    images: true,
                                },
                            },
                        },
                    },
                    payments: {
                        orderBy: { createdAt: 'desc' },
                        take: 1, // Just get the latest payment
                    },
                },
                orderBy: { issuedAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.invoice.count({ where }),
        ]);

        return {
            invoices,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Mark invoice as paid
     * @param {string} invoiceId
     * @param {Object} paymentData
     * @returns {Promise<Object>}
     */
    async markInvoiceAsPaid(invoiceId, paymentData = {}) {
        const updatedInvoice = await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                status: 'PAID',
                paidAt: new Date(),
            },
            include: {
                lease: {
                    include: {
                        property: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
                payments: true,
            },
        });

        console.log(`✅ Invoice ${invoiceId} marked as PAID`);
        return updatedInvoice;
    }

    /**
     * Generate formatted invoice number for display
     * @param {Object} invoice
     * @returns {string}
     */
    getDisplayInvoiceNumber(invoice) {
        if (!invoice || !invoice.id) return 'N/A';

        // Format: INV + first 8 chars of UUID (uppercase)
        const shortId = invoice.id.replace(/-/g, '').substring(0, 8).toUpperCase();
        return `INV${shortId}`;
    }
}

module.exports = new InvoicesService();
