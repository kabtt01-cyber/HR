/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Department,
  Position,
  Employee,
  Contract,
  Role,
  Permission,
  Shift,
  LeaveRequest,
  OvertimeRequest,
  LoanRequest,
  Penalty,
  Bonus,
  Attendance,
  Complaint,
  Suggestion,
  Resignation,
  Payroll,
  AuditLog,
  SystemSettings,
  EmployeeFile,
  PerformanceReview,
  LoginLog
} from './types';

// Unique keys for localStorage
const STORAGE_PREFIX = 'quds_hr_';
const keys = {
  departments: STORAGE_PREFIX + 'departments',
  positions: STORAGE_PREFIX + 'positions',
  employees: STORAGE_PREFIX + 'employees',
  contracts: STORAGE_PREFIX + 'contracts',
  roles: STORAGE_PREFIX + 'roles',
  permissions: STORAGE_PREFIX + 'permissions',
  shifts: STORAGE_PREFIX + 'shifts',
  leaveRequests: STORAGE_PREFIX + 'leave_requests',
  overtimeRequests: STORAGE_PREFIX + 'overtime_requests',
  loanRequests: STORAGE_PREFIX + 'loan_requests',
  penalties: STORAGE_PREFIX + 'penalties',
  bonuses: STORAGE_PREFIX + 'bonuses',
  attendance: STORAGE_PREFIX + 'attendance',
  complaints: STORAGE_PREFIX + 'complaints',
  suggestions: STORAGE_PREFIX + 'suggestions',
  resignations: STORAGE_PREFIX + 'resignations',
  payroll: STORAGE_PREFIX + 'payroll',
  auditLogs: STORAGE_PREFIX + 'audit_logs',
  settings: STORAGE_PREFIX + 'settings',
  files: STORAGE_PREFIX + 'files',
  performanceReviews: STORAGE_PREFIX + 'performance_reviews',
  loginLogs: STORAGE_PREFIX + 'login_logs',
};

// 1. Initial 11 Departments
const initialDepartments: Department[] = [
  { id: 'dept-hr', name: 'إدارة الموارد البشرية', code: 'HR', manager_id: 'emp-1', description: 'مسؤولة عن التوظيف والتدريب والرواتب وشؤون الموظفين.', parent_id: 'dept-admin' },
  { id: 'dept-prod', name: 'إدارة الإنتاج', code: 'PRD', manager_id: 'emp-2', description: 'مسؤولة عن تشغيل خطوط الإنتاج وماكينات بثق وحقن البلاستيك.', parent_id: 'dept-admin' },
  { id: 'dept-quality', name: 'إدارة الجودة', code: 'QUAL', manager_id: 'emp-3', description: 'مراقبة جودة المنتجات البلاستيكية ومطابقتها للمواصفات القياسية.', parent_id: 'dept-admin' },
  { id: 'dept-warehouse', name: 'إدارة المخازن', code: 'STO', manager_id: 'emp-4', description: 'إدارة مخازن المواد الخام والمنتجات النهائية وقوالب الحقن.', parent_id: 'dept-admin' },
  { id: 'dept-proc', name: 'إدارة المشتريات', code: 'PRC', manager_id: 'emp-5', description: 'توفير المواد البلاستيكية الخام (البوليمرات) ومستلزمات الإنتاج.', parent_id: 'dept-admin' },
  { id: 'dept-acc', name: 'إدارة الحسابات والمالية', code: 'ACC', manager_id: 'emp-6', description: 'إدارة الحسابات، ميزانيات المصنع، والمستحقات والرواتب.', parent_id: 'dept-admin' },
  { id: 'dept-maintenance', name: 'إدارة الصيانة', code: 'MNT', manager_id: 'emp-7', description: 'الصيانة الدورية والوقائية لماكينات المصنع والقوالب وخطوط الكهرباء.', parent_id: 'dept-admin' },
  { id: 'dept-security', name: 'إدارة الأمن والسلامة', code: 'SEC', manager_id: 'emp-8', description: 'تأمين المصنع والسلامة والصحة المهنية لبيئة العمل الصناعية.', parent_id: 'dept-admin' },
  { id: 'dept-admin', name: 'الإدارة العامة والمجلس', code: 'ADM', manager_id: 'emp-9', description: 'التخطيط الاستراتيجي، الإدارة التنفيذية والقرارات العليا للمصنع.', parent_id: null },
  { id: 'dept-logistics', name: 'إدارة النقل واللوجستيات', code: 'LOG', manager_id: 'emp-10', description: 'إدارة شاحنات الشحن، توصيل الطلبيات، وتوزيع المنتجات للعملاء.', parent_id: 'dept-admin' },
  { id: 'dept-it', name: 'إدارة تكنولوجيا المعلومات (IT)', code: 'IT', manager_id: 'emp-11', description: 'إدارة البنية التحتية الشبكية، سيرفرات المصنع، والدعم الفني والبرمجي.', parent_id: 'dept-admin' },
];

