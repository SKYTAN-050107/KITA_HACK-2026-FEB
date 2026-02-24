// src/components/ProtectedRoute.jsx
// Placeholder: passes through for now. Firebase Auth protection will be added in Step 4.

import { Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  // TODO (Step 4): Subscribe to Firebase onAuthStateChanged
  // - Loading state → spinner
  // - Unauthenticated → redirect to /login
  // - Authenticated → render children via <Outlet />

  return <Outlet />;
}
