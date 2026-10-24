import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BrainCircuit, 
  Sun, 
  Moon, 
  User as UserIcon, 
  BarChart3, 
  Upload, 
  Sliders, 
  Cpu, 
  GraduationCap, 
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { theme, toggleTheme, currentUser, switchRole, activeTab, setActiveTab } = useApp();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['teacher', 'student'] },
    { id: 'datasets', label: 'Datasets', icon: Upload, roles: ['teacher'] },
    { id: 'analytics', label: 'Analytics', icon: Sliders, roles: ['teacher'] },
    { id: 'training', label: 'ML Workbench', icon: Cpu, roles: ['teacher'] },
    { id: 'predict', label: 'Predict Score', icon: GraduationCap, roles: ['teacher', 'student'] },
  ];

  const visibleLinks = navLinks.filter(link => link.roles.includes(currentUser.role));

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* ZONE 1: BRAND WORDMARK */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white font-heading block leading-none">
                Ansar <span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase block mt-0.5">
                Student Performance AI
              </span>
            </div>
          </button>
        </div>

        {/* ZONE 2: NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
          {visibleLinks.map(link => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ZONE 3: ACTIONS, ROLE SWITCHER & THEME TOGGLE */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Quick Role Switcher (Teacher / Student) */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="uppercase tracking-wider font-bold text-[11px] text-indigo-600 dark:text-indigo-400">
                {currentUser.role}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                onMouseLeave={() => setRoleMenuOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select User Role
                </div>
                <button
                  onClick={() => { switchRole('teacher'); setRoleMenuOpen(false); setActiveTab('dashboard'); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${currentUser.role === 'teacher' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Teacher Workspace
                </button>
                <button
                  onClick={() => { switchRole('student'); setRoleMenuOpen(false); setActiveTab('dashboard'); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${currentUser.role === 'student' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Student Portal
                </button>
              </div>
            )}
          </div>

          {/* Theme Switch Button with Sun / Moon Icons */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-amber-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle light and dark theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* User Profile / Auth Action */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{currentUser.fullName.split(' ')[0]}</span>
          </button>

        </div>
      </div>
    </header>
  );
};
