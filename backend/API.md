# 📘 JobBoard REST API Documentation

Base URL: `http://localhost:8080/api`

All authenticated endpoints require a `Authorization: Bearer <JWT_TOKEN>` header.

---

## 🔐 Authentication

### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "role": "SEEKER"  // "SEEKER" or "EMPLOYER"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "userId": 1,
  "email": "john@example.com",
  "fullName": "John Doe",
  "role": "SEEKER",
  "status": "ACTIVE"
}
```

> **Note:** Employers are registered with status `PENDING_APPROVAL` and must be approved by an Admin.

---

### POST `/auth/login`
Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```

**Response (200):** Same as register response.

---

### GET `/auth/me` 🔒
Get the currently authenticated user's details.

**Response (200):**
```json
{
  "id": 1,
  "email": "john@example.com",
  "fullName": "John Doe",
  "role": "SEEKER",
  "status": "ACTIVE",
  "createdAt": "2026-01-15T10:30:00"
}
```

---

## 💼 Jobs

### GET `/jobs`
Get all open jobs with pagination (public).

**Query Parameters:**
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | int | 0 | Page number (0-based) |
| `size` | int | 10 | Page size |

**Response (200):** Paginated `JobResponse` objects.

---

### GET `/jobs/search`
Search and filter open jobs (public).

**Query Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `keyword` | string | No | Search in title, description, location |
| `type` | string | No | FULL_TIME, PART_TIME, CONTRACT, REMOTE, INTERNSHIP |
| `category` | string | No | Job category |
| `location` | string | No | Location filter |
| `page` | int | No | Page number (default: 0) |
| `size` | int | No | Page size (default: 10) |

---

### GET `/jobs/{id}`
Get a single job by ID (public).

---

### GET `/jobs/my-jobs` 🔒 EMPLOYER
Get all jobs posted by the current employer.

---

### POST `/jobs` 🔒 EMPLOYER
Create a new job listing.

**Request Body:**
```json
{
  "title": "Senior Developer",
  "description": "We are looking for...",
  "location": "San Francisco, CA",
  "salaryMin": 120000,
  "salaryMax": 180000,
  "type": "FULL_TIME",
  "category": "Engineering",
  "requirements": "5+ years experience..."
}
```

---

### PUT `/jobs/{id}` 🔒 EMPLOYER
Update an existing job (own jobs only).

---

### DELETE `/jobs/{id}` 🔒 EMPLOYER
Close a job (sets status to CLOSED, own jobs only).

---

## 📝 Applications

### POST `/applications` 🔒 SEEKER
Apply to a job.

**Request Body:**
```json
{
  "jobId": 1,
  "coverLetter": "I am excited to apply..."
}
```

---

### GET `/applications/seeker` 🔒 SEEKER
Get all applications by the current seeker.

---

### GET `/applications/job/{jobId}` 🔒 EMPLOYER
Get all applications for a specific job (own jobs only).

**Response includes seeker details:** name, email, phone, headline, resume path.

---

### PUT `/applications/{id}/status?status=SHORTLISTED` 🔒 EMPLOYER
Update an application's status.

**Valid statuses:** `APPLIED`, `SHORTLISTED`, `INTERVIEW`, `ACCEPTED`, `REJECTED`

> **Side effect:** Triggers a notification to the seeker.

---

## 🏢 Companies

### GET `/companies`
Get all companies (public).

### GET `/companies/{id}`
Get a company by ID (public).

### GET `/companies/my-company` 🔒 EMPLOYER
Get the current employer's company profile.

### POST `/companies` 🔒 EMPLOYER
Create a company profile (one per employer).

### PUT `/companies` 🔒 EMPLOYER
Update the current employer's company profile.

---

## 👤 Seeker Profile

### GET `/profile` 🔒 SEEKER
Get the current seeker's profile.

### PUT `/profile` 🔒 SEEKER
Create or update the seeker's profile.

**Request Body:**
```json
{
  "phone": "+1-555-0101",
  "headline": "Full-Stack Developer",
  "summary": "Passionate developer...",
  "skills": "Java, Angular, SQL",
  "experience": "3 years at TechCo",
  "education": "B.S. Computer Science",
  "location": "San Francisco, CA"
}
```

### POST `/profile/resume` 🔒 SEEKER
Upload a PDF resume.

**Request:** `multipart/form-data` with `file` field (PDF only, max 10MB).

---

## 🔖 Saved Jobs

### GET `/saved-jobs` 🔒 SEEKER
Get all saved (bookmarked) jobs.

### POST `/saved-jobs/{jobId}` 🔒 SEEKER
Save (bookmark) a job.

### DELETE `/saved-jobs/{jobId}` 🔒 SEEKER
Remove a saved job.

---

## 🔔 Notifications

### GET `/notifications` 🔒
Get all notifications for the current user (ordered by newest first).

### GET `/notifications/unread-count` 🔒
Get the count of unread notifications.

**Response:** `{ "count": 5 }`

### PUT `/notifications/{id}/read` 🔒
Mark a single notification as read.

### PUT `/notifications/read-all` 🔒
Mark all notifications as read.

---

## 🛡 Admin

### GET `/admin/stats` 🔒 ADMIN
Get dashboard statistics.

**Response:**
```json
{
  "totalJobs": 5,
  "totalSeekers": 3,
  "totalEmployers": 3,
  "totalApplications": 0,
  "pendingEmployers": 0,
  "openJobs": 5
}
```

### GET `/admin/employers/pending` 🔒 ADMIN
Get all employers awaiting approval.

### PUT `/admin/employers/{id}/approve` 🔒 ADMIN
Approve an employer registration.

### PUT `/admin/employers/{id}/reject` 🔒 ADMIN
Reject an employer registration.

### GET `/admin/users` 🔒 ADMIN
Get all users in the system.

---

## 📊 Employer Dashboard

### GET `/employer/stats` 🔒 EMPLOYER
Get employer-specific dashboard stats.

**Response:**
```json
{
  "myJobs": 2,
  "myApplications": 10
}
```

---

## ❌ Error Response Format

All errors return a consistent JSON structure:

```json
{
  "timestamp": "2026-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Email is already registered"
}
```

**Validation errors** include per-field details:
```json
{
  "timestamp": "2026-01-15T10:30:00",
  "status": 400,
  "error": "Validation Failed",
  "errors": {
    "email": "Email must be valid",
    "password": "Password must be at least 6 characters"
  }
}
```

---

## 🔒 Legend

| Symbol | Meaning |
|---|---|
| 🔒 | Requires authentication (JWT Bearer token) |
| 🔒 SEEKER | Requires SEEKER role |
| 🔒 EMPLOYER | Requires EMPLOYER role |
| 🔒 ADMIN | Requires ADMIN role |
