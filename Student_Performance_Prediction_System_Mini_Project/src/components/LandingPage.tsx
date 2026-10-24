import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  ArrowRight, 
  BarChart3, 
  Cpu, 
  FileText, 
  TrendingUp, 
  Database,
  Layers,
  GraduationCap,
  Users
} from 'lucide-react';

export const LandingPage: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { setActiveTab, switchRole } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32 bg-gradient-to-b from-indigo-50/50 via-slate-50 to-slate-50 dark:from-indigo-950/20 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tracking-wide border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>BCA Data Mining & Machine Learning Project</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Student Performance Prediction <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500">System</span>
            </h1>

            <p className="text-lg sm:text-xl font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Predict Student Performance. Understand Academic Progress. Make Better Decisions.
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              An educational analytics platform that helps teachers analyze student academic data, predict examination scores, and monitor student performance.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => { switchRole('teacher'); setActiveTab('dashboard'); }}
                className="px-6 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Users className="w-4 h-4" />
                <span>Get Started as Teacher</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => { switchRole('student'); setActiveTab('predict'); }}
                className="px-6 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xs flex items-center gap-2 transition-all"
              >
                <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Student Exam Predictor</span>
              </button>

              <button
                onClick={onOpenAuth}
                className="px-5 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors"
              >
                Explore Sign In
              </button>
            </div>

            <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-slate-200 dark:border-slate-800 text-left">
              <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">Real-time</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">ML Regression Models</div>
              </div>

              <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">CSV / Excel</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dataset Upload & Clean</div>
              </div>

              <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">2 Roles</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Teacher & Student Portals</div>
              </div>

              <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">Instant</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">PDF Study Reports</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">System Workflow</h2>
            <h3 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">How Prediction System Works</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">From raw academic data upload to machine learning predictions and PDF exports.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { step: '01', title: 'Upload Dataset', desc: 'Import CSV or Excel files with student attendance, study hours, and exam marks.', icon: Database },
              { step: '02', title: 'Clean & Preprocess', desc: 'Auto-impute missing values, remove duplicates, and encode categorical fields.', icon: Layers },
              { step: '03', title: 'Train ML Model', desc: 'Train Linear, Decision Tree, Random Forest, or Gradient Boosting models.', icon: Cpu },
              { step: '04', title: 'Predict Scores', desc: 'Generate estimated examination scores for individual student profiles.', icon: TrendingUp },
              { step: '05', title: 'Download Reports', desc: 'Export official PDF reports containing study recommendations and metrics.', icon: FileText },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-extrabold font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950 px-2.5 py-1 rounded-md">{s.step}</span>
                      <Icon className="w-5 h-5 text-slate-400" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{s.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white font-heading block">Student Performance AI</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Educational Machine Learning Platform</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 text-center md:text-right">
            <span>© 2026 Ansar AI. All rights reserved. Developed by <strong>Ansar</strong>.</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
