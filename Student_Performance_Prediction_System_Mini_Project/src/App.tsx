/**
 * Ansar Student Performance AI - Main Application Entry Point
 * Roles: Teacher & Student
 * Landing Page & Direct Role-Based Navigation Architecture
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer } from './components/ToastContainer';
import { LandingPage } from './components/LandingPage';
import { LoginPortal } from './components/LoginPortal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { StudentListView } from './components/StudentListView';
import { DatasetUpload } from './components/DatasetUpload';
import { DataCleaning } from './components/DataCleaning';
import { DatasetAnalytics } from './components/DatasetAnalytics';
import { ModelTraining } from './components/ModelTraining';
import { StudentPredictionForm } from './components/StudentPredictionForm';
import { StudentPerformanceView } from './components/StudentPerformanceView';
import { ReportsView } from './components/ReportsView';
import { ProfileView } from './components/ProfileView';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, isAuthenticated, logoutUser } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If user is viewing the landing page
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <Header 
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)} 
          onOpenAuth={() => setActiveTab(isAuthenticated ? 'dashboard' : 'login')} 
        />
        <main className="flex-1">
          <LandingPage onOpenAuth={() => setActiveTab('login')} />
        </main>
        <ToastContainer />
      </div>
    );
  }

  // If user is viewing login portal
  if (!isAuthenticated || activeTab === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <Header 
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)} 
          onOpenAuth={() => setActiveTab('landing')} 
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <LoginPortal />
        </main>
        <ToastContainer />
      </div>
    );
  }

  const isTeacher = currentUser.role === 'teacher';
  const teacherOnlyTabs = ['students', 'datasets', 'cleaning', 'analytics', 'training'];
  const effectiveTab = (!isTeacher && teacherOnlyTabs.includes(activeTab)) ? 'dashboard' : activeTab;

  const renderTabContent = () => {
    switch (effectiveTab) {
      case 'dashboard':
        return isTeacher ? <TeacherDashboard /> : <StudentDashboard />;

      case 'students':
        return isTeacher ? <StudentListView /> : <StudentDashboard />;

      case 'datasets':
        return isTeacher ? <DatasetUpload /> : <StudentDashboard />;

      case 'cleaning':
        return isTeacher ? <DataCleaning /> : <StudentDashboard />;

      case 'analytics':
        return isTeacher ? <DatasetAnalytics /> : <StudentDashboard />;

      case 'training':
        return isTeacher ? <ModelTraining /> : <StudentDashboard />;

      case 'predict':
        return <StudentPredictionForm />;

      case 'performance':
        return isTeacher ? <TeacherDashboard /> : <StudentPerformanceView />;

      case 'reports':
        return <ReportsView />;

      case 'profile':
        return <ProfileView />;

      default:
        return isTeacher ? <TeacherDashboard /> : <StudentDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenAuth={logoutUser}
      />

      {/* Main Viewport Workspace */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        <Header 
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)} 
          onOpenAuth={logoutUser} 
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderTabContent()}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}
