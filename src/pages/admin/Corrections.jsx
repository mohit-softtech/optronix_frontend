import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatDate } from '../../utils/helpers';
import { CORRECTION_TYPES, STATUS_COLORS } from '../../utils/constants';

import toast from 'react-hot-toast';

export default function AdminCorrections() {
  const [data, setData] = useState({ requests: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetch = async (pg = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/corrections?page=${pg}&limit=20`);
      setData(res.data.data);
      setPage(pg);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request permanently?')) return;
    try {
      await api.delete(`/admin/corrections/${id}`);
      toast.success('Request deleted successfully');
      fetch(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete request');
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <h1>All Correction Requests</h1>
        <p>Complete visibility into correction requests</p>
      </div>
      {loading ? <div className="loader"><div className="loader-spinner" /></div> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Employee</th><th>Date</th><th>Type</th><th>Corrected Time</th><th>Status</th><th>Reviewer</th><th>Remarks</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {data.requests.map((r) => (
                <tr key={r.id}>
                  <td><div style={{ fontWeight: 600 }}>{r.employee?.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.employee?.employee_id}</div></td>
                  <td>{formatDate(r.date)}</td>
                  <td>{CORRECTION_TYPES.find(t => t.value === r.type)?.label || r.type}</td>
                  <td>{r.corrected_time}</td>
                  <td><span className={`badge badge-${STATUS_COLORS[r.status]}`}>{r.status}</span></td>
                  <td>{r.reviewer?.name || '—'}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.remarks || '—'}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
