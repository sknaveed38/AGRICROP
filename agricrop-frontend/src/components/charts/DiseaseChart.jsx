import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DISEASE_COLORS = {
  Healthy: '#4CAF50',
  'Bacterial Blight': '#F44336',
  'Brown Spot': '#FF9800',
  'Leaf Blast': '#E91E63',
  'Leaf Smut': '#9C27B0',
  Tungro: '#FF5722',
  'Sheath Blight': '#795548',
  'Rice Hispa': '#607D8B',
};

const DEFAULT_COLOR = '#9E9E9E';

const getColorForLabel = (label) => DISEASE_COLORS[label] || DEFAULT_COLOR;

const centerTextPlugin = {
  id: 'centerText',
  beforeDraw(chart) {
    const { ctx, width, height } = chart;
    const dataset = chart.data.datasets[0];
    if (!dataset || !dataset.data) return;

    const total = dataset.data.reduce((sum, val) => sum + val, 0);

    ctx.save();
    ctx.font = 'bold 28px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#1F2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toLocaleString(), width / 2, height / 2 - 10);

    ctx.font = '13px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#6B7280';
    ctx.fillText('Total', width / 2, height / 2 + 16);
    ctx.restore();
  },
};

const DiseaseChart = ({ data }) => {
  const hasData =
    data &&
    data.labels &&
    data.values &&
    data.labels.length > 0 &&
    data.values.length > 0;

  const chartData = useMemo(() => {
    if (!hasData) return null;

    const backgroundColors = data.labels.map((label) => getColorForLabel(label));
    const hoverColors = backgroundColors.map((c) => c + 'DD');

    return {
      labels: data.labels,
      datasets: [
        {
          data: data.values,
          backgroundColor: backgroundColors,
          hoverBackgroundColor: hoverColors,
          borderWidth: 3,
          borderColor: '#FFFFFF',
          hoverBorderColor: '#FFFFFF',
          hoverOffset: 8,
        },
      ],
    };
  }, [data, hasData]);

  const options = useMemo(
    () => ({
      cutout: '65%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyle: 'circle',
            font: {
              size: 12,
              family: 'Inter, system-ui, sans-serif',
              weight: '500',
            },
            color: '#374151',
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
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const value = context.parsed;
              const percentage = ((value / total) * 100).toFixed(1);
              return ` ${context.label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
      animation: {
        animateRotate: true,
        animateScale: true,
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
            d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
          />
        </svg>
        <p className="text-sm font-medium">No disease data available</p>
        <p className="text-xs text-gray-300 mt-1">Upload scans to see distribution</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <Doughnut data={chartData} options={options} plugins={[centerTextPlugin]} />
    </div>
  );
};

export default DiseaseChart;
