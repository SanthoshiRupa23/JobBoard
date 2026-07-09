# 📋 JobBoard — Feature Documentation

Comprehensive documentation of all features in the JobBoard application.

---

## 1. Authentication & Security

### 1.1 User Registration
- Users can register as either a **Job Seeker** or an **Employer**
- Email uniqueness is enforced at the database level
- Passwords are hashed using **BCrypt** before storage
- **Seekers** are immediately `ACTIVE` upon registration
- **Employers** are set to `PENDING_APPROVAL` and must be approved by an Admin before they can post jobs
- A JWT token is returned upon successful registration

### 1.2 User Login
- Email/password authentication via Spring Security's `AuthenticationManager`
- On successful login, a **JWT token** (24-hour expiry) is returned
- The token contains the user's email, role, and user ID as claims

### 1.3 JWT Token Security
- All authenticated API requests require an `Authorization: Bearer <token>` header
- The `JwtAuthenticationFilter` intercepts every request, validates the token, and sets the SecurityContext
- Invalid/expired tokens return a `401 Unauthorized` response

### 1.4 Role-Based Access Control (RBAC)
- Three roles: `SEEKER`, `EMPLOYER`, `ADMIN`
- Endpoint-level security enforced in `SecurityConfig`:
  - Public: `GET /api/jobs/**`, `GET /api/companies/**`, `POST /api/auth/**`
  - Seeker-only: `/api/profile/**`, `/api/saved-jobs/**`
  - Employer-only: `POST/PUT/DELETE /api/jobs`, company management
  - Admin-only: `/api/admin/**`
- Angular route guards (`AuthGuard`, `RoleGuard`) protect frontend routes

---

## 2. Job Seeker Features

### 2.1 Profile Management
- Complete a profile with: phone, headline, summary, skills, experience, education, location
- Profile is created on first update (upsert pattern)
- Profile data is displayed alongside applications for employer review

### 2.2 Resume Upload
- Upload a PDF resume (max 10MB)
- Files are stored on the local filesystem under `./uploads/resumes/`
- Each file is given a UUID-prefixed filename to prevent collisions
- Only PDF format is accepted (MIME type validation)

### 2.3 Job Search & Filtering
- **Full-text search** across job titles, descriptions, and locations
- **Filter by:**
  - Job type (Full-Time, Part-Time, Contract, Remote, Internship)
  - Category (Engineering, Design, Marketing, Analytics, etc.)
  - Location
- **Pagination** with configurable page size
- Results sorted by newest first

### 2.4 Job Bookmarking (Save Jobs)
- Save jobs for later review
- Idempotent save — saving an already-saved job is a no-op
- View all saved jobs in a dedicated page
- Remove saved jobs with a single click

### 2.5 Job Application
- Apply to any open job with an optional cover letter
- Duplicate applications are prevented (unique constraint on seeker+job)
- Cannot apply to closed jobs
- Application triggers an **in-app notification** to the employer

### 2.6 Application History
- View all past applications with:
  - Job title, company name, location
  - Current status (Applied, Shortlisted, Interview, Accepted, Rejected)
  - Applied date
  - Status change timeline

---

## 3. Employer Features

### 3.1 Registration & Approval
- Employers register with their details
- Account status starts as `PENDING_APPROVAL`
- Admin must approve the account before the employer can:
  - Create a company profile
  - Post job listings
- Notification sent upon approval/rejection

### 3.2 Company Profile
- Create and manage a company profile:
  - Company name, description, website
  - Location, industry, size
  - Logo URL
- One company per employer (enforced)

### 3.3 Job Posting
- Create job listings with:
  - Title, description, requirements
  - Location, salary range (min/max)
  - Type (Full-Time, Part-Time, Contract, Remote, Internship)
  - Category
- Jobs are created with `OPEN` status
- Edit existing job details
- Close jobs (sets status to `CLOSED`)

### 3.4 Applicant Management
- View all applicants for each job
- Each applicant shows: name, email, phone, headline, resume link
- Update application status through the pipeline:
  ```
  APPLIED → SHORTLISTED → INTERVIEW → ACCEPTED
                                     → REJECTED
  ```
- Each status change triggers an **in-app notification** to the seeker

### 3.5 Employer Dashboard
- Quick stats: total jobs posted, total applications received

---

## 4. Admin Features

### 4.1 Employer Approval
- View all pending employer registrations
- **Approve** — sets status to `ACTIVE`, sends notification
- **Reject** — sets status to `REJECTED`, sends notification
- Only one admin exists (seeded at startup)

### 4.2 Dashboard Statistics
- Total jobs in the system
- Total seekers registered
- Total employers registered
- Total applications submitted
- Pending employer approvals
- Open jobs count

### 4.3 User Management
- View all users with their roles, statuses, and registration dates

---

## 5. Notification System

### 5.1 Notification Types
| Type | Trigger | Recipient |
|---|---|---|
| `APPLICATION_RECEIVED` | Seeker applies to a job | Employer |
| `APPLICATION_STATUS_UPDATED` | Employer updates application status | Seeker |
| `EMPLOYER_APPROVED` | Admin approves employer | Employer |
| `EMPLOYER_REJECTED` | Admin rejects employer | Employer |

### 5.2 Notification Features
- **Badge count** — Unread notification count shown on bell icon
- **Notification list** — All notifications ordered by newest first
- **Mark as read** — Individual or bulk mark-all-as-read
- **Reference links** — Each notification links to the relevant entity (application, job)

### 5.3 Technical Implementation
- Notifications are stored in the `notifications` database table
- Fetched via REST API (polling-based, no WebSockets)
- Frontend polls for unread count every 30 seconds
- Each notification has a `type`, `referenceId`, and `referenceType` for navigation

---

## 6. Data Seeding

On first startup, the `DataSeeder` component populates the database with:

| Entity | Count | Details |
|---|---|---|
| Admin | 1 | `admin@jobboard.com` / `Admin@123` |
| Employers | 3 | Pre-approved with company profiles |
| Companies | 3 | TechCorp Solutions, GreenEnergy Inc., Creative Design Studio |
| Jobs | 5 | Across different categories and types |
| Seekers | 3 | With complete profiles |

---

## 7. Frontend Architecture

### 7.1 Module Structure
- **NgModules-based** architecture (not standalone components)
- **Feature modules**: Auth, Seeker, Employer, Admin, Landing
- **Core module**: Singleton services, guards, interceptors
- **Shared module**: Reusable components (navbar, footer, dialogs)

### 7.2 Design System
- **Angular Material** components throughout
- **Dark theme** as default for premium feel
- **Typography**: Inter (body), Outfit (headings) via Google Fonts
- **Color palette**: Deep indigo primary, coral accent
- **Responsive**: Mobile-first with Material breakpoint observer

### 7.3 State Management
- Services with **RxJS BehaviorSubjects** for reactive state
- JWT token persisted in `localStorage`
- Auth state shared across components via `AuthService`

---

## 8. Security Best Practices

- Passwords hashed with BCrypt (10 rounds)
- JWT tokens signed with HMAC-SHA (HS512)
- CSRF disabled (stateless API)
- CORS restricted to Angular dev server origin
- Input validation with Jakarta Validation annotations
- Global exception handler for consistent error responses
- SQL injection prevented by JPA parameterized queries
- File upload restricted to PDF with size limit
