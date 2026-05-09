import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeHistory from './pages/employee/History';
import EmployeeCorrections from './pages/employee/Corrections';
import HRDashboard from './pages/hr/Dashboard';
import HRCorrectionReview from './pages/hr/CorrectionReview';
import HRAttendanceView from './pages/hr/AttendanceView';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUserManagement from './pages/admin/UserManagement';
import AdminAttendanceRules from './pages/admin/AttendanceRules';
import AdminAttendanceView from './pages/admin/AttendanceView';
import AdminAuditLogs from './pages/admin/AuditLogs';
import AdminCorrections from './pages/admin/Corrections';

function RootRedirect() {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <div className="loader" style={{ height: '100vh' }}><div className="loader-spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={`/${role}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e1e3a',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '0.875rem',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Employee Routes */}
          <Route element={<DashboardLayout allowedRoles={['employee']} />}>
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/employee/history" element={<EmployeeHistory />} />
            <Route path="/employee/corrections" element={<EmployeeCorrections />} />
          </Route>

          {/* HR Routes */}
          <Route element={<DashboardLayout allowedRoles={['hr']} />}>
            <Route path="/hr" element={<HRDashboard />} />
            <Route path="/hr/corrections" element={<HRCorrectionReview />} />
            <Route path="/hr/attendance" element={<HRAttendanceView />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<DashboardLayout allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/admin/attendance" element={<AdminAttendanceView />} />
            <Route path="/admin/corrections" element={<AdminCorrections />} />
            <Route path="/admin/rules" element={<AdminAttendanceRules />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
