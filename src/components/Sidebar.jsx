import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';
import { MdDashboard, MdHistory, MdEdit, MdCheckCircle, MdPeople, MdSettings, MdHistoryEdu, MdLogout, MdTimer } from 'react-icons/md';
import './Sidebar.css';

const menuItems = {
  [ROLES.EMPLOYEE]: [
    { path: '/employee', icon: <MdDashboard />, label: 'Dashboard' },
    { path: '/employee/history', icon: <MdHistory />, label: 'History' },
    { path: '/employee/corrections', icon: <MdEdit />, label: 'Corrections' },
  ],
  [ROLES.HR]: [
    { path: '/hr', icon: <MdDashboard />, label: 'Dashboard' },
    { path: '/hr/corrections', icon: <MdCheckCircle />, label: 'Review Requests' },
    { path: '/hr/attendance', icon: <MdHistory />, label: 'Attendance' },
  ],
  [ROLES.ADMIN]: [
    { path: '/admin', icon: <MdDashboard />, label: 'Dashboard' },
    { path: '/admin/users', icon: <MdPeople />, label: 'Users' },
    { path: '/admin/attendance', icon: <MdHistory />, label: 'Attendance' },
    { path: '/admin/corrections', icon: <MdEdit />, label: 'Corrections' },
    { path: '/admin/rules', icon: <MdSettings />, label: 'Rules' },
    { path: '/admin/audit-logs', icon: <MdHistoryEdu />, label: 'Audit Logs' },
  ],
};

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const items = menuItems[role] || [];

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__logo"><MdTimer /></div>
        <div>
          <div className="sidebar__title">AttendX</div>
          <div className="sidebar__subtitle">Management</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        <div className="sidebar__nav-label">Menu</div>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === `/${role}`}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <span className="sidebar__link-icon">{item.icon}</span>
            <span className="sidebar__link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{user?.name}</div>
            <div className="sidebar__user-role">{role}</div>
          </div>
        </div>
        <button onClick={logout} className="sidebar__logout" title="Logout">
          <MdLogout />
        </button>
      </div>
    </aside>
  );
}
