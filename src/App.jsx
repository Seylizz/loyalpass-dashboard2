import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Caisse from './pages/Caisse';
import QRCode from './pages/QRCode';
import Abonnement from './pages/Abonnement';
import Programme from './pages/Programme';

const ProtectedRoute = ({ children }) => {
  return localStorage.getItem('token') ? children : <Navigate to="/" />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
      <Route path="/caisse" element={<ProtectedRoute><Caisse /></ProtectedRoute>} />
      <Route path="/qrcode" element={<ProtectedRoute><QRCode /></ProtectedRoute>} />
      <Route path="/abonnement" element={<ProtectedRoute><Abonnement /></ProtectedRoute>} />
      <Route path="/programme" element={<ProtectedRoute><Programme /></ProtectedRoute>} />
    </Routes>
  );
}