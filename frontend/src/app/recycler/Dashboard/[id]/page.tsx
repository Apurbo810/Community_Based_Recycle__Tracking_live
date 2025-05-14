'use client';

import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../../../components/Navbar";
import axios from "axios";

interface Event {
  id: number;
  address: string;
  weight: number;
  createdAt: string;
  startTime: string;
}

interface DailyEarning {
  day: string;
  earnings: number;
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [earnings, setEarnings] = useState<DailyEarning[]>([]);
  const [eventError, setEventError] = useState<string | null>(null);
  const [earningError, setEarningError] = useState<string | null>(null);
  const [recyclerId, setRecyclerId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("id");
    const userToken = localStorage.getItem("token");
    setRecyclerId(id);
    setToken(userToken);
  }, []);

  useEffect(() => {
    if (recyclerId && token) {
      fetchEvents();
      fetchEarnings();
    }
  }, [recyclerId, token]);

  const fetchEvents = async () => {
    if (!recyclerId || !token) {
      setEventError("Authentication required. Please log in.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:3000/recycler/joined-events/${recyclerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents(response.data.data);
    } catch {
      setEventError("Failed to fetch events.");
    }
  };

  const fetchEarnings = async () => {
    if (!recyclerId || !token) {
      setEarningError("Authentication required. Please log in.");
      return;
    }
  
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - 7); // 7 days ago
  
    const formatDate = (date: Date) => date.toISOString().split("T")[0];
  
    const requestBody = {
      from: formatDate(fromDate),
      to: formatDate(toDate),
    };
  
    try {
      const response = await axios.post(
        `http://localhost:3000/recycler/progress/${recyclerId}`,
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (!response.data?.data?.data) {
        setEarningError("Invalid API response structure.");
        return;
      }
  
      const earningsData = response.data.data.data.map((item: { date: string; earnings: number }) => ({
        day: formatDay(item.date),
        earnings: item.earnings,
      }));
  
      setEarnings(earningsData);
    } catch (error) {
      setEarningError("Failed to fetch earnings.");
    }
  };
  
  const formatDay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Using useMemo to avoid unnecessary re-renders
  const formattedEarnings = useMemo(() => earnings, [earnings]);
  const formattedEvents = useMemo(() => events, [events]);

  return (
    <div className="min-h-screen bg-[#d6ae7b] text-[#838071] font-open-sans">
      <Navbar />
      <main className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>

        <section className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-2xl font-semibold mb-4 text-green-600">Daily Earnings</h2>

          {earningError && <p className="text-red-500 text-center">{earningError}</p>}

          {formattedEarnings.length > 0 ? (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-[#5c5146] text-white">
                  <th className="p-3 border">Day</th>
                  <th className="p-3 border">Earnings ($)</th>
                </tr>
              </thead>
              <tbody>
                {formattedEarnings.map((item, index) => (
                  <tr key={index} className="text-center border-b">
                    <td className="p-3 border">{item.day}</td>
                    <td className="p-3 border text-green-500 font-semibold">${item.earnings.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500">No earnings data available.</p>
          )}
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md border mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">Joined Events</h2>

          {eventError && <p className="text-red-500 text-center">{eventError}</p>}

          {formattedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formattedEvents.map((event) => (
                <div key={event.id} className="border p-4 rounded-lg bg-white">
                  <h3 className="text-lg font-semibold mb-2">Event ID: {event.id}</h3>
                  <p className="text-gray-600">📍 {event.address}</p>
                  <p className="text-gray-500">📅 {formatDate(event.createdAt)}</p>
                  <p className="text-gray-500">⏰ {formatTime(event.startTime)}</p>
                  <p className="text-gray-500">⚖️ Weight: {event.weight} kg</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No events joined yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}
