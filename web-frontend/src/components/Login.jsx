import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api';
import { motion } from 'framer-motion';
import { ArrowRight, Hexagon, Database, Activity } from 'lucide-react';
import { Button } from './ui/Button';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
            toast.success(`Welcome back, ${username}!`);
            onLogin();
        } catch (err) {
            toast.error('Invalid credentials. Please try again.');
            setError('Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex bg-[#1e1e1e] font-sans overflow-hidden">
            {/* Left Column - Artistic/Brand Section */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden text-white">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,#333,transparent_70%)]"></div>

                {/* Abstract Geometric Pattern */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-10 pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full stroke-white" strokeWidth="0.1" fill="none">
                        <circle cx="50" cy="50" r="40" />
                        <circle cx="50" cy="50" r="30" />
                        <circle cx="50" cy="50" r="20" />
                        <line x1="10" y1="50" x2="90" y2="50" />
                        <line x1="50" y1="10" x2="50" y2="90" />
                    </svg>
                </div>

                <div className="relative z-10 flex items-center gap-2">
                    <Hexagon className="text-primary-400" size={32} strokeWidth={2} />
                    <span className="font-display font-bold text-xl tracking-wide">CHEM.VIZ</span>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="font-display text-5xl font-light leading-tight mb-6">
                        Precision Analytics for <br />
                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-teal-500">
                            Modern Industry.
                        </span>
                    </h1>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Visualize flow rates, pressure anomalies, and thermal dynamics in real-time.
                        Designed for engineers who demand clarity.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-6 text-sm font-medium text-gray-500">
                    <span className="flex items-center gap-2"> <Database size={16} /> Data-Driven </span>
                    <span className="flex items-center gap-2"> <Activity size={16} /> Real-Time </span>
                </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative">
                {/* Right Side texture matching left */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_50%,#333,transparent_70%)] pointer-events-none"></div>

                <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl border border-gray-100 relative z-10">
                    <div className="mb-10">
                        <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
                        <p className="text-gray-500">Welcome back. Please enter your details.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="group">
                            <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-primary-700">Username</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all placeholder-gray-300 text-gray-900"
                                placeholder="Enter your ID"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="group">
                            <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-primary-700">Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all placeholder-gray-300 text-gray-900"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                className="w-full h-12 bg-gray-900 hover:bg-black text-white rounded-lg flex items-center justify-center gap-3 transition-all duration-300 group shadow-md hover:shadow-lg"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Continue'}
                                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </Button>
                        </div>


                    </form>

                    <div className="mt-12 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-400 text-center">
                            By accessing this system, you agree to the <a href="#" className="underline hover:text-gray-600">Terms of Service</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
