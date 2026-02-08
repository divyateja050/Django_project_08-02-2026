import React, { useState } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { TestTube, Gauge, Activity, ArrowRight, Lock, User } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const token = btoa(`${username}:${password}`);
        try {
            await api.get('history/', {
                headers: { Authorization: `Basic ${token}` }
            });
            localStorage.setItem('user', JSON.stringify({ username, password }));
            onLogin();
        } catch (err) {
            setError('Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden font-sans">
            {/* Dynamic Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-violet-600/30 to-indigo-600/30 blur-[100px]"
                />
                <motion.div
                    animate={{ rotate: -360, scale: [1, 1.5, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 blur-[120px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                {/* 3D Glass Card */}
                <div className="relative group perspective-1000">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative p-8 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl">

                        {/* Header */}
                        <div className="text-center mb-8">
                            <motion.div
                                className="flex justify-center gap-4 mb-4"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                {[TestTube, Gauge, Activity].map((Icon, i) => (
                                    <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/10 text-violet-400 shadow-inner">
                                        <Icon size={24} />
                                    </div>
                                ))}
                            </motion.div>
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-gray-400 text-sm">Enter your credentials to access the nexus.</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Username Field */}
                            <div className="relative">
                                <User className={`absolute left-3 top-3.5 h-5 w-5 transition-colors ${focusedField === 'username' ? 'text-violet-400' : 'text-gray-500'}`} />
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </div>

                            {/* Password Field */}
                            <div className="relative">
                                <Lock className={`absolute left-3 top-3.5 h-5 w-5 transition-colors ${focusedField === 'password' ? 'text-violet-400' : 'text-gray-500'}`} />
                                <input
                                    type="password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(124, 58, 237, 0.5)" }}
                                whileTap={{ scale: 0.98 }}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg border border-white/20 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                <span className="flex items-center justify-center gap-2">
                                    {loading ? 'Authenticating...' : 'Access Dashboard'}
                                    {!loading && <ArrowRight size={18} />}
                                </span>
                            </motion.button>
                        </form>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-600 text-xs mt-8">
                    &copy; 2026 Chemical Visualizer Pro. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
