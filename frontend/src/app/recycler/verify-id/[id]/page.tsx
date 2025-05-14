"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../../components/Navbar";
import Navbar2 from "../../../components/Navbar2";

export default function VerifyId() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("id");
    if (id) {
      checkVerification(id);
    } else {
      setMessage("User ID not found. Please log in.");
      setLoading(false);
    }
  }, []);

  const checkVerification = async (id: string) => {
    try {
      const token = localStorage.getItem("token"); // Retrieve stored token
      const res = await axios.get(`http://localhost:3000/recycler/verify-id/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsVerified(res.data.verified);
    } catch (err) {
      console.error("Verification failed:", err);
      setMessage("Failed to check verification status.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const id = localStorage.getItem("id");
    const authToken = localStorage.getItem("token");
    if (!id || !authToken) {
      setMessage("User ID or token not found. Please log in.");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:3000/recycler/activate/${id}`,
        { id: Number(id), token },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setMessage(res.data.message);
      setIsVerified(true);
    } catch (err) {
      setMessage("Invalid 2FA code or activation failed.");
    }
  };

  const handleGenerate2FA = async () => {
    const id = localStorage.getItem("id");
    const authToken = localStorage.getItem("token");
    if (!id || !authToken) {
      setMessage("User ID or token not found. Please log in.");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:3000/recycler/generate-2fa/${id}`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setMessage(`2FA code sent to your email: ${res.data.message}`);
    } catch (err) {
      setMessage("Failed to generate 2FA code.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#d6ae7b] to-[#eacda3]">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
        <Navbar2 />
        {loading ? (
          <p className="text-center text-[#8e8071] font-medium">Checking verification status...</p>
        ) : isVerified ? (
          <p className="text-center text-green-500 font-medium">Your account is verified.</p>
        ) : (
          <div className="text-center">
            <p className="text-[#8e8071] font-medium">Your account is not verified. Enter your 2FA code below:</p>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-gray-100 text-[#8e8071] mt-4"
              placeholder="Enter 2FA Code"
            />
            <button
              onClick={handleVerify}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Verify
            </button>
            <button
              onClick={handleGenerate2FA}
              className="mt-4 ml-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Generate 2FA Code
            </button>
            {message && <p className="mt-4 text-red-500">{message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
