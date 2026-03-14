const User = require('../models/User');
const WorkerModel = require('../models/Worker');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            let account = null;

            if (decoded.accountType === 'worker') {
                account = await WorkerModel.findById(decoded.id).select('-password');
            } else {
                account = await User.findById(decoded.id).select('-password');
            }

            if (!account) {
                res.status(401);
                throw new Error('Not authorized, account not found');
            }

            req.user = account;
            req.accountType = decoded.accountType || 'user';

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const worker = (req, res, next) => {
    if (req.user && req.user.role === 'worker') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as worker');
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as admin');
    }
};

module.exports = { protect, worker, admin };