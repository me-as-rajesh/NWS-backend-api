# Worker Registration & Login API

## Endpoints

### 1. Worker Registration with Profile Image
**Endpoint:** `POST /api/workers/register`
**Request Type:** `multipart/form-data`

**Required Fields:**
- `name` (string) - Worker's full name
- `username` (string) - Unique username
- `email` (string) - Unique email address
- `phoneNo` (string) - Phone number
- `password` (string) - Password
- `jobname` (string) - Job title/profession

**Optional Fields:**
- `address` (string) - Physical address
- `latitude` (number) - Geographic latitude
- `longitude` (number) - Geographic longitude
- `education` (string) - Educational background
- `about` (string) - Bio/about description
- `experience` (string) - Work experience
- `skills` (string or array) - Skills (comma-separated or array)
- `hourlyRate` (number) - Hourly rate in currency
- `profileImage` (file) - Profile picture (jpeg/jpg/png/gif, max 5MB)

---

## CURL Examples

### 1. Worker Registration with Profile Image (Complete)
```bash
curl -X POST http://localhost:5000/api/workers/register \
  -F "name=Ramesh Kumar" \
  -F "username=ramesh_worker" \
  -F "email=ramesh@example.com" \
  -F "phoneNo=9876543210" \
  -F "password=password123" \
  -F "jobname=Electrician" \
  -F "address=Chennai, Tamil Nadu" \
  -F "latitude=13.0827" \
  -F "longitude=80.2707" \
  -F "education=Diploma in Electrical Engineering" \
  -F "about=Experienced electrician with 5 years in residential and commercial work" \
  -F "experience=5 years experience in electrical installations and repairs" \
  -F "skills=Wiring,Circuit Installation,Troubleshooting,Panel Installation" \
  -F "hourlyRate=500" \
  -F "profileImage=@/path/to/profile.jpg"
```

### 2. Worker Registration with Image (Minimal Required)
```bash
curl -X POST http://localhost:5000/api/workers/register \
  -F "name=John Smith" \
  -F "username=john_plumber" \
  -F "email=john@example.com" \
  -F "phoneNo=9123456789" \
  -F "password=secure123" \
  -F "jobname=Plumber" \
  -F "profileImage=@~/Downloads/profile.png"
```

### 3. Worker Registration without Image
```bash
curl -X POST http://localhost:5000/api/workers/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Sharma",
    "username": "priya_carpenter",
    "email": "priya@example.com",
    "phoneNo": "9988776655",
    "password": "myPassword@123",
    "jobname": "Carpenter",
    "address": "Bangalore, Karnataka",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "education": "High School",
    "about": "Professional carpenter with 3 years experience",
    "experience": "3 years",
    "skills": ["Wood Cutting", "Furniture Making", "Carpentry"],
    "hourlyRate": 400
  }'
```

### 4. Worker Registration with Skills Array
```bash
curl -X POST http://localhost:5000/api/workers/register \
  -F "name=Vikram Patel" \
  -F "username=vikram_mason" \
  -F "email=vikram@example.com" \
  -F "phoneNo=9555443322" \
  -F "password=vikram@pass123" \
  -F "jobname=Mason" \
  -F "address=Mumbai, Maharashtra" \
  -F "latitude=19.0760" \
  -F "longitude=72.8777" \
  -F "education=ITI in Masonry" \
  -F "about=Expert mason with beautiful finishing" \
  -F "experience=6 years" \
  -F "skills=Brickwork,Tiling,Concrete,Finishing" \
  -F "hourlyRate=550" \
  -F "profileImage=@./mason_profile.jpg"
```

---

### 5. Worker Login
**Endpoint:** `POST /api/workers/login`
**Request Type:** `application/json`

**Required Fields:**
- `email` (string) - Worker's email
- `password` (string) - Worker's password

```bash
curl -X POST http://localhost:5000/api/workers/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ramesh@example.com",
    "password": "password123"
  }'
```

---

## Success Responses

