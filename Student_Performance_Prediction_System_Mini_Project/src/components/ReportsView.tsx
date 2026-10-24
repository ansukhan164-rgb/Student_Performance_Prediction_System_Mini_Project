import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Download, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles
} from 'lucide-react';
import { generateStudentPredictionPDF } from '../services/pdfReportGenerator';

export const ReportsView: React.FC = () => {
  const { predictions, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const isTeacher = currentUser.role === 'teacher';
  
  const filteredReports = predictions.filter(p => {
    const matchesRole = isTeacher || p.studentId === currentUser.studentId || p.studentName === currentUser.fullName;
    const matchesSearch = 
      p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.performanceCategory.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleDownloadPdf = (prediction: any) => {
    generateStudentPredictionPDF(prediction);
  };

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Academic PDF Reports Archive</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
            {isTeacher ? 'Batch Performance Reports' : 'My Academic Reports'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Download official PDF performance cards containing ML predicted exam scores and AI study advice.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
            Total Reports: {filteredReports.length}
          </span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search report by student name, UID, or performance category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Reports Archive Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {filteredReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Student UID & Name</th>
                  <th className="px-4 py-3.5">Predicted Score</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Attendance</th>
                  <th className="px-4 py-3.5">Prediction Date</th>
                  <th className="px-4 py-3.5 text-right">Download PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredReports.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {p.studentName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {p.studentName}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono block">
                            {p.studentId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-bold font-mono text-indigo-600 dark:text-indigo-400 text-sm">
                      {p.predictedScore} / 100
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] text-white" style={{ backgroundColor: p.categoryColor || '#4f46e5' }}>
                        {p.performanceCategory}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                      {p.inputs.attendance_percentage}%
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                      {p.predictionDate}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleDownloadPdf(p)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors inline-flex items-center gap-1.5 text-xs shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF Card
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No report archives found</p>
            <p className="text-xs text-slate-500 mt-1">
              Generate a score prediction to create official PDF report records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
