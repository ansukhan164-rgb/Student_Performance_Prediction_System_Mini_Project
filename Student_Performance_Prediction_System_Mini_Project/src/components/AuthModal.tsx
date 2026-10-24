import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, User } from '../types';
import { 
  X, 
  GraduationCap, 
  Users 
} from 'lucide-react';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, switchRole, addUser, showToast } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');
  const [studentIdInput, setStudentIdInput] = useState('');

  if (!isOpen) return null;

  const handleDemoLogin = (role: UserRole) => {
    switchRole(role);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'signup') {
      const newStudent: User = {
        id: `u_std_${Date.now()}`,
        username: emailInput.split('@')[0],
        email: emailInput,
        fullName: fullNameInput || 'Student Candidate',
        role: 'student',
        studentId: studentIdInput || `STD2024-${Math.floor(Math.random() * 800 + 100)}`,
        active: true,
        createdAt: new Date().toISOString().substring(0, 10)
      };

      addUser(newStudent);
      setCurrentUser(newStudent);
      showToast('Account Registered', 'Welcome to Ansar Student Performance AI!', 'success');
      onClose();
    } else {
      showToast('Authenticated', `Logged in as ${currentUser.fullName}`, 'success');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-lg shadow-indigo-500/25">
            AI
          </div>
          <h3 className="text-xl font-extrabold font-heading text-slate-900 dark:text-white">
            Ansar Student Performance AI
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login' ? 'Sign in to access educational analytics' : 'Register a new student account'}
          </p>
        </div>

        {/* QUICK DEMO LOGIN BUTTONS (Teacher & Student) */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">Fast Account Switch</span>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => handleDemoLogin('teacher')}
              className="py-2.5 bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rounded-xl hover:opacity-90 flex items-center justify-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Teacher</span>
            </button>
            <button
              onClick={() => handleDemoLogin('student')}
              className="py-2.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-xl hover:opacity-90 flex items-center justify-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
          </div>
        </div>

        <div className="relative my-4 text-center">
          <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 relative z-10">or continue with credentials</span>
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Full Name</label>
              <input
                type="text"
                required
                placeholder="Aarav Sharma"
                value={fullNameInput}
                onChange={e => setFullNameInput(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Email Address</label>
            <input
              type="email"
              required
              placeholder="user@ansarai.edu"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all"
          >
            {mode === 'login' ? 'Sign In to Workspace' : 'Create Student Account'}
          </button>
        </form>

        <div className="text-center pt-2 text-xs">
          {mode === 'login' ? (
            <span className="text-slate-500">
              New student?{' '}
              <button onClick={() => setMode('signup')} className="text-indigo-600 font-bold hover:underline">
                Register Student Account
              </button>
            </span>
          ) : (
            <span className="text-slate-500">
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-indigo-600 font-bold hover:underline">
                Sign In
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
};
