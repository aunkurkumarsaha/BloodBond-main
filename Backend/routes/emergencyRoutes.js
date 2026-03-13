const express = require('express');
const { createEmergencyRequest, getEmergencyRequests } = require('../controllers/emergencyController');

const router = express.Router();

router.post('/', createEmergencyRequest);
router.get('/', getEmergencyRequests);

module.exports = router;
