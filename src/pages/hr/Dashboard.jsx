import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function HRDashboard() {
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, totalEmployees: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pendingRes, allRes, attendanceRes] = await Promise.all([
          api.get('/hr/corrections?status=pending&limit=1'),
          api.get('/hr/corrections?limit=1'),
          api.get('/hr/attendance?limit=1'),
        ]);
        // Count from totals
        const allCorrections = allRes.data.data;
        const pendingCount = pendingRes.data.data.total;
        setStats({
          pending: pendingCount,
          approved: allCorrections.total - pendingCount, // approximate
          totalEmployees: attendanceRes.data.data.total,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loader"><div className="loader-spinner" /></div>;

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <h1>HR Dashboard</h1>
        <p>Overview of attendance and correction requests</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card--warning">
          <div className="stat-card__label">Pending Requests</div>
          <div className="stat-card__value">{stats.pending}</div>
          <div className="stat-card__sub">Awaiting your review</div>
        </div>
        <div className="stat-card stat-card--success">
          <div className="stat-card__label">Total Processed</div>
          <div className="stat-card__value">{stats.approved}</div>
          <div className="stat-card__sub">Approved & Rejected</div>
        </div>
        <div className="stat-card stat-card--info">
          <div className="stat-card__label">Attendance Records</div>
          <div className="stat-card__value">{stats.totalEmployees}</div>
          <div className="stat-card__sub">All time</div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '8px' }}>Quick Actions</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.875rem' }}>
          Use the sidebar to navigate to review correction requests or view attendance records.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <a href="/hr/corrections" className="btn btn-primary">Review Requests</a>
          <a href="/hr/attendance" className="btn btn-ghost">View Attendance</a>
        </div>
      </div>
    </div>
  );
}
