const MSRCScan = require('../models/msrcScan');
const DebianScan = require('../models/debianScan');
const CiscoScan = require('../models/ciscoScan');
const User = require('../models/User');
const { runMSRCScan } = require('./msrcService');
const { runDebianScan } = require('./debianService');
const { runCiscoScan } = require('./ciscoService');

exports.collectAllData = async (app) => {
  try {
    const io = app.get('io');
    const users = await User.find({});
    const msrcSet = new Set(), debianSet = new Set(), ciscoSet = new Set();
    console.log('\n🔍 User & Product Overview:\n-----------------------------');

    users.forEach(user => {
      user.products.forEach(p => {
              console.log(`👤 ${user.email}`);
        if (p.vendor === 'msrc') msrcSet.add(p.productName);
        if (p.vendor === 'debian') debianSet.add(p.productName);
        if (p.vendor === 'cisco') ciscoSet.add(p.productName);
      });
    });
        const msrcProducts = [...msrcSet];
    const debianProducts = [...debianSet];
    const ciscoProducts = [...ciscoSet];

    console.log('\n✅ Deduplicated Product Lists:');
    console.log(`   MSRC: ${msrcProducts.join(', ')}`);
    console.log(`   Debian: ${debianProducts.join(', ')}`);
    console.log(`   Cisco: ${ciscoProducts.join(', ')}`);

        console.log('\n✅ Deduplicated Product Lists:');
    console.log(`   MSRC: ${msrcProducts.join(', ')}`);
    console.log(`   Debian: ${debianProducts.join(', ')}`);
    console.log(`   Cisco: ${ciscoProducts.join(', ')}`);

    const notifications = [];

    const scanAndCollect = async (vendor, productList, runScan, Model) => {
      for (const product of productList) {
        const beforeCount = await Model.countDocuments({ product });
        await runScan([product]);
        const afterCount = await Model.countDocuments({ product });
        const diff = afterCount - beforeCount;
        
        console.log(`\n🛰️ Scan - ${vendor.toUpperCase()} | ${product}`);
        console.log(`   ➖ Before: ${beforeCount}`);
        console.log(`   ➕ After: ${afterCount}`);
        console.log(`   🔄 New Vulns: ${diff}`);
        notifications.push({ vendor, product, newCount: diff, totalCount: afterCount });
      }
    };

    await scanAndCollect('msrc', msrcProducts, runMSRCScan, MSRCScan);
    await scanAndCollect('debian', debianProducts, runDebianScan, DebianScan);
    await scanAndCollect('cisco', ciscoProducts, runCiscoScan, CiscoScan);

    const userMap = {}; // { email: [ {vendor, product, countType, count} ] }
    console.log('\n📦 Notifications Per User:\n-----------------------------');

    for (const user of users) {
      const userNotifs = [];

      for (const notif of notifications) {
        const match = user.products.find(p =>
          p.vendor === notif.vendor &&
          p.productName === notif.product
        );

        if (match) {
          console.log(" match for ",user.email,notif.product)
          console.log(`\n🔔 Match Found: ${user.email} → ${notif.vendor.toUpperCase()} - ${notif.product}`);
          console.log(`   🆕 Was New: ${match.isNewProd}`);
          if (match.isNewProd) {
            console.log(`   ✅ First-time scan → Sending total count: ${notif.totalCount}`);

            // First-time scan for this product
            userNotifs.push({
              vendor: notif.vendor,
              product: notif.product,
              countType: 'total',
              count: notif.totalCount
            });
            console.log("inside new for ",user.email,notif.product)
            // Mark product as not new anymore
            match.isNewProd = false;
          } else if (!match.isNewProd && notif.newCount > 0) {
            console.log(`   🔄 Updates found → Sending new count: ${notif.newCount}`);
            // Existing product with new vulnerabilities
            userNotifs.push({
              vendor: notif.vendor,
              product: notif.product,
              countType: 'new',
              count: notif.newCount
            });
          }
        }
      }
      console.log("[userNotifs] ", userNotifs)
      if (userNotifs.length > 0) {
        console.log(`\n📬 Notifying: ${user.email}`);
        userMap[user.email] = userNotifs;
        await user.save();
      }

    }

    // Emit and Email
    const { sendNotificationEmail } = require('../utils/sendMail');


const { getVulnerabilityHTML } = require('../utils/templates/vulnerabilityReportTemplate');
const { generatePDF } = require('../utils/pdfGenerator');
const fs = require('fs');
const path = require('path');
    console.log('\n📡 Emitting Events & Sending Emails:\n-----------------------------');

for (const [email, notifs] of Object.entries(userMap)) {
  io.to(email).emit('vulnerability_update', notifs);
   console.log(`📢 WebSocket emitted to ${email} | ${notifs.length} |${notifs} notifications`);

  const attachments = [];

  for (const notif of notifs) {
    const Model = notif.vendor === 'msrc' ? MSRCScan :
                  notif.vendor === 'debian' ? DebianScan :
                  CiscoScan;

    const query = { product: notif.product };
let allVulns = await Model.find(query).lean(); // <= removes _doc entirely

    let filtered = allVulns;

    if (notif.countType === 'new') {
      filtered = allVulns.slice(-notif.count); // last N new vulns
    }

    if (filtered.length === 0) continue;

    const html = getVulnerabilityHTML({
      vendor: notif.vendor,
      product: notif.product,
      results: filtered
    });

    const safeProductName = notif.product.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${notif.vendor}_${safeProductName}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '..', 'pdfs', filename);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    await generatePDF(html, filePath);

    attachments.push({
      filename,
      path: filePath
    });
    console.log(`📄 PDF generated for ${notif.vendor.toUpperCase()} - ${notif.product} → ${filename}`);

  }

  if (attachments.length > 0) {
    await sendNotificationEmail(email, '🛡️ Vulnerability Report Attached', `
      <p>Please find the attached vulnerability PDF(s) for your monitored products.</p>
    `, attachments);

    // Delete after sending
    for (const att of attachments) {
      fs.unlinkSync(att.path);
    }
  }
}
  } catch (error) {
    console.error('[Cron Job Error]', error.message);
  }
};
