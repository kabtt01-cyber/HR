/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Trash2, 
  UserX, 
  Eye, 
  Edit, 
  FileText, 
  Paperclip, 
  Upload, 
  Calendar, 
  Phone, 
  Mail, 
  Award, 
  ArrowLeftRight, 
  Info, 
  AlertTriangle,
  UserCheck,
  Building,
  Briefcase,
  DollarSign,
  Clock,
  MapPin,
  Fingerprint,
  Shield,
  LogIn,
  CheckCircle,
  GraduationCap,
  HardDrive
} from 'lucide-react';
import { 
  Employee, 
  Department, 
  Position, 
  Role, 
  User as UserType, 
  EmployeeFile, 
  Contract,
  CareerProgressionRecord,
  PerformanceReview,
  LoginLog,
  EmployeeStatus
} from '../types';
import { 
  getEmployees, 
  saveEmployees, 
  getDepartments, 
  getPositions, 
  getRoles, 
  getContracts, 
  saveContracts,
  addAuditLog,
  getLeaveRequests,
  getOvertimeRequests,
  getLoanRequests,
  getPenalties,
  getBonuses,
  getAttendance,
  getComplaints,
  getResignations,
  getPerformanceReviews,
  savePerformanceReviews,
  getLoginLogs,
  getAuditLogs,
  calculateAge
} from '../data';

interface EmployeeManagementProps {
  currentUser: UserType;
}

