/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  FileText, 
  AlertCircle, 
  Info,
  CalendarCheck
} from 'lucide-react';
import { LeaveRequest, OvertimeRequest, Employee, User as UserType } from '../types';
import { 
  getLeaveRequests, 
  saveLeaveRequests, 
  getOvertimeRequests, 
  saveOvertimeRequests, 
  getEmployees,
  addAuditLog 
} from '../data';

interface LeaveAndOvertimeProps {
  currentUser: UserType;
}

export default function LeaveAndOvertime({ currentUser }: LeaveAndOvertimeProps) {
  const [employees] = useState<Employee[]>(() => getEmployees().filter(e => e.status === 'Active'));
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(getLeaveRequests());
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>(getOvertimeRequests());

  // Form toggles and states
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveEmpId, setLeaveEmpId] = useState('');
  const [leaveType, setLeaveType] = useState<LeaveRequest['leave_type']>('Annual');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [otEmpId, setOtEmpId] = useState('');
  const [otDate, setOtDate] = useState('');
  const [otHours, setOtHours] = useState(2);
  const [otMultiplier, setOtMultiplier] = useState(1.5);
  const [otReason, setOtReason] = useState('');

  // Permission settings: Admins and HR can approve/reject, as well as department managers
  const canApprove = currentUser.role_id === 'role-admin' || currentUser.role_id === 'role-hr' || currentUser.role_id === 'role-manager';

  // Get employee details
  const getEmpName = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    return emp ? emp.name : 'غير معروف';
  };

  // Convert English status/types to Arabic
  const translateLeaveType = (type: LeaveRequest['leave_type']) => {
    switch (type) {
      case 'Annual': return 'إجازة سنوية';
      case 'Sick': return 'إجازة مرضية';
      case 'Emergency': return 'إجازة طارئة / عارضة';
      case 'Maternity': return 'إجازة وضع / رعاية طفل';
      case 'Unpaid': return 'إجازة بدون مرتب';
      default: return type;
    }
  };

  const translateStatus = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'Pending': return 'قيد المراجعة';
      case 'Approved': return 'معتمدة ومقبولة';
      case 'Rejected': return 'مرفوضة';
      default: return status;
    }
  };

  // Handle Leave approval/rejection
  const handleLeaveAction = (id: string, newStatus: 'Approved' | 'Rejected') => {
    const updated = leaveRequests.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: newStatus,
          approved_by: currentUser.name,
          approved_at: new Date().toISOString()
        };
      }
      return req;
    });

    setLeaveRequests(updated);
    saveLeaveRequests(updated);

    // Seed attendance record as 'Leave' if approved for those dates
    const req = leaveRequests.find(r => r.id === id);
    if (req && newStatus === 'Approved') {
      try {
        const storedAtt = localStorage.getItem('quds_hr_attendance');
        const attendanceList = storedAtt ? JSON.parse(storedAtt) : [];
        
        // Loop over leave dates and add leave attendance logs
        const start = new Date(req.start_date);
        const end = new Date(req.end_date);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          // Check if already logged
          if (!attendanceList.some((a: any) => a.employee_id === req.employee_id && a.date === dateStr)) {
            attendanceList.push({
              id: 'att-auto-' + Date.now() + Math.random().toString(36).substr(2, 4),
              employee_id: req.employee_id,
              date: dateStr,
              clock_in: null,
              clock_out: null,
              status: 'Leave',
              delay_minutes: 0
            });
          }
        }
        localStorage.setItem('quds_hr_attendance', JSON.stringify(attendanceList));
      } catch (err) {
        console.error('Error writing auto leave attendance:', err);
      }
    }

    // Audit Log
    addAuditLog(
      currentUser.id,
      currentUser.name,
      `LEAVE_${newStatus.toUpperCase()}`,
      'الإجازات',
      'leave_requests',
      id,
      '{"status": "Pending"}',
      `{"status": "${newStatus}"}`
    );
  };

  // Submit Leave Request
  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveEmpId || !leaveStart || !leaveEnd || !leaveReason) return;

    // Calculate days count
    const d1 = new Date(leaveStart);
    const d2 = new Date(leaveEnd);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newRequest: LeaveRequest = {
      id: 'leave-' + Date.now(),
      employee_id: leaveEmpId,
      leave_type: leaveType,
      start_date: leaveStart,
      end_date: leaveEnd,
      days_count: daysCount,
      status: 'Pending',
      reason: leaveReason,
      approved_by: null,
      approved_at: null
    };

    const updated = [newRequest, ...leaveRequests];
    setLeaveRequests(updated);
    saveLeaveRequests(updated);

    addAuditLog(currentUser.id, currentUser.name, 'CREATE_LEAVE_REQUEST', 'الإجازات', 'leave_requests', newRequest.id, '', JSON.stringify(newRequest));

    // Reset fields
    setLeaveEmpId('');
    setLeaveType('Annual');
    setLeaveStart('');
    setLeaveEnd('');
    setLeaveReason('');
    setShowLeaveModal(false);
  };

  // Handle Overtime Action (approve/reject)
  const handleOvertimeAction = (id: string, newStatus: 'Approved' | 'Rejected') => {
    const updated = overtimeRequests.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: newStatus,
          approved_by: currentUser.name
        };
      }
      return req;
    });

    setOvertimeRequests(updated);
    saveOvertimeRequests(updated);

    addAuditLog(
      currentUser.id,
      currentUser.name,
      `OVERTIME_${newStatus.toUpperCase()}`,
      'الساعات الإضافية',
      'overtime_requests',
      id,
      '{"status": "Pending"}',
      `{"status": "${newStatus}"}`
    );
  };

  // Submit Overtime Request
  const handleOvertimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otEmpId || !otDate || !otHours || !otReason) return;

    const newRequest: OvertimeRequest = {
      id: 'ot-' + Date.now(),
      employee_id: otEmpId,
      date: otDate,
      hours: Number(otHours),
      multiplier: Number(otMultiplier),
      status: 'Pending',
      reason: otReason,
      approved_by: null
    };

    const updated = [newRequest, ...overtimeRequests];
    setOvertimeRequests(updated);
    saveOvertimeRequests(updated);

    addAuditLog(currentUser.id, currentUser.name, 'CREATE_OVERTIME_REQUEST', 'الساعات الإضافية', 'overtime_requests', newRequest.id, '', JSON.stringify(newRequest));

    // Reset fields
    setOtEmpId('');
    setOtDate('');
    setOtHours(2);
    setOtReason('');
    setShowOvertimeModal(false);
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Upper header banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-blue-900" />
            <span>طلب وإقرار الإجازات والإضافي</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة طلبات الإجازات السنوية والمرضية، وحساب ساعات العمل الإضافية (الأوفر تايم) المخصصة للعمال لإنجاز طلبيات خطوط الإنتاج البلاستيكية.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowLeaveModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>طلب إجازة</span>
          </button>
          <button
            onClick={() => setShowOvertimeModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>تكليف إضافي</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module 1: Leave Requests Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Calendar className="h-4.5 w-4.5 text-blue-900" />
                <span>طلبات الإجازة والغياب المصدق</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">الموظف</th>
                    <th className="p-4">النوع</th>
                    <th className="p-4 text-center">الأيام</th>
                    <th className="p-4">الفترة</th>
                    <th className="p-4 text-center">الحالة</th>
                    {canApprove && <th className="p-4 text-left">الاعتماد والتحكم</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaveRequests.length > 0 ? (
                    leaveRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{getEmpName(req.employee_id)}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]" title={req.reason}>السبب: {req.reason}</div>
                        </td>
                        <td className="p-4 text-slate-700 font-medium">{translateLeaveType(req.leave_type)}</td>
                        <td className="p-4 text-center font-bold text-blue-950">{req.days_count} يوم</td>
                        <td className="p-4 font-mono text-slate-600 leading-normal">
                          <div>من: {req.start_date}</div>
                          <div>إلى: {req.end_date}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            req.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                            req.status === 'Rejected' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                            'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {translateStatus(req.status)}
                          </span>
                        </td>
                        {canApprove && (
                          <td className="p-4 text-left">
                            {req.status === 'Pending' ? (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleLeaveAction(req.id, 'Approved')}
                                  className="p-1 text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                                  title="موافقة واعتماد الإجازة"
                                >
                                  <CheckCircle className="h-4.5 w-4.5" />
                                </button>
                                <button
                                  onClick={() => handleLeaveAction(req.id, 'Rejected')}
                                  className="p-1 text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                  title="رفض الطلب"
                                >
                                  <XCircle className="h-4.5 w-4.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[9px] text-slate-400 block font-semibold leading-none">باعتماد: {req.approved_by?.split(' ')[0]}</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        لا توجد طلبات إجازة مسجلة حالياً
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Module 2: Overtime Requests Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-blue-900" />
                <span>تكليفات وطلبات الساعات الإضافية (الأوفر تايم)</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">الموظف/العامل</th>
                    <th className="p-4">تاريخ العمل</th>
                    <th className="p-4 text-center">الساعات</th>
                    <th className="p-4 text-center">مضاعف الراتب</th>
                    <th className="p-4 text-center">الحالة</th>
                    {canApprove && <th className="p-4 text-left">التحكم</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overtimeRequests.length > 0 ? (
                    overtimeRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{getEmpName(req.employee_id)}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]" title={req.reason}>السبب: {req.reason}</div>
                        </td>
                        <td className="p-4 font-mono font-semibold text-slate-600">{req.date}</td>
                        <td className="p-4 text-center font-bold text-blue-950">{req.hours} ساعات</td>
                        <td className="p-4 text-center font-mono text-slate-600 font-bold">
                          {req.multiplier === 1.5 ? '1.5x (نهاري)' : '2.0x (ليلي/عطلة)'}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            req.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                            req.status === 'Rejected' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                            'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {req.status === 'Approved' ? 'معتمدة ومصروفة' : req.status === 'Rejected' ? 'مرفوضة' : 'قيد المراجعة'}
                          </span>
                        </td>
                        {canApprove && (
                          <td className="p-4 text-left">
                            {req.status === 'Pending' ? (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleOvertimeAction(req.id, 'Approved')}
                                  className="p-1 text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                                  title="موافقة واعتماد الإضافي"
                                >
                                  <CheckCircle className="h-4.5 w-4.5" />
                                </button>
                                <button
                                  onClick={() => handleOvertimeAction(req.id, 'Rejected')}
                                  className="p-1 text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                  title="رفض"
                                >
                                  <XCircle className="h-4.5 w-4.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[9px] text-slate-400 block font-semibold leading-none">باعتماد: {req.approved_by?.split(' ')[0]}</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        لا توجد طلبات إضافي مسجلة حالياً
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Modal: Request Leave (طلب إجازة جديدة) */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 text-right">
            <div className="bg-blue-950 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-1.5">
                <Calendar className="h-5 w-5" />
                <span>تقديم طلب إجازة رسمي</span>
              </h3>
              <button 
                onClick={() => setShowLeaveModal(false)}
                className="text-white hover:text-slate-200 cursor-pointer text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الموظف / العامل مقدم الطلب:</label>
                <select
                  required
                  value={leaveEmpId}
                  onChange={(e) => setLeaveEmpId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 bg-white"
                >
                  <option value="">-- اختر الموظف --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع الإجازة المطلوبة:</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 bg-white"
                >
                  <option value="Annual">إجازة سنوية اعتيادية (خصم من الرصيد)</option>
                  <option value="Sick">إجازة مرضية (بتقرير طبي)</option>
                  <option value="Emergency">إجازة طارئة / عارضة</option>
                  <option value="Maternity">إجازة وضع / رعاية طفل</option>
                  <option value="Unpaid">إجازة بدون مرتب</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ البدء:</label>
                  <input
                    type="date"
                    required
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ العودة للعمل:</label>
                  <input
                    type="date"
                    required
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مسببات الإجازة / شرح عذرك:</label>
                <textarea
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="نرجو توضيح السبب لمساعدتنا على سرعة مراجعة طلبك وإقراره..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900"
                ></textarea>
              </div>

              <div className="bg-blue-50/50 p-3 rounded-lg text-slate-500 text-[10px] flex gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-blue-900 mt-0.5" />
                <p>
                  بمجرد الاعتماد والموافقة، سيقوم النظام تلقائياً بجدولة الحسابات وحظر أيام الغياب لتفادي أي خصومات آلية من الرواتب.
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold shadow-xs transition-all cursor-pointer"
                >
                  تقديم طلب الإجازة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Overtime (تكليف إضافي جديد) */}
      {showOvertimeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 text-right">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-1.5">
                <Clock className="h-5 w-5" />
                <span>تكليف عمل إضافي رسمي</span>
              </h3>
              <button 
                onClick={() => setShowOvertimeModal(false)}
                className="text-white hover:text-slate-200 cursor-pointer text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleOvertimeSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المكلف بالعمل الإضافي (العامل):</label>
                <select
                  required
                  value={otEmpId}
                  onChange={(e) => setOtEmpId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 bg-white"
                >
                  <option value="">-- اختر الموظف --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ العمل الإضافي:</label>
                  <input
                    type="date"
                    required
                    value={otDate}
                    onChange={(e) => setOtDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مضاعف الحساب:</label>
                  <select
                    value={otMultiplier}
                    onChange={(e) => setOtMultiplier(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 bg-white font-mono"
                  >
                    <option value={1.5}>1.5x (أيام العمل العادية)</option>
                    <option value={2.0}>2.0x (العطلات الرسمية والليل المتأخر)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عدد الساعات الإضافية المقررة:</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={8}
                  value={otHours}
                  onChange={(e) => setOtHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سبب التكليف الاستثنائي بالعمل:</label>
                <textarea
                  required
                  value={otReason}
                  onChange={(e) => setOtReason(e.target.value)}
                  placeholder="مثال: زيادة طاقة خط الإنتاج لحقن القوالب لتلبية تسليمات شركة السادات للمياه..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900"
                ></textarea>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOvertimeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs transition-all cursor-pointer"
                >
                  تأكيد التكليف بالإضافي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
