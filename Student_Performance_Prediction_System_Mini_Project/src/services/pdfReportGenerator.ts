/**
 * Ansar Student Performance AI - PDF Report Generator
 * Generates official PDF reports with ReportLab style styling, custom branding,
 * prediction metrics, model information, and academic recommendations.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PredictionResult, TrainedModel, Dataset } from '../types';

export function generateStudentPredictionPDF(prediction: PredictionResult): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = '#1E3A8A'; // Indigo navy
  const secondaryColor = '#2563EB'; // Electric blue
  const darkTextColor = '#0F172A';
  const lightTextColor = '#475569';

  // Header Banner
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 28, 'F');

  // Title Branding
  doc.setTextColor('#FFFFFF');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ANSAR STUDENT PERFORMANCE AI', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Official Machine Learning Academic Performance Prediction Report', 14, 20);

  // Date and Reference ID
  doc.setFontSize(8);
  doc.text(`Report Ref: ${prediction.id}`, 150, 13);
  doc.text(`Date: ${prediction.predictionDate}`, 150, 18);

  // Student Profile Card
  doc.setLineWidth(0.3);
  doc.setDrawColor('#E2E8F0');
  doc.setFillColor('#F8FAFC');
  doc.roundedRect(14, 34, 182, 28, 2, 2, 'FD');

  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('STUDENT PROFILE', 18, 42);

  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Student Name: ${prediction.studentName}`, 18, 49);
  doc.text(`Student ID: ${prediction.studentId}`, 18, 55);

  doc.text(`Course: BCA 5th Semester`, 110, 49);
  doc.text(`Department: Computer Applications`, 110, 55);

  // Prediction Result Box
  doc.setFillColor('#EFF6FF');
  doc.setDrawColor('#BFDBFE');
  doc.roundedRect(14, 68, 182, 38, 2, 2, 'FD');

  doc.setTextColor(secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ESTIMATED EXAMINATION PERFORMANCE', 18, 76);

  // Big Predicted Score Display
  doc.setFontSize(28);
  doc.setTextColor(primaryColor);
  doc.text(`${prediction.predictedScore.toFixed(1)} / 100`, 18, 92);

  // Category Badge
  doc.setFillColor(prediction.categoryColor);
  doc.roundedRect(110, 80, 76, 12, 1, 1, 'F');
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Category: ${prediction.performanceCategory}`, 115, 88);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(lightTextColor);
  doc.text('* Note: Estimated score derived from historical machine learning regression models.', 18, 101);

  // Input Parameters Table
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ACADEMIC INPUT ATTRIBUTES', 14, 114);

  const tableData = [
    ['Attendance Rate (%)', `${prediction.inputs.attendance_percentage}%`, 'Past Exam Score', `${prediction.inputs.past_exam_score}/100`],
    ['Assignment Score', `${prediction.inputs.assignment_score}/100`, 'Weekly Study Hours', `${prediction.inputs.study_hours_per_week} hrs/wk`],
    ['Sleep Hours', `${prediction.inputs.sleep_hours || 7} hrs/day`, 'Active Backlogs', `${prediction.inputs.previous_backlogs || 0}`],
    ['Parent Education', `${prediction.inputs.parent_education_level || 'Bachelor'}`, 'Extracurriculars', `${prediction.inputs.extracurricular_activities || 'No'}`]
  ];

  autoTable(doc, {
    startY: 118,
    head: [['Attribute', 'Value', 'Attribute', 'Value']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: '#FFFFFF', fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 2.5 },
    margin: { left: 14, right: 14 }
  });

  // Model Information Section
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 170;

  doc.setFillColor('#F1F5F9');
  doc.setDrawColor('#CBD5E1');
  doc.roundedRect(14, finalY, 182, 22, 2, 2, 'FD');

  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('MACHINE LEARNING MODEL SPECIFICATIONS', 18, finalY + 7);

  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Active Model: ${prediction.modelName} (v${prediction.modelVersion})`, 18, finalY + 14);
  doc.text(`Training Dataset: BCA_Batch_2024_Academic_Dataset.csv`, 18, finalY + 19);

  // Academic Recommendations Section
  const recY = finalY + 28;
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ACTIONABLE ACADEMIC RECOMMENDATIONS', 14, recY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(darkTextColor);

  let currentLineY = recY + 6;
  prediction.recommendations.forEach((rec, idx) => {
    doc.text(`${idx + 1}. ${rec}`, 18, currentLineY);
    currentLineY += 6;
  });

  // Disclaimer & Footer
  doc.setFillColor(primaryColor);
  doc.rect(0, 282, 210, 15, 'F');

  doc.setTextColor('#FFFFFF');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Ansar Student Performance AI - Developed by Ansar for Educational Mini Project Analytics', 14, 290);
  doc.text('Page 1 of 1', 180, 290);

  // Trigger Download
  doc.save(`Ansar_AI_Report_${prediction.studentId}_${prediction.predictionDate.replace(/[: ]/g, '_')}.pdf`);
}

export function generateAdminAnalyticsPDF(activeModel: TrainedModel, dataset: Dataset): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = '#1E3A8A';

  // Header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor('#FFFFFF');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ANSAR STUDENT PERFORMANCE AI - SYSTEM ANALYTICS', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Comprehensive Dataset Summary & ML Model Evaluation Export', 14, 20);

  // Dataset Table
  doc.setTextColor('#0F172A');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DATASET SPECIFICATIONS', 14, 36);

  autoTable(doc, {
    startY: 40,
    head: [['Dataset Name', 'Rows', 'Columns', 'Format', 'Status', 'Upload Date']],
    body: [
      [dataset.name, dataset.rowCount.toString(), dataset.columnCount.toString(), dataset.fileFormat, dataset.status, dataset.uploadDate]
    ],
    theme: 'grid',
    headStyles: { fillColor: primaryColor }
  });

  // Model Metrics Table
  const nextY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ACTIVE MACHINE LEARNING MODEL PERFORMANCE', 14, nextY);

  autoTable(doc, {
    startY: nextY + 4,
    head: [['Metric', 'Value', 'Benchmark Description']],
    body: [
      ['Model Name', activeModel.name, activeModel.algorithmLabel],
      ['R² Score (Coeff. of Determination)', activeModel.metrics.r2Score.toFixed(4), 'Proportion of variance explained (Higher is better)'],
      ['Mean Absolute Error (MAE)', `${activeModel.metrics.mae.toFixed(2)} marks`, 'Average magnitude of absolute prediction error'],
      ['Root Mean Squared Error (RMSE)', `${activeModel.metrics.rmse.toFixed(2)} marks`, 'Standard deviation of prediction residuals'],
      ['Calculated Model Accuracy', `${activeModel.metrics.accuracyPercentage}%`, 'Scaled goodness-of-fit percentage']
    ],
    theme: 'grid',
    headStyles: { fillColor: '#2563EB' }
  });

  // Feature Importance Table
  const fiY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('FEATURE IMPORTANCE WEIGHTS', 14, fiY);

  const fiData = activeModel.featureImportance.map(fi => [
    fi.feature,
    (fi.importance * 100).toFixed(1) + '%',
    fi.importance > 0.25 ? 'High Influence' : fi.importance > 0.12 ? 'Moderate Influence' : 'Low Influence'
  ]);

  autoTable(doc, {
    startY: fiY + 4,
    head: [['Feature Name', 'Importance Weight', 'Impact Rating']],
    body: fiData,
    theme: 'striped'
  });

  // Footer
  doc.setFillColor(primaryColor);
  doc.rect(0, 282, 210, 15, 'F');
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(8);
  doc.text('Ansar Student Performance AI - Educational System Export', 14, 290);

  doc.save(`Ansar_AI_System_Analytics_${Date.now()}.pdf`);
}
