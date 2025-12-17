const { prisma } = require('../../config/database');
const invoicesService = require('../invoices/invoices.service');

/**
 * Payment Service
 * Handles payment creation, processing, and management
 */
class PaymentsService {
  /**
   * Generate unique transaction reference
   * Format: TXN-YYYYMMDD-XXXXX
   * @returns {string}
   */
  generateTransactionRef() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `TXN-${year}${month}${day}-${random}`;
  }

  /**
   * Process a payment for an invoice
   * @param {string} invoiceId
   * @param {Object} paymentData
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async processPayment(invoiceId, paymentData, userId) {
    const { amount, method = 'CREDIT_CARD' } = paymentData;

    // Get invoice details
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
              },
            },
            tenant: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Check if user is the tenant
    if (invoice.lease.tenantId !== userId) {
      throw new Error('Access denied: Only the tenant can pay this invoice');
    }

    // Check if invoice is already paid
    if (invoice.status === 'PAID') {
      throw new Error('Invoice is already paid');
    }

    // Check if invoice is void
    if (invoice.status === 'VOID') {
      throw new Error('Cannot pay a void invoice');
    }

    // Validate payment amount
    const paymentAmount = parseFloat(amount || invoice.amount);
    const invoiceAmount = parseFloat(invoice.amount);

    if (paymentAmount < invoiceAmount) {
      throw new Error(
        `Payment amount (${paymentAmount}) is less than invoice amount (${invoiceAmount})`
      );
    }

    // Generate transaction reference
    const txnRef = this.generateTransactionRef();

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: paymentAmount,
        method,
        status: 'COMPLETED', // Simulated payment - in production, this would be PENDING until verified
        paidAt: new Date(),
        txnRef,
        payerId: userId,
      },
      include: {
        invoice: {
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
          },
        },
        payer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    console.log(`💰 Payment created: ${payment.id} - TXN: ${txnRef}`);

    // Mark invoice as paid
    await invoicesService.markInvoiceAsPaid(invoiceId);

    return {
      payment,
      invoice: await prisma.invoice.findUnique({
        where: { id: invoiceId },
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
        },
      }),
    };
  }

  /**
   * Get payment by ID
   * @param {string} paymentId
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getPaymentById(paymentId, userId) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: {
          include: {
            lease: {
              include: {
                property: {
                  select: {
                    id: true,
                    title: true,
                    address: true,
                  },
                },
                tenant: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
                landlord: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        payer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Check access: user must be tenant, landlord, or the payer
    const lease = payment.invoice.lease;
    if (
      lease.tenantId !== userId &&
      lease.landlordId !== userId &&
      payment.payerId !== userId
    ) {
      throw new Error('Access denied');
    }

    return payment;
  }

  /**
   * Get payments for an invoice
   * @param {string} invoiceId
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getPaymentsForInvoice(invoiceId, userId) {
    // First verify user has access to the invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { lease: true },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (
      invoice.lease.tenantId !== userId &&
      invoice.lease.landlordId !== userId
    ) {
      throw new Error('Access denied');
    }

    const payments = await prisma.payment.findMany({
      where: { invoiceId },
      include: {
        payer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return payments;
  }

  /**
   * Get all payments for a user
   * @param {string} userId
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async getUserPayments(userId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    const skip = (page - 1) * limit;

    const where = {
      payerId: userId,
    };

    if (status) {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          invoice: {
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
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new PaymentsService();
