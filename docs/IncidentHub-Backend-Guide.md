# IncidentHub Backend Project Guide
**A Dockerized Node.js + Express + PostgreSQL + Redis + Queue + WebSocket portfolio project (2-week scope)**

Author: You  
Duration: ~14 days  
Goal: Build a backend project that is practical, unique enough for portfolio, and demonstrates real backend engineering skills.

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
- Relational database modeling (PostgreSQL)
- Background jobs with BullMQ
- Redis usage (cache + queues + rate limit store)
- Real-time backend communication (Socket.IO)
- Dockerized multi-service architecture
- Testing + API docs

---

## 2) Final Tech Stack

- **Runtime:** Node.js (LTS)
- **Framework:** Express.js
- **Database:** PostgreSQL (local Docker) OR Supabase Postgres
- **ORM:** Prisma
- **Cache/Queue Broker:** Redis
- **Queue:** BullMQ
- **Realtime:** Socket.IO
- **Auth:** JWT
- **Validation:** Zod
- **Docs:** Swagger (OpenAPI)
- **Testing:** Jest + Supertest
- **Containerization:** Docker + Docker Compose

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
10. Dockerized local environment

## Stretch goals (only if time remains)
- Scheduled maintenance events
- Attachment uploads (Supabase Storage)
- Audit logs
- Multi-tenant org support

---

## 4) Architecture Overview

### Services (Docker Compose)
- `api`: Express HTTP server
- `worker`: BullMQ worker process
- `postgres`: relational DB
- `redis`: queue + cache + rate limit
- optional `pgadmin`: DB GUI

### High-level flow
1. Maintainer creates incident through API.
2. API writes incident/update to Postgres.
3. API emits Socket.IO event (`incident.updated`).
4. API enqueues notification job to BullMQ.
5. Worker consumes job, sends email/mock notification.
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
│  │  │  ├─ auth.controller.ts
│  │  │  ├─ auth.service.ts
│  │  │  ├─ auth.routes.ts
│  │  │  └─ auth.validation.ts
│  │  ├─ users/
│  │  │  ├─ users.controller.ts
│  │  │  ├─ users.service.ts
│  │  │  └─ users.routes.ts
│  │  ├─ incidents/
│  │  │  ├─ incidents.controller.ts
│  │  │  ├─ incidents.service.ts
│  │  │  ├─ incidents.routes.ts
│  │  │  └─ incidents.validation.ts
│  │  ├─ updates/
│  │  │  ├─ updates.controller.ts
│  │  │  ├─ updates.service.ts
│  │  │  ├─ updates.routes.ts
│  │  │  └─ updates.validation.ts
│  │  └─ subscriptions/
│  │     ├─ subscriptions.controller.ts
│  │     ├─ subscriptions.service.ts
│  │     └─ subscriptions.routes.ts
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
│  │  ├─ jwt.ts
│  │  ├─ logger.ts
│  │  └─ apiResponse.ts
│  └─ tests/
│     ├─ auth.e2e.test.ts
│     ├─ incidents.e2e.test.ts
│     └─ updates.e2e.test.ts
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ docker/
│  ├─ api.Dockerfile
│  └─ worker.Dockerfile
├─ docker-compose.yml
├─ .env.example
├─ package.json
├─ tsconfig.json
└─ README.md
```

---

## 6) Database Design (Prisma)

Create `../prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  admin
  maintainer
  viewer
}

enum IncidentStatus {
  investigating
  identified
  monitoring
  resolved
}

model User {
  id             String         @id @default(uuid())
  email          String         @unique
  passwordHash   String
  fullName       String
  role           Role           @default(viewer)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  createdIncidents Incident[]   @relation("IncidentCreator")
  updates        IncidentUpdate[]
  subscriptions  Subscription[]
}

model Incident {
  id            String          @id @default(uuid())
  title         String
  slug          String          @unique
  description   String
  status        IncidentStatus  @default(investigating)
  severity      String
  isPublic      Boolean         @default(true)
  createdById   String
  createdBy     User            @relation("IncidentCreator", fields: [createdById], references: [id])
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  updates       IncidentUpdate[]
  subscriptions Subscription[]
}

model IncidentUpdate {
  id          String          @id @default(uuid())
  incidentId  String
  incident    Incident        @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  message     String
  status      IncidentStatus?
  createdById String
  createdBy   User            @relation(fields: [createdById], references: [id])
  createdAt   DateTime        @default(now())
}

