const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const MSRCScan = require('../models/msrcScan');
const DebianScan = require('../models/debianScan');
const CiscoScan = require('../models/ciscoScan');
const User = require('../models/User');
const QuickScan = require('../models/QuickScan'); // at the top


router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const quickScanCount = user.scanCount || 0;
    const quickScanLimit= user.role === 'pro' ? 20 : 10;
    const productCount = user.products.length;
    const productLimit=user.role === 'pro' ? 20 : 10;
    const email = user.email;
    const role = user.role;


    const vendorMap = {
      msrc: { label: 'MSRC', model: MSRCScan, index: 0 },
      debian: { label: 'Debian', model: DebianScan, index: 1 },
      cisco: { label: 'Cisco', model: CiscoScan, index: 2 },
    };

    const labels = ['Microsoft', 'Debian', 'Cisco'];
    const productMap = {}; // { productName: [msrcCount, debianCount, ciscoCount] }

    let totalVulnerabilities = 0;

const validProductsByVendor = user.products.reduce((acc, { vendor, productName, isNewProd }) => {
  if (!isNewProd) {
    if (!acc[vendor]) acc[vendor] = [];
    acc[vendor].push(productName);
  }
  return acc;
}, {});

for (const [vendor, { model, index }] of Object.entries(vendorMap)) {
  const productNames = validProductsByVendor[vendor] || [];

  if (productNames.length === 0) continue;

  const results = await model.aggregate([
    { $match: { product: { $in: productNames } } },
    { $group: { _id: '$product', count: { $sum: 1 } } }
  ]);

  results.forEach(({ _id: productName, count }) => {
    if (!productMap[productName]) {
      productMap[productName] = [0, 0, 0];
    }
    productMap[productName][index] = count;
    totalVulnerabilities += count;
  });
}


    const datasets = Object.entries(productMap).map(([productName, counts], i) => ({
      label: productName,
      data: counts,
      backgroundColor: getColor(i),
    }));

    const quickScans = await QuickScan.find({ userId: user._id })
  .sort({ scanDate: -1 }) // optional: send last 5 scans

const quickScanLabels = [];
const highCounts = [];
const mediumCounts = [];
const lowCounts = [];

quickScans.forEach(scan => {
  const scanLabel = scan.productName || `SCAN-${scan._id}`;
  quickScanLabels.push(scanLabel);

  let high = 0, medium = 0, low = 0;

  scan.results.forEach(res => {
    const sev = res.base_Severity?.toLowerCase();
    if (sev === 'high') high++;
    else if (sev === 'medium') medium++;
    else if (sev === 'low') low++;
  });

  highCounts.push(high);
  mediumCounts.push(medium);
  lowCounts.push(low);
});

    function getColor(index) {
      const colors = [
'#00aaff',
'#2f4b7c',
'#00577e',
'#004C6D',
'#00638f',
'#007ab3',
'#0092d8',
'#006ea1',
'#0086c6',
'#009eec',
      ];
      return colors[index % colors.length];
    }

    return res.json({
      user_email: email,
      stats: {
        quickScanCount,
        productCount,
        role,
        totalVulnerabilities,
        quickScanLimit,
        productLimit
      },
      monitorChartData: {
        labels,
        datasets
      },
      quickChartData: {
  labels: quickScanLabels,
  datasets: [
    {
      label: 'High',
      data: highCounts,
      backgroundColor: '#fd3733'
    },
    {
      label: 'Medium',
      data: mediumCounts,
      backgroundColor: '#ff6e00'
    },
    {
      label: 'Low',
      data: lowCounts,
      backgroundColor: '#fcc100'
    }
  ]
}

    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
