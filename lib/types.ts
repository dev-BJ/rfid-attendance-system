// System Device Type
export interface SystemDevice {
  id: string;
  device_name: string;
  device_id: string; // Unique device identifier
  location: string;
  status: 'active' | 'inactive';
  created_at: Date;
  last_heartbeat: Date;
}

// Student Card ID Type
export interface StudentCard {
  id: string;
  student_id: string;
  rfid_code: string; // The RFID tag/card code
  card_status: 'active' | 'inactive' | 'lost';
  created_at: Date;
  updated_at: Date;
}

// Student Attendance Type
export interface Attendance {
  id: string;
  device_id: string;
  student_id: string;
  rfid_code: string;
  check_in_time: Date;
  check_out_time?: Date;
  date: string; // YYYY-MM-DD format
  duration_minutes?: number;
}

// API Request/Response Types
export interface CheckIdRequest {
  device_id: string;
  card_id: string;
}

export interface CheckIdResponse {
  success: boolean;
  student_id?: string;
  message: string;
  is_duplicate?: boolean;
  duplicate_within_minutes?: number;
}

export interface SaveAttendanceRequest {
  device_id: string;
  student_id: string;
  rfid_code: string;
  check_in_time: string; // ISO string
}

export interface SaveAttendanceResponse {
  success: boolean;
  attendance_id?: string;
  message: string;
}

export interface AttendanceFilterParams {
  device_id?: string;
  student_id?: string;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  page?: number;
  limit?: number;
}

export interface AttendanceReport {
  student_id: string;
  total_sessions: number;
  total_duration_minutes: number;
  average_duration_minutes: number;
  first_attendance: Date;
  last_attendance: Date;
}
