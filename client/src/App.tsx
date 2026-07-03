import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { AuthProvider, useAuth } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { ShowcasePage } from './pages/ShowcasePage';
import { TransmissionsPage } from './pages/TransmissionsPage';
import { TablePage } from './pages/TablePage';
import { InnerSanctum } from './pages/InnerSanctum';
import { DashboardPage } from './pages/DashboardPage';
import { Login } from './auth/Login';
import { Register } from './auth/Register';

import { Background } from './components/common/Background';
import { Navigation } from './components/common/Navigation';
import { SacredGeometry } from './components/common/SacredGeometry';

import './index.css';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [showGeometry, setShowGeometry] = useState(true);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-void-black">
        <SacredGeometry animate={true} size={100} />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        className="min-h-screen bg-void-black text-ghost-white font-inter overflow-x-hidden"
      >
        {showGeometry && <Background />}
        
        <Routes>
          <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="/transmissions" element={<TransmissionsPage />} />
          <Route path="/table" element={<TablePage />} />
          <Route path="/sanctum" element={<InnerSanctum />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <>
                <Navigation />
                <DashboardPage />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="/chamber/:id" element={
            <ProtectedRoute>
              <>
                <Navigation />
                <div className="ml-64 pt-16">
                  <DashboardPage chamberId={window.location.pathname.split('/').pop()} />
                </div>
              </>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};