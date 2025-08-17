const express = require('express');
const router = express.Router();
const { getGroupedVulnerabilities, getGroupedQuickScans } = require('../controllers/viewController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/api/monitorhistory',authMiddleware, getGroupedVulnerabilities);
router.get('/api/quickhistory',authMiddleware, getGroupedQuickScans)
module.exports = router;
