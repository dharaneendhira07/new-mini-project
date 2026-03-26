const Institution = require('../models/Institution');
const User = require('../models/User');

// @desc    Institution application
const applyAsInstitution = async (req, res, next) => {
    try {
        let { name, accreditationId, address, walletAddress } = req.body;

        accreditationId = accreditationId?.trim();
        if (!accreditationId) accreditationId = undefined;

        const existingApp = await Institution.findOne({ user: req.user._id });
        if (existingApp) {
            res.status(400);
            throw new Error('You have already applied to be an institution');
        }

        if (accreditationId) {
            const institutionExists = await Institution.findOne({ accreditationId });
            if (institutionExists) {
                res.status(400);
                throw new Error('Institution with this accreditation ID already exists');
            }
        }


        const institution = await Institution.create({
            user: req.user._id,
            name,
            accreditationId,
            address,
            walletAddress
        });

        await User.findByIdAndUpdate(req.user._id, { institutionProgress: 'pending' });

        res.status(201).json(institution);
    } catch (error) {
        next(error);
    }
};

// @desc    Get pending institutions
const getPendingInstitutions = async (req, res, next) => {
    try {
        const institutions = await Institution.find({ isApproved: false }).populate('user', 'name email');
        res.json(institutions);
    } catch (error) {
        next(error);
    }
};

// @desc    Approve institution
const approveInstitution = async (req, res, next) => {
    try {
        const institution = await Institution.findById(req.params.id);

        if (institution) {
            institution.isApproved = true;
            await institution.save();

            await User.findByIdAndUpdate(institution.user, { institutionProgress: 'approved' });

            res.json({ message: 'Institution approved' });
        } else {
            res.status(404);
            throw new Error('Institution not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { applyAsInstitution, getPendingInstitutions, approveInstitution };
