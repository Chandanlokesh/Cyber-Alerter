const mongoose = require('mongoose');

const debianScanSchema = new mongoose.Schema({
  product: { type: String, required: true }, // searched product
  cve: { type: String, required: true },
  package: { type: String, required: true },
  description: { type: String },
  storedAt: { type: Date, default: Date.now }
});
debianScanSchema.index({ product: 1, cve: 1 }, { unique: true });

module.exports = mongoose.model('DebianScan', debianScanSchema);
