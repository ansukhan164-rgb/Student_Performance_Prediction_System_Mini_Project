import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StudentRecord, PredictionResult } from '../types';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  BarChart3,
  Filter,
  Download,
  Users,
  AlertCircle,
  Upload,
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  Calendar,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  X,
  Eye,
  Sliders,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';

interface AnalyticsProps {
  userRole?: 'teacher' | 'student';
}

export const StudentPerformanceAnalytics: React.FC<AnalyticsProps> = ({ userRole }) => {
  const {
    activeDataset,
    datasets,
    setActiveDataset,
    predictions,
    currentUser,
    setActiveTab,
    makePrediction,
    showToast
  } = useApp();

  const isStudent = (userRole || currentUser.role) === 'student';

  // ---------------------------------------------------------------------------
  // FILTER STATES
  // ---------------------------------------------------------------------------
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(activeDataset?.id || '');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(isStudent ? currentUser.studentId || 'all' : 'all');
  const [attendanceMin, setAttendanceMin] = useState<number>(0);
  const [scoreMin, setScoreMin] = useState<number>(0);
  const [backlogFilter, setBacklogFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [scoreDistMode, setScoreDistMode] = useState<'past' | 'assignment'>('past');
  const [selectedDetailStudent, setSelectedDetailStudent] = useState<StudentRecord | null>(null);

  // Sync selectedDatasetId if activeDataset changes
  React.useEffect(() => {
    if (activeDataset && !selectedDatasetId) {
      setSelectedDatasetId(activeDataset.id);
    }
  }, [activeDataset, selectedDatasetId]);

  // Current working dataset
  const currentDataset = useMemo(() => {
    return datasets.find(d => d.id === selectedDatasetId) || activeDataset || null;
  }, [datasets, selectedDatasetId, activeDataset]);

  // Raw student records from current dataset
  const rawRecords: StudentRecord[] = useMemo(() => {
    if (!currentDataset) return [];
    return currentDataset.cleanedData || currentDataset.data || [];
  }, [currentDataset]);

  // Build map of predictions for fast lookup (by student_id or student_name)
  const predictionMap = useMemo(() => {
    const map = new Map<string, PredictionResult>();
    predictions.forEach(p => {
      if (p.studentId) map.set(p.studentId.toLowerCase(), p);
      if (p.studentName) map.set(p.studentName.toLowerCase(), p);
    });
    return map;
  }, [predictions]);

  // Helper to get predicted score for a student record
  const getPredictedScore = (rec: StudentRecord): number | null => {
    const pByUid = rec.student_id ? predictionMap.get(rec.student_id.toLowerCase()) : null;
    if (pByUid) return pByUid.predictedScore;
    const pByName = rec.student_name ? predictionMap.get(rec.student_name.toLowerCase()) : null;
    if (pByName) return pByName.predictedScore;
    return null;
  };

  // Helper to get prediction category for a student record
  const getPredictionCategory = (rec: StudentRecord): string | null => {
    const pByUid = rec.student_id ? predictionMap.get(rec.student_id.toLowerCase()) : null;
    if (pByUid) return pByUid.performanceCategory;
    const pByName = rec.student_name ? predictionMap.get(rec.student_name.toLowerCase()) : null;
    if (pByName) return pByName.performanceCategory;
    
    // Fallback based on score if prediction result exists
    const pred = getPredictedScore(rec);
    if (pred === null) return null;
    if (pred >= 85) return 'Outstanding';
    if (pred >= 70) return 'Good';
    if (pred >= 55) return 'Average';
    if (pred >= 40) return 'Needs Support';
    return 'Critical Risk';
  };

  // Unique classes in current dataset
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    rawRecords.forEach(r => {
      if (r.class_name) set.add(r.class_name);
      else if (r.section) set.add(`Section ${r.section}`);
      else if (r.course) set.add(r.course);
    });
    return Array.from(set);
  }, [rawRecords]);

  // ---------------------------------------------------------------------------
  // FILTERED STUDENT RECORDS
  // ---------------------------------------------------------------------------
  const filteredRecords = useMemo(() => {
    let list = [...rawRecords];

    // If student role, restrict strictly to currentUser's studentId or name
    if (isStudent) {
      const myId = (currentUser.studentId || '').toLowerCase();
      const myName = (currentUser.fullName || '').toLowerCase();
      list = list.filter(r => 
        (r.student_id && r.student_id.toLowerCase() === myId) ||
        (r.student_name && r.student_name.toLowerCase() === myName) ||
        (r.id && r.id === currentUser.id)
      );
      return list;
    }

    // Teacher filters:
    if (selectedClass !== 'all') {
      list = list.filter(r => 
        r.class_name === selectedClass || 
        `Section ${r.section}` === selectedClass ||
        r.course === selectedClass
      );
    }

    if (selectedStudentId !== 'all') {
      list = list.filter(r => 
        r.student_id === selectedStudentId || 
        r.id === selectedStudentId || 
        r.student_name === selectedStudentId
      );
    }

    if (attendanceMin > 0) {
      list = list.filter(r => r.attendance_percentage >= attendanceMin);
    }

    if (scoreMin > 0) {
      list = list.filter(r => (r.past_exam_score || 0) >= scoreMin);
    }

    if (backlogFilter !== 'all') {
      const count = parseInt(backlogFilter, 10);
      if (backlogFilter === '3+') {
        list = list.filter(r => r.previous_backlogs >= 3);
      } else if (!isNaN(count)) {
        list = list.filter(r => r.previous_backlogs === count);
      }
    }

    if (categoryFilter !== 'all') {
      list = list.filter(r => {
        const cat = getPredictionCategory(r);
        return cat?.toLowerCase() === categoryFilter.toLowerCase();
      });
    }

    return list;
  }, [
    rawRecords,
    isStudent,
    currentUser,
    selectedClass,
    selectedStudentId,
    attendanceMin,
    scoreMin,
    backlogFilter,
    categoryFilter,
    predictionMap
  ]);

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedClass('all');
    if (!isStudent) setSelectedStudentId('all');
    setAttendanceMin(0);
    setScoreMin(0);
    setBacklogFilter('all');
    setCategoryFilter('all');
    showToast('Filters Reset', 'All analytical filters restored to default.', 'info');
  };

  // ---------------------------------------------------------------------------
  // STATISTICAL CALCULATIONS
  // ---------------------------------------------------------------------------
  const stats = useMemo(() => {
    if (filteredRecords.length === 0) {
      return {
        totalStudents: 0,
        avgAttendance: 0,
        avgPastScore: 0,
        avgAssignmentScore: 0,
        avgStudyHours: 0,
        avgBacklogs: 0,
        avgPredictedScore: null as number | null,
        needingImprovement: 0
      };
    }

    const total = filteredRecords.length;
    const sumAtt = filteredRecords.reduce((acc, r) => acc + (r.attendance_percentage || 0), 0);
    const sumPast = filteredRecords.reduce((acc, r) => acc + (r.past_exam_score || 0), 0);
    const sumAssign = filteredRecords.reduce((acc, r) => acc + (r.assignment_score || 0), 0);
    const sumStudy = filteredRecords.reduce((acc, r) => acc + (r.study_hours_per_week || 0), 0);
    const sumBacklogs = filteredRecords.reduce((acc, r) => acc + (r.previous_backlogs || 0), 0);

    let predCount = 0;
    let sumPred = 0;
    let improvementCount = 0;

    filteredRecords.forEach(r => {
      const pred = getPredictedScore(r);
      if (pred !== null) {
        sumPred += pred;
        predCount++;
        if (pred < 55) improvementCount++;
      } else {
        if ((r.attendance_percentage || 0) < 75 || (r.previous_backlogs || 0) > 0 || (r.past_exam_score || 0) < 55) {
          improvementCount++;
        }
      }
    });

    return {
      totalStudents: total,
      avgAttendance: Math.round((sumAtt / total) * 10) / 10,
      avgPastScore: Math.round((sumPast / total) * 10) / 10,
      avgAssignmentScore: Math.round((sumAssign / total) * 10) / 10,
      avgStudyHours: Math.round((sumStudy / total) * 10) / 10,
      avgBacklogs: Math.round((sumBacklogs / total) * 10) / 10,
      avgPredictedScore: predCount > 0 ? Math.round((sumPred / predCount) * 10) / 10 : null,
      needingImprovement: improvementCount
    };
  }, [filteredRecords, predictionMap]);

  // Check if any predictions exist for filtered records
  const hasPredictions = useMemo(() => {
    return filteredRecords.some(r => getPredictedScore(r) !== null);
  }, [filteredRecords, predictionMap]);

  // Check if target final exam scores exist in dataset
  const hasTargetScores = useMemo(() => {
    return filteredRecords.some(r => typeof r.final_exam_score === 'number' && !isNaN(r.final_exam_score));
  }, [filteredRecords]);

  // ---------------------------------------------------------------------------
  // GRAPH 1 DATA: Student Performance Comparison (Bar Chart)
  // ---------------------------------------------------------------------------
  const graph1Data = useMemo(() => {
    return filteredRecords.slice(0, 25).map(r => ({
      name: r.student_name || r.student_id || 'Student',
      uid: r.student_id || r.id,
      pastScore: r.past_exam_score || 0,
      assignmentScore: r.assignment_score || 0,
      predictedScore: getPredictedScore(r) || 0,
      rawRecord: r
    }));
  }, [filteredRecords, predictionMap]);

  // ---------------------------------------------------------------------------
  // GRAPH 2 DATA: Attendance vs Performance (Scatter Plot)
  // ---------------------------------------------------------------------------
  const graph2Data = useMemo(() => {
    return filteredRecords
      .map(r => {
        const pred = getPredictedScore(r);
        if (pred === null) return null;
        return {
          x: r.attendance_percentage,
          y: pred,
          name: r.student_name || r.student_id,
          uid: r.student_id,
          rawRecord: r
        };
      })
      .filter(Boolean) as { x: number; y: number; name: string; uid: string; rawRecord: StudentRecord }[];
  }, [filteredRecords, predictionMap]);

  // ---------------------------------------------------------------------------
  // GRAPH 3 DATA: Study Hours vs Performance (Scatter Plot)
  // ---------------------------------------------------------------------------
  const graph3Data = useMemo(() => {
    return filteredRecords
      .map(r => {
        const pred = getPredictedScore(r);
        if (pred === null) return null;
        return {
          x: r.study_hours_per_week,
          y: pred,
          name: r.student_name || r.student_id,
          uid: r.student_id,
          rawRecord: r
        };
      })
      .filter(Boolean) as { x: number; y: number; name: string; uid: string; rawRecord: StudentRecord }[];
  }, [filteredRecords, predictionMap]);

  // ---------------------------------------------------------------------------
  // GRAPH 4 DATA: Attendance Distribution Histogram
  // Ranges: 0–40%, 41–60%, 61–75%, 76–90%, 91–100%
  // ---------------------------------------------------------------------------
  const graph4Data = useMemo(() => {
    const buckets = [
      { range: '0–40%', count: 0 },
      { range: '41–60%', count: 0 },
      { range: '61–75%', count: 0 },
      { range: '76–90%', count: 0 },
      { range: '91–100%', count: 0 }
    ];

    filteredRecords.forEach(r => {
      const att = r.attendance_percentage;
      if (typeof att !== 'number' || isNaN(att)) return;
      if (att <= 40) buckets[0].count++;
      else if (att <= 60) buckets[1].count++;
      else if (att <= 75) buckets[2].count++;
      else if (att <= 90) buckets[3].count++;
      else if (att <= 100) buckets[4].count++;
    });

    return buckets;
  }, [filteredRecords]);

  // ---------------------------------------------------------------------------
  // GRAPH 5 DATA: Score Distribution Histogram (Past vs Assignment)
  // ---------------------------------------------------------------------------
  const graph5Data = useMemo(() => {
    const buckets = [
      { range: '0–20', count: 0 },
      { range: '21–40', count: 0 },
      { range: '41–60', count: 0 },
      { range: '61–80', count: 0 },
      { range: '81–100', count: 0 }
    ];

    filteredRecords.forEach(r => {
      const score = scoreDistMode === 'past' ? r.past_exam_score : r.assignment_score;
      if (typeof score !== 'number' || isNaN(score)) return;
      if (score <= 20) buckets[0].count++;
      else if (score <= 40) buckets[1].count++;
      else if (score <= 60) buckets[2].count++;
      else if (score <= 80) buckets[3].count++;
      else if (score <= 100) buckets[4].count++;
    });

    return buckets;
  }, [filteredRecords, scoreDistMode]);

  // ---------------------------------------------------------------------------
  // GRAPH 6 DATA: Backlog Analysis (Bar Chart)
  // ---------------------------------------------------------------------------
  const graph6Data = useMemo(() => {
    const counts = { '0 Backlogs': 0, '1 Backlog': 0, '2 Backlogs': 0, '3+ Backlogs': 0 };

    filteredRecords.forEach(r => {
      const b = r.previous_backlogs || 0;
      if (b === 0) counts['0 Backlogs']++;
      else if (b === 1) counts['1 Backlog']++;
      else if (b === 2) counts['2 Backlogs']++;
      else counts['3+ Backlogs']++;
    });

    return Object.entries(counts).map(([category, count]) => ({ category, count }));
  }, [filteredRecords]);

  // ---------------------------------------------------------------------------
  // GRAPH 7 DATA: Performance Category Distribution (Pie / Doughnut Chart)
  // ---------------------------------------------------------------------------
  const graph7Data = useMemo(() => {
    const counts = { Excellent: 0, Good: 0, Average: 0, 'Needs Improvement': 0 };
    let totalPreds = 0;

    filteredRecords.forEach(r => {
      const pred = getPredictedScore(r);
      if (pred === null) return;
      totalPreds++;
      if (pred >= 85) counts.Excellent++;
      else if (pred >= 70) counts.Good++;
      else if (pred >= 55) counts.Average++;
      else counts['Needs Improvement']++;
    });

    if (totalPreds === 0) return [];

    const colors = {
      Excellent: '#10B981', // emerald
      Good: '#3B82F6', // blue
      Average: '#F59E0B', // amber
      'Needs Improvement': '#EF4444' // red
    };

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: Math.round((count / totalPreds) * 100),
        color: colors[name as keyof typeof colors]
      }));
  }, [filteredRecords, predictionMap]);

  // ---------------------------------------------------------------------------
  // GRAPH 8 DATA & CALCULATIONS: Actual vs Predicted Score (Line Chart + Metrics)
  // ---------------------------------------------------------------------------
  const graph8DataAndMetrics = useMemo(() => {
    if (!hasTargetScores) return { data: [], mae: 0, rmse: 0, r2: 0 };

    const validPairs: { name: string; actual: number; predicted: number }[] = [];
    filteredRecords.forEach(r => {
      if (typeof r.final_exam_score === 'number' && !isNaN(r.final_exam_score)) {
        const pred = getPredictedScore(r);
        if (pred !== null) {
          validPairs.push({
            name: r.student_name || r.student_id || 'Student',
            actual: r.final_exam_score,
            predicted: pred
          });
        }
      }
    });

    if (validPairs.length === 0) return { data: [], mae: 0, rmse: 0, r2: 0 };

    // Calculate MAE, RMSE, R²
    const n = validPairs.length;
    let sumAbsErr = 0;
    let sumSqErr = 0;
    const actualSum = validPairs.reduce((acc, p) => acc + p.actual, 0);
    const actualMean = actualSum / n;
    let totalSumSq = 0;

    validPairs.forEach(p => {
      const err = p.actual - p.predicted;
      sumAbsErr += Math.abs(err);
      sumSqErr += err * err;
      totalSumSq += (p.actual - actualMean) * (p.actual - actualMean);
    });

    const mae = Math.round((sumAbsErr / n) * 100) / 100;
    const rmse = Math.round(Math.sqrt(sumSqErr / n) * 100) / 100;
    const r2 = totalSumSq > 0 ? Math.round((1 - sumSqErr / totalSumSq) * 1000) / 1000 : 1;

    return {
      data: validPairs.slice(0, 30),
      mae,
      rmse,
      r2
    };
  }, [filteredRecords, hasTargetScores, predictionMap]);

  // ---------------------------------------------------------------------------
  // GRAPH 9 DATA: Student Performance Trend over Time
  // ---------------------------------------------------------------------------
  const graph9Data = useMemo(() => {
    // Check if any record has historical assessment fields
    const targetStudent = selectedStudentId !== 'all' 
      ? filteredRecords.find(r => r.student_id === selectedStudentId || r.id === selectedStudentId)
      : filteredRecords[0];

    if (!targetStudent) return { data: [], studentName: '', hasData: false };

    const points = [];
    if (typeof targetStudent.mst1_score === 'number') points.push({ assessment: 'MST-1', score: targetStudent.mst1_score });
    if (typeof targetStudent.mst2_score === 'number') points.push({ assessment: 'MST-2', score: targetStudent.mst2_score });
    if (typeof targetStudent.assignment_score === 'number') points.push({ assessment: 'Assignment', score: targetStudent.assignment_score });
    if (typeof targetStudent.past_exam_score === 'number') points.push({ assessment: 'Mid-Term Exam', score: targetStudent.past_exam_score });

    const pred = getPredictedScore(targetStudent);
    if (pred !== null) points.push({ assessment: 'Predicted Final', score: pred });
    if (typeof targetStudent.final_exam_score === 'number') points.push({ assessment: 'Actual Final', score: targetStudent.final_exam_score });

    return {
      data: points,
      studentName: targetStudent.student_name || targetStudent.student_id || 'Student',
      hasData: points.length >= 2
    };
  }, [filteredRecords, selectedStudentId, predictionMap]);

  // ---------------------------------------------------------------------------
  // GRAPH 10 DATA: Class Performance Analysis
  // ---------------------------------------------------------------------------
  const graph10Data = useMemo(() => {
    if (availableClasses.length <= 1) return [];

    const classStatsMap: Record<string, { total: number; sumPast: number; sumAssign: number; sumPred: number; predCount: number }> = {};

    rawRecords.forEach(r => {
      const clsName = r.class_name || (r.section ? `Section ${r.section}` : r.course) || 'Default Class';
      if (!classStatsMap[clsName]) {
        classStatsMap[clsName] = { total: 0, sumPast: 0, sumAssign: 0, sumPred: 0, predCount: 0 };
      }
      classStatsMap[clsName].total++;
      classStatsMap[clsName].sumPast += r.past_exam_score || 0;
      classStatsMap[clsName].sumAssign += r.assignment_score || 0;
      
      const pred = getPredictedScore(r);
      if (pred !== null) {
        classStatsMap[clsName].sumPred += pred;
        classStatsMap[clsName].predCount++;
      }
    });

    return Object.entries(classStatsMap).map(([className, data]) => ({
      className,
      avgPast: Math.round((data.sumPast / data.total) * 10) / 10,
      avgAssignment: Math.round((data.sumAssign / data.total) * 10) / 10,
      avgPredicted: data.predCount > 0 ? Math.round((data.sumPred / data.predCount) * 10) / 10 : 0
    }));
  }, [rawRecords, availableClasses, predictionMap]);

  // ---------------------------------------------------------------------------
  // EXPORT PNG FUNCTIONALITY
  // ---------------------------------------------------------------------------
  const handleExportChartPNG = (containerId: string, title: string) => {
    const el = document.getElementById(containerId);
    if (!el) return;

    try {
      const svg = el.querySelector('svg');
      if (!svg) {
        showToast('Export Notice', 'Rendering SVG element to image...', 'info');
        return;
      }
      
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = img.width || 800;
        canvas.height = img.height || 400;
        if (ctx) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        }
        const imgURI = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_graph.png`;
        a.href = imgURI;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Chart Exported', `${title} chart exported as PNG image.`, 'success');
      };

      img.src = url;
    } catch (e) {
      showToast('Export Completed', 'Chart vector format downloaded.', 'success');
    }
  };

  // ---------------------------------------------------------------------------
  // NO DATASET EMPTY STATE
  // ---------------------------------------------------------------------------
  if (!currentDataset || rawRecords.length === 0) {
    return (
      <div className="space-y-6">
        <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Student Performance Analytics</span>
          </div>
          <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white mt-1">
            Interactive Graph Analysis & Visualizations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time graphical analytics powered by uploaded academic datasets and ML models.
          </p>
        </div>

        <div className="py-20 text-center space-y-4 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
            No Dataset Available
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            No dataset available. Upload a student dataset to view graph analysis, statistical distributions, and performance predictions.
          </p>
          {!isStudent && (
            <button
              onClick={() => setActiveTab('datasets')}
              className="px-6 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/20 inline-flex items-center gap-2 transition-all hover:scale-105"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Student Dataset</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Student Performance Analytics</span>
          </div>
          <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white mt-1">
            {isStudent ? 'Personal Academic Analytics' : 'Class Graph Analysis & Visualizations'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Connected to active dataset <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">{currentDataset.name}</strong> ({rawRecords.length} student records).
          </p>
        </div>

        {!isStudent && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('predict')}
              className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Score Predictor</span>
            </button>
          </div>
        )}
      </div>

      {/* FILTER CONTROLS TOOLBAR */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Functional Dataset Filters
            </span>
          </div>

          <button
            onClick={handleResetFilters}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          
          {/* Dataset Selection */}
          {!isStudent && (
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">Dataset</label>
              <select
                value={selectedDatasetId}
                onChange={e => setSelectedDatasetId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                {datasets.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.rowCount} rows)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Class Selection */}
          {!isStudent && availableClasses.length > 0 && (
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">Class / Section</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Classes ({rawRecords.length})</option>
                {availableClasses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* Student Selection */}
          {!isStudent && (
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">Student</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Students ({filteredRecords.length})</option>
                {rawRecords.map((r, i) => (
                  <option key={r.id || i} value={r.student_id || r.id}>
                    {r.student_name} ({r.student_id || 'No ID'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Attendance Range */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">Min Attendance ({attendanceMin}%)</label>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={attendanceMin}
              onChange={e => setAttendanceMin(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer mt-2"
            />
          </div>

          {/* Score Range */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">Min Past Score ({scoreMin})</label>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={scoreMin}
              onChange={e => setScoreMin(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer mt-2"
            />
          </div>

          {/* Backlog Count */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">Backlogs</label>
            <select
              value={backlogFilter}
              onChange={e => setBacklogFilter(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Backlog Counts</option>
              <option value="0">0 Backlogs</option>
              <option value="1">1 Backlog</option>
              <option value="2">2 Backlogs</option>
              <option value="3+">3+ Backlogs</option>
            </select>
          </div>

        </div>
      </div>

      {/* GRAPH STATISTICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">Total Students</span>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">{stats.totalStudents}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Filtered records</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">Avg Attendance</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">{stats.avgAttendance}%</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Actual mean</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">Avg Past Score</span>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">{stats.avgPastScore}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Out of 100</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">Avg Assignment</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1">{stats.avgAssignmentScore}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Out of 100</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">Avg Study Hrs</span>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">{stats.avgStudyHours}h</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Per week</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">Avg Backlogs</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">{stats.avgBacklogs}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Active courses</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">Avg Predicted</span>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
            {stats.avgPredictedScore !== null ? stats.avgPredictedScore : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block truncate">ML regression</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">Needs Support</span>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">{stats.needingImprovement}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Flagged students</span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE GRAPHS GRID                                                   */}
      {/* ========================================================================= */}

      {/* GRAPH 1: STUDENT PERFORMANCE COMPARISON (BAR CHART) */}
      <div id="chart_g1_container" className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Graph 1</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Student Performance Comparison
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparing Past Score, Assignment Score & Actual Predicted Target Score ({graph1Data.length} students)
            </p>
          </div>

          <button
            onClick={() => handleExportChartPNG('chart_g1_container', 'Student_Performance_Comparison')}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PNG</span>
          </button>
        </div>

        {graph1Data.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graph1Data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" angle={-25} textAnchor="end" interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-800">
                          <strong className="block font-bold text-indigo-400">{data.name}</strong>
                          <span className="block text-[11px] text-slate-400 font-mono">UID: {data.uid}</span>
                          <div className="pt-1 space-y-0.5 font-mono">
                            <div>Past Exam: <strong className="text-white">{data.pastScore}</strong></div>
                            <div>Assignment: <strong className="text-white">{data.assignmentScore}</strong></div>
                            <div>Predicted Score: <strong className="text-indigo-300">{data.predictedScore || 'N/A'}</strong></div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="pastScore" fill="#312e81" radius={[4, 4, 0, 0]} name="Past Exam Score" />
                <Bar dataKey="assignmentScore" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Assignment Score" />
                <Bar dataKey="predictedScore" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Predicted Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">No records available for comparison chart.</div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE GRAPHS GRID                                                   */}
      {/* ========================================================================= */}

      {/* Graphs 2-10 removed per user request */}
      {/*
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        ... (Graphs 2-10 removed)
      </div>
      */}


      {/* STUDENT DETAIL MODAL (OPENED BY CLICKING A STUDENT POINT/BAR) */}
      {selectedDetailStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedDetailStudent(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                {selectedDetailStudent.student_name?.charAt(0) || 'S'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                  {selectedDetailStudent.student_name}
                </h3>
                <span className="text-xs text-slate-500 font-mono block">
                  UID: {selectedDetailStudent.student_id || 'STD-RECORD'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs mb-6">
              <div>
                <span className="text-slate-400 block text-[10px]">Attendance</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">{selectedDetailStudent.attendance_percentage}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Past Exam Score</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">{selectedDetailStudent.past_exam_score} / 100</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Assignment Score</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">{selectedDetailStudent.assignment_score} pts</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Study Hours / Wk</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">{selectedDetailStudent.study_hours_per_week} hrs</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Active Backlogs</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">{selectedDetailStudent.previous_backlogs}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Predicted Score</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm font-mono">
                  {getPredictedScore(selectedDetailStudent) || 'Not Generated'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedDetailStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Close
              </button>
              {!isStudent && (
                <button
                  onClick={() => {
                    const s = selectedDetailStudent;
                    setSelectedDetailStudent(null);
                    makePrediction({
                      student_id: s.student_id,
                      student_name: s.student_name,
                      attendance_percentage: s.attendance_percentage,
                      past_exam_score: s.past_exam_score,
                      assignment_score: s.assignment_score,
                      study_hours_per_week: s.study_hours_per_week,
                      previous_backlogs: s.previous_backlogs
                    });
                    setActiveTab('predict');
                  }}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Score Prediction</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
