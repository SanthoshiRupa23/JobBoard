# 🚀 JobBoard — Full-Stack Job Board Application

A comprehensive, production-ready Job Board platform built with **Spring Boot 3.x** (backend), **Angular 17** (frontend), and **MySQL** (database). Features role-based access control, JWT authentication, in-app notifications, and a premium dark-themed UI.

![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-green?style=for-the-badge&logo=springboot)
![Angular](https://img.shields.io/badge/Angular-17-red?style=for-the-badge&logo=angular)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=for-the-badge&logo=mysql)

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Default Credentials](#default-credentials)
- [CI/CD Pipeline](#cicd-pipeline)
- [Deployment](#deployment)

---

## 🏗 Architecture Overview

```
┌─────────────────────┐     HTTP/REST      ┌──────────────────────┐     JPA/JDBC     ┌─────────────┐
│   Angular Frontend  │  ◄──────────────►  │  Spring Boot Backend │  ◄─────────────►  │    MySQL     │
│   (Port 4200)       │   JWT Auth Token   │  (Port 8080)         │    Hibernate      │  (Port 3306) │
│   Angular Material  │                    │  Spring Security     │                   │  jobboard_db │
└─────────────────────┘                    └──────────────────────┘                   └─────────────┘
```

**Monorepo Structure:**
```
JobBoard/
├── backend/          # Spring Boot 3.x REST API
├── frontend/         # Angular 17 SPA
├── .github/          # CI/CD workflows
├── README.md         # This file
├── FEATURES.md       # Detailed feature documentation
└── API.md            # Placeholder (see backend/API.md)
```

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Java 17 | Language runtime |
| Spring Boot 3.5.x | Application framework |
| Spring Security | Authentication & authorization |
| Spring Data JPA | Database access layer |
| Hibernate | ORM |
| MySQL 8.x | Relational database |
| JWT (jjwt 0.12.6) | Stateless token authentication |
| Lombok | Boilerplate reduction |
| Maven | Build tool |

### Frontend
| Technology | Purpose |
|---|---|
| Angular 17 | SPA framework (NgModules architecture) |
| Angular Material | UI component library |
| RxJS | Reactive programming |
| TypeScript | Type-safe JavaScript |
| SCSS | Styling preprocessor |

---

## ✨ Features

### Three User Roles (RBAC)

| Role | Capabilities |
|---|---|
| **Job Seeker** | Register, login, complete profile, upload resume (PDF), search/filter jobs, save jobs, apply to jobs, view application history & status, view notifications |
| **Employer** | Register (requires admin approval), login, create company profile, post/edit/close jobs, view applicants, update application statuses, view notifications |
| **Admin** | Approve/reject employer registrations, view dashboard stats, manage users |

### Key System Features
- 🔐 **JWT Authentication** — Stateless, secure token-based auth
- 🔔 **In-App Notifications** — Triggered on application events and status changes
- 🔍 **Advanced Job Search** — Filter by keyword, location, type, and category
- 📄 **Resume Upload** — PDF file upload with local storage
- 📊 **Dashboard Analytics** — Role-specific stats and metrics
- 🌙 **Dark Theme** — Premium dark-mode UI with Angular Material

---

## 🚀 Getting Started

### Prerequisites
- **Java 17** (JDK)
- **Node.js 18+** and npm
- **MySQL 8.x** running on `localhost:3306`
- **Angular CLI** (`npm install -g @angular/cli`)
- **Maven** (or use included `mvnw` wrapper)

### 1. Database Setup
```sql
CREATE DATABASE IF NOT EXISTS jobboard_db;
```
> The application uses `spring.jpa.hibernate.ddl-auto=update` so tables are auto-created.

### 2. Backend Setup
```bash
cd backend

# Update MySQL credentials in src/main/resources/application.properties if needed
# Default: root / root

# Build and run
./mvnw spring-boot:run
```
The backend starts at `http://localhost:8080`. On first run, it seeds the database with sample data.

### 3. Frontend Setup
```bash
cd frontend
npm install
ng serve
```
The frontend starts at `http://localhost:4200`.

---

## 📁 Project Structure

### Backend
```
backend/src/main/java/com/example/jobboard/
├── config/           # SecurityConfig, DataSeeder
├── controller/       # REST controllers (Auth, Job, Application, Company, Profile, Notification, Admin)
├── dto/              # Request/Response DTOs
├── exception/        # GlobalExceptionHandler, custom exceptions
├── model/            # JPA entities (User, Job, Company, Application, etc.)
│   └── enums/        # Role, JobType, ApplicationStatus, etc.
├── repository/       # Spring Data JPA repositories
├── security/         # JWT provider, filter, entry point, UserDetails
└── service/          # Business logic services
```

### Frontend
```
frontend/src/app/
├── core/             # Singleton services, guards, interceptors, models
├── shared/           # Shared components (navbar, footer, notification bell)
├── auth/             # Login & Registration module
├── landing/          # Public landing page
├── seeker/           # Job Seeker feature module
├── employer/         # Employer feature module
└── admin/            # Admin feature module
```

---

## 🔑 Default Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@jobboard.com` | `Admin@123` |
| **Employer** | `employer1@test.com` | `Password@123` |
| **Employer** | `employer2@test.com` | `Password@123` |
| **Employer** | `employer3@test.com` | `Password@123` |
| **Seeker** | `seeker1@test.com` | `Password@123` |
| **Seeker** | `seeker2@test.com` | `Password@123` |
| **Seeker** | `seeker3@test.com` | `Password@123` |

---

## 🔄 CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci-cd.yml`) automates:

1. **Backend Build** — Java 17 + Maven compile & test
2. **Frontend Build** — Node 18 + Angular production build
3. **Frontend Deploy** — Deploy to Vercel via `vercel-action`

Triggered on pushes to `main` branch.

---

## 🐳 Docker

### Build and run the backend:
```bash
cd backend
docker build -t jobboard-backend .
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/jobboard_db \
  jobboard-backend
```

---

## 📝 API Documentation

See [backend/API.md](backend/API.md) for the complete REST API documentation with all endpoints, request/response schemas, and status codes.

---

## 📄 License

This project is for educational/demonstration purposes.
