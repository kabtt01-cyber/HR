/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Factory, LogIn, UserCheck } from 'lucide-react';
import { User } from '../types';
import { getSystemSettings } from '../data';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const settings = getSystemSettings();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  const demoUsers = [
    {
      id: 'demo-admin',
      username: 'ahmed_quds',
      email: 'ahmed.quds@qudsplastic.com',
      name: 'أحمد السيد القدس',
      role_id: 'role-admin',
      role_name: 'المدير العام (كامل الصلاحيات)',
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
    },
    {
      id: 'demo-hr',
      username: 'ahmed_qadi',
      email: 'ahmed.qadi@qudsplastic.com',
      name: 'أحمد محمود القاضي',
      role_id: 'role-hr',
      role_name: 'مدير الموارد البشرية',
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    },
    {
      id: 'demo-emp',
      username: 'ibrahim_marzouk',
      email: 'ibrahim.marzouk@qudsplastic.com',
      name: 'إبراهيم حسن مرزوق',
      role_id: 'role-employee',
      role_name: 'مشغل ماكينات (موظف/عامل)',
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
    }
  ];

  const handleDemoClick = (demo: typeof demoUsers[0]) => {
    setSelectedDemo(demo.id);
    setUsername(demo.username);
    setEmail(demo.email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fallback if user types manually
    let finalUser: User = {
      id: 'user-' + Date.now(),
      username: username || 'guest',
      email: email || 'guest@qudsplastic.com',
      name: username || 'مستخدم تجريبي',
      role_id: 'role-employee',
      status: 'Active',
      created_at: new Date().toISOString()
    };

    const matchedDemo = demoUsers.find(d => d.username === username || d.email === email);
    if (matchedDemo) {
      finalUser = {
        id: matchedDemo.id === 'demo-admin' ? 'emp-9' : matchedDemo.id === 'demo-hr' ? 'emp-1' : 'emp-12',
        username: matchedDemo.username,
        email: matchedDemo.email,
        name: matchedDemo.name,
        role_id: matchedDemo.role_id,
        status: 'Active',
        created_at: new Date().toISOString()
      };
    }

    onLogin(finalUser);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans" id="login-screen">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-full shadow-lg border-2 border-blue-900 flex items-center justify-center">
            <Factory className="h-12 w-12 text-blue-900 animate-pulse" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          {settings.factory_name}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          نظام إدارة الموارد البشرية الاحترافي (Quds HR)
        </p>
        <p className="text-center text-xs text-blue-800 font-medium mt-1">
          {settings.factory_branch}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl border border-slate-200 sm:px-10">
          
          {/* Demo Users Quick Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1">
              <UserCheck className="h-4 w-4 text-blue-900" />
              <span>اختر مستخدم للتجربة السريعة:</span>
            </label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {demoUsers.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleDemoClick(demo)}
                  className={`p-3 text-right rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedDemo === demo.id
                      ? 'border-blue-900 ring-2 ring-blue-900/10 shadow-sm'
                      : 'hover:bg-slate-50 border-slate-200'
                  } ${demo.bg}`}
                >
                  <div className="font-bold mb-1">{demo.name}</div>
                  <div className="opacity-80">{demo.role_name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">أو سجل يدوياً</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                اسم المستخدم
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-900 focus:border-blue-900 text-sm"
                placeholder="مثال: ahmed_quds"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-900 focus:border-blue-900 text-sm"
                placeholder="name@qudsplastic.com"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-900 focus:ring-blue-900 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="mr-2 block text-xs text-slate-600">
                  تذكرني على هذا المتصفح
                </label>
              </div>
              <span className="text-xs text-slate-500 flex items-center gap-0.5">
                <ShieldCheck className="h-3 w-3 text-slate-400" /> اتصال مشفر آمن
              </span>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 px-4 py-3 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 cursor-pointer transition-all"
            >
              <LogIn className="h-4 w-4" />
              <span>تسجيل الدخول للنظام</span>
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-500">
        جميع الحقوق محفوظة لمصنع القدس للتقنيات البلاستيكية © {new Date().getFullYear()}
      </div>
    </div>
  );
}
