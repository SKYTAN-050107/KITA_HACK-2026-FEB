// src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ScannerPage from './pages/ScannerPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/scanner" element={<ScannerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
