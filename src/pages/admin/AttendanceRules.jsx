import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminAttendanceRules() {
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await api.get('/admin/rules');
        setRules(res.data.data);
        setForm(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchRules();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        default_shift_start: form.default_shift_start,
        default_shift_end: form.default_shift_end,
        grace_period_minutes: parseInt(form.grace_period_minutes),
        min_hours_full_day: parseInt(form.min_hours_full_day),
        min_hours_half_day: parseInt(form.min_hours_half_day),
        auto_absent_enabled: form.auto_absent_enabled,
        auto_absent_cutoff: form.auto_absent_cutoff,
      };
      const res = await api.put('/admin/rules', data);
      setRules(res.data.data);
      toast.success('Attendance rules updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="loader"><div className="loader-spinner" /></div>;

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <h1>Attendance Rules</h1>
        <p>Configure global attendance settings</p>
      </div>

      <div className="glass-card" style={{ padding: '32px', maxWidth: '640px' }}>
        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Shift Start Time</label>
            <input type="time" step="1" className="form-input" value={form.default_shift_start || ''}
              onChange={(e) => setForm({ ...form, default_shift_start: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Shift End Time</label>
            <input type="time" step="1" className="form-input" value={form.default_shift_end || ''}
              onChange={(e) => setForm({ ...form, default_shift_end: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Grace Period (minutes)</label>
            <input type="number" className="form-input" value={form.grace_period_minutes || ''}
              onChange={(e) => setForm({ ...form, grace_period_minutes: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Min Hours Full Day</label>
            <input type="number" className="form-input" value={form.min_hours_full_day || ''}
              onChange={(e) => setForm({ ...form, min_hours_full_day: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Min Hours Half Day</label>
            <input type="number" className="form-input" value={form.min_hours_half_day || ''}
              onChange={(e) => setForm({ ...form, min_hours_half_day: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Auto Absent Cutoff</label>
            <input type="time" step="1" className="form-input" value={form.auto_absent_cutoff || ''}
              onChange={(e) => setForm({ ...form, auto_absent_cutoff: e.target.value })} />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.auto_absent_enabled || false}
                onChange={(e) => setForm({ ...form, auto_absent_enabled: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }} />
              <span className="form-label" style={{ marginBottom: 0 }}>Enable Auto-Absent Marking</span>
            </label>
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Rules'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
