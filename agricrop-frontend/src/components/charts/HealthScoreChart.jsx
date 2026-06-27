import React, { useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const DEFAULT_LABELS = [
  'Soil Health',
  'Crop Vigor',
  'Pest Resistance',
  'Water Quality',
  'Nutrient Level',
];

const HealthScoreChart = ({ data }) => {
  const hasData =
    data &&
    data.values &&
    data.values.length > 0;

  const chartData = useMemo(() => {
    if (!hasData) return null;

    const labels = data.labels && data.labels.length > 0 ? data.labels : DEFAULT_LABELS;

    return {
      labels,
      datasets: [
        {
          label: 'Health Score',
          data: data.values,
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          borderColor: '#4CAF50',
          borderWidth: 2.5,
          pointBackgroundColor: '#2E7D32',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#4CAF50',
          pointHoverBorderColor: '#FFFFFF',
          pointHoverBorderWidth: 2,
          fill: true,
        },
      ],
    };
  }, [data, hasData]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
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
          callbacks: {
            label: (context) => ` ${context.label}: ${context.parsed.r}/100`,
          },
        },
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          beginAtZero: true,
          ticks: {
            stepSize: 20,
            color: '#9CA3AF',
            backdropColor: 'transparent',
            font: {
              size: 10,
              family: 'Inter, system-ui, sans-serif',
            },
          },
          grid: {
            color: 'rgba(229, 231, 235, 0.6)',
            circular: true,
          },
          angleLines: {
            color: 'rgba(229, 231, 235, 0.6)',
          },
          pointLabels: {
            color: '#374151',
            font: {
              size: 12,
              family: 'Inter, system-ui, sans-serif',
              weight: '500',
            },
          },
        },
      },
      animation: {
        duration: 1000,
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <p className="text-sm font-medium">No health score data available</p>
        <p className="text-xs text-gray-300 mt-1">Complete assessments to view scores</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <Radar data={chartData} options={options} />
    </div>
  );
};

export default HealthScoreChart;
