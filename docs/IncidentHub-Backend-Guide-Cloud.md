# IncidentHub Backend Project Guide (Cloud-First)
**A Node.js + Express + Prisma Postgres + Hosted Redis + Queue + WebSocket portfolio project (2-week scope)**

Author: You  
Duration: ~14 days  
Goal: Build a practical backend project that demonstrates real backend engineering skills **without local Docker DB/Redis setup**.

---

## 1) Project Summary

### What you are building
**IncidentHub** is a backend system where teams can:
- create incidents/outages,
- post timeline updates,
- allow users to subscribe to incident notifications,
- broadcast real-time changes through WebSockets,
- process notifications asynchronously using a queue worker.

### Why it stands out in a portfolio
This project demonstrates:
- REST API design
- Authentication and role-based authorization
- Relational database modeling (PostgreSQL with Prisma)
- Background jobs with BullMQ
- Redis usage (cache + queues + rate limit store)
- Real-time backend communication (Socket.IO)
- Testing + API docs
- Cloud-ready configuration

---

## 2) Final Tech Stack

- **Runtime:** Node.js (LTS)
- **Framework:** Express.js
- **Database:** **Prisma Postgres (cloud)**
- **ORM:** Prisma
- **Cache/Queue Broker:** **Hosted Redis (Upstash or Redis Cloud)**
- **Queue:** BullMQ
- **Realtime:** Socket.IO
- **Auth:** JWT
- **Validation:** Zod
- **Docs:** Swagger (OpenAPI)
- **Testing:** Jest + Supertest
- **Optional containerization (later):** Docker for API/worker only

---

## 3) Features and Scope

## MVP (must complete)
1. User registration/login
2. Role-based access (`admin`, `maintainer`, `viewer`)
3. Create/read/update incidents
4. Post incident updates
5. Incident status workflow:
   - `investigating`
   - `identified`
   - `monitoring`
   - `resolved`
6. Subscribe/unsubscribe to incident notifications
7. Queue notification jobs to worker
8. Broadcast incident updates via WebSocket
9. API rate limiting

## Stretch goals (only if time remains)
- Scheduled maintenance events
- Attachment uploads
- Audit logs
- Multi-tenant org support

---

## 4) Architecture Overview (Cloud Services)

### Services you run
- `api`: Express HTTP server (local during development)
- `worker`: BullMQ worker process (local during development)
- `prisma-postgres`: managed cloud database
- `hosted-redis`: managed cloud Redis

### High-level flow
1. Maintainer creates incident through API.
2. API writes incident/update to Prisma Postgres.
3. API emits Socket.IO event (`incident.updated`).
4. API enqueues notification job to BullMQ (Redis).
5. Worker consumes job, sends mock notification.
6. API caches expensive reads in Redis.

---

## 5) Project Structure

```bash
incidenthub/
├─ src/
│  ├─ app.ts
│  ├─ server.ts
│  ├─ config/
│  │  ├─ env.ts
│  │  ├─ prisma.ts
│  │  ├─ redis.ts
│  │  └─ socket.ts
│  ├─ modules/
│  │  ├─ auth/
│  │  ├─ users/
│  │  ├─ incidents/
│  │  ├─ updates/
│  │  └─ subscriptions/
│  ├─ middleware/
│  │  ├─ auth.middleware.ts
│  │  ├─ role.middleware.ts
│  │  ├─ error.middleware.ts
│  │  └─ rateLimit.middleware.ts
│  ├─ jobs/
│  │  ├─ queues.ts
│  │  ├─ producer.ts
│  │  └─ worker.ts
│  ├─ docs/
│  │  └─ swagger.ts
│  ├─ utils/
│  └─ tests/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ .env.example
├─ package.json
├─ tsconfig.json
└─ README.md
```

---

## 6) Database Design (Prisma)

Use the same schema you already have (Role, IncidentStatus, User, Incident, IncidentUpdate, Subscription).

Run:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

If `migrate dev` is problematic in your environment, use:
```bash
npx prisma migrate deploy
npx prisma generate
```

---

## 7) Environment Variables (Cloud)

Create `.env.example`:

```env
NODE_ENV=development
PORT=4000

# Use Prisma ORM connection string from Prisma Postgres dashboard
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_KEY

JWT_ACCESS_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=1d

# Preferred: single Redis URL (Upstash/Redis Cloud)
REDIS_URL=rediss://default:password@host:port

# Optional alternative if your Redis client expects split config
# REDIS_HOST=your-redis-host
# REDIS_PORT=6379
# REDIS_PASSWORD=your-password
# REDIS_TLS=true

CORS_ORIGIN=http://localhost:3000
```

> Notes:
> - `prisma+postgres://` = use with Prisma ORM.
> - `postgres://` = for non-Prisma clients/tools.
> - Keep `.env` out of git.

---

## 8) Cloud Setup (Replacing Local Docker DB/Redis)

## 8.1 Prisma Postgres
1. Create a Prisma Postgres project/database.
2. Copy the **Prisma ORM** connection string.
3. Set it as `DATABASE_URL` in `.env`.
4. Run migrations.

## 8.2 Hosted Redis (Upstash recommended)
1. Create Redis database.
2. Copy the `rediss://` connection string.
3. Set `REDIS_URL` in `.env`.
4. Ensure your Redis client/BullMQ config supports TLS (`rediss`).

---

## 9) Local Development Commands (No Docker Required)

