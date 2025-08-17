const mongoose = require('mongoose');

const ciscoScanSchema = new mongoose.Schema({
  product: { type: String, required: true },
  advisory_Id: { type: String, required: true },
  cves: [{ type: String }],
  title: { type: String },
  description: { type: String },
  score: { type: Number },
  published: { type: String },
  last_Updated: { type: String },
  link: { type: String },
  severity: { type: String },
  storedAt: { type: Date, default: Date.now }
});
ciscoScanSchema.index({ product: 1, advisoryId: 1 }, { unique: true });

module.exports = mongoose.model('CiscoScan', ciscoScanSchema);
