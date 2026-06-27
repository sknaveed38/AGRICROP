import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WeeklyTrendsChart = ({ data }) => {
  const hasData =
    data &&
    data.labels &&
    data.labels.length > 0 &&
    ((data.diseaseData && data.diseaseData.length > 0) ||
      (data.moistureData && data.moistureData.length > 0));

  const chartData = useMemo(() => {
    if (!hasData) return null;

    return {
      labels: data.labels,
      datasets: [
        {
          label: 'Disease Reports',
          data: data.diseaseData || [],
          backgroundColor: 'rgba(244, 67, 54, 0.75)',
          hoverBackgroundColor: 'rgba(244, 67, 54, 0.95)',
          borderColor: 'rgba(244, 67, 54, 1)',
          borderWidth: 0,
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.7,
          categoryPercentage: 0.6,
        },
        {
          label: 'Moisture Readings',
          data: data.moistureData || [],
          backgroundColor: 'rgba(33, 150, 243, 0.75)',
          hoverBackgroundColor: 'rgba(33, 150, 243, 0.95)',
          borderColor: 'rgba(33, 150, 243, 1)',
          borderWidth: 0,
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.7,
          categoryPercentage: 0.6,
        },
      ],
    };
  }, [data, hasData]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            usePointStyle: true,
            pointStyle: 'rectRounded',
            font: {
              size: 12,
              family: 'Inter, system-ui, sans-serif',
              weight: '500',
            },
            color: '#374151',
            padding: 20,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleFont: { size: 13, family: 'Inter, system-ui, sans-serif', weight: '600' },
          bodyFont: { size: 12, family: 'Inter, system-ui, sans-serif' },
          padding: 12,
          cornerRadius: 10,
          displayColors: true,
          boxPadding: 6,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#9CA3AF',
            font: {
              size: 11,
              family: 'Inter, system-ui, sans-serif',
            },
          },
          border: {
            display: false,
          },
        },
        y: {
          grid: {
            color: 'rgba(229, 231, 235, 0.6)',
            drawBorder: false,
          },
          ticks: {
            color: '#9CA3AF',
            font: {
              size: 11,
              family: 'Inter, system-ui, sans-serif',
            },
            precision: 0,
          },
          border: {
            display: false,
          },
          beginAtZero: true,
        },
      },
      animation: {
        duration: 800,
        easing: 'easeOutQuart',
      },
    }),
    []
  );

  if (!hasData) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center text-gray-400">
        <svg
          className="w-16 h-16 mb-3 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-sm font-medium">No weekly trend data available</p>
        <p className="text-xs text-gray-300 mt-1">Data will populate over time</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default WeeklyTrendsChart;
