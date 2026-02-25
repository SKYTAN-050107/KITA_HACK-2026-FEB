# Complete React Router Architecture
1. Overall App Flow & Routing
Defined in src/App.jsx, the app uses React Router v7 with Firebase Auth protection and nested layouts for KITA_HACK PWA. Routes split into public onboarding and protected dashboard sections.

Route	Component	Access	Description
/	LandingPage	Public	Project intro with SDG impact stats, CTA to Login/Signup
/login	LoginPage	Public	Email/Google auth, forgot password link
/signup	SignupPage	Public	Email/password + name signup, Google OAuth
/dashboard/*	DashboardLayout (wraps children)	Protected	Sidebar nav + main content, analytics first-load
/dashboard	AnalyticsPage	Protected	User stats: weekly scans, points, daily check-in
/dashboard/scanner	ScannerPage	Protected	AR camera scan → results overlay + rules modal
/dashboard/map	MapPage	Protected	Nearby centers by waste type, one-tap navigation
/dashboard/history	HistoryPage	Protected	Past scans list + detailed rules/reminders
/dashboard/guidelines	GuidelinesPage	Protected	Full waste rules, preparation checklists
/dashboard/settings	SettingsPage	Protected	Password change, profile edit, logout
*	Redirect /	Catch-all	Unknown routes → landing
The ProtectedRoute wrapper (App.jsx:25-45) subscribes to Firebase onAuthStateChanged. Loading state renders spinner; unauth → /login; auth → children. DashboardLayout provides persistent sidebar with 5 nav items + collapse toggle.

2. Sidebar Navigation — The Side Buttons
Implemented in src/components/Sidebar.jsx using NAV_ITEMS array.

Button	Icon	Route	Active State
Analytics	analytics	/dashboard	Gradient bar left, accent icon, bg-primary/15
Scanner	camera_alt	/dashboard/scanner	Bold stroke (2.2), white text
Map	map	/dashboard/map	Chevron rotate indicator
History	history	/dashboard/history	Pulse animation on new scans
Settings	settings	/dashboard/settings	Gear spin on hover
Each uses <NavLink> from React Router. Active detection compares location.pathname. Collapsed mode (72px) hides labels, shows icons only. Footer displays avatar + displayName + logout calling signOut(auth) → /.

3. Toggle Button — Sidebar Collapse/Expand
Desktop (>=1024px): Fixed left panel (256px→72px animated). Toggle button absolute positioned "sticks out" right edge with rotating ChevronLeft icon. Main content ml-[sidebarWidth] transitions smoothly.

Mobile (<768px): Hamburger top-left opens full overlay drawer (bg-black/70 backdrop-blur). X close top-right. Nav taps auto-dismiss. No collapse — always expanded when open.

Hook useIsMobile() via window.matchMedia('(max-width: 767px)') drives all adaptations with live resize listener.

4. Landing Page (/)
Hero section with kita-green gradient, project title "KITA_HACK: AI Waste Scanner", SDG 12 stats (Johor Bahru 65% non-recycling rate). Dual CTAs: "Get Started" → /login, "Learn More" → /guidelines (guest preview). Responsive cards stack vertical on mobile.

5. Auth Pages (/login, /signup)
Shared Layout: Centered card max-w-md p-8 with glassmorphism, form validation (Zod + React Hook Form).

Login Fields: Email, Password (eye toggle), "Forgot?" → modal, Google button.
Signup Fields: Full Name, Email, Password, Confirm Password.
Flow: Submit → Firebase Auth → signup_success analytics → /dashboard. Error banners red with codes. Back arrow → /.

Social: Google popup full impl; Apple/Meta UI placeholders.

6. Analytics Page (/dashboard - Default Landing)
User Stats Cards (3-column grid desktop, stack mobile):

Weekly Scans: Bar chart (Firestore query last 7 days)

Total Impact: Kg diverted + CO2 saved

Points: Daily streak counter + "Check In Daily" button → modal with confetti
Quick Actions: "Scan Now" → /scanner, "View Map" → /map
Daily Check-In: Modal with "Claim Points" → Firestore increment + badge.

7. Scanner Page (/dashboard/scanner)
Live rear camera getUserMedia 640x480 frames @1fps. AR overlay: confidence ring, waste preview. Locked result → modal with:

Waste Type + confidence bar

Immediate Rules: Tips from rules(but shorten version,only include key points(as short as possible to make the words look neat on scanner screen))

Reminder Checklist: 4-6 steps with checkboxes
Actions: "Scan Bin" toggle, "View Map", "Save & History".

8. Map Page (/dashboard/map)
Google Maps centered GPS, markers by disposal (green recycle, orange donate, red dispose). Bottom sheet per marker: distance, hours, navigate URL. Filter tabs: All/Recycle/Donate. List toggle below map.

9. History Page (/dashboard/history)
Firestore scans query ordered timestamp DESC. List cards: thumbnail, type, date, bin match ✓/✗, expand → full rules/reminders/checklist from scan data.

10. Guidelines Page (/dashboard/guidelines)
Tabbed content: Based on Rules.md

11. Settings Page (/dashboard/settings)
## Overview
The Settings page allows users to manage their profile, security, and application preferences. It is divided into four clearly labelled sections rendered as stacked cards: **Profile**, **Security**, **Preferences**, and **Danger Zone**. The Preferences section contains the signature Day/Night Theme Toggle described in full below.

---

## Sections

### 1. Profile Card
- **Avatar Upload:** Circular avatar (80px diameter) with a camera-icon overlay on hover. Clicking opens a file picker; accepts JPEG/PNG up to 2 MB. On selection, shows a cropping modal before uploading to Firebase Storage via `PUT /api/v1/user/profile`.
- **Display Name:** Single text input, pre-filled from Firestore `displayName`. Inline save button appears on change; on submit calls `PUT /api/v1/user/profile`.
- **Email:** Read-only display with a lock icon. Tooltip: "Email cannot be changed."
- **Save button:** Primary green button, disabled until a field changes. Shows spinner + "Saving…" on submit, then "Saved ✓" for 2 s.

---

### 2. Security Card
- **Change Password:** Entirely client-side via Firebase SDK `updatePassword()`. Three inputs: Current Password, New Password, Confirm New Password. Password strength meter (weak/medium/strong) updates live on the New Password field. Submit button calls `reauthenticateWithCredential` then `updatePassword`. Success toast: "Password updated."
- **Eye-toggle icons** on all three inputs to reveal/mask characters.

---

### 3. Preferences Card
This card contains two rows: **Notifications** (a plain toggle) and **Theme** (the animated Day/Night toggle described in full below).

#### 3a. Notifications Toggle
Standard pill toggle (36×20px), green when on. Label: "Push Notifications". Subtitle: "Scan reminders and streak alerts."

---

#### 3b. 🌗 Day / Night Theme Toggle — Full Animation Spec

**Container ("Stadium Pill")**

The toggle lives inside a horizontal pill-shaped container — **120px wide × 52px tall**, border-radius `9999px`. The pill is split visually into two permanent environmental zones that are always simultaneously rendered behind the travelling orb:

- **Left zone (Day):** A warm peach-to-sky-blue linear gradient background (`#FDDCB5 → #87CEEB`), rendered across the full left half of the pill. Contains two layered clouds (pure white, `border-radius: 50%` blobs) and a minimal city skyline: 4–5 rectangular buildings in soft light-blue (`#B8D4E8`) with a flat-topped bridge silhouette in front. Buildings have no illuminated windows in Day mode.
- **Right zone (Night):** A deep navy background (`#0D1B3E → #1A2F5A` vertical gradient) rendered across the full right half. Contains a cluster of 6–8 five-pointed stars (CSS `clip-path` or SVG `polygon`) scattered at varying sizes (2px–5px) and a matching city skyline where building windows glow yellow (`#FFD700`, `box-shadow: 0 0 4px #FFD700`).

Both zones are stacked as absolutely positioned layers inside the pill. They are always present; the slider orb travels over them as a floating layer above.

**Dual-Tone Animated Border**

The pill container has a `2px` border rendered as a CSS `conic-gradient` or SVG `stroke`:
- **Left semicircle of the border:** Pale cream-gold (`#F5E6A3`)
- **Right semicircle of the border:** Electric cyan-blue (`#00D4FF`)
- Border does not transition — it is always split at the 50% mark regardless of toggle state.
- On hover: border glow intensifies — left half adds `box-shadow: -2px 0 8px rgba(245,230,163,0.7)`, right half adds `box-shadow: 2px 0 8px rgba(0,212,255,0.6)`.

---

**The Slider Orb — Positioning**

The circular orb is **40px × 40px**, `border-radius: 50%`, absolutely positioned inside the pill with `top: 6px`.
- **Day state (active):** Orb sits at `left: 74px` (right side of pill).
- **Night state (active):** Orb sits at `left: 6px` (left side of pill).
- Horizontal travel: `transform: translateX()` transition over **0.6 s**, `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out).
- The orb floats above the background via `box-shadow: 0 4px 12px rgba(0,0,0,0.35)`.

---

**The Morphing Orb — Sun ↔ Moon SVG Transformation**

The orb's interior is a single inline SVG (`width: 40, height: 40, viewBox: "0 0 100 100"`).

**Structure:**
```svg
<svg width="40" height="40" viewBox="0 0 100 100">
  <defs>
    <mask id="moon-mask-[unique-id]">
      <!-- The orb's visible area -->
      <circle cx="50" cy="50" r="46" fill="white" />
      <!-- The crescent shadow — a black circle that sweeps across to carve the crescent -->
      <circle class="crescent-shadow" cx="85" cy="18" r="42" fill="black" />
    </mask>
    <!-- Moon crater texture: subtle radial gradients -->
    <radialGradient id="crater1" cx="35%" cy="40%" r="12%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.15)" />
      <stop offset="100%" stop-color="transparent" />
    </radialGradient>
    <radialGradient id="crater2" cx="65%" cy="65%" r="8%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.10)" />
      <stop offset="100%" stop-color="transparent" />
    </radialGradient>
  </defs>

  <!-- Main orb body — colour transitions from Sun-gold to Moon-silver -->
  <circle class="orb-body" cx="50" cy="50" r="46" fill="#F9D71C" mask="url(#moon-mask-[unique-id])" />

  <!-- Moon craters — only visible in Night state (opacity transition) -->
  <circle class="crater crater-1" cx="35" cy="40" r="10" fill="url(#crater1)" opacity="0" />
  <circle class="crater crater-2" cx="65" cy="65" r="7"  fill="url(#crater2)" opacity="0" />
</svg>
```

**Day → Night transition (triggered when toggle switches to Night / orb travels left):**

| Property | Day Value | Night Value | Transition |
|---|---|---|---|
| `.orb-body` fill | `#F9D71C` (warm gold) | `#D8D8D8` (cool silver-grey) | `fill` transition 0.5 s ease |
| `.crescent-shadow` cx | `85` (off-screen right, shadow hidden) | `62` (overlaps orb body from upper-right) | `cx` attribute transition 0.6 s cubic-bezier(0.4,0,0.2,1) |
| `.crescent-shadow` cy | `18` | `28` | same transition |
| `.crater` opacity | `0` | `1` | opacity 0.4 s ease, delay 0.2 s |
| Orb `box-shadow` | `0 4px 12px rgba(249,215,28,0.6)` (yellow glow) | `0 4px 12px rgba(0,212,255,0.5)` (cyan glow) | 0.6 s ease |

**Night → Day transition (orb travels right):** All values reverse simultaneously at the same timing. The crescent shadow sweeps back off to cx=`85`, cy=`18`, the fill warms back to gold, craters fade to opacity `0`.

The result: as the orb physically slides left, the black masking circle appears to sweep across from the upper-right of the orb face, carving away the illuminated area and revealing a silver crescent on the left edge — the classic lunar crescent shape — before the orb comes to rest fully transformed into the Moon.

---

**Parallax Backdrop Elements**

Background clouds, stars, and city elements animate independently of the orb using CSS transitions with slight delays, creating a parallax depth effect.

**Switching to Night (orb moving left):**
1. Clouds (Day zone): `opacity: 1 → 0`, `transform: translateX(-8px)` over 0.3 s ease-out, beginning immediately.
2. Stars (Night zone): `opacity: 0 → 1` over 0.4 s ease-in, starting at 0.15 s delay. Each star has an individual `animation: twinkle 1.5s infinite alternate` that modulates opacity between 0.6–1.0 once visible.
3. Building windows (Night zone): Transition from `background: #1A2F5A` to `background: #FFD700` with `box-shadow: 0 0 6px 2px rgba(255,215,0,0.5)` over 0.4 s ease, starting at 0.2 s delay.

**Switching to Day (orb moving right):**
1. Stars: `opacity: 1 → 0` over 0.25 s ease-out immediately.
2. Clouds: `opacity: 0 → 1`, `transform: translateX(0)` over 0.4 s ease-in, starting at 0.1 s delay.
3. Building windows (Night zone): Revert glow → dark over 0.3 s.

**Star Twinkle Keyframes:**
```css
@keyframes twinkle {
  from { opacity: 0.5; transform: scale(0.85); }
  to   { opacity: 1.0; transform: scale(1.1); }
}
/* Stagger each star with animation-delay: 0s, 0.3s, 0.6s, 0.9s, 1.2s, 1.5s */
```

---

**Full CSS Timing Summary**

| Element | Trigger | Duration | Easing | Delay |
|---|---|---|---|---|
| Orb horizontal travel | Toggle click | 0.6 s | cubic-bezier(0.4,0,0.2,1) | 0 s |
| Orb fill (gold→silver) | Toggle click | 0.5 s | ease | 0 s |
| Crescent shadow sweep | Toggle click | 0.6 s | cubic-bezier(0.4,0,0.2,1) | 0 s |
| Moon craters fade in | → Night | 0.4 s | ease | 0.2 s |
| Orb glow colour | Toggle click | 0.6 s | ease | 0 s |
| Clouds fade out | → Night | 0.3 s | ease-out | 0 s |
| Stars fade in | → Night | 0.4 s | ease-in | 0.15 s |
| Building lights on | → Night | 0.4 s | ease | 0.2 s |
| Stars fade out | → Day | 0.25 s | ease-out | 0 s |
| Clouds fade in | → Day | 0.4 s | ease-in | 0.1 s |
| Building lights off | → Day | 0.3 s | ease | 0 s |

---

**State Management**

```jsx
// React state
const [isDark, setIsDark] = useState(false); // false = Day, true = Night

