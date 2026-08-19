import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ResearchProvider } from "./context/ResearchContext";
import { ToastProvider } from "./context/ToastContext";
import { ToastContainer } from "./components/common/ToastContainer";
import { TopBar } from "./components/common/TopBar";
import { BottomNavigation } from "./components/common/BottomNavigation";
import { ResearchProgressModal } from "./components/research/ResearchProgressModal";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ResearchPage } from "./pages/ResearchPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ProfilePage } from "./pages/ProfilePage";

const RootRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading Academic Context...
          </p>
        </div>
      </div>
    );
  }

  // If user is logged in, show Dashboard directly; otherwise show Landing Page
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
};

const AuthRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Verifying Session...
          </p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AuthPage />;
};

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading Academic Context...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <TopBar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-7">
        {children}
      </main>
      <BottomNavigation />
      <ResearchProgressModal />
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ResearchProvider>
          <ToastContainer />
          <Router>
            <Routes>
              <Route path="/" element={<RootRoute />} />
              <Route path="/auth" element={<AuthRoute />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedLayout>
                    <DashboardPage />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/research"
                element={
                  <ProtectedLayout>
                    <ResearchPage />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/history"
                element={
                  <ProtectedLayout>
                    <HistoryPage />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedLayout>
                    <ProfilePage />
                  </ProtectedLayout>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ResearchProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
