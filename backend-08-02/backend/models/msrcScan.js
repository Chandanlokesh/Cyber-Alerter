const mongoose = require('mongoose');

const msrcScanSchema = new mongoose.Schema({
  product: { type: String, required: true },
  cve_id: { type: String },
  title: { type: String },
  description: { type: String },
  link: { type: String },
  published_date: { type: String },
  revision: { type: String },
  storedAt: { type: Date, default: Date.now }
});
msrcScanSchema.index({ product: 1, cve_id: 1 }, { unique: true });

module.exports = mongoose.model('MSRCScan', msrcScanSchema);