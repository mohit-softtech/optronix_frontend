import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { formatDate, formatTime, formatHours } from '../../utils/helpers';
import { STATUS_COLORS } from '../../utils/constants';
import {
  MdHistory,
  MdFilterList,
  MdClose,
  MdFileDownload,
  MdCalendarToday,
  MdCheckCircle,
  MdAccessTime,
  MdTrendingUp,
  MdWarning,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdRefresh,
  MdSearch,
} from 'react-icons/md';
import './History.css';

// ─── Quick month presets ───────────────────────────────────
function getMonthRange(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset, 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, d.getMonth() + 1, 0).getDate();
  return {
    start: `${year}-${month}-01`,
    end: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
    label: d.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
  };
}

const MONTH_PRESETS = [
  { label: 'This Month', ...getMonthRange(0) },
  { label: 'Last Month', ...getMonthRange(-1) },
  { label: '2 Months Ago', ...getMonthRange(-2) },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'present', label: 'Present' },
  { value: 'half-day', label: 'Half Day' },
  { value: 'absent', label: 'Absent' },
];

const PUNCTUALITY_OPTIONS = [
  { value: 'all', label: 'All Punctuality' },
  { value: 'on_time', label: 'On Time' },
  { value: 'late', label: 'Late' },
];

// ─── CSV Export helper ─────────────────────────────────────
function exportToCSV(records) {
  const headers = ['Date', 'Clock In', 'Clock Out', 'Total Hours', 'Status', 'Punctuality', 'Source'];
  const rows = records.map((r) => [
    formatDate(r.date),
    formatTime(r.clock_in),
    formatTime(r.clock_out),
    formatHours(r.total_hours),
    r.status,
    r.clock_in ? (r.is_late ? 'Late' : 'On Time') : '—',
    r.source,
  ]);
  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance_history_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function EmployeeHistory() {
  // ── State ──────────────────────────────────────────────
  const [data, setData] = useState({ records: [], total: 0, page: 1, totalPages: 1 });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('all');
  const [punctuality, setPunctuality] = useState('all');
  const [activePreset, setActivePreset] = useState(null);

  // Current summary month
  const now = new Date();
  const [summaryYear, setSummaryYear] = useState(now.getFullYear());
  const [summaryMonth, setSummaryMonth] = useState(now.getMonth() + 1);

  // ── Fetch History ───────────────────────────────────────
  const fetchHistory = useCallback(async (pg = 1, overrides = {}) => {
    setLoading(true);
    try {
      const sd = overrides.startDate !== undefined ? overrides.startDate : startDate;
      const ed = overrides.endDate !== undefined ? overrides.endDate : endDate;
      const st = overrides.status !== undefined ? overrides.status : status;
      const pt = overrides.punctuality !== undefined ? overrides.punctuality : punctuality;

      const params = new URLSearchParams({ page: pg, limit: 15 });
      if (sd) params.set('start_date', sd);
      if (ed) params.set('end_date', ed);
      if (st && st !== 'all') params.set('status', st);
      if (pt && pt !== 'all') params.set('punctuality', pt);

      const res = await api.get(`/attendance/history?${params.toString()}`);
      setData(res.data.data);
      setPage(pg);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, status, punctuality]);

  // ── Fetch Monthly Summary ───────────────────────────────
  const fetchSummary = useCallback(async (yr, mo) => {
    setSummaryLoading(true);
    try {
      const res = await api.get(
        `/attendance/summary?year=${yr}&month=${String(mo).padStart(2, '0')}`
      );
      setSummary(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(1);
    fetchSummary(summaryYear, summaryMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Filter handlers ─────────────────────────────────────
  const handleFilter = (e) => {
    e.preventDefault();
    setActivePreset(null);
    fetchHistory(1);
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setStatus('all');
    setPunctuality('all');
    setActivePreset(null);
    fetchHistory(1, { startDate: '', endDate: '', status: 'all', punctuality: 'all' });
  };

  const handlePreset = (preset, idx) => {
    setStartDate(preset.start);
    setEndDate(preset.end);
    setActivePreset(idx);
    fetchHistory(1, { startDate: preset.start, endDate: preset.end, status, punctuality });
  };

  const handleStatusChange = (val) => {
    setStatus(val);
    fetchHistory(1, { status: val });
  };

  const handlePunctualityChange = (val) => {
    setPunctuality(val);
    fetchHistory(1, { punctuality: val });
  };

  // ── Summary month navigation ────────────────────────────
  const shiftSummaryMonth = (delta) => {
    let mo = summaryMonth + delta;
    let yr = summaryYear;
    if (mo > 12) { mo = 1; yr += 1; }
    if (mo < 1) { mo = 12; yr -= 1; }
    setSummaryMonth(mo);
    setSummaryYear(yr);
    fetchSummary(yr, mo);
  };

  const isFiltered = startDate || endDate || status !== 'all' || punctuality !== 'all';

  const summaryMonthLabel = new Date(summaryYear, summaryMonth - 1, 1)
    .toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  // ── Render ──────────────────────────────────────────────
  return (
    <div className="animate-slide-up emp-history">

      {/* ── Page Header ── */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MdHistory style={{ color: 'var(--accent-primary)' }} />
              Attendance History
            </h1>
            <p>Track, filter and export your complete attendance records</p>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { fetchHistory(page); fetchSummary(summaryYear, summaryMonth); }}
            title="Refresh"
          >
            <MdRefresh size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Monthly Summary Cards ── */}
      <div className="hist-summary-header">
        <button className="hist-month-nav" onClick={() => shiftSummaryMonth(-1)} title="Previous month">
          <MdKeyboardArrowLeft size={20} />
        </button>
        <span className="hist-month-label">{summaryMonthLabel}</span>
        <button className="hist-month-nav" onClick={() => shiftSummaryMonth(1)} title="Next month">
          <MdKeyboardArrowRight size={20} />
        </button>
      </div>

      {summaryLoading ? (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="hist-stat-skeleton" />
          ))}
        </div>
      ) : summary && (
        <div className="hist-stats-grid">
          <div className="hist-stat-card hist-stat-primary">
            <div className="hist-stat-icon"><MdCalendarToday /></div>
            <div className="hist-stat-body">
              <div className="hist-stat-value">{summary.total}</div>
              <div className="hist-stat-label">Total Days</div>
            </div>
          </div>
          <div className="hist-stat-card hist-stat-success">
            <div className="hist-stat-icon"><MdCheckCircle /></div>
            <div className="hist-stat-body">
              <div className="hist-stat-value">{summary.present}</div>
              <div className="hist-stat-label">Present</div>
            </div>
          </div>
          <div className="hist-stat-card hist-stat-warning">
            <div className="hist-stat-icon"><MdAccessTime /></div>
            <div className="hist-stat-body">
              <div className="hist-stat-value">{summary.halfDay}</div>
              <div className="hist-stat-label">Half Days</div>
            </div>
          </div>
          <div className="hist-stat-card hist-stat-danger">
            <div className="hist-stat-icon"><MdWarning /></div>
            <div className="hist-stat-body">
              <div className="hist-stat-value">{summary.absent}</div>
              <div className="hist-stat-label">Absent</div>
            </div>
          </div>
          <div className="hist-stat-card hist-stat-info">
            <div className="hist-stat-icon"><MdTrendingUp /></div>
            <div className="hist-stat-body">
              <div className="hist-stat-value">{summary.totalHours}h</div>
              <div className="hist-stat-label">Total Hours</div>
            </div>
          </div>
          <div className="hist-stat-card hist-stat-late">
            <div className="hist-stat-icon" style={{ fontSize: '1.25rem' }}>⏰</div>
            <div className="hist-stat-body">
              <div className="hist-stat-value" style={{ color: 'var(--accent-danger)' }}>{summary.late}</div>
              <div className="hist-stat-label">Late Arrivals</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Filters Panel ── */}
      <form onSubmit={handleFilter}>
        <div className="hist-filter-panel glass-card">
          {/* Row 1: Quick presets */}
          <div className="hist-filter-row hist-filter-presets">
            <span className="hist-filter-label"><MdFilterList size={16} /> Quick Select</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {MONTH_PRESETS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className={`hist-preset-btn ${activePreset === i ? 'active' : ''}`}
                  onClick={() => handlePreset(p, i)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="hist-filter-divider" />

          {/* Row 2: Date range + Status + Punctuality */}
          <div className="hist-filter-row hist-filter-controls">
            <div className="form-group" style={{ flex: 1, minWidth: '140px', margin: 0 }}>
              <label className="form-label">From Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setActivePreset(null); }}
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '140px', margin: 0 }}>
              <label className="form-label">To Date</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setActivePreset(null); }}
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '140px', margin: 0 }}>
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '140px', margin: 0 }}>
              <label className="form-label">Punctuality</label>
              <select
                className="form-select"
                value={punctuality}
                onChange={(e) => handlePunctualityChange(e.target.value)}
              >
                {PUNCTUALITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', paddingBottom: '1px' }}>
              <button type="submit" className="btn btn-primary btn-sm">
                <MdSearch size={15} /> Apply
              </button>
              {isFiltered && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleClearFilter}>
                  <MdClose size={14} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Active filter summary */}
          {isFiltered && (
            <div className="hist-active-filters">
              {startDate && <span className="hist-filter-tag">From: {formatDate(startDate)}</span>}
              {endDate && <span className="hist-filter-tag">To: {formatDate(endDate)}</span>}
              {status !== 'all' && (
                <span className="hist-filter-tag">{STATUS_OPTIONS.find((o) => o.value === status)?.label}</span>
              )}
              {punctuality !== 'all' && (
                <span className="hist-filter-tag">{PUNCTUALITY_OPTIONS.find((o) => o.value === punctuality)?.label}</span>
              )}
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '4px' }}>
                — {data.total} record{data.total !== 1 ? 's' : ''} found
              </span>
            </div>
          )}
        </div>
      </form>

      {/* ── Results / Table ── */}
      {loading ? (
        <div className="loader"><div className="loader-spinner" /></div>
      ) : data.records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon"><MdHistory /></div>
          <div className="empty-state__title">
            {isFiltered ? 'No records match your filters' : 'No attendance records yet'}
          </div>
          {isFiltered && (
            <button className="btn btn-ghost btn-sm" style={{ marginTop: '12px' }} onClick={handleClearFilter}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Table Header row (count + export) */}
          <div className="hist-table-header">
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{data.records.length}</strong> of{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{data.total}</strong> records
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => exportToCSV(data.records)}
              title="Export current page to CSV"
            >
              <MdFileDownload size={16} /> Export CSV
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                  <th>Punctuality</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((r, idx) => (
                  <tr key={r.id} className="hist-table-row">
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      {(page - 1) * 15 + idx + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{formatDate(r.date)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' })}
                      </div>
                    </td>
                    <td>
                      <span style={{ color: r.clock_in ? 'var(--accent-success)' : 'var(--text-muted)' }}>
                        {formatTime(r.clock_in)}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: r.clock_out ? 'var(--accent-info)' : 'var(--text-muted)' }}>
                        {formatTime(r.clock_out)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{formatHours(r.total_hours)}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${STATUS_COLORS[r.status] || 'neutral'}`}>
                        {r.status === 'half-day' ? 'Half Day' : r.status}
                      </span>
                    </td>
                    <td>
                      {r.clock_in ? (
                        <span className={`badge badge-${r.is_late ? 'danger' : 'success'}`}>
                          {r.is_late ? '⏰ Late' : '✓ On Time'}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                        {r.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={page <= 1}
                onClick={() => fetchHistory(page - 1)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <MdKeyboardArrowLeft size={16} /> Prev
              </button>
              {Array.from({ length: data.totalPages }, (_, i) => {
                // Show: first, last, current ±1, and ellipses
                const p = i + 1;
                const show =
                  p === 1 ||
                  p === data.totalPages ||
                  (p >= page - 1 && p <= page + 1);
                if (!show) {
                  // Show ellipsis only once
                  if (p === 2 && page > 3) return <span key={p} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>;
                  if (p === data.totalPages - 1 && page < data.totalPages - 2) return <span key={p} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>;
                  return null;
                }
                return (
                  <button
                    key={p}
                    className={page === p ? 'active' : ''}
                    onClick={() => fetchHistory(p)}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={page >= data.totalPages}
                onClick={() => fetchHistory(page + 1)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Next <MdKeyboardArrowRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
