# Design Decisions & Architecture (`DECISIONS.md`)

This living document explains the "why" behind the specific architectural implementations and tradeoff decisions made in this project.

## 1. Service-Oriented Architecture (SOA)
We heavily refactored the project away from "fat controllers" and migrated to a strict **Routes -> Controller -> Service** hierarchy.
* **Why?** Passing the `req` and `res` objects deep into business logic makes testing incredibly difficult and tightly couples the application to Express. By extracting Prisma queries and business calculations into standalone `Service` files, we can easily test logic independently and reuse logic across different routes. Controllers now act purely as extremely thin HTTP routing interfaces.

## 2. Universal Standardized Responses
Every single endpoint in the application strictly maps to a `{ success: boolean, data/message: any }` payload format.
* **Why?** It is frustrating for frontend engineers to consume an API where one endpoint returns `{ "token": "..." }` and another returns `[{ "amount": 100 }]`. Wrapping everything uniformly allows the frontend to confidently write generic Axios interceptors and typed hooks that expect `response.data.data` every time. 

## 3. Custom `asyncHandler` Middleware
We eliminated raw `try/catch` enclosures from all controllers by wrapping them in a higher-order `asyncHandler`.
* **Why?** Writing `try/catch` inside of 25 different controllers constitutes bad boilerplate code. The wrapper natively intercepts Promise rejections and safely forwards them to Express's `next(error)` mechanism to be picked up by our global centralized `errorHandler.js`.

## 4. Test Database Sandboxing
When executing `npm test`, Vitest is configured (via `tests/setup.js`) to dynamically overwrite the `DATABASE_URL` and push the schema to a temporary `test.db` file.
* **Why?** End-to-end and integration tests write test records and perform tears-downs. Doing this on the primary development database introduces extreme risk of wiping out seeded dev data. Using a sandboxed database completely decouples the environments.

## 5. CSV Stream Processing
For importing transactions, we utilized the `csv-parser` package acting on a direct `Readable` stream piped from Multer's in-memory buffer.
* **Why?** If an admin uploads a CSV with 50,000 transactions, parsing it entirely synchronously or holding it entirely in a JSON array can crash standard Node arrays. Streaming limits memory overhead.

## 6. SQLite vs PostgreSQL
* **Why?** SQLite was chosen for this project purely for zero-setup ease of use during demonstration. Because Prisma is our ORM, upgrading to a clustered PostgreSQL database simply requires changing a single environment string and the `provider` line in the schema, requiring strictly zero application code rewrites!

## 7. Access Control Strategy (RBAC)
Role-based access control is implemented using middleware that validates the user's role before allowing access to protected routes.

- Viewer: Read-only access
- Analyst: Read + dashboard insights
- Admin: Full CRUD access

This approach keeps authorization logic centralized and avoids duplication across controllers.
