import React, { useState, useRef, useEffect } from 'react';
import HistorySidebar from './HistorySidebar';
import FileUpload from './FileUpload';
import ProfileModal from './ProfileModal';
import { motion } from 'framer-motion';
import StatsPanel from './StatsPanel';
import Charts from './Charts';
import DataTable from './DataTable';
import api from '../api';
import { toast } from 'react-hot-toast'; // Import toast
import { Menu, LogOut, Download, Activity, Bell, Settings, User, Lock } from 'lucide-react';

const Dashboard = ({ onLogout }) => {
    const [selectedUploadId, setSelectedUploadId] = useState(null);
    const [uploadData, setUploadData] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileInitialTab, setProfileInitialTab] = useState('profile');
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const profileRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

    // Removed handleDownloadPDF and added handleDownloadReport
    const handleDownloadReport = async () => {
        if (!selectedUploadId) {
            toast.error("No report selected");
            return;
        }

        const loadingToast = toast.loading("Generating PDF Report...");

        try {
            // Using API call to get blob and download
            const response = await api.get(`report/${selectedUploadId}/`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const contentDisposition = response.headers['content-disposition'];
            let fileName = `report_${selectedUploadId}.pdf`;
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (fileNameMatch.length === 2)
                    fileName = fileNameMatch[1];
            }
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Report downloaded successfully', { id: loadingToast });
        } catch (error) {
            console.error("Download failed", error);
            // toast.error("Failed to download report"); // toast.error hides loading too fast sometimes if sharing ID, better to update loading toast
            toast.error("Failed to download report", { id: loadingToast });
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                defaultTab={profileInitialTab}
            />

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


                        <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>



                        {/* User Profile Dropdown */}
                        <div className="relative ml-2" ref={profileRef}>
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-3 hover:bg-slate-50 rounded-xl transition-all p-1"
                            >
                                <div className="text-right hidden xl:block">
                                    <div className="text-sm font-bold text-slate-800">
                                        {user ? user.username : 'Guest User'}
                                    </div>
                                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                                        {user ? 'Authorized Access' : 'Read Only'}
                                    </div>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-100 to-slate-100 p-0.5 shadow-inner relative group">
                                    <div className="h-full w-full rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white group-hover:bg-primary-600 transition-colors">
                                        {user ? user.username.substring(0, 2).toUpperCase() : 'GU'}
                                    </div>
                                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {profileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                                >
                                    <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                                        <p className="text-sm font-bold text-slate-800">Signed in as</p>
                                        <p className="text-xs text-slate-500 truncate">{user?.username || 'Guest'}</p>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={() => {
                                                setProfileInitialTab('profile');
                                                setShowProfileModal(true);
                                                setProfileOpen(false);
                                            }}
                                            className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary-600 rounded-lg transition-colors"
                                        >
                                            <User size={16} /> My Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setProfileInitialTab('security');
                                                setShowProfileModal(true);
                                                setProfileOpen(false);
                                            }}
                                            className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary-600 rounded-lg transition-colors"
                                        >
                                            <Lock size={16} /> Security
                                        </button>
                                        <div className="h-px bg-slate-100 my-1"></div>
                                        <button
                                            onClick={onLogout}
                                            className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
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
                                        onClick={handleDownloadReport}
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
