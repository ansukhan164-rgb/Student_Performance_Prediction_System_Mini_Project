import React from 'react';
import { useApp } from '../context/AppContext';
import { StudentPerformanceAnalytics } from './StudentPerformanceAnalytics';
import { 
  GraduationCap, 
  Sparkles, 
  FileText, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { generateStudentPredictionPDF } from '../services/pdfReportGenerator';

export const StudentDashboard: React.FC = () => {
  const { currentUser, latestPrediction, predictions, setActiveTab } = useApp();

  const userPredictions = predictions.filter(p => 
    (currentUser.studentId && p.studentId?.toLowerCase() === currentUser.studentId.toLowerCase()) ||
    (currentUser.fullName && p.studentName?.toLowerCase() === currentUser.fullName.toLowerCase())
  );
  const activePred = userPredictions[0] || null;

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-800/80 text-indigo-200 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Portal · {currentUser.fullName}</span>
            </div>
            <h1 className="text-3xl font-black font-heading">Welcome back, {currentUser.fullName}!</h1>
            <p className="text-xs text-indigo-200 max-w-xl">
              Calculate your estimated examination performance, view academic study recommendations, and analyze interactive performance graphs.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('predict')}
            className="px-6 py-4 text-sm font-extrabold text-indigo-950 bg-white hover:bg-indigo-50 rounded-2xl shadow-lg flex items-center gap-2.5 shrink-0 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Predict My Performance</span>
            <ArrowRight className="w-4 h-4 text-indigo-600" />
          </button>
        </div>
      </div>

      {/* SCORE ESTIMATE OR EMPTY STATE */}
      {activePred ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Score Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Latest Score Estimate</span>
              <span className="text-[10px] font-mono text-slate-400">{activePred.predictionDate}</span>
            </div>

            <div className="text-center py-4 space-y-2">
              <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
                {activePred.predictedScore.toFixed(1)} <span className="text-xl text-slate-400 font-normal">/ 100</span>
              </div>
              <div 
                className="inline-block px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: activePred.categoryColor }}
              >
                Performance: {activePred.performanceCategory}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
              <span>ML Model: {activePred.modelName}</span>
              <button
                onClick={() => generateStudentPredictionPDF(activePred)}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Actionable Recommendations List */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Personalized Academic Study Recommendations</span>
            </h3>

            <div className="space-y-3">
              {activePred.recommendations.map((rec, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="p-12 text-center space-y-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Predictions Calculated Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Calculate your examination score estimate by entering your attendance and study parameters.
          </p>
          <button
            onClick={() => setActiveTab('predict')}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Calculate Performance Estimate Now</span>
          </button>
        </div>
      )}

      {/* STUDENT PERFORMANCE ANALYTICS SECTION */}
      <StudentPerformanceAnalytics userRole="student" />

      {/* PREDICTION HISTORY TABLE */}
      {userPredictions.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">My Prediction History</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Prediction Date</th>
                  <th className="p-3">Model Used</th>
                  <th className="p-3">Attendance</th>
                  <th className="p-3">Predicted Score</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {userPredictions.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 text-slate-500">{p.predictionDate}</td>
                    <td className="p-3 font-sans font-medium text-slate-900 dark:text-slate-100">{p.modelName}</td>
                    <td className="p-3">{p.inputs.attendance_percentage}%</td>
                    <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{p.predictedScore.toFixed(1)}/100</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded text-white" style={{ backgroundColor: p.categoryColor }}>
                        {p.performanceCategory}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => generateStudentPredictionPDF(p)}
                        className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded flex items-center gap-1 ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
