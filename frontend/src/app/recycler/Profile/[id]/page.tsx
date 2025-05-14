"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../../components/Navbar";
import Navbar2 from "../../../components/Navbar2";
interface UserProfile {
  id: number;
  name: string;
  email: string | null;
  age: number;
  gender: string;
  unpaidEarnings: number;
  wallet: number;
  role: string;
  created_at: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const id = localStorage.getItem("id");  
    if (id) {
      fetchProfile(id);
    } else {
      setError("User ID not found. Please log in.");
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:3000/recycler/profile/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(res.data);
    } catch (err) {
      setError("Failed to fetch profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#d6ae7b] to-[#eacda3]">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
     <Navbar2 />



        {/* Content Section */}
        {loading ? (
          <p className="text-center text-[#8e8071] font-medium">Loading profile...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : profile ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/** Name */}
            <div>
              <label className="block text-sm font-medium text-[#8e8071]">Name</label>
              <input
                type="text"
                value={profile.name}
                className="w-full px-3 py-2 border rounded-md bg-gray-100 text-[#8e8071]"
                readOnly
              />
            </div>

            {/** Email */}
            <div>
              <label className="block text-sm font-medium text-[#8e8071]">Email</label>
              <input
                type="text"
                value={profile.email || "Not provided"}
                className="w-full px-3 py-2 border rounded-md bg-gray-100 text-[#8e8071]"
                readOnly
              />
            </div>

            {/** Age */}
            <div>
              <label className="block text-sm font-medium text-[#8e8071]">Age</label>
              <input
                type="text"
                value={profile.age.toString()}
                className="w-full px-3 py-2 border rounded-md bg-gray-100 text-[#8e8071]"
                readOnly
              />
            </div>

            {/** Total Earnings */}
            <div>
              <label className="block text-sm font-medium text-[#8e8071]">Gender</label>
              <input
                type="text"
                value={`${profile.gender}`}
                className="w-full px-3 py-2 border rounded-md bg-gray-100 text-[#8e8071]"
                readOnly
              />
            </div>

            {/** Unpaid Earnings */}
            <div>
              <label className="block text-sm font-medium text-[#8e8071]">Unpaid Earnings</label>
              <input
                type="text"
                value={`$${profile.unpaidEarnings}`}
                className="w-full px-3 py-2 border rounded-md bg-gray-100 text-[#8e8071]"
                readOnly
              />
            </div>

            {/** Wallet */}
            <div>
              <label className="block text-sm font-medium text-[#8e8071]">Wallet Balance</label>
              <input
                type="text"
                value={`$${profile.wallet}`}
                className="w-full px-3 py-2 border rounded-md bg-gray-100 text-[#8e8071]"
                readOnly
              />
            </div>

            {/** Role */}
            <div>
              <label className="block text-sm font-medium text-[#8e8071]">Role</label>
              <input
                type="text"
                value={profile.role}
                className="w-full px-3 py-2 border rounded-md bg-gray-100 text-[#8e8071]"
                readOnly
              />
            </div>

            {/** Joined Date */}
            <div>
              <label className="block text-sm font-medium text-[#8e8071]">Joined On</label>
              <input
                type="text"
                value={new Date(profile.created_at).toLocaleDateString()}
                className="w-full px-3 py-2 border rounded-md bg-gray-100 text-[#8e8071]"
                readOnly
              />
            </div>
          </div>
        ) : (
          <p className="text-center text-[#8e8071]">No profile data available.</p>
        )}
        </div>
    </div>
  );
}
