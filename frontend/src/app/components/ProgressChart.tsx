// components/ProgressChart.tsx
import { FC } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

interface ProgressChartProps {
  data: { date: string; earnings: number }[];
}

const ProgressChart: FC<ProgressChartProps> = ({ data }) => {
  const labels = data.map((item) => item.date); // Dates for X-axis
  const earnings = data.map((item) => item.earnings); // Earnings for Y-axis

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Daily Earnings',
        data: earnings,
        borderColor: '#3b82f6', // Tailwind 'blue-500'
        backgroundColor: '#3b82f6',
        borderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        ticks: { color: '#4b5563' }, // Tailwind 'gray-700'
      },
      y: {
        ticks: { color: '#4b5563' }, // Tailwind 'gray-700'
      },
    },
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ProgressChart;
