require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_API_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('📤 Testing Image Upload to Cloudinary\n');

// Create a test image (1x1 pixel red PNG)
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

// Test 1: Upload from file path (for reference)
console.log('Test 1: Upload from file path');
cloudinary.uploader.upload(testImagePath, {
    folder: 'nws-users-test',
    public_id: `test-file-${Date.now()}`,
}, (error, result) => {
    if (error) {
        console.log('❌ File path upload failed:', error.message);
    } else {
        console.log('✅ File path upload successful:', result.secure_url);
    }
    
    // Test 2: Upload from Base64 buffer
    console.log('\nTest 2: Upload from Base64 buffer');
    const b64 = pngBuffer.toString('base64');
    const dataURI = `data:image/png;base64,${b64}`;
    
    cloudinary.uploader.upload(dataURI, {
        folder: 'nws-users-test',
        public_id: `test-buffer-${Date.now()}`,
    }, (error, result) => {
        if (error) {
            console.log('❌ Buffer upload failed:', error.message);
            console.log('Error details:', error);
        } else {
            console.log('✅ Buffer upload successful:', result.secure_url);
        }
        
        // Cleanup
        fs.unlinkSync(testImagePath);
        console.log('\n✅ Test complete!');
        process.exit(0);
    });
});
