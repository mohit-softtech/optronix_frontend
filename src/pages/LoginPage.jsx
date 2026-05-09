import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MdTimer, MdSecurity, MdWork, MdPerson } from 'react-icons/md';
import './LoginPage.css';

export default function LoginPage() {
  const { login, isAuthenticated, role, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="loader" style={{ height: '100vh' }}><div className="loader-spinner" /></div>;
  if (isAuthenticated) return <Navigate to={`/${role}`} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome, ${user.name}!`);
      navigate(`/${user.role.name}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const quickLogin = (em, pw) => {
    setEmail(em);
    setPassword(pw);
  };

  return (
    <div className="login-page">
      <div className="login-card glass">
        <div className="login-header">
          <div className="login-logo"><MdTimer /></div>
          <h1>AttendX</h1>
          <p>Attendance Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-quick">
          <p className="login-quick__title">Quick Login</p>
          <div className="login-quick__buttons">
            <button className="login-quick__btn" onClick={() => quickLogin('admin@optronix.com', 'Admin@123')}>
              <span className="login-quick__icon"><MdSecurity /></span> Admin
            </button>
            <button className="login-quick__btn" onClick={() => quickLogin('hr@optronix.com', 'Hr@123')}>
              <span className="login-quick__icon"><MdWork /></span> HR
            </button>
            <button className="login-quick__btn" onClick={() => quickLogin('emp1@optronix.com', 'Emp@123')}>
              <span className="login-quick__icon"><MdPerson /></span> Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
