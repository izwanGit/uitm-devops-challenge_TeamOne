const paymentsService = require('./payments.service');

/**
 * Process a payment
 * POST /api/payments
 */
const processPayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { invoiceId, amount, method } = req.body;

        if (!invoiceId) {
            return res.status(400).json({
                success: false,
                message: 'Invoice ID is required',
            });
        }

        const result = await paymentsService.processPayment(
            invoiceId,
            { amount, method },
            userId
        );

        return res.status(201).json({
            success: true,
            message: 'Payment processed successfully',
            data: result,
        });
    } catch (error) {
        console.error('Process payment error:', error);

        if (error.message === 'Invoice not found') {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found',
            });
        }

        if (error.message.includes('Access denied')) {
            return res.status(403).json({
                success: false,
                message: error.message,
            });
        }

        if (error.message.includes('already paid') || error.message.includes('void')) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to process payment',
        });
    }
};

/**
 * Get payment by ID
 * GET /api/payments/:id
 */
const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const payment = await paymentsService.getPaymentById(id, userId);

        return res.json({
            success: true,
            message: 'Payment retrieved successfully',
            data: { payment },
        });
    } catch (error) {
        console.error('Get payment by ID error:', error);

        if (error.message === 'Payment not found') {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        if (error.message === 'Access denied') {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this payment',
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve payment',
        });
    }
};

/**
 * Get payments for an invoice
 * GET /api/payments/invoice/:invoiceId
 */
const getPaymentsForInvoice = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const userId = req.user.id;

        const payments = await paymentsService.getPaymentsForInvoice(invoiceId, userId);

        return res.json({
            success: true,
            message: 'Payments retrieved successfully',
            data: { payments },
        });
    } catch (error) {
        console.error('Get payments for invoice error:', error);

        if (error.message === 'Invoice not found') {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found',
            });
        }

        if (error.message === 'Access denied') {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this invoice',
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve payments',
        });
    }
};

/**
 * Get all user's payments
 * GET /api/payments
 */
const getUserPayments = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;

        const result = await paymentsService.getUserPayments(userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
        });

        return res.json({
            success: true,
            message: 'Payments retrieved successfully',
            data: result,
        });
    } catch (error) {
        console.error('Get user payments error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve payments',
        });
    }
};

module.exports = {
    processPayment,
    getPaymentById,
    getPaymentsForInvoice,
    getUserPayments,
};
