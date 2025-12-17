const express = require('express');
const router = express.Router();
const securityController = require('./security.controller');
const { auth } = require('../../middleware/auth');

// All security routes should be protected
router.use(auth);

router.post('/device/register', securityController.registerDevice);
router.post('/device/location', securityController.updateLocation);

module.exports = router;
