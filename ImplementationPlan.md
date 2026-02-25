# KITA_HACK - Detailed Implementation Roadmap (10 Sequential Steps)

*Each step is self-contained with clear success criteria. Execute each step only when user tell,do not execute anything that is not informed by user.*

## Step 1: Foundation — Routing & Directory Reorganization
**Objective**: Establish React Router v7 structure matching APP_FLOW.md  

**Tasks**:
```
1.1 Create directory structure:
frontend/src/
├── pages/
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Analytics.jsx      ✨ NEW
│   ├── Scanner.jsx        ✨ NEW  
│   ├── Map.jsx           ✨ NEW
│   ├── History.jsx       ✨ NEW
│   ├── Guidelines.jsx    ✨ NEW
│   └── Settings.jsx      ✨ NEW
├── components/
│   ├── ProtectedRoute.jsx ✨ NEW
│   ├── DashboardLayout.jsx ✨ NEW
│   └── Sidebar.jsx       ✨ NEW
└── App.jsx
```

**1.2** Update `App.jsx`:
```jsx
// Exact routes from FRONTEND_STRUCTURE.md
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/signup" element={<SignupPage />} />
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<DashboardLayout />}>
      <Route index element={<AnalyticsPage />} />
      <Route path="scanner" element={<ScannerPage />} />
      <Route path="map" element={<MapPage />} />
      <Route path="history" element={<HistoryPage />} />
      <Route path="guidelines" element={<GuidelinesPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
  </Route>
</Routes>
```

**✅ Success**: `npm run dev` → All 10 routes load placeholders without 404s

***

## Step 2: Shared UI — Sidebar & Dashboard Layout
**Objective**: Persistent navigation system  

**Tasks**:
```
2.1 Build Sidebar.jsx (NAV_ITEMS array matching table)
2.2 Desktop: Fixed 256px→72px collapse with toggle button
2.3 Mobile: Hamburger → overlay drawer (Framer Motion)
2.4 DashboardLayout.jsx with ml-[sidebarWidth] main content
2.5 Active states: gradient bars + accent icons
```

**✅ Success**: Sidebar collapses/expands smoothly, nav links highlight correctly

***

## Step 3: Landing Page
**Objective**: Public marketing entry point  

**Tasks**:
```
3.1 Hero: "KITA_HACK: AI Waste Scanner" + kita-green gradient
3.2 SDG 12 stats: "65% Johor Bahru non-recycling rate"
3.3 Dual CTAs: "Get Started → /login" + "Preview → /guidelines"  
3.4 Responsive: Cards stack vertical on mobile (sm:max-w-full)
3.5 Glassmorphism cards with backdrop-blur effects
```

**✅ Success**: Landing converts → /login click works, mobile cards stack properly

***

## Step 4: Authentication Flow
**Objective**: Firebase Auth + Backend JWT bridge  

**Tasks**:
```
4.1 LoginPage.jsx: Email/password + Google popup
4.2 SignupPage.jsx: Name + email/password + profile update
4.3 Zod validation + React Hook Form
4.4 POST /api/v1/verify → Backend JWT exchange
4.5 ProtectedRoute: onAuthStateChanged → spinner → redirect
4.6 Error banners: "AUTH_001 Missing token" etc.
```

**✅ Success**: Google login → /dashboard, email signup → user doc created

***

## Step 5: Analytics Page (Dashboard Home)
**Objective**: User motivation dashboard  

**Tasks**:
```
5.1 3-column stat cards → 1-column mobile
5.2 Weekly Scans: BarChart (Recharts, Firestore last 7d)
5.3 Impact: "4.2kg diverted + 3.8kg CO₂ saved"
5.4 Points system: Streak counter + "Daily Check-In" modal
5.5 Confetti animation on check-in (react-confetti)
5.6 Quick Actions row: Scanner + Map buttons
```

**✅ Success**: Daily check-in increments points, charts render mock data

***

## Step 6: Scanner Page ⭐ **CORE**
**Objective**: AI-powered waste classification  

