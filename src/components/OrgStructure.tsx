/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Network, 
  Search, 
  User, 
  Users, 
  ArrowLeftRight, 
  Plus, 
  FolderTree, 
  Info,
  Calendar,
  Building,
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { Department, Position, Employee, User as UserType, TransferHistoryRecord } from '../types';
import { getDepartments, getPositions, getEmployees, saveEmployees, saveDepartments, addAuditLog } from '../data';

interface OrgStructureProps {
  currentUser: UserType;
}

export default function OrgStructure({ currentUser }: OrgStructureProps) {
  const [departments, setDepartments] = useState<Department[]>(getDepartments());
  const [positions, setPositions] = useState<Position[]>(getPositions());
  const [employees, setEmployees] = useState<Employee[]>(getEmployees());
  const [searchQuery, setSearchQuery] = useState('');
  
  // States for forms
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [targetDeptId, setTargetDeptId] = useState('');
  const [targetPosId, setTargetPosId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptManagerId, setNewDeptManagerId] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [newDeptParentId, setNewDeptParentId] = useState('dept-admin');

  // Can current user edit? (only Admins or HR)
  const canEdit = currentUser.role_id === 'role-admin' || currentUser.role_id === 'role-hr';

  // Get employee count of a department
  const getDeptEmpCount = (deptId: string) => {
    return employees.filter(e => e.department_id === deptId && e.status === 'Active').length;
  };

  // Get department manager name
  const getManagerName = (managerId: string | null) => {
    if (!managerId) return 'غير معين';
    const mgr = employees.find(e => e.id === managerId);
    return mgr ? mgr.name : 'غير معين';
  };

  // Filter positions based on department selected in the transfer modal
  const filteredPositionsForTransfer = positions.filter(p => p.department_id === targetDeptId);

  // Handle Employee Transfer
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !targetDeptId || !targetPosId) return;

    const emp = employees.find(e => e.id === selectedEmpId);
    if (!emp) return;

    const oldDeptId = emp.department_id;
    const oldPosId = emp.position_id;
    const oldTitle = positions.find(p => p.id === oldPosId)?.title || 'غير معروف';
    const newTitle = positions.find(p => p.id === targetPosId)?.title || 'غير معروف';

    const oldDeptName = departments.find(d => d.id === oldDeptId)?.name || 'غير معروف';
    const newDeptName = departments.find(d => d.id === targetDeptId)?.name || 'غير معروف';

    // 1. Create Transfer Record
    const transferRecord: TransferHistoryRecord = {
      id: 'tr-' + Date.now(),
      employee_id: selectedEmpId,
      date: new Date().toISOString().split('T')[0],
      old_department_id: oldDeptId,
      new_department_id: targetDeptId,
      old_position_id: oldPosId,
      new_position_id: targetPosId,
      reason: transferReason || 'نقل إداري داخلي',
      approved_by: currentUser.name
    };

    // 2. Create Career Progression Record (سجل التدرج الوظيفي)
    const careerRecord = {
      id: 'cp-' + Date.now(),
      employee_id: selectedEmpId,
      date: new Date().toISOString().split('T')[0],
      type: 'Promotion' as const,
      old_title: `${oldTitle} (${oldDeptName})`,
      new_title: `${newTitle} (${newDeptName})`,
      old_salary: emp.basic_salary,
      new_salary: emp.basic_salary, // Assume same salary unless updated,
      notes: `نقل إداري: ${transferReason || 'بدون تفاصيل إضافية'}`
    };

    // 3. Update Employee
    const updatedEmployees = employees.map(item => {
      if (item.id === selectedEmpId) {
        return {
          ...item,
          department_id: targetDeptId,
          position_id: targetPosId,
          transfer_history: [transferRecord, ...(item.transfer_history || [])],
          career_progression: [careerRecord, ...(item.career_progression || [])]
        };
      }
      return item;
    });

    setEmployees(updatedEmployees);
    saveEmployees(updatedEmployees);

    // Audit Log
    addAuditLog(
      currentUser.id,
      currentUser.name,
      'TRANSFER_EMPLOYEE',
      'الهيكل التنظيمي',
      'employees',
      selectedEmpId,
      JSON.stringify({ department_id: oldDeptId, position_id: oldPosId }),
      JSON.stringify({ department_id: targetDeptId, position_id: targetPosId })
    );

    // Reset Form
    setSelectedEmpId('');
    setTargetDeptId('');
    setTargetPosId('');
    setTransferReason('');
    setShowTransferModal(false);
  };

  // Handle Add Department
  const handleAddDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptCode) return;

    const newDept: Department = {
      id: 'dept-' + Date.now(),
      name: newDeptName,
      code: newDeptCode.toUpperCase(),
      manager_id: newDeptManagerId || null,
      description: newDeptDesc,
      parent_id: newDeptParentId || null
    };

    const updatedDepts = [...departments, newDept];
    setDepartments(updatedDepts);
    saveDepartments(updatedDepts);

    // Audit Log
    addAuditLog(
      currentUser.id,
      currentUser.name,
      'CREATE_DEPARTMENT',
      'الهيكل التنظيمي',
      'departments',
      newDept.id,
      '',
      JSON.stringify(newDept)
    );

    // Reset Form
    setNewDeptName('');
    setNewDeptCode('');
    setNewDeptManagerId('');
    setNewDeptDesc('');
    setNewDeptParentId('dept-admin');
    setShowAddDeptModal(false);
  };

  // Find employees that match search query
  const searchedEmployees = searchQuery.trim()
    ? employees.filter(e => 
        e.status === 'Active' && 
        (e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         e.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
         positions.find(p => p.id === e.position_id)?.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  // Top level departments (those with null parent_id)
  const rootDepts = departments.filter(d => d.parent_id === null);

  // Render a department node recursively to build Tree View
  const renderDeptNode = (dept: Department, level = 0) => {
    const children = departments.filter(d => d.parent_id === dept.id);
    const deptEmployees = employees.filter(e => e.department_id === dept.id && e.status === 'Active');
    const empCount = deptEmployees.length;

    return (
      <div key={dept.id} className="mr-4 border-r-2 border-slate-200 pr-4 my-3" style={{ marginRight: level > 0 ? '24px' : '0' }}>
        <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-900 transition-all shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-900 rounded-lg">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm md:text-base">{dept.name}</h4>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-md font-mono">{dept.code}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-lg">{dept.description}</p>
              
              {/* Manager info */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                <span className="text-slate-600 font-medium">
                  المدير المباشر: <span className="text-slate-900 font-semibold">{getManagerName(dept.manager_id)}</span>
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-600">
                  عدد العاملين بالقسم: <span className="text-blue-900 font-bold">{empCount} موظفاً</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick List of employees inside this dept node */}
          <div className="flex flex-wrap gap-1 md:justify-end max-w-xs">
            {deptEmployees.slice(0, 3).map(e => (
              <span key={e.id} className="text-[11px] bg-slate-50 hover:bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 font-medium flex items-center gap-0.5" title={positions.find(p => p.id === e.position_id)?.title}>
                <User className="h-3 w-3 text-slate-400" /> {e.name.split(' ')[0]}
              </span>
            ))}
            {empCount > 3 && (
              <span className="text-[10px] bg-blue-50 text-blue-900 px-1.5 py-1 rounded border border-blue-100 font-bold">
                +{empCount - 3} آخرين
              </span>
            )}
          </div>
        </div>

        {/* Render child nodes recursively */}
        {children.length > 0 && (
          <div className="mt-2 space-y-1">
            {children.map(child => renderDeptNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner & Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Network className="h-6 w-6 text-blue-900" />
            <span>الهيكل التنظيمي للمصنع</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            مخطط شجري للإدارات والأقسام الإحدى عشر بمصنع القدس للتقنيات البلاستيكية ونظام نقل وتوزيع الموظفين المباشر.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          {canEdit && (
            <>
              <button
                onClick={() => setShowTransferModal(true)}
                className="flex items-center justify-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer w-full sm:w-auto"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span>نقل موظف / ترقية</span>
              </button>
              <button
                onClick={() => setShowAddDeptModal(true)}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                <span>إضافة إدارة / قسم جديد</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grid: Stats & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Statistics & Quick Search Panel */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Quick Search Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-3.5 flex items-center gap-1.5">
              <Search className="h-4.5 w-4.5 text-blue-950" />
              <span>البحث عن موظف في الهيكل</span>
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو المسمى الوظيفي..."
                className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
              />
              <Search className="absolute right-3.5 top-2.5 h-4 w-4 text-slate-400" />
            </div>

            {/* Search Results */}
            {searchQuery.trim() && (
              <div className="mt-4 border-t border-slate-100 pt-3 max-h-64 overflow-y-auto space-y-2">
                <p className="text-[11px] text-slate-400 font-bold mb-1">نتائج البحث ({searchedEmployees.length}):</p>
                {searchedEmployees.length > 0 ? (
                  searchedEmployees.map(e => {
                    const dept = departments.find(d => d.id === e.department_id);
                    const pos = positions.find(p => p.id === e.position_id);
                    return (
                      <div key={e.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-1">
                        <div className="font-bold text-slate-900 text-xs">{e.name}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <span>{pos?.title}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-semibold text-blue-900">{dept?.name}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">لا يوجد موظفين يطابقون بحثك</p>
                )}
              </div>
            )}
          </div>

          {/* Departmental Stats Badge Grid */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-blue-950" />
              <span>إحصائيات الكثافة العمالية</span>
            </h3>
            <div className="space-y-3">
              {departments.slice(0, 6).map(dept => {
                const count = getDeptEmpCount(dept.id);
                const percent = employees.length ? Math.round((count / employees.filter(e => e.status === 'Active').length) * 100) : 0;
                return (
                  <div key={dept.id} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-700">{dept.name}</span>
                      <span className="text-blue-900 font-bold">{count} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-blue-900 h-1.5 rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
              <p className="text-[10px] text-slate-400 text-center pt-2">محدث مباشرة بناء على الحالة النشطة للموظفين</p>
            </div>
          </div>

        </div>

        {/* Tree View Canvas */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-1.5">
            <FolderTree className="h-4.5 w-4.5 text-blue-950" />
            <span>عرض الهيكل الشجري التفاعلي</span>
          </h3>

          <div className="min-w-[500px]">
            {rootDepts.map(dept => renderDeptNode(dept, 0))}
          </div>
        </div>

      </div>

      {/* Modal: Employee Transfer / Move (نقل وترقيات الموظفين) */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-blue-950 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-1.5">
                <ArrowLeftRight className="h-5 w-5" />
                <span>نقل موظف وتحديث سجل التدرج الوظيفي</span>
              </h3>
              <button 
                onClick={() => setShowTransferModal(false)}
                className="text-white hover:text-slate-200 cursor-pointer text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-6 space-y-4 text-sm text-right">
              
              {/* Employee Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الموظف المراد نقله:</label>
                <select
                  required
                  value={selectedEmpId}
                  onChange={(e) => {
                    setSelectedEmpId(e.target.value);
                    const empObj = employees.find(emp => emp.id === e.target.value);
                    if (empObj) {
                      setTargetDeptId(empObj.department_id);
                      setTargetPosId(empObj.position_id);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs"
                >
                  <option value="">-- اختر موظفاً --</option>
                  {employees.filter(e => e.status === 'Active').map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} - ({departments.find(d => d.id === e.department_id)?.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الإدارة الجديدة المستهدفة:</label>
                <select
                  required
                  value={targetDeptId}
                  onChange={(e) => {
                    setTargetDeptId(e.target.value);
                    setTargetPosId(''); // Reset position to re-select from new dept
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs"
                >
                  <option value="">-- اختر الإدارة المستهدفة --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              {/* Target Position */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الوظيفة / المسمى الجديد:</label>
                <select
                  required
                  value={targetPosId}
                  onChange={(e) => setTargetPosId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs"
                  disabled={!targetDeptId}
                >
                  <option value="">-- اختر المسمى الوظيفي المتاح --</option>
                  {filteredPositionsForTransfer.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
                {!targetDeptId && (
                  <p className="text-[10px] text-slate-400 mt-1">يجب اختيار الإدارة أولاً ليتم تحميل المسميات الوظيفية الخاصة بها.</p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سبب النقل / تفاصيل القرار:</label>
                <textarea
                  required
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="مثال: ترقية استثنائية أو سد عجز عمالة في خط الإنتاج الثالث..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs"
                ></textarea>
              </div>

              {/* Helper Notice */}
              <div className="bg-amber-50 p-3 rounded-lg text-amber-900 text-xs flex gap-2">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  عند تأكيد هذا القرار، سيتم نقل الموظف مباشرة وإضافة سجل نقل رسمي وسجل تدرج وظيفي في ملفه الشخصي للاحتفاظ بكامل تفاصيل التدرج الوظيفي وتاريخ التنقلات.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  تأكيد النقل والتدرج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Department / Division (إضافة إدارة جديدة) */}
      {showAddDeptModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-1.5">
                <Building className="h-5 w-5" />
                <span>إضافة إدارة / قسم جديد للمصنع</span>
              </h3>
              <button 
                onClick={() => setShowAddDeptModal(false)}
                className="text-white hover:text-slate-200 cursor-pointer text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddDeptSubmit} className="p-6 space-y-4 text-sm text-right">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الإدارة / القسم الجديد:</label>
                <input
                  type="text"
                  required
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="مثال: إدارة البحوث والتطوير"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رمز الإدارة الكودي:</label>
                  <input
                    type="text"
                    required
                    value={newDeptCode}
                    onChange={(e) => setNewDeptCode(e.target.value)}
                    placeholder="مثال: RND"
                    maxLength={5}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المدير المباشر:</label>
                  <select
                    value={newDeptManagerId}
                    onChange={(e) => setNewDeptManagerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs"
                  >
                    <option value="">-- اختر موظفاً ليكون مديراً --</option>
                    {employees.filter(e => e.status === 'Active').map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">التبعية الإدارية (الإدارة الأعلى):</label>
                <select
                  value={newDeptParentId}
                  onChange={(e) => setNewDeptParentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs"
                >
                  <option value="">مستقلة / رئيسية (لا يوجد)</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الوصف الإداري والمسؤوليات:</label>
                <textarea
                  value={newDeptDesc}
                  onChange={(e) => setNewDeptDesc(e.target.value)}
                  placeholder="اكتب نبذة عن دور هذا القسم في تسيير أعمال المصنع..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  إضافة الإدارة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
