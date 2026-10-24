import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  FileSpreadsheet, 
  Database, 
  CheckCircle2, 
  Search, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Trash2,
  RefreshCw,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Info,
  Check,
  X
} from 'lucide-react';
import { Dataset, StudentRecord } from '../types';

export const DatasetUpload: React.FC = () => {
  const { 
    datasets, 
    activeDataset, 
    setActiveDataset, 
    addDataset, 
    removeDataset, 
    replaceDataset, 
    clearAllData, 
    showToast 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState<Dataset | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [replacingDatasetId, setReplacingDatasetId] = useState<string | null>(null);

  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const rowsPerPage = 12;

  // Normalization helper for column header matching
  const cleanHeaderKey = (k: string) => String(k || '').toLowerCase().trim().replace(/[\s_\-().%/:#*]/g, '');

  const parseNumericValue = (val: any): number | undefined => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'number') {
      return isNaN(val) ? undefined : val;
    }
    const str = String(val).trim();
    if (str === '' || str.toLowerCase() === 'null' || str.toLowerCase() === 'nan' || str.toLowerCase() === 'n/a' || str === '-') {
      return undefined;
    }
    // Remove %, $, commas, spaces
    const cleanStr = str.replace(/[%$, ]/g, '');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? undefined : num;
  };

  const getMatchedValue = (normRow: Record<string, any>, aliases: string[]): any => {
    for (const alias of aliases) {
      const cleanAlias = cleanHeaderKey(alias);
      if (normRow[cleanAlias] !== undefined && normRow[cleanAlias] !== null && String(normRow[cleanAlias]).trim() !== '') {
        return normRow[cleanAlias];
      }
    }
    return undefined;
  };

  // Real File Upload Handler (CSV / XLSX / XLS)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isReplaceTargetId?: string | null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase();

    const onParseComplete = (rows: any[], format: 'CSV' | 'XLSX' | 'XLS') => {
      processRawData(rows, fileName, format, isReplaceTargetId);
      // Reset input element
      e.target.value = '';
    };

    if (fileExt === 'csv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header: string) => header.trim(),
        complete: (results) => {
          onParseComplete(results.data as any[], 'CSV');
        },
        error: (err) => {
          showToast('CSV Parsing Error', err.message, 'error');
          setIsProcessing(false);
          e.target.value = '';
        }
      });
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsName = wb.SheetNames[0];
          const ws = wb.Sheets[wsName];
          const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
          onParseComplete(data as any[], fileExt.toUpperCase() as any);
        } catch (err: any) {
          showToast('Excel Parsing Error', err.message || 'Failed to read excel file', 'error');
          setIsProcessing(false);
          e.target.value = '';
        }
      };
      reader.readAsBinaryString(file);
    } else {
      showToast('Unsupported Format', 'Please upload a CSV or Excel (.xlsx, .xls) file.', 'error');
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const processRawData = (rows: any[], fileName: string, format: 'CSV' | 'XLSX' | 'XLS', replaceId?: string | null) => {
    if (!rows || rows.length === 0) {
      showToast('Empty File', 'The uploaded file contains no data rows.', 'error');
      setIsProcessing(false);
      return;
    }

    const columns = Object.keys(rows[0] || {});

    // Alias definitions for robust matching
    const attendanceAliases = [
      'attendance_percentage', 'attendancepercentage', 'attendance', 'attendancerate',
      'attendancepercent', 'attendancepct', 'att', 'presence', 'present', 'presentpercent',
      'presentpercentage', 'classattendance', 'studentattendance', 'overallattendance',
      'attandance', 'attend', 'attendence'
    ];
    const studentIdAliases = [
      'student_id', 'studentid', 'studentuid', 'uid', 'rollno', 'rollnumber', 'roll',
      'regno', 'registrationno', 'registrationnumber', 'enrollmentno', 'enrollmentnumber',
      'id', 'stdid', 'hallticketno'
    ];
    const studentNameAliases = [
      'student_name', 'studentname', 'name', 'fullname', 'studentfullname', 'candidatename',
      'student', 'candidate', 'firstandlastname'
    ];
    const pastExamAliases = [
      'past_exam_score', 'pastexamscore', 'pastscore', 'pastexam', 'previousexamscore',
      'previousexam', 'previousscore', 'internalmarks', 'internalscore', 'midtermscore',
      'midterm', 'pastmarks', 'previousmarks', 'examscore', 'marks', 'score', 'internal',
      'midtermexam'
    ];
    const assignmentAliases = [
      'assignment_score', 'assignmentscore', 'assignment', 'assignments', 'assignmentmarks',
      'internalassignment', 'practicalscore', 'practical', 'cw', 'coursework', 'assignscore',
      'labmarks', 'labscore', 'assignmentpercent'
    ];
    const studyHoursAliases = [
      'study_hours_per_week', 'studyhoursperweek', 'studyhours', 'studytime', 'weeklystudyhours',
      'studyhrs', 'hoursofstudy', 'hours', 'weeklyhours', 'selfstudyhours', 'studyhour'
    ];
    const sleepHoursAliases = [
      'sleep_hours', 'sleephours', 'sleep', 'sleeptime', 'dailyrest', 'sleephrs', 'resthours'
    ];
    const backlogAliases = [
      'previous_backlogs', 'previousbacklogs', 'backlogs', 'backlog', 'arrears',
      'failedsubjects', 'failures', 'historyofarrears', 'kt', 'kts', 'reappears'
    ];
    const finalExamAliases = [
      'final_exam_score', 'finalexamscore', 'finalscore', 'targetscore', 'actualscore',
      'actualtargetscore', 'target', 'finalexam', 'semesterexam', 'boardscore', 'final',
      'actual', 'examtarget', 'finalgrade', 'grade'
    ];
    const parentEdAliases = [
      'parent_education_level', 'parenteducationlevel', 'parenteducation', 'parentaleducation',
      'parentlevel', 'parentsedu', 'familyeducation'
    ];
    const extracurricularAliases = [
      'extracurricular_activities', 'extracurricularactivities', 'extracurricular',
      'activities', 'sports', 'club', 'cocurricular'
    ];
    const internetAliases = [
      'internet_access_at_home', 'internetaccessathome', 'internetaccess', 'internet',
      'wifi', 'homeinternet'
    ];

    const parsedStudents: StudentRecord[] = rows.map((r, idx) => {
      // Build normalized key lookup for this row
      const normRow: Record<string, any> = {};
      Object.keys(r).forEach(k => {
        normRow[cleanHeaderKey(k)] = r[k];
      });

      // Extract Student ID
      const rawId = getMatchedValue(normRow, studentIdAliases);
      const studentId = rawId !== undefined ? String(rawId).trim() : `STD-${idx + 1}`;

      // Extract Student Name
      const rawName = getMatchedValue(normRow, studentNameAliases);
      const studentName = rawName !== undefined ? String(rawName).trim() : `Student ${idx + 1}`;

      // Extract Attendance Percentage - handles 85%, 85, 0.85, 92.5
      const rawAttendance = getMatchedValue(normRow, attendanceAliases);
      let attendance = parseNumericValue(rawAttendance);
      if (attendance !== undefined) {
        if (attendance > 0 && attendance <= 1.0) {
          attendance = Math.round(attendance * 100 * 10) / 10;
        }
      } else {
        attendance = 0;
      }

      // Extract Past Exam Score
      const rawPast = getMatchedValue(normRow, pastExamAliases);
      const pastExam = parseNumericValue(rawPast) ?? 0;

      // Extract Assignment Score
      const rawAssign = getMatchedValue(normRow, assignmentAliases);
      const assignment = parseNumericValue(rawAssign) ?? 0;

      // Extract Weekly Study Hours
      const rawStudy = getMatchedValue(normRow, studyHoursAliases);
      const studyHours = parseNumericValue(rawStudy) ?? 0;

      // Extract Sleep Hours
      const rawSleep = getMatchedValue(normRow, sleepHoursAliases);
      const sleepHours = parseNumericValue(rawSleep) ?? 7;

      // Extract Previous Backlogs
      const rawBacklogs = getMatchedValue(normRow, backlogAliases);
      const backlogs = parseNumericValue(rawBacklogs) ?? 0;

      // Extract Final / Target Exam Score (if present in dataset)
      const rawFinal = getMatchedValue(normRow, finalExamAliases);
      const finalExam = parseNumericValue(rawFinal);

      // Categorical fields
      const rawParentEd = getMatchedValue(normRow, parentEdAliases);
      let parentEd: 'High School' | 'Bachelor' | 'Master' | 'Doctorate' = 'Bachelor';
      if (rawParentEd) {
        const pedLower = String(rawParentEd).toLowerCase();
        if (pedLower.includes('doctor') || pedLower.includes('phd')) parentEd = 'Doctorate';
        else if (pedLower.includes('master') || pedLower.includes('post') || pedLower.includes('mtech') || pedLower.includes('mba') || pedLower.includes('msc')) parentEd = 'Master';
        else if (pedLower.includes('high') || pedLower.includes('school') || pedLower.includes('12') || pedLower.includes('secondary')) parentEd = 'High School';
        else parentEd = 'Bachelor';
      }

      const rawExtracurricular = getMatchedValue(normRow, extracurricularAliases);
      const extracurricular: 'Yes' | 'No' = rawExtracurricular && String(rawExtracurricular).trim().toLowerCase().startsWith('y') ? 'Yes' : 'No';

      const rawInternet = getMatchedValue(normRow, internetAliases);
      const internet: 'Yes' | 'No' = rawInternet && String(rawInternet).trim().toLowerCase().startsWith('n') ? 'No' : 'Yes';

      // Keep original row fields dynamically accessible
      const recordObj: StudentRecord = {
        ...r,
        id: `up_${idx + 1}`,
        student_id: studentId,
        student_name: studentName,
        attendance_percentage: Number(attendance),
        past_exam_score: Number(pastExam),
        assignment_score: Number(assignment),
        study_hours_per_week: Number(studyHours),
        sleep_hours: Number(sleepHours),
        parent_education_level: parentEd,
        extracurricular_activities: extracurricular,
        internet_access_at_home: internet,
        previous_backlogs: Number(backlogs),
        final_exam_score: finalExam !== undefined ? Number(finalExam) : undefined
      };

      return recordObj;
    });

    const newDataset: Dataset = {
      id: replaceId || `ds_${Date.now()}`,
      name: fileName,
      uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      uploadedBy: 'Authenticated User',
      fileFormat: format,
      rowCount: parsedStudents.length,
      columnCount: columns.length,
      columns,
      data: parsedStudents,
      isCleaned: false,
      status: 'Raw'
    };

    if (replaceId) {
      replaceDataset(replaceId, newDataset);
      setReplacingDatasetId(null);
    } else {
      addDataset(newDataset);
    }

    // Call backend validation asynchronously to log profiling
    fetch('/api/dataset/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows, fileName })
    }).catch(() => {
      // Offline or client-side mode
    });

    setIsProcessing(false);
  };

  // Filtering & Pagination for current preview
  const currentData = activeDataset ? (activeDataset.cleanedData || activeDataset.data) : [];
  const filteredRows = currentData.filter(r => 
    (r.student_name && String(r.student_name).toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.student_id && String(r.student_id).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Validation metrics for active dataset
  const datasetValidation = React.useMemo(() => {
    if (!activeDataset || currentData.length === 0) return null;
    
    const count = currentData.length;
    const isInsufficientRows = count < 5;
    
    // Check if attendance is present and non-zero
    const nonzeroAttendance = currentData.filter(r => (r.attendance_percentage || 0) > 0).length;
    const allAttendanceZero = nonzeroAttendance === 0;

    // Check if past score is non-zero
    const nonzeroPast = currentData.filter(r => (r.past_exam_score || 0) > 0).length;
    const allPastZero = nonzeroPast === 0;

    // Check if target score exists
    const hasTargetColumn = currentData.some(r => typeof r.final_exam_score === 'number' && !isNaN(r.final_exam_score));

    // Calculate detected numeric columns
    const numericCols = Object.keys(currentData[0] || {}).filter(k => {
      if (['id', 'student_id', 'student_name', 'parent_education_level', 'extracurricular_activities', 'internet_access_at_home'].includes(k)) {
        return false;
      }
      return currentData.some(r => typeof r[k] === 'number' && !isNaN(r[k]));
    });

    const issues: string[] = [];
    const warnings: string[] = [];

    if (isInsufficientRows) {
      warnings.push(`Dataset contains only ${count} record(s). Minimum 5 records recommended for machine learning regression.`);
    }

    if (allAttendanceZero) {
      issues.push("Attendance was parsed as 0% for all records. Ensure your file contains an 'Attendance %', 'attendance', or 'presence' column with numbers (e.g. 85 or 0.85).");
    }

    if (allPastZero) {
      warnings.push("Past Exam Scores are 0 for all records. Ensure your file includes 'Past Exam Score', 'Marks', or 'Score' for accurate correlation.");
    }

    return {
      count,
      isInsufficientRows,
      allAttendanceZero,
      allPastZero,
      hasTargetColumn,
      numericCols,
      issues,
      warnings,
      isValid: issues.length === 0
    };
  }, [activeDataset, currentData]);

  const handleDownloadSampleTemplate = () => {
    const csvContent = "student_id,student_name,attendance_percentage,past_exam_score,assignment_score,study_hours_per_week,sleep_hours,parent_education_level,extracurricular_activities,internet_access_at_home,previous_backlogs,final_exam_score\n" +
      "STD-101,Aarav Sharma,88,78,82,14,7,Bachelor,Yes,Yes,0,84\n" +
      "STD-102,Priya Patel,92,85,90,18,8,Master,Yes,Yes,0,89\n" +
      "STD-103,Rohan Verma,65,58,60,8,6,High School,No,Yes,2,62\n" +
      "STD-104,Sneha Kulkarni,78,72,75,12,7,Bachelor,No,Yes,0,76\n" +
      "STD-105,Vikram Singh,82,80,84,15,7,Master,Yes,Yes,0,83\n" +
      "STD-106,Ananya Roy,95,91,94,20,8,Doctorate,Yes,Yes,0,93\n" +
      "STD-107,Mohit Gupta,54,48,52,6,6,High School,No,No,3,50\n" +
      "STD-108,Divya Nair,71,68,70,10,7,Bachelor,Yes,Yes,1,72";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'ansar_academic_dataset_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Template Downloaded', 'Sample CSV template downloaded with standard column headers.', 'info');
  };

  const triggerReplaceUpload = (datasetId: string) => {
    setReplacingDatasetId(datasetId);
    replaceFileInputRef.current?.click();
  };

  return (
    <div className="space-y-8">
      
      {/* Hidden File Input for Replace Operation */}
      <input
        ref={replaceFileInputRef}
        type="file"
        accept=".csv, .xlsx, .xls"
        className="hidden"
        onChange={(e) => handleFileUpload(e, replacingDatasetId)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white">Dataset Management & Upload</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload, preview, replace, and manage real CSV or Excel datasets. 100% data-driven analysis.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {datasets.length > 0 && (
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-semibold text-xs transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Datasets</span>
            </button>
          )}

          <button
            onClick={handleDownloadSampleTemplate}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all shadow-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Download CSV Template</span>
          </button>
        </div>
      </div>

      {/* FILE UPLOAD DROPZONE */}
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 text-center hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors relative group">
        <input
          ref={mainFileInputRef}
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={(e) => handleFileUpload(e, null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="max-w-md mx-auto space-y-3 pointer-events-none">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isProcessing ? 'Processing & Validating Dataset...' : 'Click or drag your dataset file here'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Supports CSV, XLSX, and XLS format files</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-slate-400 pt-2 flex-wrap">
            <span>Automatic header detection:</span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">Attendance / Attendance % / att</span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">Past Exam Score / Marks</span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">Assignment Score</span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">Final / Target Score</span>
          </div>
        </div>
      </div>

      {/* VALIDATION STATUS & QUALITY INSPECTOR */}
      {datasetValidation && (
        <div className={`p-5 rounded-2xl border ${
          datasetValidation.issues.length > 0 
            ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60' 
            : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50'
        } space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {datasetValidation.issues.length > 0 ? (
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              )}
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-heading">
                Dataset Integrity & Feature Validation ({activeDataset?.name})
              </h4>
            </div>

            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              {datasetValidation.count} Rows · {datasetValidation.numericCols.length} Numeric Features
            </span>
          </div>

          {/* Validation issues / errors */}
          {datasetValidation.issues.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {datasetValidation.issues.map((issue, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  <span className="font-bold">•</span>
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {datasetValidation.warnings.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {datasetValidation.warnings.map((warn, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300 font-medium">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          )}

          {/* Features badge bar */}
          <div className="flex items-center gap-2 pt-2 flex-wrap text-[11px]">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Available Numeric Features for ML:</span>
            {datasetValidation.numericCols.map((col, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[10px]">
                {col}
              </span>
            ))}
            {datasetValidation.hasTargetColumn ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold text-[10px] flex items-center gap-1">
                <Check className="w-3 h-3" /> Target Score Included
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-[10px]">
                No target column in raw file (ML can use past exam score or custom target)
              </span>
            )}
          </div>
        </div>
      )}

      {/* REPOSITORY DATASETS LIST */}
      {datasets.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Uploaded Datasets Repository ({datasets.length})
            </h3>
            <span className="text-[11px] text-slate-400">Click a card to set as active, or use Replace / Remove</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasets.map(ds => {
              const isSelected = activeDataset && activeDataset.id === ds.id;
              return (
                <div
                  key={ds.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div 
                      onClick={() => { setActiveDataset(ds); setCurrentPage(1); }}
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                    >
                      <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{ds.name}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{ds.rowCount} rows · {ds.fileFormat} · {ds.uploadDate}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-600 text-white shrink-0">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Actions Row: Preview, Replace, Remove */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => { setActiveDataset(ds); setCurrentPage(1); }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1 transition-colors"
                      title="Inspect records in preview table"
                    >
                      <Eye className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      <span>Preview</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => triggerReplaceUpload(ds.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 rounded-lg flex items-center gap-1 transition-colors"
                        title="Upload a new file to replace this dataset"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Replace</span>
                      </button>

                      <button
                        onClick={() => setDatasetToDelete(ds)}
                        className="px-2 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg flex items-center gap-1 transition-colors"
                        title="Permanently remove this dataset and purge associated models"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DATASET PREVIEW TABLE OR EMPTY STATE */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        
        {activeDataset ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Dataset Records Inspection</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Previewing uploaded data from <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">{activeDataset.name}</strong> ({activeDataset.rowCount} total records)
                </p>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student ID or name..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                    <th className="p-3">Assignment</th>
                    <th className="p-3">Study Hrs/Wk</th>
                    <th className="p-3">Backlogs</th>
                    <th className="p-3 text-right">Target Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{r.student_id}</td>
                        <td className="p-3 font-sans font-medium text-slate-900 dark:text-slate-100">{r.student_name}</td>
                        <td className="p-3">
                          <span className={`font-bold ${r.attendance_percentage < 75 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {r.attendance_percentage}%
                          </span>
                        </td>
                        <td className="p-3">{r.past_exam_score}</td>
                        <td className="p-3">{r.assignment_score}</td>
                        <td className="p-3">{r.study_hours_per_week} hrs</td>
                        <td className="p-3">
                          <span className={r.previous_backlogs > 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-400'}>
                            {r.previous_backlogs}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {r.final_exam_score !== undefined ? `${r.final_exam_score}` : 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-sans">
                        No matching records found in uploaded dataset.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <span>Showing Page {currentPage} of {totalPages} ({filteredRows.length} filtered records)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-500 flex items-center justify-center mx-auto shadow-inner">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">No Datasets Uploaded Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Drop your school or class CSV/Excel file into the upload zone above to load real student records, enable predictions, and generate graphs.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* CONFIRM PERMANENT REMOVE DATASET MODAL */}
      {datasetToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Permanently Remove Dataset?
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-slate-900 dark:text-white">{datasetToDelete.name}</strong> ({datasetToDelete.rowCount} records)?
            </p>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300">
              This action will permanently delete all trained machine learning models, predictions, cached results, and chart analytics associated with this dataset.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDatasetToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeDataset(datasetToDelete.id);
                  setDatasetToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM CLEAR ALL MODAL */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Clear All Datasets & Records?
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This will permanently wipe all uploaded datasets ({datasets.length}), all trained machine learning models, all student predictions, and reset the platform to a pristine empty state.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsClearAllModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllData();
                  setIsClearAllModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Wipe All Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
