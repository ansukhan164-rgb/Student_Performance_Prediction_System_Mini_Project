import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, GraduationCap, ArrowRight, UserPlus } from 'lucide-react';
import { User } from '../types';

export const LoginPortal: React.FC = () => {
  const { users, setCurrentUser, addUser, showToast } = useApp();
  const [portalMode, setPortalMode] = useState<'selection' | 'teacher_login' | 'student_login' | 'student_register'>('selection');

  // Teacher login state
  const [teacherEmail, setTeacherEmail] = useState('teacher@ansarai.edu');
  const [teacherPassword, setTeacherPassword] = useState('password123');

  // Student login state
  const [studentUid, setStudentUid] = useState('STU2026001');
  const [studentPassword, setStudentPassword] = useState('password123');

  // Student registration state
  const [regUid, setRegUid] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    let teacher = users.find(u => u.role === 'teacher' && u.email.toLowerCase() === teacherEmail.toLowerCase());
    if (!teacher) {
      teacher = {
        id: 'u_teacher_default',
        username: 'teacher',
        email: teacherEmail,
        fullName: 'Prof. Ansar Faculty',
        role: 'teacher',
        assignedClass: 'BCA 3rd Year - AI Batch',
        active: true,
        createdAt: new Date().toISOString().substring(0, 10)
      };
      addUser(teacher);
    }
    setCurrentUser(teacher);
    showToast('Login Successful', `Welcome back, ${teacher.fullName}`, 'success');
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const uidUpper = studentUid.trim().toUpperCase();
    let student = users.find(u => u.role === 'student' && (u.studentId === uidUpper || u.username.toLowerCase() === studentUid.toLowerCase()));
    if (!student) {
      student = {
        id: `u_std_${Date.now()}`,
        username: studentUid.toLowerCase(),
        email: `${studentUid.toLowerCase()}@student.ansarai.edu`,
        fullName: 'Student Candidate',
        role: 'student',
        studentId: uidUpper,
        active: true,
        createdAt: new Date().toISOString().substring(0, 10)
      };
      addUser(student);
    }
    setCurrentUser(student);
    showToast('Login Successful', `Welcome back to Student Portal`, 'success');
  };

  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const uidUpper = regUid.trim().toUpperCase();
    const existing = users.find(u => u.studentId === uidUpper);
    if (existing) {
      showToast('UID Already Registered', 'This Student UID has already been registered.', 'error');
      return;
    }
    const newStudent: User = {
      id: `u_std_${Date.now()}`,
      username: regUid.toLowerCase(),
      email: regEmail || `${regUid.toLowerCase()}@student.ansarai.edu`,
      fullName: regName || 'Student Candidate',
      role: 'student',
      studentId: uidUpper,
      active: true,
      createdAt: new Date().toISOString().substring(0, 10)
    };
    addUser(newStudent);
    setCurrentUser(newStudent);
    showToast('Registration Successful', `Student account activated for ${uidUpper}`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-8 animate-in fade-in">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-lg shadow-indigo-500/25">
            AI
          </div>
          <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white">
            Student Performance Prediction System
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Educational Machine Learning & Performance Prediction System
          </p>
        </div>

        {portalMode === 'selection' && (
          <div className="space-y-4">
            <div className="text-center pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Select Portal to Sign In</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setPortalMode('teacher_login')}
                className="p-6 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-600 dark:hover:border-indigo-500 text-left transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Teacher Portal</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage class roster, upload datasets, train ML models & monitor academic risk.
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Sign in as Teacher</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              <button
                onClick={() => setPortalMode('student_login')}
                className="p-6 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-600 dark:hover:border-emerald-500 text-left transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Student Portal</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  View personal records, subject marks, attendance, ML predictions & reports.
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Sign in with UID</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setPortalMode('student_register')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                New Student? Register with assigned UID →
              </button>
            </div>
          </div>
        )}

        {portalMode === 'teacher_login' && (
          <form onSubmit={handleTeacherLogin} className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">Teacher Login Portal</span>
              </div>
              <button
                type="button"
                onClick={() => setPortalMode('selection')}
                className="text-indigo-600 font-semibold hover:underline text-xs cursor-pointer"
              >
                ← Back
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Teacher Email</label>
              <input
                type="email"
                required
                value={teacherEmail}
                onChange={e => setTeacherEmail(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Password</label>
              <input
                type="password"
                required
                value={teacherPassword}
                onChange={e => setTeacherPassword(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <span>Sign In to Teacher Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {portalMode === 'student_login' && (
          <form onSubmit={handleStudentLogin} className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">Student Login Portal</span>
              </div>
              <button
                type="button"
                onClick={() => setPortalMode('selection')}
                className="text-emerald-600 font-semibold hover:underline text-xs cursor-pointer"
              >
                ← Back
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Student UID</label>
              <input
                type="text"
                required
                placeholder="STU2026001"
                value={studentUid}
                onChange={e => setStudentUid(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono uppercase font-bold"
              />
              <span className="text-[10px] text-slate-400">Enter your assigned University Student UID.</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Password</label>
              <input
                type="password"
                required
                value={studentPassword}
                onChange={e => setStudentPassword(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <span>Sign In to Student Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setPortalMode('student_register')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Need an account? Register with assigned UID →
              </button>
            </div>
          </form>
        )}

        {portalMode === 'student_register' && (
          <form onSubmit={handleStudentRegister} className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">Student Registration</span>
              </div>
              <button
                type="button"
                onClick={() => setPortalMode('student_login')}
                className="text-indigo-600 font-semibold hover:underline text-xs cursor-pointer"
              >
                ← Back to Login
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Assigned Student UID</label>
              <input
                type="text"
                required
                placeholder="STU2026001"
                value={regUid}
                onChange={e => setRegUid(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono uppercase font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Aarav Sharma"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="student@ansarai.edu"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <span>Activate Student Account & Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