**Tasks**:
```
6.1 getUserMedia: Rear camera 640x480 @1fps frame sampling
6.2 AR overlay: Live confidence ring + preview thumbnail
6.3 POST /api/scan → Vertex AI Gemini classification(endpoint connection key should be seperated for author to enter )
6.4 Results Modal: Waste type + 94% confidence bar
6.5 Short Rules: "Rinse empty, remove cap" (from Rules.md), each items has their corresponding rules to follow based on Rules.md
6.6 Checklist: 4-6 interactive steps with checkboxes
6.7 Actions: [Bin Scan Toggle] [Map] [Save→History]
```

**✅ Success**: Camera detects "PLASTIC #2" → rules modal appears correctly

***

## Step 7: Map Page
**Objective**: Hyperlocal disposal guidance  

**Tasks**:
```
7.1 Google Maps API: GPS center + 5km radius
7.2 Color markers: 🟢 Recycle 🟠 Donate 🔴 Dispose
7.3 POST /api/v1/nearby → Places API results
7.4 Bottom sheet: Distance, hours, "Navigate→" button
7.5 Filter tabs: [All] [Recycle] [Donate] [List view]
7.6 List toggle below map maintaining marker state
```

**✅ Success**: Tap marker → "JB Recycling Hub 2.3km → Open Maps"

***

## Step 8: History & Guidelines Pages
**Objective**: Persistence + comprehensive education  

**Tasks**:
```
8.1 HistoryPage: Firestore scans query (timestamp DESC)
8.2 Scan cards: Thumbnail + type + date + bin match ✓/✗
8.3 Expand: Full rules/checklist from scan metadata
8.4 GuidelinesPage: 8 tabs from Rules.md data
8.5 Search: Filter by waste type + recent scans
8.6 Photos: Import Rules.md images to public/images/
```

**✅ Success**: History shows past scans, Guidelines tabs match data structure

***

## Step 9: Settings Page & Theme Toggle
**Objective**: User control + polish  

**Tasks**:
```
9.1 Profile card: Name edit + avatar upload to Firebase Storage
9.2 Password form: Old/New/Confirm (Firebase Auth)
9.3 Toggles: Notifications, Dark Mode, PWA reminders
9.4 Sun↔Moon morphing toggle (Lottie + parallax)
9.5 Danger Zone: Logout + Delete Account (10s countdown)
9.6 Data export: CSV of scan history
```

**✅ Success**: Dark mode toggle works, password changes successfully

***

## Step 10: Final Verification & Production
**Objective**: Hackathon demo readiness  

**Tasks**:
```
10.1 Verify 10 routes × 3 auth states × 2 viewports = 60 flows
10.2 Backend contract matching: All curl tests pass
10.3 PWA: manifest.json + service worker caching
10.4 Lighthouse: Performance 95+, Accessibility 100+
10.5 Demo script: Land→Login→Scan→Map→History (90 seconds)
10.6 Deploy: firebase deploy + gcloud run deploy
10.7 QR code: https://kita-hack-2026.web.app
```

**✅ Success**: Full demo flow works on phone, deployed URLs live

***

## 🚀 **Recommended Starting Order**

```
**Day 1**: Steps 1-3 (Foundation + Landing + basic nav)
**Day 2**: Steps 4-5 (Auth + Analytics) 
**Day 3**: Step 6 (Scanner ⭐ CORE)
**Day 4**: Steps 7-8 (Map + Content)
**Day 5**: Steps 9-10 (Polish + Deploy)
```

## 📊 **Progress Tracking**

```
[ a] Step 1: Foundation 
[ a] Step 2: Sidebar  
[ a] Step 3: Landing
[ ] Step 4: Auth 
[ ] Step 5: Analytics 
[ ] Step 6: Scanner ⭐
[ ] Step 7: Map 
[ ] Step 8: History/Guidelines 
[ ] Step 9: Settings 
[ ] Step 10: Production 
```
