/**
 * Ansar Student Performance AI - Core Application Types
 */

export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  studentId?: string;
  teacherId?: string;
  assignedClass?: string;
  assignedSection?: string;
  active: boolean;
  createdAt: string;
}

export interface StudentRecord {
  id: string;
  student_id: string;
  student_name: string;
  attendance_percentage: number;
  past_exam_score: number;
  assignment_score: number;
  study_hours_per_week: number;
  sleep_hours: number;
  parent_education_level: 'High School' | 'Bachelor' | 'Master' | 'Doctorate';
  extracurricular_activities: 'Yes' | 'No';
  internet_access_at_home: 'Yes' | 'No';
  previous_backlogs: number;
  final_exam_score?: number; // Target column
  [key: string]: any;
}

export interface Dataset {
  id: string;
  name: string;
  uploadDate: string;
  uploadedBy: string;
  fileFormat: 'CSV' | 'XLSX' | 'XLS';
  rowCount: number;
  columnCount: number;
  columns: string[];
  data: StudentRecord[];
  cleanedData?: StudentRecord[];
  isCleaned: boolean;
  cleaningLog?: string[];
  status: 'Raw' | 'Cleaned' | 'Active';
}

export interface PreprocessingConfig {
  imputeMethod: 'mean' | 'median' | 'mode';
  removeDuplicates: boolean;
  normalizeNumerical: boolean;
  categoricalEncoding: 'onehot' | 'label';
  selectedFeatures: string[];
  targetColumn: string;
}

export type MLAlgorithm = 'linear_regression' | 'decision_tree' | 'random_forest' | 'gradient_boosting';

export interface ModelMetrics {
  r2Score: number;       // Coefficient of determination (0 to 1)
  mae: number;           // Mean Absolute Error
  mse: number;           // Mean Squared Error
  rmse: number;          // Root Mean Squared Error
  accuracyPercentage: number; // Scaled percentage accuracy for UI display
}

export interface FeatureImportance {
  feature: string;
  importance: number; // 0 to 1
}

export interface TrainedModel {
  id: string;
  name: string;
  version: string;
  algorithm: MLAlgorithm;
  algorithmLabel: string;
  datasetId: string;
  datasetName: string;
  targetColumn: string;
  features: string[];
  metrics: ModelMetrics;
  featureImportance: FeatureImportance[];
  trainingDate: string;
  active: boolean;
  trainedBy: string;
  hyperparams: Record<string, any>;
  // Internal model serialized state
  modelWeights?: any;
}

export interface PredictionInput {
  student_id?: string;
  student_name?: string;
  attendance_percentage: number;
  past_exam_score: number;
  assignment_score: number;
  study_hours_per_week: number;
  sleep_hours?: number;
  parent_education_level?: string;
  extracurricular_activities?: string;
  internet_access_at_home?: string;
  previous_backlogs?: number;
  [key: string]: any;
}

export type PerformanceCategory = 'Outstanding' | 'Good' | 'Average' | 'Needs Support' | 'Critical Risk';

export interface PredictionResult {
  id: string;
  studentId: string;
  studentName: string;
  predictedScore: number;
  maxScore: number;
  performanceCategory: PerformanceCategory;
  categoryColor: string;
  modelId: string;
  modelName: string;
  modelVersion: string;
  predictionDate: string;
  inputs: PredictionInput;
  recommendations: string[];
  aiAnalysis?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  description: string;
  timestamp: string;
}
