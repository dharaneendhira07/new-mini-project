const User = require('../models/User');

const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.walletAddress = req.body.walletAddress || user.walletAddress;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                walletAddress: updatedUser.walletAddress
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get audit logs (Admin)
const getAuditLogs = async (req, res, next) => {
    const AuditLog = require('../models/AuditLog');
    try {
        const logs = await AuditLog.find({})
            .populate('performedBy', 'name email role')
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(logs);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUsers,
    updateUserProfile,
    getAuditLogs
};
