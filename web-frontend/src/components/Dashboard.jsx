import React, { useState } from 'react';
import HistorySidebar from './HistorySidebar';
import FileUpload from './FileUpload';
import { motion } from 'framer-motion';
import StatsPanel from './StatsPanel';
import Charts from './Charts';
import DataTable from './DataTable';
import api from '../api';
import { Menu, LogOut, Download, Activity, Bell, Settings } from 'lucide-react';

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
            {/* Sidebar */}
            <motion.div
                initial={{ width: 280 }}
                animate={{ width: sidebarOpen ? 280 : 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#0F172A] border-r border-slate-800 flex-shrink-0 relative overflow-hidden shadow-2xl z-20"
            >
                <div className="w-[280px] h-full flex flex-col">
                    <HistorySidebar
                        onSelectHistory={handleHistorySelect}
                        refreshTrigger={refreshTrigger}
                        selectedId={selectedUploadId}
                    />
                </div>
            </motion.div>

            <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative bg-slate-50">
                {/* Navbar */}
                <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 flex items-center justify-between px-8 z-10 flex-shrink-0 sticky top-0 shadow-sm transition-all">

                    {/* Left Section: Brand & Navigation */}
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition-all active:scale-95"
                        >
                            <Menu size={22} strokeWidth={2} />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-primary-500 to-teal-500 p-2 rounded-lg shadow-lg shadow-primary-500/20 text-white">
                                <Activity className="h-5 w-5" />
                            </div>
                            <h1 className="text-xl font-display font-bold text-slate-900 tracking-tight hidden md:block">
                                Chemical<span className="text-primary-600">Viz</span>
                            </h1>
                        </div>

                        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

                        <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500">
                            <span className="hover:text-slate-900 transition-colors cursor-pointer">Dashboard</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-primary-600 bg-primary-50 px-3 py-1 rounded-full text-xs font-bold border border-primary-100">Overview</span>
                        </nav>
                    </div>

                    {/* Right Section: Status, Profile, Actions */}
                    <div className="flex items-center gap-5">

                        {/* System Status Pill */}
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100/50 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            SYSTEM ONLINE
                        </div>

                        <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>

                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all relative">
                                <Bell size={20} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>
                            <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all">
                                <Settings size={20} />
                            </button>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-2 border-l border-slate-200 ml-2">
                            <div className="text-right hidden xl:block">
                                <div className="text-sm font-bold text-slate-800">Administrator</div>
                                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Lead Analyst</div>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 p-0.5 shadow-inner">
                                <div className="h-full w-full rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white">AD</div>
                            </div>
                        </div>

                        <button
                            onClick={onLogout}
                            className="ml-2 p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                            title="Disconnect"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
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
