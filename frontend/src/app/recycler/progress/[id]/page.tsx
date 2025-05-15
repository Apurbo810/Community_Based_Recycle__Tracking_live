'use client';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';
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
} from 'chart.js';
import Navbar from "../../../components/Navbar";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ProgressItem {
  date: string;
  earnings: number;
}

export default function ProgressPage() {
  const [progressData, setProgressData] = useState<ProgressItem[]>([]);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const decodedToken = jwt.decode(token) as { id: number; role: string } | null;
      if (!decodedToken?.id || !decodedToken?.role) {
        router.push('/login');
        return;
      }
      setUserId(decodedToken.id);
      setUserRole(decodedToken.role);
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (userRole && userRole !== 'recycler') {
      router.push('/unauthorized');
    }
  }, [userRole, router]);

  const fetchProgressData = useCallback(async () => {
    if (!userId || !dateRange.from || !dateRange.to) return;

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        `https://community-based-recycle-tracking-live.onrender.com/recycler/progress/${userId}`,
        {
          from: dateRange.from,
          to: dateRange.to,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const progress: ProgressItem[] = response.data?.data?.data || [];
      setProgressData(progress);
      setError(null);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setError('Failed to fetch progress data.');
    } finally {
      setLoading(false);
    }
  }, [userId, dateRange.from, dateRange.to]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const chartData = {
    labels: progressData.map((item) => item.date),
    datasets: [
      {
        label: 'Daily Earnings',
        data: progressData.map((item) => item.earnings),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Recycler Daily Earnings',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#e2e8f0',
        },
      },
      x: {
        grid: {
          color: '#e2e8f0',
        },
      },
    },
  };

  return (
    <main className="min-h-screen bg-[#d6ae7b]">
      <Navbar />
      <div className="flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white p-6 rounded shadow">
          <h1 className="text-xl font-bold text-gray-800 mb-4">Recycler Progress</h1>
          <div className="mb-4">
            <label className="block text-gray-700">From</label>
            <input
              type="date"
              name="from"
              value={dateRange.from}
              onChange={handleDateChange}
              className="border rounded w-full p-2 mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">To</label>
            <input
              type="date"
              name="to"
              value={dateRange.to}
              onChange={handleDateChange}
              className="border rounded w-full p-2 mt-1"
            />
          </div>
          {loading && <p className="text-blue-500">Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {progressData.length > 0 ? (
            <div style={{ height: '400px' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            !loading && <p className="text-gray-500">No earnings data available for the selected date range.</p>
          )}
        </div>
      </div>
    </main>
  );
}
