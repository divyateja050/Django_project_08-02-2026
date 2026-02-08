import React, { useState, useEffect } from 'react';
import { X, User, Lock, Mail, Save, Key, Fingerprint, BadgeCheck, Settings, Bell, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import api from '../api';

const ProfileModal = ({ isOpen, onClose, defaultTab = 'profile' }) => {
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [profileData, setProfileData] = useState({
        username: '',
        result_id: '',
        email: '',
        first_name: '',
        last_name: '',
        date_joined: ''
    });

    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        if (isOpen) {
            setActiveTab(defaultTab);
            fetchUserDetails();
            setMessage({ type: '', text: '' });
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        }
    }, [isOpen, defaultTab]);

    const fetchUserDetails = async () => {
        try {
            const response = await api.get('user/details/');
            setProfileData(response.data);
            // Update local storage user if needed to keep name in sync
            const lsUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (lsUser.username === response.data.username) {
                // simple sync
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.put('user/details/', {
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                email: profileData.email
            });
            setMessage({ type: 'success', text: 'Profile updated successfully' });

            // Update local storage to reflect changes immediately if needed
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...currentUser, ...response.data.user }));

        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('user/password/', {
                old_password: passwordData.old_password,
                new_password: passwordData.new_password
            });
            setMessage({ type: 'success', text: 'Password changed successfully' });
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100">
                        <div>
                            <h2 className="text-xl font-display font-bold text-slate-800">Account Settings</h2>
                            <p className="text-sm text-slate-500">Manage your profile and security preferences</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                        {/* Sidebar Tabs */}
                        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-4 space-y-2">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-teal-50 text-teal-700 shadow-sm ring-1 ring-teal-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <User size={18} /> Profile Details
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'security' ? 'bg-teal-50 text-teal-700 shadow-sm ring-1 ring-teal-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <Lock size={18} /> Security
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-6 overflow-y-auto">
                            {message.text && (
                                <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {message.type === 'success' ? <BadgeCheck size={18} /> : <Fingerprint size={18} />}
                                    {message.text}
                                </div>
                            )}

                            {activeTab === 'profile' ? (
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-slate-800"
                                                value={profileData.first_name}
                                                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-slate-800"
                                                value={profileData.last_name}
                                                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
                                            <input
                                                type="email"
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-slate-800"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">User ID</label>
                                            <div className="font-mono text-slate-600 bg-slate-100 px-3 py-2 rounded-lg text-sm border border-slate-200">{profileData.id}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</label>
                                            <div className="font-mono text-slate-600 bg-slate-100 px-3 py-2 rounded-lg text-sm border border-slate-200">{profileData.username}</div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <Button disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white gap-2 border-none">
                                            <Save size={18} />
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                                        <div className="relative">
                                            <Key className="absolute left-3.5 top-3 text-slate-400" size={18} />
                                            <input
                                                type="password"
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-slate-800"
                                                placeholder="Enter current password"
                                                value={passwordData.old_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-slate-800"
                                            placeholder="Min. 8 characters"
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-slate-800"
                                            placeholder="Re-enter new password"
                                            value={passwordData.confirm_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                        />
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <Button disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white border-none shadow-lg shadow-teal-500/20 gap-2">
                                            <Lock size={18} />
                                            {loading ? 'Updating...' : 'Update Password'}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProfileModal;
