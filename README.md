# Finance Dashboard Backend

A production-quality finance dashboard backend. This project serves as a robust, heavily-componentized API for managing financial transactions, users, and dashboard analytics, demonstrating best practices in enterprise architecture, automated testing, and security.

## 🚀 Live Deployment

This backend is deployed on **Railway** at:

| Resource | URL |
|---|---|
| **Swagger UI (API Docs)** | [https://finance-dashboard-backend-production-aad2.up.railway.app/api-docs](https://finance-dashboard-backend-production-aad2.up.railway.app/api-docs) |
| **Health Check** | [https://finance-dashboard-backend-production-aad2.up.railway.app/health](https://finance-dashboard-backend-production-aad2.up.railway.app/health) |

---

## Major Features
- **Service-Oriented Architecture (SOA)**: Clean separation of Routes, Controllers, and Services.
- **Automated Integration Testing**: Fully verified isolated test suites using Vitest and Supertest.
- **Bulk Data Handling**: CSV Import and Export capabilities for transactions.
- **Standardized API Responses**: Every endpoint strictly returns a `{ success, data/message }` schema.
- **Complete CRUD & RBAC**: Manage transactions with soft deletes, shielded by three roles: VIEWER, ANALYST, and ADMIN.
- **Secure Authentication**: JWT and bcrypt password hashing.
- **Validation & Security**: Request validation using Zod, fortified with Helmet and Rate Limiting.
- **Unified Error Handling**: Custom `asyncHandler` logic drastically reduces duplicated try-catch blocks.

## Tech Stack
| Technology | Purpose | Why chosen |
|---|---|---|
| **Node.js / Express** | Runtime & Framework | Fast, ubiquitous, and lightweight. |
| **Prisma (PostgreSQL)** | Database & ORM | Production-ready storage, robust typed query building. |
| **json2csv & csv-parser** | Data Pipeline | Handles robust bulk financial file uploads and downloads. |
| **Vitest & Supertest**| Testing | Extremely fast test runner with the industry standard HTTP assertion tool. |
| **Zod** | Validation | Type-safe schema validation to catch malformed payloads early. |
| **Helmet & Rate Limit**| Security | Defends against common web vulnerabilities and brute-force attacks. |
| **Railway** | Deployment | Zero-config cloud deployment with built-in PostgreSQL support. |

## Quick Start
```bash
git clone <repository-url>
cd finance-dashboard
npm install
cp .env.example .env
npm run db:migrate
npm run seed
npm run dev
```

## Running Tests
Tests run in total isolation natively using a temporary PostgreSQL test database to protect your development data.
```bash
# Run the test suite once
npm run test

# Run tests in watch mode (TDD)
npm run test:watch
```

## Postman Testing
A complete Postman collection is included with:
- Automated token handling
- Role-based access testing
- Built-in test assertions

Steps:
1. Import collection
2. Run "Login"
3. Test all endpoints

Location:
`/postman/finance-dashboard.postman_collection.json`

## Environment Variables
| Variable | Description | Example |
|---|---|---|
| DATABASE_URL | Connection string for the database | "file:./dev.db" |
| JWT_SECRET | Secret key for JWT signing | "super-secret" |
| JWT_EXPIRES_IN | Token lifespan | "7d" |
| PORT | Server listening port | 3000 |
| NODE_ENV | Application environment | "development" |

## Standardized Response Schema

**Success Response** (200, 201)
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response** (400, 401, 403, 404, 422, 500)
```json
{
  "success": false,
  "message": "Meaningful error message here",
  "details": [] // Optional validation details
}
```

## Role Permissions Table

| Role | Transactions (read) | Transactions (write) | Dashboard | User Management |
|---|---|---|---|---|
| VIEWER | ✅ Yes | ❌ No | ❌ No | ❌ No |
| ANALYST| ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| ADMIN | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

## API Routes Overview
*Full interactive documentation available via Swagger UI at [/api-docs](https://finance-dashboard-backend-production-aad2.up.railway.app/api-docs).*

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Users
- `GET /api/users` 🔒 ADMIN
- `PATCH /api/users/:id/role` 🔒 ADMIN
- `PATCH /api/users/:id/status` 🔒 ADMIN

### Transactions
- `GET /api/transactions/export` 🔒 VIEWER, ANALYST, ADMIN
- `POST /api/transactions/import` 🔒 ADMIN *(Requires multer CSV payload)*
- `GET /api/transactions` 🔒 VIEWER, ANALYST, ADMIN
- `POST /api/transactions` 🔒 ADMIN
- `PUT /api/transactions/:id` 🔒 ADMIN
- `DELETE /api/transactions/:id` 🔒 ADMIN

### Dashboard
- `GET /api/dashboard/summary` 🔒 ANALYST, ADMIN
- `GET /api/dashboard/categories` 🔒 ANALYST, ADMIN
- `GET /api/dashboard/trends` 🔒 ANALYST, ADMIN
- `GET /api/dashboard/recent` 🔒 ANALYST, ADMIN
- `GET /api/dashboard/stats` 🔒 ANALYST, ADMIN
