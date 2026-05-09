import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatDate, formatDateTime } from '../../utils/helpers';
import { CORRECTION_TYPES, STATUS_COLORS } from '../../utils/constants';
import toast from 'react-hot-toast';
import { MdEdit } from 'react-icons/md';

export default function EmployeeCorrections() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ date: '', type: 'missed_in', corrected_time: '', reason: '' });

  const fetchRequests = async () => {
    try {
      const res = await api.get('/corrections');
      setRequests(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/corrections', form);
      toast.success('Correction request submitted!');
      setShowForm(false);
      setForm({ date: '', type: 'missed_in', corrected_time: '', reason: '' });
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await api.delete(`/corrections/${id}`);
      toast.success('Request cancelled successfully');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel request');
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Correction Requests</h1>
          <p>Raise and track your attendance correction requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Close Form' : '+ New Request'}
        </button>
      </div>

      {/* Correction Form */}
      {showForm && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.0625rem', fontWeight: 700 }}>Raise Correction Request</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Correction Type</label>
              <select className="form-select" value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {CORRECTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Corrected Time</label>
              <input type="time" className="form-input" value={form.corrected_time}
                onChange={(e) => setForm({ ...form, corrected_time: e.target.value })} required />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Reason (min 10 characters)</label>
              <textarea className="form-textarea" value={form.reason} rows={3}
                placeholder="Explain why this correction is needed..."
                onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <div className="loader"><div className="loader-spinner" /></div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon"><MdEdit /></div>
          <div className="empty-state__title">No correction requests yet</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Corrected Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Reviewer</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.date)}</td>
                  <td>{CORRECTION_TYPES.find(t => t.value === r.type)?.label || r.type}</td>
                  <td>{r.corrected_time}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason}</td>
                  <td><span className={`badge badge-${STATUS_COLORS[r.status]}`}>{r.status}</span></td>
                  <td>{r.reviewer?.name || '—'}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.remarks || '—'}</td>
                  <td>
                    {r.status === 'pending' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(r.id)}>
                        Cancel
                      </button>
                    )}
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
