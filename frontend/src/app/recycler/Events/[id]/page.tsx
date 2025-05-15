'use client';

import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../../../components/Navbar"; // make sure Navbar3 is NOT imported if not used
import axios from "axios";

interface Event {
  id: number;
  address: string;
  weight: number;
  startTime: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [recyclerId, setRecyclerId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchUserStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const id = localStorage.getItem("id");

      if (!token || !id) {
        setIsActivated(false);
        return;
      }

      const res = await axios.get(
        `https://community-based-recycle-tracking-live.onrender.com/recycler/verify-id/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data && typeof res.data.verified !== "undefined") {
        setIsActivated(res.data.verified);
      } else {
        setIsActivated(false);
      }
    } catch {
      setMessage("Failed to check verification status.");
      setIsActivated(false);
    }
  };

  const fetchEvents = useCallback(async () => {
    if (!token) {
      setError("Token not found. Please log in.");
      return;
    }
    if (!isActivated) {
      setError("Account not activated. Please activate your account.");
      return;
    }
    try {
      const response = await axios.get(
        `https://community-based-recycle-tracking-live.onrender.com/recycler/events/${recyclerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents(response.data.data);
    } catch {
      setError("Failed to fetch events.");
    }
  }, [token, recyclerId, isActivated]);

  const handleEventAction = async (
    e: React.MouseEvent<HTMLButtonElement>,
    action: string,
    eventId: number
  ) => {
    e.preventDefault();
    if (!recyclerId || !token) {
      setError("User is not logged in.");
      return;
    }
    try {
      await axios.post(
        `https://community-based-recycle-tracking-live.onrender.com/recycler/${action}/${recyclerId}/${eventId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setError(null);
      alert(`Event ${action}ed successfully`);
      fetchEvents();
    } catch {
      setError(`Failed to ${action} the event.`);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRecyclerId(localStorage.getItem("id"));
      setToken(localStorage.getItem("token"));
    }
  }, []);

  useEffect(() => {
    if (token) fetchUserStatus();
  }, [token]);

  useEffect(() => {
    if (token && isActivated) fetchEvents();
  }, [token, isActivated, fetchEvents]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#d6ae7b" }}>
      <Navbar />
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Upcoming Events</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {message && <p className="text-yellow-500 text-center">{message}</p>}
        <div className="space-y-6">
          {events.length > 0 ? (
            events.map((event) => {
              const startDate = new Date(event.startTime);
              const day = startDate.toLocaleString("en-US", { weekday: "long" });
              const date = startDate.toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              });
              const time = startDate.toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              });

              return (
                <div
                  key={event.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border"
                >
                  <h2 className="text-xl font-semibold mb-2">{event.address}</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Weight: {event.weight} kg
                  </p>
                  <div>
                    <p>📅 {day}, {date}</p>
                    <p>⏰ {time}</p>
                  </div>
                  <p>📍 {event.address}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={(e) => handleEventAction(e, "join", event.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition"
                    >
                      Join
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500">No events available at the moment.</p>
          )}
        </div>
      </main>
    </div>
  );
}
