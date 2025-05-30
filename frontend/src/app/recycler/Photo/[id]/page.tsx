"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../../components/Navbar";
import Navbar2 from "../../../components/Navbar2";
import Image from "next/image";

export default function Profile() {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const id = localStorage.getItem("id");
    if (id) {
      fetchProfilePicture(id);
    } else {
      setError("User ID not found. Please log in.");
      setLoading(false);
    }
  }, []);

  // Fetch user profile picture with authentication
  const fetchProfilePicture = async (id: string) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token is missing. Please log in.");
        setLoading(false);
        return;
      }

      console.log("Fetching Profile Picture for ID:", id);
      console.log("Token:", token); // Debugging token presence

      const res = await axios.get(`https://community-based-recycle-tracking-live.onrender.com/recycler/profile-picture/${id}`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const imageUrl = URL.createObjectURL(res.data);
      setProfilePicture(imageUrl);
    } catch {
      setProfilePicture("/default-profile.png"); // Fallback image if API call fails
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async () => {
    if (!selectedFile) {
      setError("Please select an image.");
      return;
    }

    const id = localStorage.getItem("id");
    if (!id) {
      setError("User ID not found. Please log in.");
      return;
    }

    const formData = new FormData();
    formData.append("files", selectedFile);

    try {
      const token = localStorage.getItem("token");
      await axios.post(`https://community-based-recycle-tracking-live.onrender.com/recycler/upload/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      fetchProfilePicture(id); // Refresh profile picture after upload
    } catch {
      setError("Failed to upload profile picture.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#d6ae7b] to-[#eacda3]">
      <Navbar />

      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
        <Navbar2 />

        {/* Profile Picture Section */}
        <div className="flex flex-col items-center">
          {loading ? (
            <p className="text-gray-500">Loading profile picture...</p>
          ) : (
            <div className="relative w-32 h-32 rounded-full border-4 border-[#8e8071] overflow-hidden">
              <Image
                src={profilePicture || "/default-profile.png"}
                alt="Profile"
                fill
                style={{ objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.src = "/default-profile.png";
                }}
              />
            </div>
          )}

          {/* File Input */}
          <input type="file" accept="image/*" onChange={handleFileChange} className="mt-3" />

          {/* Upload Button */}
          <button
            onClick={uploadProfilePicture}
            className="mt-2 px-4 py-2 bg-[#8e8071] text-white rounded-md"
          >
            Upload
          </button>

          {/* Error Message */}
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}