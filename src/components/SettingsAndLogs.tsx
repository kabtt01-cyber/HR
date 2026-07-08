/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  History, 
  Save, 
  Palette, 
  Check, 
  Lock, 
  RefreshCw,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { SystemSettings, AuditLog, Role, Permission } from '../types';
import { 
  getSystemSettings, 
  saveSystemSettings, 
  getAuditLogs, 
  getRoles, 
  getPermissions,
  addAuditLog 
} from '../data';

interface SettingsAndLogsProps {
  currentUser: {
    id: string;
    name: string;
    role_id: string;
  };
}

export default function SettingsAndLogs({ currentUser }: SettingsAndLogsProps) {
  // Load initial settings
  const [settings, setSettings] = useState<SystemSettings>(getSystemSettings());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(getAuditLogs());
  const [roles] = useState<Role[]>(getRoles());
  const [permissions] = useState<Permission[]>(getPermissions());

  // Form Fields
  const [factoryName, setFactoryName] = useState(settings.factory_name);
  const [factoryBranch, setFactoryBranch] = useState(settings.factory_branch);
  const [primaryColor, setPrimaryColor] = useState(settings.primary_color);
  const [accentColor, setAccentColor] = useState(settings.accent_color);
  const [logoUrl, setLogoUrl] = useState(settings.logo_url);
  const [overtimeDay, setOvertimeDay] = useState(settings.overtime_rate_day);
  const [overtimeNight, setOvertimeNight] = useState(settings.overtime_rate_night);

  // Custom permission mapping in client state
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(() => {
    try {
      const stored = localStorage.getItem('quds_hr_role_permissions');
      return stored ? JSON.parse(stored) : {
        'role-admin': ['employees_view', 'employees_manage', 'employees_delete', 'departments_manage', 'payroll_manage', 'leaves_approve', 'overtime_approve', 'loans_approve', 'grievance_manage', 'settings_manage'],
        'role-hr': ['employees_view', 'employees_manage', 'departments_manage', 'payroll_manage', 'leaves_approve', 'overtime_approve', 'loans_approve', 'grievance_manage'],
        'role-manager': ['employees_view', 'leaves_approve', 'overtime_approve'],
        'role-employee': ['employees_view']
      };
    } catch {
      return {};
    }
  });

  const saveRolePermissions = (mapping: Record<string, string[]>) => {
    localStorage.setItem('quds_hr_role_permissions', JSON.stringify(mapping));
    setRolePermissions(mapping);
  };

  const isAdmin = currentUser.role_id === 'role-admin';

  // Handle Settings Save
  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('عذراً: تعديل إعدادات المصنع واللوائح المالية مقتصر فقط على المدير العام للمصنع!');
      return;
    }

    const newSettings: SystemSettings = {
      ...settings,
      factory_name: factoryName,
      factory_branch: factoryBranch,
      primary_color: primaryColor,
      accent_color: accentColor,
      logo_url: logoUrl,
      overtime_rate_day: Number(overtimeDay),
      overtime_rate_night: Number(overtimeNight)
    };

    setSettings(newSettings);
    saveSystemSettings(newSettings);

    // Refresh layout colors in body if needed (or trigger window event)
    window.location.reload(); // Quick refresh to apply theme instantly across all layouts

    addAuditLog(
      currentUser.id,
      currentUser.name,
      'UPDATE_SYSTEM_SETTINGS',
      'إعدادات النظام',
      'settings',
      'factory_settings',
      JSON.stringify(settings),
      JSON.stringify(newSettings)
    );
  };

  // Toggle dynamic permission mapping
  const handlePermissionToggle = (roleId: string, permissionName: string) => {
    if (!isAdmin) return;

    const currentMapping = { ...rolePermissions };
    const list = currentMapping[roleId] || [];

    if (list.includes(permissionName)) {
      currentMapping[roleId] = list.filter(item => item !== permissionName);
    } else {
      currentMapping[roleId] = [...list, permissionName];
    }

    saveRolePermissions(currentMapping);

    addAuditLog(
      currentUser.id,
      currentUser.name,
      'UPDATE_ROLE_PERMISSIONS_MAPPING',
      'الصلاحيات',
      'roles',
      roleId,
      '',
      JSON.stringify(currentMapping[roleId])
    );
  };

  const handleClearAuditLogs = () => {
    if (confirm('تنبيه أمان: هل أنت متأكد من تصفية سجل أمان النظام بالكامل؟ لا يمكن التراجع عن هذا الإجراء.')) {
      localStorage.setItem('quds_hr_audit_logs', JSON.stringify([]));
      setAuditLogs([]);
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-900" />
            <span>إعدادات المصنع وسجلات الأمان</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تهيئة اللائحة التنظيمية الموحدة للمصنع، تخصيص هوية وألوان النظام، مصفوفة الصلاحيات، ومتابعة سجل العمليات الحساسة (Audit Log).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left column: Settings Forms (2 Cols) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* General settings form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Palette className="h-4.5 w-4.5 text-blue-900" />
              <span>إعدادات هوية المصنع واللوائح المالية</span>
            </h3>

            <form onSubmit={handleSettingsSubmit} className="space-y-4 text-right">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم مصنع التقنيات البلاستيكية:</label>
                  <input
                    type="text"
                    required
                    disabled={!isAdmin}
                    value={factoryName}
                    onChange={(e) => setFactoryName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الفرع والمنطقة الصناعية:</label>
                  <input
                    type="text"
                    required
                    disabled={!isAdmin}
                    value={factoryBranch}
                    onChange={(e) => setFactoryBranch(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رابط الشعار المرفق (URL):</label>
                  <input
                    type="url"
                    disabled={!isAdmin}
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs font-mono"
                  />
                </div>

                {/* Color pickers */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اللون الرئيسي للنظام:</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        disabled={!isAdmin}
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-8 w-12 border rounded cursor-pointer"
                      />
                      <span className="font-mono text-[10px]">{primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اللون الجانبي/الفرعي:</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        disabled={!isAdmin}
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="h-8 w-12 border rounded cursor-pointer"
                      />
                      <span className="font-mono text-[10px]">{accentColor}</span>
                    </div>
                  </div>
                </div>

                {/* Overtime settings */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مضاعف الإضافي النهاري (ساعة العمل العادية):</label>
                  <input
                    type="number"
                    step={0.1}
                    required
                    disabled={!isAdmin}
                    value={overtimeDay}
                    onChange={(e) => setOvertimeDay(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مضاعف الإضافي الليلي أو العطلات:</label>
                  <input
                    type="number"
                    step={0.1}
                    required
                    disabled={!isAdmin}
                    value={overtimeNight}
                    onChange={(e) => setOvertimeNight(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-900 text-xs font-mono"
                  />
                </div>

              </div>

              {!isAdmin && (
                <div className="bg-amber-50 p-3 rounded-lg text-amber-900 text-[10px] flex gap-1.5 items-center">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-amber-600" />
                  <span>عذراً: يجب تسجيل الدخول بحساب المدير العام لتغيير هذه القيم.</span>
                </div>
              )}

              {isAdmin && (
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-xs"
                >
                  <Save className="h-4.5 w-4.5" />
                  <span>حفظ لوائح وإعدادات الهوية</span>
                </button>
              )}

            </form>
          </div>

          {/* Matrix of Roles & Permissions Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <ShieldCheck className="h-4.5 w-4.5 text-blue-900" />
              <span>مصفوفة الصلاحيات والتحكم بالأدوار الأمنية</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-[11px] text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">صلاحية النظام التشغيلية</th>
                    <th className="p-3">الفئة</th>
                    {roles.map(r => (
                      <th key={r.id} className="p-3 text-center">{r.name_ar}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {permissions.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{p.name_ar}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{p.description}</div>
                      </td>
                      <td className="p-3 text-slate-500">{p.category}</td>
                      {roles.map(r => {
                        const hasPerm = (rolePermissions[r.id] || []).includes(p.id);
                        const isSystemAdminRole = r.id === 'role-admin';
                        return (
                          <td key={r.id} className="p-3 text-center">
                            {isSystemAdminRole ? (
                              <div className="flex justify-center">
                                <Lock className="h-3.5 w-3.5 text-blue-900" title="صلاحية مقفلة للمدير العام" />
                              </div>
                            ) : (
                              <input
                                type="checkbox"
                                checked={hasPerm}
                                disabled={!isAdmin}
                                onChange={() => handlePermissionToggle(r.id, p.id)}
                                className="h-4 w-4 text-blue-900 rounded border-slate-300 focus:ring-blue-900 cursor-pointer"
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right column: Audit Logs (1 Col) */}
        <div className="xl:col-span-1">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 sticky top-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <History className="h-4.5 w-4.5 text-blue-900" />
                <span>سجل أمان العمليات (Audit Log)</span>
              </h3>
              {isAdmin && (
                <button
                  onClick={handleClearAuditLogs}
                  className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                  title="تصفية السجل نهائياً"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {auditLogs.length > 0 ? (
              <div className="space-y-3.5 max-h-[550px] overflow-y-auto pr-1">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] space-y-1 text-slate-600">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span className="text-blue-900">{log.action}</span>
                      <span className="font-mono text-slate-400">{new Date(log.created_at).toLocaleTimeString('ar-EG')}</span>
                    </div>
                    <div>القائم بالعملية: <span className="font-bold text-slate-950">{log.user_name}</span></div>
                    <div>القسم والموديول: <span className="font-medium text-slate-700">{log.module}</span></div>
                    <div className="font-mono text-[9px] text-slate-400 mt-1">
                      IP: {log.ip_address} | Target Record: {log.record_id}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-center py-6">السجل فارغ حالياً.</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
