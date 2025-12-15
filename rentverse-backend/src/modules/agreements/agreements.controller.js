const pdfService = require('../../services/pdfGeneration.service');
const { prisma } = require('../../config/database');
const fs = require('fs');

/**
 * Generate a new agreement PDF for a lease
 * POST /api/agreements/generate
 * Body: { leaseId }
 */
exports.generateAgreement = async (req, res) => {
  try {
    const { leaseId } = req.body;

    if (!leaseId) {
      return res.status(400).json({ error: 'Lease ID is required' });
    }

    // Security check: Ensure user owns this lease
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { property: true },
    });

    if (!lease) {
      return res.status(404).json({ error: 'Lease not found' });
    }

    // Allow landlord or tenant
    if (
      req.user &&
      req.user.id !== lease.tenantId &&
      req.user.id !== lease.landlordId &&
      req.user.role !== 'ADMIN'
    ) {
      return res
        .status(403)
        .json({ error: 'Unauthorized access to this lease' });
    }

    // Generate PDF using the new service
    // Note: The service handles upserting the agreement record
    const updatedAgreement = await pdfService.generateLeasePdf(leaseId);

    return res.status(200).json({
      message: 'Agreement generated successfully',
      agreement: updatedAgreement,
    });
  } catch (error) {
    console.error('Generate Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Sign an agreement
 * POST /api/agreements/:id/sign
 * Body: { signature: "base64..." }
 */
exports.signAgreement = async (req, res) => {
  try {
    const { id } = req.params;
    const { signature } = req.body;
    const userId = req.user ? req.user.id : null;
    const ip = req.ip || req.connection.remoteAddress;

    if (!signature) {
      return res.status(400).json({ error: 'Signature image data required' });
    }

    // Fetch to check auth
    const agreement = await prisma.rentalAgreement.findUnique({
      where: { id },
      include: { lease: true },
    });

    if (!agreement)
      return res.status(404).json({ error: 'Agreement not found' });

    // Strict verify: Only tenant can sign
    if (req.user && req.user.id !== agreement.lease.tenantId) {
      return res
        .status(403)
        .json({ error: 'Only the tenant can sign this agreement' });
    }

    const result = await pdfService.embedSignature(id, signature, ip, userId);

    return res.json({
      message: 'Agreement signed successfully',
      agreement: result,
    });
  } catch (error) {
    console.error('Signing Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Verify a document
 * POST /api/agreements/verifyOrPublic
 * Accepts multipart/form-data with 'document' field
 */
exports.verifyDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document uploaded' });
    }

    // The file is saved to disk by multer (configured in routes)
    // Service expects a file path
    const verificationResult = await pdfService.verifyPdf(req.file.path);

    // Cleanup temp file
    if (req.file.path) {
      fs.unlink(req.file.path, err => {
        if (err) console.error('Error deleting temp file:', err);
      });
    }

    return res.json(verificationResult);
  } catch (error) {
    console.error('Verification Error:', error);
    // Cleanup temp file on error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    return res.status(500).json({ error: error.message });
  }
};
