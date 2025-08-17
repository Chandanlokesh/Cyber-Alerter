const axios = require('axios');
const DebianScan = require('../models/debianScan');

const DEBIAN_CVE_URL = 'https://security-tracker.debian.org/tracker/data/json';

async function fetchDebianCVEsForProduct(product) {
  try {
    const { data } = await axios.get(DEBIAN_CVE_URL);

    const results = [];

    for (const [packageName, cves] of Object.entries(data)) {
      const packageMatch = packageName.toLowerCase().includes(product.toLowerCase());

      for (const [cveId, details] of Object.entries(cves)) {
        // const descriptionText = details?.description?.toLowerCase() || '';
        // const descriptionMatch = descriptionText.includes(product.toLowerCase());

        if (packageMatch) {
          results.push({
            cve: cveId,
            package: packageName,
            description: details.description?.description || 'No description'
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error('[Debian Fetch Error]', error.message);
    return [];
  }
}

exports.runDebianScan = async (products) => {
  console.log('🟡 Running Debian scan for:', products);
let newent=0;

  for (const product of products) {
    try {
      const matches = await fetchDebianCVEsForProduct(product);

      for (const entry of matches) {
        newent=newent+1;
        const exists = await DebianScan.findOne({
          cve: entry.cve,
          product
        });

        if (!exists) {
          await DebianScan.create({
            ...entry,
            product
          });
        }
      }

      console.log(`✅ Debian: ${product} → ${newent} new entries processed`);
    } catch (err) {
      console.error(`❌ Debian scan failed for "${product}":`, err.message);
    }
  }
};
