const mongoose = require("mongoose");

const quickScanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productName: { type: String, required: true },
  productVersion: { type: String, default: null },
  scanId: { type: String, unique: true },
  results: [
    {
      cve_id: String,
      vulnerability_description: { type: String, default: "N/A" },
      published_date: { type: Date, default: null },
      last_modified: { type: Date, default: null },
      vulnarability_Status: { type: String, default: "N/A" },
      base_Score: { type: Number, default: null },
      base_Severity: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical", null],
        default: "N/A",
        set: (val) =>
          val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : val,
      },
      oemUrl: { type: String, default: "N/A" },
    },
  ],
  scanDate: { type: Date, default: Date.now },
  message: { type: String, default: "Scan completed successfully" },
});

// Fix for scanId generation
quickScanSchema.pre("save", function (next) {
  if (!this.scanId) {
    this.scanId = `SCAN-${this._id}`;
  }
  next();
});

module.exports = mongoose.model("QuickScan", quickScanSchema);
