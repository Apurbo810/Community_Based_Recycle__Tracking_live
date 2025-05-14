"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

const ActivationIndicator: React.FC = () => {
  const [isActivated, setIsActivated] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");

  const fetchUserStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const id = localStorage.getItem("id");

      if (!token || !id) {
        console.warn("Missing token or user ID in localStorage. Setting isLoggedIn to false.");
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      console.log("✅ User is logged in. Checking activation status...");
      setIsLoggedIn(true);

      // AJAX request to verify activation status
      const res = await axios.get(`http://localhost:3000/recycler/verify-id/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("🛠 API Response:", res.data);

      if (res.data && typeof res.data.verified !== "undefined") {
        setIsActivated(res.data.verified);
        console.log("✅ isActivated set to:", res.data.verified);
      } else {
        console.warn("⚠️ Unexpected API response format:", res.data);
        setIsActivated(false);
      }
    } catch (err) {
      console.error("Verification failed:", err);
      setMessage("Failed to check verification status.");
      setIsActivated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStatus();  // Initial check when component mounts
    const intervalId = setInterval(fetchUserStatus, 5000);  // Auto-refresh every 5 seconds

    return () => clearInterval(intervalId);  // Cleanup interval on component unmount
  }, []);

  // Debugging log
  console.log({ loading, isLoggedIn, isActivated });

  if (loading) {
    console.log("Still loading...");
    return null;
  }

  if (!isLoggedIn) {
    console.log("User not logged in.");
    return null;
  }

  if (isActivated === null || isActivated === true) {
    console.log("User is already activated.");
    return null;
  }

  console.log("Showing ActivationIndicator!");

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-md">
      <p>{message || "Your account is not activated. Please verify your email."}</p>
    </div>
  );
};

export default ActivationIndicator;
