"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../../components/Navbar";


export default function ShowEarnings() {
  const [financials, setFinancials] = useState({
    unpaidEarnings: 0,
    unpaidBonuses: 0,
    wallet: 0,
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("id");
    if (id) {
      fetchFinancials(id);
    } else {
      setMessage("User ID not found. Please log in.");
      setLoading(false);
    }
  }, []);

  const fetchFinancials = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:3000/recycler/financials/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFinancials(res.data);
    } catch (err) {
      console.error("Failed to fetch financials:", err);
      setMessage("Failed to fetch financial data.");
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="min-h-screen bg-gradient-to-b from-[#d6ae7b] to-[#eacda3]">
  <Navbar />
  <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
    {loading ? (
      <p className="text-center text-[#8e8071] font-medium">Fetching financial data...</p>
    ) : (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#8e8071]">Your Financial Summary</h2>
        <p className="mt-4 text-lg font-medium">Unpaid Earnings: <span className="text-[#d38b5d]">${financials.unpaidEarnings}</span></p>
        <p className="mt-2 text-lg font-medium">Unpaid Bonuses: <span className="text-[#6b8e23]">${financials.unpaidBonuses}</span></p>
        <p className="mt-2 text-lg font-medium">Wallet Balance: <span className="text-[#7b68ee]">${financials.wallet}</span></p>
        {message && <p className="mt-4 text-[#cc4444]">{message}</p>}
      </div>
    )}
  </div>
</div>
  );
}
