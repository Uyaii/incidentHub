# IncidentHub Cloud Setup Checklist (No Overwhelm Version)

Use this checklist exactly in order.  
Rule: **do not jump ahead**. Finish one section before starting the next.

---

## 0) Mindset / Rules (Read First)

- [ ] I will focus on **one step at a time**.
- [ ] I will not debug 5 things at once.
- [ ] If a step fails, I will fix that step before moving on.
- [ ] “Done is better than perfect.”

---

## 1) Project Readiness

- [x] Open project folder in terminal.
- [x] Confirm Node installed:
  ```bash
  node -v
  npm -v
  ```
- [x] Install dependencies:
  ```bash
  npm install
  ```

---

## 2) Create Cloud Accounts (if not already done)

### Prisma Postgres
- [x] Create Prisma account/login.
- [x] Create a Prisma Postgres database/project.
- [x] Open connection details.
- [x] Copy **Prisma ORM** connection string (`prisma+postgres://...`).

### Redis (Upstash recommended)
- [x] Create Upstash account/login.
- [ ] Create Redis database.
- [ ] Copy Redis connection string (`rediss://...`).

---

## 3) Environment Setup (Critical)

- [ ] Create `.env` from template:
  ```bash
  cp .env.example .env
  ```
- [ ] Fill these values in `.env`:

  - [ ] `PORT=4000`
  - [ ] `DATABASE_URL=prisma+postgres://...` (from Prisma ORM string)
  - [ ] `REDIS_URL=rediss://...` (from Upstash/Redis Cloud)
  - [ ] `JWT_ACCESS_SECRET=<long-random-secret>`
  - [ ] `JWT_EXPIRES_IN=1d`
  - [ ] `CORS_ORIGIN=http://localhost:3000` (or your frontend URL)

- [ ] Verify `.env` is in `.gitignore`.
- [ ] Never commit secrets.

---

## 4) Prisma Initialization

- [x] Generate Prisma client:
  ```bash
  npx prisma generate
  ```

- [x] Run first migration:
  ```bash
  npx prisma migrate dev --name init
  ```

- [x] If migration succeeds, mark done.
- [x] If migration fails, stop and fix before continuing.

---

## 5) Seed Database (Optional but recommended)

- [ ] Run seed command:
  ```bash
  npm run prisma:seed
  ```

- [ ] Confirm seed created users/incidents (via logs or Prisma Studio):
  ```bash
  npx prisma studio
  ```

---

## 6) Start API

- [ ] Run API:
  ```bash
  npm run dev
  ```

- [ ] Confirm server listens on port 4000.
- [ ] Test health endpoint:
  - [ ] Browser/Postman: `http://localhost:4000/api/health`
  - [ ] Expect success response.

---

## 7) Start Worker (Queue Consumer)

Open a **new terminal tab** in same project:

- [ ] Run worker:
  ```bash
  npm run worker
  ```

- [ ] Confirm no Redis connection errors.
- [ ] Keep this terminal running while testing notifications.

---

## 8) Verify Core Connectivity (Must Pass)

### Database check
- [ ] API can read/write to Prisma Postgres (no P1001 errors).

### Redis check
- [ ] API starts without Redis connection failure.
- [ ] Worker connects successfully.
- [ ] Queue jobs can be added and processed.

If either fails:
- [ ] Pause feature coding.
- [ ] Fix connectivity first.

---

## 9) Build Features in Safe Order

### Phase A: Auth + Roles
- [ ] Register endpoint works.
- [ ] Login endpoint returns JWT.
- [ ] Auth middleware verifies JWT.
- [ ] Role middleware enforces `admin/maintainer/viewer`.

### Phase B: Incidents
- [ ] Create incident (maintainer/admin).
- [ ] List incidents.
- [ ] Get incident by ID.
- [ ] Update incident.
- [ ] Change status (`investigating/identified/monitoring/resolved`).

### Phase C: Updates
- [ ] Add incident update.
- [ ] Optional status change on update.
- [ ] List updates for incident.

### Phase D: Subscriptions
- [ ] Subscribe to incident.
- [ ] Unsubscribe from incident.
- [ ] List my subscriptions.

---

## 10) Queue + Realtime

### Queue
- [ ] On update creation, enqueue job in `notifications`.
- [ ] Worker consumes job.
- [ ] Worker logs mock notification output.

### Socket.IO
- [ ] Emit `incident.created`.
- [ ] Emit `incident.updated`.
- [ ] Emit `incident.resolved`.
- [ ] Confirm payload shape is consistent.

---

## 11) Caching + Rate Limiting

### Caching
- [ ] Cache `GET /incidents` in Redis (30–60s TTL).
- [ ] Invalidate cache on incident create/update/status change.

### Rate limiting
- [ ] Add global limiter.
- [ ] Add stricter limiter for auth routes.
- [ ] Verify limits actually trigger.

---

## 12) Testing Checklist

- [ ] Auth tests (register/login success/failure).
- [ ] Incident permission tests (viewer blocked from create).
- [ ] Incident CRUD tests.
- [ ] Updates + status transition tests.
- [ ] Subscription tests.
- [ ] Health test.

Command:
```bash
npm test
```

---

## 13) API Documentation

- [ ] Swagger at `/docs`.
- [ ] OpenAPI JSON at `/docs.json`.
- [ ] Include BearerAuth.
- [ ] Add request/response examples.
- [ ] Add common error responses (400/401/403/404/409/500).

---

## 14) Final Portfolio Polish

- [ ] README updated with cloud setup steps.
- [ ] Architecture diagram updated (cloud DB + cloud Redis).
- [ ] `.env.example` is accurate.
- [ ] Demo data seeded.
- [ ] Short demo video recorded.

---

## 15) If I Get Stuck (Recovery Plan)

When overwhelmed, do this:

1. [ ] Stop all terminals.
2. [ ] Restart only API.
3. [ ] Fix first visible error only.
4. [ ] Restart worker after API is stable.
5. [ ] Re-test health endpoint.
6. [ ] Continue checklist from last completed item.

---

## 16) Daily Progress Tracker (2 Weeks)

### Week 1
- [ ] Day 1: Setup + env + cloud connections
- [ ] Day 2: Prisma schema + migration + seed
- [ ] Day 3: Auth + JWT
- [ ] Day 4: Roles + middleware
- [ ] Day 5: Incident CRUD
- [ ] Day 6: Updates + status transitions
- [ ] Day 7: Subscriptions + basic tests

### Week 2
- [ ] Day 8: Redis caching
- [ ] Day 9: BullMQ producer/worker
- [ ] Day 10: Notification flow
- [ ] Day 11: Socket.IO events
- [ ] Day 12: Swagger docs
- [ ] Day 13: Tests + bug fixes
- [ ] Day 14: README + demo video + final polish

---

## 17) Minimum “I’m Done” Criteria

- [ ] Auth works with JWT
- [ ] Role checks enforced
- [ ] Incidents + updates + subscriptions complete
- [ ] Redis cache + queue working
- [ ] Worker processes jobs
- [ ] Realtime events emitted
- [ ] Swagger docs live
- [ ] 15+ meaningful tests passing
- [ ] README + demo ready

---

You’re doing great. One checkbox at a time.