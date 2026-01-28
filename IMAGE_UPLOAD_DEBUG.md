# Image Upload Debugging Guide

## ✅ Fixes Applied

1. **Enhanced Error Logging** - More detailed error messages with full context
2. **Better Error Handling** - Handles cases where error object structure varies
3. **Improved Error Middleware** - Logs all errors for debugging
4. **Cloudinary Verification** - Validates environment variables on startup

## 📋 Verification Steps

### Step 1: Verify .env File
```bash
# Check these are set in .env
echo $CLOUDINARY_API_NAME
echo $CLOUDINARY_API_KEY
echo $CLOUDINARY_API_SECRET
```

Expected output:
```
dr14t9sxz
186662275142611
MKJEkSJ_u3nQd06w18oWWE7041Q
```

### Step 2: Test Cloudinary Connection
```bash
node test-cloudinary.js
```

Should show:
```
✅ Connection Successful!
```

### Step 3: Test Image Upload
```bash
node test-upload.js
```

Should show:
```
✅ Buffer upload successful: https://res.cloudinary.com/...
```

### Step 4: Test with Postman

**Method:** POST
**URL:** `http://localhost:5000/api/auth/register`
**Body - form-data:**

| Key | Value | Type |
|-----|-------|------|
| name | John Doe | Text |
| username | johndoe123 | Text |
| email | john@example.com | Text |
| phoneNo | 9876543210 | Text |
| password | password123 | Text |
| profileImage | [Select image file] | File |

## 🔍 If Error Still Appears

1. **Check Server Logs**
   - Look for `❌ Cloudinary Upload Error` message
   - It will show the exact error from Cloudinary

2. **Verify Image File**
   - Make sure file is JPEG, JPG, PNG, or GIF
   - Check file is < 5MB

3. **Check Environment Variables**
   ```bash
   cat .env | grep CLOUDINARY
   ```

4. **Restart Server**
   ```bash
   npm run dev
   ```

## 📝 Example Success Response

```json
{
  "_id": "67ca2d12a45f1234567890ab",
  "name": "John Doe",
  "username": "johndoe123",
  "email": "john@example.com",
  "phoneNo": "9876543210",
  "pimage": "https://res.cloudinary.com/dr14t9sxz/image/upload/v1769600562/nws-users/johndoe123-1769600561573.png",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| "Image upload failed: undefined" | Check Cloudinary credentials in .env |
| File not accepted | Ensure image is JPEG/PNG/GIF and < 5MB |
| "Only image files allowed" | File mimetype not recognized |
| Connection timeout | Cloudinary API might be down or firewall issue |

## 🚀 Next Steps

1. Run test files to verify setup
2. Test with Postman using real image file
3. Check server console for detailed logs
4. Create new user with image
5. Verify image URL in MongoDB
