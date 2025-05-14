"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../../components/Navbar";

export default function Payment() {
  const [wallet, setWallet] = useState<number>(0);
  const [unpaidEarnings, setUnpaidEarnings] = useState<number>(0);
  const [cashoutAmount, setCashoutAmount] = useState<number>(0);
  const [twofaCode, setTwofaCode] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [recyclerId, setRecyclerId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [is2faSent, setIs2faSent] = useState<boolean>(false);

  useEffect(() => {
    const id = localStorage.getItem("id");
    const userToken = localStorage.getItem("token");
    setRecyclerId(id);
    setToken(userToken);
    if (id && userToken) fetchWalletDetails(id, userToken);
  }, []);

  const fetchWalletDetails = async (id: string, token: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/recycler/financials/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWallet(response.data.wallet);
      setUnpaidEarnings(response.data.unpaidEarnings);
    } catch {
      setError("Failed to fetch wallet details.");
    }
  };

  const generate2FA = async () => {
    if (!recyclerId || !token) {
      setError("User authentication failed.");
      return;
    }
    try {
      setError(null);
      setMessage(null);
      await axios.post(
        `http://localhost:3000/recycler/generate-2fa/${recyclerId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIs2faSent(true);
      setMessage("2FA code sent to your email.");
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to generate 2FA code.");
    }
  };

  const handleCashout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recyclerId || !token || cashoutAmount <= 0 || cashoutAmount > unpaidEarnings || !twofaCode) {
      setError("Invalid input or insufficient earnings.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      const response = await axios.post(
        `http://localhost:3000/recycler/cashout/${recyclerId}`,
        { token: twofaCode, cashoutAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      setWallet(response.data.newWalletBalance);
      setUnpaidEarnings(response.data.remainingUnpaidEarnings);
      setCashoutAmount(0);
      setTwofaCode("");
      setIs2faSent(false);
      setTimeout(() => setMessage(null), 1000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to process cashout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#d6ae7b] to-[#eacda3] text-[#8e8071] dark:bg-gray-950 dark:text-[#eaeaea]">
      <Navbar />
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#8e8071]">Payment Method</h1>
        {error && <p className="text-[#cc4444] text-center mb-4">{error}</p>}
        {message && <p className="text-[#22c55e] text-center mb-4">{message}</p>}

        <div className="bg-white p-6 rounded-lg shadow-md border mb-6">
          <h2 className="text-xl font-semibold mb-4 text-[#8e8071]">Wallet Balance</h2>
          <p>💰 Wallet: <span className="font-semibold text-[#8e8071]">${wallet}</span></p>
          <p>⏳ Unpaid Earnings: <span className="font-semibold text-[#8e8071]">${unpaidEarnings}</span></p>
        </div>

        <form onSubmit={handleCashout} className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-6 text-[#8e8071]">Withdraw Funds</h2>
          <label className="block mb-2 text-sm text-[#8e8071]">Cashout Amount ($)</label>
          <input
            type="number"
            value={cashoutAmount || ""}
            onChange={(e) => setCashoutAmount(Number(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-[#ccc] rounded-md bg-gray-100 text-[#111827] text-lg mb-4 focus:ring-[#7b68ee] focus:border-[#7b68ee]"
            required
          />
          {!is2faSent ? (
            <button
              type="button"
              onClick={generate2FA}
              className="w-full mt-4 bg-[#7b68ee] text-white py-3 rounded-md hover:bg-[#6a4fd4] text-lg"
            >
              Generate 2FA Code
            </button>
          ) : (
            <>
              <label className="block mt-4 mb-2 text-sm text-[#8e8071]">Enter 2FA Code</label>
              <input
                type="text"
                value={twofaCode}
                onChange={(e) => setTwofaCode(e.target.value)}
                className="w-full px-4 py-3 border border-[#ccc] rounded-md bg-gray-100 text-[#111827] text-lg mb-4 focus:ring-[#7b68ee] focus:border-[#7b68ee]"
                required
              />
              <button
                type="submit"
                className="w-full mt-4 bg-[#22c55e] text-white py-3 rounded-md hover:bg-[#16a34a] text-lg"
                disabled={loading}
              >
                {loading ? "Processing..." : "Cashout"}
              </button>
            </>
          )}
        </form>
      </main>
    </div>
  );
}
