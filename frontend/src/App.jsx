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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<RoleSelector mode="login" LoginComponent={AuthPage} />} />
        <Route path="/signup" element={<RoleSelector mode="signup" SignupComponent={() => <AuthPage defaultMode="signup" />} />} />
        <Route path="/login/enterprise" element={<EnterpriseLogin />} />

        {/* Enterprise dashboard — uses DashboardLayout (same sidebar+navbar as normal user) */}
        <Route element={<EnterpriseProtectedRoute />}>
          <Route path="/dashboard/enterprise" element={<DashboardLayout />}>
            <Route index element={<EnterpriseDashboard />} />
          </Route>
        </Route>

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
            {/* Marketplace routes */}
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="marketplace/listings" element={<MyListings />} />
            <Route path="marketplace/listings/new" element={<CreateListingForm />} />
            <Route path="marketplace/listings/:listingId" element={<ListingDetail />} />
            <Route path="marketplace/listings/:listingId/edit" element={<CreateListingForm />} />
            <Route path="marketplace/offers" element={<OffersManagement />} />
            <Route path="marketplace/offers/:offerId" element={<OfferDetail />} />
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
