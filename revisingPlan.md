## Plan: GCS Image Storage + Image-Grid History Page

**TL;DR** — The scan flow currently discards images after AI classification. This plan adds server-side upload to your Firebase Storage bucket (`kitahack-487005.firebasestorage.app`) via `@google-cloud/storage`, stores the `imageUrl` in each Firestore scan doc, then redesigns HistoryPage as a 2–3 column image grid with expandable detail cards and `DisposalCheckbox` integration. Also delivers Firebase Storage + Firestore security rules files. Along the way, multiple bugs in the current HistoryPage are fixed (`id` vs `scanId` mismatch, dead `binMatch` code, broken API-path pagination).

**Steps**

### A — Backend GCS Integration

1. **Install dependency** — Run `npm install @google-cloud/storage` in `backend/`.

2. **Configure storage bucket in Admin SDK** — In `backend/src/config/firebaseAdmin.js`, add `storageBucket: 'kitahack-487005.firebasestorage.app'` to the `admin.initializeApp()` call. Export a `bucket` reference via `admin.storage().bucket()`.

3. **[NEW] `backend/src/services/storageService.js`** — Utility that:
   - Accepts base64 data URI + a destination path (e.g. `scans/{uid}/{scanId}.jpg`)
   - Strips the `data:image/jpeg;base64,` prefix, creates a `Buffer`
   - **Validates buffer size ≤ 5MB** before uploading — rejects with clear error if exceeded
   - Uploads to bucket via `bucket.file(path).save(buffer, { metadata: { contentType: 'image/jpeg' }, public: true })`
   - Returns the public URL: `https://storage.googleapis.com/{bucket}/{path}`
   - Exports `uploadScanImage(base64, uid, scanId)` and `deleteScanImage(path)`

4. **Modify `backend/src/routes/scanSaveRoutes.js` POST /api/v1/scans** — Accept an optional `imageData` field (base64 string). If present, call `uploadScanImage(imageData, uid, scanRef.id)` before the Firestore transaction. Store the returned `imageUrl` in the scan document. Include `imageUrl` in the response JSON.

5. **Modify `backend/src/routes/scanHistoryRoutes.js` GET /api/v1/scans** — No schema change needed (the field already passes through `...doc.data()`), but ensure `imageUrl` is included when serializing. Already works automatically.

### B — Camera Resolution Enhancement (Improve Vertex AI Accuracy)

Currently the camera pipeline is severely bottlenecked:

| Stage | Current | Problem |
|---|---|---|
| `CAMERA_CONSTRAINTS` (`constants.js`) | `1280×720` ideal | OK — hardware capture is decent |
| `captureFrame()` canvas (`CameraScanner.jsx` L71-74) | **640×480**, JPEG quality **0.8** | **Too low** — downscales by 4× before AI sees it, discards fine detail |
| AutoML endpoint | Receives 640×480 | Model can't distinguish small items; low confidence on similar classes |

**Fix**: Raise the capture pipeline to **1280×1024** at **0.92 JPEG quality**. This is the sweet spot for AutoML Image Classification — high enough for sharp feature extraction, small enough to keep base64 under ~350KB (well within the 15MB JSON limit).

6. **Modify `frontend/src/config/constants.js`** — Upgrade camera constraints:
   ```js
   export const CAMERA_CONSTRAINTS = {
     video: {
       facingMode: 'environment',
       width: { ideal: 1920 },     // was 1280 — request max from hardware
       height: { ideal: 1080 },    // was 720
     }
   };
   ```
   Requesting 1920×1080 from hardware gives the highest-quality source. The actual capture resolution is controlled in the next step.

7. **Modify `captureFrame()` in `CameraScanner.jsx`** (lines 65-74):
   ```js
   // ── Capture frame as base64 (1280×1024 for Vertex AI accuracy) ──
   // Enforces < 5MB for GCS storage. Falls back to lower quality if needed.
   const MAX_BASE64_SIZE = 5 * 1024 * 1024 * 1.37; // ~6.85MB base64 ≈ 5MB raw
   const captureFrame = useCallback(() => {
     if (!videoRef.current || !canvasRef.current) return null;
     const video = videoRef.current;
     const canvas = canvasRef.current;
     const ctx = canvas.getContext('2d');
     canvas.width = 1280;    // was 640
     canvas.height = 1024;   // was 480
     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
     let dataUrl = canvas.toDataURL('image/jpeg', 0.92); // was 0.8
     // Safety: if somehow >5MB, re-encode at lower quality
     if (dataUrl.length > MAX_BASE64_SIZE) {
       dataUrl = canvas.toDataURL('image/jpeg', 0.75);
     }
     return dataUrl;
   }, []);
   ```
   - **1280×1024** = 4× more pixels for AI to analyze vs 640×480
   - **0.92 quality** = noticeably sharper edges/textures with minimal size increase
   - Base64 payload grows from ~80KB to ~300KB — still well under the 15MB body limit
   - **Must stay under 5MB** (GCS storage rule). At 1280×1024 / 0.92 quality, a typical JPEG is ~250-400KB (~330-530KB base64). Well within the 5MB cap. Add a safety check: if `base64.length > 5 * 1024 * 1024 * 1.37` (base64 overhead), re-encode at 0.80 quality as fallback.

