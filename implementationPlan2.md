KITA_HACK — Full System Implementation Plan (v2)
Synthesised from 
test.md
, 
test2.md
, 
vertexAi.md
, and deep codebase analysis.

Current State
Area	Exists	Missing
Backend	Express, /api/scan, /api/scan/validate, Vertex AI (Gemini 2.0 Flash), 
binRules.js
Firebase Admin, auth middleware, all /api/v1/* endpoints, scan save, disposal tracking
Frontend	8 page shells, 
CameraScanner.jsx
 (auto-scan loop + modal), 
wasteRules.js
, AuthContext, Sidebar	Single-shot scan, full results page, disposal guidance, history grouping, backend integration
Firestore	Schema designed in docs	No backend code uses Firestore yet
User Review Required
IMPORTANT

Major UX Change: The scanner will switch from auto/continuous scanning (2s interval loop) to a single-shot "Scan" button tap. After detection, instead of a bottom-sheet modal overlay, the user navigates to a full-screen results page (/dashboard/scanner/result) with rules, checklist, and action buttons.

WARNING

Backend 
.env
: Ensure GCP_PROJECT_ID is set and 
service-account-key.json
 has Firestore permissions before Phase 1 can work.

Proposed Changes
Phase 1 — Backend Foundation
[NEW] 
firebaseAdmin.js
Init Firebase Admin SDK using existing 
service-account-key.json
. Exports admin and db.

[NEW] 
authMiddleware.js
Verify Firebase ID token from Authorization: Bearer <token>. Sets req.user = { uid, email }. Applied to all /api/v1/* except /api/v1/verify.

[NEW] 
wasteRulesBackend.js
Backend disposal rules + MODEL_TO_WASTE_TYPE label mapping + estimated weights per type (plastic: 0.15kg, cardboard: 0.4kg, etc.).

[NEW] 
recyclingCentres.js
Static JB centre database with coordinates, accepted bins, hours, contact info.

[MODIFY] 
server.js
Add rate-limit, multer fallback, mount all new /api/v1/* routes, apply auth middleware.

[MODIFY] 
package.json
Add: firebase-admin, multer, express-rate-limit.

Phase 2 — Backend API Routes
[NEW] 
authRoutes.js
POST /api/v1/verify — verify idToken, upsert user doc in Firestore.

[MODIFY] 
scanRoutes.js
Add: multer fallback, return real confidence, shortRules, checklist, imageHash, disposalMethod.

[NEW] 
scanSaveRoutes.js
POST /api/v1/scans — save scan + auto-calculate impactKg from per-type weights + assign targetCentre + award 5 points
PATCH /api/v1/scans/:scanId/status — update disposal status
[NEW] 
scanHistoryRoutes.js
GET /api/v1/scans (paginated), GET /api/v1/scans/:scanId (detail).

[NEW] 
userRoutes.js
GET /api/v1/user/stats, PUT /api/v1/user/profile, DELETE /api/v1/user.

[NEW] 
checkinRoutes.js
POST /api/v1/checkin — daily streak + milestone bonuses.

[NEW] 
weeklyRoutes.js
GET /api/v1/scans/weekly — 7-day bar chart data.

[NEW] 
nearbyRoutes.js
POST /api/v1/nearby — centres by waste type + user location, sorted by distance.

[NEW] 
guidelinesRoutes.js
GET /api/v1/guidelines — static tab content as JSON.

Phase 3 — AI Improvements
[MODIFY] 
visionAI.js
Update prompt to return structured JSON with real confidence score
Apply MODEL_TO_WASTE_TYPE mapping
Confidence < 0.6 → general_waste + warning flag
[NEW] 
centreAssignment.js
assignNearestCentre(wasteType, userLocation) — Haversine distance to closest accepting centre.

Phase 4 — Scanner UX Overhaul (Single-Shot + Results Page)
IMPORTANT

This is the biggest UX change. The scanner becomes a camera viewfinder with a single "Scan" button. One tap = one photo = one API call. No interval, no auto-scanning. After detection, the user is navigated to a full results page — not a modal overlay.

[MODIFY] 
CameraScanner.jsx
Remove:

setInterval loop and scanIntervalRef
toggleScanning()
 start/stop logic
showResultsModal state and the entire results modal JSX (bottom sheet)
SCAN_INTERVAL import
Quick result preview overlay
Change 
toggleScanning
 → handleScanOnce:

js
const handleScanOnce = async () => {
  if (!cameraActive || loading) return;
  setLoading(true);
  const imageData = captureFrame();
  const res = await fetch(endpoints.scan, { ... });
  const data = await res.json();
  // Navigate to results page with scan data
  navigate('/dashboard/scanner/result', { state: { scanResult: data, ... } });
};
Keep: Camera init, video feed, HUD overlay, reticle, loading overlay, error overlay. The "Scan" shutter button now calls handleScanOnce (single shot).

[NEW] 
ScanResultPage.jsx
Full-screen results page at /dashboard/scanner/result. Receives scan data via React Router location.state. Contains:

┌──────────────────────────────────┐
│  ← Back to Scanner              │  ← Navigation
├──────────────────────────────────┤
│  ♻️ Plastic                     │
│  Recyclable  •  91% Confidence  │  ← Detection header
│  ▓▓▓▓▓▓▓▓▓░░  91%              │  ← Confidence bar
├──────────────────────────────────┤
│  🟢 Place in: Green Recycling   │  ← Correct bin card
│     Bin ♻️                      │
├──────────────────────────────────┤
│  📋 Quick Rules                 │
│  ✓ Rinse clean, remove caps     │
│  ✓ Check number (#1-#7)         │  ← Rules list
│  ✓ No food residue              │
├──────────────────────────────────┤
│  ☐ Empty and rinse container    │
│  ☐ Remove cap and label         │  ← Interactive checklist
│  ☐ Check plastic number         │
│  ☐ Flatten to save space        │
│  ☐ Place in Green Bin ♻️        │
├──────────────────────────────────┤
│  [💾 Save to History]           │  ← Primary action
│  [📍 Find Nearest Station]      │  ← Opens map with waste filter
│  [📷 Scan Again]                │  ← Back to scanner
└──────────────────────────────────┘
Sections:

Header: waste icon, name, category badge, confidence ring
Correct Bin: bin colour + name + disposal method
Quick Rules: 2-4 compact rule pills from shortRules
Preparation Checklist: interactive checkboxes (persisted via state)
Action Buttons:
Save to History → POST /api/v1/scans + toast + navigate to /dashboard/history
Find Nearest Station → navigate to /dashboard/map with wasteType param (filters centres by what accepts this waste)
Scan Again → navigate back to /dashboard/scanner
[MODIFY] 
App.jsx
Add route: <Route path="scanner/result" element={<ScanResultPage />} /> under dashboard.

Phase 5 — History Enhancement
[MODIFY] 
HistoryPage.jsx
Add Grouped view (by centre + disposal status) with toggle
Pending section: items grouped by targetCentre with disposal checkboxes
Completed section: summary cards with item counts + points earned
"Mark All Done" per centre group
[NEW] 
DisposalCheckbox.jsx
Checkbox that calls PATCH /api/v1/scans/:scanId/status to update disposal status. Colour-coded, shows confirmation toast.

Phase 6 — Dashboard & Map Integration
[MODIFY] 
Dashboard.jsx
Connect stats cards to GET /api/v1/user/stats, weekly chart to GET /api/v1/scans/weekly, check-in to POST /api/v1/checkin.

[MODIFY] 
MapPage.jsx
Connect to POST /api/v1/nearby. Support receiving wasteType param from scanner result page to pre-filter.

Phase 7 — Priority Fixes (from vertexAi.md)
[MODIFY] 
visionAI.js
Structured JSON prompt for real confidence.

[MODIFY] 
CameraScanner.jsx
Remove fake confidence 0.75 + Math.random() * 0.2
Remove random impactKg (0.15-0.50), use backend per-type weights
Revised Scanner Flow Diagram
MapPage
HistoryPage
ScanResultPage
Backend /api/scan
ScannerPage
User
MapPage
HistoryPage
ScanResultPage
Backend /api/scan
ScannerPage
User
alt
[Save to History]
alt
[Find Nearest Station]
alt
[Scan Again]
Opens scanner (camera viewfinder)
Taps "Scan" button (single shot)
Captures one frame as base64
POST /api/scan {image, scanMode: "waste"}
{wasteType, confidence, rules, checklist}
navigate('/dashboard/scanner/result', {state: scanData})
Shows full results page with rules + checklist
Taps "Save to History"
POST /api/v1/scans {wasteType, confidence, ...}
navigate('/dashboard/history')
Taps "Find Nearest Station"
navigate('/dashboard/map', {state: {wasteType}})
Taps "Scan Again"
navigate('/dashboard/scanner')
Verification Plan
Backend API Tests
bash
# Health
curl http://localhost:3000/api/health
# Scan (single shot — no auth)
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"image":"<base64>","scanMode":"waste"}'
# Expected: { wasteType, confidence (REAL), disposalMethod, rules, checklist, imageHash }
# Save scan (authenticated)
curl -X POST http://localhost:3000/api/v1/scans \
  -H "Authorization: Bearer <token>" \
  -d '{"wasteType":"plastic","confidence":0.91,"disposalMethod":"recycle"}'
# Expected: { scanId, pointsEarned: 5 }
Browser Tests
Navigate to /dashboard/scanner → tap Scan → verify single API call (no interval)
Verify navigation to /dashboard/scanner/result with full rules page
Tap "Save to History" → verify Firestore write → navigates to History
Tap "Find Nearest Station" → verify MapPage opens with waste type filter
Tap "Scan Again" → verify returns to scanner camera view