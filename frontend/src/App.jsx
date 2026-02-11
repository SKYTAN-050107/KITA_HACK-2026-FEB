// src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ScannerPage from './pages/ScannerPage';
import MainLayout from './components/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout text-kita-green>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route
          path="/scanner"
          element={
            <MainLayout hideNavbar>
              <ScannerPage />
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
