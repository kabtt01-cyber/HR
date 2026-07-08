/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Department {
  id: string;
  name: string;
  code: string;
  manager_id: string | null; // ID of the manager
  description: string;
  parent_id: string | null; // For hierarchical structure (Tree View)
}

export interface Position {
  id: string;
  title: string;
  department_id: string;
  base_salary: number;
}

export type EmployeeStatus = 'Active' | 'Leave' | 'Suspended' | 'Resigned' | 'Terminated' | 'Inactive';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female';
  national_id: string;
  department_id: string;
  position_id: string;
  status: EmployeeStatus;
  join_date: string;
  termination_date?: string;
  termination_reason?: string;
  manager_id: string | null;
  basic_salary: number;
  allowances: number;
  role_id: string;
  created_at: string;
  
  // New Master File fields
  employee_no?: string; // Auto-generated
  personal_photo?: string; // Personal photo url
  social_security_no?: string; // Social Security / insurance number
  fingerprint_no?: string; // Fingerprint number (optional)
  emergency_phone?: string; // Emergency phone
  address?: string; // Full address
  address_province?: string; // Governorate / Province
  address_city?: string; // City
  birth_date?: string; // Date of birth
  marital_status?: 'Single' | 'Married' | 'Divorced' | 'Widowed'; // Marital status
  children_count?: number; // Number of children
  nationality?: string; // Nationality
  qualification?: string; // Educational qualification
  specialization?: string; // Specialization
  previous_experience?: string; // Previous experience details
  contract_end_date?: string; // Contract end date
  contract_type?: 'Permanent' | 'Fixed-term' | 'Temporary'; // Contract type
  section?: string; // Section / division
  shift_id?: string; // Shift ID or name
  workplace?: string; // Workplace location
  incentives?: number; // Incentives amount
  deductions?: number; // Deductions amount
  insurance_amount?: number; // Social insurance amount
  bank_account?: string; // Bank account or payment method
  suspension_reason?: string; // Reason for suspension
  end_of_service_date?: string; // End of service date
  end_of_service_reason?: string; // End of service reason

  // Custom records for progression and transfer history
  career_progression?: CareerProgressionRecord[];
  transfer_history?: TransferHistoryRecord[];
}

export interface CareerProgressionRecord {
  id: string;
  employee_id: string;
  date: string;
  type: 'Promotion' | 'Demotion' | 'Salary Change' | 'Contract Renewal';
  old_title: string;
  new_title: string;
  old_salary: number;
  new_salary: number;
  notes: string;
}

export interface TransferHistoryRecord {
  id: string;
  employee_id: string;
  date: string;
  old_department_id: string;
  new_department_id: string;
  old_position_id: string;
  new_position_id: string;
  reason: string;
  approved_by: string;
}

export interface EmployeeFile {
  id: string;
  employee_id: string;
  file_name: string;
  file_type: string;
  file_size: string;
  file_url: string;
  uploaded_at: string;
}

export interface Contract {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  contract_type: 'Permanent' | 'Fixed-term' | 'Temporary';
  status: 'Active' | 'Expired' | 'Terminated';
  document_url?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role_id: string;
  status: 'Active' | 'Inactive';
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  name_ar: string;
  description: string;
}

export interface Permission {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  category: string;
}

export interface UserRole {
  user_id: string;
  role_id: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: 'Annual' | 'Sick' | 'Unpaid' | 'Maternity' | 'Emergency';
  start_date: string;
  end_date: string;
  days_count: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
  approved_by: string | null;
  approved_at: string | null;
}

export interface OvertimeRequest {
  id: string;
  employee_id: string;
  date: string;
  hours: number;
  multiplier: number; // e.g., 1.5, 2.0
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
  approved_by: string | null;
}

export interface SalaryComplaint {
  id: string;
  employee_id: string;
  payroll_id: string;
  complaint_text: string;
  status: 'Pending' | 'Resolved' | 'Rejected';
  resolution_text?: string;
  created_at: string;
}

export interface LoanRequest {
  id: string;
  employee_id: string;
  amount: number;
  installments: number; // number of monthly deductions
  remaining_amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  purpose: string;
  approved_by: string | null;
  created_at: string;
}

export interface Penalty {
  id: string;
  employee_id: string;
  type: string; // e.g., 'Delay', 'Negligence', 'Safety Violation'
  amount: number;
  reason: string;
  date: string;
  approved_by: string;
}

export interface Bonus {
  id: string;
  employee_id: string;
  type: string; // e.g., 'Performance', 'Holiday', 'Exceptional Effort'
  amount: number;
  reason: string;
  date: string;
  approved_by: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: 'On Time' | 'Late' | 'Absent' | 'Leave' | 'Excused';
  delay_minutes: number;
}

export interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  days_of_week: string[]; // e.g., ['Saturday', 'Sunday', ...]
}

export interface Notification {
  id: string;
  user_id: string; // To whom
  title: string;
  message: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'danger';
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  target_departments: string[]; // ['all'] or list of department IDs
}

export interface Complaint {
  id: string;
  employee_id: string | null; // null if anonymous
  title: string;
  content: string;
  is_anonymous: boolean;
  status: 'Pending' | 'Investigating' | 'Resolved';
  created_at: string;
}

export interface Suggestion {
  id: string;
  employee_id: string | null; // null if anonymous
  title: string;
  content: string;
  is_anonymous: boolean;
  status: 'Pending' | 'Reviewed' | 'Implemented' | 'Rejected';
  created_at: string;
}

export interface Resignation {
  id: string;
  employee_id: string;
  request_date: string;
  desired_last_day: string;
  actual_last_day?: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  clearance_completed: boolean;
  comments?: string;
}

export interface Payroll {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  basic_salary: number;
  allowances: number;
  overtime_pay: number;
  bonus_pay: number;
  loan_deductions: number;
  penalty_deductions: number;
  tax_deductions: number;
  net_salary: number;
  status: 'Draft' | 'Approved' | 'Paid';
  paid_at?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string; // e.g., 'CREATE_EMPLOYEE', 'TRANSFER_EMPLOYEE', 'APPROVE_LEAVE'
  module: string; // e.g., 'Employees', 'Departments', 'Payroll'
  table_name: string;
  record_id: string;
  old_values?: string;
  new_values?: string;
  ip_address: string;
  created_at: string;
}

export interface SystemSettings {
  factory_name: string;
  factory_branch: string;
  primary_color: string;
  accent_color: string;
  logo_url: string;
  weekend_days: string[];
  overtime_rate_day: number;
  overtime_rate_night: number;
}

export interface PerformanceReview {
  id: string;
  employee_id: string;
  review_date: string;
  reviewer_name: string;
  score: number; // e.g. 1 to 5
  feedback: string;
  recommendations: string;
}

export interface LoginLog {
  id: string;
  employee_id: string;
  username: string;
  login_time: string;
  ip_address: string;
  status: 'Success' | 'Failed';
  device_info: string;
}
