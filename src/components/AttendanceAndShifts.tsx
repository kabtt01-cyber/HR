/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  UserX, 
  Shuffle, 
  Plus, 
  LogIn, 
  LogOut, 
  AlertCircle,
  Timer
} from 'lucide-react';
import { Attendance, Employee, Shift, User as UserType } from '../types';
import { 
  getAttendance, 
  saveAttendance, 
  getEmployees, 
  getShifts, 
  saveShifts,
  addAuditLog 
} from '../data';

interface AttendanceAndShiftsProps {
  currentUser: UserType;
}

export default function AttendanceAndShifts({ currentUser }: AttendanceAndShiftsProps) {
  const [employees] = useState<Employee[]>(() => getEmployees().filter(e => e.status === 'Active'));
  const [shifts, setShifts] = useState<Shift[]>(getShifts());
  const [attendance, setAttendance] = useState<Attendance[]>(getAttendance());

  // Simulation form states
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [clockTime, setClockTime] = useState('08:00');
  const [simDate, setSimDate] = useState('2026-07-08'); // Mock current date matching system
  
  // Can current user edit? (only Admins or HR)
  const canManage = currentUser.role_id === 'role-admin' || currentUser.role_id === 'role-hr';

  // Get employee name
  const getEmpName = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    return emp ? emp.name : 'غير معروف';
  };

  // Simulate Clock In
  const handleClockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !clockTime) return;

    // Check if employee already clocked in today
    const existing = attendance.find(a => a.employee_id === selectedEmpId && a.date === simDate);
    if (existing && existing.clock_in) {
      alert('هذا الموظف قام بتسجيل الحضور بالفعل اليوم!');
      return;
    }

    // Calculate delay (Shift 1 starts at 08:00)
    const [h, m] = clockTime.split(':').map(Number);
    const shiftStartHour = 8;
    const shiftStartMin = 0;
    
    let delayMinutes = 0;
    let status: Attendance['status'] = 'On Time';

    const diffInMinutes = (h * 60 + m) - (shiftStartHour * 60 + shiftStartMin);
    if (diffInMinutes > 0) {
      delayMinutes = diffInMinutes;
      status = 'Late';
    }

    if (existing) {
      // Update existing record (maybe they were marked absent or on leave, but turned up)
      const updated = attendance.map(a => {
        if (a.id === existing.id) {
          return {
            ...a,
            clock_in: clockTime,
            status: status,
            delay_minutes: delayMinutes
          };
        }
        return a;
      });
      setAttendance(updated);
      saveAttendance(updated);
    } else {
      // Create new record
      const newRecord: Attendance = {
        id: 'att-' + Date.now(),
        employee_id: selectedEmpId,
        date: simDate,
        clock_in: clockTime,
        clock_out: null,
        status: status,
        delay_minutes: delayMinutes
      };
      const updated = [...attendance, newRecord];
      setAttendance(updated);
      saveAttendance(updated);
    }

    // Log Audit
    addAuditLog(
      currentUser.id,
      currentUser.name,
      'CLOCK_IN_SIMULATION',
      'الحضور والانصراف',
      'attendance',
      selectedEmpId,
      '',
      `{"clock_in": "${clockTime}", "status": "${status}", "delay": ${delayMinutes}}`
    );

    // Reset Selector
    setSelectedEmpId('');
  };

  // Simulate Clock Out
  const handleClockOut = (empId: string) => {
    const todayLog = attendance.find(a => a.employee_id === empId && a.date === simDate);
    if (!todayLog) {
      alert('يجب تسجيل حضور الموظف أولاً قبل تسجيل الانصراف!');
      return;
    }

    const clockOutTime = '16:00'; // Default end shift time

    const updated = attendance.map(a => {
      if (a.id === todayLog.id) {
        return {
          ...a,
          clock_out: clockOutTime
        };
      }
      return a;
    });

    setAttendance(updated);
    saveAttendance(updated);

    // Log Audit
    addAuditLog(
      currentUser.id,
      currentUser.name,
      'CLOCK_OUT_SIMULATION',
      'الحضور والانصراف',
      'attendance',
      empId,
      JSON.stringify(todayLog),
      `{"clock_out": "${clockOutTime}"}`
    );
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-900" />
            <span>الحضور والانصراف والورديات</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            متابعة سجل الحضور والغياب اليومي للعمال، فترات التأخير، وإدارة ورديات تشغيل مصنع البلاستيك الثلاث.
          </p>
        </div>

        {/* Info banner about Date */}
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center gap-2 text-blue-900 text-xs font-bold">
          <Calendar className="h-4.5 w-4.5" />
          <span>تاريخ اليوم بالنظام: 2026-07-08</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left column: Logs & Shifts */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Attendance Log Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <UserCheck className="h-4.5 w-4.5 text-blue-900" />
                <span>سجل حضور اليوم المباشر</span>
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold font-mono">
                إجمالي المسجلين: {attendance.filter(a => a.date === simDate).length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">اسم الموظف</th>
                    <th className="p-4 text-center">وقت الحضور</th>
                    <th className="p-4 text-center">وقت الانصراف</th>
                    <th className="p-4 text-center">التأخر</th>
                    <th className="p-4 text-center">الحالة اليومية</th>
                    <th className="p-4 text-left">الإجراء المتاح</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map(emp => {
                    const log = attendance.find(a => a.employee_id === emp.id && a.date === simDate);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{emp.name}</td>
                        <td className="p-4 text-center font-mono font-bold text-slate-800">
                          {log?.clock_in ? (
                            <span className="flex items-center justify-center gap-1 text-emerald-800">
                              <LogIn className="h-3.5 w-3.5" />
                              <span>{log.clock_in}</span>
                            </span>
                          ) : '---'}
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-slate-800">
                          {log?.clock_out ? (
                            <span className="flex items-center justify-center gap-1 text-blue-800">
                              <LogOut className="h-3.5 w-3.5" />
                              <span>{log.clock_out}</span>
                            </span>
                          ) : '---'}
                        </td>
                        <td className="p-4 text-center text-rose-700 font-bold font-mono">
                          {log?.delay_minutes ? `${log.delay_minutes} دقيقة` : '---'}
                        </td>
                        <td className="p-4 text-center">
                          {log ? (
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              log.status === 'On Time' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                              log.status === 'Late' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                              log.status === 'Leave' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                              'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}>
                              {log.status === 'On Time' ? 'حاضر/في الموعد' :
                               log.status === 'Late' ? 'تأخير' :
                               log.status === 'Leave' ? 'إجازة مصدقة' : 'غياب'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 font-medium text-[10px]">
                              لم يسجل حضور
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-left">
                          {canManage && log?.clock_in && !log.clock_out && (
                            <button
                              onClick={() => handleClockOut(emp.id)}
                              className="text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 px-2 py-1 rounded border border-blue-200 cursor-pointer transition-all"
                            >
                              تسجيل انصراف
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Factory Shifts Directory */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-1.5">
              <Timer className="h-4.5 w-4.5 text-blue-900" />
              <span>لائحة ورديات تشغيل خطوط الإنتاج والآلات</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {shifts.map(shift => (
                <div key={shift.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs md:text-sm">{shift.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold font-mono mt-1">توقيت الورديات المعتمد:</p>
                    <div className="flex items-center gap-1.5 font-bold text-blue-950 font-mono mt-2 text-sm">
                      <Clock className="h-4 w-4 text-blue-900" />
                      <span>{shift.start_time} - {shift.end_time}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/50 flex justify-between items-center text-[10px] text-slate-500">
                    <span>أيام العمل الأسبوعية:</span>
                    <span className="font-bold text-slate-800">السبت - الخميس</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Interactive Simulation Console */}
        <div className="xl:col-span-1">
          {canManage ? (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-4 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <Clock className="h-4.5 w-4.5 text-blue-900 animate-spin-slow" />
                <span>محاكي الحضور والانصراف (الباركود)</span>
              </h3>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <div className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span>ملاحظة للمدير:</span>
                </div>
                استخدم هذا المحاكي لتسجيل حضور الموظفين والعمال يدوياً بدلاً من جهاز الباركود/البصمة. سيقوم النظام بحساب فترات التأخير والجزاءات التلقائية المترتبة عليها فوراً.
              </div>

              <form onSubmit={handleClockIn} className="space-y-4 text-xs">
                {/* Select employee to check in */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اختر الموظف / العامل:</label>
                  <select
                    required
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 bg-white"
                  >
                    <option value="">-- اختر موظفاً لتسجيل حضوره --</option>
                    {employees.map(emp => {
                      const hasClockedIn = attendance.some(a => a.employee_id === emp.id && a.date === simDate && a.clock_in);
                      return (
                        <option key={emp.id} value={emp.id} disabled={hasClockedIn}>
                          {emp.name} {hasClockedIn ? '(تم تسجيل حضوره اليوم)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {/* Clock-in time */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">وقت الحضور الفعلي:</label>
                    <input
                      type="time"
                      required
                      value={clockTime}
                      onChange={(e) => setClockTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 font-mono"
                    />
                  </div>
                  {/* Today date indicator */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تاريخ العملية:</label>
                    <input
                      type="date"
                      disabled
                      value={simDate}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono text-slate-400"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-xs transition-all"
                >
                  <LogIn className="h-4 w-4" />
                  <span>تسجيل حضور العامل الآن</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-400 sticky top-4">
              <Clock className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-xs text-slate-700">شاشة مخصصة لمدير النظام</p>
              <p className="text-[10px] text-slate-500 mt-1">الموظفون العاديون لا يمكنهم تسجيل أو التلاعب بساعات حضورهم؛ يجب تسجيلها من قبل أجهزة البصمة أو شؤون الموظفين.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