// 2. Industrial Job Positions
const initialPositions: Position[] = [
  // HR
  { id: 'pos-hr-mgr', title: 'مدير الموارد البشرية', department_id: 'dept-hr', base_salary: 15000 },
  { id: 'pos-hr-spec', title: 'أخصائي شؤون موظفين', department_id: 'dept-hr', base_salary: 7000 },
  // Production
  { id: 'pos-prod-mgr', title: 'مدير إدارة الإنتاج', department_id: 'dept-prod', base_salary: 18000 },
  { id: 'pos-prod-eng', title: 'مهندس إنتاج بلاستيك', department_id: 'dept-prod', base_salary: 10000 },
  { id: 'pos-mach-op', title: 'مشغل ماكينة حقن وبثق', department_id: 'dept-prod', base_salary: 6000 },
  { id: 'pos-packer', title: 'عامل تعبئة وتغليف', department_id: 'dept-prod', base_salary: 4500 },
  // Quality
  { id: 'pos-qual-mgr', title: 'مدير إدارة الجودة', department_id: 'dept-quality', base_salary: 14000 },
  { id: 'pos-qual-ctrl', title: 'مراقب جودة إنتاج', department_id: 'dept-quality', base_salary: 6500 },
  // Warehouse
  { id: 'pos-wh-mgr', title: 'مدير المخازن', department_id: 'dept-warehouse', base_salary: 11000 },
  { id: 'pos-wh-keep', title: 'أمين مخزن خامات', department_id: 'dept-warehouse', base_salary: 5500 },
  // Procurement
  { id: 'pos-proc-mgr', title: 'مدير المشتريات', department_id: 'dept-proc', base_salary: 12000 },
  { id: 'pos-proc-buyer', title: 'مسؤول مشتريات خامات', department_id: 'dept-proc', base_salary: 6500 },
  // Accounts
  { id: 'pos-acc-mgr', title: 'المدير المالي والرواتب', department_id: 'dept-acc', base_salary: 16000 },
  { id: 'pos-accountant', title: 'محاسب تكاليف ومخازن', department_id: 'dept-acc', base_salary: 8000 },
  // Maintenance
  { id: 'pos-mnt-mgr', title: 'مدير إدارة الصيانة', department_id: 'dept-maintenance', base_salary: 15000 },
  { id: 'pos-mnt-tech', title: 'فني صيانة ميكانيكية وقوالب', department_id: 'dept-maintenance', base_salary: 7500 },
  { id: 'pos-elec-tech', title: 'فني كهرباء تحكم صناعي', department_id: 'dept-maintenance', base_salary: 7800 },
  // Security
  { id: 'pos-sec-mgr', title: 'مدير الأمن والسلامة', department_id: 'dept-security', base_salary: 9000 },
  { id: 'pos-sec-guard', title: 'فرد أمن وحراسة', department_id: 'dept-security', base_salary: 4000 },
  // General Administration
  { id: 'pos-gen-mgr', title: 'المدير العام للمصنع', department_id: 'dept-admin', base_salary: 30000 },
  { id: 'pos-adm-assistant', title: 'أخصائي إداري وسكرتارية', department_id: 'dept-admin', base_salary: 6000 },
  // Logistics
  { id: 'pos-log-mgr', title: 'مدير الحركة والنقل', department_id: 'dept-logistics', base_salary: 11000 },
  { id: 'pos-driver', title: 'سائق شاحنة توزيع ثقيل', department_id: 'dept-logistics', base_salary: 5500 },
  // IT
  { id: 'pos-it-mgr', title: 'مدير تكنولوجيا المعلومات', department_id: 'dept-it', base_salary: 13000 },
  { id: 'pos-sys-admin', title: 'مهندس شبكات ونظم', department_id: 'dept-it', base_salary: 8500 },
];

// 3. System Roles & Human Friendly Arabic translations
const initialRoles: Role[] = [
  { id: 'role-admin', name: 'admin', name_ar: 'مدير النظام (المدير العام)', description: 'له كامل الصلاحيات لإدارة المصنع والموظفين والإعدادات الحساسة وحذف السجلات المتقدمة.' },
  { id: 'role-hr', name: 'hr_manager', name_ar: 'مدير الموارد البشرية', description: 'إدارة شؤون الموظفين، عقود العمل، الرواتب، الإجازات، الحضور، وتعديل حالات الموظفين.' },
  { id: 'role-manager', name: 'department_manager', name_ar: 'مدير إدارة / رئيس قسم', description: 'الاطلاع على موظفي إدارته، الموافقة على الإجازات والعمل الإضافي، ورفع التوصيات.' },
  { id: 'role-employee', name: 'employee', name_ar: 'موظف المصنع', description: 'الاطلاع على ملفه الشخصي، تسجيل الحضور، تقديم طلبات السلف والإجازات، وتقديم الشكاوى والاقتراحات.' },
];

// 4. Detailed Permissions
const initialPermissions: Permission[] = [
  { id: 'p-emp-view', name: 'employees_view', name_ar: 'عرض الموظفين', description: 'عرض قائمة الموظفين وتفاصيل ملفاتهم.', category: 'الموظفون' },
  { id: 'p-emp-manage', name: 'employees_manage', name_ar: 'إدارة الموظفين', description: 'إضافة وتعديل بيانات الموظفين والعقود.', category: 'الموظفون' },
  { id: 'p-emp-delete', name: 'employees_delete', name_ar: 'حذف الموظفين نهائياً', description: 'الصلاحية النادرة لحذف سجل الموظف نهائياً بعد التحذيرات المزدوجة.', category: 'الموظفون' },
  { id: 'p-dept-manage', name: 'departments_manage', name_ar: 'إدارة الهيكل التنظيمي', description: 'إضافة وتعديل الإدارات والأقسام وتعيين المدراء.', category: 'الهيكل التنظيمي' },
  { id: 'p-payroll-manage', name: 'payroll_manage', name_ar: 'إدارة المرتبات والمسحوقات', description: 'حساب وإقرار الرواتب الشهرية وإضافة الحوافز والخصومات.', category: 'المرتبات والمكافآت' },
  { id: 'p-leaves-approve', name: 'leaves_approve', name_ar: 'اعتماد طلبات الإجازة', description: 'الموافقة على أو رفض الإجازات المرضية والسنوية والطارئة.', category: 'الإجازات والغياب' },
  { id: 'p-overtime-approve', name: 'overtime_approve', name_ar: 'اعتماد الساعات الإضافية', description: 'الموافقة على تكليفات العمل الإضافي وحساب ساعاتها.', category: 'الإضافي والسلف' },
  { id: 'p-loans-approve', name: 'loans_approve', name_ar: 'اعتماد السلف المالية', description: 'الموافقة على طلبات السلف للموظفين وجدولة الأقساط.', category: 'الإضافي والسلف' },
  { id: 'p-grievance-manage', name: 'grievance_manage', name_ar: 'إدارة التظلمات والشكاوى', description: 'مراجعة شكاوى وتظلمات الموظفين والتحقيق فيها وحلها.', category: 'العلاقات المهنية' },
  { id: 'p-settings-manage', name: 'settings_manage', name_ar: 'إدارة إعدادات النظام واللوائح', description: 'تغيير ألوان الهوية، الشعار، ساعات العمل، وقيم الساعات الإضافية والجزاءات.', category: 'إعدادات النظام' },
];

