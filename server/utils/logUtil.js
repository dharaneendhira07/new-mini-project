const AuditLog = require('../models/AuditLog');

const logActivity = async (action, performedBy, details = '') => {
    try {
        await AuditLog.create({
            action,
            performedBy,
            details,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Failed to save audit log:', error);
    }
};

module.exports = { logActivity };
