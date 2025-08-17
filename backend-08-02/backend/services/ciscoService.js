const axios = require('axios');
const CiscoScan = require('../models/ciscoScan');

const fetchCiscoAccessToken = async (clientId, clientSecret) => {
  const form = new URLSearchParams();
  form.append('client_id', clientId);
  form.append('client_secret', clientSecret);
  form.append('grant_type', 'client_credentials');

  const res = await axios.post(
    'https://id.cisco.com/oauth2/default/v1/token',
    form,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
    }
  );

  return res.data.access_token;
};

const fetchCiscoVulnerabilities = async (productName, accessToken) => {
  const res = await axios.get('https://apix.cisco.com/security/advisories/v2/product', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    params: {
      product: productName,
    },
  });

  return res.data.advisories || [];
};

exports.runCiscoScan = async (products) => {
  console.log('🟡 Running Cisco scan for:', products);

  const clientId = process.env.CISCO_CLIENT_ID
  const clientSecret =  process.env.CISCO_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error('❌ Missing Cisco credentials in env variables');
    return;
  }

  try {
    const token = await fetchCiscoAccessToken(clientId, clientSecret);
          let newent=0;

    for (const product of products) {
      try {
        const vulnerabilities = await fetchCiscoVulnerabilities(product, token);

        for (const item of vulnerabilities) {

          const exists = await CiscoScan.findOne({
            advisory_Id: item.advisoryId,
            product,
          });

          if (!exists) {
            newent=newent+1;
            await CiscoScan.create({
              product,
              advisory_Id: item.advisoryId,
              cves: item.cves || [],
              title: item.advisoryTitle,
              description: item.summary?.replace(/<\/?[^>]+(>|$)/g, '').trim(),
              score: isNaN(item.cvssBaseScore) ? null : Number(item.cvssBaseScore),
              published: item.firstPublished,
              lastUpdated: item.lastUpdated,
              link: item.publicationUrl,
              severity: item.sir,
            });
          }
        }

        console.log(`✅ Cisco: ${product} → ${newent} new entries `);
      } catch (err) {
        console.error(`❌ Cisco scan failed for "${product}":`, err.message);
      }
    }
  } catch (err) {
    console.error('❌ Cisco token fetch failed:', err.message);
  }
};
