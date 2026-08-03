# IncidentHub (Updated Guide)
**2-week backend portfolio project using Node.js + Express + PostgreSQL (Docker) + Prisma + Redis + BullMQ + Socket.IO + Zod + Swagger + Jest + Supertest**

> This version is designed for learning: implement tools in the right order so you don’t feel overwhelmed.

---

## 1) Goal of this project

Build a backend system where teams can:
- create incidents,
- post updates,
- change status,
- let users subscribe,
- push live updates,
- send background notifications.

You’ll finish in ~2 weeks and have a strong portfolio project.

---

## 2) Final Stack (and what each tool is for)

- **Node.js + Express** → your API server
- **PostgreSQL (Docker)** → main persistent database
- **Prisma** → safer/easier database access + schema migrations
- **Redis** → fast cache + queue infrastructure + rate limit store
- **BullMQ** → background job queue (notifications)
- **Socket.IO** → real-time incident updates
- **Zod** → validate incoming request data
- **Swagger** → interactive API documentation
- **Jest + Supertest** → API testing

---

## 3) Should you use Supabase here?

For this setup: **not required**.

You’ll use:
- **Postgres in Docker locally** (enough for full learning + portfolio)

You can switch to Supabase later for deployment if you want hosted DB.

---

## 4) Build Order (exactly when each technology is implemented)

## Phase 1 — Foundation
### Day 1: Node + Express + TypeScript structure
**Implement now:**
- Express app structure
- route modules
- error middleware (basic)
- env setup

**Why now:** You need a running API before adding other tools.

---

### Day 2: Docker + PostgreSQL + Redis containers
**Implement now:**
- docker-compose with `api`, `postgres`, `redis`
- app connects to Postgres/Redis
- health endpoint confirms services reachable

**Why now:** You establish real backend environment early.

---

## Phase 2 — Database & Data Access
### Day 3: Prisma schema + migrations + seed
**Implement now:**
- Prisma models: User, Incident, IncidentUpdate, Subscription
- migration flow
- seed basic users/incidents

**Why now:** Prisma is your data layer; all business logic depends on it.

---

## Phase 3 — Auth + Validation
### Day 4: JWT auth + role-based authorization
**Implement now:**
- register/login
- auth middleware
- role checks (`viewer`, `maintainer`, `admin`)

**Why now:** Access control should exist before core feature routes.

---

### Day 5: Zod validation
**Implement now:**
- validate body/query/params for auth + incident routes
- standardized validation errors

**Why now:** Prevent bad input before business logic grows.

---

## Phase 4 — Core Business Endpoints
### Day 6: Incident endpoints
**Implement now:**
- create/list/get/update incidents
- status transitions

**Tech in use:** Express + Prisma + Zod + auth/roles

---

### Day 7: Incident updates + subscriptions
**Implement now:**
- add incident timeline updates
- subscribe/unsubscribe to incident notifications

**Why now:** This prepares data flow needed for queue + realtime.

---

## Phase 5 — Performance + Async Patterns
### Day 8: Redis caching + rate limiting
**Implement now:**
- cache incident list endpoint
- invalidate cache on incident changes
- enable global/auth rate limits

**Why now:** You now have read/write traffic worth optimizing.

---

### Day 9: BullMQ queues (producer + worker skeleton)
**Implement now:**
- notification queue
- worker process
- enqueue job on update creation

**Why now:** move heavy work out of request-response cycle.

---

### Day 10: BullMQ notification processing
**Implement now:**
- worker fetches subscribers
- sends mock notifications/log outputs
- retries/failure handling basics

**Why now:** complete async architecture story for portfolio.

---

## Phase 6 — Realtime
### Day 11: Socket.IO events
**Implement now:**
- emit `incident.created`, `incident.updated`, `incident.resolved`
- optional room per incident

**Why now:** You already have incidents/updates; now make them live.

---

## Phase 7 — Quality + Documentation
### Day 12: Swagger docs
**Implement now:**
- document all endpoints
- auth scheme
- request/response examples
- error schemas

**Why now:** API stabilized enough to document accurately.

---

### Day 13: Jest + Supertest tests
**Implement now:**
- auth tests
- permissions tests
- incident/update/subscription tests
- health test

**Why now:** Add confidence before final polish/deploy.

---

### Day 14: Final polish + README + demo
**Implement now:**
- cleanup
- final test pass
- record short demo
- portfolio packaging

---

## 5) Feature Scope (strict 2-week version)

## Must-have
1. Auth + roles
2. Incidents CRUD-lite
3. Updates timeline
4. Subscriptions
5. Queue-based notifications
6. Realtime events
7. Redis caching + rate limits
8. Swagger docs
9. Automated tests
10. Dockerized stack

## Optional (only if ahead)
- scheduled maintenance
- attachment support
- admin analytics endpoint

---

## 6) Endpoints to finish (MVP contract)

- Auth:
  - register
  - login
- Incidents:
  - create
  - list
  - get by id
  - edit metadata
  - update status
- Updates:
  - create incident update
  - list updates by incident
- Subscriptions:
  - subscribe
  - unsubscribe
  - list my subscriptions
- System:
  - health check

---

## 7) Where each technology appears in request flow (mental model)

1. Client sends request to Express.
2. Zod validates input.
3. Auth middleware verifies JWT/role.
4. Prisma reads/writes Postgres.
5. Redis may serve cached response.
6. On update creation:
   - enqueue BullMQ job
   - emit Socket.IO event
7. Worker processes queue in background.
8. Swagger documents this behavior.
9. Jest/Supertest verify it still works.

---

## 8) Testing targets (practical, not excessive)

- successful register/login
- failed login
- maintainer can create incident
- viewer cannot create incident
- incident update changes status correctly
- subscribe/unsubscribe behavior
- health endpoint returns OK
- unauthorized access blocked

Target around 15–25 solid tests.

---

## 9) Common confusion checkpoints (and what to remember)

- **Prisma vs Postgres:** Prisma is not your DB; Postgres is.
- **Redis vs BullMQ:** BullMQ uses Redis.
- **Socket.IO vs BullMQ:** Socket.IO = immediate live push; BullMQ = deferred background work.
- **Zod vs Jest:** Zod validates runtime input; Jest tests your code behavior.
- **Swagger vs Postman:** Swagger is shared interactive API documentation.

---

## 10) Definition of done (portfolio-ready checklist)

- [ ] Full stack runs with one Docker Compose command
- [ ] Auth and role rules working
- [ ] Incident + update + subscription flows complete
- [ ] Queue worker consumes notification jobs
- [ ] Realtime events emitted
- [ ] Cache and rate limiting active
- [ ] Swagger docs complete
- [ ] Tests passing
- [ ] README includes architecture + run steps
- [ ] Demo video recorded

---

## 11) Suggested daily effort

- 2–4 focused hours/day is enough if consistent.
- Finish “must-have” first.
- Do not add optional features until MVP complete.

---

## 12) How to turn this into PDF

Use any one:
1. VS Code + Markdown PDF extension
2. Typora export to PDF
3. Pandoc command line export

File name suggestion:
`IncidentHub-Updated-Implementation-Guide.pdf`

---

## 13) What to ask yourself each day

- What did I finish?
- What blocker did I hit?
- Is this MVP or “nice-to-have”?
- Did I keep scope tight?

This keeps you on schedule and avoids project bloat.

---

## 14) Final encouragement

You do **not** need to master every tool before starting.  
You only need to learn each tool **when it becomes necessary in the build order above**.

That is exactly how real backend engineers work.