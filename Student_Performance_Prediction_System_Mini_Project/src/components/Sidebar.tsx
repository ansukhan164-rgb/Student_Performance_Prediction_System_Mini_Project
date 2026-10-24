import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  BrainCircuit, 
  LayoutDashboard, 
  Users, 
  UploadCloud, 
  SlidersHorizontal, 
  BarChart3, 
  Cpu, 
  GraduationCap, 
  FileText, 
  User as UserIcon, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  LineChart
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onOpenAuth
}) => {
  const { currentUser, activeTab, setActiveTab, switchRole } = useApp();

  const isTeacher = currentUser.role === 'teacher';

  const teacherNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students Roster', icon: Users },
    { id: 'datasets', label: 'Dataset Upload', icon: UploadCloud },
    { id: 'cleaning', label: 'Data Preprocessing', icon: SlidersHorizontal },
    { id: 'analytics', label: 'EDA Analytics', icon: BarChart3 },
    { id: 'training', label: 'ML Workbench', icon: Cpu },
    { id: 'predict', label: 'Score Predictor', icon: GraduationCap },
    { id: 'reports', label: 'Academic Reports', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
  ];

  const studentNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'performance', label: 'My Performance', icon: LineChart },
    { id: 'predict', label: 'ML Score Prediction', icon: GraduationCap },
    { id: 'reports', label: 'My Reports', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
  ];

  const navItems = isTeacher ? teacherNavItems : studentNavItems;

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backing */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
          <button 
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-3 overflow-hidden text-left focus:outline-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
              <BrainCircuit className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white font-heading block leading-none">
                  Ansar <span className="text-indigo-600 dark:text-indigo-400">AI</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase block mt-1">
                  Student Analytics
                </span>
              </div>
            )}
          </button>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role Badge Indicator */}
        <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isTeacher ? 'bg-blue-500' : 'bg-emerald-500'}`} />
              {!collapsed && (
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
                  {isTeacher ? 'Teacher Workspace' : 'Student Portal'}
                </span>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={() => switchRole(isTeacher ? 'student' : 'teacher')}
                className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
              >
                Switch
              </button>
            )}
          </div>
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer User Profile & Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <button
              onClick={() => handleNavClick('profile')}
              className="flex items-center gap-2.5 overflow-hidden text-left hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.fullName.charAt(0)}
              </div>
              {!collapsed && (
                <div className="truncate">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate leading-tight">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                    {currentUser.studentId || currentUser.email}
                  </span>
                </div>
              )}
            </button>

            {!collapsed && (
              <button
                onClick={onOpenAuth}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                title="Account Settings / Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
