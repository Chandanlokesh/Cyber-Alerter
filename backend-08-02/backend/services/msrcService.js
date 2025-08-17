const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const MSRCScan = require('../models/msrcScan');

const MSRC_RSS_URL = 'https://api.msrc.microsoft.com/update-guide/rss';

async function fetchAndFilterMSRCFeed(product) {
  try {
    const rssResponse = await axios.get(MSRC_RSS_URL, {
      responseType: 'text',
      headers: {
        Accept: 'application/rss+xml',
      },
    });

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
    });

    const parsed = parser.parse(rssResponse.data);
    const items = parsed?.rss?.channel?.item || [];

    const filteredItems = items.filter((item) => {
      const title = item?.title?.toLowerCase() || '';
      const description = item?.description?.toLowerCase() || '';
      return (
        title.includes(product.toLowerCase()) ||
        description.includes(product.toLowerCase())
      );
    });

    const formatted = filteredItems.map((item) => ({
      cve_id: item.guid?.['#text'] || 'N/A',
      title: item.title,
      description: item.description,
      link: item.link,
      published_date: item.pubDate,
      revision: item.Revision,
    }));

    return formatted;
  } catch (error) {
    console.error('[MSRC Fetch Error]', error.message);
    return [];
  }
}

exports.runMSRCScan = async (products) => {
  console.log('🟡 Running MSRC scan for:', products);

  for (const product of products) {
    try {
      const results = await fetchAndFilterMSRCFeed(product);
let newent=0;

      for (const entry of results) {
        // Check if already exists to prevent duplicates (optional)
        const exists = await MSRCScan.findOne({
          cve_id: entry.cve_id,
          product: product
        });
        if (!exists) {
          newent=newent+1;
          await MSRCScan.create({
            ...entry,
            product,
          });
        }
      }

      console.log(`✅ MSRC: ${product} → ${newent} new entries`);

    } catch (err) {
      console.error(`❌ MSRC scan failed for product "${product}":`, err.message);
    }
  }
};
