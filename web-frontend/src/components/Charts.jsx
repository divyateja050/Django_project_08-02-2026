import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Charts = ({ summary, data }) => {
    // If we have raw data, we can calculate more accurate distribution
    // that EXPLICITLY excludes nulls, matching our table logic.
    let type_distribution = summary ? summary.type_distribution : {};

    if (data && data.length > 0) {
        // Recalculate based on non-null rows
        const cleanData = data.filter(item => {
            const isNullOrNan = (val) => val == null || String(val).toLowerCase() === 'nan';
            // If ANY field is null/nan, exclude row
            return !(isNullOrNan(item.equipment_name) || isNullOrNan(item.equipment_type) || isNullOrNan(item.flowrate) || isNullOrNan(item.pressure) || isNullOrNan(item.temperature));
        });

        // Compute distribution
        const dist = {};
        cleanData.forEach(item => {
            const type = item.equipment_type || 'Unknown';
            dist[type] = (dist[type] || 0) + 1;
        });
        type_distribution = dist;
    }

    if (!type_distribution || Object.keys(type_distribution).length === 0) return null;

    // Handle 'null' or 'None' keys from backend if they exist
    const labels = Object.keys(type_distribution).map(k => (k === 'null' || k === 'None' || !k) ? 'Unknown' : k);
    const dataValues = Object.values(type_distribution);

    const barData = {
        labels,
        datasets: [
            {
                label: 'Equipment Count',
                data: dataValues,
                backgroundColor: 'rgba(59, 130, 246, 0.6)', // Blue-500
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const pieData = {
        labels,
        datasets: [
            {
                data: dataValues,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.6)',   // Blue
                    'rgba(16, 185, 129, 0.6)',   // Emerald
                    'rgba(139, 92, 246, 0.6)',   // Violet
                    'rgba(249, 115, 22, 0.6)',   // Orange
                    'rgba(236, 72, 153, 0.6)',   // Pink
                    'rgba(107, 114, 128, 0.6)',  // Gray
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(249, 115, 22, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(107, 114, 128, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: { font: { family: 'Inter', size: 12 } }
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f3f4f6',
                },
                ticks: { font: { family: 'Inter' } }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: { font: { family: 'Inter' } }
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-white border-b border-gray-50">
                    <CardTitle>Equipment Distribution (Bar)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80 w-full flex items-center justify-center p-2">
                        <Bar data={barData} options={options} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-white border-b border-gray-50">
                    <CardTitle>Equipment Distribution (Pie)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80 w-full flex items-center justify-center p-2">
                        <div className="w-2/3 h-full">
                            <Pie data={pieData} options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: 'right' }
                                }
                            }} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Charts;
