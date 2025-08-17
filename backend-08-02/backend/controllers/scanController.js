const QuickScan = require('../models/QuickScan');
const axios = require('axios');
const User = require('../models/User');

const NVD_API_URL = 'https://services.nvd.nist.gov/rest/json/cves/2.0/';

exports.quickScan = async (req, res) => {
  const user = req.user;
  const { productName, productVersion } = req.body;

  const dailyLimit = user.role === 'pro' ? 20 : 10;

  try {
    // Count today's scans
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scansToday = await QuickScan.countDocuments({
      userId: user._id,
      scanDate: { $gte: today }
    });

    if (scansToday >= dailyLimit) {
      return res.status(403).json({ message: `Scan limit reached (${dailyLimit}/day)` });
    }

    // Query NVD API
    const params = {};
    params.keywordSearch = productVersion
      ? `${productName} ${productVersion}`
      : productName;

    const response = await axios.get(NVD_API_URL, {
      headers: { apiKey: process.env.API_KEY },
      params
    });

    const rawData = response.data;

    if (!rawData || !rawData.vulnerabilities || rawData.vulnerabilities.length === 0) {
      return res.status(200).json({ message: 'No vulnerabilities found' });
    }

    const parsedData = rawData.vulnerabilities.map((vuln) => {
      const cve = vuln.cve || {};
      const cvssV31 = cve.metrics?.cvssMetricV31?.[0];
      const cvssV30 = cve.metrics?.cvssMetricV30?.[0];
      const cvssV2  = cve.metrics?.cvssMetricV2?.[0];

      const cvssV3 = cvssV31 || cvssV30;

      const base_Score = cvssV3?.cvssData?.baseScore || cvssV2?.cvssData?.baseScore || null;
      let base_Severity = cvssV3?.baseSeverity || cvssV2?.baseSeverity || null;

      // Normalize severity casing
      if (typeof base_Severity === 'string') {
        base_Severity = base_Severity.charAt(0).toUpperCase() + base_Severity.slice(1).toLowerCase();
      }

      // Enforce allowed values
      const allowedSeverities = ["None", "Low", "Medium", "High", "Critical"];
      if (!allowedSeverities.includes(base_Severity)) {
        base_Severity = base_Score === 0.0 ? "None" : null;
      }


      const firstRef = cve.references?.find((r) => r.url) || {};
      const oem_Url = firstRef.url || 'N/A';

      return {
        cve_id: cve.id || 'N/A',
        vulnerability_description: cve.descriptions?.[0]?.value?.trim() || 'N/A',
        published_date: cve.published || null,
        last_modified: cve.lastModified || null,
        vulnarability_Status: cve.vulnStatus || 'N/A',
        base_Score,
        base_Severity,
        oem_Url
      };
    });

    const newScan = new QuickScan({
      userId: user._id,
      productName,
      productVersion,
      results: parsedData
    });

    await newScan.save();
    await User.findByIdAndUpdate(user._id, { $inc: { scanCount: 1 } });
const savedScan = await QuickScan.findById(newScan._id);

    res.status(200).json(savedScan);

  } catch (err) {
    console.error('Quick Scan Error:', err.message);
    res.status(500).json({ message: 'Quick scan failed', error: err.message });
  }
};

exports.deleteQuickScan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { scanId } = req.params;

    const deleted = await QuickScan.findOneAndDelete({ scanId, userId });

    if (!deleted) {
      return res.status(404).json({ message: 'Quick scan not found' });
    }

    res.status(200).json({ message: 'Quick scan deleted successfully' });
  } catch (error) {
    console.error('Error deleting quick scan:', error.message);
    res.status(500).json({ message: 'Failed to delete quick scan' });
  }
};

const fs = require('fs');
const path = require('path');
const { getVulnerabilityHTML } = require('../utils/templates/vulnerabilityReportTemplate');
const { generatePDF } = require('../utils/pdfGenerator');

exports.downloadQuickScanPDF = async (req, res) => {
  const userId = req.user._id;
  const { scanId } = req.params;

  try {
    const scan = await QuickScan.findOne({ _id: scanId, userId });

    if (!scan) {
      return res.status(404).json({ message: 'Scan not found' });
    }

    const html = getVulnerabilityHTML({
      vendor: scan.productName,
      product: scan.productVersion || '',
      results: scan.results
    });

    const safeProductName = (scan.productName + '_' + (scan.productVersion || ''))
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `QuickScan_${safeProductName}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '..', 'pdfs', filename);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    await generatePDF(html, filePath);

    res.download(filePath, filename, () => {
      // Optional: Delete after sending
      fs.unlinkSync(filePath);
    });

  } catch (err) {
    console.error('Download PDF Error:', err.message);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
};

    const { sendNotificationEmail } = require('../utils/sendMail');

exports.emailQuickScanPDF = async (req, res) => {
  const userId = req.user._id;
  const { scanId } = req.params;

  try {
    const scan = await QuickScan.findOne({ _id: scanId, userId });
    const user = await User.findById(userId);

    if (!scan || !user?.email) {
      return res.status(404).json({ message: 'Scan or user email not found' });
    }

    const html = getVulnerabilityHTML({
      vendor: scan.productName,
      product: scan.productVersion || '',
      results: scan.results
    });

    const safeProductName = (scan.productName + '_' + (scan.productVersion || ''))
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `QuickScan_${safeProductName}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '..', 'pdfs', filename);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    await generatePDF(html, filePath);

    await sendNotificationEmail(
      user.email,
      '🛡️ Quick Scan Vulnerability Report',
      `<p>Please find the attached vulnerability report for your quick scan.</p>`,
      [{ filename, path: filePath }]
    );

    fs.unlinkSync(filePath); // Cleanup

    res.status(200).json({ message: 'Email sent successfully' });

  } catch (err) {
    console.error('Email PDF Error:', err.message);
    res.status(500).json({ message: 'Failed to send email' });
  }
};