model Subscription {
  id          String    @id @default(uuid())
  userId      String
  incidentId  String
  createdAt   DateTime  @default(now())
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  incident    Incident  @relation(fields: [incidentId], references: [id], onDelete: Cascade)

  @@unique([userId, incidentId])
}
```

Run:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 7) Environment Variables

Create `.env.example`:

```env
NODE_ENV=development
PORT=4000

DATABASE_URL=postgresql://incidenthub:incidenthub@postgres:5432/incidenthub

JWT_ACCESS_SECRET=supersecret_access_key
JWT_EXPIRES_IN=1d

REDIS_HOST=redis
REDIS_PORT=6379

CORS_ORIGIN=http://localhost:3000
```

---

## 8) Docker Setup

## `docker-compose.yml`

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16
    container_name: incidenthub_postgres
    environment:
      POSTGRES_USER: incidenthub
      POSTGRES_PASSWORD: incidenthub
      POSTGRES_DB: incidenthub
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    container_name: incidenthub_redis
    ports:
      - "6379:6379"

  api:
    build:
      context: ..
      dockerfile: docker/api.Dockerfile
    container_name: incidenthub_api
    env_file:
      - ../.env
    depends_on:
      - postgres
      - redis
    ports:
      - "4000:4000"
    command: sh -c "npx prisma migrate deploy && node dist/server.js"

  worker:
    build:
      context: ..
      dockerfile: docker/worker.Dockerfile
    container_name: incidenthub_worker
    env_file:
      - ../.env
    depends_on:
      - postgres
      - redis
    command: node dist/jobs/worker.js

volumes:
  pg_data:
```

## `docker/api.Dockerfile`
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 4000
```

## `docker/worker.Dockerfile`
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
```

---

## 9) API Contract

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

## 10) Request/Response Examples

## Register
`POST /auth/register`
```json
{
  "email": "maintainer@demo.com",
  "password": "StrongPass123!",
  "fullName": "Demo Maintainer"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "maintainer@demo.com",
    "fullName": "Demo Maintainer",
    "role": "viewer"
  }
}
```

## Login
`POST /auth/login`
```json
{
  "email": "maintainer@demo.com",
  "password": "StrongPass123!"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_here"
  }
}
```

## Create Incident
`POST /incidents`
```json
{
  "title": "Payment Gateway Outage",
  "description": "Users cannot complete card payments",
  "severity": "critical",
  "isPublic": true
}
```

## Add Update
`POST /incidents/:id/updates`
```json
{
  "message": "We identified database connection saturation",
  "status": "identified"
}
```

---

## 11) Auth + Authorization Rules

- JWT required for protected routes.
- `viewer`: read-only + subscribe/unsubscribe
- `maintainer`: create/update incidents and updates
- `admin`: full access, user role management (optional endpoint)

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

This separation shows production-level backend thinking.

---

## 13) Realtime (Socket.IO)

- On client connect, allow joining room by incident ID:
  - `incident:<incidentId>`
- Emit events:
  - `incident.created`
  - `incident.updated`
  - `incident.resolved`
- Payload includes incident summary + latest update

---

## 14) Caching and Rate Limiting

## Cache Strategy
- Cache `GET /incidents` for 30–60 sec in Redis.
- Invalidate cache on create/update/status change.

## Rate Limiting
- Global: e.g. 100 req / 15 min per IP.
- Auth routes stricter: e.g. 10 req / 15 min per IP.
- Use Redis store for distributed-safe limiting.

---

## 15) Validation and Error Handling

Use Zod schemas for all POST/PATCH bodies.

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

Include:
- 400 validation
- 401 unauthorized
- 403 forbidden
- 404 not found
- 409 conflict
- 500 internal error

---

## 16) Testing Checklist (Jest + Supertest)

Minimum test coverage:
- Auth:
  - register success/fail
  - login success/fail
- Incidents:
  - create incident with maintainer token
  - viewer cannot create incident
  - list incidents
- Updates:
  - add update and verify status transition
- Subscriptions:
  - subscribe/unsubscribe idempotency
- Health:
  - returns OK

Target: 15–25 good tests, not 100 tests.

---

## 17) Swagger Documentation

Add OpenAPI docs at:
- `/docs` (Swagger UI)
- `/docs.json` (OpenAPI JSON)

