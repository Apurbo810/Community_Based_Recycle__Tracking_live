'use client';

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";
import Link from "next/link"; // Import Link for navigation

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      });

      const { token, role } = response.data;
      const decodedToken: any = jwt.decode(token);
      const userId = decodedToken?.id;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("id", userId);

      if (role === "recycler") {
        router.push(`/recycler/Dashboard/${userId}`);
      } else {
        setError("Invalid role.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Login failed. Please try again.");
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-[#d6ae7b] to-[#eacda3]">
      <form
        onSubmit={handleSubmit}
        className="max-w-sm mx-auto bg-white p-6 rounded-lg shadow-md"
      >
        <div className="mb-5">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-[#8e8071]"
          >
            Your email
          </label>
          <input
            type="email"
            id="email"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 hover:border-blue-500 transition duration-300 ease-in-out"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-[#8e8071]"
          >
            Your password
          </label>
          <input
            type="password"
            id="password"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 hover:border-blue-500 transition duration-300 ease-in-out"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <p className="text-[#cc4444] text-sm mb-3">{error}</p>
        )}
        <button
          type="submit"
          className="w-full text-white bg-[#7b68ee] hover:bg-[#6a4fd4] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-sm text-[#8e8071]">
        Don't have an account?{" "}
        <Link href="/create_account">
          <span className="text-[#7b68ee] hover:underline">Create one</span>
        </Link>
      </p>
    </div>
  );
}