// On toggle, update state + persist to Firestore
const handleThemeToggle = async () => {
  const next = !isDark;
  setIsDark(next);
  document.documentElement.classList.toggle('dark', next);
  await updateDoc(userRef, { themePreference: next ? 'dark' : 'light' });
};
```

Apply `data-theme="day"` or `data-theme="night"` to the pill container so all child CSS selectors can key off it:
```jsx
<div className="theme-pill" data-theme={isDark ? 'night' : 'day'} onClick={handleThemeToggle}>
  ...
</div>
```

---

### 4. Danger Zone Card
- Destructive red-bordered card.
- Single button: **"Delete Account"** — outlined red, `border: 1.5px solid #EF4444`.
- Clicking opens a confirmation modal requiring the user to type `DELETE` to confirm.
- On confirm: calls `DELETE /api/v1/user` → Firebase Auth `deleteUser()` client-side → redirect to `/`.
- Modal shows a 5-second countdown before the confirm button becomes active to prevent accidental deletion.

---

## Layout & Responsive Behaviour

- Desktop: Single-column stack of 4 cards, `max-width: 640px`, centred in the dashboard content area.
- Mobile: Cards are full-width, `mx-4`. Theme toggle pill scales proportionally (`transform: scale(0.9)` on screens <360px).
- All card sections have `padding: 24px`, `border-radius: 16px`, subtle `box-shadow: 0 1px 4px rgba(0,0,0,0.08)`.

12. Mobile Responsiveness
Tailwind breakpoints: sm(640px), md(768px), lg(1024px). Cards w-full md:max-w-md, inputs h-12 px-4 touch targets. Sidebar drawer overlays with escape key support. Lighthouse 95+ scores targeted.

ProtectedRoute Flow: Auth listener → loading spinner → /dashboard/analytics or /login. Deep links kita-hack://scanner → protected scanner preserving state.