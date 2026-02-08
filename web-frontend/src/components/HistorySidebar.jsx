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
        <div className="h-full flex flex-col bg-white">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2 text-gray-800">
                <History className="text-primary-600" size={20} />
                <h3 className="font-bold text-lg">Upload History</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                {history.length === 0 ? (
                    <div className="text-center py-10 px-4 text-gray-400">
                        <FileClock size={48} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No uploads yet</p>
                    </div>
                ) : (
                    history.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onSelectHistory(item.id)}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 group relative ${selectedId === item.id
                                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                                    : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-1 min-w-0">
                                    <div className="font-medium text-sm truncate pr-2" title={item.filename}>
                                        {item.filename}
                                    </div>
                                    <div className={`text-xs ${selectedId === item.id ? 'text-blue-500' : 'text-gray-400'}`}>
                                        {new Date(item.uploaded_at).toLocaleDateString()}
                                    </div>
                                </div>
                                {selectedId === item.id && (
                                    <ChevronRight size={16} className="text-blue-500 mt-0.5" />
                                )}
                            </div>
                        </button>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-center text-gray-400">
                Only last 5 uploads are stored
            </div>
        </div>
    );
};

export default HistorySidebar;
