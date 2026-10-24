import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MLAlgorithm, TrainedModel } from '../types';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Upload,
  Sliders,
  ShieldAlert,
  Database,
  BarChart3,
  Cpu
} from 'lucide-react';

export const ModelTraining: React.FC = () => {
  const { activeDataset, trainModel, setActiveTab, activeModel } = useApp();

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<MLAlgorithm>('random_forest');
  const [modelNameInput, setModelNameInput] = useState('Random Forest Regressor v1.0');
  const [isTraining, setIsTraining] = useState(false);
  const [lastTrained, setLastTrained] = useState<TrainedModel | null>(null);

  const datasetRecords = useMemo(() => {
    if (!activeDataset) return [];
    return activeDataset.cleanedData || activeDataset.data || [];
  }, [activeDataset]);

  const rowCount = datasetRecords.length;

  // Dynamically detect all numeric and categorical columns from the uploaded dataset
  const detectedColumns = useMemo(() => {
    if (datasetRecords.length === 0) return { numeric: [], categorical: [], all: [] };

    const first = datasetRecords[0] || {};
    const excludedKeys = new Set(['id', 'student_id', 'student_name', 'name', 'uid']);
    
    const numericCols: string[] = [];
    const categoricalCols: string[] = [];

    Object.keys(first).forEach(key => {
      if (excludedKeys.has(key)) return;
      
      // Test if column values are largely numeric
      const numericCount = datasetRecords.filter(r => {
        const val = r[key];
        return typeof val === 'number' && !isNaN(val);
      }).length;

      if (numericCount > rowCount * 0.4) {
        numericCols.push(key);
      } else {
        categoricalCols.push(key);
      }
    });

    return {
      numeric: numericCols,
      categorical: categoricalCols,
      all: [...numericCols, ...categoricalCols]
    };
  }, [datasetRecords, rowCount]);

  // Dynamic target column selection: defaults to final_exam_score if available, otherwise first numeric
  const [selectedTargetColumn, setSelectedTargetColumn] = useState<string>('final_exam_score');

  useEffect(() => {
    if (detectedColumns.numeric.length > 0) {
      if (detectedColumns.numeric.includes('final_exam_score')) {
        setSelectedTargetColumn('final_exam_score');
      } else if (!detectedColumns.numeric.includes(selectedTargetColumn)) {
        setSelectedTargetColumn(detectedColumns.numeric[0]);
      }
    }
  }, [detectedColumns.numeric]);

  // Available features: exclude the selected target column
  const availableFeatures = useMemo(() => {
    return detectedColumns.all.filter(col => col !== selectedTargetColumn);
  }, [detectedColumns.all, selectedTargetColumn]);

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // Automatically select all available features on initial load or target change
  useEffect(() => {
    setSelectedFeatures(availableFeatures);
  }, [availableFeatures]);

  // Validation checks
  const isInsufficientRows = rowCount < 5;
  const hasNoNumericColumns = detectedColumns.numeric.length === 0;

  if (!activeDataset || datasetRecords.length === 0) {
    return (
      <div className="space-y-6">
        <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white">Machine Learning Model Training Workbench</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Train regression models on real uploaded student datasets.</p>
        </div>

        <div className="py-20 text-center space-y-4 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-500 flex items-center justify-center mx-auto shadow-inner">
            <Database className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">No Dataset Available for Training</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Machine learning model training requires an uploaded student dataset. Upload a CSV or Excel dataset to train real predictive algorithms.
          </p>
          <button
            onClick={() => setActiveTab('datasets')}
            className="px-6 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/20 inline-flex items-center gap-2 transition-all hover:scale-105"
          >
            <Upload className="w-4 h-4" />
            <span>Go to Dataset Upload</span>
          </button>
        </div>
      </div>
    );
  }

  const toggleFeature = (id: string) => {
    setSelectedFeatures(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleTrain = () => {
    if (selectedFeatures.length === 0 || isInsufficientRows || hasNoNumericColumns) return;
    setIsTraining(true);

    setTimeout(() => {
      const model = trainModel(
        selectedFeatures,
        selectedTargetColumn,
        selectedAlgorithm,
        modelNameInput
      );
      if (model) {
        setLastTrained(model);
      }
      setIsTraining(false);
    }, 600);
  };

  const displayModel = lastTrained || activeModel;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white">Machine Learning Model Training Workbench</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Training ML algorithms on uploaded dataset <strong className="text-indigo-600 dark:text-indigo-400 font-semibold font-mono">({activeDataset.name})</strong> with {rowCount} student records.
          </p>
        </div>

        <button
          onClick={handleTrain}
          disabled={isTraining || selectedFeatures.length === 0 || isInsufficientRows || hasNoNumericColumns}
          className="px-6 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isTraining ? <Zap className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isTraining ? 'Training Model Pipeline...' : 'Train ML Model'}</span>
        </button>
      </div>

      {/* VALIDATION WARNING BANNERS */}
      {isInsufficientRows && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
            <strong className="font-bold block">Insufficient Dataset Records ({rowCount} Rows Detected)</strong>
            <p>
              Machine learning regression requires a minimum of 5 records to perform the 80/20 train-test split and calculate variance. Please upload a dataset with 5 or more rows in the Dataset Upload section.
            </p>
          </div>
        </div>
      )}

      {hasNoNumericColumns && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800 dark:text-rose-200 space-y-1">
            <strong className="font-bold block">No Numeric Columns Detected for Target Regression</strong>
            <p>
              All columns in this dataset appear to be text. Ensure your uploaded CSV or Excel file has numeric scores (e.g. past_exam_score, assignment_score, attendance_percentage).
            </p>
          </div>
        </div>
      )}

      {/* TRAINING CONFIGURATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Algorithm & Parameters */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">1. Select Regression Algorithm</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: 'linear_regression', name: 'Linear Regression', desc: 'Ordinary least squares linear weights with L2 regularization.' },
              { id: 'decision_tree', name: 'Decision Tree Regressor', desc: 'Recursive binary splitting based on variance reduction / MSE.' },
              { id: 'random_forest', name: 'Random Forest Regressor', desc: 'Ensemble of bootstrap decision trees with feature subsampling.' },
              { id: 'gradient_boosting', name: 'Gradient Boosting Regressor', desc: 'Sequential boosted decision trees fitting residual error.' }
            ].map(alg => {
              const isSelected = selectedAlgorithm === alg.id;
              return (
                <div
                  key={alg.id}
                  onClick={() => setSelectedAlgorithm(alg.id as MLAlgorithm)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{alg.name}</h4>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{alg.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Target Column Selection */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">2. Select Dynamic Target Column</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">The numeric academic variable the model will learn to predict.</p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md">
                Target: {selectedTargetColumn}
              </span>
            </div>

            <select
              value={selectedTargetColumn}
              onChange={e => setSelectedTargetColumn(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:border-indigo-500"
            >
              {detectedColumns.numeric.map(col => (
                <option key={col} value={col}>
                  {col} (Numeric column from {activeDataset.name})
                </option>
              ))}
            </select>
          </div>

          {/* Feature Inputs Selection */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">3. Select Feature Inputs ({selectedFeatures.length} selected)</h3>
              <button
                onClick={() => setSelectedFeatures(availableFeatures)}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Select All
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {availableFeatures.map(feat => {
                const checked = selectedFeatures.includes(feat);
                return (
                  <label
                    key={feat}
                    className={`p-2.5 rounded-lg border text-xs font-semibold cursor-pointer flex items-center gap-2 transition-colors ${
                      checked
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFeature(feat)}
                      className="w-3.5 h-3.5 text-indigo-600 rounded"
                    />
                    <span className="truncate font-mono text-[11px]">{feat.replace(/_/g, ' ')}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Custom Model Name & Info */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">4. Model Identity & Split</h3>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Model Name</label>
            <input
              type="text"
              value={modelNameInput}
              onChange={e => setModelNameInput(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Active Dataset:</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white truncate max-w-[130px]" title={activeDataset.name}>
                {activeDataset.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Dataset Records:</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">{rowCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Train/Test Split:</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">80% / 20%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target Feature:</span>
              <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">{selectedTargetColumn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Input Features:</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">{selectedFeatures.length}</span>
            </div>
          </div>
        </div>

      </div>

      {/* EVALUATION RESULTS CARD */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">Real Model Evaluation Metrics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluated on the 20% test holdout partition of uploaded dataset {displayModel?.datasetName ? `(${displayModel.datasetName})` : ''}
            </p>
          </div>

          {displayModel && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Active Model:</span>
              <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-md">
                {displayModel.name}
              </span>
            </div>
          )}
        </div>

        {displayModel ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] text-slate-500">R² Score (Coeff of Determination)</span>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                  {displayModel.metrics.r2Score.toFixed(4)}
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Scale: 0.0 to 1.0</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] text-slate-500">Mean Absolute Error (MAE)</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                  {displayModel.metrics.mae.toFixed(2)}
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Marks deviation</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] text-slate-500">Root Mean Sq Error (RMSE)</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                  {displayModel.metrics.rmse.toFixed(2)}
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Residual standard deviation</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] text-slate-500">Model Accuracy %</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                  {displayModel.metrics.accuracyPercentage}%
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Variance explained</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Feature Importance Ranking</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayModel.featureImportance.map((fi, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{fi.feature.replace(/_/g, ' ')}</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{(fi.importance * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 text-center space-y-2">
            <Cpu className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">
              Click &quot;Train ML Model&quot; above to calculate real evaluation metrics and feature importance on your dataset.
            </p>
          </div>
        )}

      </div>

    </div>
  );
};
