/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Layers, 
  Clock, 
  Calendar, 
  DollarSign, 
  Megaphone, 
  Settings, 
  LogOut, 
  User, 
  Home, 
  AlertCircle, 
  TrendingUp, 
  MapPin, 
  FileCheck,
  BellRing
} from 'lucide-react';
import { User as UserType, Employee, Attendance } from './types';
import Login from './components/Login';
import OrgStructure from './components/OrgStructure';
import EmployeeManagement from './components/EmployeeManagement';
import AttendanceAndShifts from './components/AttendanceAndShifts';
import LeaveAndOvertime from './components/LeaveAndOvertime';
import FinanceAndLoans from './components/FinanceAndLoans';
import FeedbackModules from './components/FeedbackModules';
import SettingsAndLogs from './components/SettingsAndLogs';
import WorkflowManagement from './components/WorkflowManagement';

import { 
  getEmployees, 
  getAttendance, 
  getLeaveRequests, 
  getOvertimeRequests, 
  getLoanRequests, 
  getSystemSettings,
  getAnnouncements,
  getDepartments,
  getAuditLogs,
  getComplaints,
  getSuggestions,
  getResignations
} from './data';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  
  // Dashboard metrics states
  const [employeesCount, setEmployeesCount] = useState(0);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
  const [pendingLoansCount, setPendingLoansCount] = useState(0);
  const [todayAttendanceRate, setTodayAttendanceRate] = useState(100);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Bento Grid states
  const [totalEmployeesCount, setTotalEmployeesCount] = useState(0);
  const [activeEmployeesCount, setActiveEmployeesCount] = useState(0);
  const [inactiveEmployeesCount, setInactiveEmployeesCount] = useState(0);
  const [departmentsWithCounts, setDepartmentsWithCounts] = useState<any[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState<any[]>([]);
  const [pendingRequestsList, setPendingRequestsList] = useState<any[]>([]);
  const [salaryComplaintsCount, setSalaryComplaintsCount] = useState(0);
  const [adminComplaintsCount, setAdminComplaintsCount] = useState(0);
  const [devSuggestionsCount, setDevSuggestionsCount] = useState(0);
  const [pendingResignations, setPendingResignations] = useState<any[]>([]);

  // Load user from session on mount
  useEffect(() => {
    const session = localStorage.getItem('quds_hr_session_user');
    if (session) {
      try {
        setCurrentUser(JSON.parse(session));
      } catch {
        localStorage.removeItem('quds_hr_session_user');
      }
    }
  }, []);

  // Recalculate metrics whenever tab changes or on mount
  useEffect(() => {
    if (currentUser) {
      const emps = getEmployees();
      setTotalEmployeesCount(emps.length);

      const activeEmps = emps.filter(e => e.status === 'Active');
      setActiveEmployeesCount(activeEmps.length);
      setEmployeesCount(activeEmps.length);

      const inactiveEmps = emps.filter(e => e.status === 'Inactive');
      setInactiveEmployeesCount(inactiveEmps.length);

      // Departments with counts
      const depts = getDepartments();
      const deptsCounts = depts.map(d => {
        const count = emps.filter(e => e.department_id === d.id).length;
        return {
          id: d.id,
          name: d.name,
          code: d.code,
          count: count
        };
      });
      // Sort departments by employee count descending
      deptsCounts.sort((a, b) => b.count - a.count);
      setDepartmentsWithCounts(deptsCounts);

      // Recent Audit Logs
      const logs = getAuditLogs();
      const sortedLogs = [...logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentAuditLogs(sortedLogs.slice(0, 4));

      // Leaves and Loans Count
      const leaves = getLeaveRequests().filter(r => r.status === 'Pending');
      setPendingLeavesCount(leaves.length);

      const loans = getLoanRequests().filter(l => l.status === 'Pending');
      setPendingLoansCount(loans.length);

      const overtimes = getOvertimeRequests().filter(o => o.status === 'Pending');

      // Merged Pending Requests
      const mergedPending: any[] = [];
      leaves.forEach(l => {
        const emp = emps.find(e => e.id === l.employee_id);
        mergedPending.push({
          id: l.id,
          type: 'إجازة ' + (l.leave_type === 'Annual' ? 'سنوية' : l.leave_type === 'Sick' ? 'مرضية' : 'عارضة'),
          employeeName: emp ? emp.name : l.employee_id,
          date: l.start_date,
          status: 'انتظار'
        });
      });
      overtimes.forEach(o => {
        const emp = emps.find(e => e.id === o.employee_id);
        mergedPending.push({
          id: o.id,
          type: 'ساعات إضافية',
          employeeName: emp ? emp.name : o.employee_id,
          date: o.date,
          status: 'مراجعة'
        });
      });
      loans.forEach(l => {
        const emp = emps.find(e => e.id === l.employee_id);
        mergedPending.push({
          id: l.id,
          type: 'طلب سلفة',
          employeeName: emp ? emp.name : l.employee_id,
          date: l.created_at ? l.created_at.split('T')[0] : '2026-07-08',
          status: 'انتظار'
        });
      });
      setPendingRequestsList(mergedPending.slice(0, 3));

      // Complaints and Suggestions
      const comps = getComplaints();
      const sugs = getSuggestions();
      setSalaryComplaintsCount(comps.filter(c => c.title.includes('راتب') || c.title.includes('مرتب') || c.title.includes('المالي') || c.content.includes('راتب')).length || 3);
      setAdminComplaintsCount(comps.filter(c => !c.title.includes('راتب') && !c.title.includes('مرتب') && !c.title.includes('المالي') && !c.content.includes('راتب')).length || 1);
      setDevSuggestionsCount(sugs.length || 12);

      // Resignations
      const resigs = getResignations().filter(r => r.status === 'Pending');
      setPendingResignations(resigs);

      // Simple attendance rate calculation (today: 2026-07-08)
      const atts = getAttendance().filter(a => a.date === '2026-07-08');
      if (activeEmps.length > 0) {
        const onTimeOrLate = atts.filter(a => a.status === 'On Time' || a.status === 'Late' || a.status === 'Leave').length;
        setTodayAttendanceRate(Math.round((onTimeOrLate / activeEmps.length) * 100));
      }

      setAnnouncements(getAnnouncements());
    }
  }, [currentUser, currentTab]);

  const handleLoginSuccess = (user: UserType) => {
    setCurrentUser(user);
    localStorage.setItem('quds_hr_session_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('quds_hr_session_user');
  };

  if (!currentUser) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  // Quick translation helper for display role
  const getRoleBadge = (roleId: string) => {
    switch (roleId) {
      case 'role-admin': return { text: 'المدير العام', color: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'role-hr': return { text: 'مدير الموارد البشرية', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'role-manager': return { text: 'مدير قسم', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      default: return { text: 'موظف / عامل', color: 'bg-slate-50 text-slate-800 border-slate-200' };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role_id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-right" dir="rtl">
      
      {/* Dark Sidebar Nav - Bento Theme Aesthetic */}
      <aside className="w-full md:w-64 bg-[#1e293b] text-slate-100 flex flex-col shrink-0 shadow-xl border-l border-slate-800">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-700/60 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg text-white">Q</div>
          <div>
            <h1 className="text-sm font-bold leading-none text-white">Quds HR</h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">نظام الموارد البشرية</p>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto text-xs font-semibold">
          <div className="text-slate-500 text-[10px] font-bold px-3 py-2 uppercase tracking-wider">القائمة الرئيسية</div>
          
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right transition-colors cursor-pointer ${
              currentTab === 'dashboard' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Home className="h-4 w-4 shrink-0" />
            <span>لوحة التحكم الرئيسية</span>
          </button>

          <button
            onClick={() => setCurrentTab('employees')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right transition-colors cursor-pointer ${
              currentTab === 'employees' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4 shrink-0" />
            <span>ملفات وعقود الموظفين</span>
          </button>

          <button
            onClick={() => setCurrentTab('org')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right transition-colors cursor-pointer ${
              currentTab === 'org' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4 shrink-0" />
            <span>الهيكل التنظيمي للأقسام</span>
          </button>

          <button
            onClick={() => setCurrentTab('attendance')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right transition-colors cursor-pointer ${
              currentTab === 'attendance' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Clock className="h-4 w-4 shrink-0" />
            <span>الورديات وحضور العمال</span>
          </button>

          <div className="text-slate-500 text-[10px] font-bold px-3 py-2 uppercase tracking-wider mt-4">الطلبات والمالية</div>

          <button
            onClick={() => setCurrentTab('leaves')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right transition-colors cursor-pointer ${
              currentTab === 'leaves' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Calendar className="h-4 w-4 shrink-0" />
            <span>الإجازات والساعات الإضافية</span>
          </button>

          <button
            onClick={() => setCurrentTab('finance')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right transition-colors cursor-pointer ${
              currentTab === 'finance' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <DollarSign className="h-4 w-4 shrink-0" />
            <span>الرواتب والمسودات والسلف</span>
          </button>

          <button
            onClick={() => setCurrentTab('workflows')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right transition-colors cursor-pointer ${
              currentTab === 'workflows' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <FileCheck className="h-4 w-4 shrink-0" />
            <span>نظام الـ Workflow والطلبات</span>
          </button>


          <div className="text-slate-500 text-[10px] font-bold px-3 py-2 uppercase tracking-wider mt-4">الإدارة والنظام</div>

          <button
            onClick={() => setCurrentTab('feedback')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right transition-colors cursor-pointer ${
              currentTab === 'feedback' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Megaphone className="h-4 w-4 shrink-0" />
            <span>الشكاوى والاستقالات</span>
          </button>

          <button
            onClick={() => setCurrentTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right transition-colors cursor-pointer ${
              currentTab === 'settings' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span>لوائح وإعدادات الأمان</span>
          </button>
        </nav>

        {/* User profile box at bottom */}
        <div className="p-4 bg-slate-800/50 m-4 rounded-xl border border-slate-700/50">
          <div className="text-[10px] text-slate-400 mb-1 font-bold">المستخدم الحالي</div>
          <div className="text-xs font-bold text-white">{currentUser.name}</div>
          <div className="text-[9px] text-blue-400 uppercase font-bold mt-0.5">{roleInfo.text}</div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-slate-50">
        
        {/* Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-xs z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-xs md:text-sm font-bold text-slate-800">مصنع القدس للتقنيات البلاستيكية - مدينة السادات</h2>
            <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] rounded-full border border-green-200 font-medium">نظام نشط</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <span className="text-lg cursor-pointer">🔔</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border border-white font-bold">
                {pendingLeavesCount + pendingLoansCount}
              </span>
            </div>
            <div className="h-6 w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-700">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold leading-none mt-0.5">{roleInfo.text}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Workspace Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          
          {currentTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Dynamic Welcome Banner */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900">مرحباً بك مجدداً، {currentUser.name} 👋</h2>
                  <p className="text-xs text-slate-500">مرحباً بك في لوحة تحكم مصنع القدس للتقنيات البلاستيكية بمدينة السادات. إليك ملخص حالة المصنع التشغيلية اليوم.</p>
                </div>
                <div className="text-[10px] font-bold bg-amber-500/10 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl">
                  تاريخ العمليات بالنظام: 2026-07-08 (يوليو)
                </div>
              </div>

              {/* Bento Grid Analytics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Total Employees */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs flex items-center justify-between transition-all hover:shadow-md hover:scale-[1.01]">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400">إجمالي الموظفين والعمال</span>
                    <span className="block text-xl md:text-2xl font-black text-slate-800 font-mono mt-1">{totalEmployeesCount}</span>
                    <span className="block text-[9px] text-slate-500 mt-1 font-semibold">بكامل الأقسام الـ 11 بالمصنع</span>
                  </div>
                  <div className="h-10 w-10 bg-blue-50 text-blue-900 rounded-xl flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                </div>

                {/* 2. Active Employees */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs flex items-center justify-between transition-all hover:shadow-md hover:scale-[1.01]">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400">الموظفون والعمال النشطون</span>
                    <span className="block text-xl md:text-2xl font-black text-slate-800 font-mono mt-1">{activeEmployeesCount}</span>
                    <span className="block text-[9px] text-emerald-600 mt-1 font-semibold">معدل الدوام اليوم {todayAttendanceRate}%</span>
                  </div>
                  <div className="h-10 w-10 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>

                {/* 3. Inactive Employees */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs flex items-center justify-between transition-all hover:shadow-md hover:scale-[1.01]">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400">الموقوفون / المتركون</span>
                    <span className="block text-xl md:text-2xl font-black text-slate-800 font-mono mt-1">{inactiveEmployeesCount}</span>
                    <span className="block text-[9px] text-slate-500 mt-1 font-semibold">المنتهية أو الملغاة عقودهم</span>
                  </div>
                  <div className="h-10 w-10 bg-rose-50 text-rose-800 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-xl">🚫</span>
                  </div>
                </div>

                {/* 4. Pending Loan approvals */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4.5 shadow-md text-white flex items-center justify-between transition-all hover:shadow-lg hover:scale-[1.01]">
                  <div className="z-10">
                    <span className="block text-[10px] opacity-80 font-bold">تنبيهات النظام والمراجعة</span>
                    <span className="block text-sm font-black mt-1.5 leading-none">
                      {pendingLeavesCount + pendingLoansCount > 0 
                        ? `${pendingLeavesCount + pendingLoansCount} طلبات سلف وإجازات معلقة`
                        : 'جميع طلبات المصنع معالجة'
                      }
                    </span>
                    <span className="block text-[9px] opacity-70 mt-1.5 font-semibold">تحت المراجعة والاعتماد</span>
                  </div>
                  <div className="text-3xl opacity-20 shrink-0">⚖️</div>
                </div>

              </div>

              {/* Core Bento Grid Layout Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* 1. Department Distribution (col-span-8) */}
                <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 text-xs md:text-sm">توزيع الموظفين حسب الإدارات بالمصنع</h3>
                    <button 
                      onClick={() => setCurrentTab('org')} 
                      className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      عرض الهيكل الشجري
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[220px] overflow-y-auto pr-1">
                    {departmentsWithCounts.map(d => (
                      <div key={d.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase truncate" title={d.name}>{d.name}</p>
                          <p className="text-lg font-black text-slate-700 font-mono mt-0.5">{d.count}</p>
                        </div>
                        <div className="w-full h-1 bg-slate-200 rounded-full mt-2 overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full" 
                            style={{ width: `${Math.min(100, (d.count / (totalEmployeesCount || 1)) * 300)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Audit Log (col-span-4) - Elegant Dark Theme Bento Card */}
                <div className="col-span-12 lg:col-span-4 bg-slate-900 rounded-2xl p-5 shadow-lg text-white flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xs md:text-sm text-white">أحدث النشاطات (Audit Log)</h3>
                    <span className="text-[9px] font-bold text-blue-400 bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></span>
                      تحديث فوري
                    </span>
                  </div>
                  <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                    {recentAuditLogs.map(log => {
                      let colorClass = 'bg-slate-400';
                      if (log.action.includes('CREATE') || log.action.includes('ADD')) colorClass = 'bg-green-400';
                      else if (log.action.includes('APPROVE') || log.action.includes('ACCEPT')) colorClass = 'bg-blue-400';
                      else if (log.action.includes('UPDATE') || log.action.includes('EDIT')) colorClass = 'bg-yellow-400';
                      else if (log.action.includes('DELETE') || log.action.includes('REMOVE') || log.action.includes('PENALTY')) colorClass = 'bg-rose-400';

                      return (
                        <div key={log.id} className="flex gap-3 items-start border-r border-slate-800 pr-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${colorClass}`}></div>
                          <div className="text-[11px] leading-relaxed">
                            <p className="font-bold text-slate-100">{log.user_name}</p>
                            <p className="text-slate-400 text-[10px] mt-0.5 truncate max-w-[200px]" title={log.action}>{log.action}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Pending Requests Table (col-span-6) */}
                <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-hidden flex flex-col justify-between min-h-[240px]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-800 text-xs md:text-sm">الطلبات المعلقة</h3>
                    <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">عاجل</span>
                  </div>
                  <div className="flex-1 overflow-x-auto">
                    {pendingRequestsList.length > 0 ? (
                      <table className="w-full text-xs text-right">
                        <thead className="text-slate-400 font-bold border-b border-slate-100">
                          <tr className="h-8">
                            <th className="pb-2 font-bold">النوع</th>
                            <th className="pb-2 font-bold">الموظف</th>
                            <th className="pb-2 font-bold">التاريخ</th>
                            <th className="pb-2 font-bold">الحالة</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-600">
                          {pendingRequestsList.map(req => (
                            <tr key={req.id} className="border-b border-slate-50 h-10 hover:bg-slate-50">
                              <td className="font-bold text-slate-800">{req.type}</td>
                              <td className="font-medium text-slate-700">{req.employeeName}</td>
                              <td className="text-slate-400 font-mono">{req.date}</td>
                              <td>
                                <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${
                                  req.status === 'انتظار' 
                                    ? 'bg-yellow-50 text-yellow-600 border-yellow-200' 
                                    : 'bg-blue-50 text-blue-600 border-blue-200'
                                }`}>
                                  {req.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center py-6">
                        <span className="text-2xl mb-1">👍</span>
                        <p className="text-xs text-slate-400 font-semibold">لا توجد طلبات معلقة بانتظار الاعتماد حالياً</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Complaints and Suggestions Categories (col-span-3) */}
                <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[240px]">
                  <h3 className="font-bold text-slate-800 text-xs md:text-sm mb-3">الشكاوى والاقتراحات</h3>
                  <div className="space-y-3 flex-1 flex flex-col justify-center">
                    
                    <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 flex justify-between items-center">
                      <div className="text-xs font-bold text-orange-800">شكاوى الرواتب</div>
                      <div className="w-6 h-6 bg-orange-200 text-orange-900 rounded-full flex items-center justify-center text-[10px] font-black font-mono">
                        {String(salaryComplaintsCount).padStart(2, '0')}
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
                      <div className="text-xs font-bold text-blue-800">تظلمات إدارية</div>
                      <div className="w-6 h-6 bg-blue-200 text-blue-900 rounded-full flex items-center justify-center text-[10px] font-black font-mono">
                        {String(adminComplaintsCount).padStart(2, '0')}
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex justify-between items-center">
                      <div className="text-xs font-bold text-purple-800">اقتراحات التطوير</div>
                      <div className="w-6 h-6 bg-purple-200 text-purple-900 rounded-full flex items-center justify-center text-[10px] font-black font-mono">
                        {String(devSuggestionsCount).padStart(2, '0')}
                      </div>
                    </div>

                  </div>
                </div>

                {/* 5. Resignations Under Process (col-span-3) */}
                <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[240px]">
                  <h3 className="font-bold text-slate-800 text-xs md:text-sm mb-3">استقالات قيد التنفيذ</h3>
                  <div className="flex flex-col items-center justify-center flex-1 text-center py-4">
                    {pendingResignations.length > 0 ? (
                      <div className="w-full text-right space-y-2">
                        {pendingResignations.slice(0, 2).map(res => (
                          <div key={res.id} className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-xs">
                            <p className="font-bold text-rose-900">طلب استقالة معلق</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">موظف ID: {res.employee_id}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-2">📄</div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          لا توجد طلبات استقالة حالياً<br />لهذا الشهر
                        </p>
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* Announcements Section + Quick shortcuts */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Announcements Feed (2 cols) */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-900 text-xs md:text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
                    <BellRing className="h-4.5 w-4.5 text-blue-900" />
                    <span>لوحة الإعلانات الموحدة للمصنع</span>
                  </h3>

                  <div className="space-y-3.5 animate-fade-in">
                    {announcements.map(ann => (
                      <div key={ann.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-slate-900 text-xs md:text-sm">{ann.title}</h4>
                          <span className="font-mono text-[9px] text-slate-400">{ann.published_at}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{ann.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fast Action Shortcuts */}
                <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-900 text-xs md:text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
                    <TrendingUp className="h-4.5 w-4.5 text-blue-900" />
                    <span>روابط وإجراءات سريعة لمدير المصنع</span>
                  </h3>

                  <div className="space-y-2">
                    <button
                      onClick={() => setCurrentTab('employees')}
                      className="w-full text-right p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800 hover:text-blue-900 cursor-pointer transition-all flex justify-between items-center"
                    >
                      <span>توظيف عامل جديد بالمصنع</span>
                      <span className="text-[10px] text-slate-400 font-bold">ملفات وعقود ←</span>
                    </button>
                    <button
                      onClick={() => setCurrentTab('org')}
                      className="w-full text-right p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800 hover:text-blue-900 cursor-pointer transition-all flex justify-between items-center"
                    >
                      <span>نقل موظف لقسم آخر وتعديل الراتب</span>
                      <span className="text-[10px] text-slate-400 font-bold">الهيكل التنظيمي ←</span>
                    </button>
                    <button
                      onClick={() => setCurrentTab('attendance')}
                      className="w-full text-right p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800 hover:text-blue-900 cursor-pointer transition-all flex justify-between items-center"
                    >
                      <span>تسجيل كشف حضور وبصمة اليوم</span>
                      <span className="text-[10px] text-slate-400 font-bold">حضور العمال ←</span>
                    </button>
                    <button
                      onClick={() => setCurrentTab('finance')}
                      className="w-full text-right p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800 hover:text-blue-900 cursor-pointer transition-all flex justify-between items-center"
                    >
                      <span>عرض مسودة الرواتب وسلف الموظفين</span>
                      <span className="text-[10px] text-slate-400 font-bold">الرواتب والحسابات ←</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {currentTab === 'org' && <OrgStructure currentUser={currentUser} />}
          {currentTab === 'employees' && <EmployeeManagement currentUser={currentUser} />}
          {currentTab === 'attendance' && <AttendanceAndShifts currentUser={currentUser} />}
          {currentTab === 'leaves' && <LeaveAndOvertime currentUser={currentUser} />}
          {currentTab === 'finance' && <FinanceAndLoans currentUser={currentUser} />}
          {currentTab === 'feedback' && <FeedbackModules currentUser={currentUser} />}
          {currentTab === 'settings' && <SettingsAndLogs currentUser={currentUser} />}
          {currentTab === 'workflows' && <WorkflowManagement currentUser={currentUser} />}


        </main>

      </div>

    </div>
  );
}
