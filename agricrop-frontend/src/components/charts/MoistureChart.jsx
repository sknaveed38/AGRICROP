import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MoistureChart = ({ data }) => {
  const chartRef = useRef(null);
  const [gradient, setGradient] = useState(null);

  const hasData =
    data &&
    data.labels &&
    data.values &&
    data.labels.length > 0 &&
    data.values.length > 0;

  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current;
      const ctx = chart.ctx;
      const chartArea = chart.chartArea;

      if (chartArea) {
        const grad = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        grad.addColorStop(0, 'rgba(46, 125, 50, 0.3)');
        grad.addColorStop(1, 'rgba(46, 125, 50, 0.0)');
        setGradient(grad);
      }
    }
  }, [hasData]);

  const chartData = useMemo(() => {
    if (!hasData) return null;

    return {
      labels: data.labels,
      datasets: [
        {
          label: 'Moisture Level (%)',
          data: data.values,
          borderColor: '#2E7D32',
          backgroundColor: gradient || 'rgba(46, 125, 50, 0.15)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#2E7D32',
          pointBorderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#2E7D32',
          pointHoverBorderColor: '#FFFFFF',
          pointHoverBorderWidth: 2,
          borderWidth: 2.5,
        },
      ],
    };
  }, [data, hasData, gradient]);

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
            label: (context) => ` Moisture: ${context.parsed.y}%`,
          },
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
            maxRotation: 45,
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
            callback: (value) => `${value}%`,
            stepSize: 10,
          },
          border: {
            display: false,
          },
          min: 0,
          max: 100,
        },
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart',
      },
    }),
    []
  );

  // Plugin to create gradient on resize / first render
  const gradientPlugin = useMemo(
    () => ({
      id: 'moistureGradient',
      beforeDraw(chart) {
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        if (!chartArea) return;

        const grad = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        grad.addColorStop(0, 'rgba(46, 125, 50, 0.3)');
        grad.addColorStop(1, 'rgba(46, 125, 50, 0.0)');

        chart.data.datasets.forEach((dataset) => {
          if (dataset.fill) {
            dataset.backgroundColor = grad;
          }
        });
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
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
          />
        </svg>
        <p className="text-sm font-medium">No moisture data available</p>
        <p className="text-xs text-gray-300 mt-1">Sensor readings will appear here</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <Line ref={chartRef} data={chartData} options={options} plugins={[gradientPlugin]} />
    </div>
  );
};

export default MoistureChart;
