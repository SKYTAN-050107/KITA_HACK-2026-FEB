import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * EnterpriseProtectedRoute.jsx
 *
 * Guards enterprise dashboard pages.
 * Uses localStorage mock auth (separate from your real user auth).
 * Does NOT interfere with your existing user auth/ProtectedRoute.
 */

const EnterpriseProtectedRoute = ({ children }) => {
  const isEnterpriseLoggedIn =
    localStorage.getItem('isLoggedIn') === 'true' &&
    localStorage.getItem('userType') === 'enterprise';

  if (!isEnterpriseLoggedIn) {
    return <Navigate to="/login/enterprise" replace />;
  }

  return children;
};

export default EnterpriseProtectedRoute;
