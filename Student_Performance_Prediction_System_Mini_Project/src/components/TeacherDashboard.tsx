import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StudentRecord } from '../types';
import { 
  Users, 
  Search, 
  Eye, 
  Sparkles,
  AlertTriangle,
  Upload,
  X,
  AlertCircle,
  Database,
  Cpu,
  TrendingUp,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import { generateStudentPredictionPDF } from '../services/pdfReportGenerator';

export const TeacherDashboard: React.FC = () => {
  const { activeDataset, activeModel, predictions, currentUser, makePrediction, setActiveTab } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [activeTabSub, setActiveTabSub] = useState<'roster' | 'at_risk'>('roster');

  if (!activeDataset) {
    return (
      <div className="space-y-6">
        <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Teacher Academic Dashboard</span>
          </div>
          <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white mt-1">
            Class Roster & Academic Monitoring
          </h1>
        </div>

        <div className="py-16 text-center space-y-4 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Student Roster Data Loaded</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Please upload a student dataset CSV or Excel file to populate the class roster and monitor academic progress.
          </p>
          <button
            onClick={() => setActiveTab('datasets')}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Go to Dataset Upload</span>
          </button>
        </div>
      </div>
    );
  }

  const students = activeDataset.cleanedData || activeDataset.data;

  const filteredStudents = students.filter(s =>
    (s.student_name && s.student_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.student_id && s.student_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const atRiskStudents = students.filter(s => 
    s.attendance_percentage < 75 || s.previous_backlogs > 0 || (s.final_exam_score && s.final_exam_score < 55)
  );

  const totalPredictions = predictions.length;
  const avgPredicted = predictions.length > 0
    ? (predictions.reduce((a, b) => a + b.predictedScore, 0) / predictions.length).toFixed(1)
    : 'N/A';

  const handleRunPredictionForStudent = (student: StudentRecord) => {
    const input = {
      student_id: student.student_id,
      student_name: student.student_name,
      attendance_percentage: student.attendance_percentage,
      past_exam_score: student.past_exam_score,
      assignment_score: student.assignment_score,
      study_hours_per_week: student.study_hours_per_week,
      sleep_hours: student.sleep_hours,
      parent_education_level: student.parent_education_level,
      extracurricular_activities: student.extracurricular_activities,
      internet_access_at_home: student.internet_access_at_home,
      previous_backlogs: student.previous_backlogs
    };

    const pred = makePrediction(input);
    if (pred) {
      generateStudentPredictionPDF(pred);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Teacher Academic Dashboard</span>
          </div>
          <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white mt-1">
            {currentUser.assignedClass || 'Class Roster'} Monitoring
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track student academic progress from active dataset <strong className="text-indigo-600 dark:text-indigo-400">({activeDataset.name})</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className="px-3.5 py-2 text-xs font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Graph Analytics</span>
          </button>
          <button
            onClick={() => setActiveTabSub('roster')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTabSub === 'roster'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Class Roster ({students.length})
          </button>
          <button
            onClick={() => setActiveTabSub('at_risk')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTabSub === 'at_risk'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Academic Support Needed ({atRiskStudents.length})</span>
          </button>
        </div>
      </div>

      {/* KPI STATS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Class Enrolled Students</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-3">{students.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {atRiskStudents.length} requiring academic support
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active ML Model</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white truncate mt-3">
            {activeModel ? activeModel.name : 'No Active Model'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {activeModel ? (
              <>R² Score: <strong className="text-purple-600 dark:text-purple-400 font-mono">{(activeModel.metrics.r2Score * 100).toFixed(1)}%</strong></>
            ) : (
              <span className="text-amber-600 font-semibold">Model training required</span>
            )}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Dataset Records</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-3">{activeDataset.rowCount}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Format: {activeDataset.fileFormat} · Status: <span className="text-emerald-600 font-semibold">{activeDataset.status}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Generated Predictions</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-3">{totalPredictions}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Avg Score: <strong className="text-slate-900 dark:text-white font-mono">{avgPredicted}</strong>
          </div>
        </div>
      </div>

      {/* SEARCH AND ROSTER TABLE */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
            {activeTabSub === 'roster' ? 'Assigned Student Roster' : 'Students Requiring Academic Intervention'}
          </h3>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Student ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Attendance</th>
                <th className="p-3">Past Score</th>
                <th className="p-3">Study Hrs/Wk</th>
                <th className="p-3">Backlogs</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
              {(activeTabSub === 'roster' ? filteredStudents : atRiskStudents).slice(0, 15).map(s => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{s.student_id}</td>
                  <td className="p-3 font-sans font-medium text-slate-900 dark:text-slate-100">{s.student_name}</td>
                  <td className="p-3">
                    <span className={`font-bold ${s.attendance_percentage < 75 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
                      {s.attendance_percentage}%
                    </span>
                  </td>
                  <td className="p-3">{s.past_exam_score}/100</td>
                  <td className="p-3">{s.study_hours_per_week} hrs</td>
                  <td className="p-3">
                    <span className={`font-bold ${s.previous_backlogs > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                      {s.previous_backlogs}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2 font-sans">
                      <button
                        onClick={() => setSelectedStudent(s)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleRunPredictionForStudent(s)}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded flex items-center gap-1 shadow-xs"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Predict & PDF</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* STUDENT DETAIL MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">{selectedStudent.student_name}</h3>
                <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{selectedStudent.student_id}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border">
                <span className="text-slate-500 block">Class Attendance</span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">{selectedStudent.attendance_percentage}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border">
                <span className="text-slate-500 block">Past Exam Mark</span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">{selectedStudent.past_exam_score}/100</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border">
                <span className="text-slate-500 block">Weekly Study Hours</span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">{selectedStudent.study_hours_per_week} hrs/wk</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border">
                <span className="text-slate-500 block">Active Backlogs</span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">{selectedStudent.previous_backlogs}</span>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleRunPredictionForStudent(selectedStudent);
                  setSelectedStudent(null);
                }}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Prediction & Generate PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
