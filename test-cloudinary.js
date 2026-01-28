require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('🔍 Cloudinary Configuration Test\n');
console.log('Environment Variables:');
console.log('CLOUDINARY_API_NAME:', process.env.CLOUDINARY_API_NAME || '❌ NOT SET');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ NOT SET');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_API_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('\n🔐 Cloudinary API Status:');
console.log('Config loaded:', cloudinary.config());

// Test with a simple API call
cloudinary.api.resources({ max_results: 1 }, (error, result) => {
    if (error) {
        console.log('\n❌ Connection Failed:');
        console.log('Error:', error.message || error);
        console.log('HTTP Code:', error.http_code);
    } else {
        console.log('\n✅ Connection Successful!');
        console.log('Cloud Name:', cloudinary.config().cloud_name);
        console.log('API Key:', cloudinary.config().api_key.substring(0, 5) + '...');
    }
});
