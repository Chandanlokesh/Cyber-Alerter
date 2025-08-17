const MSRCScan = require('../models/msrcScan');
const DebianScan = require('../models/debianScan');
const CiscoScan = require('../models/ciscoScan');
const User = require('../models/User');

exports.getGroupedVulnerabilities = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch user's monitored products
    const user = await User.findById(userId);
    const productMap = user.products.reduce((acc, item) => {
      if (!item.isNewProd) {
        const vendor = item.vendor.toLowerCase();
        if (!acc[vendor]) acc[vendor] = [];
        acc[vendor].push(item.productName);
      }
      return acc;
    }, {});

    // 2. Query each scan collection based on productName
    const [msrcData, debianData, ciscoData] = await Promise.all([
      MSRCScan.find({ product: { $in: productMap.msrc || [] } }),
      DebianScan.find({ product: { $in: productMap.debian || [] } }),
      CiscoScan.find({ product: { $in: productMap.cisco || [] } }),
    ]);

    const grouped = {};

    [...msrcData, ...debianData, ...ciscoData].forEach(item => {
      const product = item.product;
      if (!grouped[product]) grouped[product] = [];
      grouped[product].push(item);
    });

    const response = Object.entries(grouped).map(([product, data]) => ({
      product,
      data
    }));

    res.status(200).json(response);
  } catch (err) {
    console.error('Monitor Scan Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch monitored product scan data' });
  }
};


const QuickScan = require('../models/QuickScan');


exports.getGroupedQuickScans = async (req, res) => {
    try {
      const userId = req.user._id;
  
      const scans = await QuickScan.find({ userId });
  
      const grouped = scans.map(scan => ({
        scanId: scan.scanId,
        product: scan.productName,
        data: scan.results || []
      }));
  
      res.status(200).json(grouped);
    } catch (err) {
      console.error('Error grouping quick scan data:', err.message);
      res.status(500).json({ message: 'Failed to fetch quick scan data' });
    }
  };
  