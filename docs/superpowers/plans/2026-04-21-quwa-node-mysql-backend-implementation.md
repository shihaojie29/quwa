# Quwa Node MySQL Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Express + MySQL backend for the existing Quwa uniapp data model.

**Architecture:** Add an isolated `server/` TypeScript backend with route handlers depending on a repository interface. Production uses a MySQL repository; tests use an in-memory repository so API behavior is testable without a database server.

**Tech Stack:** Node.js, Express, mysql2/promise, Zod, TypeScript, Vitest, Supertest, MySQL 8.

---

## File Structure

- Create `server/tsconfig.json`: TypeScript config for backend compilation.
- Create `server/src/domain.ts`: backend domain types aligned with `src/types/*`.
- Create `server/src/errors.ts`: typed HTTP errors and error response helper.
- Create `server/src/validation.ts`: Zod schemas for params and request bodies.
- Create `server/src/store/QuwaStore.ts`: repository interface consumed by routes.
- Create `server/src/store/InMemoryQuwaStore.ts`: test/dev memory store.
- Create `server/src/store/MySqlQuwaStore.ts`: MySQL implementation.
- Create `server/src/db/config.ts`: environment parsing.
- Create `server/src/db/pool.ts`: mysql2 pool creation.
- Create `server/src/db/migrate.ts`: run schema SQL.
- Create `server/src/db/seed.ts`: run seed SQL.
- Create `server/src/http/app.ts`: Express app factory.
- Create `server/src/http/routes.ts`: all API routes.
- Create `server/src/index.ts`: production server entry.
- Create `server/sql/schema.sql`: MySQL schema.
- Create `server/sql/seed.sql`: seed data matching Osaka/Kyoto frontend.
- Create `server/.env.example`: backend environment reference.
- Create `server/tests/api.spec.ts`: route behavior tests.
- Create `server/tests/schema.spec.ts`: schema table tests.
- Modify `package.json`: add backend scripts and dependencies.

## Task 1: Dependencies And Backend Config

- [ ] Install backend dependencies: `express`, `mysql2`, `zod`, `dotenv`, `cors`.
- [ ] Install dev dependencies: `tsx`, `supertest`, `@types/express`, `@types/cors`, `@types/supertest`.
- [ ] Add scripts: `server:dev`, `server:build`, `server:start`, `server:migrate`, `server:seed`, `test:server`.
- [ ] Create `server/tsconfig.json`.

## Task 2: Write Failing API Tests

- [ ] Create `server/tests/api.spec.ts`.
- [ ] Test `GET /health`.
- [ ] Test `GET /api/trips/:tripId/bootstrap`.
- [ ] Test budget update.
- [ ] Test itinerary item create/update/delete.
- [ ] Test invalid expense category returns `400`.
- [ ] Test expenses, notes, checklist CRUD.
- [ ] Run `npm run test:server` and verify tests fail because backend files do not exist.

## Task 3: Implement Domain, Store Interface, Memory Store

- [ ] Create `server/src/domain.ts`.
- [ ] Create `server/src/store/QuwaStore.ts`.
- [ ] Create `server/src/store/InMemoryQuwaStore.ts`.
- [ ] Run `npm run test:server`; expect failures move from missing modules to missing routes/app.

## Task 4: Implement Express App And Validation

- [ ] Create `server/src/errors.ts`.
- [ ] Create `server/src/validation.ts`.
- [ ] Create `server/src/http/app.ts`.
- [ ] Create `server/src/http/routes.ts`.
- [ ] Run `npm run test:server`; expect API tests pass.

## Task 5: Add MySQL Schema And Repository

- [ ] Create `server/sql/schema.sql`.
- [ ] Create `server/sql/seed.sql`.
- [ ] Create `server/tests/schema.spec.ts`.
- [ ] Create `server/src/db/config.ts`.
- [ ] Create `server/src/db/pool.ts`.
- [ ] Create `server/src/store/MySqlQuwaStore.ts`.
- [ ] Run `npm run test:server`; expect schema tests pass.

## Task 6: Add Runtime Scripts

- [ ] Create `server/src/db/migrate.ts`.
- [ ] Create `server/src/db/seed.ts`.
- [ ] Create `server/src/index.ts`.
- [ ] Create `server/.env.example`.
- [ ] Run `npm run server:build`.

## Task 7: Full Verification

- [ ] Run `npm run test:server`.
- [ ] Run `npm run server:build`.
- [ ] Run existing `npm test`.
- [ ] Run `npm run type-check`.
- [ ] Run `npm run build:mp-weixin`.

