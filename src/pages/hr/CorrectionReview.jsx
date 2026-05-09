import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatDate, formatDateTime } from '../../utils/helpers';
import { CORRECTION_TYPES, STATUS_COLORS } from '../../utils/constants';
import toast from 'react-hot-toast';
import { MdCheckCircle } from 'react-icons/md';

export default function HRCorrectionReview() {
  const [data, setData] = useState({ requests: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'approved', remarks: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCorrections = async (status = filter, pg = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/hr/corrections?status=${status}&page=${pg}&limit=15`);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCorrections(); }, [filter]);

  const handleReview = async () => {
    setSubmitting(true);
    try {
      await api.put(`/hr/corrections/${reviewModal.id}`, reviewForm);
      toast.success(`Request ${reviewForm.status}!`);
      setReviewModal(null);
      setReviewForm({ status: 'approved', remarks: '' });
      fetchCorrections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <h1>Correction Requests</h1>
        <p>Review and manage employee correction requests</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['pending', 'approved', 'rejected'].map((s) => (
          <button key={s} className={`btn ${filter === s ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setFilter(s)} style={{ textTransform: 'capitalize' }}>
            {s}
          </button>
        ))}
        <button className={`btn ${filter === '' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
          onClick={() => setFilter('')}>All</button>
      </div>

      {loading ? (
        <div className="loader"><div className="loader-spinner" /></div>
      ) : data.requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon"><MdCheckCircle /></div>
          <div className="empty-state__title">No {filter} requests found</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Type</th>
                <th>Corrected Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.requests.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.employee?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.employee?.employee_id}</div>
                  </td>
                  <td>{formatDate(r.date)}</td>
                  <td>{CORRECTION_TYPES.find(t => t.value === r.type)?.label || r.type}</td>
                  <td>{r.corrected_time}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason}</td>
                  <td><span className={`badge badge-${STATUS_COLORS[r.status]}`}>{r.status}</span></td>
                  <td>
                    {r.status === 'pending' ? (
                      <button className="btn btn-primary btn-sm" onClick={() => { setReviewModal(r); setReviewForm({ status: 'approved', remarks: '' }); }}>
                        Review
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {r.reviewer?.name || '—'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Review Correction Request</h3>
              <button className="modal-close" onClick={() => setReviewModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Employee:</span><br /><strong>{reviewModal.employee?.name}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Date:</span><br /><strong>{formatDate(reviewModal.date)}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Type:</span><br /><strong>{CORRECTION_TYPES.find(t => t.value === reviewModal.type)?.label}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Corrected Time:</span><br /><strong>{reviewModal.corrected_time}</strong></div>
              </div>
              <div style={{ fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Reason:</span>
                <p style={{ marginTop: '4px', color: 'var(--text-primary)' }}>{reviewModal.reason}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Decision</label>
                <select className="form-select" value={reviewForm.status}
                  onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Remarks (optional)</label>
                <textarea className="form-textarea" value={reviewForm.remarks} rows={3}
                  placeholder="Add any remarks..."
                  onChange={(e) => setReviewForm({ ...reviewForm, remarks: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setReviewModal(null)}>Cancel</button>
              <button className={`btn ${reviewForm.status === 'approved' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleReview} disabled={submitting}>
                {submitting ? 'Processing...' : reviewForm.status === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
