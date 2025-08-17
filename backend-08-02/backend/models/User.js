const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  vendor: { type: String, required: true },
  productName: { type: String, required: true },
  isNewProd: { type: Boolean, default: true }
});
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['normal', 'pro'], default: 'normal' },
    scanCount: { type: Number, default: 0 },
    products: [productSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
