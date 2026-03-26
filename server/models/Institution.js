const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    accreditationId: { type: String, unique: true, sparse: true },
    address: { type: String, default: '' },
    walletAddress: { type: String, default: '' },
    isApproved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Institution', institutionSchema);
