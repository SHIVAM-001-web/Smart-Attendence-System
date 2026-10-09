import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Attendance from './pages/Attendance';
import AdminDashboard from './pages/AdminDashboard';
import FaceRegistration from './pages/FaceRegistration';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/dashboard" element={<Navigate to="/attendance" replace />} />
            <Route path="/" element={<Navigate to="/attendance" replace />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/face-register" element={<FaceRegistration />} />
          </Route>

          <Route path="*" element={<div style={{ padding: '20px', textAlign: 'center' }}>404: Page Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;