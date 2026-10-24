import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PreprocessingConfig } from '../types';
import { 
  Sliders, 
  Sparkles, 
  Database,
  ArrowRight,
  AlertCircle,
  Upload
} from 'lucide-react';

export const DataCleaning: React.FC = () => {
  const { activeDataset, cleanDataset, setActiveTab } = useApp();

  const [imputeMethod, setImputeMethod] = useState<'mean' | 'median' | 'mode'>('mean');
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [normalizeNumerical, setNormalizeNumerical] = useState(true);
  const [categoricalEncoding, setCategoricalEncoding] = useState<'onehot' | 'label'>('onehot');

  if (!activeDataset) {
    return (
      <div className="space-y-6">
        <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white">Data Preprocessing & Cleaning</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure cleaning rules and handle missing student records.</p>
        </div>

        <div className="py-16 text-center space-y-4 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Active Dataset Loaded</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Please upload a CSV or Excel dataset file in order to run data cleaning and imputation workflows.
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

  const handleCleanData = () => {
    const config: PreprocessingConfig = {
      imputeMethod,
      removeDuplicates,
      normalizeNumerical,
      categoricalEncoding,
      selectedFeatures: [
        'attendance_percentage',
        'past_exam_score',
        'assignment_score',
        'study_hours_per_week',
        'sleep_hours',
        'previous_backlogs'
      ],
      targetColumn: 'final_exam_score'
    };

    cleanDataset(activeDataset.id, config);
  };

  const currentCount = activeDataset.cleanedData ? activeDataset.cleanedData.length : activeDataset.data.length;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white">Data Preprocessing & Cleaning</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure cleaning rules, handle missing records, and encode attributes.</p>
        </div>

        <button
          onClick={handleCleanData}
          className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Execute Preprocessing Pipeline</span>
        </button>
      </div>

      {/* STATUS OVERVIEW CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Dataset Status</span>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-2">
            <Database className="w-5 h-5" />
            <span>{activeDataset.status}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">File: {activeDataset.name}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Valid Student Rows</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">{currentCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Original count: {activeDataset.rowCount}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Next Action</span>
          <button
            onClick={() => setActiveTab('training')}
            className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Proceed to Model Training</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* PREPROCESSING CONFIGURATION PANEL */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Preprocessing Configuration Rules</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">Missing Value Imputation Strategy</label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Method used to replace missing numerical values in study hours or exam marks.</p>
            <select
              value={imputeMethod}
              onChange={e => setImputeMethod(e.target.value as any)}
              className="w-full mt-2 p-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
            >
              <option value="mean">Mean Imputation (Recommended)</option>
              <option value="median">Median Imputation</option>
              <option value="mode">Mode / Most Frequent Value</option>
            </select>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">Duplicate Records Handling</label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Automatically detect and strip duplicate student ID records.</p>
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="dupCheck"
                checked={removeDuplicates}
                onChange={e => setRemoveDuplicates(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <label htmlFor="dupCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Strip Duplicate Student Entries
              </label>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">Categorical Feature Encoding</label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Transforms parent education and extracurriculars to numerical vectors.</p>
            <select
              value={categoricalEncoding}
              onChange={e => setCategoricalEncoding(e.target.value as any)}
              className="w-full mt-2 p-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
            >
              <option value="onehot">One-Hot Encoding (Ordinal / Dummy Variables)</option>
              <option value="label">Label / Ordinal Numeric Mapping</option>
            </select>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">Numerical Feature Scaling</label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">StandardScaler Z-score normalization for linear regression stability.</p>
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="normCheck"
                checked={normalizeNumerical}
                onChange={e => setNormalizeNumerical(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <label htmlFor="normCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Enable Standard Z-Score Feature Scaling
              </label>
            </div>
          </div>

        </div>
      </div>

      {/* CLEANING AUDIT LOG */}
      {activeDataset.cleaningLog && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Preprocessing Execution Audit Log</h3>
          <div className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs space-y-1.5 overflow-x-auto">
            {activeDataset.cleaningLog.map((logItem, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-slate-600">&gt;</span>
                <span>{logItem}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
