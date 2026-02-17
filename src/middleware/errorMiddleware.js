const notFound = (req, res, next) => {
    // Ignore favicon requests to avoid noisy 404 errors from browsers
    if (req.originalUrl === '/favicon.ico') {
        return res.status(204).end();
    }

    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    console.error('❌ Error Handler:', err);
    
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    
    res.json({
        message: err.message || 'An error occurred',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        error: process.env.NODE_ENV === 'production' ? null : err,
    });
};

module.exports = { notFound, errorHandler };