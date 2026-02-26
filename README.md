# KITA_HACK

AI-powered civic recycling assistant for faster waste classification, cleaner disposal habits, and better local sustainability outcomes.

KITA_HACK is built around **SDG 12** goals (responsible consumption and production): users scan waste, get short actionable rules, save scans to history, and find suitable disposal centres.

## What Is KITA_HACK?

KITA_HACK is a full-stack waste intelligence platform with:
- **Computer-vision waste classification** (Vertex AI endpoint).
- **Rule-based disposal guidance** (short rules + checklist).
- **Gamified behaviour loop** (points, streaks, daily check-in).
- **History + disposal tracking** (pending/recycled/donated/disposed).
- **Guidelines education layer** (country-specific and universal rules).

Think of it as a practical "scan-to-dispose" assistant for daily household waste decisions.

## Mission

- Make correct disposal decisions easier in under 10 seconds.
- Reduce contamination in recycling streams through clear instructions.
- Improve environmental literacy with contextual, actionable education.
- Encourage consistent eco-actions via streaks, points, and progress feedback.

## Current Features (Implemented)

- Public landing and auth flows (email/password + Google popup via Firebase).
- Protected dashboard with:
  - User stats (`totalScans`, `impactKg`, `co2Saved`, `points`, `streak`)
  - Weekly scans chart
  - Daily check-in and milestone bonuses
- Camera scanner:
  - Single-shot capture from device camera
  - `POST /api/scan` classification
  - Confidence + waste rules + checklist
  - Save to history
- Full-screen scan result page (`/dashboard/scanner/result`).
- History page:
  - Paginated loading
  - Image-grid cards
  - Expandable details
  - Disposal status updates via checkbox workflow
- Guidelines page with structured rules by waste type.
- Settings page:
  - Profile update
  - Password update (Firebase-side)
  - Data export (CSV)
  - Account deletion flow
- Backend APIs for scans, check-ins, profile, nearby centres, guidelines, and history.
- Firebase Storage upload support for scan images.

## Tech Stack

- **Frontend**: React 19, Vite 7, React Router 7, Tailwind CSS 4, Framer Motion, Recharts, Firebase Web SDK.
- **Backend**: Node.js, Express 4, Firebase Admin SDK, Multer, Express Rate Limit.
- **AI**: Google Cloud Vertex AI (`@google-cloud/aiplatform`) via deployed endpoint.
- **Data**: Firestore (users/scans/checkins), Firebase Storage.

## Architecture

```text
Frontend (React/Vite)
  -> Firebase Auth (ID Token)
  -> Backend API (Express)
      -> Vertex AI endpoint (waste classification)
      -> Firestore (scans/users/checkins)
      -> Firebase Storage (scan images)
```

## Route Map

Public:
- `/` Landing
- `/login`
- `/signup`

Protected (`ProtectedRoute`):
- `/dashboard`
- `/dashboard/scanner`
- `/dashboard/scanner/result`
- `/dashboard/map`
- `/dashboard/history`
- `/dashboard/guidelines`
- `/dashboard/settings`

## API Summary

Public:
- `POST /api/scan`
- `POST /api/scan/validate`
- `POST /api/v1/verify`
- `GET /api/health`

Protected (Firebase ID token in `Authorization: Bearer <token>`):
- `GET /api/v1/user/stats`
- `GET /api/v1/scans/weekly`
- `POST /api/v1/checkin`
- `POST /api/v1/scans`
- `PATCH /api/v1/scans/:scanId/status`
- `GET /api/v1/scans`
- `GET /api/v1/scans/:scanId`
- `POST /api/v1/nearby`
- `PUT /api/v1/user/profile`
- `DELETE /api/v1/user`
- `GET /api/v1/guidelines`

## Setup

### Prerequisites

- Node.js 18+ (Node.js 20 recommended)
- npm
- Firebase project (Auth, Firestore, Storage)
- Google Cloud Vertex AI endpoint + service account JSON

### 1. Install dependencies

```bash
# root already contains frontend/backend folders
cd backend && npm install
cd ../frontend && npm install
```

### 2. Backend credentials

Place service account key at:

```text
backend/service-account-key.json
```

### 3. Backend environment (`backend/.env`)

```env
PORT=3000
NODE_ENV=development
GCP_PROJECT_ID=kitahack-487005
GCP_LOCATION=europe-west4
VERTEX_ENDPOINT_ID=7802070739024084992
```

### 4. Frontend environment (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000
```

## Run Locally

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

Local URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Health check: `http://localhost:3000/api/health`

## Project Structure

```text
KITA_HACK-2026-FEB/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   └── config/
│   └── package.json
├── APP_FLOW.md
├── BACKEND_STRUCTURE.md
├── Rules.md
├── ImplementationPlan.md
├── implementationPlan2.md
└── revisingPlan.md
```

## Known Gaps / In Progress

- Map page UI is currently mock-style in frontend while backend nearby endpoint exists.
- Frontend still contains fallback direct Firestore writes in several flows.
- `POST /api/v1/verify` currently returns user payload (no backend JWT issuance).
- Some docs describe planned behaviour that is still being phased in.

## Roadmap (From Plan Docs)

- Complete scanner flow hardening and remove remaining mock fallbacks.
- Fully integrate real nearby-centre map interactions.
- Strengthen auth/session strategy consistency across frontend/backend.
- Expand guideline/rule content and localization.
- Final deployment hardening for demo/production readiness.

## Documentation References

- `APP_FLOW.md` — route-by-route product flow.
- `BACKEND_STRUCTURE.md` — endpoint contracts and backend architecture.
- `Rules.md` — waste taxonomy and disposal rules.
- `ImplementationPlan.md`, `implementationPlan2.md`, `revisingPlan.md` — phased execution plans.
