import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  Folder, 
  Paperclip, 
  Shield, 
  Trash2, 
  HelpCircle, 
  Send, 
  Database, 
  AlertTriangle, 
  Check,
  Eye,
  Bell,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import { getEmployees, getDepartments, addAuditLog } from '../data';
import { User as UserType, Employee } from '../types';
import { 
  getSupabase, 
  isSupabaseConfigured, 
  initSupabase, 
  WorkflowRequest, 
  WorkflowAuditLog, 
  WorkflowNotification 
} from '../supabaseClient';

interface WorkflowManagementProps {
  currentUser: UserType;
}

export default function WorkflowManagement({ currentUser }: WorkflowManagementProps) {
  // Supabase Credentials (dynamic inputs)
  const [supabaseUrl, setSupabaseUrl] = useState((import.meta as any).env.VITE_SUPABASE_URL || '');
  const [supabaseKey, setSupabaseKey] = useState((import.meta as any).env.VITE_SUPABASE_ANON_KEY || '');

  const [isConnected, setIsConnected] = useState(isSupabaseConfigured());
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  // Core requests state loaded from Supabase
  const [requests, setRequests] = useState<WorkflowRequest[]>([]);
  const [logs, setLogs] = useState<WorkflowAuditLog[]>([]);
  const [notifications, setNotifications] = useState<WorkflowNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Active Selected Request for details view
  const [selectedRequest, setSelectedRequest] = useState<WorkflowRequest | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<'create' | 'details' | 'logs'>('create');

  // Search and Filtering states
  const [searchEmployee, setSearchEmployee] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Form states for new request
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formRequestType, setFormRequestType] = useState('طلب إجازة');
  const [formDate, setFormDate] = useState('2026-07-08');
  const [formTime, setFormTime] = useState('12:15');
  const [formDetails, setFormDetails] = useState('');
  const [formAttachment, setFormAttachment] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Decision state
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Load basic components from local data for mapping/selection
  const employeesList = getEmployees().filter(e => e.status === 'Active');
  const departmentsList = getDepartments();

  // Request types list
  const requestTypes = [
    'طلب إجازة',
    'طلب ساعات إضافية',
    'طلب سلفة',
    'طلب تظلم مرتب',
    'طلب مكافأة',
    'طلب مأمورية',
    'طلب إذن خروج',
    'طلب تغيير وردية',
    'طلب نقل قسم',
    'طلب استقالة',
    'شكوى',
    'اقتراح'
  ];

  // SQL schema definition to display for users
  const SQL_SCHEMA = `-- 1. قم بإنشاء جدول الطلبات (Requests)
create table if not exists quds_workflow_requests (
  id bigint generated always as identity primary key,
  request_number text not null unique,
  request_type text not null,
  employee_name text not null,
  employee_id text not null,
  department text not null,
  section text not null,
  request_date date not null default current_date,
  request_time text not null,
  details text not null,
  attachments text,
  status text not null default 'جديد',
  reviewer_name text,
  decision_date date,
  decision_time text,
  rejection_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. قم بإنشاء جدول السجلات (Audit Log)
create table if not exists quds_workflow_logs (
  id bigint generated always as identity primary key,
  request_number text not null,
  action text not null,
  user_name text not null,
  details text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. قم بإنشاء جدول الإشعارات (Notifications)
create table if not exists quds_workflow_notifications (
  id bigint generated always as identity primary key,
  employee_id text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- تمكين الصلاحيات للمستخدمين للوصول للمعلومات
alter table quds_workflow_requests enable row level security;
alter table quds_workflow_logs enable row level security;
alter table quds_workflow_notifications enable row level security;

create policy "الجميع يستطيع القراءة والكتابة" on quds_workflow_requests for all using (true) with check (true);
create policy "الجميع يستطيع القراءة والكتابة" on quds_workflow_logs for all using (true) with check (true);
create policy "الجميع يستطيع القراءة والكتابة" on quds_workflow_notifications for all using (true) with check (true);
`;

  // Fetch all workflow data from Supabase
  const fetchData = async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    setIsLoading(true);
    setConnectionError(null);

    try {
      // Fetch Requests
      const { data: reqData, error: reqError } = await supabase
        .from('quds_workflow_requests')
        .select('*')
        .order('id', { ascending: false });

      if (reqError) throw reqError;
      setRequests(reqData || []);

      // Fetch Logs
      const { data: logData, error: logError } = await supabase
        .from('quds_workflow_logs')
        .select('*')
        .order('id', { ascending: false });

      if (!logError) {
        setLogs(logData || []);
      }

      // Fetch Notifications
      const { data: notifData, error: notifError } = await supabase
        .from('quds_workflow_notifications')
        .select('*')
        .order('id', { ascending: false });

      if (!notifError) {
        setNotifications(notifData || []);
      }

    } catch (err: any) {
      console.error('Error fetching data from Supabase:', err);
      setConnectionError(err.message || 'فشل الاتصال بجداول Supabase. هل قمت بتشغيل السكربت البرمجي المرفق في قاعدة بياناتك؟');
    } finally {
      setIsLoading(false);
    }
  };

  // Connect manually with inputs
  const handleConnect = () => {
    if (!supabaseUrl || !supabaseKey) {
      setConnectionError('يرجى إدخال رابط URL ومفتاح Anon Key الخاص بـ Supabase');
      return;
    }

    try {
      initSupabase(supabaseUrl, supabaseKey);
      setIsConnected(true);
      setConnectionError(null);
      // Trigger data fetch after successful client initialization
      setTimeout(() => {
        fetchData();
      }, 300);
    } catch (err: any) {
      setIsConnected(false);
      setConnectionError(err.message || 'الرابط أو المفتاح غير صالح');
    }
  };

  // Seed demo data to Supabase if connected and table is empty
  const handleSeedDemoData = async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    setIsActionLoading(true);
    try {
      const demoRequests: WorkflowRequest[] = [
        {
          request_number: 'REQ-2026-0001',
          request_type: 'طلب إجازة',
          employee_name: 'أحمد محمود القاضي',
          employee_id: 'emp-1',
          department: 'إدارة الموارد البشرية',
          section: 'قسم الدعم والعمليات',
          request_date: '2026-07-05',
          request_time: '09:30',
          details: 'طلب إجازة اعتيادية سنوية مدتها 3 أيام نظراً لوجود ظروف عائلية طارئة.',
          attachments: 'medical_report.pdf',
          status: 'جديد'
        },
        {
          request_number: 'REQ-2026-0002',
          request_type: 'طلب ساعات إضافية',
          employee_name: 'إبراهيم حسن مرزوق',
          employee_id: 'emp-12',
          department: 'إدارة الإنتاج',
          section: 'قسم خطوط البثق',
          request_date: '2026-07-06',
          request_time: '14:00',
          details: 'عمل إضافي لمدة 4 ساعات لتغطية الوردية المسائية بسبب العجز في خط إنتاج الأغطية البلاستيكية.',
          attachments: 'overtime_form.png',
          status: 'مقبول',
          reviewer_name: 'سامح فريد عبد الباقي',
          decision_date: '2026-07-07',
          decision_time: '10:15'
        },
        {
          request_number: 'REQ-2026-0003',
          request_type: 'طلب سلفة',
          employee_name: 'فتحي محمود الشريف',
          employee_id: 'emp-13',
          department: 'إدارة الإنتاج',
          section: 'قسم خطوط البثق',
          request_date: '2026-07-07',
          request_time: '11:10',
          details: 'طلب سلفة مالية عاجلة بقيمة 2000 ج.م لظروف عائلية خاصة، على أن يتم تقسيطها على شهرين.',
          attachments: '',
          status: 'بانتظار المدير'
        }
      ];

      const { error: insertReqError } = await supabase
        .from('quds_workflow_requests')
        .insert(demoRequests);

      if (insertReqError) throw insertReqError;

      const demoLogs: WorkflowAuditLog[] = [
        {
          request_number: 'REQ-2026-0001',
          action: 'تقديم الطلب',
          user_name: 'أحمد محمود القاضي',
          details: 'قام بتقديم طلب إجازة جديد.'
        },
        {
          request_number: 'REQ-2026-0002',
          action: 'تقديم الطلب',
          user_name: 'إبراهيم حسن مرزوق',
          details: 'قام بتقديم طلب ساعات إضافية جديد.'
        },
        {
          request_number: 'REQ-2026-0002',
          action: 'الموافقة على الطلب',
          user_name: 'سامح فريد عبد الباقي',
          details: 'تمت الموافقة على الساعات الإضافية من قبل المدير المالي.'
        },
        {
          request_number: 'REQ-2026-0003',
          action: 'تقديم الطلب',
          user_name: 'فتحي محمود الشريف',
          details: 'قام بتقديم طلب سلفة جديد بقيمة 2000 ج.م.'
        }
      ];

      await supabase.from('quds_workflow_logs').insert(demoLogs);

      const demoNotifs: WorkflowNotification[] = [
        {
          employee_id: 'emp-12',
          message: 'تمت الموافقة على طلب الساعات الإضافية الخاص بك رقم REQ-2026-0002.',
          is_read: false
        }
      ];

      await supabase.from('quds_workflow_notifications').insert(demoNotifs);

      // Refresh data
      await fetchData();
      alert('تم إدخال البيانات التجريبية الحقيقية بنجاح!');
    } catch (err: any) {
      console.error('Error seeding data:', err);
      alert(`فشل إدخال البيانات: ${err.message || err.details || JSON.stringify(err)}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Fetch on mount
  useEffect(() => {
    if (isConnected) {
      fetchData();
    }
  }, [isConnected]);

  // Submit New Request to Supabase
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) {
      alert('الرجاء التأكد من تهيئة اتصال Supabase أولاً.');
      return;
    }

    if (!formEmployeeId) {
      alert('الرجاء اختيار الموظف أولاً.');
      return;
    }

    if (!formDetails.trim()) {
      alert('الرجاء إدخال تفاصيل الطلب.');
      return;
    }

    setIsActionLoading(true);

    try {
      // Find selected employee object
      const emp = employeesList.find(e => e.id === formEmployeeId);
      if (!emp) throw new Error('الموظف المختار غير موجود.');

      const dept = departmentsList.find(d => d.id === emp.department_id);
      const departmentName = dept ? dept.name : 'الإدارة العامة';
      const sectionName = emp.section || 'القسم الرئيسي';

      // Generate Auto Request Number
      const dateCode = formDate.replace(/-/g, '');
      const serial = Math.floor(1000 + Math.random() * 9000);
      const requestNumber = `REQ-${dateCode}-${serial}`;

      const newRequest: WorkflowRequest = {
        request_number: requestNumber,
        request_type: formRequestType,
        employee_name: emp.name,
        employee_id: emp.id,
        department: departmentName,
        section: sectionName,
        request_date: formDate,
        request_time: formTime,
        details: formDetails,
        attachments: formAttachment || null,
        status: 'جديد'
      };

      // 1. Insert Request into Supabase
      const { data, error } = await supabase
        .from('quds_workflow_requests')
        .insert([newRequest])
        .select();

      if (error) throw error;

      // 2. Insert into quds_workflow_logs
      const newLog: WorkflowAuditLog = {
        request_number: requestNumber,
        action: 'تقديم الطلب',
        user_name: emp.name,
        details: `تم إنشاء وتقديم طلب [${formRequestType}] جديد رقم ${requestNumber}.`
      };
      await supabase.from('quds_workflow_logs').insert([newLog]);

      // 3. Notification to HR Officer (Write to notifications table for HR roles, e.g. emp-1)
      const hrNotification: WorkflowNotification = {
        employee_id: 'emp-1', // Default HR manager
        message: `طلب جديد وارد: ${formRequestType} من الموظف ${emp.name} برقم ${requestNumber}`,
        is_read: false
      };
      await supabase.from('quds_workflow_notifications').insert([hrNotification]);

      // 4. Log to company general AuditLog
      addAuditLog(
        currentUser.id || 'emp-system',
        currentUser.name,
        'SUBMIT_WORKFLOW_REQUEST',
        'نظام الـ Workflow',
        'quds_workflow_requests',
        requestNumber,
        '',
        JSON.stringify(newRequest)
      );

      // Reset form fields
      setFormDetails('');
      setFormAttachment('');
      
      // Refresh database records
      await fetchData();
      
      alert(`تم تقديم الطلب بنجاح برقم: ${requestNumber}`);
    } catch (err: any) {
      console.error('Error creating request:', err);
      alert(`فشل إنشاء الطلب: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Decision (Accept / Reject)
  const handleDecision = async (status: 'مقبول' | 'مرفوض', reason?: string) => {
    const supabase = getSupabase();
    if (!supabase || !selectedRequest) return;

    setIsActionLoading(true);

    try {
      const decisionDate = new Date().toISOString().split('T')[0];
      const decisionTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false });

      // 1. Update status and reviewer details in Supabase
      const { error } = await supabase
        .from('quds_workflow_requests')
        .update({
          status: status,
          reviewer_name: currentUser.name,
          decision_date: decisionDate,
          decision_time: decisionTime,
          rejection_reason: reason || null
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      // 2. Insert decision log
      const decisionLog: WorkflowAuditLog = {
        request_number: selectedRequest.request_number,
        action: status === 'مقبول' ? 'اعتماد وقبول' : 'رفض الطلب',
        user_name: currentUser.name,
        details: status === 'مقبول' 
          ? `تمت الموافقة على الطلب بواسطة ${currentUser.name}.`
          : `تم رفض الطلب بسبب: ${reason || 'لم يذكر'}`
      };
      await supabase.from('quds_workflow_logs').insert([decisionLog]);

      // 3. Send Notification to Employee
      const employeeNotification: WorkflowNotification = {
        employee_id: selectedRequest.employee_id,
        message: `تم ${status === 'مقبول' ? 'قبول' : 'رفض'} طلبك رقم ${selectedRequest.request_number} [${selectedRequest.request_type}] من قبل ${currentUser.name}.` + (reason ? ` السبب: ${reason}` : ''),
        is_read: false
      };
      await supabase.from('quds_workflow_notifications').insert([employeeNotification]);

      // 4. Record to general AuditLog
      addAuditLog(
        currentUser.id,
        currentUser.name,
        status === 'مقبول' ? 'APPROVE_WORKFLOW_REQUEST' : 'REJECT_WORKFLOW_REQUEST',
        'نظام الـ Workflow',
        'quds_workflow_requests',
        selectedRequest.request_number,
        JSON.stringify({ status: selectedRequest.status }),
        JSON.stringify({ status, reviewer_name: currentUser.name, decision_date: decisionDate, decision_time: decisionTime, rejection_reason: reason })
      );

      // Update local view
      setSelectedRequest({
        ...selectedRequest,
        status: status,
        reviewer_name: currentUser.name,
        decision_date: decisionDate,
        decision_time: decisionTime,
        rejection_reason: reason || null
      });

      setShowRejectModal(false);
      setRejectionReason('');
      await fetchData();
      alert(`تم تسجيل قرار ${status === 'مقبول' ? 'القبول' : 'الرفض'} بنجاح!`);
    } catch (err: any) {
      console.error('Error recording decision:', err);
      alert(`فشل تسجيل القرار: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Update request status (Under Review / Waiting for Manager / Cancelled / Completed)
  const handleUpdateStatus = async (status: 'جديد' | 'قيد المراجعة' | 'بانتظار المدير' | 'ملغي' | 'مكتمل') => {
    const supabase = getSupabase();
    if (!supabase || !selectedRequest) return;

    setIsActionLoading(true);

    try {
      const { error } = await supabase
        .from('quds_workflow_requests')
        .update({ status: status })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      // Log action
      const logEntry: WorkflowAuditLog = {
        request_number: selectedRequest.request_number,
        action: `تحديث الحالة إلى ${status}`,
        user_name: currentUser.name,
        details: `قام المسؤول ${currentUser.name} بتعديل حالة الطلب إلى [${status}].`
      };
      await supabase.from('quds_workflow_logs').insert([logEntry]);

      // Notify employee
      const notif: WorkflowNotification = {
        employee_id: selectedRequest.employee_id,
        message: `تم تحديث حالة طلبك رقم ${selectedRequest.request_number} إلى [${status}].`,
        is_read: false
      };
      await supabase.from('quds_workflow_notifications').insert([notif]);

      // Audit Log
      addAuditLog(
        currentUser.id,
        currentUser.name,
        'UPDATE_REQUEST_STATUS',
        'نظام الـ Workflow',
        'quds_workflow_requests',
        selectedRequest.request_number,
        selectedRequest.status,
        status
      );

      setSelectedRequest({ ...selectedRequest, status: status });
      await fetchData();
      alert(`تم تحديث حالة الطلب إلى [${status}] بنجاح!`);
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert(`فشل تحديث الحالة: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete Request (for Admin/HR)
  const handleDeleteRequest = async (req: WorkflowRequest) => {
    const supabase = getSupabase();
    if (!supabase) return;

    if (!window.confirm(`هل أنت متأكد من حذف الطلب رقم ${req.request_number} نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      return;
    }

    setIsActionLoading(true);

    try {
      const { error } = await supabase
        .from('quds_workflow_requests')
        .delete()
        .eq('id', req.id);

      if (error) throw error;

      // Log general AuditLog
      addAuditLog(
        currentUser.id,
        currentUser.name,
        'DELETE_WORKFLOW_REQUEST',
        'نظام الـ Workflow',
        'quds_workflow_requests',
        req.request_number,
        JSON.stringify(req),
        ''
      );

      if (selectedRequest?.id === req.id) {
        setSelectedRequest(null);
      }

      await fetchData();
      alert('تم حذف السجل بنجاح من قاعدة البيانات.');
    } catch (err: any) {
      console.error('Error deleting request:', err);
      alert(`فشل الحذف: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Drag and drop attachment simulator helpers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      simulateFileUpload(files[0].name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      simulateFileUpload(files[0].name);
    }
  };

  const simulateFileUpload = (fileName: string) => {
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setFormAttachment(fileName);
          setTimeout(() => setUploadProgress(null), 800);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  // Filter requests based on criteria
  const filteredRequests = requests.filter(req => {
    const matchesEmployee = searchEmployee === '' || 
      req.employee_name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      req.employee_id.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      req.request_number.toLowerCase().includes(searchEmployee.toLowerCase());

    const matchesDept = filterDepartment === '' || req.department === filterDepartment;
    const matchesSection = filterSection === '' || req.section.toLowerCase().includes(filterSection.toLowerCase());
    const matchesType = filterType === '' || req.request_type === filterType;
    const matchesStatus = filterStatus === '' || req.status === filterStatus;
    const matchesDate = filterDate === '' || req.request_date === filterDate;

    return matchesEmployee && matchesDept && matchesSection && matchesType && matchesStatus && matchesDate;
  });

  // Calculate Stats / KPIs
  const totalCount = requests.length;
  const newCount = requests.filter(r => r.status === 'جديد').length;
  const reviewCount = requests.filter(r => r.status === 'قيد المراجعة').length;
  const acceptedCount = requests.filter(r => r.status === 'مقبول' || r.status === 'مكتمل').length;
  const rejectedCount = requests.filter(r => r.status === 'مرفوض').length;

  // Calculate Average Processing Time in hours
  const getAverageProcessingTime = () => {
    const resolvedRequests = requests.filter(
      r => (r.status === 'مقبول' || r.status === 'مرفوض' || r.status === 'مكتمل') && r.decision_date && r.request_date
    );

    if (resolvedRequests.length === 0) return '0 ساعة';

    let totalHours = 0;
    resolvedRequests.forEach(r => {
      try {
        const reqDate = new Date(`${r.request_date}T${r.request_time || '09:00'}`);
        const decDate = new Date(`${r.decision_date}T${r.decision_time || '12:00'}`);
        const diffMs = decDate.getTime() - reqDate.getTime();
        const diffHours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
        totalHours += diffHours;
      } catch (err) {
        totalHours += 24; // Default fallback 1 day
      }
    });

    const average = Math.round(totalHours / resolvedRequests.length);
    if (average >= 24) {
      return `${(average / 24).toFixed(1)} يوم`;
    }
    return `${average} ساعة`;
  };

  return (
    <div className="space-y-6 animate-fade-in text-right" dir="rtl">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg">
            <FileCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">نظام الـ Workflow وإدارة الطلبات الموحد</h1>
            <p className="text-xs text-slate-500 mt-1">إدارة واعتماد كافة طلبات موظفي وعمال مصنع القدس للتقنيات البلاستيكية عبر نظام Supabase السحابي المباشر.</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={fetchData}
            disabled={!isConnected || isLoading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
            title="تحديث البيانات"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث فوري</span>
          </button>
        </div>
      </div>

      {/* Supabase Connection Status Banner */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isConnected 
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
          : 'bg-amber-50 border-amber-200 text-amber-950'
      }`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Database className={`h-5 w-5 ${isConnected ? 'text-emerald-600' : 'text-amber-600'}`} />
              <h3 className="font-bold text-sm">
                {isConnected 
                  ? 'تم الاتصال بقاعدة بيانات Supabase بنجاح! جميع العمليات نشطة ومؤمنة بالكامل.' 
                  : 'تنبيه: لم يتم ربط تطبيق Quds HR بقاعدة بيانات Supabase السحابية حتى الآن.'}
              </h3>
            </div>
            <p className="text-xs opacity-90 leading-relaxed">
              {isConnected 
                ? `رابط قاعدة البيانات المتصلة حالياً: ${supabaseUrl}`
                : 'يتطلب هذا النظام الاتصال بـ Supabase لحفظ الطلبات والسجلات والإشعارات بشكل فوري بدون Mock Data أو Local Storage. يرجى إدخال بيانات الاتصال أدناه أو إضافتها في ملف الـ Environment.'}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className="px-3 py-1.5 text-[11px] font-bold bg-slate-800 text-slate-100 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            >
              {showSqlGuide ? 'إخفاء دليل الـ SQL 🛠️' : 'عرض سكربت تهيئة الجداول SQL 🛠️'}
            </button>
            {!isConnected && (
              <button
                onClick={handleConnect}
                className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all cursor-pointer"
              >
                ربط اتصال Supabase
              </button>
            )}
            {isConnected && (
              <button
                onClick={handleSeedDemoData}
                disabled={isActionLoading}
                className="px-3.5 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="h-3 w-3" />
                <span>شحن بيانات تجريبية حقيقية</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Connection Inputs if not connected or when showing settings */}
        {(!isConnected || connectionError) && (
          <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5">
              <label className="block text-[10px] font-bold text-slate-500 mb-1">SUPABASE_URL (رابط مشروع Supabase)</label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
              />
            </div>
            <div className="md:col-span-5">
              <label className="block text-[10px] font-bold text-slate-500 mb-1">SUPABASE_ANON_KEY (المفتاح العام Anon Key)</label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
              />
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                onClick={handleConnect}
                className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg cursor-pointer transition-all"
              >
                حفظ واتصال ⚡
              </button>
            </div>
          </div>
        )}

        {connectionError && (
          <div className="mt-2.5 text-xs text-rose-600 font-bold flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{connectionError}</span>
          </div>
        )}

        {/* SQL Guide Dropdown */}
        {showSqlGuide && (
          <div className="mt-4 p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 space-y-3 font-mono text-left animate-fade-in" dir="ltr">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs text-blue-400 font-bold font-sans text-right" dir="rtl">💡 قم بنسخ هذا الكود وتشغيله في محرّر SQL بموقع Supabase لتهيئة الجداول:</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(SQL_SCHEMA);
                  alert('تم نسخ كود SQL بنجاح!');
                }}
                className="px-2 py-1 bg-slate-800 text-xs hover:bg-slate-700 rounded text-slate-200 font-sans"
              >
                Copy SQL
              </button>
            </div>
            <pre className="text-[10px] overflow-x-auto max-h-[180px] p-2 bg-slate-950 rounded text-slate-300 select-all">
              {SQL_SCHEMA}
            </pre>
          </div>
        )}
      </div>

      {/* KPI Stats Panel - Bento Style */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* 1. New requests */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-slate-400">الطلبات الجديدة</span>
            <span className="block text-xl font-black text-slate-800 mt-1 font-mono">{newCount}</span>
            <span className="block text-[9px] text-blue-600 mt-1 font-medium">بانتظار المراجعة</span>
          </div>
          <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Bell className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* 2. Under Review */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-slate-400">قيد المراجعة</span>
            <span className="block text-xl font-black text-amber-600 mt-1 font-mono">{reviewCount}</span>
            <span className="block text-[9px] text-slate-500 mt-1 font-medium">جاري فحص المستندات</span>
          </div>
          <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
            <Clock className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* 3. Accepted */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-slate-400">المقبولة والمكتملة</span>
            <span className="block text-xl font-black text-emerald-600 mt-1 font-mono">{acceptedCount}</span>
            <span className="block text-[9px] text-emerald-700 mt-1 font-medium">تم إصدار القرار</span>
          </div>
          <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <CheckCircle className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* 4. Rejected */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-slate-400">الطلبات المرفوضة</span>
            <span className="block text-xl font-black text-rose-600 mt-1 font-mono">{rejectedCount}</span>
            <span className="block text-[9px] text-rose-700 mt-1 font-medium">مع ذكر الأسباب</span>
          </div>
          <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center shrink-0">
            <XCircle className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* 5. Processing Time */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between col-span-2 md:col-span-1">
          <div>
            <span className="block text-[10px] text-slate-400 font-bold">متوسط وقت المعالجة</span>
            <span className="block text-lg font-black text-blue-400 mt-1 font-mono">{isConnected ? getAverageProcessingTime() : '—'}</span>
            <span className="block text-[9px] text-slate-300 mt-1 font-medium">من التقديم إلى القرار</span>
          </div>
          <div className="w-9 h-9 bg-slate-800 text-blue-400 rounded-lg flex items-center justify-center shrink-0">
            <Shield className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Search/Filter + Table List (Right/Left Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Requests List & Filtering (8 Columns) */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          
          {/* Advanced Search & Filtering Block */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Filter className="h-4 w-4 text-slate-400" />
                <span>محرك البحث المتقدم والفلترة</span>
              </div>
              <button 
                onClick={() => {
                  setSearchEmployee('');
                  setFilterDepartment('');
                  setFilterSection('');
                  setFilterType('');
                  setFilterStatus('');
                  setFilterDate('');
                }}
                className="text-[10px] text-blue-600 hover:underline cursor-pointer"
              >
                تصفير الفلاتر
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {/* Search text */}
              <div className="col-span-2">
                <label className="block text-[9px] font-bold text-slate-400 mb-0.5">البحث بالمقاطع</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchEmployee}
                    onChange={(e) => setSearchEmployee(e.target.value)}
                    placeholder="رقم الطلب، اسم الموظف..."
                    className="w-full text-xs p-1.5 pr-7 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 mb-0.5">الإدارة</label>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                >
                  <option value="">الكل</option>
                  {departmentsList.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Request Type */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 mb-0.5">نوع الطلب</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                >
                  <option value="">الكل</option>
                  {requestTypes.map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 mb-0.5">حالة الطلب</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                >
                  <option value="">الكل</option>
                  <option value="جديد">جديد</option>
                  <option value="قيد المراجعة">قيد المراجعة</option>
                  <option value="بانتظار المدير">بانتظار المدير</option>
                  <option value="مقبول">مقبول</option>
                  <option value="مرفوض">مرفوض</option>
                  <option value="ملغي">ملغي</option>
                  <option value="مكتمل">مكتمل</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 mb-0.5">التاريخ</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full text-xs p-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Requests Table Panel */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <h3 className="font-bold text-xs md:text-sm text-slate-800">سجل وسير الطلبات النشطة</h3>
              <span className="text-[10px] font-bold text-slate-500 font-mono bg-white px-2 py-0.5 rounded border">
                النتائج المفلترة: {filteredRequests.length} طلب
              </span>
            </div>

            <div className="overflow-x-auto">
              {!isConnected ? (
                <div className="py-12 text-center text-slate-400">
                  <Database className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold">بانتظار ربط اتصال Supabase لتغذية البيانات وعرض الجدول</p>
                </div>
              ) : isLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-2 animate-spin" />
                  <p className="text-xs">جاري تحميل سجلات الطلبات من Supabase السحابي...</p>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <FileCheck className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs font-bold">لم يتم العثور على أي طلبات تطابق معايير الفلترة المحددة</p>
                </div>
              ) : (
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 font-bold border-b border-slate-200 h-9">
                      <th className="p-3 font-bold">رقم الطلب</th>
                      <th className="p-3 font-bold">الموظف / الإدارة</th>
                      <th className="p-3 font-bold">نوع الطلب</th>
                      <th className="p-3 font-bold">تاريخ و وقت الطلب</th>
                      <th className="p-3 font-bold">حالة الطلب</th>
                      <th className="p-3 font-bold text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 divide-y divide-slate-100">
                    {filteredRequests.map(req => (
                      <tr 
                        key={req.id} 
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          selectedRequest?.id === req.id ? 'bg-blue-50/40 hover:bg-blue-50/60' : ''
                        }`}
                        onClick={() => {
                          setSelectedRequest(req);
                          setRightPanelTab('details');
                        }}
                      >
                        {/* Req Number */}
                        <td className="p-3 font-mono font-bold text-slate-800">{req.request_number}</td>
                        {/* Employee */}
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{req.employee_name}</div>
                          <div className="text-[10px] text-slate-400">{req.department} • {req.section}</div>
                        </td>
                        {/* Request Type */}
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px]">
                            {req.request_type}
                          </span>
                        </td>
                        {/* Date and Time */}
                        <td className="p-3">
                          <div className="font-mono">{req.request_date}</div>
                          <div className="font-mono text-[10px] text-slate-400">{req.request_time || '12:00'}</div>
                        </td>
                        {/* Status badge */}
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border ${
                            req.status === 'جديد'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : req.status === 'قيد المراجعة'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : req.status === 'بانتظار المدير'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : req.status === 'مقبول'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : req.status === 'مرفوض'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : req.status === 'ملغي'
                              ? 'bg-slate-100 text-slate-600 border-slate-300'
                              : 'bg-teal-50 text-teal-800 border-teal-200'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setRightPanelTab('details');
                              }}
                              className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                              title="عرض التفاصيل"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            {(currentUser.role_id === 'role-admin' || currentUser.role_id === 'role-hr') && (
                              <button
                                onClick={() => handleDeleteRequest(req)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                                title="حذف الطلب نهائياً"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed panel (Create / Details / Audit Trail) (4 Columns) */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col min-h-[480px]">
            {/* Header Tabs */}
            <div className="grid grid-cols-3 text-center border-b border-slate-150 bg-slate-50 text-xs font-bold">
              <button
                onClick={() => setRightPanelTab('create')}
                className={`py-3 border-l border-slate-150 cursor-pointer ${
                  rightPanelTab === 'create' ? 'bg-white text-blue-600 font-bold border-b-2 border-b-blue-600' : 'text-slate-500 hover:bg-slate-100/50'
                }`}
              >
                تقديم طلب 📝
              </button>
              <button
                onClick={() => setRightPanelTab('details')}
                className={`py-3 border-l border-slate-150 cursor-pointer ${
                  rightPanelTab === 'details' ? 'bg-white text-blue-600 font-bold border-b-2 border-b-blue-600' : 'text-slate-500 hover:bg-slate-100/50'
                }`}
              >
                تفاصيل الطلب 🔍
              </button>
              <button
                onClick={() => setRightPanelTab('logs')}
                className={`py-3 cursor-pointer ${
                  rightPanelTab === 'logs' ? 'bg-white text-blue-600 font-bold border-b-2 border-b-blue-600' : 'text-slate-500 hover:bg-slate-100/50'
                }`}
              >
                سجل وسير العمليات 📜
              </button>
            </div>

            {/* Panel Body Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              
              {/* Tab 1: Create Request Form */}
              {rightPanelTab === 'create' && (
                <form onSubmit={handleCreateRequest} className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
                      <span>تعبئة مستند طلب جديد بالمصنع</span>
                    </div>

                    {/* Employee Picker */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">اسم الموظف أو العامل المتقدم</label>
                      <select
                        value={formEmployeeId}
                        onChange={(e) => setFormEmployeeId(e.target.value)}
                        required
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                      >
                        <option value="">-- اختر الموظف من السجلات --</option>
                        {employeesList.map(e => (
                          <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                        ))}
                      </select>
                      {formEmployeeId && (
                        <div className="mt-1.5 text-[9px] text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          {(() => {
                            const emp = employeesList.find(e => e.id === formEmployeeId);
                            if (emp) {
                              const dept = departmentsList.find(d => d.id === emp.department_id);
                              return `الرقم الوظيفي: ${emp.employee_no || emp.id} • الإدارة: ${dept ? dept.name : 'العامة'} • القسم: ${emp.section || 'خط الإنتاج'}`;
                            }
                            return '';
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Request Type */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">نوع المعاملة / الطلب</label>
                      <select
                        value={formRequestType}
                        onChange={(e) => setFormRequestType(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600 font-bold text-slate-800"
                      >
                        {requestTypes.map((t, idx) => (
                          <option key={idx} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date and Time inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">تاريخ الطلب</label>
                        <input
                          type="date"
                          value={formDate}
                          onChange={(e) => setFormDate(e.target.value)}
                          required
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">وقت التقديم</label>
                        <input
                          type="time"
                          value={formTime}
                          onChange={(e) => setFormTime(e.target.value)}
                          required
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600 font-mono"
                        />
                      </div>
                    </div>

                    {/* Request Details */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">شرح وتفاصيل الطلب الكاملة</label>
                      <textarea
                        value={formDetails}
                        onChange={(e) => setFormDetails(e.target.value)}
                        placeholder="يرجى كتابة كافة الأسباب والتفاصيل الهامة لطلبك هنا..."
                        rows={4}
                        required
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600 leading-relaxed"
                      />
                    </div>

                    {/* Drag and Drop Attachments */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">المرفقات والمستندات الثبوتية</label>
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-3.5 text-center transition-all cursor-pointer ${
                          isDragging 
                            ? 'border-blue-600 bg-blue-50/40' 
                            : 'border-slate-200 hover:border-blue-400 bg-slate-50'
                        }`}
                      >
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer space-y-1 block">
                          <Paperclip className="h-5 w-5 text-slate-400 mx-auto" />
                          <div className="text-[10px] font-bold text-slate-600">
                            {formAttachment ? `تم إرفاق: ${formAttachment}` : 'اسحب وأفلت المرفق هنا أو تصفح ملفاتك'}
                          </div>
                          <p className="text-[9px] text-slate-400 font-medium">يدعم مستندات PDF والصور وصيغ الأوفيس</p>
                        </label>
                      </div>

                      {uploadProgress !== null && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-slate-500">
                            <span>جاري رفع المرفق...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isActionLoading || !isConnected}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>إرسال الطلب واعتماده بالـ Supabase</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 2: Selected Request Details View */}
              {rightPanelTab === 'details' && (
                <div className="flex-1 flex flex-col justify-between space-y-5">
                  {selectedRequest ? (
                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[380px] pr-1">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-black text-slate-900 font-mono">الطلب رقم: {selectedRequest.request_number}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border ${
                          selectedRequest.status === 'جديد'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : selectedRequest.status === 'قيد المراجعة'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : selectedRequest.status === 'بانتظار المدير'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : selectedRequest.status === 'مقبول'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : selectedRequest.status === 'مرفوض'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : selectedRequest.status === 'ملغي'
                            ? 'bg-slate-100 text-slate-600 border-slate-300'
                            : 'bg-teal-50 text-teal-800 border-teal-200'
                        }`}>
                          {selectedRequest.status}
                        </span>
                      </div>

                      {/* Request Details Block */}
                      <div className="space-y-2.5 text-xs text-slate-700">
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                          <p className="font-bold text-slate-500 text-[10px]">الموظف المتقدم</p>
                          <p className="font-bold text-slate-900">{selectedRequest.employee_name}</p>
                          <p className="text-[10px] text-slate-400">الرقم الوظيفي: {selectedRequest.employee_id}</p>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                          <p className="font-bold text-slate-500 text-[10px]">الإدارة والقسم بمصنع السادات</p>
                          <p className="font-bold text-slate-900">{selectedRequest.department} • {selectedRequest.section}</p>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                          <p className="font-bold text-slate-500 text-[10px]">نوع الطلب وتفاصيله</p>
                          <p className="font-black text-slate-800">{selectedRequest.request_type}</p>
                          <p className="text-slate-600 leading-relaxed font-medium mt-1">{selectedRequest.details}</p>
                        </div>

                        {selectedRequest.attachments && (
                          <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100 flex items-center justify-between">
                            <span className="font-mono text-[10px] text-blue-800 font-bold truncate max-w-[150px]">{selectedRequest.attachments}</span>
                            <a 
                              href="#" 
                              onClick={(e) => { e.preventDefault(); alert(`جاري تنزيل المرفق: ${selectedRequest.attachments}`); }}
                              className="text-[10px] text-blue-600 hover:underline font-bold"
                            >
                              عرض المرفق 📥
                            </a>
                          </div>
                        )}

                        {/* Review decision detail if present */}
                        {selectedRequest.reviewer_name && (
                          <div className={`p-3 rounded-lg border space-y-1.5 ${
                            selectedRequest.status === 'مقبول' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                          }`}>
                            <p className="font-bold text-[10px] text-slate-500">قرار الإدارة والمسؤولية</p>
                            <p className="font-bold text-slate-800">
                              تم الاعتماد بقرار: <span className={selectedRequest.status === 'مقبول' ? 'text-emerald-700' : 'text-rose-700'}>{selectedRequest.status}</span>
                            </p>
                            <p className="text-[10px]">بواسطة المسؤول: <span className="font-bold text-slate-900">{selectedRequest.reviewer_name}</span></p>
                            <p className="text-[10px] font-mono">تاريخ القرار: {selectedRequest.decision_date} {selectedRequest.decision_time}</p>
                            {selectedRequest.rejection_reason && (
                              <p className="text-[10px] font-bold text-rose-800 bg-white/60 p-1.5 rounded border border-rose-100 mt-1">سبب الرفض: {selectedRequest.rejection_reason}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Approval/Rejection buttons for HR & Managers */}
                      {(selectedRequest.status === 'جديد' || selectedRequest.status === 'قيد المراجعة' || selectedRequest.status === 'بانتظار المدير') && 
                       (currentUser.role_id === 'role-admin' || currentUser.role_id === 'role-hr' || currentUser.role_id === 'role-manager') && (
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 mb-1.5">اتخاذ قرار فوري واعتماده بالـ Supabase:</p>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleDecision('مقبول')}
                              disabled={isActionLoading}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>قبول واعتماد</span>
                            </button>
                            <button
                              onClick={() => setShowRejectModal(true)}
                              disabled={isActionLoading}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>رفض مع ذكر سبب</span>
                            </button>
                          </div>

                          {/* Quick statuses */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => handleUpdateStatus('قيد المراجعة')}
                              className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] py-1.5 rounded font-bold cursor-pointer transition-all"
                            >
                              وضع قيد المراجعة 🕒
                            </button>
                            <button
                              onClick={() => handleUpdateStatus('بانتظار المدير')}
                              className="bg-purple-100 hover:bg-purple-200 text-purple-900 text-[10px] py-1.5 rounded font-bold cursor-pointer transition-all"
                            >
                              بانتظار قرار المدير 👤
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-slate-400">
                      <Eye className="h-10 w-10 text-slate-200 mb-2" />
                      <p className="text-xs font-bold leading-relaxed">يرجى تحديد طلب من قائمة السجلات باليسار<br />لعرض تفاصيله ومعالجته هنا</p>
                    </div>
                  )}

                  {/* Reject Reason input modal inline */}
                  {showRejectModal && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-3 mt-3">
                      <label className="block text-[10px] font-bold text-rose-900">أدخل سبب رفض هذا المستند رسمياً:</label>
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="مثال: عدم استكمال مسوغات التقديم أو الـ Attachments..."
                        required
                        className="w-full text-xs p-2 bg-white border border-rose-200 rounded-lg focus:outline-rose-600"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (!rejectionReason.trim()) {
                              alert('الرجاء كتابة سبب الرفض.');
                              return;
                            }
                            handleDecision('مرفوض', rejectionReason);
                          }}
                          className="flex-1 text-xs font-bold bg-rose-600 text-white py-1.5 rounded-lg cursor-pointer"
                        >
                          تأكيد الرفض 🚫
                        </button>
                        <button
                          onClick={() => setShowRejectModal(false)}
                          className="px-3 text-xs bg-slate-200 text-slate-700 py-1.5 rounded-lg cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Realtime Logs (Audit Trail) */}
              {rightPanelTab === 'logs' && (
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Shield className="h-4.5 w-4.5 text-slate-400" />
                      <span>سجل سير العمليات وتتبع التعديلات</span>
                    </div>

                    {!isConnected ? (
                      <div className="py-12 text-center text-slate-300 text-xs font-bold">بانتظار الاتصال بـ Supabase</div>
                    ) : logs.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs font-medium">لا توجد عمليات مسجلة بالـ Log حتى الآن</div>
                    ) : (
                      <div className="space-y-3">
                        {logs.slice(0, 7).map(log => {
                          let actionColor = 'text-slate-600 bg-slate-50 border-slate-200';
                          if (log.action.includes('تقديم')) actionColor = 'text-blue-700 bg-blue-50 border-blue-200';
                          else if (log.action.includes('قبول') || log.action.includes('اعتماد')) actionColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                          else if (log.action.includes('رفض')) actionColor = 'text-rose-700 bg-rose-50 border-rose-200';

                          return (
                            <div key={log.id} className="p-2.5 bg-white border border-slate-150 rounded-lg space-y-1 shadow-xs text-[11px] leading-relaxed">
                              <div className="flex justify-between items-center">
                                <span className="font-mono font-bold text-slate-800">{log.request_number}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${actionColor}`}>{log.action}</span>
                              </div>
                              <p className="font-bold text-slate-700">بواسطة: {log.user_name}</p>
                              <p className="text-slate-500">{log.details}</p>
                              <p className="text-[9px] font-mono text-slate-400 text-left mt-0.5">{log.created_at?.replace('T', ' ').slice(0, 16) || '2026-07-08'}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
