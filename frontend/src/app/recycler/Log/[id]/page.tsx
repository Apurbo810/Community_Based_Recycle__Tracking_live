'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Navbar3 from "@/app/components/Navbar3";

export default function LogMaterialForm() {
  const [weight, setWeight] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedId = localStorage.getItem("id");
    if (storedId) setUserId(storedId);
  }, []);

  const materialOptions = ["Plastic", "Paper", "Metal", "Glass", "Other"];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token || !userId) {
      setError("Unauthorized: Please log in.");
      return;
    }

    try {
      await axios.post(
        `http://localhost:3000/recycler/log-material/${userId}`,
        {
          weight: parseFloat(weight),
          materialType: materialType.toLowerCase(),
          location,
          price: parseFloat(price),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Material logged successfully!");
      setWeight("");
      setMaterialType("");
      setLocation("");
      setPrice("");

      setTimeout(() => setSuccess(null), 1000);
    } catch (error) {
      setError("Failed to log material.");
    }
  };

  // Handle navigation to history page
  const goToHistory = () => {
    router.push(`/recycler/met_history/${userId}`); // Assuming your history page is at the "/history" path
  };

  return (
    <div className="min-h-screen bg-[#d6ae7b] text-[#8e8071]">
      <Navbar />
      <div className="pt-20 flex justify-center">
        <div className="flex bg-white rounded shadow-md p-6 flex-col items-center w-full max-w-lg">
          {/* Navbar3 is inside the form now */}

          <form onSubmit={handleSubmit} className="w-full text-[#8e8071]">
            <h2 className="text-xl font-bold mb-4 text-center">Log Material</h2>
            {error && <p className="text-red-500 text-center">{error}</p>}
            {success && <p className="text-green-500 text-center">{success}</p>}

            <div className="mb-4">
              <label className="block">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 border rounded text-black"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block">Material Type</label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className="w-full px-3 py-2 border rounded text-black"
                required
              >
                <option value="">Select Material</option>
                {materialOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border rounded text-black"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block">Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border rounded text-black"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </form>

          {/* Go to History button */}
          <button
            onClick={goToHistory}
            className="w-full bg-gray-500 text-white py-2 rounded mt-4 hover:bg-gray-700"
          >
            Go to History
          </button>
        </div>
      </div>
    </div>
  );
}
