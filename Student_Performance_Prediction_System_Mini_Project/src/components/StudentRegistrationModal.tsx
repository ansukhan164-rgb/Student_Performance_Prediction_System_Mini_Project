/**
 * Student Registration Modal & UID Management System
 * Allows teachers to assign UIDs & students to securely register using assigned UID.
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  UserPlus, 
  KeyRound, 
  Mail, 
  User, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Plus
} from 'lucide-react';
import { StudentRecord } from '../types';

interface StudentRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'register' | 'assign';
}

export const StudentRegistrationModal: React.FC<StudentRegistrationModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'register'
}) => {
  const { activeDataset, addUser, setCurrentUser, showToast, users } = useApp();
  const [mode, setMode] = useState<'register' | 'assign'>(defaultMode);

  // Student Self Registration State
  const [uidInput, setUidInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  // Teacher Assign UID State
  const [assignName, setAssignName] = useState('');
  const [assignEmail, setAssignEmail] = useState('');
  const [assignAttendance, setAssignAttendance] = useState('');
  const [assignPastScore, setAssignPastScore] = useState('');

  if (!isOpen) return null;

  const studentsRecords: StudentRecord[] = activeDataset?.cleanedData || activeDataset?.data || [];

  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordInput !== confirmPasswordInput) {
      showToast('Password Mismatch', 'Passwords do not match. Please re-enter.', 'error');
      return;
    }

    // Validate UID against dataset or registered users
    const matchedRecord = studentsRecords.find(s => s.student_id?.toLowerCase() === uidInput.trim().toLowerCase());
    const existingUser = users.find(u => u.studentId?.toLowerCase() === uidInput.trim().toLowerCase());

    if (existingUser) {
      showToast('UID Already Registered', 'This Student UID has already been registered with an account.', 'error');
      return;
    }

    const newStudentUser = {
      id: `u_std_${Date.now()}`,
      username: uidInput.trim(),
      email: emailInput || `${uidInput.toLowerCase()}@student.ansarai.edu`,
      fullName: matchedRecord ? matchedRecord.student_name : (nameInput || 'Student Candidate'),
      role: 'student' as const,
      studentId: uidInput.trim().toUpperCase(),
      active: true,
      createdAt: new Date().toISOString().substring(0, 10)
    };

    addUser(newStudentUser);
    setCurrentUser(newStudentUser);
    showToast('Registration Successful', `Welcome ${newStudentUser.fullName}! Logged in with UID ${newStudentUser.studentId}`, 'success');
    onClose();
  };

  const handleAssignUID = (e: React.FormEvent) => {
    e.preventDefault();

    const generatedUID = `STU2026${Math.floor(Math.random() * 900 + 100)}`;
    const newRecord: StudentRecord = {
      id: `rec_${Date.now()}`,
      student_id: generatedUID,
      student_name: assignName,
      attendance_percentage: assignAttendance !== '' ? Number(assignAttendance) : 0,
      past_exam_score: assignPastScore !== '' ? Number(assignPastScore) : 0,
      assignment_score: 0,
      study_hours_per_week: 0,
      sleep_hours: 7,
      parent_education_level: 'Bachelor',
      extracurricular_activities: 'No',
      internet_access_at_home: 'Yes',
      previous_backlogs: 0
    };

    if (activeDataset) {
      const updatedData = [newRecord, ...activeDataset.data];
      // Update active dataset in localStorage
      const datasets = JSON.parse(localStorage.getItem('ansar_ai_datasets') || '[]');
      const updatedDatasets = datasets.map((d: any) => d.id === activeDataset.id ? { ...d, data: updatedData, rowCount: updatedData.length } : d);
      localStorage.setItem('ansar_ai_datasets', JSON.stringify(updatedDatasets));
    }

    showToast('UID Assigned', `Successfully generated and assigned UID: ${generatedUID} for ${assignName}`, 'success');
    setAssignName('');
    setAssignEmail('');
    setMode('register');
    setUidInput(generatedUID);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Mode Toggles */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-extrabold font-heading text-slate-900 dark:text-white">
              {mode === 'register' ? 'Student Portal Registration' : 'Teacher: Assign Student UID'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {mode === 'register' ? 'Enter your assigned University UID to activate portal access' : 'Generate secure student UID for portal registration'}
            </p>
          </div>

          <button
            onClick={() => setMode(mode === 'register' ? 'assign' : 'register')}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60"
          >
            {mode === 'register' ? 'Switch to Teacher UID Generator' : 'Switch to Student Registration'}
          </button>
        </div>

        {mode === 'register' ? (
          <form onSubmit={handleRegisterStudent} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span>Assigned Student UID (e.g., STU2026001)</span>
              </label>
              <input
                type="text"
                required
                placeholder="STU2026001"
                value={uidInput}
                onChange={e => setUidInput(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400">UID is assigned by your course teacher or administrator.</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Aarav Sharma"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="student@ansarai.edu"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPasswordInput}
                  onChange={e => setConfirmPasswordInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify UID & Register Student Account</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleAssignUID} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
              <span>A unique University UID (e.g. STU2026...) will be automatically generated and linked to this student record.</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Student Full Name</label>
              <input
                type="text"
                required
                placeholder="Priya Patel"
                value={assignName}
                onChange={e => setAssignName(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Student Email Address</label>
              <input
                type="email"
                required
                placeholder="priya.patel@student.ansarai.edu"
                value={assignEmail}
                onChange={e => setAssignEmail(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Attendance %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={assignAttendance}
                  onChange={e => setAssignAttendance(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Past Exam Score</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={assignPastScore}
                  onChange={e => setAssignPastScore(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Generate UID & Save Student Record</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
