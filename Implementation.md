# Marketplace & Enterprise Integration Plan

> **Scope**: Add-on features only — zero modifications to existing login, signup, dashboard, scanner, map, history, guidelines, or settings functionality.

---

## Overview

Integrate 3 feature sets into the existing KITA_HACK project:

1. **Role Selector** — A toggle wrapper on login/signup letting users choose "User" (existing auth) or "Enterprise" (mock auth)
2. **Enterprise Portal** — Separate login + dashboard for institutional buyers (mock localStorage auth)
3. **Marketplace** — Full listing/offer system for waste trading (uses real Firebase user auth)

---

## Current Project State

| Layer | Stack | Auth |
|-------|-------|------|
| Frontend | React 19 + Vite + Tailwind + Framer Motion + Material Symbols | Firebase Auth → `useAuth()` from `contexts/AuthContext` |
| Backend | Express.js on port 3000 | Firebase Admin `verifyIdToken` via `authMiddleware.js` |
| Database | Firestore (`kitahack-487005`) | `admin.firestore()` via `config/firebaseAdmin.js` |
| Icons | Google Material Symbols (font-based) | New files use `lucide-react` (both coexist) |

### Existing Routes (untouched)

| Path | Component | Auth |
|------|-----------|------|
| `/` | `LandingPage` | Public |
| `/login` | `AuthPage` | Public |
| `/signup` | `AuthPage` (defaultMode="signup") | Public |
| `/dashboard` | `DashboardLayout` → `Dashboard` | Protected |
| `/dashboard/scanner` | `ScannerPage` | Protected |
| `/dashboard/scanner/result` | `ScanResultPage` | Protected |
| `/dashboard/map` | `MapPage` | Protected |
| `/dashboard/history` | `HistoryPage` | Protected |
| `/dashboard/guidelines` | `GuidelinesPage` | Protected |
| `/dashboard/settings` | `SettingsPage` | Protected |

### Existing Backend Routes (untouched)

| Mount | Module |
|-------|--------|
| `/api/scan` | `scanRoutes` |
| `/api/v1` | `authRoutes` (self-managed) |
| `/api/v1` | `scanSaveRoutes`, `scanHistoryRoutes`, `userRoutes`, `checkinRoutes`, `weeklyRoutes`, `nearbyRoutes`, `guidelinesRoutes` (all behind `authMiddleware`) |

---

## Step-by-Step Implementation

### Step 1 — Install `lucide-react`

All new KitaHack components use `lucide-react` icons. The existing project uses Material Symbols (font-based). Both coexist fine.

**Run in `frontend/`:**
```bash
npm install lucide-react
```

**Verification:** `package.json` shows `lucide-react` in dependencies.

---

### Step 2 — Create new directories

```
frontend/src/components/auth/           ← RoleSelector + EnterpriseLogin
frontend/src/components/marketplace/    ← 6 marketplace pages
frontend/src/components/dashboard/      ← EnterpriseDashboard
```

No existing directories are modified.

---

### Step 3 — Add RoleSelector (`components/auth/RoleSelector.jsx`)

**Source:** `KitaHack/RoleSelector.jsx`
**Destination:** `frontend/src/components/auth/RoleSelector.jsx`
**Import fixes:** None — only imports from `react`, `react-router-dom`, `lucide-react`

**What it does:**
- Wraps your existing `AuthPage` on `/login` and `/signup`
- Shows a "User | Enterprise" toggle at the top
- Selecting "User" renders your existing `AuthPage` unchanged below the toggle
- Selecting "Enterprise" redirects to `/login/enterprise`
- Your `AuthPage` component is passed as a prop — zero changes to `AuthPage` itself

---

### Step 4 — Add EnterpriseProtectedRoute (`components/EnterpriseProtectedRoute.jsx`)

**Source:** `KitaHack/EnterpriseProtectedRoute.jsx`
**Destination:** `frontend/src/components/EnterpriseProtectedRoute.jsx`
**Import fixes:** None

**What it does:**
- Guards enterprise dashboard routes using `localStorage` mock auth
- Checks `localStorage.getItem('isLoggedIn') === 'true'` AND `localStorage.getItem('userType') === 'enterprise'`
- Completely separate from your real Firebase `ProtectedRoute` — no interference

---

### Step 5 — Add Enterprise files (no edits needed)

