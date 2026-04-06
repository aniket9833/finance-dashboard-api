# Finance Dashboard API

A comprehensive financial records management system with role-based access control, real-time dashboard analytics, and secure JWT authentication.


---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)

---

## Overview

Finance Dashboard is a secure, scalable backend API for managing financial records with advanced analytics. It provides features for tracking income and expenses, categorizing transactions, and generating insights through dashboard analytics with role-based access control.

### Key Capabilities

- **User Management**: Register, authenticate, and manage users with role-based permissions
- **Financial Records**: Track income and expenses with categorization
- **Analytics Dashboard**: Real-time financial summaries, trends, and category breakdowns
- **Security**: JWT authentication, rate limiting, CORS, and helmet security headers
- **Data Validation**: Zod-based input validation for all endpoints
- **Database**: PostgreSQL with connection pooling

---

## Features

- ✅ JWT-based authentication
- ✅ Role-Based Access Control (Admin, Analyst, Viewer)
- ✅ RESTful API design
- ✅ Rate limiting & request throttling
- ✅ CORS support
- ✅ Request logging with Morgan
- ✅ Data validation with Zod
- ✅ Helmet security headers
- ✅ Database migrations & seeding
- ✅ Comprehensive error handling
- ✅ Pagination & filtering
- ✅ Health check endpoint

---

## Prerequisites

- **Node.js** 14.0 or higher
- **npm** 6.0 or higher
- **PostgreSQL** 12.0 or higher
- **Git** (optional)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/aniket9833/finance-dashboard-api.git
cd finance-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables


### 4. Initialize Database

```bash
# Run database migrations
npm run db:migrate

# Seed database with initial data (optional)
npm run db:seed
```

### 5. Start Development Server

```bash
npm start
```

The server will start on `http://localhost:3000` by default.

### Verify Installation

```bash
# Check health endpoint
curl http://localhost:3000/health

# Expected response:
# {
#   "success": true,
#   "status": "healthy",
#   "timestamp": "2026-04-06T10:30:00.000Z",
#   "database": "connected"
# }
```

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Server Configuration
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_dashboard
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Production Database URL (alternative to individual DB vars)
# DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```





## API Documentation

### Base Configuration

- **Base URL**: `http://localhost:3000/api` (development)
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Request Size Limit**: 10 KB
- **Authentication**: Bearer Token (JWT)

### Security Features

- Helmet.js for HTTP header security
- CORS with configurable origins
- Rate limiting to prevent abuse
- JWT-based authentication
- Role-based authorization
- Input validation with Zod

---

## Authentication & Authorization

### User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access: create/update/delete users & records, view all data & analytics |
| **Analyst** | View users, records, dashboard, and analytics |
| **Viewer** | View records and dashboard only |

### Available Permissions

- `create_user` - Create new user accounts
- `update_user` - Update user information
- `delete_user` - Delete user accounts
- `view_users` - List and view user details
- `create_record` - Create financial records
- `update_record` - Modify financial records
- `delete_record` - Delete financial records
- `view_records` - List and view financial records
- `view_dashboard` - Access dashboard analytics
- `view_analytics` - Access advanced analytics

---

##  API Endpoints

### Authentication Endpoints

#### Register New User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```


#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```


#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

### User Management Endpoints

| Method | Endpoint | Description | Auth | Permission |
|--------|----------|-------------|------|-----------|
| GET | `/api/users` | List all users (paginated) | ✅ | `view_users` |
| GET | `/api/users/:id` | Get specific user | ✅ | `view_users` |
| PATCH | `/api/users/:id` | Update user profile/role | ✅ | `update_user` |
| POST | `/api/users/:id/change-password` | Change user password | ✅ | Own user |
| DELETE | `/api/users/:id` | Delete user account | ✅ | `delete_user` |

#### Get All Users

```http
GET /api/users?page=1&limit=20&search=john
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `search` (search by name or email)


#### Update User

```http
PATCH /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "role": "analyst",
  "status": "active"
}
```

---

### Financial Records Endpoints

| Method | Endpoint | Description | Auth | Permission |
|--------|----------|-------------|------|-----------|
| GET | `/api/records` | List records | ✅ | `view_records` |
| GET | `/api/records/:id` | Get single record | ✅ | `view_records` |
| POST | `/api/records` | Create record | ✅ | `create_record` |
| PATCH | `/api/records/:id` | Update record | ✅ | `update_record` |
| DELETE | `/api/records/:id` | Delete record | ✅ | `delete_record` |

#### Get All Records

```http
GET /api/records?page=1&limit=20&category=salary&type=income
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20)
- `category` (filter by category)
- `type` (income/expense)
- `search` (search by description)
- `date_from` (ISO 8601 format)
- `date_to` (ISO 8601 format)


#### Create Record

```http
POST /api/records
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500,
  "category": "food",
  "type": "expense",
  "description": "Weekly grocery shopping",
  "date": "2026-04-06"
}
```


**Supported Categories**:
- Income: `salary`, `investment`, `freelance`, `rental`, `bonus`, `refund`
- Expense: `food`, `transport`, `utilities`, `entertainment`, `healthcare`, `other`

---

### Dashboard Analytics Endpoints

| Method | Endpoint | Description | Auth | Permission |
|--------|----------|-------------|------|-----------|
| GET | `/api/dashboard` | Full dashboard snapshot | ✅ | `view_dashboard` |
| GET | `/api/dashboard/summary` | Aggregated totals | ✅ | `view_dashboard` |
| GET | `/api/dashboard/category-breakdown` | Breakdown by category | ✅ | `view_dashboard` |
| GET | `/api/dashboard/monthly-trends` | Monthly trends | ✅ | `view_dashboard` |
| GET | `/api/dashboard/weekly-trends` | Weekly trends | ✅ | `view_dashboard` |
| GET | `/api/dashboard/recent-activity` | Recent transactions | ✅ | `view_dashboard` |

#### Get Full Dashboard

```http
GET /api/dashboard
Authorization: Bearer <token>
```



#### Get Summary

```http
GET /api/dashboard/summary?date_from=2026-01-01&date_to=2026-04-06
Authorization: Bearer <token>
```



---

### Health Check Endpoint

```http
GET /health
```



**Response** (503 - Database Error):
```json
{
  "success": false,
  "status": "unhealthy",
  "database": "disconnected"
}
```

---




### Production Deployed URL

Once deployed, your API will be accessible at:

```
https://finance-dashboard-api-tn9i.onrender.com/api
```


---



### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid credentials |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable - Database disconnected |

---

