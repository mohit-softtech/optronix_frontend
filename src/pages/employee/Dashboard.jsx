import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatTime, formatHours } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { MdCheckCircle } from 'react-icons/md';
import './Dashboard.css';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const res = await api.get('/attendance/today');
      setTodayStatus(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTodayStatus(); }, []);

  const handleClockIn = async () => {
    setClockLoading(true);
    try {
      await api.post('/attendance/clock-in');
      toast.success('Clocked in successfully! 🎉');
      fetchTodayStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Clock-in failed');
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    try {
      await api.post('/attendance/clock-out');
      toast.success('Clocked out successfully! 👋');
      fetchTodayStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Clock-out failed');
    } finally {
      setClockLoading(false);
    }
  };

  const hasClockedIn = todayStatus?.clock_in && !todayStatus?.status?.includes('not_clocked');
  const hasClockedOut = todayStatus?.clock_out;

  if (loading) return <div className="loader"><div className="loader-spinner" /></div>;

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <h1>Employee Dashboard</h1>
        <p>Welcome back, {user?.name}. Here's your attendance overview.</p>
      </div>

      {/* Clock Widget */}
      <div className="clock-widget glass-card">
        <div className="clock-widget__time">
          {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
        </div>
        <div className="clock-widget__date">
          {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>

        <div className="clock-widget__actions">
          {!hasClockedIn ? (
            <button className="clock-btn clock-btn--in" onClick={handleClockIn} disabled={clockLoading}>
              <span className="clock-btn__ring" />
              <span className="clock-btn__text">{clockLoading ? 'Clocking In...' : 'Clock In'}</span>
            </button>
          ) : !hasClockedOut ? (
            <button className="clock-btn clock-btn--out" onClick={handleClockOut} disabled={clockLoading}>
              <span className="clock-btn__ring" />
              <span className="clock-btn__text">{clockLoading ? 'Clocking Out...' : 'Clock Out'}</span>
            </button>
          ) : (
            <div className="clock-widget__done">
              <span style={{ fontSize: '3rem', color: '#22c55e', display: 'flex' }}><MdCheckCircle /></span>
              <p>You're done for today!</p>
            </div>
          )}
        </div>
      </div>

      {/* Today's Status Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card--primary">
          <div className="stat-card__label">Clock In</div>
          <div className="stat-card__value">{hasClockedIn ? formatTime(todayStatus.clock_in) : '—'}</div>
        </div>
        <div className="stat-card stat-card--info">
          <div className="stat-card__label">Clock Out</div>
          <div className="stat-card__value">{hasClockedOut ? formatTime(todayStatus.clock_out) : '—'}</div>
        </div>
        <div className="stat-card stat-card--success">
          <div className="stat-card__label">Total Hours</div>
          <div className="stat-card__value">{hasClockedOut ? formatHours(todayStatus.total_hours) : '—'}</div>
        </div>
        <div className="stat-card stat-card--warning">
          <div className="stat-card__label">Status</div>
          <div className="stat-card__value" style={{ textTransform: 'capitalize' }}>
            {hasClockedIn ? todayStatus.status : 'Not Clocked In'}
          </div>
        </div>
      </div>
    </div>
  );
}