| Source | Destination | Notes |
|--------|------------|-------|
| `KitaHack/EnterpriseLogin.jsx` | `frontend/src/components/auth/EnterpriseLogin.jsx` | Mock login using localStorage. Imports: `react`, `react-router-dom`, `lucide-react` only |
| `KitaHack/EnterpriseDashboard.jsx` | `frontend/src/components/dashboard/EnterpriseDashboard.jsx` | Full mock dashboard with stats, pricing tiers, requests. Imports: `react`, `react-router-dom`, `lucide-react` only |

These files are completely self-contained — they don't touch Firebase, `useAuth`, or any existing code.

---

### Step 6 — Add Marketplace frontend files (fix `useAuth` import path)

Copy all 6 files to `frontend/src/components/marketplace/`:

| Source | Destination | Import fix |
|--------|------------|------------|
| `Marketplace.jsx` | `components/marketplace/Marketplace.jsx` | **None** — doesn't use `useAuth` |
| `CreateListingForm.jsx` | `components/marketplace/CreateListingForm.jsx` | `'../contexts/AuthContext'` → `'../../contexts/AuthContext'` |
| `ListingDetail.jsx` | `components/marketplace/ListingDetail.jsx` | `'../contexts/AuthContext'` → `'../../contexts/AuthContext'` |
| `MyListings.jsx` | `components/marketplace/MyListings.jsx` | `'../contexts/AuthContext'` → `'../../contexts/AuthContext'` |
| `OffersManagement.jsx` | `components/marketplace/OffersManagement.jsx` | `'../contexts/AuthContext'` → `'../../contexts/AuthContext'` |
| `OfferDetail.jsx` | `components/marketplace/OfferDetail.jsx` | `'../contexts/AuthContext'` → `'../../contexts/AuthContext'` |

**Additional bug fix in `OfferDetail.jsx` line 17:**
```jsx
// BUG — duplicate setter name:
const [sendingMessage, setMessageText] = useState(false);
// FIX:
const [sendingMessage, setSendingMessage] = useState(false);
```
Also rename all downstream references from `setMessageText(true/false)` for the sending flag to `setSendingMessage(true/false)`.

---

### Step 7 — Add Marketplace backend files

> **BLOCKER:** Both `marketplaceRoutes.js` and `marketplaceService.js` are currently **empty** in the KitaHack folder. Implementation must be written before this step can proceed.

**When ready:**

| Source | Destination | Import fixes |
|--------|------------|-------------|
| `marketplaceService.js` | `backend/src/services/marketplaceService.js` | Firebase import → `const { db } = require('../config/firebaseAdmin');` |
| `marketplaceRoutes.js` | `backend/src/routes/marketplaceRoutes.js` | Auth middleware → `const authMiddleware = require('../middleware/authMiddleware');` |

**Expected API endpoints** (based on frontend fetch calls):

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/marketplace/listings` | List all listings (with filters: wasteType, minPrice, maxPrice, sortBy) |
| `POST` | `/api/v1/marketplace/listings` | Create a new listing |
| `GET` | `/api/v1/marketplace/listings/:id` | Get listing detail |
| `PUT` | `/api/v1/marketplace/listings/:id` | Update a listing |
| `DELETE` | `/api/v1/marketplace/listings/:id` | Delete a listing |
| `GET` | `/api/v1/marketplace/my-listings` | Get current user's listings (filter by status) |
| `GET` | `/api/v1/marketplace/buyer-requests` | List buyer requests |
| `GET` | `/api/v1/marketplace/offers` | Get offers (received or sent, filtered by tab) |
| `GET` | `/api/v1/marketplace/offers/:id` | Get offer detail with messages |
| `POST` | `/api/v1/marketplace/offers` | Create/send an offer |
| `PUT` | `/api/v1/marketplace/offers/:id` | Update offer (counter, accept, reject, complete) |
| `POST` | `/api/v1/marketplace/offers/:id/messages` | Send a message in offer thread |
| `POST` | `/api/v1/marketplace/upload` | Upload listing photos |

---

### Step 8 — Wire backend routes in `server.js`

Add **2 lines** to `backend/src/server.js` after the existing route registrations:

```js
const marketplaceRoutes = require('./routes/marketplaceRoutes');
app.use('/api/v1/marketplace', authMiddleware, marketplaceRoutes);
```

This mounts marketplace routes under `/api/v1/marketplace` behind the same Firebase `authMiddleware` used by all other protected routes.

---

### Step 9 — Update `frontend/src/App.jsx` (additive only)

**9a. Add new imports** (after existing imports):
```jsx
// Role Selector & Enterprise
import RoleSelector from './components/auth/RoleSelector';
import EnterpriseLogin from './components/auth/EnterpriseLogin';
import EnterpriseDashboard from './components/dashboard/EnterpriseDashboard';
import EnterpriseProtectedRoute from './components/EnterpriseProtectedRoute';

