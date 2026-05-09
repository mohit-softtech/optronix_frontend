import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatDate, formatTime, formatHours } from '../../utils/helpers';
import { STATUS_COLORS } from '../../utils/constants';

export default function AdminAttendanceView() {
  const [data, setData] = useState({ records: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetch = async (pg = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/attendance?page=${pg}&limit=20`);
      setData(res.data.data);
      setPage(pg);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <h1>All Attendance Records</h1>
        <p>Complete visibility into employee attendance</p>
      </div>
      {loading ? <div className="loader"><div className="loader-spinner" /></div> : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr><th>Employee</th><th>Dept</th><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Status</th><th>Punctuality</th><th>Source</th></tr>
              </thead>
              <tbody>
                {data.records.map((r) => (
                  <tr key={r.id}>
                    <td><div style={{ fontWeight: 600 }}>{r.user?.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.user?.employee_id}</div></td>
                    <td>{r.user?.department}</td>
                    <td>{formatDate(r.date)}</td>
                    <td>{formatTime(r.clock_in)}</td>
                    <td>{formatTime(r.clock_out)}</td>
                    <td>{formatHours(r.total_hours)}</td>
                    <td><span className={`badge badge-${STATUS_COLORS[r.status]}`}>{r.status}</span></td>
                    <td>
                      {r.clock_in ? (
                        <span className={`badge badge-${r.is_late ? 'danger' : 'success'}`}>
                          {r.is_late ? 'Late' : 'On Time'}
                        </span>
                      ) : '—'}
                    </td>
                    <td><span className="badge badge-neutral">{r.source}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => fetch(page - 1)}>Prev</button>
              {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => (
                <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => fetch(i + 1)}>{i + 1}</button>
              ))}
              <button disabled={page >= data.totalPages} onClick={() => fetch(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
