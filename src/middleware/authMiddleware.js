const User = require('../models/User');

const protect = async (req, res, next) => {
    // JWT authentication removed. This middleware is now a no-op.
    // If you need caller context, pass explicit IDs in the request body/query.
    return next();
};

const worker = (req, res, next) => {
    // JWT-based role enforcement removed.
    return next();
};

const admin = (req, res, next) => {
    // JWT-based role enforcement removed.
    return next();
};

module.exports = { protect, worker, admin };