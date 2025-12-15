const express = require('express');
const router = express.Router();
const controller = require('./agreements.controller');
const { auth } = require('../../middleware/auth');
const multer = require('multer');
const path = require('path');

// Setup multer for verify upload
const upload = multer({ dest: path.join(__dirname, '../../../uploads/temp') });

// Ensure temp dir exists
const fs = require('fs');
const tempDir = path.join(__dirname, '../../../uploads/temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Generate Agreement
router.post('/generate', auth, controller.generateAgreement);

// Sign Agreement
router.post('/:id/sign', auth, controller.signAgreement);

// Verify Document (Public)
router.post('/verify', upload.single('document'), controller.verifyDocument);

module.exports = router;
