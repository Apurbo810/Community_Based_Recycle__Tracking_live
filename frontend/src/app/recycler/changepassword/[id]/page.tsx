"use client";

import React, { useState } from "react";
import axios from "axios";
import Navbar from "../../../components/Navbar";
import Navbar2 from "../../../components/Navbar2";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
  
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
  
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
  
    const id = localStorage.getItem("id");
    const token = localStorage.getItem("token");
  
    if (!id || !token) {
      setError("User authentication failed. Please log in again.");
      return;
    }
  
    setLoading(true);
    setError(null);
    setSuccess(null);
  
    try {
      const response = await axios.post(
        `http://localhost:3000/recycler/update-password/${id}`, // Changed from PUT to POST
        { oldPassword: currentPassword, newPassword, confirmPassword }, // Match backend params
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.status === 200) {
        setSuccess("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError((err as any).response?.data?.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#d6ae7b] to-[#eacda3]">
      <Navbar />
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
        <Navbar2 />
        <h2 className="text-2xl font-semibold text-center text-[#4a734a] mb-4">Change Password</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#8e8071]">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-gray-100 text-[#8e8071]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8e8071]">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-gray-100 text-[#8e8071]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8e8071]">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-gray-100 text-[#8e8071]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#4a734a] text-white font-semibold py-2 rounded-md hover:bg-[#3a5a3a] transition duration-300"
            disabled={loading}
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