export default function EmployeeManagement({ currentUser }: EmployeeManagementProps) {
  // Loaded state
  const [employees, setEmployees] = useState<Employee[]>(getEmployees());
  const [departments] = useState<Department[]>(getDepartments());
  const [positions] = useState<Position[]>(getPositions());
  const [roles] = useState<Role[]>(getRoles());
  const [contracts, setContracts] = useState<Contract[]>(getContracts());

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Leave' | 'Suspended' | 'Resigned' | 'Terminated' | 'Inactive'>('Active');
  const [deptFilter, setDeptFilter] = useState('');

  // Selected Employee profile details view
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [profileTab, setProfileTab] = useState<'info' | 'progression' | 'files'>('info');

  // File Upload states inside Profile
  const [uploadedFiles, setUploadedFiles] = useState<EmployeeFile[]>(() => {
    try {
      const items = localStorage.getItem('quds_hr_files');
      return items ? JSON.parse(items) : [
        { id: 'f-1', employee_id: 'emp-12', file_name: 'بطاقة_الرقم_القومي.pdf', file_type: 'application/pdf', file_size: '1.2 MB', file_url: '#', uploaded_at: '2021-10-02T10:00:00Z' },
        { id: 'f-2', employee_id: 'emp-12', file_name: 'شهادة_المؤهل_الدراسي.pdf', file_type: 'application/pdf', file_size: '950 KB', file_url: '#', uploaded_at: '2021-10-02T10:15:00Z' },
      ];
    } catch {
      return [];
    }
  });

  const saveFiles = (filesList: EmployeeFile[]) => {
    localStorage.setItem('quds_hr_files', JSON.stringify(filesList));
    setUploadedFiles(filesList);
  };

  // Drag & Drop visual state
  const [dragActive, setDragActive] = useState(false);

  // Modals management
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  
  // Double confirmation deletion
  const [showDeleteStep1, setShowDeleteStep1] = useState(false);
  const [showDeleteStep2, setShowDeleteStep2] = useState(false);
  const [empToDelete, setEmpToDelete] = useState<string | null>(null);

  // Form Field States
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empGender, setEmpGender] = useState<'Male' | 'Female'>('Male');
  const [empNatId, setEmpNatId] = useState('');
  const [empDeptId, setEmpDeptId] = useState('dept-prod');
  const [empPosId, setEmpPosId] = useState('pos-mach-op');
  const [empBasicSalary, setEmpBasicSalary] = useState(6000);
  const [empAllowances, setEmpAllowances] = useState(500);
  const [empRoleId, setEmpRoleId] = useState('role-employee');
  const [empJoinDate, setEmpJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [empContractType, setEmpContractType] = useState<'Permanent' | 'Fixed-term' | 'Temporary'>('Fixed-term');

  // Expanded Master File Form States
  const [empNo, setEmpNo] = useState('');
  const [empSocialSecurityNo, setEmpSocialSecurityNo] = useState('');
  const [empFingerprintNo, setEmpFingerprintNo] = useState('');
  const [empEmergencyPhone, setEmpEmergencyPhone] = useState('');
  const [empAddress, setEmpAddress] = useState('');
  const [empAddressProvince, setEmpAddressProvince] = useState('');
  const [empAddressCity, setEmpAddressCity] = useState('');
  const [empBirthDate, setEmpBirthDate] = useState('1990-01-01');
  const [empMaritalStatus, setEmpMaritalStatus] = useState<'Single' | 'Married' | 'Divorced' | 'Widowed'>('Single');
  const [empChildrenCount, setEmpChildrenCount] = useState(0);
  const [empNationality, setEmpNationality] = useState('مصري');
  const [empQualification, setEmpQualification] = useState('');
  const [empSpecialization, setEmpSpecialization] = useState('');
  const [empPreviousExperience, setEmpPreviousExperience] = useState('');
  const [empContractEndDate, setEmpContractEndDate] = useState('');
  const [empSection, setEmpSection] = useState('');
  const [empShiftId, setEmpShiftId] = useState('shift-1');
  const [empWorkplace, setEmpWorkplace] = useState('');
  const [empIncentives, setEmpIncentives] = useState(300);
  const [empDeductions, setEmpDeductions] = useState(0);
  const [empInsuranceAmount, setEmpInsuranceAmount] = useState(450);
  const [empBankAccount, setEmpBankAccount] = useState('');
  const [empStatus, setEmpStatus] = useState<EmployeeStatus>('Active');
  const [empSuspensionReason, setEmpSuspensionReason] = useState('');

  // Master File Dashboard Modal state
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterTab, setMasterTab] = useState<'info' | 'leaves' | 'finance' | 'discipline' | 'attendance' | 'complaints' | 'performance' | 'security' | 'attachments'>('info');

  // Performance reviews states
  const [performanceReviews, setPerformanceReviews] = useState(() => getPerformanceReviews());
  const [newFeedback, setNewFeedback] = useState('');
  const [newScore, setNewScore] = useState(5);
  const [newRecs, setNewRecs] = useState('');

  // Deactivation Form State
  const [deactReason, setDeactReason] = useState('');
  const [deactDate, setDeactDate] = useState(new Date().toISOString().split('T')[0]);
  const [empToDeactivate, setEmpToDeactivate] = useState<Employee | null>(null);

  // Editing State
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);

  // Check roles permissions
  const canManage = currentUser.role_id === 'role-admin' || currentUser.role_id === 'role-hr';
  const isAdmin = currentUser.role_id === 'role-admin';

  // Get matching positions for selected department
  const availablePositions = positions.filter(p => p.department_id === empDeptId);

  // Handle Drag & Drop Upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, empId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], empId);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, empId: string) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0], empId);
    }
  };

  const handleFileUpload = (file: File, empId: string) => {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const newFile: EmployeeFile = {
      id: 'file-' + Date.now(),
      employee_id: empId,
      file_name: file.name,
      file_type: file.type || 'application/octet-stream',
      file_size: `${sizeMB} MB`,
      file_url: '#',
      uploaded_at: new Date().toISOString()
    };

    const updated = [newFile, ...uploadedFiles];
    saveFiles(updated);

    // Audit Log
    addAuditLog(currentUser.id, currentUser.name, 'UPLOAD_FILE', 'الموظفون', 'employee_files', newFile.id, '', JSON.stringify(newFile));
  };

  const handleDeleteFile = (fileId: string) => {
    const updated = uploadedFiles.filter(f => f.id !== fileId);
    saveFiles(updated);
  };

  // Handle Deactivation / Inactivation
  const handleDeactivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empToDeactivate || !deactReason) return;

    const updatedEmps = employees.map(emp => {
      if (emp.id === empToDeactivate.id) {
        return {
          ...emp,
          status: 'Inactive' as const,
          termination_date: deactDate,
          termination_reason: deactReason
        };
      }
      return emp;
    });

    setEmployees(updatedEmps);
    saveEmployees(updatedEmps);

    // Update contract status to expired or terminated
    const updatedContracts = contracts.map(con => {
      if (con.employee_id === empToDeactivate.id) {
        return { ...con, status: 'Terminated' as const };
      }
      return con;
    });
    setContracts(updatedContracts);
    saveContracts(updatedContracts);

    // Log Audit
    addAuditLog(
      currentUser.id,
      currentUser.name,
      'DEACTIVATE_EMPLOYEE',
      'الموظفون',
      'employees',
      empToDeactivate.id,
      '{"status": "Active"}',
      `{"status": "Inactive", "reason": "${deactReason}"}`
    );

    // Refresh selected profile if open
    if (selectedEmp && selectedEmp.id === empToDeactivate.id) {
      setSelectedEmp({
        ...selectedEmp,
        status: 'Inactive',
        termination_date: deactDate,
        termination_reason: deactReason
      });
    }

    setEmpToDeactivate(null);
    setDeactReason('');
    setShowDeactivateModal(false);
  };

  // Permanent Deletion Step 1
  const startPermanentDelete = (empId: string) => {
    setEmpToDelete(empId);
    setShowDeleteStep1(true);
  };

  // Permanent Deletion Step 2 (Double confirmation)
  const confirmDeleteStep1 = () => {
    setShowDeleteStep1(false);
    setShowDeleteStep2(true);
  };

  const executePermanentDelete = () => {
    if (!empToDelete) return;

    // Remove from employee list
    const updated = employees.filter(e => e.id !== empToDelete);
    setEmployees(updated);
    saveEmployees(updated);

    // Clean contracts
    const updatedContracts = contracts.filter(c => c.employee_id !== empToDelete);
    setContracts(updatedContracts);
    saveContracts(updatedContracts);

    // Clean files
    const updatedFiles = uploadedFiles.filter(f => f.employee_id !== empToDelete);
    saveFiles(updatedFiles);

    addAuditLog(
      currentUser.id,
      currentUser.name,
      'PERMANENT_DELETE_EMPLOYEE',
      'الموظفون',
      'employees',
      empToDelete,
      JSON.stringify(employees.find(e => e.id === empToDelete)),
      ''
    );

    if (selectedEmp && selectedEmp.id === empToDelete) {
      setSelectedEmp(null);
    }

    setEmpToDelete(null);
    setShowDeleteStep2(false);
  };

  // Form submission: Create Employee
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName || !empNatId) return;

    const newEmpId = 'emp-' + Date.now();
    const generatedEmpNo = `Q-${1001 + employees.length}`;
    
    const newEmp: Employee = {
      id: newEmpId,
      name: empName,
      email: empEmail || `${newEmpId}@qudsplastic.com`,
      phone: empPhone,
      gender: empGender,
      national_id: empNatId,
      department_id: empDeptId,
      position_id: empPosId,
      status: empStatus || 'Active',
      join_date: empJoinDate,
      manager_id: departments.find(d => d.id === empDeptId)?.manager_id || null,
      basic_salary: Number(empBasicSalary),
      allowances: Number(empAllowances),
      role_id: empRoleId,
      created_at: new Date().toISOString(),
      
      // Master File Fields
      employee_no: generatedEmpNo,
      personal_photo: empGender === 'Female' 
        ? `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80`
        : `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80`,
      social_security_no: empSocialSecurityNo,
      fingerprint_no: empFingerprintNo,
      emergency_phone: empEmergencyPhone,
      address: empAddress,
      address_province: empAddressProvince,
      address_city: empAddressCity,
      birth_date: empBirthDate,
      marital_status: empMaritalStatus,
      children_count: Number(empChildrenCount),
      nationality: empNationality,
      qualification: empQualification,
      specialization: empSpecialization,
      previous_experience: empPreviousExperience,
      contract_end_date: empContractEndDate,
      contract_type: empContractType,
      section: empSection,
      shift_id: empShiftId,
      workplace: empWorkplace,
      incentives: Number(empIncentives),
      deductions: Number(empDeductions),
      insurance_amount: Number(empInsuranceAmount),
      bank_account: empBankAccount,
      suspension_reason: empStatus === 'Suspended' ? empSuspensionReason : undefined,

      career_progression: [
        {
          id: 'cp-' + Date.now(),
          employee_id: newEmpId,
          date: empJoinDate,
          type: 'Contract Renewal',
          old_title: positions.find(p => p.id === empPosId)?.title || 'معين جديد',
          new_title: positions.find(p => p.id === empPosId)?.title || 'معين جديد',
          old_salary: Number(empBasicSalary),
          new_salary: Number(empBasicSalary),
          notes: 'مباشرة وتثبيت العمل عند التعيين الأولي وملف الماستر المتكامل'
        }
      ]
    };

    const updatedEmps = [...employees, newEmp];
    setEmployees(updatedEmps);
    saveEmployees(updatedEmps);

    // Create Work Contract
    const newContract: Contract = {
      id: 'con-' + Date.now(),
      employee_id: newEmpId,
      start_date: empJoinDate,
      end_date: empContractEndDate || new Date(new Date(empJoinDate).setFullYear(new Date(empJoinDate).getFullYear() + 2)).toISOString().split('T')[0], // 2 years default
      contract_type: empContractType,
      status: 'Active'
    };
    const updatedContracts = [...contracts, newContract];
    setContracts(updatedContracts);
    saveContracts(updatedContracts);

    // Log Audit
    addAuditLog(
      currentUser.id,
      currentUser.name,
      'CREATE_EMPLOYEE',
      'الموظفون',
      'employees',
      newEmpId,
      '',
      JSON.stringify(newEmp)
    );

    // Reset Form
    setEmpName('');
    setEmpEmail('');
    setEmpPhone('');
    setEmpGender('Male');
    setEmpNatId('');
    setEmpDeptId('dept-prod');
    setEmpPosId('pos-mach-op');
    setEmpBasicSalary(6000);
    setEmpAllowances(500);
    setEmpRoleId('role-employee');
    setEmpJoinDate(new Date().toISOString().split('T')[0]);
    setEmpContractType('Fixed-term');

    // Reset Master Form fields
    setEmpNo('');
    setEmpSocialSecurityNo('');
    setEmpFingerprintNo('');
    setEmpEmergencyPhone('');
    setEmpAddress('');
    setEmpAddressProvince('');
    setEmpAddressCity('');
    setEmpBirthDate('1990-01-01');
    setEmpMaritalStatus('Single');
    setEmpChildrenCount(0);
    setEmpNationality('مصري');
    setEmpQualification('');
    setEmpSpecialization('');
    setEmpPreviousExperience('');
    setEmpContractEndDate('');
    setEmpSection('');
    setEmpShiftId('shift-1');
    setEmpWorkplace('');
    setEmpIncentives(300);
    setEmpDeductions(0);
    setEmpInsuranceAmount(450);
    setEmpBankAccount('');
    setEmpStatus('Active');
    setEmpSuspensionReason('');
    
    setShowAddModal(false);
  };

  // Form submission: Edit Employee
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmpId) return;

    const oldEmpObj = employees.find(emp => emp.id === editingEmpId);
    if (!oldEmpObj) return;

    // Track if title/salary changed to log career progression
    const careerLogs: CareerProgressionRecord[] = [...(oldEmpObj.career_progression || [])];
    const hasPositionChanged = oldEmpObj.position_id !== empPosId;
    const hasSalaryChanged = oldEmpObj.basic_salary !== empBasicSalary;

    if (hasPositionChanged || hasSalaryChanged) {
      const oldTitle = positions.find(p => p.id === oldEmpObj.position_id)?.title || 'سابق';
      const newTitle = positions.find(p => p.id === empPosId)?.title || 'معدل';

      careerLogs.unshift({
        id: 'cp-mod-' + Date.now(),
        employee_id: editingEmpId,
        date: new Date().toISOString().split('T')[0],
        type: hasPositionChanged ? 'Promotion' : 'Salary Change',
        old_title: oldTitle,
        new_title: newTitle,
        old_salary: oldEmpObj.basic_salary,
        new_salary: Number(empBasicSalary),
        notes: 'تم تحديث المسمى الوظيفي أو الراتب عبر تعديل البيانات الإدارية للموظف.'
      });
    }

    const updatedEmployees = employees.map(emp => {
      if (emp.id === editingEmpId) {
        return {
          ...emp,
          name: empName,
          email: empEmail,
          phone: empPhone,
          gender: empGender,
          national_id: empNatId,
          department_id: empDeptId,
          position_id: empPosId,
          basic_salary: Number(empBasicSalary),
          allowances: Number(empAllowances),
          role_id: empRoleId,
          status: empStatus,
          career_progression: careerLogs,
          
          // Master File fields
          social_security_no: empSocialSecurityNo,
          fingerprint_no: empFingerprintNo,
          emergency_phone: empEmergencyPhone,
          address: empAddress,
          address_province: empAddressProvince,
          address_city: empAddressCity,
          birth_date: empBirthDate,
          marital_status: empMaritalStatus,
          children_count: Number(empChildrenCount),
          nationality: empNationality,
          qualification: empQualification,
          specialization: empSpecialization,
          previous_experience: empPreviousExperience,
          contract_end_date: empContractEndDate,
          contract_type: empContractType,
          section: empSection,
          shift_id: empShiftId,
          workplace: empWorkplace,
          incentives: Number(empIncentives),
          deductions: Number(empDeductions),
          insurance_amount: Number(empInsuranceAmount),
          bank_account: empBankAccount,
          suspension_reason: empStatus === 'Suspended' ? empSuspensionReason : undefined,
          termination_date: (empStatus === 'Resigned' || empStatus === 'Terminated' || empStatus === 'Inactive') ? (empContractEndDate || new Date().toISOString().split('T')[0]) : undefined,
          termination_reason: (empStatus === 'Resigned' || empStatus === 'Terminated' || empStatus === 'Inactive') ? `تغيير الحالة الوظيفية إلى ${empStatus}` : undefined
        };
      }
      return emp;
    });

    setEmployees(updatedEmployees);
    saveEmployees(updatedEmployees);

    const savedEmp = updatedEmployees.find(emp => emp.id === editingEmpId);

    addAuditLog(
      currentUser.id,
      currentUser.name,
      'UPDATE_EMPLOYEE',
      'الموظفون',
      'employees',
      editingEmpId,
      JSON.stringify(oldEmpObj),
      JSON.stringify(savedEmp)
    );

    // Refresh selected profile if open
    if (selectedEmp && selectedEmp.id === editingEmpId) {
      setSelectedEmp(savedEmp || null);
    }

    // Reset Form & Close
    setEditingEmpId(null);
    setShowEditModal(false);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmpId(emp.id);
    setEmpName(emp.name);
    setEmpEmail(emp.email);
    setEmpPhone(emp.phone);
    setEmpGender(emp.gender);
    setEmpNatId(emp.national_id);
    setEmpDeptId(emp.department_id);
    setEmpPosId(emp.position_id);
    setEmpBasicSalary(emp.basic_salary);
    setEmpAllowances(emp.allowances);
    setEmpRoleId(emp.role_id);
    setEmpJoinDate(emp.join_date || new Date().toISOString().split('T')[0]);
    setEmpContractType(emp.contract_type || 'Fixed-term');

    // Master File Fields
    setEmpNo(emp.employee_no || '');
    setEmpSocialSecurityNo(emp.social_security_no || '');
    setEmpFingerprintNo(emp.fingerprint_no || '');
    setEmpEmergencyPhone(emp.emergency_phone || '');
    setEmpAddress(emp.address || '');
    setEmpAddressProvince(emp.address_province || '');
    setEmpAddressCity(emp.address_city || '');
    setEmpBirthDate(emp.birth_date || '1990-01-01');
    setEmpMaritalStatus(emp.marital_status || 'Single');
    setEmpChildrenCount(emp.children_count || 0);
    setEmpNationality(emp.nationality || 'مصري');
    setEmpQualification(emp.qualification || '');
    setEmpSpecialization(emp.specialization || '');
    setEmpPreviousExperience(emp.previous_experience || '');
    setEmpContractEndDate(emp.contract_end_date || '');
    setEmpSection(emp.section || '');
    setEmpShiftId(emp.shift_id || 'shift-1');
    setEmpWorkplace(emp.workplace || '');
    setEmpIncentives(emp.incentives || 300);
    setEmpDeductions(emp.deductions || 0);
    setEmpInsuranceAmount(emp.insurance_amount || 450);
    setEmpBankAccount(emp.bank_account || '');
    setEmpStatus(emp.status || 'Active');
    setEmpSuspensionReason(emp.suspension_reason || '');

    setShowEditModal(true);
  };

  // Filter logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.national_id.includes(searchTerm);

    const matchesStatus = statusFilter === 'All' ? true : emp.status === statusFilter;
    const matchesDept = deptFilter ? emp.department_id === deptFilter : true;

    return matchesSearch && matchesStatus && matchesDept;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-900" />
            <span>إدارة شؤون الموظفين</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            تسجيل وإدارة ملفات عمال وموظفي المصنع، ومتابعة العقود، المرفقات، وسجل التدرج والتنقل الإداري.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer w-full md:w-auto"
          >
            <UserPlus className="h-4.5 w-4.5" />
            <span>تسجيل موظف جديد</span>
          </button>
        )}
      </div>

      {/* Grid: Search/Filters & Employees List */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left: Filter & List */}
        <div className="xl:col-span-2 space-y-4">
          
          {/* Search and Filters Widget */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالاسم، الهاتف، الرقم القومي..."
                className="w-full pr-9 pl-4 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-900"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>

            <div className="flex gap-2.5 flex-wrap">
              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-900 bg-white"
              >
                <option value="All">كل الموظفين</option>
                <option value="Active">النشطون بالعمل</option>
                <option value="Leave">في إجازة رسمية</option>
                <option value="Suspended">موقوفون مؤقتاً</option>
                <option value="Resigned">مستقيلون</option>
                <option value="Terminated">منتهية خدمتهم</option>
                <option value="Inactive">خامل / مؤرشف</option>
              </select>

              {/* Dept filter */}
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-900 bg-white"
              >
                <option value="">كل الأقسام والإدارات</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Employees Grid/List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">كود / اسم الموظف</th>
                    <th className="p-4">الإدارة والقسم</th>
                    <th className="p-4">الوظيفة</th>
                    <th className="p-4">الهاتف</th>
                    <th className="p-4 text-center">الحالة</th>
                    <th className="p-4 text-left">العمليات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map(emp => {
                      const dept = departments.find(d => d.id === emp.department_id);
                      const pos = positions.find(p => p.id === emp.position_id);
                      return (
                        <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{emp.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {emp.id} | National ID: {emp.national_id}</div>
                            </div>
                          </td>
                          <td className="p-4 text-slate-700 font-medium">{dept?.name}</td>
                          <td className="p-4 text-slate-600">{pos?.title}</td>
                          <td className="p-4 text-slate-600 font-mono">{emp.phone}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              emp.status === 'Active' 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                : emp.status === 'Leave'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : emp.status === 'Suspended'
                                ? 'bg-rose-50 text-rose-800 border border-rose-300'
                                : emp.status === 'Resigned'
                                ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                : emp.status === 'Terminated'
                                ? 'bg-red-50 text-red-800 border border-red-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {emp.status === 'Active' ? 'نشط' : 
                               emp.status === 'Leave' ? 'إجازة' :
                               emp.status === 'Suspended' ? 'موقوف' :
                               emp.status === 'Resigned' ? 'مستقيل' :
                               emp.status === 'Terminated' ? 'منتهي الخدمة' : 'خامل'}
                            </span>
                          </td>
                          <td className="p-4 text-left">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedEmp(emp);
                                  setProfileTab('info');
                                }}
                                className="p-1.5 text-blue-900 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                                title="عرض الملف الشخصي الكامل"
                              >
                                <Eye className="h-4.5 w-4.5" />
                              </button>
                              {canManage && emp.status === 'Active' && (
                                <button
                                  onClick={() => openEditModal(emp)}
                                  className="p-1.5 text-amber-950 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
                                  title="تعديل البيانات"
                                >
                                  <Edit className="h-4.5 w-4.5" />
                                </button>
                              )}
                              {canManage && emp.status === 'Active' && (
                                <button
                                  onClick={() => {
                                    setEmpToDeactivate(emp);
                                    setShowDeactivateModal(true);
                                  }}
                                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                                  title="إنهاء الخدمة / Deactivate"
                                >
                                  <UserX className="h-4.5 w-4.5" />
                                </button>
                              )}
                              {isAdmin && (
                                <button
                                  onClick={() => {
                                    alert("عفواً، تم تعطيل الحذف النهائي في النظام نهائياً بموجب لائحة مصنع القدس وقابلية التوسع وأرشفة المستندات. بدلاً من ذلك، يرجى تغيير حالة الموظف الإدارية إلى 'منتهي الخدمة' أو 'مستقيل' وسيتم نقل ملفه بالكامل للأرشيف الخامل بشكل آمن وقانوني.");
                                  }}
                                  className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                                  title="الحذف النهائي معطل للامتثال القانوني"
                                >
                                  <Trash2 className="h-4.5 w-4.5 text-slate-300" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        لا يوجد موظفين مسجلين يطابقون محددات البحث الحالية.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right: Selected Profile Detailed View */}
        <div className="xl:col-span-1">
          {selectedEmp ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-4">
              
              {/* Profile Card Header */}
              <div className="bg-slate-900 p-5 text-white relative">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base">{selectedEmp.name}</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      {positions.find(p => p.id === selectedEmp.position_id)?.title}
                    </p>
                    <p className="text-[11px] text-blue-400 font-semibold mt-0.5">
                      {departments.find(d => d.id === selectedEmp.department_id)?.name}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedEmp.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {selectedEmp.status === 'Active' ? 'نشط' : 'منتهي الخدمة'}
                  </span>
                </div>

                {/* Sub-info */}
                <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {selectedEmp.phone}</span>
                  <span className="flex items-center gap-1 shrink-0 truncate"><Mail className="h-3 w-3" /> {selectedEmp.email}</span>
                </div>

                {/* Master File Full Modal Trigger Button */}
                <button
                  onClick={() => {
                    setShowMasterModal(true);
                    setMasterTab('info');
                  }}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer border border-blue-500/30"
                >
                  <HardDrive className="h-4 w-4" />
                  <span>فتح ملف الماستر الشامل (Master File)</span>
                </button>
              </div>

              {/* Profile Tab selectors */}
              <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
                <button
                  onClick={() => setProfileTab('info')}
                  className={`flex-1 py-3 text-center font-bold cursor-pointer transition-all ${
                    profileTab === 'info' ? 'bg-white border-b-2 border-blue-900 text-blue-950' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  البيانات الأساسية
                </button>
                <button
                  onClick={() => setProfileTab('progression')}
                  className={`flex-1 py-3 text-center font-bold cursor-pointer transition-all ${
                    profileTab === 'progression' ? 'bg-white border-b-2 border-blue-900 text-blue-950' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  التدرج المهني ({selectedEmp.career_progression?.length || 0})
                </button>
                <button
                  onClick={() => setProfileTab('files')}
                  className={`flex-1 py-3 text-center font-bold cursor-pointer transition-all ${
                    profileTab === 'files' ? 'bg-white border-b-2 border-blue-900 text-blue-950' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  المستندات والمرفقات
                </button>
              </div>

              {/* Profile Tab Body */}
              <div className="p-5 text-xs text-slate-700 min-h-[300px]">
                
                {/* 1. Core Info Tab */}
                {profileTab === 'info' && (
                  <div className="space-y-4">
                    
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-3.5">
                      <div>
                        <span className="text-slate-400 block mb-0.5">الرقم القومي:</span>
                        <span className="font-bold text-slate-800 font-mono">{selectedEmp.national_id}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">الجنس:</span>
                        <span className="font-bold text-slate-800">{selectedEmp.gender === 'Male' ? 'ذكر' : 'أنثى'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">تاريخ التعيين:</span>
                        <span className="font-bold text-slate-800 font-mono">{selectedEmp.join_date}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">المدير المباشر:</span>
                        <span className="font-bold text-slate-800">{employees.find(e => e.id === selectedEmp.manager_id)?.name || 'غير معين'}</span>
                      </div>
                    </div>

                    {/* Financial details */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-blue-900" />
                        <span>الهيكل المالي والتعاقد</span>
                      </h4>
                      <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-500">الراتب الأساسي المعتمد:</span>
                          <span className="font-bold text-blue-950">{selectedEmp.basic_salary.toLocaleString()} ج.م</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">البدلات والحوافز الثابتة:</span>
                          <span className="font-bold text-emerald-800">+{selectedEmp.allowances.toLocaleString()} ج.م</span>
                        </div>
                        <div className="border-t border-blue-200/50 pt-2 flex justify-between font-bold">
                          <span>إجمالي المستحقات التعاقدية:</span>
                          <span className="text-blue-900">{(selectedEmp.basic_salary + selectedEmp.allowances).toLocaleString()} ج.م</span>
                        </div>
                        
                        {/* Contract */}
                        <div className="border-t border-blue-200/50 pt-2.5 text-[10px] text-slate-500 flex justify-between items-center">
                          <span>نوع العقد: <span className="font-bold text-slate-700">{contracts.find(c => c.employee_id === selectedEmp.id)?.contract_type === 'Permanent' ? 'دائم/مفتوح' : contracts.find(c => c.employee_id === selectedEmp.id)?.contract_type === 'Temporary' ? 'مؤقت وموسمي' : 'محدد المدة'}</span></span>
                          <span className="bg-blue-100 text-blue-900 font-bold px-1.5 py-0.5 rounded">نشط</span>
                        </div>
                      </div>
                    </div>

                    {/* If Inactive, show deactivation reason */}
                    {selectedEmp.status === 'Inactive' && (
                      <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                        <span className="text-rose-900 font-bold block mb-1">تفاصيل إنهاء الخدمة:</span>
                        <div className="space-y-1 text-rose-800">
                          <div>تاريخ المغادرة: <span className="font-semibold font-mono">{selectedEmp.termination_date}</span></div>
                          <div>السبب: <span className="font-semibold">{selectedEmp.termination_reason}</span></div>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* 2. Career Progression & Transfer History Tab */}
                {profileTab === 'progression' && (
                  <div className="space-y-4">
                    
                    {/* Career timeline */}
                    <div className="space-y-3.5">
                      <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                        <Award className="h-4 w-4 text-blue-950" />
                        <span>سجل الترقيات والرواتب المهني</span>
                      </h4>
                      {selectedEmp.career_progression && selectedEmp.career_progression.length > 0 ? (
                        <div className="border-r border-slate-200 pr-3 space-y-4">
                          {selectedEmp.career_progression.map((cp) => (
                            <div key={cp.id} className="relative">
                              <div className="absolute -right-[15.5px] top-1.5 h-2.5 w-2.5 bg-blue-900 rounded-full"></div>
                              <div className="text-[10px] text-slate-400 font-mono font-bold">{cp.date}</div>
                              <div className="font-bold text-slate-800 mt-0.5">{cp.type === 'Promotion' ? 'ترقية / تعديل مسمى' : cp.type === 'Salary Change' ? 'تعديل راتب' : 'تجديد وتثبيت عقد'}</div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                المسمى: <span className="text-slate-800 font-medium">{cp.old_title}</span> ← <span className="text-blue-900 font-bold">{cp.new_title}</span>
                              </p>
                              {cp.old_salary !== cp.new_salary && (
                                <p className="text-[10px] text-emerald-800 font-medium">
                                  الراتب: {cp.old_salary.toLocaleString()} ج.م ← {cp.new_salary.toLocaleString()} ج.م
                                </p>
                              )}
                              <p className="text-[10px] italic text-slate-400 mt-1">*{cp.notes}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">لا يوجد سجل تدرج مهني سابق.</p>
                      )}
                    </div>

                    {/* Department Transfers */}
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <h4 className="font-bold text-slate-900 flex items-center gap-1">
                        <ArrowLeftRight className="h-4 w-4 text-blue-950" />
                        <span>تاريخ التنقلات بين الإدارات والأقسام</span>
                      </h4>
                      {selectedEmp.transfer_history && selectedEmp.transfer_history.length > 0 ? (
                        <div className="space-y-2.5">
                          {selectedEmp.transfer_history.map(th => {
                            const oldD = departments.find(d => d.id === th.old_department_id)?.name || 'غير معروف';
                            const newD = departments.find(d => d.id === th.new_department_id)?.name || 'غير معروف';
                            return (
                              <div key={th.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                                <div className="text-[10px] font-mono text-slate-400 font-bold">{th.date}</div>
                                <div className="text-[11px] font-bold text-slate-800 mt-0.5">
                                  نقل من <span className="text-slate-500">{oldD}</span> إلى <span className="text-blue-900">{newD}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1">السبب: {th.reason}</p>
                                <div className="text-[9px] text-slate-400 mt-0.5">باعتماد: {th.approved_by}</div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">الموظف مستقر في قسم تعيينه الأولي ولم يتم نقله سابقاً.</p>
                      )}
                    </div>

                  </div>
                )}

                {/* 3. Files & Attachments Tab with drag & drop */}
                {profileTab === 'files' && (
                  <div className="space-y-4">
                    
                    {/* Drag and Drop Zone */}
                    {canManage && (
                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={(e) => handleDrop(e, selectedEmp.id)}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                          dragActive 
                            ? 'border-blue-900 bg-blue-50/50' 
                            : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                        }`}
                      >
                        <Upload className="h-7 w-7 text-slate-400 mx-auto mb-1.5" />
                        <p className="font-bold text-[11px] text-slate-700">اسحب مستند الموظف هنا لرفعه</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">أو اضغط لاختيار ملف من جهازك</p>
                        
                        <input
                          type="file"
                          id="file-input"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, selectedEmp.id)}
                        />
                        <label htmlFor="file-input" className="mt-2.5 inline-block bg-slate-800 text-white font-bold text-[10px] px-2.5 py-1 rounded-md hover:bg-slate-700 cursor-pointer">
                          تصفح الملفات
                        </label>
                      </div>
                    )}

                    {/* Files List */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-900 mb-1">المستندات المرفقة بالملف ({uploadedFiles.filter(f => f.employee_id === selectedEmp.id).length}):</h5>
                      {uploadedFiles.filter(f => f.employee_id === selectedEmp.id).length > 0 ? (
                        <div className="space-y-2">
                          {uploadedFiles.filter(f => f.employee_id === selectedEmp.id).map(file => (
                            <div key={file.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <Paperclip className="h-4 w-4 text-slate-400 shrink-0" />
                                <div className="overflow-hidden">
                                  <div className="font-semibold text-slate-800 text-[11px] truncate" title={file.file_name}>{file.file_name}</div>
                                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">{file.file_size} • {new Date(file.uploaded_at).toLocaleDateString('ar-EG')}</div>
                                </div>
                              </div>
                              <div className="flex gap-1.5">
                                <a 
                                  href={file.file_url} 
                                  className="text-blue-900 font-bold hover:underline text-[10px]"
                                  onClick={(e) => { e.preventDefault(); alert('محاكاة: تحميل المستند جاهز للربط!'); }}
                                >
                                  تحميل
                                </a>
                                {canManage && (
                                  <button 
                                    onClick={() => handleDeleteFile(file.id)}
                                    className="text-red-600 font-bold hover:underline text-[10px] cursor-pointer"
                                  >
                                    حذف
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic py-2 text-center">لا توجد ملفات مرفوعة حالياً لهذا الموظف.</p>
                      )}
                    </div>

                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center text-slate-400 sticky top-4">
              <Eye className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-xs text-slate-700">لم يتم اختيار أي موظف</p>
              <p className="text-[11px] text-slate-500 mt-1">اختر موظفاً من القائمة لعرض تفاصيل ملفه الإداري وعقده وسجل تدرجه الوظيفي.</p>
            </div>
          )}
        </div>

      </div>

      {/* Modal: Add Employee (تسجيل موظف جديد) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200">
            <div className="bg-blue-950 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-1.5">
                <UserPlus className="h-5 w-5" />
                <span>تسجيل وتعيين موظف جديد بالمصنع</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-white hover:text-slate-200 cursor-pointer text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-sm text-right max-h-[80vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الرباعي الكامل للموظف:</label>
                  <input
                    type="text"
                    required
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="مثال: محمد سعيد عبد العال"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs"
                  />
                </div>

                {/* National ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الرقم القومي (14 رقم):</label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    minLength={14}
                    value={empNatId}
                    onChange={(e) => setEmpNatId(e.target.value.replace(/\D/g, ''))}
                    placeholder="29505121400123"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs font-mono"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف:</label>
                  <input
                    type="tel"
                    required
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs font-mono"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني:</label>
                  <input
                    type="email"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    placeholder="name@qudsplastic.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs font-mono"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الجنس:</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" checked={empGender === 'Male'} onChange={() => setEmpGender('Male')} />
                      <span>ذكر</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" checked={empGender === 'Female'} onChange={() => setEmpGender('Female')} />
                      <span>أنثى</span>
                    </label>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">صلاحيات النظام للموظف:</label>
                  <select
                    value={empRoleId}
                    onChange={(e) => setEmpRoleId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs bg-white"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name_ar}</option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">إدارة التعيين:</label>
                  <select
                    value={empDeptId}
                    onChange={(e) => {
                      setEmpDeptId(e.target.value);
                      // Auto pick first position in that department
                      const posInDept = positions.find(p => p.department_id === e.target.value);
                      if (posInDept) setEmpPosId(posInDept.id);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs bg-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المسمى الوظيفي المتاح:</label>
                  <select
                    value={empPosId}
                    onChange={(e) => {
                      setEmpPosId(e.target.value);
                      // Auto load base salary of position as starting base
                      const posObj = positions.find(p => p.id === e.target.value);
                      if (posObj) {
                        setEmpBasicSalary(posObj.base_salary);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs bg-white"
                  >
                    {availablePositions.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                {/* Basic Salary */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الراتب الأساسي التعاقدي (ج.م):</label>
                  <input
                    type="number"
                    required
                    value={empBasicSalary}
                    onChange={(e) => setEmpBasicSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs font-mono"
                  />
                </div>

                {/* Allowances */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">البدلات والحوافز الثابتة (ج.م):</label>
                  <input
                    type="number"
                    required
                    value={empAllowances}
                    onChange={(e) => setEmpAllowances(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs font-mono"
                  />
                </div>

                {/* Join Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ تعيين مباشرة العمل:</label>
                  <input
                    type="date"
                    required
                    value={empJoinDate}
                    onChange={(e) => setEmpJoinDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs font-mono"
                  />
                </div>

                {/* Contract Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع التعاقد القانوني:</label>
                  <select
                    value={empContractType}
                    onChange={(e) => setEmpContractType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs bg-white"
                  >
                    <option value="Fixed-term">محدد المدة (سنتين)</option>
                    <option value="Permanent">دائم / مفتوح</option>
                    <option value="Temporary">عقد مؤقت / موسمي</option>
                  </select>
                </div>
              </div>

              {/* Info Notice */}
              <div className="bg-blue-50 p-3 rounded-lg text-blue-900 text-xs flex gap-1.5">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  عند الحفظ، سيقوم النظام تلقائياً بإنشاء ملف الموظف ومباشرة عقده القانوني، كما سيقوم بجدولة سجل تاريخ التعيين في الأرشيف وتوثيق العملية في سجل الأمان.
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  تعيين وتأكيد البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Employee (تعديل بيانات موظف) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-950 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-1.5">
                <Edit className="h-5 w-5" />
                <span>تعديل بيانات ملف الموظف</span>
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-white hover:text-slate-200 cursor-pointer text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-sm text-right max-h-[80vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل:</label>
                  <input
                    type="text"
                    required
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الرقم القومي:</label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    value={empNatId}
                    onChange={(e) => setEmpNatId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف:</label>
                  <input
                    type="tel"
                    required
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني:</label>
                  <input
                    type="email"
                    required
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الإدارة والموقع:</label>
                  <select
                    value={empDeptId}
                    onChange={(e) => {
                      setEmpDeptId(e.target.value);
                      const posInDept = positions.find(p => p.department_id === e.target.value);
                      if (posInDept) setEmpPosId(posInDept.id);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs bg-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المسمى الوظيفي:</label>
                  <select
                    value={empPosId}
                    onChange={(e) => setEmpPosId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs bg-white"
                  >
                    {availablePositions.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الراتب الأساسي (ج.م):</label>
                  <input
                    type="number"
                    required
                    value={empBasicSalary}
                    onChange={(e) => setEmpBasicSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">البدلات (ج.م):</label>
                  <input
                    type="number"
                    required
                    value={empAllowances}
                    onChange={(e) => setEmpAllowances(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">صلاحية الحساب:</label>
                  <select
                    value={empRoleId}
                    onChange={(e) => setEmpRoleId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs bg-white"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name_ar}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  تعديل وحفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Deactivate Employee (إنهاء الخدمة - نقل لحالة خامل) */}
      {showDeactivateModal && empToDeactivate && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-800 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-1.5">
                <UserX className="h-5 w-5" />
                <span>إقرار إنهاء خدمة الموظف ({empToDeactivate.name})</span>
              </h3>
              <button 
                onClick={() => setShowDeactivateModal(false)}
                className="text-white hover:text-slate-200 cursor-pointer text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleDeactivateSubmit} className="p-6 space-y-4 text-sm text-right">
              
              <div className="bg-amber-50 p-3 rounded-lg text-amber-900 text-xs flex gap-1.5">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <span className="font-bold">مبدأ حفظ البيانات:</span> لن يتم حذف هذا الموظف نهائياً. سيتم نقله للأرشيف الخامل لحفظ ملفات عقوده وسجل عملياته التاريخية.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ انتهاء الخدمة الفعلي:</label>
                <input
                  type="date"
                  required
                  value={deactDate}
                  onChange={(e) => setDeactDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سبب إنهاء الخدمة / التفاصيل القانونية:</label>
                <textarea
                  required
                  value={deactReason}
                  onChange={(e) => setDeactReason(e.target.value)}
                  placeholder="مثال: تقديم استقالة رسمية مسجلة برغبة العامل، انتهاء العقد محدد المدة، إلخ..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeactivateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
                >
                  تراجع
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  تأكيد إنهاء الخدمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOUBLE CONFIRMATION DELETE: STEP 1 */}
      {showDeleteStep1 && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-red-200">
            <div className="bg-red-700 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-1.5">
                <AlertTriangle className="h-5 w-5" />
                <span>تحذير أمان: حذف موظف نهائياً (خطوة 1/2)</span>
              </h3>
              <button 
                onClick={() => setShowDeleteStep1(false)}
                className="text-white hover:text-slate-200 cursor-pointer text-lg font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4 text-right text-xs">
              <p className="text-slate-700 text-sm font-semibold">
                هل أنت متأكد من رغبتك في حذف هذا الموظف حذفاً نهائياً؟
              </p>
              <p className="text-slate-500 leading-relaxed">
                إن حذف سجل الموظف سيؤدي لتدمير ملفه الشخصي وعقوده، ملفات المرفقات، سجل التدرج الوظيفي، وتاريخ الحضور والانصراف بالكامل من قواعد البيانات. لا ننصح بهذا الإجراء إلا لمدخلات خاطئة تماماً.
              </p>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setShowDeleteStep1(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  إلغاء التدمير
                </button>
                <button
                  onClick={confirmDeleteStep1}
                  className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold shadow-xs transition-all cursor-pointer"
                >
                  أنا متأكد، استمرار للمرحلة الأخيرة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOUBLE CONFIRMATION DELETE: STEP 2 (The second sequential confirmation requested!) */}
      {showDeleteStep2 && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-red-600 animate-bounce">
            <div className="bg-red-950 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-1.5">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span>تأكيد الإجراء النهائي المدمر (خطوة 2/2)</span>
              </h3>
              <button 
                onClick={() => setShowDeleteStep2(false)}
                className="text-white hover:text-slate-200 cursor-pointer text-lg font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4 text-right text-xs">
              <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-lg flex gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
                <p className="font-bold">
                  تحذير أخير وصارم: لا يمكن التراجع عن هذا الإجراء مطلقاً بعد الضغط على زر الحذف النهائي!
                </p>
              </div>
              <p className="text-slate-600">
                لقد طلب المشرع حماية بيانات الموظفين. هل تؤكد تدمير كامل سجلات وملفات الموظف {employees.find(e => e.id === empToDelete)?.name} نهائياً؟
              </p>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setShowDeleteStep2(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  تراجع فوراً (آمن)
                </button>
                <button
                  onClick={executePermanentDelete}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs transition-all cursor-pointer"
                >
                  نعم، تدمير وحذف السجل نهائياً
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL EMPLOYEE MASTER FILE DASHBOARD MODAL */}
      {showMasterModal && selectedEmp && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4 text-right">
          <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-7xl h-full max-h-[95vh] flex flex-col overflow-hidden border border-slate-200">
            
            {/* Modal Header Banner */}
            <div className="bg-slate-900 text-white px-6 py-4.5 flex justify-between items-center shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full border border-slate-700 overflow-hidden bg-slate-800 shrink-0">
                  <img 
                    src={selectedEmp.personal_photo || (selectedEmp.gender === 'Female' 
                      ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
                      : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80")} 
                    alt={selectedEmp.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base md:text-lg tracking-tight">{selectedEmp.name}</h3>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono font-bold">
                      {selectedEmp.employee_no || `Q-${selectedEmp.id}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                    <span>{positions.find(p => p.id === selectedEmp.position_id)?.title}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-blue-400 font-semibold">
                      {departments.find(d => d.id === selectedEmp.department_id)?.name}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedEmp.status === 'Active' 
                    ? 'bg-emerald-500/20 text-emerald-300' 
                    : selectedEmp.status === 'Leave'
                    ? 'bg-amber-500/20 text-amber-300'
                    : selectedEmp.status === 'Suspended'
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-slate-500/20 text-slate-300'
                }`}>
                  {selectedEmp.status === 'Active' ? 'نشط بالعمل' : 
                   selectedEmp.status === 'Leave' ? 'في إجازة' :
                   selectedEmp.status === 'Suspended' ? 'موقوف مؤقتاً' :
                   selectedEmp.status === 'Resigned' ? 'مستقيل' :
                   selectedEmp.status === 'Terminated' ? 'خدمة منتهية' : 'خامل'}
                </span>
                
                <button
                  onClick={() => {
                    setShowMasterModal(false);
                    openEditModal(selectedEmp);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="h-4 w-4" />
                  <span>تعديل</span>
                </button>

                <button
                  onClick={() => setShowMasterModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white h-8.5 w-8.5 rounded-full flex items-center justify-center text-lg font-bold transition-all cursor-pointer"
                  title="إغلاق ملف الماستر"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Dashboard Sidebar + Content Layout */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Left-hand Sidebar Categories Navigation */}
              <div className="w-56 md:w-64 bg-slate-900 border-l border-slate-800 flex flex-col p-4 space-y-1 overflow-y-auto shrink-0 select-none">
                <div className="text-[10px] font-bold text-slate-500 px-3 pb-2 uppercase tracking-wider">
                  تصنيفات ملف الماستر الشامل
                </div>

                <button
                  onClick={() => setMasterTab('info')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-right transition-all cursor-pointer ${
                    masterTab === 'info' 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <span>البيانات الموحدة (40+ حقل)</span>
                </button>

                <button
                  onClick={() => setMasterTab('leaves')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    masterTab === 'leaves' 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>الإجازات والإضافي</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md font-mono">
                    {getLeaveRequests().filter(l => l.employee_id === selectedEmp.id).length + getOvertimeRequests().filter(o => o.employee_id === selectedEmp.id).length}
                  </span>
                </button>

                <button
                  onClick={() => setMasterTab('finance')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    masterTab === 'finance' 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <DollarSign className="h-4 w-4 shrink-0" />
                    <span>الماليات والسلف والهيكل</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md font-mono">
                    {getLoanRequests().filter(l => l.employee_id === selectedEmp.id).length}
                  </span>
                </button>

                <button
                  onClick={() => setMasterTab('discipline')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    masterTab === 'discipline' 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Award className="h-4 w-4 shrink-0" />
                    <span>الجزاءات والمكافآت</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md font-mono">
                    {getPenalties().filter(p => p.employee_id === selectedEmp.id).length + getBonuses().filter(b => b.employee_id === selectedEmp.id).length}
                  </span>
                </button>

                <button
                  onClick={() => setMasterTab('attendance')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    masterTab === 'attendance' 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>الحضور والانصراف</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md font-mono">
                    {getAttendance().filter(a => a.employee_id === selectedEmp.id).length}
                  </span>
                </button>

                <button
                  onClick={() => setMasterTab('complaints')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    masterTab === 'complaints' 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>الشكاوى والتظلمات</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md font-mono">
                    {getComplaints().filter(c => c.employee_id === selectedEmp.id).length}
                  </span>
                </button>

                <button
                  onClick={() => setMasterTab('performance')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    masterTab === 'performance' 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>تقييمات الأداء والترشيح</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md font-mono">
                    {performanceReviews.filter(p => p.employee_id === selectedEmp.id).length}
                  </span>
                </button>

                <button
                  onClick={() => setMasterTab('attachments')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    masterTab === 'attachments' 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <HardDrive className="h-4 w-4 shrink-0" />
                    <span>المرفقات والمستندات</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md font-mono">
                    {uploadedFiles.filter(f => f.employee_id === selectedEmp.id).length} / 5
                  </span>
                </button>

                <button
                  onClick={() => setMasterTab('security')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    masterTab === 'security' 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Shield className="h-4 w-4 shrink-0" />
                    <span>سجل التعديلات والأمان</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md font-mono">
                    {getAuditLogs().filter(a => a.record_id === selectedEmp.id).length + getLoginLogs().filter(l => l.employee_id === selectedEmp.id).length}
                  </span>
                </button>
              </div>

              {/* Main Tab View - Right Panel Content */}
              <div className="flex-1 bg-slate-50 p-6 overflow-y-auto text-xs text-slate-700">
                
                {/* TAB 1: 40+ FIELD MASTER SPECIFICATION */}
                {masterTab === 'info' && (
                  <div className="space-y-6">
                    
                    {/* Header Banner inside content */}
                    <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">سجل ملف الماستر الكامل الشامل | Comprehensive Employee Master Record</h4>
                        <p className="text-slate-500 mt-1">تخطيط بانتو متكامل يعرض كامل المعطيات والمقومات الديموغرافية والمالية والإدارية للملف الموحد.</p>
                      </div>
                      <span className="text-slate-400 font-mono text-[10px]">{new Date().toISOString().split('T')[0]}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      
                      {/* Bento Card 1: البيانات التعريفية */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-blue-900 font-bold text-sm">
                          <Fingerprint className="h-4.5 w-4.5" />
                          <span>البيانات التعريفية القانونية</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-slate-400 block mb-0.5">كود الموظف (Auto):</span>
                            <span className="font-bold text-slate-800 font-mono text-[11px]">{selectedEmp.employee_no || 'معلق'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">الرقم الوظيفي الفريد:</span>
                            <span className="font-bold text-slate-800 font-mono text-[11px]">{selectedEmp.id}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-400 block mb-0.5">الاسم الكامل (رباعي):</span>
                            <span className="font-bold text-slate-900 text-xs">{selectedEmp.name}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-400 block mb-0.5">الرقم القومي (14 خانة):</span>
                            <span className="font-bold text-slate-800 font-mono text-[11px]">{selectedEmp.national_id}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">الرقم التأميني:</span>
                            <span className="font-bold text-slate-800 font-mono text-[11px]">{selectedEmp.social_security_no || 'غير مؤمن'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">رقم جهاز البصمة:</span>
                            <span className="font-bold text-slate-800 font-mono text-[11px]">{selectedEmp.fingerprint_no || 'غير مدخل'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bento Card 2: الاتصال والإقامة */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-blue-900 font-bold text-sm">
                          <MapPin className="h-4.5 w-4.5" />
                          <span>بيانات الاتصال والعنوان الفعلي</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-slate-400 block mb-0.5">رقم الهاتف:</span>
                            <span className="font-bold text-slate-800 font-mono text-[11px]">{selectedEmp.phone}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">هاتف الطوارئ:</span>
                            <span className="font-bold text-slate-800 font-mono text-[11px]">{selectedEmp.emergency_phone || 'لا يوجد'}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-400 block mb-0.5">البريد الإلكتروني للعمل:</span>
                            <span className="font-bold text-slate-800 font-mono text-[11px]">{selectedEmp.email}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-400 block mb-0.5">العنوان بالتفصيل:</span>
                            <span className="font-bold text-slate-800 text-[11px]">{selectedEmp.address || 'غير محدد'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">المحافظة:</span>
                            <span className="font-bold text-slate-800 text-[11px]">{selectedEmp.address_province || 'غير محدد'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">المدينة / المركز:</span>
                            <span className="font-bold text-slate-800 text-[11px]">{selectedEmp.address_city || 'غير محدد'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bento Card 3: الخصائص الديموغرافية */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-blue-900 font-bold text-sm">
                          <Users className="h-4.5 w-4.5" />
                          <span>الخصائص الديموغرافية والاجتماعية</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-slate-400 block mb-0.5">تاريخ الميلاد:</span>
                            <span className="font-bold text-slate-800 font-mono text-[11px]">{selectedEmp.birth_date || 'غير مسجل'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">السن (محسوب تلقائياً):</span>
                            <span className="font-bold text-slate-800 text-[11px]">{calculateAge(selectedEmp.birth_date)} سنة</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">النوع / الجنس:</span>
                            <span className="font-bold text-slate-800 text-[11px]">{selectedEmp.gender === 'Female' ? 'أنثى' : 'ذكر'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5 font-bold text-blue-900">الحالة الاجتماعية:</span>
                            <span className="font-bold text-slate-800 text-[11px]">
                              {selectedEmp.marital_status === 'Single' ? 'أعزب' :
                               selectedEmp.marital_status === 'Married' ? 'متزوج' :
                               selectedEmp.marital_status === 'Divorced' ? 'مطلق' :
                               selectedEmp.marital_status === 'Widowed' ? 'أرمل' : 'غير محدد'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">عدد الأولاد المعالين:</span>
                            <span className="font-bold text-slate-800 text-[11px]">{selectedEmp.children_count !== undefined ? selectedEmp.children_count : 0} أبناء</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">الجنسية الرسمية:</span>
                            <span className="font-bold text-slate-800 text-[11px]">{selectedEmp.nationality || 'مصري'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bento Card 4: المؤهلات والخبرات */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-blue-900 font-bold text-sm">
                          <GraduationCap className="h-4.5 w-4.5" />
                          <span>المؤهلات الدراسية والخبرات المهنية</span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <span className="text-slate-400 block mb-0.5">المؤهل الدراسي الأعلى:</span>
                            <span className="font-bold text-slate-800 text-[11px]">{selectedEmp.qualification || 'دبلوم متوسط أو مكافئ'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">التخصص الأكاديمي / الفني:</span>
                            <span className="font-bold text-slate-800 text-[11px]">{selectedEmp.specialization || 'غير مدخل'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">الخبرات السابقة بالتفصيل:</span>
                            <p className="font-medium text-slate-600 leading-relaxed text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                              {selectedEmp.previous_experience || 'لا يوجد تفاصيل خبرات مضافة.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bento Card 5: عقود العمل والتوظيف */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-blue-900 font-bold text-sm">
                          <Briefcase className="h-4.5 w-4.5" />
                          <span>عقود التوظيف والمكان الإداري</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-[10px]">
                          <div>
                            <span className="text-slate-400 block mb-0.5">تاريخ التعيين الفعلي:</span>
                            <span className="font-bold text-slate-800 font-mono">{selectedEmp.join_date}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">تاريخ انتهاء التعاقد:</span>
                            <span className="font-bold text-slate-800 font-mono">{selectedEmp.contract_end_date || 'غير محدد'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">نوع التعيين / التعاقد:</span>
                            <span className="font-bold text-blue-950">
                              {selectedEmp.contract_type === 'Permanent' ? 'دائم مفتوح' : 
                               selectedEmp.contract_type === 'Temporary' ? 'مؤقت موسمي' : 'محدد المدة (سنتين)'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">القسم / الإدارة الفرعية:</span>
                            <span className="font-bold text-slate-800">{selectedEmp.section || 'خطوط البثق'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">الوردية المخصصة:</span>
                            <span className="font-bold text-slate-800">{selectedEmp.shift_id === 'shift-1' ? 'الوردية الصباحية (أ)' : selectedEmp.shift_id === 'shift-2' ? 'الوردية المسائية (ب)' : 'وردية الطوارئ الصباحية'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">مقر / صالة العمل المحددة:</span>
                            <span className="font-bold text-slate-800">{selectedEmp.workplace || 'صالة بثق البلاستيك'}</span>
                          </div>
                          <div className="col-span-2 pt-1 border-t border-slate-100 flex justify-between">
                            <span className="text-slate-400">المدير المباشر المعتمد:</span>
                            <span className="font-bold text-slate-800">
                              {selectedEmp.manager_id ? (employees.find(e => e.id === selectedEmp.manager_id)?.name || 'المهندس المسؤول') : 'مدير المصنع الرئيسي'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bento Card 6: المقومات المالية */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-blue-900 font-bold text-sm">
                          <DollarSign className="h-4.5 w-4.5" />
                          <span>الهيكل المالي والبدلات والمزايا</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-[10px]">
                          <div>
                            <span className="text-slate-400 block mb-0.5">الراتب الأساسي الشهري:</span>
                            <span className="font-bold text-slate-900 font-mono">{selectedEmp.basic_salary?.toLocaleString()} ج.م</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">البدلات الثابتة المعتمدة:</span>
                            <span className="font-bold text-emerald-800 font-mono">+{selectedEmp.allowances?.toLocaleString()} ج.م</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">الحوافز الإنتاجية المخصصة:</span>
                            <span className="font-bold text-blue-800 font-mono">+{selectedEmp.incentives !== undefined ? selectedEmp.incentives?.toLocaleString() : '300'} ج.م</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5 font-bold text-rose-800">الاستقطاعات والخصومات:</span>
                            <span className="font-bold text-rose-800 font-mono">-{selectedEmp.deductions !== undefined ? selectedEmp.deductions?.toLocaleString() : '0'} ج.م</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">قيمة الاشتراك التأميني الشهري:</span>
                            <span className="font-bold text-slate-800 font-mono">{(selectedEmp.insurance_amount || 450)?.toLocaleString()} ج.م</span>
                          </div>
                          <div className="col-span-2 pt-1 border-t border-slate-100">
                            <span className="text-slate-400 block mb-0.5">رقم الحساب البنكي / طريقة صرف الراتب:</span>
                            <span className="font-bold text-slate-800 font-mono block truncate">{selectedEmp.bank_account || 'نقداً عبر الخزينة'}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* TAB 2: LEAVES & OVERTIME */}
                {masterTab === 'leaves' && (
                  <div className="space-y-6">
                    
                    {/* Part A: Leaves */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <Calendar className="h-4.5 w-4.5 text-blue-900" />
                          <span>سجل الإجازات والأرصدة للعام الحالي</span>
                        </h4>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-bold">
                          إجمالي رصيد الموظف: 21 يوم
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-[11px] text-slate-600">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-3">رقم الطلب</th>
                              <th className="p-3">نوع الإجازة</th>
                              <th className="p-3">الفترة (من - إلى)</th>
                              <th className="p-3">المدة (أيام)</th>
                              <th className="p-3">السبب / المرفق الطبي</th>
                              <th className="p-3 text-center">الحالة</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {getLeaveRequests().filter(l => l.employee_id === selectedEmp.id).length > 0 ? (
                              getLeaveRequests().filter(l => l.employee_id === selectedEmp.id).map(l => (
                                <tr key={l.id} className="hover:bg-slate-50">
                                  <td className="p-3 font-mono text-[10px]">{l.id}</td>
                                  <td className="p-3 font-bold">{l.leave_type === 'Annual' ? 'إجازة سنوية اعتادية' : l.leave_type === 'Sick' ? 'إجازة مرضية معتمدة' : 'إجازة عارضة طارئة'}</td>
                                  <td className="p-3 font-mono">{l.start_date} إلى {l.end_date}</td>
                                  <td className="p-3 font-bold">{l.days_count} أيام</td>
                                  <td className="p-3">{l.reason}</td>
                                  <td className="p-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                                      l.status === 'Approved' 
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                        : l.status === 'Rejected'
                                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                                    }`}>
                                      {l.status === 'Approved' ? 'معتمدة' : l.status === 'Rejected' ? 'مرفوضة' : 'قيد المراجعة'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="text-center py-6 text-slate-400">لا توجد طلبات إجازة مسجلة في هذا الملف.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Part B: Overtime */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <Clock className="h-4.5 w-4.5 text-blue-900" />
                          <span>سجل الساعات الإضافية المصرح بها</span>
                        </h4>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-[11px] text-slate-600">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-3">رقم الطلب</th>
                              <th className="p-3">تاريخ التشغيل الإضافي</th>
                              <th className="p-3">عدد الساعات</th>
                              <th className="p-3">نوع الساعات (نهاري/ليلي)</th>
                              <th className="p-3">مبرر العمل الإضافي ومحضر الإنتاج</th>
                              <th className="p-3 text-center">حالة الاعتماد المالي</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {getOvertimeRequests().filter(o => o.employee_id === selectedEmp.id).length > 0 ? (
                              getOvertimeRequests().filter(o => o.employee_id === selectedEmp.id).map(o => (
                                <tr key={o.id} className="hover:bg-slate-50">
                                  <td className="p-3 font-mono text-[10px]">{o.id}</td>
                                  <td className="p-3 font-mono">{o.date}</td>
                                  <td className="p-3 font-bold">{o.hours} ساعات</td>
                                  <td className="p-3">{o.multiplier === 1.5 ? 'إضافي نهاراً (معدل 1.5x)' : 'إضافي ليلاً أو عطلات (معدل 2.0x)'}</td>
                                  <td className="p-3">{o.reason}</td>
                                  <td className="p-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                                      o.status === 'Approved' 
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                                    }`}>
                                      {o.status === 'Approved' ? 'تم الاعتماد والصرف' : 'قيد الاعتماد'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="text-center py-6 text-slate-400">لا يوجد ساعات إضافية معتمدة مسجلة لهذا الموظف.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 3: FINANCE & LOANS */}
                {masterTab === 'finance' && (
                  <div className="space-y-6">
                    
                    {/* Financial Summary Bento Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-slate-400 block mb-0.5">إجمالي الدخل الشهري الثابت:</span>
                        <span className="text-lg font-bold text-slate-900 font-mono">{(selectedEmp.basic_salary + selectedEmp.allowances + (selectedEmp.incentives || 300)).toLocaleString()} ج.م</span>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-slate-400 block mb-0.5 font-bold text-rose-800">إجمالي الاستقطاعات والتأمينات:</span>
                        <span className="text-lg font-bold text-rose-800 font-mono">{(selectedEmp.deductions + (selectedEmp.insurance_amount || 450)).toLocaleString()} ج.م</span>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-slate-400 block mb-0.5 font-bold text-blue-900">صافي الراتب المتوقع للصرف:</span>
                        <span className="text-lg font-bold text-blue-900 font-mono">{((selectedEmp.basic_salary + selectedEmp.allowances + (selectedEmp.incentives || 300)) - (selectedEmp.deductions + (selectedEmp.insurance_amount || 450))).toLocaleString()} ج.م</span>
                      </div>
                    </div>

                    {/* Loans */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <DollarSign className="h-4.5 w-4.5 text-blue-900" />
                          <span>سجل سلف العاملين والأقساط المستقطعة</span>
                        </h4>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-[11px] text-slate-600">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-3">رقم السلفة</th>
                              <th className="p-3">تاريخ الطلب</th>
                              <th className="p-3">قيمة السلفة الكلية</th>
                              <th className="p-3">القسط الشهري المستقطع</th>
                              <th className="p-3">الأشهر المتبقية للصرف والسداد</th>
                              <th className="p-3 text-center">حالة الصرف والمديونية</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {getLoanRequests().filter(l => l.employee_id === selectedEmp.id).length > 0 ? (
                              getLoanRequests().filter(l => l.employee_id === selectedEmp.id).map(l => (
                                <tr key={l.id} className="hover:bg-slate-50">
                                  <td className="p-3 font-mono text-[10px]">{l.id}</td>
                                  <td className="p-3 font-mono">{l.created_at?.split('T')[0] || '2026-01-01'}</td>
                                  <td className="p-3 font-bold text-slate-900">{l.amount?.toLocaleString()} ج.م</td>
                                  <td className="p-3 font-bold text-rose-800">{(l.amount / l.installments)?.toFixed(2)} ج.م</td>
                                  <td className="p-3 font-bold">{l.installments} أقساط شهرية</td>
                                  <td className="p-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                                      l.status === 'Approved' 
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                                    }`}>
                                      {l.status === 'Approved' ? 'تمت الموافقة وقيد السداد الاستقطاعي' : 'قيد المراجعة الإدارية'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="text-center py-6 text-slate-400">لا توجد سلف أو قروض مسجلة لهذا العامل.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 4: DISCIPLINE & REWARDS */}
                {masterTab === 'discipline' && (
                  <div className="space-y-6">
                    
                    {/* Part A: Penalties */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <AlertTriangle className="h-4.5 w-4.5 text-rose-600" />
                          <span>سجل الجزاءات والخصومات الإنذارية الموقعة</span>
                        </h4>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-[11px] text-slate-600">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-3">رقم السند</th>
                              <th className="p-3">تاريخ المخالفة والواقعة</th>
                              <th className="p-3">طبيعة المخالفة القانونية</th>
                              <th className="p-3">قيمة الجزاء (خصم أيام / إنذار)</th>
                              <th className="p-3">المسؤول الذي اعتمد العقوبة</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {getPenalties().filter(p => p.employee_id === selectedEmp.id).length > 0 ? (
                              getPenalties().filter(p => p.employee_id === selectedEmp.id).map(p => (
                                <tr key={p.id} className="hover:bg-slate-50">
                                  <td className="p-3 font-mono text-[10px]">{p.id}</td>
                                  <td className="p-3 font-mono">{p.date}</td>
                                  <td className="p-3 font-bold text-slate-800">{p.reason}</td>
                                  <td className="p-3 font-bold text-rose-800">
                                    {p.amount > 0 ? `خصم مبلغ ${p.amount} ج.م` : 'إنذار كتابي رسمي بالفصل والوقف'}
                                  </td>
                                  <td className="p-3">{p.approved_by || 'الشؤون القانونية للشركة'}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="text-center py-6 text-slate-400">سجل نظيف! لا توجد جزاءات أو خصومات مسجلة لهذا العامل.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Part B: Bonuses */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <Award className="h-4.5 w-4.5 text-emerald-600" />
                          <span>سجل المكافآت التقديرية والحوافز الاستثنائية</span>
                        </h4>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-[11px] text-slate-600">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-3">رقم السند</th>
                              <th className="p-3">تاريخ الاستحقاق المالي</th>
                              <th className="p-3 font-bold">مبلغ الحافز أو المكافأة</th>
                              <th className="p-3">مبرر الصرف والتحفيز</th>
                              <th className="p-3">توقيع واعتماد الإدارة</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {getBonuses().filter(b => b.employee_id === selectedEmp.id).length > 0 ? (
                              getBonuses().filter(b => b.employee_id === selectedEmp.id).map(b => (
                                <tr key={b.id} className="hover:bg-slate-50">
                                  <td className="p-3 font-mono text-[10px]">{b.id}</td>
                                  <td className="p-3 font-mono">{b.date}</td>
                                  <td className="p-3 font-bold text-emerald-800">+{b.amount?.toLocaleString()} ج.م</td>
                                  <td className="p-3 font-bold text-slate-800">{b.reason}</td>
                                  <td className="p-3">{b.approved_by || 'الإدارة التنفيذية والمالية'}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="text-center py-6 text-slate-400">لا توجد مكافآت أو حوافز استثنائية مسجلة لهذا العامل.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 5: ATTENDANCE TIMELINE */}
                {masterTab === 'attendance' && (
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <Clock className="h-4.5 w-4.5 text-blue-900" />
                          <span>سجل الحضور اليومي وتوقيتات ماكينة البصمة</span>
                        </h4>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-[11px] text-slate-600">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-3">اليوم والتاريخ</th>
                              <th className="p-3">وقت الحضور الفعلي</th>
                              <th className="p-3">وقت الانصراف الفعلي</th>
                              <th className="p-3">ساعات العمل المؤداة</th>
                              <th className="p-3">حالة الحضور</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {getAttendance().filter(a => a.employee_id === selectedEmp.id).length > 0 ? (
                              getAttendance().filter(a => a.employee_id === selectedEmp.id).map(a => (
                                <tr key={a.id} className="hover:bg-slate-50">
                                  <td className="p-3 font-bold font-mono">{a.date}</td>
                                  <td className="p-3 font-mono">{a.clock_in || '—'}</td>
                                  <td className="p-3 font-mono">{a.clock_out || '—'}</td>
                                  <td className="p-3 font-bold font-mono">
                                    {a.clock_in && a.clock_out ? '8 ساعات و 15 دقيقة' : '—'}
                                  </td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                                      a.status === 'On Time' 
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                        : a.status === 'Absent'
                                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                                    }`}>
                                      {a.status === 'On Time' ? 'حاضر في الموعد' : a.status === 'Absent' ? 'غائب بدون إذن' : a.status === 'Late' ? 'متأخر' : 'إجازة/إذن رسمي'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="text-center py-6 text-slate-400">لا يوجد سجلات حضور وانصراف مخزنة في البصمة حالياً.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: COMPLAINTS & GRIEVANCES */}
                {masterTab === 'complaints' && (
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <Info className="h-4.5 w-4.5 text-blue-900" />
                          <span>سجل التظلمات والشكاوى والمقترحات المقدمة</span>
                        </h4>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-[11px] text-slate-600">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-3">رقم الطلب</th>
                              <th className="p-3">تاريخ التقديم</th>
                              <th className="p-3 font-bold">نوع التظلم أو المقترح</th>
                              <th className="p-3">الموضوع والتفاصيل المرفقة</th>
                              <th className="p-3 text-center">حالة الرد والمعالجة</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {getComplaints().filter(c => c.employee_id === selectedEmp.id).length > 0 ? (
                              getComplaints().filter(c => c.employee_id === selectedEmp.id).map(c => (
                                <tr key={c.id} className="hover:bg-slate-50">
                                  <td className="p-3 font-mono text-[10px]">{c.id}</td>
                                  <td className="p-3 font-mono">{c.created_at?.split('T')[0] || '2026-07-01'}</td>
                                  <td className="p-3 font-bold text-slate-950">تظلم إداري / شكوى رسمية</td>
                                  <td className="p-3">{c.content}</td>
                                  <td className="p-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                                      c.status === 'Resolved' 
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                                    }`}>
                                      {c.status === 'Resolved' ? 'تم الحل والرد كتابياً' : 'قيد الفحص والمراجعة من الإدارة المباشرة'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="text-center py-6 text-slate-400">لا يوجد شكاوى أو تظلمات مسجلة لهذا الموظف في الأرشيف.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 7: PERFORMANCE REVIEWS */}
                {masterTab === 'performance' && (
                  <div className="space-y-6">
                    
                    {/* Add Review Panel */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <UserCheck className="h-4.5 w-4.5 text-blue-900" />
                        <span>تقييم أداء جديد للموظف (خاص بمسؤولي الموارد البشرية)</span>
                      </h4>

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!newFeedback) return;
                        const newPR: PerformanceReview = {
                          id: 'pr-' + Date.now(),
                          employee_id: selectedEmp.id,
                          review_date: new Date().toISOString().split('T')[0],
                          reviewer_name: currentUser.name,
                          score: newScore,
                          feedback: newFeedback,
                          recommendations: newRecs || 'الاستمرار في العمل وبذل المزيد من التطور.'
                        };
                        const updated = [newPR, ...performanceReviews];
                        setPerformanceReviews(updated);
                        savePerformanceReviews(updated);
                        
                        addAuditLog(
                          currentUser.id,
                          currentUser.name,
                          'ADD_PERFORMANCE_REVIEW',
                          'تقييم الأداء',
                          'performance_reviews',
                          newPR.id,
                          '',
                          JSON.stringify(newPR)
                        );
                        
                        setNewFeedback('');
                        setNewRecs('');
                        setNewScore(5);
                        alert("تم تسجيل تقييم الأداء بنجاح في ملف الماستر وحفظه بالقاعدة.");
                      }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-sm">
                        <div className="md:col-span-1 text-xs">
                          <label className="block text-slate-600 mb-1 font-bold">الدرجة والتقييم الإجمالي (1-5 نجوم):</label>
                          <select 
                            value={newScore}
                            onChange={(e) => setNewScore(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white outline-none focus:ring-1 focus:ring-blue-900"
                          >
                            <option value={5}>⭐⭐⭐⭐⭐ (5 - ممتاز)</option>
                            <option value={4}>⭐⭐⭐⭐ (4 - جيد جداً)</option>
                            <option value={3}>⭐⭐⭐ (3 - مقبول)</option>
                            <option value={2}>⭐⭐ (2 - ضعيف يحتاج متابعة)</option>
                            <option value={1}>⭐ (1 - غير مرضٍ تماماً)</option>
                          </select>
                        </div>
                        <div className="md:col-span-2 text-xs">
                          <label className="block text-slate-600 mb-1 font-bold">الرأي الفني والملاحظات على كفاءة الموظف:</label>
                          <input 
                            type="text"
                            required
                            placeholder="مثال: يظهر التزام ممتاز في الإنتاجية وسرعة التعلم وصيانة الآلات"
                            value={newFeedback}
                            onChange={(e) => setNewFeedback(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs"
                          />
                        </div>
                        <div className="md:col-span-1 text-xs">
                          <label className="block text-slate-600 mb-1 font-bold">توصيات الترقية والمميزات الموصى بها:</label>
                          <input 
                            type="text"
                            placeholder="مثال: ترقية أو تعديل حافز"
                            value={newRecs}
                            onChange={(e) => setNewRecs(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs"
                          />
                        </div>
                        <div className="md:col-span-4 flex justify-end">
                          <button 
                            type="submit"
                            className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-xs text-xs cursor-pointer"
                          >
                            إدراج التقييم القانوني في الملف
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Historical Reviews */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <h4 className="text-sm font-bold text-slate-900">سجل تقييمات الأداء المؤرشفة في ملف الماستر</h4>
                      
                      <div className="space-y-3">
                        {performanceReviews.filter(p => p.employee_id === selectedEmp.id).length > 0 ? (
                          performanceReviews.filter(p => p.employee_id === selectedEmp.id).map(p => (
                            <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="font-bold text-slate-900">المُقيّم: {p.reviewer_name}</span>
                                <span className="text-slate-400 font-mono">{p.review_date}</span>
                              </div>
                              <div className="flex items-center gap-1.5 font-bold text-amber-500 text-xs">
                                <span>{Array(p.score).fill('⭐').join('')}</span>
                                <span className="text-slate-500 font-medium">({p.score} من 5)</span>
                              </div>
                              <p className="text-slate-700 leading-relaxed font-medium">الملاحظات الفنية: {p.feedback}</p>
                              <p className="text-blue-900 font-bold">التوصيات الإدارية: {p.recommendations}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-slate-400">لا توجد تقييمات أداء تاريخية مسجلة لهذا العامل في الأرشيف.</div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 8: ATTACHMENTS GRID */}
                {masterTab === 'attachments' && (
                  <div className="space-y-6">
                    
                    {/* Notice */}
                    <div className="bg-blue-50 p-4.5 rounded-2xl text-blue-950 flex gap-2.5 items-start border border-blue-200">
                      <Info className="h-5 w-5 text-blue-900 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">أرشيف المستندات والأوراق الثبوتية:</span> يهدف هذا الأرشيف لحفظ وحماية كامل مرفقات الموظف في ملف الماستر الشامل للامتثال للمعايير والرقابة القانونية والعمالية. يرجى توفير كامل المستندات المطلوبة.
                      </div>
                    </div>

                    {/* Drag-and-drop box */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <h4 className="text-sm font-bold text-slate-900">رفع وإلحاق مستند جديد بالملف الشخصي</h4>
                      
                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragActive(false);
                          
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            const file = e.dataTransfer.files[0];
                            const newFile: EmployeeFile = {
                              id: 'f-' + Date.now(),
                              employee_id: selectedEmp.id,
                              file_name: file.name,
                              file_type: file.type || 'application/octet-stream',
                              file_size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                              file_url: '#',
                              uploaded_at: new Date().toISOString()
                            };
                            const updated = [newFile, ...uploadedFiles];
                            saveFiles(updated);
                            
                            addAuditLog(
                              currentUser.id,
                              currentUser.name,
                              'UPLOAD_FILE',
                              'المستندات',
                              'files',
                              newFile.id,
                              '',
                              JSON.stringify(newFile)
                            );
                            
                            alert(`تم رفع الملف ${file.name} بنجاح وإدراجه في مرفقات الموظف الشامل.`);
                          }
                        }}
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                          dragActive ? 'border-blue-900 bg-blue-50/50' : 'border-slate-300 hover:border-blue-800 hover:bg-slate-50'
                        }`}
                      >
                        <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-700">اسحب الملف وأفلته هنا أو اضغط لرفع المستند</p>
                        <p className="text-[10px] text-slate-400 mt-1">تنسيقات الملفات المسموح بها: PDF, JPG, PNG حتى 10 ميجا بايت</p>
                      </div>
                    </div>

                    {/* Standard Slots Status Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      
                      {/* Slot 1: Contract */}
                      <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs text-center space-y-2">
                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-blue-900">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="font-bold text-xs">صورة عقد العمل الموثق</div>
                        <div className="text-[10px] text-slate-400">ملزم قانوناً للتأمينات</div>
                        <div>
                          {uploadedFiles.some(f => f.employee_id === selectedEmp.id && f.file_name.includes('عقد')) ? (
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">مرفوع وجاهز</span>
                          ) : (
                            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">معلق / يرجى الرفع</span>
                          )}
                        </div>
                      </div>

                      {/* Slot 2: National ID */}
                      <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs text-center space-y-2">
                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-blue-900">
                          <Users className="h-5 w-5" />
                        </div>
                        <div className="font-bold text-xs">صورة بطاقة الرقم القومي</div>
                        <div className="text-[10px] text-slate-400">سارية الصلاحية والبيانات</div>
                        <div>
                          {uploadedFiles.some(f => f.employee_id === selectedEmp.id && (f.file_name.includes('بطاقة') || f.file_name.includes('هوية'))) ? (
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">مرفوع وجاهز</span>
                          ) : (
                            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">معلق / يرجى الرفع</span>
                          )}
                        </div>
                      </div>

                      {/* Slot 3: Qualifications */}
                      <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs text-center space-y-2">
                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-blue-900">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div className="font-bold text-xs">شهادة التخرج والمؤهل الدراسي</div>
                        <div className="text-[10px] text-slate-400">مختومة ومطابقة للأصل</div>
                        <div>
                          {uploadedFiles.some(f => f.employee_id === selectedEmp.id && (f.file_name.includes('شهادة') || f.file_name.includes('مؤهل'))) ? (
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">مرفوع وجاهز</span>
                          ) : (
                            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">معلق / يرجى الرفع</span>
                          )}
                        </div>
                      </div>

                      {/* Slot 4: CV */}
                      <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs text-center space-y-2">
                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-blue-900">
                          <HardDrive className="h-5 w-5" />
                        </div>
                        <div className="font-bold text-xs">السيرة الذاتية (CV)</div>
                        <div className="text-[10px] text-slate-400">سجل الخبرات والمهارات</div>
                        <div>
                          {uploadedFiles.some(f => f.employee_id === selectedEmp.id && (f.file_name.includes('CV') || f.file_name.includes('سيرة') || f.file_name.includes('خبرة'))) ? (
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">مرفوع وجاهز</span>
                          ) : (
                            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">معلق / يرجى الرفع</span>
                          )}
                        </div>
                      </div>

                      {/* Slot 5: Others */}
                      <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs text-center space-y-2">
                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-blue-900">
                          <Paperclip className="h-5 w-5" />
                        </div>
                        <div className="font-bold text-xs">فيش وتشبيه وكشف طبي</div>
                        <div className="text-[10px] text-slate-400">مستندات الحالة الجنائية والبدنية</div>
                        <div>
                          {uploadedFiles.some(f => f.employee_id === selectedEmp.id && (f.file_name.includes('فيش') || f.file_name.includes('كشف') || f.file_name.includes('طبي') || f.file_name.includes('آخر'))) ? (
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">مرفوع وجاهز</span>
                          ) : (
                            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">معلق / يرجى الرفع</span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Files list table */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <h4 className="text-sm font-bold text-slate-900">جدول أرشيف ملفات الموظف الفعلية في الخادم</h4>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-[11px] text-slate-600">
                          <tbody className="divide-y divide-slate-100">
                            {uploadedFiles.filter(f => f.employee_id === selectedEmp.id).length > 0 ? (
                              uploadedFiles.filter(f => f.employee_id === selectedEmp.id).map(file => (
                                <tr key={file.id} className="hover:bg-slate-50">
                                  <td className="p-3 font-bold flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-900" />
                                    <span>{file.file_name}</span>
                                  </td>
                                  <td className="p-3 text-slate-400 font-mono text-[10px]">{file.file_size}</td>
                                  <td className="p-3 font-mono text-slate-400">{file.uploaded_at?.split('T')[0]}</td>
                                  <td className="p-3 text-left">
                                    <button 
                                      onClick={() => {
                                        const updated = uploadedFiles.filter(f => f.id !== file.id);
                                        saveFiles(updated);
                                        alert("تم إزالة الملف المرفق بنجاح.");
                                      }}
                                      className="text-red-600 hover:text-red-800 cursor-pointer"
                                    >
                                      حذف المرفق
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td className="p-4 text-center text-slate-400">لا يوجد ملفات مؤرشفة مسجلة بعد لهذا الموظف.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 9: SECURITY & MODIFICATION AUDITS */}
                {masterTab === 'security' && (
                  <div className="space-y-6">
                    
                    {/* Part A: Login sessions */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <LogIn className="h-4.5 w-4.5 text-blue-900" />
                        <span>سجل عمليات تسجيل الدخول والوصول للمنظومة</span>
                      </h4>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-[11px] text-slate-600">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-3">رقم العملية</th>
                              <th className="p-3">اسم المستخدم بالدخول</th>
                              <th className="p-3">توقيت الدخول الفعلي</th>
                              <th className="p-3">عنوان الجهاز والـ IP</th>
                              <th className="p-3">نظام التشغيل والمتصفح</th>
                              <th className="p-3 text-center">حالة الدخول والمصادقة</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {getLoginLogs().filter(l => l.employee_id === selectedEmp.id).length > 0 ? (
                              getLoginLogs().filter(l => l.employee_id === selectedEmp.id).map(l => (
                                <tr key={l.id} className="hover:bg-slate-50">
                                  <td className="p-3 font-mono text-[10px]">{l.id}</td>
                                  <td className="p-3 font-bold font-mono">{l.username}</td>
                                  <td className="p-3 font-mono">{new Date(l.login_time).toLocaleString('ar-EG')}</td>
                                  <td className="p-3 font-mono">{l.ip_address}</td>
                                  <td className="p-3">{l.device_info}</td>
                                  <td className="p-3 text-center">
                                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[9px]">
                                      دخول آمن ومصادق
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="text-center py-6 text-slate-400">لا يوجد سجل عمليات دخول مباشر مسجلة لهذا العامل.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Part B: Modification Audits */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Shield className="h-4.5 w-4.5 text-blue-900" />
                        <span>سجل تعديلات ملف الماستر | Modification Audit Trail Logs</span>
                      </h4>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-[11px] text-slate-600">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-3">رقم التعديل</th>
                              <th className="p-3">الموظف المسؤول</th>
                              <th className="p-3">نوع العملية والتعديل</th>
                              <th className="p-3">تاريخ ووقت التعديل</th>
                              <th className="p-3">عنوان الـ IP المنفذ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {getAuditLogs().filter(a => a.record_id === selectedEmp.id).length > 0 ? (
                              getAuditLogs().filter(a => a.record_id === selectedEmp.id).map(audit => (
                                <tr key={audit.id} className="hover:bg-slate-50">
                                  <td className="p-3 font-mono text-[10px]">{audit.id}</td>
                                  <td className="p-3 font-bold">{audit.user_name}</td>
                                  <td className="p-3 font-bold text-slate-800">
                                    {audit.action === 'CREATE_EMPLOYEE' ? 'إنشاء ملف موظف جديد' : 'تحديث ملف الماستر بالكامل'}
                                  </td>
                                  <td className="p-3 font-mono">{new Date(audit.created_at).toLocaleString('ar-EG')}</td>
                                  <td className="p-3 font-mono">{audit.ip_address}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="text-center py-6 text-slate-400">لا يوجد سجل تعديلات مؤرشف في الأمان لملف هذا الموظف.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>

            {/* Modal Footer actions */}
            <div className="bg-slate-100 px-6 py-4.5 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setShowMasterModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                إغلاق وعودة للوحة التحكم
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
