const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
    courseName: { type: String, required: true },
    grade: { type: String, required: true },
    ipfsHash: { type: String, required: true },
    blockchainTxHash: { type: String, required: true },
    certId: { type: String, required: true, unique: true }, // bytes32 hash representation
    issueDate: { type: Date, default: Date.now },
    verificationStatus: {
        type: String,
        enum: ['valid', 'revoked', 'pending'],
        default: 'valid'
    },
    supportingDocument: { type: String }, // path to the uploaded file
    metadata: { type: Object }
});

certificateSchema.index({ student: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
