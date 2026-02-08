# ChemicalViz | Advanced Analytics

A modern full-stack application for visualizing and analyzing chemical equipment data with beautiful UI/UX. Features both a responsive web dashboard and a native desktop application powered by Electron.

## 🎯 Project Overview

This application provides comprehensive tools for uploading, analyzing, and visualizing chemical equipment parameters including flowrate, pressure, and temperature data. Built with production-ready best practices and modern web technologies.

## ✨ Key Features

- **📊 CSV Data Upload & Validation**: Smart parsing with null value detection and user confirmation
- **📈 Real-Time Data Analysis**: Automatic calculation of averages and equipment type distribution
- **🎨 Interactive Visualizations**: Beautiful charts powered by Chart.js with modern design
- **📝 History Management**: Intelligent auto-cleanup keeping only the 5 most recent uploads
- **📄 PDF Report Generation**: Professional, downloadable reports with ReportLab
- **🌐 Hybrid Platform Access**: Identical experience on Web (Chrome/Edge) and Desktop (Electron)
- **🔐 Secure Authentication**: Django-powered user authentication with session management

## 🛠️ Technology Stack

### Backend

- **Django 6.0.2** - Modern Python web framework with built-in admin and ORM
- **Django REST Framework 3.16.1** - Powerful API toolkit for RESTful services
- **Pandas 3.0.0** - Advanced data manipulation and analysis
- **NumPy 2.4.2** - Numerical computing for data processing
- **ReportLab 4.4.9** - PDF generation engine
- **SQLite** - Lightweight, serverless database

### Web Frontend

- **React 19.2.0** - Latest React with improved performance
- **Vite 7.2.4** - Next-generation frontend build tool (blazing fast HMR)
- **Tailwind CSS 4.1.18** - Modern utility-first CSS framework
- **Chart.js 4.5.1** - Beautiful, responsive charts
- **Axios 1.13.4** - HTTP client for API communication
- **Framer Motion 12.33.0** - Smooth animations and transitions
- **Lucide React 0.563.0** - Modern icon library

### Desktop Application

- **Electron 40.2.1** - Cross-platform desktop framework using Chromium
- **Node.js** - JavaScript runtime for Electron

## 🤔 Technology Choices & Rationale

### Why NOT PyQt5/Tkinter for Desktop?

**Initial Requirement**: The project originally required PyQt5 for the desktop application.

**Problems Encountered**:

1. **Outdated Rendering Engine**: PyQt5's QWebEngineView uses Chromium 87 (from 2020), which doesn't support modern CSS features like:
   - Tailwind CSS v4's advanced features
   - CSS Grid/Flexbox latest specifications
   - Modern animation APIs

2. **Styling Inconsistencies**: The web app looked stunning in Chrome/Edge but appeared "broken" or "messy" in PyQt5 due to CSS compatibility issues.

3. **Dependency Hell**: `pywebview` (alternative) requires `pythonnet`, which consistently failed to build on Windows with cryptic compilation errors.

4. **Maintenance Burden**: Maintaining two separate UIs (PyQt native widgets vs React components) doubles development effort and creates UX inconsistencies.

**Solution - Electron**:

- **Same Chromium Engine**: Electron uses the same modern Chromium as Chrome/Edge, guaranteeing 100% identical rendering
- **Single Codebase**: The desktop app is literally a window wrapper around the same React app
- **Perfect Styling**: Tailwind CSS 4, Framer Motion, and all modern web features work flawlessly
- **Developer Experience**: Hot reload, React DevTools, and familiar web debugging tools
- **Cross-Platform**: Electron provides true cross-platform support with native look and feel

### Why React over vanilla JavaScript?

- **Component Reusability**: Dashboard, Login, Navbar as isolated, testable components
- **State Management**: Efficient handling of upload history, user sessions, and chart data
- **Developer Ecosystem**: Rich library support (Chart.js wrappers, animation libraries, icon sets)
- **Modern Tooling**: Vite provides instant HMR and optimized production builds

### Why Tailwind CSS v4?

- **Utility-First Approach**: Rapid UI development without context switching to separate CSS files
- **Design Consistency**: Enforced design tokens for colors, spacing, and typography
- **Modern Features**: Native CSS variable support, advanced color mixing, dynamic viewport units
- **Smaller Bundle**: PostCSS-based pipeline generates only the CSS you actually use

