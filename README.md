# Insurance Policy Management Backend

Production-ready Node.js + Express + MongoDB API for insurance policy and follow-up management.

## Folder Structure

```
.
|-- server.js
|-- .env.example
|-- scripts/
|   `-- seed.js
`-- src/
    |-- app.js
    |-- config/
    |   `-- db.js
    |-- controllers/
    |   |-- dashboard.controller.js
    |   |-- followup.controller.js
    |   `-- policy.controller.js
    |-- docs/
    |   `-- swagger.js
    |-- middlewares/
    |   |-- error.middleware.js
    |   `-- validate.middleware.js
    |-- models/
    |   |-- FollowUp.model.js
    |   `-- Policy.model.js
    |-- routes/
    |   |-- dashboard.routes.js
    |   |-- followup.routes.js
    |   |-- index.js
    |   `-- policy.routes.js
    `-- utils/
        |-- ApiError.js
        |-- asyncHandler.js
        |-- response.js
        `-- validators.js
```

## Setup

1. Copy `.env.example` to `.env`
2. Update `MONGO_URI` in `.env`
3. Run:

```bash
npm install
npm run dev
```

## Seed Data

```bash
npm run seed
```

This inserts 10 sample policies and related follow-ups.

## API Docs

- Swagger UI: `http://localhost:5000/api-docs`

## Standard Response Format

- Success: `{ success: true, message, data, meta? }`
- Error: `{ success: false, message, errorCode? }`

## Endpoint Examples

### Create Policy

`POST /api/policies`

```json
{
  "policyNumber": "POL5001",
  "customerName": "Ravi Kumar",
  "customerPhone": "9876543210",
  "customerEmail": "ravi@example.com",
  "policyType": "health",
  "premiumAmount": 15000,
  "startDate": "2026-04-01",
  "endDate": "2027-03-31",
  "nextFollowUpDate": "2026-04-09",
  "status": "active",
  "agentName": "Agent A",
  "notes": "Corporate health plan"
}
```

### List Policies

`GET /api/policies?page=1&limit=10&search=POL&status=active&sortBy=createdAt&sortOrder=desc`

Follow-up bucket filters:

- Today: `GET /api/policies?followUpRange=today`
- After 1 day: `GET /api/policies?followUpRange=1d`
- Within 1 week: `GET /api/policies?followUpRange=1w`
- Within 1 month: `GET /api/policies?followUpRange=1m`

### Create Follow-up

`POST /api/followups`

```json
{
  "policyId": "6613d4d22f9d4f2eac012345",
  "followUpDate": "2026-04-10",
  "followUpType": "renewal reminder",
  "remark": "Call customer for renewal",
  "priority": "high",
  "status": "pending",
  "assignedTo": "Agent A"
}
```
