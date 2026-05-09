import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, pendingCorrections: 0, todayAttendance: 0, totalRecords: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, correctionsRes, attendanceRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/corrections?status=pending&limit=1'),
          api.get('/admin/attendance?limit=1'),
        ]);
        setStats({
          users: usersRes.data.data.length,
          pendingCorrections: correctionsRes.data.data.total,
          totalRecords: attendanceRes.data.data.total,
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loader"><div className="loader-spinner" /></div>;

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>System overview and management</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card stat-card--primary">
          <div className="stat-card__label">Total Users</div>
          <div className="stat-card__value">{stats.users}</div>
        </div>
        <div className="stat-card stat-card--warning">
          <div className="stat-card__label">Pending Corrections</div>
          <div className="stat-card__value">{stats.pendingCorrections}</div>
        </div>
        <div className="stat-card stat-card--success">
          <div className="stat-card__label">Attendance Records</div>
          <div className="stat-card__value">{stats.totalRecords}</div>
        </div>
      </div>
      <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '8px' }}>Admin Controls</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.875rem' }}>
          Manage users, configure attendance rules, and review audit logs from the sidebar.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/admin/users" className="btn btn-primary">Manage Users</a>
          <a href="/admin/rules" className="btn btn-ghost">Attendance Rules</a>
          <a href="/admin/audit-logs" className="btn btn-ghost">Audit Logs</a>
        </div>
      </div>
    </div>
  );
}
