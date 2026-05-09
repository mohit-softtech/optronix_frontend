import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatDateTime } from '../../utils/helpers';
import { MdHistoryEdu, MdExpandMore, MdExpandLess } from 'react-icons/md';

// ─── Helpers ─────────────────────────────────────────────────
const ACTION_COLORS = {
  clock_in: 'success', clock_out: 'info', correction_request: 'warning',
  correction_cancel: 'warning', correction_delete: 'danger',
  approve: 'success', reject: 'danger',
  user_create: 'info', user_update: 'warning', user_deactivate: 'danger',
  rule_update: 'info',
};

const ACTION_LABELS = {
  clock_in: 'Clock In', clock_out: 'Clock Out',
  correction_request: 'Correction Raised', correction_cancel: 'Correction Cancelled',
  correction_delete: 'Correction Deleted',
  approve: 'Approved', reject: 'Rejected',
  user_create: 'User Created', user_update: 'User Updated', user_deactivate: 'User Deactivated',
  rule_update: 'Rules Updated',
};

/** Format a single value for display */
function formatValue(val) {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'object') return JSON.stringify(val);
  // Format ISO datetime strings
  if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
    try { return new Date(val).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return val; }
  }
  return String(val);
}

/** Render old → new value diff for a single key */
function DiffRow({ label, oldVal, newVal }) {
  const changed = oldVal !== undefined && String(oldVal) !== String(newVal);
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-start', fontSize: '0.7rem', lineHeight: 1.4 }}>
      <span style={{ color: 'var(--text-muted)', minWidth: '70px', flexShrink: 0, textTransform: 'capitalize' }}>
        {label.replace(/_/g, ' ')}:
      </span>
      {changed ? (
        <span>
          <span style={{ color: 'var(--danger)', textDecoration: 'line-through' }}>{formatValue(oldVal)}</span>
          {' → '}
          <span style={{ color: 'var(--success)' }}>{formatValue(newVal)}</span>
        </span>
      ) : (
        <span style={{ color: 'var(--text-secondary)' }}>{formatValue(newVal)}</span>
      )}
    </div>
  );
}

/** Render the Changes cell — merges old/new values and shows diffs */
function ChangesCell({ log }) {
  const [expanded, setExpanded] = useState(false);

  const newVals = log.new_values || {};
  const oldVals = log.old_values || {};

  // Merge all keys from both old and new
  const allKeys = [...new Set([...Object.keys(newVals), ...Object.keys(oldVals)])];

  // Filter out internal keys that aren't meaningful to display
  const SKIP_KEYS = ['id', 'updatedAt', 'createdAt', 'updated_at', 'created_at', 'password_hash'];
  const visibleKeys = allKeys.filter((k) => !SKIP_KEYS.includes(k));

  if (visibleKeys.length === 0) return <span style={{ color: 'var(--text-muted)' }}>—</span>;

  const previewKeys = visibleKeys.slice(0, 2);
  const extraCount = visibleKeys.length - previewKeys.length;

  return (
    <div style={{ minWidth: '180px', maxWidth: '280px' }}>
      {/* Always show first 2 fields */}
      {(expanded ? visibleKeys : previewKeys).map((key) => (
        <DiffRow key={key} label={key} oldVal={oldVals[key]} newVal={newVals[key]} />
      ))}

      {/* Expand toggle if there are more fields */}
      {extraCount > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--accent-primary)', fontSize: '0.68rem',
            display: 'flex', alignItems: 'center', gap: '2px',
            padding: '2px 0', marginTop: '2px',
          }}
        >
          {expanded
            ? <><MdExpandLess size={12} /> Show less</>
            : <><MdExpandMore size={12} /> +{extraCount} more field{extraCount > 1 ? 's' : ''}</>
          }
        </button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function AdminAuditLogs() {
  const [data, setData] = useState({ logs: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchLogs = async (pg = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/audit-logs?page=${pg}&limit=25`);
      setData(res.data.data);
      setPage(pg);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <p>Complete audit trail of all system actions</p>
      </div>

      {loading ? (
        <div className="loader"><div className="loader-spinner" /></div>
      ) : data.logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon"><MdHistoryEdu /></div>
          <div className="empty-state__title">No audit logs found</div>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th style={{ textAlign: 'center' }}>ID</th>
                  <th>Changes</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{log.user?.name || '—'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.user?.employee_id}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${ACTION_COLORS[log.action] || 'neutral'}`}>
                        {ACTION_LABELS[log.action] || log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize', fontSize: '0.8125rem' }}>{log.entity_type}</td>
                    <td style={{ textAlign: 'center', fontSize: '0.8125rem' }}>{log.entity_id ?? '—'}</td>
                    <td><ChangesCell log={log} /></td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {log.ip_address || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => fetchLogs(page - 1)}>Prev</button>
              {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => (
                <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => fetchLogs(i + 1)}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page >= data.totalPages} onClick={() => fetchLogs(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
