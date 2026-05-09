export const ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  EMPLOYEE: 'employee',
};

export const CORRECTION_TYPES = [
  { value: 'missed_in', label: 'Missed Clock-In' },
  { value: 'missed_out', label: 'Missed Clock-Out' },
  { value: 'wrong_in', label: 'Wrong Clock-In Time' },
  { value: 'wrong_out', label: 'Wrong Clock-Out Time' },
];

export const STATUS_COLORS = {
  present: 'success',
  'half-day': 'warning',
  absent: 'danger',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};
