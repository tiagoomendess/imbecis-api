# Imbecis API

Backend API for reporting abusive parking in Portugal.  
The platform collects reports from users, runs a community review workflow, and publishes confirmed incidents while dispatching notifications to external channels.

## Business Flow (How the platform works)

1. A user creates a report and uploads a car photo.
2. The system enriches the report with geolocation metadata (address/municipality).
3. The report is sent to community review, where users vote.
4. If the vote threshold is reached, the report moves to notification and privacy-processing steps.
5. After plate blurring and final checks, the report is published in the public feed and linked to a plate history.
6. Rejected or moderated reports are removed from public lifecycle and sensitive metadata is scrubbed.

This lifecycle is implemented through report statuses (`new`, `fill_geo_info`, `review`, `notify`, `confirmed_blur_plates`, `confirmed`, plus moderation statuses such as `rejected` and `removed`).

## Architecture Overview

- **Stack**: Node.js, TypeScript, Express.
- **Persistence**: MongoDB (native Mongo driver in model layer).
- **Storage**: S3-compatible object storage (Cloudflare R2-style setup).
- **Scheduling**: `node-cron` worker for asynchronous pipeline steps.
- **Validation**: `class-validator` DTO validation middleware.
- **Security middleware**: `helmet`, CORS config, and global rate limiting.

Code organization follows a layered style:
- `routes` -> endpoint registration
- `controllers` -> HTTP handling + response shaping
- `useCases` -> business logic
- `models` -> database operations
- `jobs` -> scheduled async workflow steps

## Main API Areas

- `/reports`
  - Create, upload/update pictures, vote, moderation/admin updates, public feed, review queues, heat map.
- `/plates`
  - Query plate history and reports associated with a plate.
- `/regions`
  - Manage notification regions (geofenced targets for dispatching notifications).
- `/users`
  - Placeholder endpoints.

## Data Model (Core Collections)

- `reports`: full lifecycle entity (status, location, media refs, reporter metadata, moderation flags).
- `reportVotes`: voting records and anti-duplicate controls.
- `plates`: normalized plate identity and linkage to confirmed reports.
- `notificationRegions`: polygon regions with recipient configuration.
- `notificationHistory`: delivery audit/history entries.
- `adminAccounts`: admin authorization by trusted device/IP mapping.

## Security and Abuse Controls

- Request context injection for `device-uuid`, IP and user-agent.
- DTO validation for request payloads.
- Admin-only flows guarded by device/IP checks.
- One-time CSRF-like token checks for key write actions (e.g., voting/picture upload).
- Rate limiting and creation/vote throttling to reduce spam.
- Sensitive metadata redaction after moderation outcomes.

## Background Jobs and Integrations

Cron worker runs periodic jobs that:
- fill geolocation details (GeoAPI.pt),
- dispatch notifications (email/reddit based on feature flags),
- blur plates before final publication.

External integrations include:
- S3-compatible storage for images,
- GeoAPI.pt reverse geocoding,
- Mailjet for email delivery,
- Reddit posting for public notification channels.

## Running Locally

### Requirements
- Node.js (LTS recommended)
- MongoDB
- Environment variables configured (see `.env.example`)

### Setup

```bash
npm install
npm run build
```

### Start API

```bash
npm run dev
```

Production-style start:

```bash
npm run build
npm start
```

### Start cron worker

```bash
npm run build
npm run cron
```

## Environment Configuration

The project is configured via `.env` and includes:
- app/server settings (`PORT`, `SERVER`, `APP_URL`),
- MongoDB connection (`MONGO_URI`, `MONGO_DB`),
- S3/R2 credentials and endpoint,
- GeoAPI/Mailjet/Reddit credentials,
- feature flags for outbound notifications.

## Notes

- Authentication is lightweight and operationally driven (device/IP trust), not a full user-account JWT system.
- CSRF token storage is in-memory, so multi-instance deployments need a shared token strategy.
- Endpoint behavior assumes trusted proxy/network setup when forwarding client IP information.