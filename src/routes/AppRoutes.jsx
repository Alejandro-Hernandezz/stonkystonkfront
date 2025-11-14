import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import VerifyEmail from '../pages/VerifyEmail';
import Dashboard from '../pages/Dashboard';
import Transactions from '../pages/Transactions';
import Goals from '../pages/Goals';
import Budgets from '../pages/Budgets';
import Reports from '../pages/Reports';
import Analysis from '../pages/Analysis';
import Settings from '../pages/Settings';

// Componente para proteger rutas
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Componente para rutas públicas (redirige si ya está logueado)
function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ==================== RUTAS PÚBLICAS ==================== */}
      
      {/* Autenticación */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      
      {/* Recuperación de contraseña */}
      <Route 
        path="/forgot-password" 
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } 
      />
      <Route 
        path="/reset-password" 
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        } 
      />
      
      {/* Verificación de email */}
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* ==================== RUTAS PRIVADAS (requieren autenticación) ==================== */}
      
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/transactions" 
        element={
          <PrivateRoute>
            <Transactions />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/goals" 
        element={
          <PrivateRoute>
            <Goals />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/budgets" 
        element={
          <PrivateRoute>
            <Budgets />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/analysis" 
        element={
          <PrivateRoute>
            <Analysis />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } 
      />

      {/* ==================== RUTAS POR DEFECTO ==================== */}
      
      {/* Ruta por defecto */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 - Página no encontrada */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}