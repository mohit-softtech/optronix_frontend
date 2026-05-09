import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function DashboardLayout({ allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="loader" style={{ height: '100vh' }}>
        <div className="loader-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={`/${role}`} replace />;
  }

  return (
    <div className="layout">
      <Sidebar />
      <main className="layout-main">
        <Header />
        <div className="layout-content animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
