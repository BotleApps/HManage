export interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
  active: boolean;
  created_at: string;
}

export interface Shift {
  id: string;
  staff_id: string;
  shift_date: string;
  shift_type: 'morning' | 'afternoon' | 'night';
  created_at: string;
  staff?: Staff;
}

export interface Attendance {
  id: string;
  shift_id: string;
  check_in: string | null;
  check_out: string | null;
  status: 'pending' | 'present' | 'absent' | 'late';
  created_at: string;
  shift?: Shift;
}