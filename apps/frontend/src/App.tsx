import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const LandingPage = lazy(async () => ({ default: (await import("@/pages/LandingPage")).LandingPage }));
const LoginPage = lazy(async () => ({ default: (await import("@/pages/LoginPage")).LoginPage }));
const RegisterPage = lazy(async () => ({ default: (await import("@/pages/RegisterPage")).RegisterPage }));
const EmailVerifyPage = lazy(async () => ({
  default: (await import("@/pages/EmailVerifyPage")).EmailVerifyPage
}));
const DashboardPage = lazy(async () => ({
  default: (await import("@/pages/DashboardPage")).DashboardPage
}));
const SitesPage = lazy(async () => ({ default: (await import("@/pages/SitesPage")).SitesPage }));
const ProvidersPage = lazy(async () => ({
  default: (await import("@/pages/ProvidersPage")).ProvidersPage
}));
const DnsProvidersPage = lazy(async () => ({
  default: (await import("@/pages/DnsProvidersPage")).DnsProvidersPage
}));
const DomainSettingsPage = lazy(async () => ({
  default: (await import("@/pages/DomainSettingsPage")).DomainSettingsPage
}));
const DeploymentsPage = lazy(async () => ({
  default: (await import("@/pages/DeploymentsPage")).DeploymentsPage
}));
const RenewalSettingsPage = lazy(async () => ({
  default: (await import("@/pages/RenewalSettingsPage")).RenewalSettingsPage
}));
const AppShell = lazy(async () => ({ default: (await import("@/components/AppShell")).AppShell }));

function RouteFallback() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-20 md:px-6">
      <div className="skeleton h-10 w-64 rounded-full" />
      <div className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton h-[148px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function RouteSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { accessToken, ready } = useAuth();
  if (!ready) {
    return <RouteFallback />;
  }
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RouteSuspense><LandingPage /></RouteSuspense>} />
      <Route path="/login" element={<RouteSuspense><LoginPage /></RouteSuspense>} />
      <Route path="/register" element={<RouteSuspense><RegisterPage /></RouteSuspense>} />
      <Route path="/verify" element={<RouteSuspense><EmailVerifyPage /></RouteSuspense>} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <RouteSuspense>
              <AppShell />
            </RouteSuspense>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<RouteSuspense><DashboardPage /></RouteSuspense>} />
        <Route path="sites" element={<RouteSuspense><SitesPage /></RouteSuspense>} />
        <Route path="domain-settings" element={<RouteSuspense><DomainSettingsPage /></RouteSuspense>} />
        <Route path="providers" element={<RouteSuspense><ProvidersPage /></RouteSuspense>} />
        <Route path="dns-providers" element={<RouteSuspense><DnsProvidersPage /></RouteSuspense>} />
        <Route path="deployments" element={<RouteSuspense><DeploymentsPage /></RouteSuspense>} />
        <Route path="renewal-settings" element={<RouteSuspense><RenewalSettingsPage /></RouteSuspense>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
