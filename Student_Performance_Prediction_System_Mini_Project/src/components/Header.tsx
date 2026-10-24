import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Menu, 
  Sun, 
  Moon, 
  Search, 
  User as UserIcon, 
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenAuth
}) => {
  const { theme, toggleTheme, currentUser, activeTab, setActiveTab, globalSearchQuery, setGlobalSearchQuery } = useApp();

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'students': return 'Students Roster & Records';
      case 'datasets': return 'Dataset Upload & Processing';
      case 'cleaning': return 'Data Cleaning & Preprocessing';
      case 'analytics': return 'Exploratory Data Analysis';
      case 'training': return 'ML Workbench & Algorithms';
      case 'predict': return 'Exam Score Prediction';
      case 'performance': return 'Subject Performance Details';
      case 'reports': return 'Academic Reports Archive';
      case 'profile': return 'User Account Profile';
      default: return 'System Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Hamburger Button (Mobile) & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          aria-label="Open Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {currentUser.role === 'teacher' ? 'Faculty Portal' : 'Student Portal'}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-900 dark:text-white">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Center: Search Input Bar */}
      <div className="hidden md:flex items-center gap-2 max-w-sm w-full bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-transparent focus-within:border-indigo-500 transition-all relative">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input 
          type="text" 
          placeholder="Search students by name or UID..." 
          value={globalSearchQuery}
          onChange={(e) => {
            setGlobalSearchQuery(e.target.value);
            if (e.target.value.trim() && currentUser.role === 'teacher' && activeTab !== 'students') {
              setActiveTab('students');
            }
          }}
          className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
        />
        {globalSearchQuery && (
          <button
            onClick={() => setGlobalSearchQuery('')}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right: Quick Actions, Theme Toggle & User Avatar */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Quick Predict Shortcut Button */}
        <button
          onClick={() => setActiveTab('predict')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Predict Score</span>
        </button>

        {/* Light / Dark Theme Switch Button with Sun / Moon Icons */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-amber-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all focus:outline-none"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          aria-label="Toggle light and dark theme"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-700" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* User Account Menu Button */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px]">
            {currentUser.fullName.charAt(0)}
          </div>
          <span className="hidden sm:inline font-semibold">{currentUser.fullName.split(' ')[0]}</span>
        </button>
      </div>
    </header>
  );
};