### Why Vite over Create React App?

- **10x Faster HMR**: Instant hot module replacement during development
- **Optimized Builds**: Built-in code splitting and tree-shaking
- **Modern Defaults**: Native ES modules, TypeScript support out of the box
- **Active Development**: Vite is actively maintained, CRA is deprecated

### Why Django REST Framework?

- **Rapid API Development**: Automatic serialization, authentication, and viewsets
- **Built-in Features**: Pagination, filtering, and browsable API interface
- **Security**: CSRF protection, SQL injection prevention, XSS mitigation
- **Scalability**: Production-ready with minimal configuration

## 📁 Project Structure

```
Django_project_08-02-2026/
├── backend/                 # Django backend
│   ├── config/             # Project settings, URLs
│   ├── core/               # Main app (models, views, serializers)
│   └── db.sqlite3          # SQLite database
├── web-frontend/           # React web application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── api.js         # Axios API configuration
│   │   └── index.css      # Tailwind CSS entry point
│   ├── public/            # Static assets (favicon, icons)
│   └── dist/              # Production build output
├── desktop-app/           # Electron desktop wrapper
│   ├── electron-main.js   # Main process entry point
│   ├── icon.svg          # Application icon
│   └── package.json      # Electron dependencies
├── uploads/              # User-uploaded CSV files (auto-cleaned)
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## 🚀 Setup Instructions

### Prerequisites

- **Python 3.14+** (or 3.8+)
- **Node.js 18+** and npm
- **Git** (optional)

### 1️⃣ Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python backend/manage.py migrate

# Create admin user
python backend/manage.py createsuperuser

# Start Django server
python backend/manage.py runserver
```

Backend will run at `http://localhost:8000`

### 2️⃣ Web Frontend Setup

```bash
# Navigate to web-frontend
cd web-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Web app will run at `http://localhost:5173`

**For production build:**

```bash
npm run build
```

### 3️⃣ Desktop App Setup

**Development Mode** (with live web frontend):

```bash
# Navigate to desktop-app
cd desktop-app

# Install Electron dependencies (first time only)
npm install

# Start desktop application
npm start
```

**Production Mode** (standalone app with built frontend):

```bash
# First, build the web frontend
cd web-frontend
npm run build

# Then start the desktop app
cd ../desktop-app
npm start
```

**Requirements:**

- ✅ Backend must be running at `http://localhost:8000`
- ✅ Development mode: Web frontend dev server at `http://localhost:5173`
- ✅ Production mode: Electron loads from `web-frontend/dist/` folder

## ⚡ Quick Start (All-in-One)

**Open 3 terminals and run:**

```bash
# Terminal 1 - Backend
.\venv\Scripts\activate
python backend/manage.py runserver

# Terminal 2 - Web Frontend  
cd web-frontend
npm run dev

# Terminal 3 - Desktop App
cd desktop-app
npm start
```

**Then:**

- **Web**: Open `http://localhost:5173` in your browser
- **Desktop**: Electron window will open automatically

## 📖 Usage Guide

### Sample Data

Create a CSV file with the following format for testing:

```csv
Equipment Name,Type,Flowrate,Pressure,Temperature
Reactor-101,Reactor,150.5,25.3,85.2
Pump-205,Pump,200.0,30.5,45.0
HeatEx-303,Heat Exchanger,175.2,22.1,120.5
Tank-404,Storage Tank,0.0,5.2,25.0
Compressor-505,Compressor,220.8,45.0,95.3
```

**Column Requirements:**

- `Equipment Name` - Unique identifier (text)
- `Type` - Equipment category (text)
- `Flowrate` - Flow rate value (number, L/min)
- `Pressure` - Pressure value (number, bar)
- `Temperature` - Temperature value (number, °C)

### Web Application

1. **Login**: Use superuser credentials created during setup
2. **Upload Data**: Click "Upload CSV" button in the dashboard
   - Select your CSV file
   - If missing values detected, confirm upload when prompted
   - System validates column headers automatically
3. **View Analytics**: Dashboard displays:
   - **Summary Stats**: Total count, valid count, averages
   - **Equipment Distribution**: Interactive bar chart by type
   - **Data Table**: All rows with null values highlighted in yellow
