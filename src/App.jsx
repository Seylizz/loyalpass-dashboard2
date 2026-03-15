import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Caisse from './pages/Caisse';
import QRCode from './pages/QRCode';
import Abonnement from './pages/Abonnement';
import Programme from './pages/Programme';
import ResetPassword from './pages/ResetPassword';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
      <Route path="/caisse" element={<ProtectedRoute><Caisse /></ProtectedRoute>} />
      <Route path="/qrcode" element={<ProtectedRoute><QRCode /></ProtectedRoute>} />
      <Route path="/abonnement" element={<ProtectedRoute><Abonnement /></ProtectedRoute>} />
      <Route path="/programme" element={<ProtectedRoute><Programme /></ProtectedRoute>} />
    </Routes>
  );
}