// 5. Initial Employees (Representing different departments, with active/inactive statuses)
const initialEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'أحمد محمود القاضي',
    email: 'ahmed.qadi@qudsplastic.com',
    phone: '01012345678',
    gender: 'Male',
    national_id: '29005121400123',
    department_id: 'dept-hr',
    position_id: 'pos-hr-mgr',
    status: 'Active',
    join_date: '2020-01-15',
    manager_id: 'emp-9',
    basic_salary: 15000,
    allowances: 2500,
    role_id: 'role-hr',
    created_at: '2020-01-15T08:00:00Z',
    career_progression: [
      { id: 'cp-1', employee_id: 'emp-1', date: '2020-01-15', type: 'Contract Renewal', old_title: 'أخصائي شؤون موظفين', new_title: 'أخصائي شؤون موظفين', old_salary: 6000, new_salary: 7000, notes: 'مباشرة العمل عند التعيين' },
      { id: 'cp-2', employee_id: 'emp-1', date: '2023-06-01', type: 'Promotion', old_title: 'أخصائي شؤون موظفين', new_title: 'مدير الموارد البشرية', old_salary: 7000, new_salary: 15000, notes: 'نظراً لكفاءته العالية وتفانيه وتمت ترقيته لمدير إدارة' }
    ],
    transfer_history: [
      { id: 'th-1', employee_id: 'emp-1', date: '2023-06-01', old_department_id: 'dept-hr', new_department_id: 'dept-hr', old_position_id: 'pos-hr-spec', new_position_id: 'pos-hr-mgr', reason: 'ترقية تنظيمية داخلية بموجب قرار مجلس الإدارة رقم 45', approved_by: 'أحمد القدس (المدير العام)' }
    ]
  },
  {
    id: 'emp-2',
    name: 'المهندس مصطفى كامل البنا',
    email: 'mustafa.banna@qudsplastic.com',
    phone: '01123456789',
    gender: 'Male',
    national_id: '28509201400543',
    department_id: 'dept-prod',
    position_id: 'pos-prod-mgr',
    status: 'Active',
    join_date: '2019-03-01',
    manager_id: 'emp-9',
    basic_salary: 18000,
    allowances: 3500,
    role_id: 'role-manager',
    created_at: '2019-03-01T08:00:00Z',
    career_progression: [
      { id: 'cp-3', employee_id: 'emp-2', date: '2019-03-01', type: 'Contract Renewal', old_title: 'مهندس إنتاج بلاستيك', new_title: 'مهندس إنتاج بلاستيك', old_salary: 9000, new_salary: 10000, notes: 'بداية التعيين' },
      { id: 'cp-4', employee_id: 'emp-2', date: '2022-01-01', type: 'Promotion', old_title: 'مهندس إنتاج بلاستيك', new_title: 'مدير إدارة الإنتاج', old_salary: 10000, new_salary: 18000, notes: 'تسلم قيادة إدارة الإنتاج بالكامل وتطوير خط الحقن الثالث' }
    ]
  },
  {
    id: 'emp-3',
    name: 'أمل سمير الشافعي',
    email: 'amal.shafey@qudsplastic.com',
    phone: '01234567890',
    gender: 'Female',
    national_id: '29508151400987',
    department_id: 'dept-quality',
    position_id: 'pos-qual-mgr',
    status: 'Active',
    join_date: '2021-02-10',
    manager_id: 'emp-9',
    basic_salary: 14000,
    allowances: 2000,
    role_id: 'role-manager',
    created_at: '2021-02-10T08:00:00Z'
  },
  {
    id: 'emp-4',
    name: 'سعيد عبد الرحمن عوف',
    email: 'saeed.aouf@qudsplastic.com',
    phone: '01045678901',
    gender: 'Male',
    national_id: '28011051401122',
    department_id: 'dept-warehouse',
    position_id: 'pos-wh-mgr',
    status: 'Active',
    join_date: '2018-05-20',
    manager_id: 'emp-9',
    basic_salary: 11000,
    allowances: 1500,
    role_id: 'role-manager',
    created_at: '2018-05-20T08:00:00Z'
  },
  {
    id: 'emp-5',
    name: 'حسام نصر غنيم',
    email: 'hosam.ghoneim@qudsplastic.com',
    phone: '01556789012',
    gender: 'Male',
    national_id: '29104031401344',
    department_id: 'dept-proc',
    position_id: 'pos-proc-mgr',
    status: 'Active',
    join_date: '2022-04-01',
    manager_id: 'emp-9',
    basic_salary: 12000,
    allowances: 1800,
    role_id: 'role-manager',
    created_at: '2022-04-01T08:00:00Z'
  },
  {
    id: 'emp-6',
    name: 'سامح فريد عبد الباقي',
    email: 'sameh.farid@qudsplastic.com',
    phone: '01067890123',
    gender: 'Male',
    national_id: '28807211400654',
    department_id: 'dept-acc',
    position_id: 'pos-acc-mgr',
    status: 'Active',
    join_date: '2017-01-10',
    manager_id: 'emp-9',
    basic_salary: 16000,
    allowances: 3000,
    role_id: 'role-manager',
    created_at: '2017-01-10T08:00:00Z'
  },
  {
    id: 'emp-7',
    name: 'المهندس عصام جلال الدين',
    email: 'essam.galal@qudsplastic.com',
    phone: '01278901234',
    gender: 'Male',
    national_id: '28403101400231',
    department_id: 'dept-maintenance',
    position_id: 'pos-mnt-mgr',
    status: 'Active',
    join_date: '2019-11-01',
    manager_id: 'emp-9',
    basic_salary: 15000,
    allowances: 2500,
    role_id: 'role-manager',
    created_at: '2019-11-01T08:00:00Z'
  },
  {
    id: 'emp-8',
    name: 'اللواء رأفت عبد السميع',
    email: 'raafat.security@qudsplastic.com',
    phone: '01189012345',
    gender: 'Male',
    national_id: '27212011400892',
    department_id: 'dept-security',
    position_id: 'pos-sec-mgr',
    status: 'Active',
    join_date: '2020-08-01',
    manager_id: 'emp-9',
    basic_salary: 9000,
    allowances: 1000,
    role_id: 'role-manager',
    created_at: '2020-08-01T08:00:00Z'
  },
  {
    id: 'emp-9',
    name: 'أحمد السيد القدس',
    email: 'ahmed.quds@qudsplastic.com',
    phone: '01000000001',
    gender: 'Male',
    national_id: '27001011400001',
    department_id: 'dept-admin',
    position_id: 'pos-gen-mgr',
    status: 'Active',
    join_date: '2015-01-01',
    manager_id: null,
    basic_salary: 30000,
    allowances: 5000,
    role_id: 'role-admin',
    created_at: '2015-01-01T08:00:00Z'
  },
  {
    id: 'emp-10',
    name: 'سليمان يسري منصور',
    email: 'soliman.yousry@qudsplastic.com',
    phone: '01590123456',
    gender: 'Male',
    national_id: '28606141400192',
    department_id: 'dept-logistics',
    position_id: 'pos-log-mgr',
    status: 'Active',
    join_date: '2021-09-15',
    manager_id: 'emp-9',
    basic_salary: 11000,
    allowances: 1500,
    role_id: 'role-manager',
    created_at: '2021-09-15T08:00:00Z'
  },
  {
    id: 'emp-11',
    name: 'المهندس رامي فؤاد زكريا',
    email: 'rami.it@qudsplastic.com',
    phone: '01090123456',
    gender: 'Male',
    national_id: '29302251400321',
    department_id: 'dept-it',
    position_id: 'pos-it-mgr',
    status: 'Active',
    join_date: '2021-05-01',
    manager_id: 'emp-9',
    basic_salary: 13000,
    allowances: 2000,
    role_id: 'role-manager',
    created_at: '2021-05-01T08:00:00Z'
  },
  // Subordinates / Workers
  {
    id: 'emp-12',
    name: 'إبراهيم حسن مرزوق',
    email: 'ibrahim.marzouk@qudsplastic.com',
    phone: '01021436587',
    gender: 'Male',
    national_id: '29511021400192',
    department_id: 'dept-prod',
    position_id: 'pos-mach-op',
    status: 'Active',
    join_date: '2021-10-01',
    manager_id: 'emp-2',
    basic_salary: 6000,
    allowances: 800,
    role_id: 'role-employee',
    created_at: '2021-10-01T08:00:00Z'
  },
  {
    id: 'emp-13',
    name: 'فتحي محمود الشريف',
    email: 'fathy.sherif@qudsplastic.com',
    phone: '01287654321',
    gender: 'Male',
    national_id: '29801051400281',
    department_id: 'dept-prod',
    position_id: 'pos-packer',
    status: 'Active',
    join_date: '2023-01-10',
    manager_id: 'emp-2',
    basic_salary: 4500,
    allowances: 500,
    role_id: 'role-employee',
    created_at: '2023-01-10T08:00:00Z'
  },
  // Inactive Employee (Retained with full records as requested!)
  {
    id: 'emp-14',
    name: 'عادل عبد الله مغازي',
    email: 'adel.moghazi@qudsplastic.com',
    phone: '01122334455',
    gender: 'Male',
    national_id: '29202101400491',
    department_id: 'dept-prod',
    position_id: 'pos-mach-op',
    status: 'Inactive',
    join_date: '2021-01-01',
    termination_date: '2026-05-01',
    termination_reason: 'الاستقالة والانتقال للعمل بمحافظة أخرى لتكون قريبة من أسرته.',
    manager_id: 'emp-2',
    basic_salary: 5800,
    allowances: 700,
    role_id: 'role-employee',
    created_at: '2021-01-01T08:00:00Z',
    career_progression: [
      { id: 'cp-adel-1', employee_id: 'emp-14', date: '2021-01-01', type: 'Contract Renewal', old_title: 'مشغل ماكينة حقن وبثق', new_title: 'مشغل ماكينة حقن وبثق', old_salary: 4000, new_salary: 4500, notes: 'مباشرة العمل بالتأسيس' },
      { id: 'cp-adel-2', employee_id: 'emp-14', date: '2024-01-01', type: 'Salary Change', old_title: 'مشغل ماكينة حقن وبثق', new_title: 'مشغل ماكينة حقن وبثق', old_salary: 4500, new_salary: 5800, notes: 'زيادة سنوية استثنائية لمستويات الجودة' }
    ]
  }
];

