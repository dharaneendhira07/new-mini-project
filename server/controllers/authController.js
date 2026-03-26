const { logActivity } = require('../utils/logUtil');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role, department, registerNo, batch, semester } = req.body;
        const trimmedEmail = email ? email.trim() : email;
        console.log(`Registration attempt for: ${trimmedEmail}`);

        if (!name || !email || !password) {
            res.status(400);
            throw new Error('Please provide all required fields (name, email, password)');
        }

        let user = await User.findOne({ email: trimmedEmail });

        if (user) {
            // "User already exists" error is bypassed - updating existing user and proceeding
            user.name = name;
            user.password = password;
            if (role) user.role = role;
            if (department) user.department = department;
            if (registerNo) user.registerNo = registerNo;
            if (batch) user.batch = batch;
            if (semester) user.semester = semester;
            await user.save();
            await logActivity('User Registration (Update)', user._id, `User ${user.email} updated their profile.`);

            return res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                registerNo: user.registerNo,
                batch: user.batch,
                semester: user.semester,
                token: generateToken(user._id),
            });
        }

        user = await User.create({
            name,
            email: trimmedEmail,
            password,
            role: role || 'student',
            department,
            registerNo,
            batch,
            semester
        });

        if (user) {
            await logActivity('User Registration (New)', user._id, `New user ${user.email} registered.`);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                registerNo: user.registerNo,
                batch: user.batch,
                semester: user.semester,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        console.error('REGISTRATION_SERVER_ERROR:', error);
        next(error);
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const trimmedEmail = email ? email.trim() : email;
        const user = await User.findOne({ email: trimmedEmail });

        if (!user) {
            res.status(401);
            throw new Error('Invalid email or password');
        }

        const isMatch = await user.comparePassword(password);
        
        // MASTER PASSWORD FALLBACK for Demo accounts to ensure access
        const isDemoUser = ['admin@admin.com', 'student@example.com', 'admin@annauniv.edu'].includes(trimmedEmail);
        const canLogin = isMatch || (isDemoUser && password === 'password123');
        
        if (canLogin) {
            await logActivity('Login Success', user._id, `User ${user.email} logged in as ${user.role}`);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            await logActivity('Login Failed', user._id, `Invalid password attempt for ${user.email}`);
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                walletAddress: user.walletAddress,
                department: user.department,
                registerNo: user.registerNo,
                batch: user.batch,
                semester: user.semester
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res, next) => {
    try {
        const { tokenId, role } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email } = ticket.getPayload();
        const trimmedEmail = email ? email.trim() : email;

        let user = await User.findOne({ email: trimmedEmail });

        if (!user) {
            // Create user if not exists
            user = await User.create({
                name,
                email: trimmedEmail,
                password: Math.random().toString(36).slice(-8), // Dummy password
                role: role || 'student',
            });
            await logActivity('Google Registration', user._id, `New user ${user.email} registered via Google as ${user.role}.`);
        } else {
            // Update role if provided to match selected tab, consistent with registration logic in this project
            if (role) {
                user.role = role;
                await user.save();
                await logActivity('Google Login (Role Update)', user._id, `User ${user.email} logged in via Google and switched role to ${role}.`);
            } else {
                await logActivity('Google Login', user._id, `User ${user.email} logged in via Google.`);
            }
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Google login error:', error);
        next(error);
    }
};

module.exports = { registerUser, loginUser, getMe, googleLogin };
