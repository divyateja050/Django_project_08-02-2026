import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Database, Wind, Gauge, Thermometer } from 'lucide-react';

const StatCard = ({ title, value, unit, icon: Icon, colorClass }) => (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-5 flex items-start justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-800">{value}</span>
                    <span className="text-gray-400 text-xs font-medium">{unit}</span>
                </div>
            </div>
            <div className={`p-3 rounded-xl ${colorClass}`}>
                <Icon size={22} className="text-white" />
            </div>
        </CardContent>
    </Card>
);

const StatsPanel = ({ summary }) => {
    if (!summary) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
                title="Total Equipment"
                value={summary.total_count}
                unit="units"
                icon={Database}
                colorClass="bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30"
            />
            <StatCard
                title="Avg Flowrate"
                value={summary.averages.flowrate?.toFixed(2)}
                unit="L/min"
                icon={Wind}
                colorClass="bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30"
            />
            <StatCard
                title="Avg Pressure"
                value={summary.averages.pressure?.toFixed(2)}
                unit="Pa"
                icon={Gauge}
                colorClass="bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/30"
            />
            <StatCard
                title="Avg Temperature"
                value={summary.averages.temperature?.toFixed(2)}
                unit="°C"
                icon={Thermometer}
                colorClass="bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30"
            />
        </div>
    );
};

export default StatsPanel;
