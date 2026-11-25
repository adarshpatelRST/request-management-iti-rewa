/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { StoreProvider, useStore } from './context/StoreContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { VoiceTypingProvider } from './context/VoiceTypingContext';
import { AppShell } from './components/layouts/AppShell';
import { LoginPage } from './pages/LoginPage';
import { TODashboardPage } from './pages/to/TODashboardPage';
import { TORaiseRequestPage } from './pages/to/TORaiseRequestPage';
import { TOMyRequestsPage } from './pages/to/TOMyRequestsPage';
import { TSVerificationQueuePage } from './pages/ts/TSVerificationQueuePage';
import { TSHistoryPage } from './pages/ts/TSHistoryPage';
import { PrincipalDashboardPage } from './pages/principal/PrincipalDashboardPage';
import { PrincipalApprovalsPage } from './pages/principal/PrincipalApprovalsPage';
import {
  PrincipalStoreViewPage,
  PrincipalAllRequestsPage,
} from './pages/principal/PrincipalStoreAndRequestsPage';
import { PurchaseDashboardPage } from './pages/purchase/PurchaseDashboardPage';
import { PurchaseApprovedAndPrintPage } from './pages/purchase/PurchaseApprovedAndPrintPage';
import { PurchaseOrdersPage } from './pages/purchase/PurchaseOrdersPage';
import { StoreDashboardPage } from './pages/store/StoreDashboardPage';
import { StoreReceivingPage } from './pages/store/StoreReceivingPage';
import { StoreDirectIssuesPage } from './pages/store/StoreDirectIssuesPage';
import { StoreInventoryLedgerPage } from './pages/store/StoreInventoryLedgerPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminCatalogPage } from './pages/admin/AdminCatalogPage';
import { AdminUsersHierarchyPage } from './pages/admin/AdminUsersHierarchyPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { getDefaultRouteForRole } from './utils/storeLogic';

const RootRedirect: React.FC = () => {
  const { currentUser } = useStore();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getDefaultRouteForRole(currentUser.role)} replace />;
};

export default function App() {
  const [isMobile, setIsMobile] = React.useState(
    () => typeof window !== 'undefined' && window.innerWidth < 640
  );

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <LanguageProvider>
      <VoiceTypingProvider>
        <StoreProvider>
          <BrowserRouter>
        <Toaster
          position={isMobile ? 'top-center' : 'bottom-right'}
          richColors
          closeButton
          duration={5000}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Role-Based Routes inside AppShell */}
          <Route element={<AppShell />}>
            {/* PART 2 ROUTES: Training Officer (TO) */}
            <Route path="/to/dashboard" element={<TODashboardPage />} />
            <Route path="/to/raise-request" element={<TORaiseRequestPage />} />
            <Route
              path="/to/new-request"
              element={<Navigate to="/to/raise-request" replace />}
            />
            <Route path="/to/requests" element={<Navigate to="/to/dashboard" replace />} />

            {/* PART 2 ROUTES: Training Superintendent (TS) */}
            <Route
              path="/ts/dashboard"
              element={<TSVerificationQueuePage isDashboardView />}
            />
            <Route
              path="/ts/queue"
              element={<Navigate to="/ts/dashboard" replace />}
            />
            <Route
              path="/ts/verification"
              element={<Navigate to="/ts/dashboard" replace />}
            />
            <Route path="/ts/history" element={<TSHistoryPage />} />

            {/* PART 2 ROUTES: Principal */}
            <Route path="/principal/dashboard" element={<PrincipalDashboardPage />} />
            <Route
              path="/principal/analytics"
              element={<Navigate to="/principal/dashboard" replace />}
            />
            <Route path="/principal/approvals" element={<PrincipalApprovalsPage />} />
            <Route path="/principal/store" element={<PrincipalStoreViewPage />} />
            <Route path="/principal/requests" element={<PrincipalAllRequestsPage />} />

            {/* PART 3 ROUTES: Purchase Team */}
            <Route
              path="/purchase/dashboard"
              element={<Navigate to="/purchase/approved" replace />}
            />
            <Route
              path="/purchase/approved"
              element={<PurchaseApprovedAndPrintPage />}
            />
            <Route
              path="/purchase/consolidation"
              element={<Navigate to="/purchase/approved" replace />}
            />
            <Route path="/purchase/orders" element={<PurchaseOrdersPage />} />

            {/* PART 3 ROUTES: Store Manager */}
            <Route path="/store/dashboard" element={<StoreDashboardPage />} />
            <Route path="/store/receiving" element={<StoreReceivingPage />} />
            <Route
              path="/store/challans"
              element={<Navigate to="/store/receiving" replace />}
            />
            <Route path="/store/issues" element={<StoreDirectIssuesPage />} />
            <Route path="/store/inventory" element={<StoreInventoryLedgerPage />} />

            {/* PART 3 ROUTES: System Admin */}
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route
              path="/admin/analytics"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route
              path="/admin/store"
              element={<StoreInventoryLedgerPage readOnly />}
            />
            <Route path="/admin/catalog" element={<AdminCatalogPage />} />
            <Route path="/admin/users" element={<AdminUsersHierarchyPage />} />
            <Route
              path="/admin/hierarchy"
              element={<Navigate to="/admin/users" replace />}
            />
            <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  </VoiceTypingProvider>
</LanguageProvider>
);
}
