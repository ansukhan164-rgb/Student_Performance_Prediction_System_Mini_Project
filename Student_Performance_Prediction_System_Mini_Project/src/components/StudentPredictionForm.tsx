import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PredictionInput, PredictionResult } from '../types';
import { 
  GraduationCap, 
  Sparkles, 
  Zap, 
  FileText, 
  AlertCircle,
  Cpu
} from 'lucide-react';
import { generateStudentPredictionPDF } from '../services/pdfReportGenerator';
import { fetchAIAdvice } from '../services/geminiService';

export const StudentPredictionForm: React.FC = () => {
  const { currentUser, activeModel, activeDataset, makePrediction, setActiveTab } = useApp();

  // If the logged-in student has an uploaded record in the active dataset, prefill from it
  const myRecord = activeDataset?.data?.find(r => 
    (currentUser.studentId && r.student_id?.toLowerCase() === currentUser.studentId?.toLowerCase()) ||
    (currentUser.fullName && r.student_name?.toLowerCase() === currentUser.fullName?.toLowerCase())
  );

  const [studentName, setStudentName] = useState(currentUser.fullName);
  const [studentId, setStudentId] = useState(currentUser.studentId || myRecord?.student_id || '');
  const [attendance, setAttendance] = useState<number>(myRecord ? myRecord.attendance_percentage : 75);
  const [pastExam, setPastExam] = useState<number>(myRecord ? myRecord.past_exam_score : 70);
  const [assignment, setAssignment] = useState<number>(myRecord ? myRecord.assignment_score : 70);
  const [studyHours, setStudyHours] = useState<number>(myRecord ? myRecord.study_hours_per_week : 12);
  const [sleepHours, setSleepHours] = useState<number>(myRecord?.sleep_hours ?? 7);
  const [parentEd, setParentEd] = useState<'High School' | 'Bachelor' | 'Master' | 'Doctorate'>((myRecord?.parent_education_level as any) || 'Bachelor');
  const [extracurriculars, setExtracurriculars] = useState<'Yes' | 'No'>((myRecord?.extracurricular_activities as any) || 'No');
  const [backlogs, setBacklogs] = useState<number>(myRecord ? myRecord.previous_backlogs : 0);

  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [aiAnalysisText, setAiAnalysisText] = useState<string>('');

  if (!activeDataset) {
    return (
      <div className="space-y-6">
        <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Interactive Score Estimation</span>
          </div>
          <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white mt-1">
            Predict Student Examination Score
          </h1>
        </div>

        <div className="py-16 text-center space-y-4 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Dataset Uploaded</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Predictions are generated strictly from machine learning models trained on user-uploaded datasets. Please upload a student dataset first.
          </p>
          <button
            onClick={() => setActiveTab('datasets')}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs inline-flex items-center gap-2"
          >
            <Cpu className="w-4 h-4" />
            <span>Go to Dataset Upload</span>
          </button>
        </div>
      </div>
    );
  }

  if (!activeModel) {
    return (
      <div className="space-y-6">
        <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Interactive Score Estimation</span>
          </div>
          <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white mt-1">
            Predict Student Examination Score
          </h1>
        </div>

        <div className="py-16 text-center space-y-4 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Trained Machine Learning Model Available</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            A machine learning model must be trained on dataset &quot;{activeDataset.name}&quot; in the ML Workbench before predictions can be executed.
          </p>
          <button
            onClick={() => setActiveTab('training')}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs inline-flex items-center gap-2"
          >
            <Cpu className="w-4 h-4" />
            <span>Go to ML Workbench</span>
          </button>
        </div>
      </div>
    );
  }

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPredicting(true);

    const input: PredictionInput = {
      student_id: studentId,
      student_name: studentName,
      attendance_percentage: Number(attendance),
      past_exam_score: Number(pastExam),
      assignment_score: Number(assignment),
      study_hours_per_week: Number(studyHours),
      sleep_hours: Number(sleepHours),
      parent_education_level: parentEd,
      extracurricular_activities: extracurriculars,
      previous_backlogs: Number(backlogs)
    };

    setTimeout(async () => {
      const pred = makePrediction(input);
      if (pred) {
        setResult(pred);

        // Fetch AI advice via Gemini API
        const advice = await fetchAIAdvice(
          studentName,
          pred.predictedScore,
          attendance,
          pastExam,
          studyHours,
          backlogs
        );

        if (advice && advice.summary) {
          setAiAnalysisText(advice.summary);
        }
      }

      setIsPredicting(false);
    }, 700);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          <span>Interactive Score Estimation</span>
        </div>
        <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white mt-1">
          Predict Student Examination Score
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Input student academic parameters to calculate predicted final examination marks using active ML model <strong className="text-indigo-600 dark:text-indigo-400 font-mono">({activeModel.name})</strong>.
        </p>
      </div>

      {/* INPUT FORM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <form onSubmit={handlePredict} className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Student Input Parameters</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Student Name</label>
              <input
                type="text"
                required
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Student ID</label>
              <input
                type="text"
                required
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Attendance Rate (%) [0-100]</label>
              <input
                type="number"
                min={0}
                max={100}
                required
                value={attendance}
                onChange={e => setAttendance(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Past Exam Score [0-100]</label>
              <input
                type="number"
                min={0}
                max={100}
                required
                value={pastExam}
                onChange={e => setPastExam(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Assignment Score [0-100]</label>
              <input
                type="number"
                min={0}
                max={100}
                required
                value={assignment}
                onChange={e => setAssignment(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Weekly Study Hours</label>
              <input
                type="number"
                min={0}
                max={40}
                required
                value={studyHours}
                onChange={e => setStudyHours(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Parent Education Level</label>
              <select
                value={parentEd}
                onChange={e => setParentEd(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
              >
                <option value="High School">High School</option>
                <option value="Bachelor">Bachelor Degree</option>
                <option value="Master">Master Degree</option>
                <option value="Doctorate">Doctorate</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Active Backlogs</label>
              <input
                type="number"
                min={0}
                max={10}
                required
                value={backlogs}
                onChange={e => setBacklogs(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isPredicting}
              className="px-6 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              {isPredicting ? <Zap className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isPredicting ? 'Executing Model Inference...' : 'Generate Prediction'}</span>
            </button>
          </div>
        </form>

        {/* PREDICTION RESULT DISPLAY PANEL */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Prediction Outcome</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Calculated via active {activeModel.algorithmLabel}</p>
          </div>

          {result ? (
            <div className="space-y-5 text-center my-auto py-4">
              <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tight animate-in zoom-in-95">
                {result.predictedScore.toFixed(1)} <span className="text-xl text-slate-400 font-normal">/ 100</span>
              </div>

              <div 
                className="inline-block px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: result.categoryColor }}
              >
                Category: {result.performanceCategory}
              </div>

              {aiAnalysisText && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border text-left text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong className="text-indigo-600 dark:text-indigo-400 block mb-1 font-bold">AI Tutor Summary:</strong>
                  {aiAnalysisText}
                </div>
              )}

              <button
                onClick={() => generateStudentPredictionPDF(result)}
                className="w-full py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Download Official PDF Report</span>
              </button>
            </div>
          ) : (
            <div className="my-auto text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-500 flex items-center justify-center mx-auto">
                <GraduationCap className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Fill in student academic parameters on the left and click "Generate Prediction".
              </p>
            </div>
          )}

          <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 dark:border-slate-800 pt-3">
            Disclaimer: Estimated score derived from historical machine learning regression models.
          </div>
        </div>

      </div>

    </div>
  );
};
