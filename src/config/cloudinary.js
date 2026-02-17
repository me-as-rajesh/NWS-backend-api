const cloudinary = require('cloudinary').v2;

// Support either explicit vars or the single CLOUDINARY_URL (cloudinary://<API_KEY>:<API_SECRET>@<CLOUD_NAME>)
if (process.env.CLOUDINARY_URL) {
    const url = process.env.CLOUDINARY_URL;
    const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) {
        const [, api_key, api_secret, cloud_name] = match;
        cloudinary.config({ cloud_name, api_key, api_secret });
    } else {
        // If URL present but unexpected format, let cloudinary library try its own parsing
        try {
            cloudinary.config();
        } catch (e) {
            console.warn('⚠️ Failed to parse CLOUDINARY_URL. Provide CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET if needed.');
        }
    }
} else {
    // Fallback to individual env vars (support both naming conventions)
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_API_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;

    if (cloud_name && api_key && api_secret) {
        cloudinary.config({ cloud_name, api_key, api_secret });
    } else {
        console.warn('⚠️ Cloudinary environment variables missing or incomplete.');
        console.warn('Provide either `CLOUDINARY_URL` or all of `CLOUDINARY_CLOUD_NAME|CLOUDINARY_API_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.');
    }
}

module.exports = cloudinary;
