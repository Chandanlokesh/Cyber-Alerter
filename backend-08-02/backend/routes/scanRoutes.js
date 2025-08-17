const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { quickScan,deleteQuickScan } = require('../controllers/scanController');

router.post('/quick', authMiddleware, quickScan);
router.delete('/quick/:scanId',authMiddleware,deleteQuickScan)
const { downloadQuickScanPDF, emailQuickScanPDF } = require('../controllers/scanController');

router.post('/quick-scan/:scanId/download-pdf', authMiddleware, downloadQuickScanPDF);
router.post('/quick-scan/:scanId/email-pdf', authMiddleware, emailQuickScanPDF);

module.exports = router;
