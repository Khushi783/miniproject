import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { Toaster } from './components/ui/sonner';
import Navbar from './components/Navbar';

// Page Imports
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CreateProjectPage from './pages/CreateProjectPage';
import BrowseProjectsPage from './pages/BrowseProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import TeamManagementPage from './pages/TeamManagementPage';
import NotificationsPage from './pages/NotificationsPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/projects/create" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />
            <Route path="/projects/browse" element={<ProtectedRoute><BrowseProjectsPage /></ProtectedRoute>} />
            <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetailsPage /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><TeamManagementPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
