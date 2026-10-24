import React from 'react';
import { useApp } from '../context/AppContext';
import { StudentPerformanceAnalytics } from './StudentPerformanceAnalytics';
import { 
  LineChart, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  TrendingUp, 
  Award,
  Calendar,
  Clock,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export const StudentPerformanceView: React.FC = () => {
  const { currentUser, predictions, activeDataset, setActiveTab } = useApp();

  // Find student's real record in active dataset if present
  const myRecord = activeDataset?.data?.find(r => 
    (currentUser.studentId && r.student_id?.toLowerCase() === currentUser.studentId?.toLowerCase()) ||
    (currentUser.fullName && r.student_name?.toLowerCase() === currentUser.fullName?.toLowerCase())
  );

  const myPrediction = predictions.find(p => 
    (currentUser.studentId && p.studentId?.toLowerCase() === currentUser.studentId?.toLowerCase()) ||
    (currentUser.fullName && p.studentName?.toLowerCase() === currentUser.fullName?.toLowerCase())
  );

  const hasData = !!myRecord || !!myPrediction;

  const attendanceVal = myRecord !== undefined ? myRecord.attendance_percentage : (myPrediction?.inputs?.attendance_percentage ?? null);
  const pastScoreVal = myRecord !== undefined ? myRecord.past_exam_score : (myPrediction?.inputs?.past_exam_score ?? null);
  const assignScoreVal = myRecord !== undefined ? myRecord.assignment_score : (myPrediction?.inputs?.assignment_score ?? null);
  const studyHoursVal = myRecord !== undefined ? myRecord.study_hours_per_week : (myPrediction?.inputs?.study_hours_per_week ?? null);
  const backlogsVal = myRecord !== undefined ? myRecord.previous_backlogs : (myPrediction?.inputs?.previous_backlogs ?? null);
  const targetVal = myRecord?.final_exam_score !== undefined ? myRecord.final_exam_score : null;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <LineChart className="w-4 h-4" />
            <span>Authorized Student Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
            {currentUser.fullName}'s Academic Performance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            Student UID: {currentUser.studentId || 'STD-AUTHENTICATED'}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('predict')}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" /> Run ML Score Predictor
        </button>
      </div>

      {/* Real Data Metric Cards Row OR Empty State */}
      {hasData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Attendance Rate</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono block">
              {attendanceVal !== null ? `${attendanceVal}%` : 'N/A'}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> {attendanceVal !== null && attendanceVal >= 75 ? 'Meets 75% threshold' : 'Below 75% threshold'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Past Exam Score</span>
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono block">
              {pastScoreVal !== null ? `${pastScoreVal} / 100` : 'N/A'}
            </span>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              {myRecord ? 'From uploaded dataset record' : 'From score prediction session'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Weekly Study Hours</span>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono block">
              {studyHoursVal !== null ? `${studyHoursVal} hrs/wk` : 'N/A'}
            </span>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              {backlogsVal !== null ? `${backlogsVal} active backlogs` : 'Academic profile'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ML Predicted Score</span>
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono block">
              {myPrediction?.predictedScore ? `${myPrediction.predictedScore.toFixed(1)} / 100` : 'Not Generated'}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {myPrediction?.performanceCategory || (targetVal !== null ? `Actual Target: ${targetVal}` : 'Run Score Predictor')}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center space-y-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Academic Records Available Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            No records match UID <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{currentUser.studentId || 'STD-AUTHENTICATED'}</span> in the active dataset. Your course instructor can upload your class records, or you can calculate your performance estimate using the ML predictor.
          </p>
        </div>
      )}

      {/* Embedded Personal Graph Analytics Dashboard Section */}
      <StudentPerformanceAnalytics userRole="student" />
    </div>
  );
};
