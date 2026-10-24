/**
 * Ansar Student Performance AI - Global Application State Context
 * Roles: Teacher & Student
 * Full Theme Persistence & Real-Data Operations
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Dataset,
  TrainedModel,
  PredictionResult,
  ActivityLog,
  PreprocessingConfig,
  MLAlgorithm,
  PredictionInput
} from '../types';
import { INITIAL_USERS } from '../data/sampleDataset';
import {
  cleanAndPreprocessData,
  trainMachineLearningModel,
  predictStudentScore
} from '../services/mlEngine';
import { useTheme } from './ThemeContext';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Authentication & Users
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isAuthenticated: boolean;
  logoutUser: () => void;
  users: User[];
  addUser: (user: User) => void;
  toggleUserStatus: (id: string) => void;
  switchRole: (role: 'teacher' | 'student') => void;

  // Datasets
  datasets: Dataset[];
  activeDataset: Dataset | null;
  setActiveDataset: (dataset: Dataset | null) => void;
  addDataset: (dataset: Dataset) => void;
  removeDataset: (datasetId: string) => void;
  replaceDataset: (datasetId: string, newDataset: Dataset) => void;
  clearAllData: () => void;
  cleanDataset: (datasetId: string, config: PreprocessingConfig) => void;

  // Models
  models: TrainedModel[];
  activeModel: TrainedModel | null;
  setActiveModel: (model: TrainedModel | null) => void;
  trainModel: (
    features: string[],
    targetColumn: string,
    algorithm: MLAlgorithm,
    modelName: string
  ) => TrainedModel | null;

  // Predictions
  predictions: PredictionResult[];
  latestPrediction: PredictionResult | null;
  makePrediction: (input: PredictionInput) => PredictionResult | null;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;

  // Logs & Toasts
  activityLogs: ActivityLog[];
  toasts: Toast[];
  showToast: (title: string, message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();

  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Auth & Users (Teacher & Student)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('ansar_ai_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  useEffect(() => {
    localStorage.setItem('ansar_ai_users', JSON.stringify(users));
  }, [users]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('ansar_ai_current_user');
  });

  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const saved = localStorage.getItem('ansar_ai_current_user');
    return saved ? JSON.parse(saved) : (users[0] || INITIAL_USERS[0]);
  });

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    setIsAuthenticated(true);
    localStorage.setItem('ansar_ai_current_user', JSON.stringify(user));
    setActiveTab('dashboard');
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ansar_ai_current_user');
    setActiveTab('login');
    showToast('Logged Out', 'Successfully signed out of the system.', 'info');
  };

  const switchRole = (role: 'teacher' | 'student') => {
    let target = users.find(u => u.role === role);
    if (!target) {
      target = {
        id: `u_${role}_${Date.now()}`,
        username: role,
        email: `${role}@ansarai.edu`,
        fullName: role === 'teacher' ? 'Faculty Teacher' : 'Student Candidate',
        role,
        studentId: role === 'student' ? 'STD2024-001' : undefined,
        active: true,
        createdAt: new Date().toISOString().substring(0, 10)
      };
      setUsers(prev => [...prev, target!]);
    }
    setCurrentUser(target);
    setActiveTab('dashboard');
    showToast('Role Switched', `Switched to ${role.toUpperCase()} view.`, 'info');
  };

  const addUser = (newUser: User) => {
    setUsers(prev => [newUser, ...prev]);
    showToast('User Created', `User ${newUser.fullName} (${newUser.role}) registered.`, 'success');
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
    showToast('Status Updated', 'User account status toggled.', 'info');
  };

  // Datasets State
  const [datasets, setDatasets] = useState<Dataset[]>(() => {
    const saved = localStorage.getItem('ansar_ai_datasets');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeDataset, setActiveDataset] = useState<Dataset | null>(() => {
    const saved = localStorage.getItem('ansar_ai_datasets');
    if (saved) {
      const parsed: Dataset[] = JSON.parse(saved);
      return parsed[0] || null;
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('ansar_ai_datasets', JSON.stringify(datasets));
  }, [datasets]);

  const addDataset = (newDataset: Dataset) => {
    setDatasets(prev => [newDataset, ...prev]);
    setActiveDataset(newDataset);
    showToast('Dataset Uploaded', `${newDataset.name} (${newDataset.rowCount} records) imported.`, 'success');
  };

  const removeDataset = (datasetId: string) => {
    const target = datasets.find(d => d.id === datasetId);
    const updatedDatasets = datasets.filter(d => d.id !== datasetId);
    setDatasets(updatedDatasets);

    // If active dataset is being removed, switch to another or null
    if (activeDataset?.id === datasetId) {
      setActiveDataset(updatedDatasets[0] || null);
    }

    // Purge associated models trained on this dataset
    const updatedModels = models.filter(m => m.datasetId !== datasetId);
    setModels(updatedModels);
    if (activeModel?.datasetId === datasetId) {
      setActiveModel(updatedModels[0] || null);
    }

    // If all datasets removed, clear models, predictions and storage
    if (updatedDatasets.length === 0) {
      setModels([]);
      setActiveModel(null);
      setPredictions([]);
      setLatestPrediction(null);
      localStorage.removeItem('ansar_ai_datasets');
      localStorage.removeItem('ansar_ai_models');
      localStorage.removeItem('ansar_ai_predictions');
    }

    showToast(
      'Dataset Removed',
      `Dataset ${target?.name || ''} and its associated models, predictions, and cached analyses were permanently removed.`,
      'info'
    );
  };

  const replaceDataset = (datasetId: string, newDataset: Dataset) => {
    const updatedDatasets = datasets.map(d => (d.id === datasetId ? newDataset : d));
    setDatasets(updatedDatasets);
    setActiveDataset(newDataset);

    // Reset models and predictions associated with previous dataset version
    const updatedModels = models.filter(m => m.datasetId !== datasetId);
    setModels(updatedModels);
    if (activeModel?.datasetId === datasetId) {
      setActiveModel(updatedModels[0] || null);
    }

    showToast(
      'Dataset Replaced',
      `Dataset replaced with ${newDataset.name} (${newDataset.rowCount} records). Stale predictions and models reset.`,
      'success'
    );
  };

  const clearAllData = () => {
    setDatasets([]);
    setActiveDataset(null);
    setModels([]);
    setActiveModel(null);
    setPredictions([]);
    setLatestPrediction(null);
    localStorage.removeItem('ansar_ai_datasets');
    localStorage.removeItem('ansar_ai_models');
    localStorage.removeItem('ansar_ai_predictions');
    showToast('All Data Cleared', 'All datasets, models, predictions, and cached analytics permanently purged.', 'info');
  };

  const cleanDataset = (datasetId: string, config: PreprocessingConfig) => {
    const ds = datasets.find(d => d.id === datasetId);
    if (!ds) return;

    const result = cleanAndPreprocessData(ds.data, config);
    const updated: Dataset = {
      ...ds,
      cleanedData: result.cleanedData,
      isCleaned: true,
      status: 'Cleaned',
      cleaningLog: result.log
    };

    setDatasets(prev => prev.map(d => d.id === datasetId ? updated : d));
    setActiveDataset(updated);
    showToast('Data Preprocessed', `Dataset cleaned (${result.duplicatesRemoved} duplicates removed).`, 'success');
  };

  // ML Models State
  const [models, setModels] = useState<TrainedModel[]>(() => {
    const saved = localStorage.getItem('ansar_ai_models');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeModel, setActiveModel] = useState<TrainedModel | null>(() => {
    const saved = localStorage.getItem('ansar_ai_models');
    if (saved) {
      const parsed: TrainedModel[] = JSON.parse(saved);
      return parsed.find(m => m.active) || parsed[0] || null;
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('ansar_ai_models', JSON.stringify(models));
  }, [models]);

  const trainModel = (
    features: string[],
    targetColumn: string,
    algorithm: MLAlgorithm,
    modelName: string
  ): TrainedModel | null => {
    if (!activeDataset || (!activeDataset.cleanedData && !activeDataset.data)) {
      showToast('Error', 'No dataset available to train model.', 'error');
      return null;
    }

    const result = trainMachineLearningModel(
      activeDataset.cleanedData || activeDataset.data,
      features,
      targetColumn,
      algorithm,
      modelName,
      currentUser.fullName,
      activeDataset.id,
      activeDataset.name
    );

    const updatedModels = models.map(m => ({ ...m, active: false }));
    const newModel = result.model;

    setModels([newModel, ...updatedModels]);
    setActiveModel(newModel);

    showToast('Model Trained', `${newModel.name} trained with R² Score: ${newModel.metrics.r2Score.toFixed(4)}`, 'success');
    return newModel;
  };

  // Predictions State
  const [predictions, setPredictions] = useState<PredictionResult[]>(() => {
    const saved = localStorage.getItem('ansar_ai_predictions');
    return saved ? JSON.parse(saved) : [];
  });

  const [latestPrediction, setLatestPrediction] = useState<PredictionResult | null>(() => {
    const saved = localStorage.getItem('ansar_ai_predictions');
    if (saved) {
      const parsed: PredictionResult[] = JSON.parse(saved);
      return parsed[0] || null;
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('ansar_ai_predictions', JSON.stringify(predictions));
  }, [predictions]);

  const makePrediction = (input: PredictionInput): PredictionResult | null => {
    if (!activeModel) {
      showToast('No Active Model', 'A model must be trained in the ML Workbench before making predictions.', 'warning');
      return null;
    }

    const result = predictStudentScore(input, activeModel);
    setPredictions(prev => [result, ...prev]);
    setLatestPrediction(result);
    showToast('Prediction Complete', `Predicted Score: ${result.predictedScore}/100 (${result.performanceCategory})`, 'success');
    return result;
  };

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem('ansar_ai_current_user');
    return saved ? 'dashboard' : 'landing';
  });

  // Activity Logs
  const [activityLogs] = useState<ActivityLog[]>([
    {
      id: 'log_init',
      userId: currentUser?.id || 'system',
      userName: currentUser?.fullName || 'System',
      userRole: currentUser?.role || 'teacher',
      action: 'System Ready',
      description: 'Ansar Student Performance AI system initialized.',
      timestamp: new Date().toISOString().substring(0, 16).replace('T', ' ')
    }
  ]);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (title: string, message: string, type: Toast['type'] = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentUser,
        setCurrentUser,
        isAuthenticated,
        logoutUser,
        users,
        addUser,
        toggleUserStatus,
        switchRole,
        datasets,
        activeDataset,
        setActiveDataset,
        addDataset,
        removeDataset,
        replaceDataset,
        clearAllData,
        cleanDataset,
        models,
        activeModel,
        setActiveModel,
        trainModel,
        predictions,
        latestPrediction,
        makePrediction,
        activeTab,
        setActiveTab,
        globalSearchQuery,
        setGlobalSearchQuery,
        activityLogs,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
