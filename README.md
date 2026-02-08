# Chemical Equipment Parameter Visualizer

A hybrid application (Web + Desktop) for visualizing and analyzing chemical equipment data. Built with Django (Backend), React (Web Frontend), and PyQt5 (Desktop Frontend).

## Features

- **CSV Data Upload**: Parse and store equipment data (Name, Type, Flowrate, Pressure, Temperature).
- **Data Analysis**: Automatic calculation of averages and distribution of equipment types.
- **Visualization**: Interactive charts for data distribution.
- **History Management**: Keeps track of the last 5 uploads.
- **PDF Reporting**: Generate downloadable PDF reports for each dataset.
- **Hybrid Access**: Access the same data and features via a Web Dashboard or a Native Desktop App.

## Tech Stack

- **Backend**: Django, Django REST Framework, Pandas, SQLite.
- **Web Frontend**: React, Vite, TailwindCSS, Chart.js.
- **Desktop Frontend**: PyQt5, Matplotlib, Requests.

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js & npm

### 1. Backend Setup

1. Navigate to the project root.
2. create a virtual environment:

   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `.\venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Apply migrations:

   ```bash
   python backend/manage.py migrate
   ```

6. Create a superuser (for login):

   ```bash
   python backend/manage.py createsuperuser
   ```

7. Run the server:

   ```bash
   python backend/manage.py runserver
   ```

### 2. Web Frontend Setup

1. Navigate to `web-frontend`:

   ```bash
   cd web-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open the link provided (usually `http://localhost:5173`).

### 3. Desktop App Setup

1. Ensure the Backend is running.
2. Activate the virtual environment (if not already active).
3. Install Desktop requirements:

   ```bash
   pip install -r desktop-app/requirements.txt
   ```

4. Run the application:

   ```bash
   python desktop-app/main.py
   ```

## Usage

1. Log in using the superuser credentials created during backend setup.
2. Upload the provided `sample_equipment_data.csv`.
3. View the analysis, charts, and data table.
4. Download the PDF report from the Web Dashboard.
