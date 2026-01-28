# User Registration with Cloudinary Image Upload

## User Registration Schema

The user registration model includes the following ordered fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | MongoDB unique identifier |
| `name` | String | ✓ Yes | User's full name |
| `username` | String | ✓ Yes | Unique username |
| `email` | String | ✓ Yes | Unique email address |
| `phoneNo` | String | ✓ Yes | Phone number |
| `password` | String | ✓ Yes | Hashed password (bcrypt) |
| `address` | String | No | User's physical address |
| `latitude` | Number | No | Geographic latitude coordinate |
| `longitude` | Number | No | Geographic longitude coordinate |
| `pimage` | String | No | Profile image URL (Cloudinary) |
| `jobname` | String | No | Job title/profession |
| `role` | String | No | Role type: 'user', 'worker', 'admin' (default: 'user') |
| `createdAt` | Date | Auto | Record creation timestamp |
| `updatedAt` | Date | Auto | Record update timestamp |

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (.env)
Add these to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 3. Create uploads directory
```bash
mkdir -p uploads
```

## API Documentation

### Register User with Profile Image
**Endpoint:** `POST /api/auth/register`

**Request Type:** `multipart/form-data`

**Required Fields:**
- `name` (string) - User full name
- `username` (string) - Unique username
- `email` (string) - Unique email address
- `phoneNo` (string) - Phone number
- `password` (string) - Password

**Optional Fields:**
- `address` (string) - User's physical address
- `latitude` (number) - Geographic latitude
- `longitude` (number) - Geographic longitude
- `jobname` (string) - Job title/profession
- `role` (string) - 'user' | 'worker' | 'admin' (default: 'user')
- `profileImage` (file) - Profile picture (jpeg/jpg/png/gif, max 5MB)

---

## CURL Examples

### 1. Complete Registration with All Fields
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -F "name=Valli Manikkam" \
  -F "username=vallimaniikkam" \
  -F "email=valli@gmail.com" \
  -F "phoneNo=6329258140" \
  -F "password=password123" \
  -F "address=வேலூர்பட்டி" \
  -F "latitude=79.798651" \
  -F "longitude=11.9070289" \
  -F "jobname=Teacher" \
  -F "role=worker" \
  -F "profileImage=@/path/to/image.jpg"
```

### 2. Registration with Location and Job (No Image)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "phoneNo": "+1234567890",
    "password": "password123",
    "address": "123 Main Street",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "jobname": "Engineer",
    "role": "worker"
  }'
```

### 3. Registration with Image Only (Minimal Fields)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -F "name=Jane Smith" \
  -F "username=janesmith" \
  -F "email=jane@example.com" \
  -F "phoneNo=+9876543210" \
  -F "password=securePass123" \
  -F "profileImage=@~/Downloads/profile.png"
```

### 4. Basic Registration (No Optional Fields)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Johnson",
    "username": "bobjohnson",
    "email": "bob@example.com",
    "phoneNo": "+1122334455",
    "password": "myPassword2024"
  }'
```

### 5. Worker Registration with Complete Details
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -F "name=Ramesh Kumar" \
  -F "username=rameshkumar" \
  -F "email=ramesh@example.com" \
  -F "phoneNo=9876543210" \
  -F "password=Ram@2024" \
  -F "address=Chennai, Tamil Nadu" \
  -F "latitude=13.0827" \
  -F "longitude=80.2707" \
  -F "jobname=Electrician" \
  -F "role=worker" \
  -F "profileImage=@./worker_profile.jpg"
```

---

## Success Response (201 Created)

```json
{
  "_id": "67ca2d12a45f1234567890ab",
  "name": "Valli Manikkam",
  "username": "vallimaniikkam",
  "email": "valli@gmail.com",
  "phoneNo": "6329258140",
  "address": "வேலூர்பட்டி",
  "latitude": 79.798651,
  "longitude": 11.9070289,
  "pimage": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/nws-users/profile.jpg",
  "jobname": "Teacher",
  "role": "worker",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Y2EyZDEyYTQ1ZjEyMzQ1Njc4OTBhYiIsImlhdCI6MTcwNDEwMDAwMH0.abc123xyz..."
}
```

---

## Error Response Examples

### 400 - Missing Required Fields
```json
{
  "message": "Please provide all required fields: name, username, email, phoneNo, password"
}
```

### 400 - User Already Exists
```json
{
  "message": "User already exists with that email or username"
}
```

### 400 - Invalid Image File
```json
{
  "message": "Only image files are allowed (jpeg, jpg, png, gif)"
}
```

### 400 - Image Too Large
```json
{
  "message": "File too large. Maximum size is 5MB"
}
```

### 400 - Image Upload Failed
```json
{
  "message": "Image upload failed: [Cloudinary error details]"
}
```

---

## Postman Setup

1. **Method:** POST
2. **URL:** `http://localhost:5000/api/auth/register`
3. **Headers:** Auto-generated with multipart/form-data
4. **Body - form-data:**

   | Key | Value | Type |
   |-----|-------|------|
   | `name` | John Doe | Text |
   | `username` | johndoe | Text |
   | `email` | john@example.com | Text |
   | `phoneNo` | +1234567890 | Text |
   | `password` | password123 | Text |
   | `address` | 123 Main Street | Text |
   | `latitude` | 40.7128 | Text |
   | `longitude` | -74.0060 | Text |
   | `jobname` | Engineer | Text |
   | `role` | worker | Text |
   | `profileImage` | [Select your image file] | File |

---

## Features

✅ Ordered schema with all fields organized by category (Basic, Profile, Job, Role)
✅ Multipart form-data support for file uploads
✅ Cloudinary image storage and optimization
✅ Geolocation support (latitude/longitude)
✅ Job title/profession field
✅ Image validation (type and size)
✅ Automatic temporary file cleanup
✅ JWT token generation on successful registration
✅ Password hashing with bcrypt
✅ Duplicate email and username prevention
✅ Comprehensive error handling
✅ All optional fields are truly optional
✅ Support for multiple user roles (user, worker, admin)

## Important Notes

- **Required Fields:** name, username, email, phoneNo, password
- **Optional Fields:** All other fields are optional
- **Maximum image file size:** 5MB
- **Accepted image formats:** JPEG, JPG, PNG, GIF
- **Images stored in:** Cloudinary under `nws-users` folder
- **Coordinates:** Use standard decimal format (e.g., 40.7128, -74.0060)
- **Job Name:** Can store any profession/job title (e.g., Teacher, Engineer, Electrician)
- **Role Options:** 'user' (default), 'worker', 'admin'
- **All sensitive data** (passwords) are hashed before storage using bcrypt

---

## Data Model Example

```javascript
{
  "_id": ObjectId("67ca2d12a45f1234567890ab"),
  "name": "Valli Manikkam",
  "username": "vallimaniikkam",
  "email": "valli@gmail.com",
  "phoneNo": "6329258140",
  "password": "$2a$10$jAkek1B...", // Hashed
  "address": "வேலூர்பட்டி",
  "latitude": 79.798651,
  "longitude": 11.9070289,
  "pimage": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/nws-users/profile.jpg",
  "jobname": "Teacher",
  "role": "worker",
  "location": {
    "type": "Point",
    "coordinates": [11.9070289, 79.798651]
  },
  "createdAt": "2024-01-28T10:00:00.000Z",
  "updatedAt": "2024-01-28T10:00:00.000Z"
}
```
