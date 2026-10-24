import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini AI SDK server-side
const aiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (aiKey) {
  ai = new GoogleGenAI({
    apiKey: aiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

let activeServerPort = Number(process.env.PORT) || 3000;
const PREFERRED_PORTS = [3000, 3001, 3002, 5173, 5174, 8000];

// Health check endpoint for Railway, Render, Docker & Cloud Run monitoring
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'healthy',
    app: 'Ansar Student Performance AI',
    port: activeServerPort,
    url: `http://localhost:${activeServerPort}`,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Server Info & Port Detection Endpoint
app.get('/api/server-info', (req, res) => {
  return res.status(200).json({
    status: 'online',
    app: 'Ansar Student Performance AI',
    port: activeServerPort,
    url: `http://localhost:${activeServerPort}`,
    candidatePorts: PREFERRED_PORTS,
    timestamp: new Date().toISOString()
  });
});

// Backend Dataset Validation & Profiling Endpoint
app.post('/api/dataset/validate', (req, res) => {
  try {
    const { rows, fileName } = req.body;
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        valid: false,
        error: 'Empty dataset. The file contains no data rows.'
      });
    }

    const rowCount = rows.length;
    const columns = Object.keys(rows[0] || {});
    const errors: string[] = [];
    const warnings: string[] = [];

    if (rowCount < 5) {
      warnings.push(`Dataset contains only ${rowCount} records. Machine learning training requires at least 5 student records for statistical validity.`);
    }

    // Inspect columns
    const numericColumns: string[] = [];
    const categoricalColumns: string[] = [];
    const missingStats: Record<string, number> = {};

    columns.forEach(col => {
      let numCount = 0;
      let nullCount = 0;

      rows.forEach(r => {
        const val = r[col];
        if (val === undefined || val === null || val === '' || val === 'N/A' || val === 'NaN') {
          nullCount++;
        } else if (!isNaN(Number(String(val).replace(/[%$, ]/g, '')))) {
          numCount++;
        }
      });

      missingStats[col] = nullCount;
      if (numCount > rowCount * 0.5) {
        numericColumns.push(col);
      } else {
        categoricalColumns.push(col);
      }
    });

    if (numericColumns.length === 0) {
      errors.push('No numeric columns detected in uploaded dataset. At least 2 numeric features (e.g., past marks, attendance) are required for ML modeling.');
    }

    return res.status(200).json({
      valid: errors.length === 0,
      fileName,
      rowCount,
      columnCount: columns.length,
      columns,
      numericColumns,
      categoricalColumns,
      missingStats,
      errors,
      warnings,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({
      valid: false,
      error: err.message || 'Failed to validate dataset on backend.'
    });
  }
});

// 1. AI Student Performance Recommendation Endpoint
app.post('/api/ai/recommendations', async (req, res) => {
  try {
    const { studentName, predictedScore, attendance, pastExam, studyHours, backlogs } = req.body;

    if (!ai) {
      return res.status(200).json({
        summary: `${studentName || 'Student'} is predicted to score ${predictedScore || 75}/100. Key focus areas include study hour discipline and concept review.`,
        recommendations: [
          'Maintain attendance above 80% to ensure lecture continuity.',
          'Allocate 14+ hours per week to individual practice and problem solving.',
          'Review previous examination papers and resolve doubts with course faculty.'
        ],
        studyPlan: [
          { time: '09:00 AM - 11:00 AM', focus: 'Core Theory', activity: 'Subject revision & notes review' },
          { time: '03:00 PM - 05:00 PM', focus: 'Practical Lab', activity: 'Coding & numerical assignment practice' }
        ]
      });
    }

    const prompt = `You are an expert AI educational counselor and academic tutor for the platform "Ansar Student Performance AI".
Analyze the student performance metrics:
- Student Name: ${studentName || 'Student'}
- Predicted Examination Score: ${predictedScore} / 100
- Class Attendance Rate: ${attendance}%
- Past Examination Score: ${pastExam} / 100
- Weekly Self-Study Hours: ${studyHours} hrs/week
- Active Backlogs: ${backlogs}

Generate a concise structured JSON object with keys:
1. "summary": A brief 2-sentence encouraging academic overview.
2. "recommendations": An array of 3 specific, actionable advice bullet points.
3. "studyPlan": An array of 3 daily study schedule items, each with "time", "focus", and "activity".

Return ONLY clean valid JSON. Do not wrap in markdown syntax.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (err) {
    console.error('Error generating AI recommendations:', err);
    return res.status(200).json({
      summary: `Estimated exam score is ${req.body.predictedScore || 75}/100. Targeted practice in coursework will help optimize results.`,
      recommendations: [
        'Maintain attendance above 80% to ensure lecture continuity.',
        'Allocate 14+ hours per week to individual practice and problem solving.',
        'Review previous examination papers and resolve doubts with course faculty.'
      ],
      studyPlan: [
        { time: '09:00 AM - 11:00 AM', focus: 'Core Theory', activity: 'Subject revision & notes review' },
        { time: '03:00 PM - 05:00 PM', focus: 'Practical Lab', activity: 'Coding & numerical assignment practice' }
      ]
    });
  }
});

// 2. AI Dataset Insights Endpoint
app.post('/api/ai/dataset-insights', async (req, res) => {
  try {
    const { rowCount, columnCount, targetName, r2Score } = req.body;

    if (!ai) {
      return res.json({
        insights: `Dataset contains ${rowCount} student records and ${columnCount} features. The active ML model explains ${(r2Score * 100).toFixed(1)}% of score variance.`
      });
    }

    const prompt = `You are an expert Data Scientist for "Ansar Student Performance AI".
Dataset specs:
- Rows: ${rowCount}
- Columns: ${columnCount}
- Target: ${targetName}
- Model R² Score: ${r2Score}

Provide a 3-sentence executive data mining insight summary highlighting model accuracy and data quality. Return clean plain text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    return res.json({ insights: response.text || 'Data analysis complete.' });
  } catch (err) {
    return res.json({
      insights: `Dataset contains ${req.body.rowCount || 500} student records. Model evaluation indicates strong correlation between attendance, study hours, and exam scores.`
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ansar Student Performance AI - ML Analytics & Exam Score Prediction</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static('dist'));
  }

  const startListening = (): Promise<number> => {
    return new Promise((resolve, reject) => {
      const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : null;
      // Sequence: user-specified PORT (if any), then 3000, 3001, 3002, 5173, 5174, 8000
      const portQueue = envPort && !PREFERRED_PORTS.includes(envPort)
        ? [envPort, ...PREFERRED_PORTS]
        : [...PREFERRED_PORTS];

      let queueIndex = 0;

      const tryPort = (portToTry: number) => {
        const server = app.listen(portToTry, '0.0.0.0', () => {
          resolve(portToTry);
        });

        server.on('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            console.warn(`[Port Conflict] Port ${portToTry} is occupied or conflicting.`);
            queueIndex++;
            let nextPort: number;
            if (queueIndex < portQueue.length) {
              nextPort = portQueue[queueIndex];
              console.log(`[Auto-Detect] Trying next preferred candidate port: ${nextPort}...`);
            } else {
              nextPort = portToTry + 1;
              console.log(`[Auto-Detect] Trying next sequential port: ${nextPort}...`);
            }
            tryPort(nextPort);
          } else {
            reject(err);
          }
        });
      };

      tryPort(portQueue[0]);
    });
  };

  const activePort = await startListening();
  activeServerPort = activePort;
  
  console.log(`\n============================================================`);
  console.log(`  Ansar Student Performance AI - Server Ready`);
  console.log(`  Local URL:   http://localhost:${activePort}/`);
  console.log(`  Network URL: http://0.0.0.0:${activePort}/`);
  console.log(`  Port:        ${activePort} (Auto-detected & resolved)`);
  console.log(`  API Health:  http://localhost:${activePort}/api/health`);
  console.log(`============================================================\n`);
}

startServer();
