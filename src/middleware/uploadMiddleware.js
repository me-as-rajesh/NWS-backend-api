const multer = require('multer');
const path = require('path');

// Use memory storage instead of disk storage (files stored in req.file.buffer)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept any file with an image/* mimetype OR common image extensions
    const mimetypeIsImage = file && file.mimetype && file.mimetype.startsWith('image/');
    const allowedExts = /jpeg|jpg|png|gif|webp|bmp|tiff|svg|heic/;
    const extname = file && file.originalname ? allowedExts.test(path.extname(file.originalname).toLowerCase()) : false;

    if (mimetypeIsImage || extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp, bmp, tiff, svg, heic)'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
