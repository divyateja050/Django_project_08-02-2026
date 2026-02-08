import React, { useState } from 'react';
import HistorySidebar from './HistorySidebar';
import FileUpload from './FileUpload';
import StatsPanel from './StatsPanel';
import Charts from './Charts';
import DataTable from './DataTable';
import api from '../api';
import { Menu, LogOut, Download, Activity } from 'lucide-react';

const Dashboard = ({ onLogout }) => {
    const [selectedUploadId, setSelectedUploadId] = useState(null);
    const [uploadData, setUploadData] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleUploadSuccess = (response) => {
        setRefreshTrigger(prev => prev + 1);
        setSelectedUploadId(response.upload_id);
        fetchUploadData(response.upload_id);
    };

    const handleHistorySelect = (id) => {
        setSelectedUploadId(id);
        fetchUploadData(id);
    };

    const fetchUploadData = async (id) => {
        try {
            console.log("Fetching data for ID:", id);
            const response = await api.get(`data/${id}/`);
            console.log("API Response:", response.data);
            setUploadData(response.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };

    const handleDownloadPDF = () => {
        if (selectedUploadId) {
            window.open(`http://localhost:8000/api/report/${selectedUploadId}/`, '_blank');
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Sidebar */}
            <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 flex-shrink-0 relative`}>
                <HistorySidebar
                    onSelectHistory={handleHistorySelect}
                    refreshTrigger={refreshTrigger}
                    selectedId={selectedUploadId}
                />
            </div>

            <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
                {/* Navbar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex items-center gap-2 text-primary-600">
                            <Activity className="h-6 w-6" />
                            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">Chemical Visualizer</h1>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 hover:border-red-200"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 scroll-smooth">
                    <div className="max-w-7xl mx-auto space-y-6 pb-10">
                        {/* File Upload Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <FileUpload onUploadSuccess={handleUploadSuccess} />
                        </div>

                        {uploadData ? (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Analysis Results
                                        </h2>
                                        <p className="text-gray-500 text-sm mt-1">
                                            File: {uploadData.upload.filename} • {new Date(uploadData.upload.uploaded_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleDownloadPDF}
                                        className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 shadow-md shadow-green-600/20 active:scale-95 transition-all text-sm font-medium"
                                    >
                                        <Download size={18} />
                                        Download PDF Report
                                    </button>
                                </div>

                                <StatsPanel summary={uploadData.summary} />
                                <Charts summary={uploadData.summary} />

                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 px-1">Detailed Equipment Data</h3>
                                    <DataTable data={uploadData.data} />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300 text-center">
                                <div className="p-4 bg-blue-50 rounded-full mb-4">
                                    <Activity size={40} className="text-blue-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Data Selected</h3>
                                <p className="text-gray-500 max-w-sm">
                                    Select a dataset from the history sidebar or upload a new CSV file to view the analysis.
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
