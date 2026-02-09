import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { SitesPage } from "@/pages/SitesPage";
import { ProvidersPage } from "@/pages/ProvidersPage";
import { DnsProvidersPage } from "@/pages/DnsProvidersPage";
import { DomainSettingsPage } from "@/pages/DomainSettingsPage";
import { DeploymentsPage } from "@/pages/DeploymentsPage";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { accessToken, ready } = useAuth();
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        正在加载...
      </div>
    );
  }
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="sites" element={<SitesPage />} />
        <Route path="domain-settings" element={<DomainSettingsPage />} />
        <Route path="providers" element={<ProvidersPage />} />
        <Route path="dns-providers" element={<DnsProvidersPage />} />
        <Route path="deployments" element={<DeploymentsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
