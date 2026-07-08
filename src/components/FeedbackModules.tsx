/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Megaphone, 
  Plus, 
  HelpCircle, 
  CheckCircle, 
  Trash2, 
  UserX, 
  FileText, 
  Info,
  Users,
  Eye,
  Settings
} from 'lucide-react';
import { Complaint, Suggestion, Resignation, Employee, User as UserType } from '../types';
import { 
  getComplaints, 
  saveComplaints, 
  getSuggestions, 
  saveSuggestions, 
  getResignations, 
  saveResignations, 
  getEmployees,
  saveEmployees,
  addAuditLog 
} from '../data';

interface FeedbackModulesProps {
  currentUser: UserType;
}

export default function FeedbackModules({ currentUser }: FeedbackModulesProps) {
  const [employees, setEmployees] = useState<Employee[]>(() => getEmployees());
  const [complaints, setComplaints] = useState<Complaint[]>(getComplaints());
  const [suggestions, setSuggestions] = useState<Suggestion[]>(getSuggestions());
  const [resignations, setResignations] = useState<Resignation[]>(getResignations());

  // Form states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'complaint' | 'suggestion'>('complaint');
  const [feedbackEmpId, setFeedbackEmpId] = useState('');
  const [feedbackIsAnon, setFeedbackIsAnon] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');

  const [showResignModal, setShowResignModal] = useState(false);
  const [resignEmpId, setResignEmpId] = useState('');
  const [resignLastDay, setResignLastDay] = useState('');
  const [resignReason, setResignReason] = useState('');

  // Permission: Admins and HR can manage feedback and resignations
  const isManager = currentUser.role_id === 'role-admin' || currentUser.role_id === 'role-hr';

  // Get employee name safely
  const getEmpName = (empId: string | null) => {
    if (!empId) return 'مجهول الهوية (سري)';
    const emp = employees.find(e => e.id === empId);
    return emp ? emp.name : 'مجهول الهوية (سري)';
  };

  // Handle Complaint status updates
  const handleComplaintStatus = (id: string, newStatus: Complaint['status']) => {
    const updated = complaints.map(c => {
      if (c.id === id) return { ...c, status: newStatus };
      return c;
    });
    setComplaints(updated);
    saveComplaints(updated);

    addAuditLog(currentUser.id, currentUser.name, `COMPLAINT_${newStatus.toUpperCase()}`, 'الشكاوى والاتصالات', 'complaints', id, '', `{"status": "${newStatus}"}`);
  };

  // Handle Suggestion status updates
  const handleSuggestionStatus = (id: string, newStatus: Suggestion['status']) => {
    const updated = suggestions.map(s => {
      if (s.id === id) return { ...s, status: newStatus };
      return s;
    });
    setSuggestions(updated);
    saveSuggestions(updated);

    addAuditLog(currentUser.id, currentUser.name, `SUGGESTION_${newStatus.toUpperCase()}`, 'الشكاوى والاتصالات', 'suggestions', id, '', `{"status": "${newStatus}"}`);
  };

  // Submit Complaint / Suggestion
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackTitle || !feedbackContent) return;

    const empId = feedbackIsAnon ? null : (feedbackEmpId || currentUser.id);

    if (feedbackType === 'complaint') {
      const newComp: Complaint = {
        id: 'comp-' + Date.now(),
        employee_id: empId,
        title: feedbackTitle,
        content: feedbackContent,
        is_anonymous: feedbackIsAnon,
        status: 'Pending',
        created_at: new Date().toISOString()
      };
      const updated = [newComp, ...complaints];
      setComplaints(updated);
      saveComplaints(updated);

      addAuditLog(currentUser.id, currentUser.name, 'CREATE_COMPLAINT', 'الشكاوى والاتصالات', 'complaints', newComp.id, '', JSON.stringify(newComp));
    } else {
      const newSug: Suggestion = {
        id: 'sug-' + Date.now(),
        employee_id: empId,
        title: feedbackTitle,
        content: feedbackContent,
        is_anonymous: feedbackIsAnon,
        status: 'Pending',
        created_at: new Date().toISOString()
      };
      const updated = [newSug, ...suggestions];
      setSuggestions(updated);
      saveSuggestions(updated);

      addAuditLog(currentUser.id, currentUser.name, 'CREATE_SUGGESTION', 'الشكاوى والاتصالات', 'suggestions', newSug.id, '', JSON.stringify(newSug));
    }

    // Reset Form
    setFeedbackTitle('');
    setFeedbackContent('');
    setFeedbackIsAnon(false);
    setFeedbackEmpId('');
    setShowFeedbackModal(false);
  };

  // Submit Resignation Request
  const handleResignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resignEmpId || !resignLastDay || !resignReason) return;

    const newResign: Resignation = {
      id: 'res-' + Date.now(),
      employee_id: resignEmpId,
      request_date: new Date().toISOString().split('T')[0],
      desired_last_day: resignLastDay,
      reason: resignReason,
      status: 'Pending',
      clearance_completed: false
    };

    const updated = [newResign, ...resignations];
    setResignations(updated);
    saveResignations(updated);

    addAuditLog(currentUser.id, currentUser.name, 'CREATE_RESIGNATION_REQUEST', 'الاستقالات والتسويات', 'resignations', newResign.id, '', JSON.stringify(newResign));

    // Reset
    setResignEmpId('');
    setResignLastDay('');
    setResignReason('');
    setShowResignModal(false);
  };

  // Handle Clearance Toggle (إخلاء طرف)
  const toggleClearance = (id: string) => {
    const updated = resignations.map(res => {
      if (res.id === id) {
        return {
          ...res,
          clearance_completed: !res.clearance_completed
        };
      }
      return res;
    });
    setResignations(updated);
    saveResignations(updated);

    const target = resignations.find(r => r.id === id);
    addAuditLog(currentUser.id, currentUser.name, 'TOGGLE_CLEARANCE_STATUS', 'الاستقالات والتسويات', 'resignations', id, '', `{"clearance": ${!target?.clearance_completed}}`);
  };

  // Approve Resignation & auto Deactivate Employee (Marks Inactive as requested!)
  const handleApproveResignation = (resId: string) => {
    const res = resignations.find(r => r.id === resId);
    if (!res) return;

    if (!res.clearance_completed) {
      alert('تنبيه: يجب إتمام إجراءات إخلاء الطرف المالي وتسليم العهدة قبل اعتماد الاستقالة الفعلي!');
      return;
    }

    // 1. Update Resignation status
    const updatedRes = resignations.map(r => {
      if (r.id === resId) {
        return {
          ...r,
          status: 'Approved' as const,
          actual_last_day: new Date().toISOString().split('T')[0]
        };
      }
      return r;
    });
    setResignations(updatedRes);
    saveResignations(updatedRes);

    // 2. Set Employee to Inactive State to preserve history
    const updatedEmps = employees.map(emp => {
      if (emp.id === res.employee_id) {
        return {
          ...emp,
          status: 'Inactive' as const,
          termination_date: new Date().toISOString().split('T')[0],
          termination_reason: `الاستقالة: ${res.reason}`
        };
      }
      return emp;
    });
    setEmployees(updatedEmps);
    saveEmployees(updatedEmps);

    // Audit Log
    addAuditLog(
      currentUser.id,
      currentUser.name,
      'APPROVE_RESIGNATION_EXIT_FLOW',
      'الاستقالات والتسويات',
      'resignations',
      resId,
      '{"status": "Pending"}',
      '{"status": "Approved"}'
    );
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Upper header banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-blue-900" />
            <span>الشكاوى والاقتراحات والاستقالات</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            صندوق الوارد للمقترحات التطويرية لخطوط الإنتاج، معالجة الشكاوى الإدارية بسرية تامة، ومتابعة تصفية وحالات استقالة العمال وإخلاء طرفهم.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              setFeedbackType('complaint');
              setShowFeedbackModal(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>تقديم شكوى أو اقتراح</span>
          </button>
          {isManager && (
            <button
              onClick={() => setShowResignModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all"
            >
              <UserX className="h-4.5 w-4.5" />
              <span>تسجيل طلب استقالة</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Module 1: Complaints & Suggestions (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Megaphone className="h-4.5 w-4.5 text-blue-900" />
                <span>صندوق الشكاوى والاقتراحات العام</span>
              </h3>
            </div>

            {/* Combined Tab-like feed */}
            <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
              
              {/* Complaints List */}
              <div className="space-y-3.5">
                <h4 className="font-bold text-slate-900 text-xs text-rose-800 mb-2 border-r-2 border-rose-700 pr-2 leading-none">قسم الشكاوى والتظلمات الإدارية</h4>
                {complaints.length > 0 ? (
                  complaints.map(comp => (
                    <div key={comp.id} className="p-4 rounded-xl border border-rose-100 bg-rose-50/20 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">{comp.title}</h5>
                          <span className={`text-[10px] font-bold ${comp.is_anonymous ? 'text-rose-700' : 'text-slate-500'}`}>
                            المشتكي: {getEmpName(comp.employee_id)}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                          comp.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                          comp.status === 'Investigating' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {comp.status === 'Resolved' ? 'تمت التسوية' : comp.status === 'Investigating' ? 'قيد التحقيق' : 'جديد'}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-medium">{comp.content}</p>
                      
                      {/* Manage status for HR/Admin */}
                      {isManager && (
                        <div className="flex gap-1.5 pt-1 justify-end">
                          {comp.status === 'Pending' && (
                            <button
                              onClick={() => handleComplaintStatus(comp.id, 'Investigating')}
                              className="px-2.5 py-1 bg-amber-800 text-white font-bold rounded hover:bg-amber-700 cursor-pointer"
                            >
                              بدء التحقيق
                            </button>
                          )}
                          {comp.status !== 'Resolved' && (
                            <button
                              onClick={() => handleComplaintStatus(comp.id, 'Resolved')}
                              className="px-2.5 py-1 bg-emerald-800 text-white font-bold rounded hover:bg-emerald-700 cursor-pointer"
                            >
                              حل وإغلاق الشكوى
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-center py-2">لا توجد شكاوى واردة.</p>
                )}
              </div>

              {/* Suggestions List */}
              <div className="space-y-3.5 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs text-emerald-800 mb-2 border-r-2 border-emerald-700 pr-2 leading-none">صندوق الأفكار والحلول الابتكارية</h4>
                {suggestions.length > 0 ? (
                  suggestions.map(sug => (
                    <div key={sug.id} className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/10 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">{sug.title}</h5>
                          <span className="text-[10px] text-slate-500 font-bold">
                            المقترح: {getEmpName(sug.employee_id)}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                          sug.status === 'Implemented' ? 'bg-emerald-100 text-emerald-800' :
                          sug.status === 'Reviewed' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {sug.status === 'Implemented' ? 'مطبق بالكامل' : sug.status === 'Reviewed' ? 'قيد المراجعة الفنية' : 'جديد'}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-medium">{sug.content}</p>
                      
                      {/* Manage status */}
                      {isManager && (
                        <div className="flex gap-1.5 pt-1 justify-end">
                          {sug.status === 'Pending' && (
                            <button
                              onClick={() => handleSuggestionStatus(sug.id, 'Reviewed')}
                              className="px-2.5 py-1 bg-blue-900 text-white font-bold rounded hover:bg-blue-800 cursor-pointer"
                            >
                              وضع كقيد المراجعة
                            </button>
                          )}
                          {sug.status !== 'Implemented' && (
                            <button
                              onClick={() => handleSuggestionStatus(sug.id, 'Implemented')}
                              className="px-2.5 py-1 bg-emerald-800 text-white font-bold rounded hover:bg-emerald-700 cursor-pointer"
                            >
                              إقرار وتنفيذ الفكرة
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-center py-2">لا توجد اقتراحات مسجلة.</p>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Module 2: Resignation Exit Life-Cycle (1 col) */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <UserX className="h-4.5 w-4.5 text-blue-900" />
              <span>الاستقالات وتصفية العهد</span>
            </h3>

            {resignations.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {resignations.map(res => (
                  <div key={res.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div>
                      <div className="font-bold text-slate-950 text-xs">{getEmpName(res.employee_id)}</div>
                      <p className="text-[10px] text-slate-500 font-bold mt-1">السبب الأساسي: {res.reason}</p>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">تاريخ التقديم: {res.request_date} | اليوم الأخير: {res.desired_last_day}</div>
                    </div>

                    {/* Clearance Toggle Checklist (إخلاء طرف الموظف) */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span>إخلاء الطرف الإداري والمالي:</span>
                        <button
                          onClick={() => toggleClearance(res.id)}
                          disabled={res.status === 'Approved'}
                          className={`px-2 py-1 rounded text-[9px] font-bold cursor-pointer ${
                            res.clearance_completed ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {res.clearance_completed ? 'تم تسليم العهدة وتصفية المستحقات' : 'لم يخل طرفه (اضغط للإخلاء)'}
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-400 leading-normal">
                        * يشمل ذلك تسليم أدوات السلامة والصحة المهنية، البطاقة المهنية، وتصفية السلف المالية العالقة بالحسابات.
                      </p>
                    </div>

                    {/* Final Approvals */}
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/50">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                        res.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        res.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        الحالة: {res.status === 'Approved' ? 'معتمدة ومسرح' : 'قيد المراجعة'}
                      </span>

                      {isManager && res.status === 'Pending' && (
                        <button
                          onClick={() => handleApproveResignation(res.id)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded cursor-pointer transition-colors"
                        >
                          اعتماد الاستقالة
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-center py-6">لا توجد طلبات تسوية أو استقالات حالياً.</p>
            )}
          </div>

        </div>

      </div>

      {/* Modal: Add Feedback (تقديم شكوى أو اقتراح) */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 text-right">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-blue-950 px-6 py-4 text-white flex justify-between items-center text-sm">
              <h3 className="font-bold flex items-center gap-1.5">
                <Megaphone className="h-5 w-5" />
                <span>إرسال شكوى أو فكرة جديدة للرئاسة</span>
              </h3>
              <button 
                onClick={() => setShowFeedbackModal(false)}
                className="text-white hover:text-slate-200 cursor-pointer text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع المراسلة:</label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 bg-white"
                  >
                    <option value="complaint">شكوى وتظلم إداري</option>
                    <option value="suggestion">اقتراح تطوير فني/صناعي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">السرية والخصوصية:</label>
                  <select
                    value={feedbackIsAnon ? 'yes' : 'no'}
                    onChange={(e) => setFeedbackIsAnon(e.target.value === 'yes')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 bg-white font-bold"
                  >
                    <option value="no">إظهار اسمي لسهولة المتابعة</option>
                    <option value="yes">سري ومجهول الهوية بالكامل 🔒</option>
                  </select>
                </div>
              </div>

              {!feedbackIsAnon && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم الموظف / صاحب الطلب:</label>
                  <select
                    value={feedbackEmpId}
                    onChange={(e) => setFeedbackEmpId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 bg-white"
                  >
                    <option value="">-- اختر اسمك --</option>
                    {employees.filter(e => e.status === 'Active').map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">موضوع المراسلة الرئيسي:</label>
                <input
                  type="text"
                  required
                  value={feedbackTitle}
                  onChange={(e) => setFeedbackTitle(e.target.value)}
                  placeholder="عنوان مختصر ومباشر..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل الشكوى أو الاقتراح بالتفصيل:</label>
                <textarea
                  required
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  placeholder="اكتب كامل التفاصيل والحلول المقترحة لمساعدتنا على معالجة المشكلة بكفاءة..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900"
                ></textarea>
              </div>

              {feedbackIsAnon && (
                <div className="bg-rose-50 p-3 rounded-lg text-rose-900 text-[10px]">
                  🔒 <span className="font-bold">ضمان السرية:</span> عند اختيار خيار سري ومجهول الهوية، لن يتم حفظ اسمك أو كودك في السجلات الإدارية نهائياً، وسيتم عرضها للمدراء كشكوى مجهولة المصدر لدواعي السلامة.
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold shadow-xs transition-all cursor-pointer"
                >
                  إرسال الطلب للصندوق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Resignation (تسجيل استقالة) */}
      {showResignModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 text-right">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center text-sm">
              <h3 className="font-bold flex items-center gap-1.5">
                <UserX className="h-5 w-5" />
                <span>تسجيل طلب استقالة رسمي وتصفية عهدة</span>
              </h3>
              <button 
                onClick={() => setShowResignModal(false)}
                className="text-white hover:text-slate-200 cursor-pointer text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleResignSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الموظف / العامل المستقيل:</label>
                <select
                  required
                  value={resignEmpId}
                  onChange={(e) => setResignEmpId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 bg-white"
                >
                  <option value="">-- اختر الموظف --</option>
                  {employees.filter(e => e.status === 'Active').map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ اليوم الأخير للعمل المفضل:</label>
                <input
                  type="date"
                  required
                  value={resignLastDay}
                  onChange={(e) => setResignLastDay(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">أسباب الاستقالة وتفاصيل الخروج:</label>
                <textarea
                  required
                  value={resignReason}
                  onChange={(e) => setResignReason(e.target.value)}
                  placeholder="برجاء توضيح أسباب رغبة الموظف في المغادرة لمراجعة التصفية المالية وإخلاء العهدة..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900"
                ></textarea>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResignModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs transition-all cursor-pointer"
                >
                  تسجيل طلب الاستقالة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
