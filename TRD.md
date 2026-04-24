# Technical Requirements Document (TRD)

## 1. Purpose

This document describes the design, architecture, and testing strategy for the Time-Off Microservice in the Wizdaa assessment. The system must manage time-off requests, maintain balance integrity, and support HCM synchronization through real-time and batch endpoints.

## 2. Problem Statement

Employees request time off through a ReadyOn-style interface, while the Human Capital Management (HCM) system remains the authoritative source of leave balance data. Changes can occur outside this microservice, and the service must remain defensively consistent with HCM.

## 3. Goals

- Maintain accurate per-employee, per-location time-off balances.
- Provide rapid feedback for request creation and approval.
- Support HCM real-time balance queries and batch balance updates.
- Remain defensive against invalid dimensions, stale balances, and external HCM changes.
- Provide secure access control with role-based authorization.

## 4. Requirements Mapping

### Functional

- Authenticate users via JWT.
- Create, approve, reject, and cancel time-off requests.
- Track pending, used, and available balance values.
- Query real-time balances from HCM.
- Accept batch balance updates from HCM.
- Log HCM sync events for visibility and audit.

### Non-Functional

- Use NestJS with SQLite and Prisma.
- Provide robust validation using class-validator.
- Maintain a clean architecture with modules and providers.
- Include documentation and test coverage.

## 5. Architecture Overview

The microservice is structured as modular NestJS packages:

- `src/auth`: authentication, JWT, registration, and login
- `src/time-off`: request lifecycle and balance logic
- `src/hcm`: HCM sync endpoints and defensive processing
- `src/prisma`: database access and ORM integration
- `src/health`: health endpoint for service monitoring
- `src/common`: filters and interceptors for response consistency

The bootstrap flow is handled in `src/main.ts`, which configures global validation, exception transformation, CORS, Helmet, and a common API prefix.

## 6. Data Model

- `User`: employee identity, role, and location association
- `Location`: physical or organizational location dimensions
- `TimeOffBalance`: per-user, per-location, per-year balance state
- `TimeOffRequest`: request lifecycle states for leave booking
- `HcmSyncEvent`: history of batch synchronization events

The model enforces a unique composite index on `(userId, locationId, year)` for balances.

## 7. HCM Sync Design

### Real-time API

The HCM real-time endpoint validates required dimensions and returns the current local balance. It is defensive by verifying the requested balance exists before returning values.

### Batch Sync API

The batch sync endpoint processes a list of balances and updates the local system to reflect HCM values. The service records each update as an `HcmSyncEvent` and marks invalid combinations clearly.

### Defensive Requirements

- Reject requests when no local balance exists for the provided dimensions.
- Validate all required fields before updating state.
- Record all sync events for audit and debugging.

## 8. Business Rules

- Pending days are reserved when a request is created.
- Approval deducts the requested days from available balance and moves them into used days.
- Rejection returns pending days to the available pool without adjusting used days.
- Cancellation can reverse pending or approved requests appropriately.
- HCM batch sync may override available balance and should not break request integrity.

## 9. Alternatives Considered

- Using PostgreSQL instead of SQLite: SQLite was chosen for simplicity in assessment and local execution.
- GraphQL instead of REST: REST was chosen to align with the requested REST endpoints and deliver faster implementation.
- External HCM mock server: HCM sync is implemented internally as endpoints and can be tested through mocking in the test suite.

## 10. Test Strategy

### Unit Tests

- Validate authentication flows.
- Cover request creation, approval, rejection, and cancellation logic.
- Verify HCM realtime and batch sync behavior.

### Integration Tests

- Confirm endpoint routing.
- Validate the application returns the expected root and health responses.

### Coverage

The project is configured with Jest coverage thresholds at 80% for branches, functions, lines, and statements.

## 11. Deployment and Packaging

- The repository can be packaged as a ZIP excluding `node_modules`.
- The service runs on Node.js 18+.
- Docker support is available via `Dockerfile` and `docker-compose.yml`.

## 12. Conclusion

This design delivers a defensively engineered time-off microservice that meets the assessment’s requirements for balance integrity, HCM synchronization, authorization, and documentation. The added test coverage protects business rules and future changes.