### C — Frontend Image Flow (Capture → Save)

8. **CameraScanner** — The current `CameraScanner.jsx` (657 lines, old modal-based) captures `imageData` via `captureFrame()` and sends it to POST /api/scan, but discards it after. Two sub-options here depending on whether we migrate to single-shot:

   - **Minimal change (keep existing modal flow)**: After `scanFrame()` succeeds, stash `imageData` in component state (`setCapturedImage(imageData)`). Pass it along in the `saveToHistory` function inside the modal so the POST /api/v1/scans body includes `imageData`.
   - **If using ScanResultPage route**: Navigate with `{ state: { scanResult: data, imageData } }` so ScanResultPage can send it on save.

   Since CameraScanner is still the old 657-line modal version (not the single-shot rewrite), the minimal change approach is simplest: store `imageData` in state, include in save payload.

9. **Modify save payload** — In whichever component calls `POST /api/v1/scans` (the `saveToHistory` function in CameraScanner modal, or `ScanResultPage.jsx` lines 55-80), add `imageData` to the request body alongside `wasteType`, `confidence`, etc.

10. **Show image preview** — In ScanResultPage (if used) and CameraScanner modal, display a small thumbnail of the captured image using the base64 data URL.

### D — HistoryPage Redesign (Image Grid + Expand + Checkbox)

11. **Fix bugs in current `HistoryPage.jsx`**:
   - **`id` vs `scanId`**: Backend returns `scanId` (line 30 of `scanHistoryRoutes.js`). Map it: `setScans(data.scans.map(s => ({ ...s, id: s.scanId || s.id })))`.
   - **Remove dead `binMatch` code**: Lines ~317-325 reference `scan.binMatch` which is never populated. Remove or replace with `DisposalCheckbox`.
   - **Fix pagination**: Backend uses offset-based pages. Track `currentPage` state. "Load More" calls `fetchScans(currentPage + 1)` using `?page={n}&limit=20` instead of Firestore `startAfter`.

12. **Rewrite HistoryPage layout** — Complete redesign as image grid:
    - **Default view**: Responsive grid (`grid-cols-2 sm:grid-cols-3`) of image thumbnail cards
    - **Each grid cell**: 
      - Square aspect-ratio image thumbnail (from `scan.imageUrl`, with fallback to waste-type icon placeholder when no image)
      - Bottom overlay: waste type badge (icon + short name), relative time
      - Top-right corner: `DisposalCheckbox` (compact mode — just the colored icon circle, no label)
      - Tap anywhere → expands to full detail card (same expanded content as current: date, disposal, confidence, rules, checklist, actions)
    - **Expanded card**: Slides in as a modal/overlay or inline expansion with `AnimatePresence`. Shows full image at top, then all existing detail sections below.
    - **Search, filter chips**: Keep at top (same design as current)
    - **Imports**: Add `DisposalCheckbox`, `STATUS_CONFIG`, `getTargetStatus` from `DisposalCheckbox.jsx`

13. **Add `handleStatusChange` callback** — When `DisposalCheckbox` fires `onStatusChange`, update the scan in local state so the grid reflects the new status immediately.

### E — Security Rules

14. **[NEW] `storage.rules`** — Firebase Storage Security Rules at project root:
    - Authenticated users can **write** to `scans/{userId}/**` only if `request.auth.uid == userId`
    - Authenticated users can **read** any scan image (for shared/public viewing)
    - **File size limit: max 5MB** — `request.resource.size < 5 * 1024 * 1024`
    - Content type must be `image/*` — `request.resource.contentType.matches('image/.*')`
    - `avatars/{userId}/**` rules: same write-own pattern (preserves existing avatar upload)

15. **[NEW] `firestore.rules`** — Firestore Security Rules at project root:
    - `scans` collection: read/write only if `request.auth.uid == resource.data.userId` (owner only)
    - `users` collection: read/write own doc only (`request.auth.uid == userId`)
    - Validate required fields on scan create: `wasteType` must exist, `disposalStatus` in `['pending','recycled','donated','disposed']`
    - Deny all other collections by default

### F — Verification

- `cd backend && npm install` — confirm `@google-cloud/storage` installs
- `cd backend && node -e "require('./src/services/storageService')"` — confirm module loads
- `cd frontend && npx vite build` — confirm clean build with no import/type errors
- Manual test: scan item → save → check Firestore doc has `imageUrl` field → check GCS bucket has the file
- Manual test: open History page → see image grid → tap card → see expanded detail with checkbox → toggle disposal status
- Deploy `storage.rules` and `firestore.rules` via Firebase CLI: `firebase deploy --only storage,firestore`

### Decisions

- **Backend upload chosen over client-side**: User selected server-side GCS upload. This means the base64 image travels in the save request body (~200-400KB JPEG). The existing 15MB JSON limit in `server.js` accommodates this easily.
- **Firebase Storage bucket (not separate GCS bucket)**: Using `kitahack-487005.firebasestorage.app`, same bucket already configured in `firebase.js`.
- **Image grid layout**: 2-3 column responsive grid with tap-to-expand, per user preference.
- **CameraScanner modification scope**: Minimal — just stash `imageData` in state and include in save payload. Not rewriting scan flow.
