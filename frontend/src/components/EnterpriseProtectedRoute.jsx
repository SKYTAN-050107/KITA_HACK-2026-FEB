import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * EnterpriseProtectedRoute.jsx
 *
 * Guards enterprise dashboard pages.
 * Uses localStorage mock auth (separate from your real user auth).
 * Does NOT interfere with your existing user auth/ProtectedRoute.
 *
 * Supports both patterns:
 *   <Route element={<EnterpriseProtectedRoute />}>  (Outlet)
 *   <EnterpriseProtectedRoute>{children}</EnterpriseProtectedRoute>
 */

const EnterpriseProtectedRoute = ({ children }) => {
  const isEnterpriseLoggedIn =
    localStorage.getItem('isLoggedIn') === 'true' &&
    localStorage.getItem('userType') === 'enterprise';

  if (!isEnterpriseLoggedIn) {
    return <Navigate to="/login/enterprise" replace />;
  }

  return children || <Outlet />;
};

export default EnterpriseProtectedRoute;