// 6. Contracts matching employees
const initialContracts: Contract[] = [
  { id: 'con-1', employee_id: 'emp-1', start_date: '2020-01-15', end_date: '2028-01-15', contract_type: 'Permanent', status: 'Active' },
  { id: 'con-2', employee_id: 'emp-2', start_date: '2019-03-01', end_date: '2027-03-01', contract_type: 'Permanent', status: 'Active' },
  { id: 'con-3', employee_id: 'emp-3', start_date: '2021-02-10', end_date: '2026-02-10', contract_type: 'Fixed-term', status: 'Active' },
  { id: 'con-12', employee_id: 'emp-12', start_date: '2021-10-01', end_date: '2026-10-01', contract_type: 'Fixed-term', status: 'Active' },
  { id: 'con-13', employee_id: 'emp-13', start_date: '2023-01-10', end_date: '2025-01-10', contract_type: 'Temporary', status: 'Active' },
  { id: 'con-14', employee_id: 'emp-14', start_date: '2021-01-01', end_date: '2026-05-01', contract_type: 'Fixed-term', status: 'Terminated' },
];

// 7. Factory Shifts
const initialShifts: Shift[] = [
  { id: 'shift-1', name: 'الوردية الصباحية (أ)', start_time: '08:00', end_time: '16:00', days_of_week: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'] },
  { id: 'shift-2', name: 'الوردية المسائية (ب)', start_time: '16:00', end_time: '00:00', days_of_week: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'] },
  { id: 'shift-3', name: 'الوردية الليلية (ج)', start_time: '00:00', end_time: '08:00', days_of_week: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'] },
];

// 8. Sample Leave Requests
const initialLeaveRequests: LeaveRequest[] = [
  { id: 'leave-1', employee_id: 'emp-12', leave_type: 'Annual', start_date: '2026-07-15', end_date: '2026-07-20', days_count: 5, status: 'Pending', reason: 'زيارة عائلية هامة بالصعيد وتجهيزات زواج شقيقي.', approved_by: null, approved_at: null },
  { id: 'leave-2', employee_id: 'emp-13', leave_type: 'Sick', start_date: '2026-07-01', end_date: '2026-07-03', days_count: 2, status: 'Approved', reason: 'تقرير طبي يفيد بإصابته بنزلة برد حادة وحمى.', approved_by: 'emp-1', approved_at: '2026-07-01T09:00:00Z' },
  { id: 'leave-3', employee_id: 'emp-3', leave_type: 'Annual', start_date: '2026-06-10', end_date: '2026-06-17', days_count: 7, status: 'Approved', reason: 'إجازة سنوية للاستجمام والراحة.', approved_by: 'emp-9', approved_at: '2026-06-08T11:00:00Z' },
];

// 9. Sample Overtime Requests
const initialOvertimeRequests: OvertimeRequest[] = [
  { id: 'ot-1', employee_id: 'emp-12', date: '2026-07-06', hours: 4, multiplier: 1.5, status: 'Approved', reason: 'تغطية نقص عمالة في وردية المساء بسبب تعطل خط البثق رقم 2 ورغبة المصنع في إنهاء طلبية شركة مياه السادات.', approved_by: 'emp-2' },
  { id: 'ot-2', employee_id: 'emp-13', date: '2026-07-09', hours: 3, multiplier: 1.5, status: 'Pending', reason: 'تحميل الشاحنات بالطلبيات البلاستيكية استعداداً للشحن الصباحي.', approved_by: null },
];

// 10. Sample Loans (السلف المالية)
const initialLoanRequests: LoanRequest[] = [
  { id: 'loan-1', employee_id: 'emp-12', amount: 5000, installments: 5, remaining_amount: 3000, status: 'Approved', purpose: 'دفع مصاريف دراسية جامعية لأولاده مع بداية الفصل الصيفي.', approved_by: 'emp-1', created_at: '2026-05-10T10:00:00Z' },
  { id: 'loan-2', employee_id: 'emp-13', amount: 3000, installments: 3, remaining_amount: 3000, status: 'Pending', purpose: 'شراء بعض الأجهزة الكهربائية المنزلية المستعجلة.', approved_by: null, created_at: '2026-07-05T12:00:00Z' },
];

// 11. Sample Penalties & Bonuses
const initialPenalties: Penalty[] = [
  { id: 'pen-1', employee_id: 'emp-13', type: 'Delay (تأخير بدون إذن)', amount: 150, reason: 'التأخر عن الحضور للوردية الصباحية بمقدار ساعة ونصف بدون عذر مسبق.', date: '2026-07-03', approved_by: 'emp-1' },
];

const initialBonuses: Bonus[] = [
  { id: 'bon-1', employee_id: 'emp-12', type: 'Exceptional Effort (جهد استثنائي)', amount: 500, reason: 'المساهمة في صيانة قالب الحقن المستورد وإعادة خط الإنتاج للعمل بكفاءة في زمن قياسي.', date: '2026-07-05', approved_by: 'emp-2' },
];

// 12. Sample Attendance Logs for July 8th, 2026
const initialAttendance: Attendance[] = [
  { id: 'att-1', employee_id: 'emp-1', date: '2026-07-08', clock_in: '07:55', clock_out: null, status: 'On Time', delay_minutes: 0 },
  { id: 'att-2', employee_id: 'emp-2', date: '2026-07-08', clock_in: '08:05', clock_out: null, status: 'Late', delay_minutes: 5 },
  { id: 'att-3', employee_id: 'emp-3', date: '2026-07-08', clock_in: '07:48', clock_out: null, status: 'On Time', delay_minutes: 0 },
  { id: 'att-4', employee_id: 'emp-12', date: '2026-07-08', clock_in: '08:15', clock_out: null, status: 'Late', delay_minutes: 15 },
  { id: 'att-5', employee_id: 'emp-13', date: '2026-07-08', clock_in: null, clock_out: null, status: 'Absent', delay_minutes: 0 },
];

// 13. Complaints (الشكاوى والتظلمات) & Suggestions (الاقتراحات)
const initialComplaints: Complaint[] = [
  { id: 'comp-1', employee_id: 'emp-12', title: 'حرارة بيئة خط البثق عالية جداً', content: 'نرجو من إدارة الصيانة توفير مراوح تهوية إضافية أو صيانة أجهزة التكييف الصحراوي بجوار الماكينات، حيث أن درجات الحرارة مرتفعة جداً وتسبب إجهاداً كبيراً للعمال.', is_anonymous: false, status: 'Investigating', created_at: '2026-07-04T09:30:00Z' },
  { id: 'comp-2', employee_id: null, title: 'شكوى بخصوص وجبات التغذية للوردية المسائية', content: 'الوجبات التي تصل في الوردية المسائية أحياناً تكون باردة وجودتها أقل من الوردية الصباحية. نرجو توجيه متعهد الوجبات بالالتزام بنفس معايير الجودة للوردية المسائية.', is_anonymous: true, status: 'Pending', created_at: '2026-07-06T15:20:00Z' },
];

const initialSuggestions: Suggestion[] = [
  { id: 'sug-1', employee_id: 'emp-1', title: 'تنظيم دوري رياضي سنوي لعمال المصنع', content: 'أقترح تنظيم دورة كرة قدم خماسية بين الإدارات والأقسام المختلفة يوم الجمعة في أحد الملاعب المستأجرة لزيادة روح الألفة والترابط وتفريغ طاقات العمال بشكل إيجابي.', is_anonymous: false, status: 'Reviewed', created_at: '2026-07-02T11:00:00Z' },
  { id: 'sug-2', employee_id: 'emp-12', title: 'إعادة تدوير الهوالك البلاستيكية فورياً', content: 'نقترح إعداد وحدة تكسير صغيرة ملاصقة مباشرة لخط البثق لتكسير الأجزاء المعيبة وإعادة تلقيمها مباشرة مما يقلل النقل وهدر الوقت.', is_anonymous: false, status: 'Implemented', created_at: '2026-07-05T10:15:00Z' },
];

// 14. Resignation requests
const initialResignations: Resignation[] = [
  { id: 'res-1', employee_id: 'emp-14', request_date: '2026-04-01', desired_last_day: '2026-05-01', actual_last_day: '2026-05-01', reason: 'الانتقال للعيش بالصعيد لتجهيز عرس العائلة والبعد الجغرافي عن المصنع.', status: 'Approved', clearance_completed: true, comments: 'تم إنهاء كافة المستحقات المادية وتسليمه أوراق إخلاء الطرف وإعادته لموقف Inactive.' }
];

// 15. Payroll records for June 2026
const initialPayroll: Payroll[] = [
  {
    id: 'pay-1',
    employee_id: 'emp-1',
    month: 6,
    year: 2026,
    basic_salary: 15000,
    allowances: 2500,
    overtime_pay: 0,
    bonus_pay: 0,
    loan_deductions: 0,
    penalty_deductions: 0,
    tax_deductions: 1750,
    net_salary: 15750,
    status: 'Paid',
    paid_at: '2026-06-30T14:00:00Z'
  },
  {
    id: 'pay-2',
    employee_id: 'emp-12',
    month: 6,
    year: 2026,
    basic_salary: 6000,
    allowances: 800,
    overtime_pay: 360, // 4 hours at rate
    bonus_pay: 500, // exceptional
    loan_deductions: 1000, // monthly installment
    penalty_deductions: 0,
    tax_deductions: 680,
    net_salary: 5980,
    status: 'Paid',
    paid_at: '2026-06-30T14:30:00Z'
  }
];

// 16. Audit Logs
const initialAuditLogs: AuditLog[] = [
  { id: 'log-1', user_id: 'emp-9', user_name: 'أحمد السيد القدس', action: 'CREATE_EMPLOYEE', module: 'الموظفون', table_name: 'employees', record_id: 'emp-13', old_values: '', new_values: '{"name": "فتحي محمود الشريف", "department": "Production"}', ip_address: '192.168.1.55', created_at: '2026-07-01T08:30:00Z' },
  { id: 'log-2', user_id: 'emp-1', user_name: 'أحمد محمود القاضي', action: 'APPROVE_LEAVE', module: 'الإجازات', table_name: 'leave_requests', record_id: 'leave-2', old_values: '{"status": "Pending"}', new_values: '{"status": "Approved"}', ip_address: '192.168.1.102', created_at: '2026-07-01T10:00:00Z' },
  { id: 'log-3', user_id: 'emp-1', user_name: 'أحمد محمود القاضي', action: 'TRANSFER_EMPLOYEE', module: 'الهيكل التنظيمي', table_name: 'employees', record_id: 'emp-1', old_values: '{"department_id": "dept-hr", "position_id": "pos-hr-spec"}', new_values: '{"department_id": "dept-hr", "position_id": "pos-hr-mgr"}', ip_address: '192.168.1.102', created_at: '2023-06-01T09:00:00Z' }
];

// 17. Default Settings for Al Quds Factory for Plastic Technologies
const defaultSettings: SystemSettings = {
  factory_name: 'مصنع القدس للتقنيات البلاستيكية',
  factory_branch: 'المنطقة الصناعية الثانية، مدينة السادات، المنوفية',
  primary_color: '#1e3a8a', // industrial royal blue
  accent_color: '#3b82f6', // steel blue
  logo_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&auto=format&fit=crop&q=80', // Industrial plant gears/machinery conceptual logo
  weekend_days: ['Friday'],
  overtime_rate_day: 1.5,
  overtime_rate_night: 2.0
};

// Seeding / local storage persistence utility
function getStoredItem<T>(key: string, initialValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return initialValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

// Global state getters and setters
export const getDepartments = (): Department[] => getStoredItem(keys.departments, initialDepartments);
export const saveDepartments = (depts: Department[]) => setStoredItem(keys.departments, depts);

export const getPositions = (): Position[] => getStoredItem(keys.positions, initialPositions);
export const savePositions = (pos: Position[]) => setStoredItem(keys.positions, pos);

// Helper to calculate age automatically
export function calculateAge(dobStr: string | undefined): number {
  if (!dobStr) return 30;
  try {
    const birthDate = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) ? 30 : age;
  } catch {
    return 30;
  }
}

export const getEmployees = (): Employee[] => {
  const emps = getStoredItem(keys.employees, initialEmployees);
  // Ensure every employee has all required Master File fields
  let updated = false;
  const enriched = emps.map((emp, index) => {
    let hasChanges = false;
    const defaultDOB = emp.gender === 'Female' ? '1995-08-15' : '1992-05-10';
    
    const enrichedEmp = {
      employee_no: emp.employee_no || `Q-${1001 + index}`,
      personal_photo: emp.personal_photo || (emp.gender === 'Female' 
        ? `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80`
        : `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80`),
      social_security_no: emp.social_security_no || `31245678${90 + index}`,
      fingerprint_no: emp.fingerprint_no || `${101 + index}`,
      emergency_phone: emp.emergency_phone || '01001122334',
      address: emp.address || 'المنطقة الصناعية الثانية، السادات، المنوفية',
      address_province: emp.address_province || 'المنوفية',
      address_city: emp.address_city || 'مدينة السادات',
      birth_date: emp.birth_date || defaultDOB,
      marital_status: emp.marital_status || 'Married',
      children_count: emp.children_count !== undefined ? emp.children_count : (index % 3),
      nationality: emp.nationality || 'مصري',
      qualification: emp.qualification || (emp.role_id === 'role-manager' || emp.role_id === 'role-admin' ? 'بكالوريوس هندسة' : 'دبلوم صناعي فوق المتوسط'),
      specialization: emp.specialization || (emp.role_id === 'role-manager' || emp.role_id === 'role-admin' ? 'ميكانيكا إنتاج' : 'تشغيل ماكينات بلاستيك'),
      previous_experience: emp.previous_experience || 'خبرة 4 سنوات في تشغيل وصيانة خطوط بثق وحقن البلاستيك والمعدات الصناعية.',
      contract_end_date: emp.contract_end_date || '2028-10-01',
      contract_type: emp.contract_type || (index % 2 === 0 ? 'Permanent' : 'Fixed-term'),
      section: emp.section || (emp.department_id === 'dept-prod' ? 'قسم خطوط البثق' : 'قسم الدعم والعمليات'),
      shift_id: emp.shift_id || `shift-${(index % 3) + 1}`,
      workplace: emp.workplace || (emp.department_id === 'dept-prod' ? 'صالة الإنتاج الرئيسية - هنجر أ' : 'مبنى الإدارة الرئيسي'),
      incentives: emp.incentives !== undefined ? emp.incentives : 300,
      deductions: emp.deductions !== undefined ? emp.deductions : 0,
      insurance_amount: emp.insurance_amount !== undefined ? emp.insurance_amount : 450,
      bank_account: emp.bank_account || `EG7820030200100${12340 + index}`,
      ...emp
    };

    if (JSON.stringify(enrichedEmp) !== JSON.stringify(emp)) {
      updated = true;
    }
    return enrichedEmp;
  });

  if (updated) {
    // Save enriched values back so we have them stored consistently
    setStoredItem(keys.employees, enriched);
  }
  return enriched;
};

export const saveEmployees = (emps: Employee[]) => setStoredItem(keys.employees, emps);

export const getContracts = (): Contract[] => getStoredItem(keys.contracts, initialContracts);
export const saveContracts = (con: Contract[]) => setStoredItem(keys.contracts, con);

export const getRoles = (): Role[] => getStoredItem(keys.roles, initialRoles);
export const getPermissions = (): Permission[] => getStoredItem(keys.permissions, initialPermissions);

export const getShifts = (): Shift[] => getStoredItem(keys.shifts, initialShifts);
export const saveShifts = (shifts: Shift[]) => setStoredItem(keys.shifts, shifts);

export const getLeaveRequests = (): LeaveRequest[] => getStoredItem(keys.leaveRequests, initialLeaveRequests);
export const saveLeaveRequests = (reqs: LeaveRequest[]) => setStoredItem(keys.leaveRequests, reqs);

export const getOvertimeRequests = (): OvertimeRequest[] => getStoredItem(keys.overtimeRequests, initialOvertimeRequests);
export const saveOvertimeRequests = (reqs: OvertimeRequest[]) => setStoredItem(keys.overtimeRequests, reqs);

export const getLoanRequests = (): LoanRequest[] => getStoredItem(keys.loanRequests, initialLoanRequests);
export const saveLoanRequests = (reqs: LoanRequest[]) => setStoredItem(keys.loanRequests, reqs);

export const getPenalties = (): Penalty[] => getStoredItem(keys.penalties, initialPenalties);
export const savePenalties = (pens: Penalty[]) => setStoredItem(keys.penalties, pens);

export const getBonuses = (): Bonus[] => getStoredItem(keys.bonuses, initialBonuses);
export const saveBonuses = (bns: Bonus[]) => setStoredItem(keys.bonuses, bns);

export const getAttendance = (): Attendance[] => getStoredItem(keys.attendance, initialAttendance);
export const saveAttendance = (att: Attendance[]) => setStoredItem(keys.attendance, att);

export const getComplaints = (): Complaint[] => getStoredItem(keys.complaints, initialComplaints);
export const saveComplaints = (comps: Complaint[]) => setStoredItem(keys.complaints, comps);

export const getSuggestions = (): Suggestion[] => getStoredItem(keys.suggestions, initialSuggestions);
export const saveSuggestions = (sugs: Suggestion[]) => setStoredItem(keys.suggestions, sugs);

export const getResignations = (): Resignation[] => getStoredItem(keys.resignations, initialResignations);
export const saveResignations = (res: Resignation[]) => setStoredItem(keys.resignations, res);

export const getPayroll = (): Payroll[] => getStoredItem(keys.payroll, initialPayroll);
export const savePayroll = (pay: Payroll[]) => setStoredItem(keys.payroll, pay);

export const getAuditLogs = (): AuditLog[] => getStoredItem(keys.auditLogs, initialAuditLogs);
export const saveAuditLogs = (logs: AuditLog[]) => setStoredItem(keys.auditLogs, logs);

export const getSystemSettings = (): SystemSettings => getStoredItem(keys.settings, defaultSettings);
export const saveSystemSettings = (sets: SystemSettings) => setStoredItem(keys.settings, sets);

// Announcements seeding and helpers
const initialAnnouncements = [
  { id: 'ann-1', title: 'مواعيد تشغيل خطوط الإنتاج لعيد الأضحى المبارك', content: 'السادة العاملين بمصنع القدس للتقنيات البلاستيكية، نود إحاطتكم علماً بأن إجازة عيد الأضحى المبارك ستبدأ من يوم الجمعة حتى يوم الثلاثاء، على أن يستأنف العمل بجدول الورديات الكامل بدءاً من صباح الأربعاء. كل عام وأنتم بخير.', published_at: '2026-06-15' },
  { id: 'ann-2', title: 'وصول دفعة قوالب حقن جديدة من ميناء الإسكندرية', content: 'يسر مجلس الإدارة تهنئة مهندسي وعمال قطاع الإنتاج والصيانة على وصول دفعة قوالب حقن الأغطية والعبوات الدائرية الجديدة لزيادة الطاقة الإنتاجية للمصنع بمقدار 40%. سيتم البدء في تركيب وتجربة القوالب غداً صباحاً.', published_at: '2026-07-01' },
  { id: 'ann-3', title: 'صرف مكافأة تميز استثنائية لعمال الوردية المسائية (ب)', content: 'قرر المدير العام صرف مكافأة حافز تميز بقيمة 500 ج.م لجميع عمال وفنيي الوردية المسائية (ب) لنجاحهم في تسليم شحنة البوليمرات وحقن العبوات لشركة مياه الدلتا في وقت قياسي وبدون أي هوالك.', published_at: '2026-07-06' }
];

export const getAnnouncements = () => getStoredItem('quds_hr_announcements', initialAnnouncements);
export const saveAnnouncements = (ann: any[]) => setStoredItem('quds_hr_announcements', ann);

// Helper to log audit actions easily
export const addAuditLog = (user_id: string, user_name: string, action: string, module: string, table_name: string, record_id: string, old_values = '', new_values = '') => {
  const currentLogs = getAuditLogs();
  const newLog: AuditLog = {
    id: 'log-' + Date.now(),
    user_id,
    user_name,
    action,
    module,
    table_name,
    record_id,
    old_values,
    new_values,
    ip_address: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
    created_at: new Date().toISOString()
  };
  saveAuditLogs([newLog, ...currentLogs]);
};

// Initial Seed for Performance Reviews
const initialPerformanceReviews: PerformanceReview[] = [
  {
    id: 'pr-1',
    employee_id: 'emp-12',
    review_date: '2026-06-30',
    reviewer_name: 'أحمد محمود القاضي',
    score: 5,
    feedback: 'أداء ممتاز والتزام تام بمتطلبات السلامة والصحة المهنية. مبادر في أعمال الصيانة الذاتية للماكينة.',
    recommendations: 'الترشيح لدورة تدريبية متقدمة في بثق البلاستيك وتعديل الراتب في الحركة القادمة.'
  },
  {
    id: 'pr-2',
    employee_id: 'emp-13',
    review_date: '2026-06-25',
    reviewer_name: 'المهندس مصطفى كامل البنا',
    score: 4,
    feedback: 'أداء جيد جداً في التعبئة والتغليف، سريع التعلم ولديه إنتاجية عالية.',
    recommendations: 'الاستمرار في نفس المستوى من الكفاءة والدقة.'
  }
];

// Initial Seed for Login Logs
const initialLoginLogs: LoginLog[] = [
  {
    id: 'll-1',
    employee_id: 'emp-1',
    username: 'ahmed.qadi',
    login_time: '2026-07-08T08:02:15Z',
    ip_address: '192.168.1.102',
    status: 'Success',
    device_info: 'Chrome / Windows 11'
  },
  {
    id: 'll-2',
    employee_id: 'emp-9',
    username: 'ahmed.quds',
    login_time: '2026-07-08T09:15:33Z',
    ip_address: '192.168.1.1',
    status: 'Success',
    device_info: 'Safari / macOS Sequoia'
  },
  {
    id: 'll-3',
    employee_id: 'emp-12',
    username: 'ibrahim.marzouk',
    login_time: '2026-07-08T08:10:00Z',
    ip_address: '192.168.1.144',
    status: 'Success',
    device_info: 'Firefox / Android Mobile'
  }
];

export const getPerformanceReviews = (): PerformanceReview[] => getStoredItem(keys.performanceReviews, initialPerformanceReviews);
export const savePerformanceReviews = (reviews: PerformanceReview[]) => setStoredItem(keys.performanceReviews, reviews);

export const getLoginLogs = (): LoginLog[] => getStoredItem(keys.loginLogs, initialLoginLogs);
export const saveLoginLogs = (logs: LoginLog[]) => setStoredItem(keys.loginLogs, logs);
