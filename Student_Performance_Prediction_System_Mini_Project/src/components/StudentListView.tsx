import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  GraduationCap,
  Download,
  X
} from 'lucide-react';
import { StudentRecord } from '../types';
import { StudentRegistrationModal } from './StudentRegistrationModal';

export const StudentListView: React.FC = () => {
  const { activeDataset, makePrediction, setActiveTab, showToast, globalSearchQuery, setGlobalSearchQuery } = useApp();
  const [searchTerm, setSearchTerm] = useState(globalSearchQuery || '');

  React.useEffect(() => {
    if (globalSearchQuery !== undefined) {
      setSearchTerm(globalSearchQuery);
    }
  }, [globalSearchQuery]);
  const [performanceFilter, setPerformanceFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const studentsData: StudentRecord[] = activeDataset?.cleanedData || activeDataset?.data || [];

  const handleCopyUID = (uid: string) => {
    navigator.clipboard.writeText(uid);
    showToast('UID Copied', `Copied Student UID ${uid} to clipboard.`, 'success');
  };

  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = 
      student.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (performanceFilter === 'all') return matchesSearch;
    
    const score = student.final_exam_score || student.past_exam_score || 0;
    if (performanceFilter === 'outstanding') return matchesSearch && score >= 85;
    if (performanceFilter === 'good') return matchesSearch && score >= 70 && score < 85;
    if (performanceFilter === 'average') return matchesSearch && score >= 55 && score < 70;
    if (performanceFilter === 'risk') return matchesSearch && score < 55;
    
    return matchesSearch;
  });

  const handlePredictForStudent = (student: StudentRecord) => {
    makePrediction({
      student_id: student.student_id,
      student_name: student.student_name,
      attendance_percentage: student.attendance_percentage,
      past_exam_score: student.past_exam_score,
      assignment_score: student.assignment_score,
      study_hours_per_week: student.study_hours_per_week,
      previous_backlogs: student.previous_backlogs
    });
    setActiveTab('predict');
  };

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Faculty Roster Management & UID Assignment</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
            Authorized Students Roster
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Assign secure student UIDs, manage academic records, track attendance, and generate predictions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Assign Student UID</span>
          </button>
          <span className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Total: {studentsData.length}
          </span>
        </div>
      </div>

      {/* Filters & Search Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-transparent focus-within:border-indigo-500 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by student UID or name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setGlobalSearchQuery(e.target.value);
            }}
            className="w-full sm:w-64 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Filter:</span>
          
          <button
            onClick={() => setPerformanceFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              performanceFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All Records
          </button>
          
          <button
            onClick={() => setPerformanceFilter('outstanding')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              performanceFilter === 'outstanding'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
            }`}
          >
            Outstanding (&ge;85)
          </button>

          <button
            onClick={() => setPerformanceFilter('risk')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              performanceFilter === 'risk'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100'
            }`}
          >
            Needs Support (&lt;55)
          </button>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Student UID & Name</th>
                  <th className="px-4 py-3.5">Attendance</th>
                  <th className="px-4 py-3.5">Past Exam Score</th>
                  <th className="px-4 py-3.5">Assignments</th>
                  <th className="px-4 py-3.5">Study Hrs/Wk</th>
                  <th className="px-4 py-3.5">Backlogs</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredStudents.map((student, idx) => (
                  <tr key={student.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {student.student_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {student.student_name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono block">
                            {student.student_id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        student.attendance_percentage >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {student.attendance_percentage}%
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-bold font-mono text-slate-800 dark:text-slate-200">
                      {student.past_exam_score} / 100
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                      {student.assignment_score} pts
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                      {student.study_hours_per_week} hrs
                    </td>

                    <td className="px-4 py-3.5">
                      {student.previous_backlogs > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                          <AlertTriangle className="w-3 h-3" /> {student.previous_backlogs} Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Clean
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-xs"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handlePredictForStudent(student)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors flex items-center gap-1 text-xs shadow-xs"
                        >
                          <Sparkles className="w-3 h-3" /> Predict
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No student records found</p>
            <p className="text-xs text-slate-500 mt-1">
              Upload a dataset in the Dataset Upload tab or adjust your search filter.
            </p>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold">
                {selectedStudent.student_name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedStudent.student_name}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  UID: {selectedStudent.student_id}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-6 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Class Attendance</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedStudent.attendance_percentage}%</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Past Exam Marks</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedStudent.past_exam_score} / 100</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Assignment Score</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedStudent.assignment_score} pts</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Weekly Study Hours</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedStudent.study_hours_per_week} hrs</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Active Backlogs</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedStudent.previous_backlogs}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Parent Education</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedStudent.parent_education_level || 'N/A'}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const s = selectedStudent;
                  setSelectedStudent(null);
                  handlePredictForStudent(s);
                }}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Predict Exam Score
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Registration / UID Assignment Modal */}
      <StudentRegistrationModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        defaultMode="assign"
      />
    </div>
  );
};
