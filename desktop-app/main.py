import sys
import requests
import pandas as pd
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QLabel, QLineEdit, QPushButton, 
                             QTableWidget, QTableWidgetItem, QFileDialog, 
                             QTabWidget, QMessageBox, QHeaderView)
from PyQt5.QtCore import Qt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure

API_BASE_URL = "http://localhost:8000/api/"

class LoginWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Login - Chemical Equipment Visualizer")
        self.setGeometry(100, 100, 300, 150)
        self.layout = QVBoxLayout()

        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Username")
        self.layout.addWidget(self.username_input)

        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Password")
        self.password_input.setEchoMode(QLineEdit.Password)
        self.layout.addWidget(self.password_input)

        self.login_btn = QPushButton("Login")
        self.login_btn.clicked.connect(self.handle_login)
        self.layout.addWidget(self.login_btn)

        self.setLayout(self.layout)

    def handle_login(self):
        username = self.username_input.text()
        password = self.password_input.text()

        try:
            # Test credentials
            response = requests.get(f"{API_BASE_URL}history/", auth=(username, password))
            if response.status_code == 200:
                self.main_window = MainWindow(username, password)
                self.main_window.show()
                self.close()
            else:
                QMessageBox.warning(self, "Error", "Invalid credentials")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Connection failed: {str(e)}")

class MainWindow(QMainWindow):
    def __init__(self, username, password):
        super().__init__()
        self.auth = (username, password)
        self.setWindowTitle("Chemical Equipment Visualizer")
        self.setGeometry(100, 100, 1000, 700)

        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.main_layout = QVBoxLayout(self.central_widget)

        # Header
        self.header_label = QLabel(f"Welcome, {username}")
        self.header_label.setStyleSheet("font-size: 16px; font-weight: bold;")
        self.main_layout.addWidget(self.header_label)

        # Upload Section
        self.upload_btn = QPushButton("Upload CSV File")
        self.upload_btn.clicked.connect(self.upload_file)
        self.main_layout.addWidget(self.upload_btn)

        # Tabs
        self.tabs = QTabWidget()
        self.main_layout.addWidget(self.tabs)

        self.data_tab = QWidget()
        self.setup_data_tab()
        self.tabs.addTab(self.data_tab, "Data Table")

        self.viz_tab = QWidget()
        self.setup_viz_tab()
        self.tabs.addTab(self.viz_tab, "Visualizations")
        
        # History
        self.refresh_history()

    def setup_data_tab(self):
        layout = QVBoxLayout()
        self.data_table = QTableWidget()
        self.data_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        layout.addWidget(self.data_table)
        self.data_tab.setLayout(layout)

    def setup_viz_tab(self):
        layout = QVBoxLayout()
        
        self.stats_label = QLabel("Summary Statistics will appear here")
        layout.addWidget(self.stats_label)

        self.figure = Figure()
        self.canvas = FigureCanvas(self.figure)
        layout.addWidget(self.canvas)
        
        self.viz_tab.setLayout(layout)

    def upload_file(self):
        fname, _ = QFileDialog.getOpenFileName(self, 'Open CSV', '.', "CSV files (*.csv)")
        if fname:
            try:
                files = {'file': open(fname, 'rb')}
                response = requests.post(f"{API_BASE_URL}upload/", files=files, auth=self.auth)
                if response.status_code == 201:
                    data = response.json()
                    QMessageBox.information(self, "Success", "File Uploaded Successfully")
                    self.fetch_data(data['upload_id'])
                else:
                     QMessageBox.warning(self, "Error", f"Upload failed: {response.text}")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Upload error: {str(e)}")

    def refresh_history(self):
        # Could implement a sidebar similar to web, for now just loading most recent if available
        # or simplified flow
        pass

    def fetch_data(self, upload_id):
        try:
            response = requests.get(f"{API_BASE_URL}data/{upload_id}/", auth=self.auth)
            if response.status_code == 200:
                result = response.json()
                self.populate_table(result['data'])
                self.update_viz(result['summary'])
        except Exception as e:
             QMessageBox.critical(self, "Error", f"Fetch error: {str(e)}")

    def populate_table(self, data):
        if not data:
            return
        
        headers = ["Equipment Name", "Type", "Flowrate", "Pressure", "Temperature"]
        self.data_table.setColumnCount(len(headers))
        self.data_table.setHorizontalHeaderLabels(headers)
        self.data_table.setRowCount(len(data))

        for row_idx, row_data in enumerate(data):
            self.data_table.setItem(row_idx, 0, QTableWidgetItem(str(row_data['equipment_name'])))
            self.data_table.setItem(row_idx, 1, QTableWidgetItem(str(row_data['equipment_type'])))
            self.data_table.setItem(row_idx, 2, QTableWidgetItem(str(row_data['flowrate'])))
            self.data_table.setItem(row_idx, 3, QTableWidgetItem(str(row_data['pressure'])))
            self.data_table.setItem(row_idx, 4, QTableWidgetItem(str(row_data['temperature'])))

    def update_viz(self, summary):
        # Update Stats Label
        avgs = summary['averages']
        stats_text = (f"Total Count: {summary['total_count']} | "
                      f"Avg Flowrate: {avgs['flowrate']:.2f} | "
                      f"Avg Pressure: {avgs['pressure']:.2f} | "
                      f"Avg Temp: {avgs['temperature']:.2f}")
        self.stats_label.setText(stats_text)

        # Update Chart
        self.figure.clear()
        ax = self.figure.add_subplot(111)
        
        type_dist = summary['type_distribution']
        labels = list(type_dist.keys())
        values = list(type_dist.values())
        
        ax.bar(labels, values)
        ax.set_title("Equipment Type Distribution")
        ax.set_ylabel("Count")
        
        self.canvas.draw()

if __name__ == '__main__':
    app = QApplication(sys.argv)
    login = LoginWindow()
    login.show()
    sys.exit(app.exec_())
