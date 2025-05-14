"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../../components/Navbar";
import Navbar2 from "../../../components/Navbar2";

export default function PayoutSetup() {
  const [method, setMethod] = useState("mobile");
  const [details, setDetails] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSetupPayout = async () => {
    try {
      const token = localStorage.getItem("token");
      const recyclerId = localStorage.getItem("id"); // Get recyclerId from localStorage

      if (!token || !recyclerId) {
        setErrorMessage("Authentication token or Recycler ID is missing. Please log in.");
        return;
      }

      await axios.post(
        `http://localhost:3000/recycler/setup/${recyclerId}`,
        { method, details },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Payout details saved successfully!");
    } catch (error) {
      setErrorMessage("Failed to save payout details.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 justify-center items-center">
        <div className="p-6 border rounded-lg shadow-md w-100 bg-white">
          <Navbar2 />
          <h2 className="text-xl font-bold text-center mb-4 ">Setup Payout Method</h2>
          {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
          <select
            className="border p-2 w-full rounded mb-3"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="mobile">Mobile</option>
            <option value="bank">Bank</option>
          </select>
          <input
            className="border p-2 w-full rounded mb-3"
            placeholder={method === "mobile" ? "Enter Mobile Number" : "Enter Bank Account"}
            value={details}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDetails(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white p-2 rounded w-full"
            onClick={handleSetupPayout}
          >
            Save Payout Details
          </button>
        </div>
      </div>
    </div>
  );
}
