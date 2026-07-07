import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import MyReports from './pages/MyReports';
import ReportForm from './pages/ReportForm';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import TeamReports from './pages/TeamReports';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'manager' ? '/dashboard' : '/my-reports'} replace />;
}

function App() {
  return (
    <GoogleOAuthProvider clientId="489643668873-eriei3teoa121tglmfttdcdpei4pjgp9.apps.googleusercontent.com">
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              background: '#1e293b',
              color: '#fff',
              fontSize: '14px',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
            },
            success: { iconTheme: { primary: '#0d9488', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* App Layout & Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Index Redirect */}
            <Route index element={<HomeRedirect />} />

            {/* Member Routes */}
            <Route
              path="my-reports"
              element={
                <ProtectedRoute allowedRoles={['member']}>
                  <MyReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-reports/new"
              element={
                <ProtectedRoute allowedRoles={['member']}>
                  <ReportForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-reports/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['member']}>
                  <ReportForm />
                </ProtectedRoute>
              }
            />

            {/* Manager Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <Projects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team-reports"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <TeamReports />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Wildcard Redirect handler */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;