```bash
# 1) install deps
npm install

# 2) setup env
cp .env.example .env
# then fill DATABASE_URL, REDIS_URL, JWT_ACCESS_SECRET

# 3) prisma
npx prisma generate
npx prisma migrate dev --name init

# 4) run api
npm run dev

# 5) run worker (new terminal)
npm run worker
```

---

## 10) API Contract

Base URL: `http://localhost:4000/api/v1`

## Auth
- `POST /auth/register`
- `POST /auth/login`

## Incidents
- `POST /incidents` (admin/maintainer)
- `GET /incidents`
- `GET /incidents/:id`
- `PATCH /incidents/:id` (admin/maintainer)
- `PATCH /incidents/:id/status` (admin/maintainer)

## Updates
- `POST /incidents/:id/updates` (admin/maintainer)
- `GET /incidents/:id/updates`

## Subscriptions
- `POST /incidents/:id/subscribe`
- `DELETE /incidents/:id/unsubscribe`
- `GET /me/subscriptions`

## Health
- `GET /health`

---

## 11) Auth + Authorization Rules

- JWT required for protected routes.
- `viewer`: read-only + subscribe/unsubscribe
- `maintainer`: create/update incidents and updates
- `admin`: full access

Implement middleware:
- `authenticate()`
- `authorize(...roles)`

---

## 12) Queue + Worker Logic

When an incident update is created:
1. Save update to DB.
2. Update incident status (if provided).
3. Emit Socket event `incident.updated`.
4. Add BullMQ job:
   - queue: `notifications`
   - payload: `incidentId`, `updateId`

Worker:
- Fetch subscribed users for incident
- Send mock notifications (console/log first)
- Mark job complete

---

## 13) Realtime (Socket.IO)

- Allow joining room by incident ID:
  - `incident:<incidentId>`
- Emit:
  - `incident.created`
  - `incident.updated`
  - `incident.resolved`

---

## 14) Caching and Rate Limiting

## Cache Strategy
- Cache `GET /incidents` for 30–60 sec in Redis.
- Invalidate on create/update/status change.

## Rate Limiting
- Global: 100 req / 15 min per IP
- Auth routes: 10 req / 15 min per IP
- Use Redis-backed store.

---

## 15) Validation and Error Handling

Use Zod for POST/PATCH bodies.

Unified error format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": []
  }
}
```

---

## 16) Testing Checklist

Minimum:
- Auth register/login success+fail
- Incident create/list/update permissions
- Update status transitions
- Subscribe/unsubscribe behavior
- Health endpoint

Target: 15–25 strong tests.

---

## 17) Swagger Documentation

Expose:
- `/docs` (Swagger UI)
- `/docs.json` (OpenAPI JSON)

Include:
- Bearer auth scheme
- request/response examples
- error responses

---

## 18) Seed Data

Create:
- 1 admin
- 1 maintainer
- 2 viewers
- 2 incidents
- 3–5 updates
- subscriptions

Command:
```bash
npm run prisma:seed
```

---

## 19) Scripts (`package.json`)

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "worker": "ts-node-dev --respawn --transpile-only src/jobs/worker.ts",
    "test": "jest --runInBand",
    "lint": "eslint .",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "prisma:seed": "ts-node prisma/seed.ts"
  }
}
```

---

## 20) 2-Week Plan (Cloud-First)

## Week 1
- **Day 1:** Init project + tooling
- **Day 2:** Cloud DB + cloud Redis config + health checks
- **Day 3:** Prisma schema + migrations + seed
- **Day 4:** Auth + role middleware
- **Day 5:** Incident CRUD
- **Day 6:** Updates + status transitions
- **Day 7:** Subscriptions + tests

## Week 2
- **Day 8:** Redis caching
- **Day 9:** BullMQ producer + worker
- **Day 10:** Notification jobs
- **Day 11:** Socket.IO events
- **Day 12:** Swagger + error polish
- **Day 13:** Tests + cleanup
- **Day 14:** Final README + demo

---

## 21) Deployment Options

- Render
- Railway
- Fly.io
- Northflank

Set production secrets:
- `DATABASE_URL` (Prisma Postgres)
- `REDIS_URL` (hosted Redis)
- `JWT_ACCESS_SECRET`
- `CORS_ORIGIN`

---

## 22) Updated README Checklist

Include:
1. Project overview
2. Architecture diagram (API + Worker + Prisma Postgres + Redis)
3. Features
4. Stack
5. Local setup (cloud env required)
6. Run API + worker
7. API docs URL
8. Tests
9. Env variables
10. Future improvements

---

## 23) Demo Script (3–5 min)

1. Show architecture
2. Register/login
3. Create incident
4. Add update + status change
5. Show worker processing queue
6. Show socket event
7. Show Swagger + tests

---

## 24) Self-Check Rubric

Done when:
- [ ] MVP endpoints work
- [ ] Auth + roles enforced
- [ ] Worker consumes notification jobs
- [ ] Redis cache active for incident list
- [ ] WebSocket events emitted
- [ ] Swagger complete
- [ ] 15+ meaningful tests passing
- [ ] Clean README + demo ready

---

## 25) Quickstart Commands

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run dev
# new terminal
npm run worker
```

---

## 26) Optional: Add Docker Back Later (API/Worker only)

When you’re ready, containerize only API and worker first, while still using cloud Prisma Postgres + cloud Redis. This gives portability without local infra pain.

---

## 27) Final Advice

Your new route is smart:
- ship faster,
- reduce local setup friction,
- still demonstrate production-grade backend skills.

Focus on completing features + tests + docs. That’s what recruiters/interviewers care about most.