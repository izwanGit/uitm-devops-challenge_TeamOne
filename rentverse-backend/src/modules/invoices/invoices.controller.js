const invoicesService = require('./invoices.service');

/**
 * Get all user's invoices
 * GET /api/invoices
 */
const getUserInvoices = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;

        const result = await invoicesService.getUserInvoices(userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
        });

        return res.json({
            success: true,
            message: 'Invoices retrieved successfully',
            data: result,
        });
    } catch (error) {
        console.error('Get user invoices error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve invoices',
        });
    }
};

/**
 * Get invoice by ID
 * GET /api/invoices/:id
 */
const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const invoice = await invoicesService.getInvoiceById(id, userId);

        return res.json({
            success: true,
            message: 'Invoice retrieved successfully',
            data: { invoice },
        });
    } catch (error) {
        console.error('Get invoice by ID error:', error);

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

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve invoice',
        });
    }
};

/**
 * Get invoices for a specific lease
 * GET /api/invoices/lease/:leaseId
 */
const getInvoicesForLease = async (req, res) => {
    try {
        const { leaseId } = req.params;
        const userId = req.user.id;

        const invoices = await invoicesService.getInvoicesForLease(leaseId, userId);

        return res.json({
            success: true,
            message: 'Invoices retrieved successfully',
            data: { invoices },
        });
    } catch (error) {
        console.error('Get invoices for lease error:', error);

        if (error.message === 'Lease not found') {
            return res.status(404).json({
                success: false,
                message: 'Lease not found',
            });
        }

        if (error.message === 'Access denied') {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this lease',
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve invoices',
        });
    }
};

module.exports = {
    getUserInvoices,
    getInvoiceById,
    getInvoicesForLease,
};
