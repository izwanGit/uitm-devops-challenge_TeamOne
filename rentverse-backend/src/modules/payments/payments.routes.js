const express = require('express');
const router = express.Router();
const paymentsController = require('./payments.controller');
const { auth } = require('../../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         invoiceId:
 *           type: string
 *           format: uuid
 *         amount:
 *           type: number
 *         method:
 *           type: string
 *           enum: [BANK_TRANSFER, CASH, EWALLET, CREDIT_CARD]
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED, REFUNDED]
 *         paidAt:
 *           type: string
 *           format: date-time
 *         txnRef:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Process a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoiceId
 *             properties:
 *               invoiceId:
 *                 type: string
 *                 format: uuid
 *               amount:
 *                 type: number
 *                 description: Optional - defaults to invoice amount
 *               method:
 *                 type: string
 *                 enum: [BANK_TRANSFER, CASH, EWALLET, CREDIT_CARD]
 *                 default: CREDIT_CARD
 *     responses:
 *       201:
 *         description: Payment processed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Invoice not found
 */
router.post('/', auth, paymentsController.processPayment);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all user's payments
 *     tags: [Payments]
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
 *           enum: [PENDING, COMPLETED, FAILED, REFUNDED]
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, paymentsController.getUserPayments);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
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
 *         description: Payment retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Payment not found
 */
router.get('/:id', auth, paymentsController.getPaymentById);

/**
 * @swagger
 * /api/payments/invoice/{invoiceId}:
 *   get:
 *     summary: Get payments for an invoice
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Invoice not found
 */
router.get('/invoice/:invoiceId', auth, paymentsController.getPaymentsForInvoice);

module.exports = router;
