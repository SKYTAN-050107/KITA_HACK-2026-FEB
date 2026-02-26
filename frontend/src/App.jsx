// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ScannerPage from './pages/ScannerPage';
import MapPage from './pages/MapPage';
import HistoryPage from './pages/HistoryPage';
import GuidelinesPage from './pages/GuidelinesPage';
import SettingsPage from './pages/SettingsPage';
import ScanResultPage from './pages/ScanResultPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage defaultMode="signup" />} />

        {/* Protected dashboard routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="scanner" element={<ScannerPage />} />
            <Route path="scanner/result" element={<ScanResultPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="guidelines" element={<GuidelinesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Catch-all → landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
