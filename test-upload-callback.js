require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_API_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('📤 Testing Cloudinary Upload with Callback (Exact Auth Flow)\n');

// Create a test image
const testImagePath = path.join(__dirname, 'test-image.png');
const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41,
    0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d,
    0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
    0x44, 0xae, 0x42, 0x60, 0x82
]);

fs.writeFileSync(testImagePath, pngBuffer);
console.log('✅ Test image created\n');

// Simulate the exact auth controller flow
async function testUpload() {
    const username = 'testuser';
    const mimetype = 'image/png';
    const buffer = pngBuffer;

    console.log('🔍 Starting Cloudinary upload...');
    console.log('File info:', {
        originalname: 'test-image.png',
        mimetype: mimetype,
        size: buffer.length,
    });

    try {
        // Validate file
        if (!buffer || buffer.length === 0) {
            throw new Error('File buffer is empty');
        }

        if (!mimetype) {
            throw new Error('File mimetype is missing');
        }

        // Convert buffer to Base64 data URI
        const b64 = Buffer.from(buffer).toString('base64');
        const dataURI = `data:${mimetype};base64,${b64}`;

        console.log('📤 Uploading to Cloudinary...');
        console.log('Data URI length:', dataURI.length);

        // Use callback-based approach
        const uploadPromise = new Promise((resolve, reject) => {
            cloudinary.uploader.upload(
                dataURI,
                {
                    folder: 'nws-users',
                    public_id: `${username}-${Date.now()}`,
                    resource_type: 'auto',
                    timeout: 60000,
                },
                (error, result) => {
                    if (error) {
                        console.error('❌ Cloudinary API Error:', {
                            message: error.message,
                            http_code: error.http_code,
                            status: error.status,
                        });
                        reject(error);
                    } else {
                        console.log('✅ Image uploaded successfully');
                        resolve(result);
                    }
                }
            );
        });

        const result = await uploadPromise;
        console.log('✅ Upload Complete!');
        console.log('Secure URL:', result.secure_url);
        console.log('Public ID:', result.public_id);
        console.log('Size:', result.bytes, 'bytes');

    } catch (error) {
        console.error('❌ Upload Error Details:');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    } finally {
        fs.unlinkSync(testImagePath);
        console.log('\n✅ Test complete!');
        process.exit(0);
    }
}

testUpload();