### Registration Success (201 Created)
```json
{
  "_id": "67ca2d12a45f1234567890ab",
  "workerId": "67ca2d12a45f1234567890ac",
  "name": "Ramesh Kumar",
  "username": "ramesh_worker",
  "email": "ramesh@example.com",
  "phoneNo": "9876543210",
  "address": "Chennai, Tamil Nadu",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "pimage": "https://res.cloudinary.com/dr14t9sxz/image/upload/v1769601188/nws-workers/ramesh_worker-profile-1769601188103.jpg",
  "jobname": "Electrician",
  "education": "Diploma in Electrical Engineering",
  "about": "Experienced electrician with 5 years in residential and commercial work",
  "experience": "5 years experience in electrical installations and repairs",
  "skills": ["Wiring", "Circuit Installation", "Troubleshooting", "Panel Installation"],
  "hourlyRate": 500,
  "role": "worker",
  "verificationStatus": "pending",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login Success (200 OK)
```json
{
  "_id": "67ca2d12a45f1234567890ab",
  "workerId": "67ca2d12a45f1234567890ac",
  "name": "Ramesh Kumar",
  "username": "ramesh_worker",
  "email": "ramesh@example.com",
  "phoneNo": "9876543210",
  "pimage": "https://res.cloudinary.com/dr14t9sxz/image/upload/v1769601188/nws-workers/ramesh_worker-profile-1769601188103.jpg",
  "jobname": "Electrician",
  "education": "Diploma in Electrical Engineering",
  "about": "Experienced electrician with 5 years in residential and commercial work",
  "experience": "5 years experience in electrical installations and repairs",
  "skills": ["Wiring", "Circuit Installation", "Troubleshooting", "Panel Installation"],
  "hourlyRate": 500,
  "rating": 0,
  "totalJobs": 0,
  "verificationStatus": "pending",
  "role": "worker",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Error Responses

### 400 - Missing Required Fields
```json
{
  "message": "Please provide all required fields: name, username, email, phoneNo, password, jobname"
}
```

### 400 - User Already Exists
```json
{
  "message": "User already exists with that email or username"
}
```

### 400 - Profile Image Upload Failed
```json
{
  "message": "Profile image upload failed: [Cloudinary error details]"
}
```

### 401 - Login Failed
```json
{
  "message": "Invalid email or password"
}
```

### 404 - Worker Profile Not Found
```json
{
  "message": "Worker profile not found"
}
```

---

## Postman Setup

### Worker Registration
**Method:** POST
**URL:** `http://localhost:5000/api/workers/register`

**Body - form-data:**
| Key | Value | Type |
|-----|-------|------|
| name | Ramesh Kumar | Text |
| username | ramesh_worker | Text |
| email | ramesh@example.com | Text |
| phoneNo | 9876543210 | Text |
| password | password123 | Text |
| jobname | Electrician | Text |
| address | Chennai, Tamil Nadu | Text |
| latitude | 13.0827 | Text |
| longitude | 80.2707 | Text |
| education | Diploma in Electrical Engineering | Text |
| about | Experienced electrician... | Text |
| experience | 5 years | Text |
| skills | Wiring,Circuit Installation,Troubleshooting | Text |
| hourlyRate | 500 | Text |
| profileImage | [Select file] | File |

### Worker Login
**Method:** POST
**URL:** `http://localhost:5000/api/workers/login`

**Headers:**
```
Content-Type: application/json
```

**Body - raw JSON:**
```json
{
  "email": "ramesh@example.com",
  "password": "password123"
}
```

---

## Features

✅ Worker registration with profile image upload to Cloudinary
✅ Worker login with role verification
✅ Automatic user profile creation with worker role
✅ Geolocation support (latitude/longitude)
✅ Skills array support (comma-separated or array)
✅ Hourly rate tracking
✅ Verification status (pending, verified, rejected)
✅ Profile image storage on Cloudinary
✅ JWT token generation
✅ Password hashing with bcrypt
✅ Duplicate prevention for email/username

---

## Database Schema

### User Document (for worker)
```javascript
{
  name: "Ramesh Kumar",
  username: "ramesh_worker",
  email: "ramesh@example.com",
  phoneNo: "9876543210",
  password: "$2a$10$...", // hashed
  address: "Chennai, Tamil Nadu",
  latitude: 13.0827,
  longitude: 80.2707,
  pimage: "https://res.cloudinary.com/...",
  jobname: "Electrician",
  role: "worker",
  location: {
    type: "Point",
    coordinates: [80.2707, 13.0827]
  },
  createdAt: "2024-01-28T...",
  updatedAt: "2024-01-28T..."
}
```

### Worker Document
```javascript
{
  userId: ObjectId("67ca2d12a45f1234567890ab"),
  jobname: "Electrician",
  education: "Diploma in Electrical Engineering",
  about: "Experienced electrician...",
  experience: "5 years experience...",
  skills: ["Wiring", "Circuit Installation", ...],
  hourlyRate: 500,
  availability: true,
  rating: 0,
  totalJobs: 0,
  verificationStatus: "pending",
  certificates: []
}
```

---

## Next Steps

1. Test worker registration with Postman
2. Test worker login
3. Verify images in Cloudinary dashboard
4. Check database for user and worker documents
5. Implement worker verification flow
6. Add rating and review system