4. **Download Reports**: Click "Download PDF" for professional report with:
   - Summary statistics
   - Equipment type breakdown
   - Complete data table
   - Warning for datasets with missing values
5. **History Management**:
   - View last 5 uploads in sidebar
   - Click any upload to view its data
   - Older uploads auto-deleted (both database and files)

### Desktop Application

The desktop experience is **identical** to the web version but runs in a native window:

- ✅ Same React UI with Tailwind CSS styling
- ✅ Same authentication and session management
- ✅ Same features: upload, analytics, PDF generation
- ✅ Same data validation and error handling
- ✅ Native window controls (minimize, maximize, close)
- ✅ Can run offline (production mode)

## 🎨 Design Highlights

- **Modern Dark Theme**: Teal accent colors (#14b8a6) with glassmorphism effects
- **Smooth Animations**: Framer Motion for page transitions and micro-interactions
- **Responsive Layout**: Mobile-first design scaling from 320px to 4K displays
- **Custom Icons**: Lucide React icon set with consistent sizing
- **Chemical Flask Branding**: Custom SVG icon used across web and desktop

## 🔒 Security Features

- CORS configured for secure API access
- Basic Authentication for all API endpoints
- SQL injection prevention via Django ORM
- XSS protection with React's automatic escaping
- CSRF tokens for state-changing operations

## 📊 Data Validation

- Null value detection (empty strings, whitespace, NaN)
- User confirmation for datasets with missing values
- Automatic highlighting of invalid rows in data table
- Statistical calculations exclude null/invalid entries
- File format validation (CSV only)

## 🧹 Automatic Cleanup

- **Upload History**: Keeps only the 5 most recent records
- **Physical Files**: Old CSV files automatically deleted from `uploads/` folder
- **Database Records**: Cascading deletion ensures no orphaned data

## 🐞 Troubleshooting

### Backend Issues

**❌ Backend won't start / Port already in use**

```bash
# Kill process on port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Then restart
python backend/manage.py runserver
```

**❌ "No module named 'django'"**

```bash
# Ensure virtual environment is activated
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Reinstall dependencies
pip install -r requirements.txt
```

**❌ Database migration errors**

```bash
# Delete database and start fresh
del backend\db.sqlite3  # Windows
rm backend/db.sqlite3    # Mac/Linux

# Recreate database
python backend/manage.py migrate
python backend/manage.py createsuperuser
```

### Frontend Issues

**❌ "EADDRINUSE: port 5173 already in use"**

```bash
# Kill Vite dev server (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Restart
npm run dev
```

**❌ Tailwind styles not applying**

```bash
# Clear cache and rebuild
rm -rf node_modules/.vite
npm run dev
```

**❌ "Cannot find module 'react'"**

```bash
# Delete and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Desktop App Issues

**❌ Electron window shows "Can't reach this site"**

- ✅ Ensure backend is running: `http://localhost:8000`
- ✅ Ensure web frontend is running: `http://localhost:5173`
- ✅ Check both servers in browser first

**❌ Desktop app won't launch**

```bash
# Verify Electron is installed
cd desktop-app
npm list electron

# Reinstall if missing
npm install electron --save-dev
```

**❌ Icon not showing in desktop app**

- Icon file: `desktop-app/icon.svg` should exist
- Restart Electron app after verifying

### Upload Issues

**❌ Upload fails with "Missing columns" error**

- Column headers must match EXACTLY (case-sensitive):
  - `Equipment Name` ✅ not `equipment_name` ❌
  - `Type` ✅ not `type` ❌
  - etc.

**❌ CSV file encoding errors**

```bash
# Convert to UTF-8 encoding
# Excel: Save As → CSV UTF-8 (Comma delimited)
```

**❌ "Network Error" when uploading**

- Check backend logs for CORS errors
- Verify `CORS_ALLOW_ALL_ORIGINS = True` in `backend/config/settings.py`
- Clear browser cache and cookies

## 📝 License

This project was created for educational purposes as part of a full-stack development portfolio.

## 👨‍💻 Author

**Divya Teja**  
Full-Stack Developer specializing in Python, React, and modern web technologies.

---

**Built with ❤️ using Django, React, Tailwind CSS, and Electron**
