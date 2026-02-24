// src/components/DashboardLayout.jsx
// Wraps protected dashboard routes. Full-screen routes (scanner, map) bypass the shell.

import { Outlet, useLocation } from 'react-router-dom';
import MainLayout from './MainLayout';

const FULL_SCREEN_ROUTES = ['/dashboard/scanner', '/dashboard/map'];

export default function DashboardLayout() {
  const location = useLocation();
  const isFullScreen = FULL_SCREEN_ROUTES.includes(location.pathname);

  // Scanner & Map already have their own full-screen chrome
  if (isFullScreen) {
    return <Outlet />;
  }

  // All other dashboard pages get the standard shell (Navbar + ambient orbs + footer)
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
