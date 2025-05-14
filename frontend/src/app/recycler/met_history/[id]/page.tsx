'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/app/components/Navbar";
import { useRouter } from "next/navigation";
import Navbar3 from "@/app/components/Navbar3";
interface HistoryItem {
  id: string;
  materialType: string;
  location: string;
  weight: number;
  acceptStatus: string;
}

export default function History() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      const id = localStorage.getItem("id");

      if (!token || !id) {
        setError("Unauthorized: Please log in.");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/recycler/log-material/history/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHistoryItems(response.data);
        setFilteredItems(response.data);
      } catch (error) {
        console.error(error);
        setError("Failed to load history.");
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    let filtered = historyItems;

    if (searchLocation) {
      filtered = filtered.filter((item) =>
        item.location.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    if (selectedMaterial !== "All") {
      filtered = filtered.filter((item) => item.materialType === selectedMaterial);
    }

    if (selectedStatus !== "All") {
      filtered = filtered.filter((item) => item.acceptStatus === selectedStatus);
    }

    setFilteredItems(filtered);
  }, [searchLocation, selectedMaterial, selectedStatus, historyItems]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-300 text-yellow-900";
      case "accepted":
        return "bg-green-300 text-green-900";
      case "rejected":
        return "bg-red-300 text-red-900";
      default:
        return "bg-gray-300 text-gray-900";
    }
  };

  return (
    <div className="min-h-screen bg-[#d6ae7b] text-[#8e8071]">
      <Navbar />
      <div className="pt-20 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6">History</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by Location"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="p-2 border rounded"
          />
          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="All">All Materials</option>
            {[...new Set(historyItems.map((item) => item.materialType))].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        {filteredItems.length > 0 ? (
          <div className="overflow-x-auto w-full max-w-4xl">
            <table className="min-w-full bg-white rounded shadow-md">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Material Type</th>
                  <th className="py-2 px-4 border-b">Location</th>
                  <th className="py-2 px-4 border-b">Weight (kg)</th>
                  <th className="py-2 px-4 border-b">Accept Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="text-center">
                    <td className="py-2 px-4 border-b">{item.materialType}</td>
                    <td className="py-2 px-4 border-b">{item.location}</td>
                    <td className="py-2 px-4 border-b">{item.weight}</td>
                    <td className={`py-2 px-4 border-b font-semibold ${getStatusColor(item.acceptStatus)}`}>
                      {item.acceptStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !error && <p>No history records found.</p>
        )}
        <button
          onClick={() => router.push("/recycler/Log/${userId}")}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Post Log
        </button>
      </div>
    </div>
  );
}
