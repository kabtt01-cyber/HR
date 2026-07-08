/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  CheckCircle, 
  XCircle, 
  FileSpreadsheet, 
  FileText, 
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { LoanRequest, Payroll, Employee, SalaryComplaint, User as UserType } from '../types';
import { 
  getLoanRequests, 
  saveLoanRequests, 
  getPayroll, 
  savePayroll, 
  getEmployees,
  getPenalties,
  getBonuses,
  getOvertimeRequests,
  addAuditLog 
} from '../data';

interface FinanceAndLoansProps {
  currentUser: UserType;
}

export default function FinanceAndLoans({ currentUser }: FinanceAndLoansProps) {
  const [employees] = useState<Employee[]>(() => getEmployees().filter(e => e.status === 'Active'));
  const [loans, setLoans] = useState<LoanRequest[]>(getLoanRequests());
  const [payrolls, setPayrolls] = useState<Payroll[]>(getPayroll());

  // Grievance State
  const [grievances, setGrievances] = useState<SalaryComplaint[]>(() => {
    try {
      const g = localStorage.getItem('quds_hr_salary_complaints');
      return g ? JSON.parse(g) : [
        { id: 'sc-1', employee_id: 'emp-12', payroll_id: 'pay-2', complaint_text: 'لقد عملت 4 ساعات عمل إضافية يوم 2026-07-06 ولم يتم إدراجها بالكامل بالراتب، والبدلات ناقصة 100 ج.م.', status: 'Pending', created_at: '2026-07-07T08:00:00Z' }
      ];
    } catch {
      return [];
    }
  });

  const saveGrievances = (list: SalaryComplaint[]) => {
    localStorage.setItem('quds_hr_salary_complaints', JSON.stringify(list));
    setGrievances(list);
  };

  // Form toggles
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanEmpId, setLoanEmpId] = useState('');
  const [loanAmount, setLoanAmount] = useState(3000);
  const [loanInstallments, setLoanInstallments] = useState(3);
  const [loanPurpose, setLoanPurpose] = useState('');

  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [grievanceEmpId, setGrievanceEmpId] = useState('');
  const [grievanceText, setGrievanceText] = useState('');

  // Selected Pay Slip for Detail View modal
  const [selectedSlip, setSelectedSlip] = useState<Payroll | null>(null);

  // Is current user in accounts/management?
  const isFinanceOrAdmin = currentUser.role_id === 'role-admin' || currentUser.role_id === 'role-hr' || currentUser.role_id === 'role-manager';

  // Translate statuses
  const translateStatus = (status: LoanRequest['status']) => {
    switch (status) {
      case 'Pending': return 'قيد المراجعة';
      case 'Approved': return 'مقبول / جارٍ الخصم';
      case 'Rejected': return 'مرفوض';
      default: return status;
    }
  };

  // Helper to get employee name
  const getEmpName = (empId: string) => {
    const emp = getEmployees().find(e => e.id === empId);
    return emp ? emp.name : 'غير معروف';
  };

  // 1. Calculate payroll run dynamically for TODAY/JULY 2026 (Generates realistic slip)
  const calculateEmployeeSalary = (emp: Employee): Payroll => {
    const basic = emp.basic_salary;
    const allowances = emp.allowances;

    // Calculate hourly wage (assuming 26 working days * 8 hours)
    const hourlyWage = basic / (26 * 8);

    // Sum approved overtime hours
    const otList = getOvertimeRequests().filter(ot => ot.employee_id === emp.id && ot.status === 'Approved');
    const overtimePay = otList.reduce((sum, ot) => sum + (ot.hours * ot.multiplier * hourlyWage), 0);

    // Sum active bonuses
    const bonusList = getBonuses().filter(b => b.employee_id === emp.id);
    const bonusPay = bonusList.reduce((sum, b) => sum + b.amount, 0);

    // Sum active penalties
    const penaltyList = getPenalties().filter(p => p.employee_id === emp.id);
    const penaltyDeductions = penaltyList.reduce((sum, p) => sum + p.amount, 0);

    // Get approved loan deduction installment for the month
    const activeLoan = loans.find(l => l.employee_id === emp.id && l.status === 'Approved' && l.remaining_amount > 0);
    const loanDeductions = activeLoan ? Math.min(activeLoan.amount / activeLoan.installments, activeLoan.remaining_amount) : 0;

    // Taxes (roughly 10%)
    const taxDeductions = Math.round((basic + allowances) * 0.1);

    const netSalary = Math.round(basic + allowances + overtimePay + bonusPay - loanDeductions - penaltyDeductions - taxDeductions);

    return {
      id: 'pay-calc-' + emp.id,
      employee_id: emp.id,
      month: 7,
      year: 2026,
      basic_salary: basic,
      allowances: allowances,
      overtime_pay: Math.round(overtimePay),
      bonus_pay: Math.round(bonusPay),
      loan_deductions: Math.round(loanDeductions),
      penalty_deductions: Math.round(penaltyDeductions),
      tax_deductions: taxDeductions,
      net_salary: netSalary,
      status: 'Draft'
    };
  };

  // Submit Loan Request
  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanEmpId || !loanAmount || !loanInstallments || !loanPurpose) return;

    const newLoan: LoanRequest = {
      id: 'loan-' + Date.now(),
      employee_id: loanEmpId,
      amount: Number(loanAmount),
      installments: Number(loanInstallments),
      remaining_amount: Number(loanAmount),
      status: 'Pending',
      purpose: loanPurpose,
      approved_by: null,
      created_at: new Date().toISOString()
    };

    const updated = [newLoan, ...loans];
    setLoans(updated);
    saveLoanRequests(updated);

    addAuditLog(currentUser.id, currentUser.name, 'CREATE_LOAN_REQUEST', 'المرتبات والسلف', 'loan_requests', newLoan.id, '', JSON.stringify(newLoan));

    // Reset Form
    setLoanEmpId('');
    setLoanAmount(3000);
    setLoanInstallments(3);
    setLoanPurpose('');
    setShowLoanModal(false);
  };

  // Approve / Reject Loan
  const handleLoanAction = (id: string, newStatus: 'Approved' | 'Rejected') => {
    const updated = loans.map(ln => {
      if (ln.id === id) {
        return {
          ...ln,
          status: newStatus,
          approved_by: currentUser.name
        };
      }
      return ln;
    });

    setLoans(updated);
    saveLoanRequests(updated);

    addAuditLog(currentUser.id, currentUser.name, `LOAN_${newStatus.toUpperCase()}`, 'المرتبات والسلف', 'loan_requests', id, '{"status": "Pending"}', `{"status": "${newStatus}"}`);
  };

  // Submit salary grievance
  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceEmpId || !grievanceText) return;

    const newGrievance: SalaryComplaint = {
      id: 'sc-' + Date.now(),
      employee_id: grievanceEmpId,
      payroll_id: 'pay-calc-' + grievanceEmpId,
      complaint_text: grievanceText,
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    const updated = [newGrievance, ...grievances];
    saveGrievances(updated);

    addAuditLog(currentUser.id, currentUser.name, 'CREATE_SALARY_COMPLAINT', 'المرتبات والشكاوى', 'salary_complaints', newGrievance.id, '', JSON.stringify(newGrievance));

    setGrievanceEmpId('');
    setGrievanceText('');
    setShowGrievanceModal(false);
  };

  // Resolve Salary Grievance
  const handleResolveGrievance = (id: string, status: 'Resolved' | 'Rejected', resText: string) => {
    const updated = grievances.map(g => {
      if (g.id === id) {
        return {
          ...g,
          status: status,
          resolution_text: resText
        };
      }
      return g;
    });

    saveGrievances(updated);

    addAuditLog(currentUser.id, currentUser.name, `RESOLVE_SALARY_COMPLAINT_${status.toUpperCase()}`, 'المرتبات والشكاوى', 'salary_complaints', id, '{"status": "Pending"}', `{"status": "${status}"}`);
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Upper header banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-blue-900" />
            <span>الحسابات والرواتب والسلف المالية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            صرف مسودات الرواتب الشهرية للعمال، جدولة خصومات الأقساط الشهرية للسلف، ومتابعة شكاوى وتظلمات الرواتب الواردة.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowLoanModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>طلب سلفة جديدة</span>
          </button>
          <button
            onClick={() => setShowGrievanceModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>تقديم تظلم راتب</span>
          </button>
        </div>
      </div>

      {/* Grid containing payroll and loans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Module 1: Salaries calculations (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Payroll sheet card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <FileSpreadsheet className="h-4.5 w-4.5 text-blue-900" />
                <span>جدول مسودات رواتب الموظفين (يوليو {new Date().getFullYear()})</span>
              </h3>
              <span className="bg-blue-50 text-blue-900 font-bold px-2 py-1 rounded font-mono">
                محسوب برمجياً بالكامل
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">اسم الموظف / العامل</th>
                    <th className="p-4 text-center">الأساسي</th>
                    <th className="p-4 text-center">البدلات</th>
                    <th className="p-4 text-center">الإضافي</th>
                    <th className="p-4 text-center">الحوافز (+)</th>
                    <th className="p-4 text-center">الخصوم / السلف (-)</th>
                    <th className="p-4 text-center font-bold">صافي الراتب</th>
                    <th className="p-4 text-left">قسيمة الراتب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {employees.map(emp => {
                    const slip = calculateEmployeeSalary(emp);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{emp.name}</td>
                        <td className="p-4 text-center font-mono text-slate-700">{slip.basic_salary.toLocaleString()} ج.م</td>
                        <td className="p-4 text-center font-mono text-slate-700">+{slip.allowances.toLocaleString()} ج.م</td>
                        <td className="p-4 text-center font-mono text-emerald-800">+{slip.overtime_pay.toLocaleString()} ج.م</td>
                        <td className="p-4 text-center font-mono text-emerald-800">+{slip.bonus_pay.toLocaleString()} ج.م</td>
                        <td className="p-4 text-center font-mono text-rose-700">
                          -{(slip.loan_deductions + slip.penalty_deductions + slip.tax_deductions).toLocaleString()} ج.م
                        </td>
                        <td className="p-4 text-center font-bold font-mono text-blue-950 text-sm">
                          {slip.net_salary.toLocaleString()} ج.م
                        </td>
                        <td className="p-4 text-left">
                          <button
                            onClick={() => setSelectedSlip(slip)}
                            className="text-[10px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200 transition-all cursor-pointer"
                          >
                            عرض القسيمة
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Salary Grievances / Complaints block */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-1.5">
              <AlertTriangle className="h-4.5 w-4.5 text-blue-950 animate-pulse" />
              <span>تظلمات وشكاوى المرتبات الشهرية الواردة</span>
            </h3>

            {grievances.length > 0 ? (
              <div className="space-y-3">
                {grievances.map(g => (
                  <div key={g.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900">{getEmpName(g.employee_id)}</div>
                      <p className="text-slate-600 font-medium leading-relaxed">{g.complaint_text}</p>
                      <div className="text-[10px] text-slate-400 font-mono">تاريخ تقديم التظلم: {new Date(g.created_at).toLocaleDateString('ar-EG')}</div>
                      {g.resolution_text && (
                        <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg">
                          <span className="font-bold block mb-0.5">حل الإدارة المالية:</span>
                          {g.resolution_text}
                        </div>
                      )}
                    </div>

                    {isFinanceOrAdmin && g.status === 'Pending' && (
                      <div className="flex gap-1.5 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => {
                            const resText = prompt('اكتب تفاصيل التعديل أو تسوية الحساب:');
                            if (resText) handleResolveGrievance(g.id, 'Resolved', resText);
                          }}
                          className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer transition-all"
                        >
                          تسوية التظلم
                        </button>
                        <button
                          onClick={() => handleResolveGrievance(g.id, 'Rejected', 'مرفوض لعدم مطابقة بيانات البصمة.')}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg cursor-pointer transition-all"
                        >
                          رفض التظلم
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-center py-3">لا توجد أي تظلمات مالية معلقة.</p>
            )}
          </div>

        </div>

        {/* Module 2: Loans List (1 col) */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <DollarSign className="h-4.5 w-4.5 text-blue-900" />
              <span>سلف الموظفين وتاريخ الأقساط</span>
            </h3>

            {loans.length > 0 ? (
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {loans.map(loan => (
                  <div key={loan.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-950 text-xs">{getEmpName(loan.employee_id)}</div>
                        <p className="text-[10px] text-slate-500 mt-0.5">الهدف: {loan.purpose}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        loan.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        loan.status === 'Rejected' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                        'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {translateStatus(loan.status)}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded border border-slate-100 flex justify-between font-mono text-[11px] font-bold">
                      <div>المبلغ الكلي: <span className="text-blue-950">{loan.amount.toLocaleString()} ج.م</span></div>
                      <div>القسط: <span className="text-rose-700">{(loan.amount / loan.installments).toLocaleString()} ج.م × {loan.installments} شهور</span></div>
                    </div>

                    {/* Pending actions for Finance Manager */}
                    {isFinanceOrAdmin && loan.status === 'Pending' && (
                      <div className="flex gap-2 pt-1 justify-end">
                        <button
                          onClick={() => handleLoanAction(loan.id, 'Approved')}
                          className="px-3 py-1 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded cursor-pointer transition-colors"
                        >
                          موافقة واعتماد السلفة
                        </button>
                        <button
                          onClick={() => handleLoanAction(loan.id, 'Rejected')}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded cursor-pointer transition-colors"
                        >
                          رفض الطلب
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-center py-6">لا توجد أي طلبات سلف مسجلة حالياً.</p>
            )}
          </div>

        </div>

      </div>

      {/* Pay Slip Detailed Printable View Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 text-right font-sans text-xs">
            <div className="bg-blue-950 px-6 py-4 text-white flex justify-between items-center text-sm">
              <h3 className="font-bold flex items-center gap-1.5">
                <FileText className="h-5 w-5 text-white" />
                <span>قسيمة مفردات المرتب الرسمية</span>
              </h3>
              <button 
                onClick={() => setSelectedSlip(null)}
                className="text-white hover:text-slate-200 cursor-pointer text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4" id="salary-slip">
              <div className="text-center border-b border-slate-100 pb-3 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">مصنع القدس للتقنيات البلاستيكية بمدينة السادات</h4>
                <p className="text-slate-400 font-bold font-mono text-[10px]">قسيمة راتب شهر: {selectedSlip.month} / {selectedSlip.year}</p>
              </div>

              {/* Employee Info */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-semibold">
                <div>اسم الموظف: <span className="text-slate-900 font-bold">{getEmpName(selectedSlip.employee_id)}</span></div>
                <div>كود الملف الشخصي: <span className="text-slate-500 font-mono">{selectedSlip.employee_id}</span></div>
              </div>

              {/* Financial calculations lists */}
              <div className="space-y-2.5">
                <div className="flex justify-between border-b border-slate-100 pb-1 text-slate-600 font-medium">
                  <span>الراتب الأساسي التعاقدي:</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedSlip.basic_salary.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1 text-slate-600 font-medium">
                  <span>البدلات والحوافز الثابتة:</span>
                  <span className="font-bold text-slate-900 font-mono">+{selectedSlip.allowances.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1 text-emerald-800 font-semibold">
                  <span>مستحقات العمل الإضافي:</span>
                  <span className="font-bold font-mono">+{selectedSlip.overtime_pay.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1 text-emerald-800 font-semibold">
                  <span>المكافآت والمنح الاستثنائية:</span>
                  <span className="font-bold font-mono">+{selectedSlip.bonus_pay.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1 text-rose-700 font-semibold">
                  <span>استقطاع أقساط السلف:</span>
                  <span className="font-bold font-mono">-{selectedSlip.loan_deductions.toLocaleString()} ج.m</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1 text-rose-700 font-semibold">
                  <span>الجزاءات والخصومات الإدارية:</span>
                  <span className="font-bold font-mono">-{selectedSlip.penalty_deductions.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1 text-rose-700 font-semibold">
                  <span>استقطاع التأمينات والضرائب (10%):</span>
                  <span className="font-bold font-mono">-{selectedSlip.tax_deductions.toLocaleString()} ج.م</span>
                </div>

                <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200 flex justify-between font-bold text-blue-900 text-sm mt-3">
                  <span>صافي الراتب المستحق للصرف:</span>
                  <span className="font-mono">{selectedSlip.net_salary.toLocaleString()} ج.م</span>
                </div>
              </div>

              {/* Legal confirmation */}
              <div className="text-[10px] text-slate-400 text-center pt-2 leading-relaxed italic">
                * مستند رسمي صادر الكترونياً من قسم الحسابات والرواتب، ويسلم للموظف لتسوية حساباته المصرفية بموجب اللائحة الداخلية للمصنع بمدينة السادات.
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedSlip(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl cursor-pointer shadow-xs transition-all mt-4 text-center"
              >
                إغلاق القسيمة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Request Loan (تقديم طلب سلفة جديدة) */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 text-right">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-blue-950 px-6 py-4 text-white flex justify-between items-center text-sm">
              <h3 className="font-bold flex items-center gap-1.5">
                <DollarSign className="h-5 w-5" />
                <span>تقديم طلب سلفة مالية بضمان الراتب</span>
              </h3>
              <button 
                onClick={() => setShowLoanModal(false)}
                className="text-white hover:text-slate-200 cursor-pointer text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleLoanSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الموظف / العامل مقدم الطلب:</label>
                <select
                  required
                  value={loanEmpId}
                  onChange={(e) => setLoanEmpId(e.target.value)}
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">قيمة السلفة الكلية (ج.م):</label>
                  <input
                    type="number"
                    required
                    min={500}
                    max={15000}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">جدولة الأقساط (شهور):</label>
                  <select
                    value={loanInstallments}
                    onChange={(e) => setLoanInstallments(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 bg-white font-mono"
                  >
                    <option value={2}>قسطين (شهرين)</option>
                    <option value={3}>3 أقساط (شهور)</option>
                    <option value={5}>5 أقساط (شهور)</option>
                    <option value={10}>10 أقساط (شهور)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الغرض من طلب السلفة:</label>
                <textarea
                  required
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
                  placeholder="نرجو توضيح السبب لمساعدتنا على مراجعة طلب السلفة وإقرار صرفها..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900"
                ></textarea>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg text-amber-900 text-[10px] flex gap-1.5">
                <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <p>
                  يتم استقطاع الأقساط الشهرية آلياً مع كل عملية حساب وإغلاق للرواتب الشهرية، وتأجيل الأقساط غير مصرح به إلا بقرار مكتوب ومصدق من المدير المالي والمجلس الأعلى للمصنع.
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoanModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold shadow-xs transition-all cursor-pointer"
                >
                  تقديم طلب السلفة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Salary Grievance (تقديم تظلم مرتب) */}
      {showGrievanceModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 text-right">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center text-sm">
              <h3 className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <span>تسجيل تظلم مالي / شكوى مرتب</span>
              </h3>
              <button 
                onClick={() => setShowGrievanceModal(false)}
                className="text-white hover:text-slate-200 cursor-pointer text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleGrievanceSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الموظف مقدم الشكوى:</label>
                <select
                  required
                  value={grievanceEmpId}
                  onChange={(e) => setGrievanceEmpId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 bg-white"
                >
                  <option value="">-- اختر اسمك --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل ومسببات التظلم المالي:</label>
                <textarea
                  required
                  value={grievanceText}
                  onChange={(e) => setGrievanceText(e.target.value)}
                  placeholder="يرجى ذكر المشكلة بالتفصيل، مثل: ساعات عمل إضافي مفقودة، بدلات ناقصة، غياب مسجل بالخطأ..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900"
                ></textarea>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGrievanceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs transition-all cursor-pointer"
                >
                  إرسال تظلم للحسابات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