Document:
- Security scheme `BearerAuth`
- All endpoint request/response examples
- Error responses

This is huge for portfolio professionalism.

---

## 18) Seed Data

Create:
- 1 admin user
- 1 maintainer user
- 2 viewer users
- 2 sample incidents
- 3-5 updates
- a few subscriptions

Command:
```bash
npm run prisma:seed
```

---

## 19) Scripts (`package.json`)

Recommended scripts:
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "worker": "node dist/jobs/worker.js",
    "test": "jest --runInBand",
    "lint": "eslint .",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "prisma:seed": "ts-node prisma/seed.ts"
  }
}
```

---

## 20) Day-by-Day Plan (2 Weeks)

## Week 1
- **Day 1:** Initialize project, TypeScript, Express, linting, prettier
- **Day 2:** Docker compose (postgres + redis + api), env config
- **Day 3:** Prisma schema + migrations + seed
- **Day 4:** Auth (register/login/JWT), role middleware
- **Day 5:** Incident CRUD endpoints
- **Day 6:** Incident updates + status transitions
- **Day 7:** Subscriptions + basic tests

## Week 2
- **Day 8:** Redis caching for incident list + invalidation
- **Day 9:** BullMQ queue producer + worker scaffold
- **Day 10:** Notification jobs + subscription fanout
- **Day 11:** Socket.IO realtime events
- **Day 12:** Swagger docs + polish error handling
- **Day 13:** Add tests + fix edge cases
- **Day 14:** Final README + demo recording + deploy

---

## 21) Deployment Options

Fast backend deployment choices:
- **Render** (easy Docker deploy)
- **Railway**
- **Fly.io**
- **Northflank**

If using Supabase Postgres in production:
- set `DATABASE_URL` to Supabase connection string
- keep Redis on hosted provider (Upstash/Redis Cloud)

---

## 22) README Template (what to include)

1. Project overview
2. Architecture diagram
3. Features
4. Tech stack
5. Local setup
6. Docker setup (`docker compose up --build`)
7. API docs URL
8. Test instructions
9. Environment variables
10. Future improvements

---

## 23) Demo Video Script (3–5 min)

1. Show architecture quickly (API + worker + redis + postgres)
2. Register/login and get JWT
3. Create incident as maintainer
4. Add update + status change
5. Show WebSocket event in client/console
6. Show queued notification worker logs
7. Show Swagger docs and tests

---

## 24) Grading Rubric (self-check before portfolio upload)

You are done when:
- [ ] All MVP endpoints work
- [ ] Auth + role checks enforced
- [ ] Queue worker processing notifications
- [ ] Redis cache enabled for incident list
- [ ] WebSocket event emitted on updates
- [ ] Docker compose spins full stack
- [ ] Swagger docs complete
- [ ] At least 15 meaningful tests passing
- [ ] Clean README + demo video ready

---

## 25) Commands Quickstart

```bash
# 1) install deps
npm install

# 2) copy env
cp .env.example .env

# 3) run db + redis + app + worker
docker compose up --build

# 4) in another terminal (if needed)
docker compose exec api npx prisma migrate deploy
docker compose exec api npm run prisma:seed

# 5) open docs
# http://localhost:4000/docs
```

---

## 26) How to Export This to PDF

## Option A: VS Code
1. Install extension: **Markdown PDF**
2. Open `IncidentHub-Backend-Guide.md`
3. `Ctrl+Shift+P` → “Markdown PDF: Export (pdf)”

## Option B: Typora
1. Open `.md` file
2. File → Export → PDF

## Option C: Pandoc (CLI)
```bash
pandoc IncidentHub-Backend-Guide.md -o IncidentHub-Backend-Guide.pdf
```

---

## 27) What to Build Next (your second 2-week project idea)

After IncidentHub, build:
**“Feature Flag Service API”**  
A backend for creating feature flags, targeting rules, rollout percentages, and SDK-style evaluation endpoint.

That pairs perfectly with IncidentHub on your portfolio.

---

## 28) Final Advice

Keep scope tight:
- Finish MVP first.
- Don’t over-engineer.
- Prioritize clean code, docs, and working Dockerized architecture.
- A complete moderate project beats an incomplete complex project.

You now have a strong, interview-friendly backend project plan that can be completed in ~2 weeks.