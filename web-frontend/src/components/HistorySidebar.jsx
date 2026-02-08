import React, { useEffect, useState } from 'react';
import api from '../api';
import { FileClock, ChevronRight, History } from 'lucide-react';

const HistorySidebar = ({ onSelectHistory, refreshTrigger, selectedId }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, [refreshTrigger]);

    const fetchHistory = async () => {
        try {
            const response = await api.get('history/');
            setHistory(response.data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0F172A] text-slate-300">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-primary-400">
                    <History size={18} />
                </div>
                <div>
                    <h3 className="font-display font-bold text-white tracking-wide text-sm uppercase">Recent Data</h3>
                    <p className="text-xs text-slate-500 font-medium">Upload archive</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {history.length === 0 ? (
                    <div className="text-center py-10 px-4 text-slate-600">
                        <FileClock size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">No history found</p>
                    </div>
                ) : (
                    history.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onSelectHistory(item.id)}
                            className={`w-full text-left p-3.5 rounded-xl transition-all duration-200 group relative border ${selectedId === item.id
                                ? 'bg-primary-900/10 border-primary-500/30 text-white shadow-lg shadow-primary-900/20'
                                : 'bg-transparent border-transparent hover:bg-slate-800/50 hover:border-slate-700 text-slate-400 hover:text-indigo-200'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-1.5 min-w-0">
                                    <div className={`font-medium text-sm truncate pr-2 ${selectedId === item.id ? 'text-primary-200' : 'text-slate-300'}`} title={item.filename}>
                                        {item.filename}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs opacity-60">
                                        <div className={`w-1.5 h-1.5 rounded-full ${selectedId === item.id ? 'bg-primary-400' : 'bg-slate-600'}`}></div>
                                        {new Date(item.uploaded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                {selectedId === item.id && (
                                    <ChevronRight size={16} className="text-primary-400 mt-0.5 animate-pulse" />
                                )}
                            </div>
                        </button>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-[#0F172A]">
                <div className="bg-slate-900/50 rounded-lg p-3 text-xs text-center text-slate-500 border border-slate-800/50">
                    Displaying last 5 entires
                </div>
            </div>
        </div>
    );
};

export default HistorySidebar;
