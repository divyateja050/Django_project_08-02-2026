import React from 'react';
import { Card } from './ui/Card';

const DataTable = ({ data }) => {
    if (!data || data.length === 0) return (
        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            No data available to display
        </div>
    );

    return (
        <Card className="overflow-hidden border-0 shadow-lg">
            <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            {['Equipment Name', 'Type', 'Flowrate', 'Pressure', 'Temperature'].map((header) => (
                                <th key={header} className="px-5 py-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((item, index) => {
                            // Fix: Do NOT use Number.isNaN(Number(val)) as it converts valid strings ("Pump") to NaN
                            const isNullOrNan = (val) => val == null || String(val).toLowerCase() === 'nan';
                            const hasNull = isNullOrNan(item.equipment_name) || isNullOrNan(item.equipment_type) || isNullOrNan(item.flowrate) || isNullOrNan(item.pressure) || isNullOrNan(item.temperature);

                            const rowClass = hasNull
                                ? "bg-red-50 hover:bg-red-100 transition-colors duration-150 border-l-4 border-red-400"
                                : "hover:bg-blue-50/50 transition-colors duration-150";

                            return (
                                <tr key={index} className={rowClass}>
                                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                                        {!isNullOrNan(item.equipment_name) ? item.equipment_name : <span className="text-red-500 italic font-semibold">N/A</span>}
                                    </td>
                                    <td className="px-5 py-4 text-sm">
                                        {!isNullOrNan(item.equipment_type) ? (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {item.equipment_type}
                                            </span>
                                        ) : (
                                            <span className="text-red-500 italic font-semibold">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-600 font-mono">
                                        {!isNullOrNan(item.flowrate) ? item.flowrate : <span className="text-red-500 italic font-semibold">N/A</span>}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-600 font-mono">
                                        {!isNullOrNan(item.pressure) ? item.pressure : <span className="text-red-500 italic font-semibold">N/A</span>}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-600 font-mono">
                                        {!isNullOrNan(item.temperature) ? item.temperature : <span className="text-red-500 italic font-semibold">N/A</span>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default DataTable;
