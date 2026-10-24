# ANSAR STUDENT PERFORMANCE AI

**An Intelligent Full-Stack Educational Analytics Platform for Student Academic Performance Prediction, Machine Learning Model Training, and Data Preprocessing.**

Developed by **Ansar** for BCA Data Mining & Machine Learning Mini Project.

---

## 🌟 Key Features

- **Role-Based Workspaces**:
  - **Teacher Workspace**: Upload CSV/Excel datasets, clean & impute data, analyze Pearson correlation matrix heatmaps, train ML regression models, monitor class rosters, and generate student prediction PDF reports.
  - **Student Portal**: Personalized student dashboard, calculate examination score estimates, view personalized AI study recommendations, track prediction history, and download official PDF academic cards.
- **Complete Machine Learning Pipeline**:
  - **Preprocessing**: Automatic missing value imputation (Mean/Median/Mode), duplicate removal, One-Hot & Label encoding, Z-score feature scaling.
  - **Algorithms**: Linear Regression (Ridge regularized), Decision Tree Regressor, Random Forest Regressor, Gradient Boosting Regressor.
  - **Evaluation Metrics**: $R^2$ Score, Mean Absolute Error (MAE), Mean Squared Error (MSE), Root Mean Squared Error (RMSE), and Feature Importance weights ranking.
- **University Authentication**:
  - University Register UID & Password registration/login for Teacher and Student accounts.
  - Role-based views, ORM models, session authentication, and database security.
- **Light & Dark Theme System**:
  - Persistent theme switching saved in `localStorage`.
  - System preference auto-detection (`prefers-color-scheme: dark`).
  - High-contrast, WCAG AA compliant Light and Dark styling across all dashboards, charts, tables, and modals with zero flash on page loads.
- **PDF Academic Report Generation**:
  - Official downloadable student academic performance cards with predicted score gauges, performance categories (*Outstanding*, *Good*, *Average*, *Needs Support*, *Critical Risk*), model specifications, and AI tutor study advice.

---

## 🏗️ Tech Stack

- **Django Web Engine**: Python 3.10+, Django 5.1+, SQLite (Local) / PostgreSQL (Production via `dj-database-url`), WhiteNoise for static assets.
- **Node/Vite Applet Preview Engine**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts, Express server (`server.ts`) with `@google/genai` (Gemini 3.8 Flash).
- **Machine Learning Engine**: Custom Scikit-learn style ML pipeline (Linear Regression, Decision Trees, Random Forest, Gradient Boosting).
- **Data Parsers**: PapaParse (CSV), SheetJS / XLSX (Excel).

---

## 🚀 Local Quickstart Guide

### Prerequisites
- **Python**: v3.10.0 or higher
- **Node.js**: v18.0.0 or higher
- **Git**

---

### Option A: Running Full-Stack Django Application

#### 1. Setup Virtual Environment & Install Dependencies
```bash
# On Linux / macOS:
python3 -m venv venv
source venv/bin/activate

# On Windows (PowerShell):
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt
```

#### 2. Configure Environment Variables
Copy `.env.example` to create `.env`:
```bash
cp .env.example .env
```

#### 3. Run Database Migrations & Start Django Server
```bash
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```
Open `http://localhost:8000` in your browser.

---

### Option B: Running Vite / Node Development Server

```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🌐 Production Deployment Guide (Render / Railway)

### 1. Render Deployment (Django Application)
1. Push this repository to GitHub.
2. Create a new **Web Service** on Render connected to your repository.
3. Set **Runtime**: Python 3
4. Set **Build Command**:
   ```bash
   pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
   ```
5. Set **Start Command**:
   ```bash
   gunicorn ansar_project.wsgi:application --bind 0.0.0.0:$PORT
   ```
6. Add Environment Variables:
   - `SECRET_KEY`: Set a secure random key.
   - `DEBUG`: `False`
   - `DATABASE_URL`: Add PostgreSQL URL (or use default SQLite on persistent disk).

---

## 📁 Project Directory Structure

```
├── .env.example              # Environment variables template
├── manage.py                 # Django command-line execution utility
├── requirements.txt          # Python & Django dependencies
├── package.json              # Node dependencies & scripts
├── README.md                 # Complete documentation
├── server.ts                 # Node Express server for preview applet
├── db.sqlite3                # Local SQLite database
├── ansar_project/            # Django core project configuration
│   ├── settings.py           # Django settings (DB, static, apps)
│   ├── urls.py               # Main URL routing
│   ├── wsgi.py               # WSGI production server entry point
│   └── asgi.py               # ASGI server entry point
├── apps/                     # Django applications
│   ├── authentication/       # User model (UID + Password), login, signup
│   ├── datasets/             # Dataset model, CSV/Excel upload views
│   ├── ml_models/            # TrainedModel schema & training workbench
│   └── predictions/          # PredictionRecord, score inference, PDF reports
├── templates/                # Bootstrap 5 HTML templates with Dark/Light theme
│   ├── base.html             # Base layout & persistent theme switcher
│   ├── landing.html          # Public landing homepage
│   ├── login.html            # Login with University UID
│   ├── signup.html           # Signup with Teacher/Student role
│   ├── teacher_dashboard.html # Teacher roster & KPI cards
│   ├── student_dashboard.html # Student score gauge
│   ├── dataset_upload.html   # Dataset management
│   ├── model_training.html   # ML algorithm workbench
│   └── prediction_form.html  # Real-time prediction form
└── src/                      # React SPA codebase for preview
    ├── App.tsx               # React application entry point
    ├── components/           # UI components (Navbar, Dashboards, Form, Theme Toggle)
    ├── context/              # React AppContext state management
    ├── services/             # ML engine, PDF generator, Gemini AI client
    └── types/                # TypeScript interfaces (Teacher & Student)
```

---

## 🔒 Security & Role Authorization

- **Role Authorization**: Access restricted strictly to **Teacher** and **Student** roles.
- **University UID Authentication**: Users authenticate using unique University Register UIDs.
- **Data Protection**: Uploaded files and predictions persist securely; no hardcoded credentials or dummy data.

---

## 📄 License

Developed by **Ansar**. Distributed for educational mini project use.
