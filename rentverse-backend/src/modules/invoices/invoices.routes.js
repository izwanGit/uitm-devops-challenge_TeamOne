const express = require('express');
const router = express.Router();
const invoicesController = require('./invoices.controller');
const { auth } = require('../../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Invoice:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         leaseId:
 *           type: string
 *           format: uuid
 *         type:
 *           type: string
 *           enum: [RENT, DEPOSIT, UTILITY, OTHER]
 *         amount:
 *           type: number
 *         currencyCode:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [DUE, PAID, VOID, REFUNDED]
 *         issuedAt:
 *           type: string
 *           format: date-time
 *         paidAt:
 *           type: string
 *           format: date-time
 *         memo:
 *           type: string
 */

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all user's invoices
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DUE, PAID, VOID, REFUNDED]
 *     responses:
 *       200:
 *         description: Invoices retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, invoicesController.getUserInvoices);

/**
 * @swagger
 * /api/invoices/lease/{leaseId}:
 *   get:
 *     summary: Get invoices for a specific lease
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leaseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Invoices retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Lease not found
 */
router.get('/lease/:leaseId', auth, invoicesController.getInvoicesForLease);

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Invoice retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Invoice not found
 */
router.get('/:id', auth, invoicesController.getInvoiceById);

module.exports = router;
