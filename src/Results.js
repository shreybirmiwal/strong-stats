import React, { useEffect } from 'react';
import Calendar from 'react-calendar';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'react-calendar/dist/Calendar.css';

Chart.register(...registerables);

const parseDate = (dateString) => {
    const [datePart] = dateString.split(' ');
    return new Date(datePart);
};

const cleanExerciseName = (name) => name.replace(/"/g, '').trim();

const Results = ({ data }) => {
    // 1. Calendar View
    const uniqueDates = [...new Set(data.map(row => row.Date.split(' ')[0]))];

    // 2. Group by Exercise
    const groupedByExercise = data.reduce((acc, row) => {
        const isRest = row['Set Order'] === 'Rest Timer';
        if (!isRest) {
            const exercise = cleanExerciseName(row['Exercise Name']);
            const date = parseDate(row.Date);
            const weight = parseFloat(row.Weight);
            const reps = parseFloat(row.Reps);

            if (!acc[exercise]) acc[exercise] = [];
            acc[exercise].push({ date, weight, reps, score: weight + reps });
        }
        return acc;
    }, {});

    // 3. Sort by Date
    Object.keys(groupedByExercise).forEach(exercise => {
        groupedByExercise[exercise].sort((a, b) => a.date - b.date);
    });

    // 4. Chart.js Options
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { labels: { color: 'white' } },
            title: { display: true, text: 'Progress Over Time', color: 'white' },
        },
        scales: {
            x: {
                type: 'category',
                title: { display: true, text: 'Date', color: 'white' },
                ticks: { color: 'white' }
            },
            y: {
                type: 'linear',
                title: { display: true, text: 'Weight/Reps', color: 'white' },
                ticks: { color: 'white' }
            }
        },
        elements: { line: { tension: 0.2 } },
        interaction: { mode: 'index' }
    };

    // 5. Insights Generator
    const getLatestSet1 = (exercise) => {
        const entries = data.filter(row =>
            cleanExerciseName(row['Exercise Name']) === exercise &&
            row['Set Order'] === '1'
        );
        if (!entries.length) return null;
        return entries.reduce((latest, current) =>
            new Date(current.Date) > new Date(latest.Date) ? current : latest
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 space-y-8">
            {/* Header */}
            <header className="text-center">
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    🏋️ Workout Analysis
                </h2>
                <p className="text-gray-400 mt-2">Track your progress across all exercises</p>
            </header>

            {/* Calendar */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg mx-auto">
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    📅 Gym Attendance
                    <span className="text-sm bg-blue-500 px-2 py-1 rounded-full">
                        {uniqueDates.length} days
                    </span>
                </h3>
                <Calendar
                    className="w-full"
                    tileClassName={({ date, view }) => {
                        if (view !== 'month') return '';
                        const dateString = date.toISOString().split('T')[0];
                        const today = new Date();
                        const isPast = date < today.setHours(0, 0, 0, 0);
                        if (uniqueDates.includes(dateString)) return 'react-calendar__tile--attended';
                        if (isPast && !uniqueDates.includes(dateString)) return 'react-calendar__tile--missed';
                        return '';
                    }}
                    tileContent={({ date, view }) => null} // No dot, just color
                    onClickDay={() => { }} // disables click
                    selectRange={false}
                    showNeighboringMonth={false}
                />

            </div>

            {/* Charts */}
            <div className="flex flex-col gap-6 mx-auto w-full">
                {Object.keys(groupedByExercise).map((exercise) => {
                    const exerciseData = groupedByExercise[exercise];
                    const chartData = {
                        labels: exerciseData.map(d => d.date.toISOString().split('T')[0]),
                        datasets: [
                            {
                                label: 'Weight (lbs)',
                                data: exerciseData.map(d => d.weight),
                                borderColor: '#38bdf8',
                                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                            },
                            {
                                label: 'Reps',
                                data: exerciseData.map(d => d.reps),
                                borderColor: '#f472b6',
                                backgroundColor: 'rgba(244, 114, 180, 0.1)',
                            },
                            {
                                label: 'Score (Weight + Reps)',
                                data: exerciseData.map(d => d.score),
                                borderColor: '#fbbf24',
                                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                            },
                        ],
                    };

                    return (
                        <div key={exercise} className="bg-gray-800 p-4 rounded-xl shadow-lg w-full">
                            <h4 className="text-xl font-semibold mb-2 text-blue-300">{exercise}</h4>

                            <div className="h-[250px] sm:h-[350px] md:h-[400px]">
                                <Line data={chartData} options={{
                                    ...chartOptions,
                                    maintainAspectRatio: false // ← Critical fix
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>


            {/* Insights */}
            {/* <div className="bg-gray-800 p-6 rounded-xl shadow-lg mx-auto max-w-4xl">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    💡 Latest Set 1 Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(groupedByExercise).map((exercise) => {
                        const latestSet1 = getLatestSet1(exercise);
                        if (!latestSet1) return null;

                        return (
                            <div key={exercise} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                <h5 className="font-semibold text-blue-300">{exercise}</h5>
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm">🏋️ Weight: <span className="font-mono">{latestSet1.weight}</span> lbs</p>
                                    <p className="text-sm">🔄 Reps: <span className="font-mono">{latestSet1.reps}</span></p>
                                    <p className="text-sm">🔥 Score: <span className="font-mono">{latestSet1.score}</span></p>
                                </div>
                            </div>
                        );
                    })}
                        <div/>
                </div> */}
        </div>
    );
};

export default Results;