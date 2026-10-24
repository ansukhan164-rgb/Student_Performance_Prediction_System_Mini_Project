import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  GraduationCap, 
  Calendar, 
  Building2, 
  Sparkles,
  LogOut
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, switchRole, theme, toggleTheme } = useApp();

  const isTeacher = currentUser.role === 'teacher';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-indigo-600/20">
            {currentUser.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                {currentUser.fullName}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isTeacher ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400' : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
              }`}>
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              University UID: {currentUser.studentId || currentUser.username || 'BCA2024-REG'}
            </p>
          </div>
        </div>

        <button
          onClick={() => switchRole(isTeacher ? 'student' : 'teacher')}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
        >
          Switch to {isTeacher ? 'Student Portal' : 'Teacher Workspace'}
        </button>
      </div>

      {/* Account Details Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
          University Account Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Full Registered Name</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{currentUser.fullName}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">University Email</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{currentUser.email}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Department & Course</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">Computer Applications (BCA)</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Account Status</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">Verified & Authorized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
