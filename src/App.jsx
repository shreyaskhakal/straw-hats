import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MandatesPage from './pages/MandatesPage';
import ShoppingAgentPage from './pages/ShoppingAgentPage';
import PurchaseRequestsPage from './pages/PurchaseRequestsPage';
import PaymentMethodsPage from './pages/PaymentMethodsPage';
import AgentPassportPage from './pages/AgentPassportPage';
import ActivityPage from './pages/ActivityPage';
import SecurityPage from './pages/SecurityPage';
import SettingsPage from './pages/SettingsPage';
import MerchantVerifyPage from './pages/MerchantVerifyPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/mandates" element={<MandatesPage />} />
      <Route path="/agent" element={<ShoppingAgentPage />} />
      <Route path="/requests" element={<PurchaseRequestsPage />} />
      <Route path="/payment-methods" element={<PaymentMethodsPage />} />
      <Route path="/passport" element={<AgentPassportPage />} />
      <Route path="/activity" element={<ActivityPage />} />
      <Route path="/security" element={<SecurityPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/verify/:token" element={<MerchantVerifyPage />} />
      <Route path="/verify" element={<MerchantVerifyPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