// Marketplace
import Marketplace from './components/marketplace/Marketplace';
import MyListings from './components/marketplace/MyListings';
import CreateListingForm from './components/marketplace/CreateListingForm';
import ListingDetail from './components/marketplace/ListingDetail';
import OffersManagement from './components/marketplace/OffersManagement';
import OfferDetail from './components/marketplace/OfferDetail';
```

**9b. Wrap existing login/signup routes with RoleSelector:**

Replace:
```jsx
<Route path="/login" element={<AuthPage />} />
<Route path="/signup" element={<AuthPage defaultMode="signup" />} />
```
With:
```jsx
<Route path="/login" element={<RoleSelector mode="login" LoginComponent={AuthPage} />} />
<Route path="/signup" element={<RoleSelector mode="signup" SignupComponent={() => <AuthPage defaultMode="signup" />} />} />
```

> `AuthPage` remains completely unchanged — `RoleSelector` renders it as-is below the role toggle.

**9c. Add enterprise routes** (public, BEFORE the `<Route element={<ProtectedRoute />}>` block):
```jsx
<Route path="/login/enterprise" element={<EnterpriseLogin />} />
<Route path="/dashboard/enterprise" element={
  <EnterpriseProtectedRoute>
    <EnterpriseDashboard />
  </EnterpriseProtectedRoute>
} />
```

**9d. Add marketplace routes** (INSIDE the existing `<Route path="/dashboard" element={<DashboardLayout />}>` block, as siblings of existing child routes):
```jsx
<Route path="marketplace" element={<Marketplace />} />
<Route path="marketplace/listings" element={<MyListings />} />
<Route path="marketplace/listings/new" element={<CreateListingForm />} />
<Route path="marketplace/listings/:listingId" element={<ListingDetail />} />
<Route path="marketplace/listings/:listingId/edit" element={<CreateListingForm />} />
<Route path="marketplace/offers" element={<OffersManagement />} />
<Route path="marketplace/offers/:offerId" element={<OfferDetail />} />
```

These nest inside `DashboardLayout` so they automatically get the sidebar + navbar chrome.

**Resulting App.jsx structure:**
```
<BrowserRouter>
  <AuthProvider>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<RoleSelector mode="login" ... />} />      ← modified
      <Route path="/signup" element={<RoleSelector mode="signup" ... />} />     ← modified
      <Route path="/login/enterprise" element={<EnterpriseLogin />} />          ← NEW
      <Route path="/dashboard/enterprise" element={...} />                       ← NEW
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="scanner" ... />              ← existing, untouched
          <Route path="scanner/result" ... />       ← existing, untouched
          <Route path="map" ... />                  ← existing, untouched
          <Route path="history" ... />              ← existing, untouched
          <Route path="guidelines" ... />           ← existing, untouched
          <Route path="settings" ... />             ← existing, untouched
          <Route path="marketplace" ... />          ← NEW
          <Route path="marketplace/listings" ... /> ← NEW
          <Route path="marketplace/listings/new" />              ← NEW
          <Route path="marketplace/listings/:listingId" />       ← NEW
          <Route path="marketplace/listings/:listingId/edit" />  ← NEW
          <Route path="marketplace/offers" />                    ← NEW
          <Route path="marketplace/offers/:offerId" />           ← NEW
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </AuthProvider>
</BrowserRouter>
```

---

### Step 10 — Add Marketplace link to Sidebar

In `frontend/src/components/Sidebar.jsx`, add one entry to the `NAV_ITEMS` array:

```js
const NAV_ITEMS = [
  { label: 'Analytics',   icon: 'analytics',  path: '/dashboard',            end: true },
  { label: 'Scanner',     icon: 'camera_alt', path: '/dashboard/scanner'     },
  { label: 'Map',         icon: 'map',        path: '/dashboard/map'         },
  { label: 'History',     icon: 'history',    path: '/dashboard/history'     },
  { label: 'Guidelines',  icon: 'menu_book',  path: '/dashboard/guidelines'  },
  { label: 'Marketplace', icon: 'storefront', path: '/dashboard/marketplace' },  // ← ADD THIS
  { label: 'Settings',    icon: 'settings',   path: '/dashboard/settings'    },
];
```

Uses Material Symbols `storefront` icon to stay consistent with existing sidebar design.

---

## File Summary

### New files (10 frontend + 2 backend = 12 total)

| # | File | Type | Auth System |
|---|------|------|-------------|
| 1 | `frontend/src/components/auth/RoleSelector.jsx` | New | N/A (wrapper) |
| 2 | `frontend/src/components/EnterpriseProtectedRoute.jsx` | New | localStorage mock |
| 3 | `frontend/src/components/auth/EnterpriseLogin.jsx` | Copy as-is | localStorage mock |
| 4 | `frontend/src/components/dashboard/EnterpriseDashboard.jsx` | Copy as-is | localStorage mock |
| 5 | `frontend/src/components/marketplace/Marketplace.jsx` | Copy as-is | None (public browse) |
| 6 | `frontend/src/components/marketplace/CreateListingForm.jsx` | Copy + fix import | Firebase `useAuth` |
| 7 | `frontend/src/components/marketplace/ListingDetail.jsx` | Copy + fix import | Firebase `useAuth` |
| 8 | `frontend/src/components/marketplace/MyListings.jsx` | Copy + fix import | Firebase `useAuth` |
| 9 | `frontend/src/components/marketplace/OffersManagement.jsx` | Copy + fix import | Firebase `useAuth` |
| 10 | `frontend/src/components/marketplace/OfferDetail.jsx` | Copy + fix import + bug fix | Firebase `useAuth` |
| 11 | `backend/src/services/marketplaceService.js` | **BLOCKED** (empty) | Firebase Admin |
| 12 | `backend/src/routes/marketplaceRoutes.js` | **BLOCKED** (empty) | `authMiddleware` |

### Modified files (3 total — additive changes only)

| # | File | Change |
|---|------|--------|
| 1 | `frontend/src/App.jsx` | Add imports + wrap login/signup with RoleSelector + add enterprise & marketplace routes |
| 2 | `frontend/src/components/Sidebar.jsx` | Add 1 entry to `NAV_ITEMS` array |
| 3 | `backend/src/server.js` | Add 2 lines to register marketplace routes |

### Untouched files (everything else)

All existing pages (`AuthPage`, `Dashboard`, `ScannerPage`, `ScanResultPage`, `MapPage`, `HistoryPage`, `GuidelinesPage`, `SettingsPage`, `LandingPage`), all existing components (`ProtectedRoute`, `DashboardLayout`, `Navbar`, `CameraScanner`, etc.), all existing backend routes, auth context, firebase config — **zero modifications**.

---

## Verification Checklist

- [ ] `npm install lucide-react` succeeds in `frontend/`
- [ ] `npm run dev` starts without compile errors
- [ ] `/login` shows role toggle above existing login form
- [ ] `/signup` shows role toggle above existing signup form
- [ ] Selecting "User" on role toggle renders existing `AuthPage` unchanged
- [ ] Selecting "Enterprise" redirects to `/login/enterprise`
- [ ] `/login/enterprise` shows enterprise mock login page
- [ ] Enterprise mock login → redirects to `/dashboard/enterprise`
- [ ] `/dashboard/enterprise` shows enterprise dashboard (mock data)
- [ ] Enterprise logout clears localStorage and redirects to `/login/enterprise`
- [ ] Normal user login → `/dashboard` works as before
- [ ] Sidebar shows "Marketplace" link with storefront icon
- [ ] `/dashboard/marketplace` shows marketplace browse page
- [ ] All existing features (Scanner, Map, History, Guidelines, Settings) work unchanged
- [ ] Backend: marketplace routes respond under `/api/v1/marketplace` (after Step 7 is unblocked)

---

## Blockers & Notes

1. **`marketplaceRoutes.js` and `marketplaceService.js` are empty** — backend CRUD for listings, offers, buyer requests, and photo uploads must be implemented before the marketplace frontend will function. The frontend will load but all API calls will return 404 until these are written.

2. **`OfferDetail.jsx` has a bug** — duplicate `setMessageText` useState on line 17. Must be renamed to `setSendingMessage` along with all downstream references.

3. **`lucide-react` is a new dependency** — ~150KB gzipped. All new components use it. Existing components continue using Material Symbols. Both coexist without conflict.

4. **Enterprise auth is mock-only** — uses `localStorage` with hardcoded demo credentials (email: `demo@company.com`, password: `demo123`). Not connected to Firebase. Suitable for demo/prototype purposes only.
