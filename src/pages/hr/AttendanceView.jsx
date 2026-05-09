import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatDate, formatTime, formatHours } from '../../utils/helpers';
import { STATUS_COLORS } from '../../utils/constants';

export default function HRAttendanceView() {
  const [data, setData] = useState({ records: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchAttendance = async (pg = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/hr/attendance?page=${pg}&limit=20`);
      setData(res.data.data);
      setPage(pg);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <h1>Employee Attendance</h1>
        <p>View all employees' attendance records</p>
      </div>

      {loading ? (
        <div className="loader"><div className="loader-spinner" /></div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Dept</th>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Punctuality</th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.user?.employee_id}</div>
                    </td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => fetchAttendance(page - 1)}>Previous</button>
              {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => (
                <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => fetchAttendance(i + 1)}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page >= data.totalPages} onClick={() => fetchAttendance(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
