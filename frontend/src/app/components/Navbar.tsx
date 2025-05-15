"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string>("/default-profile.png");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const fetchProfilePicture = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(
        `https://community-based-recycle-tracking-live.onrender.com/recycler/profile-picture/${id}`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfilePicture(URL.createObjectURL(res.data));
    } catch (err) {
      console.error("Error fetching profile picture:", err);
    }
  }, []);

  const fetchProfileData = useCallback(
    async (id: string) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          `https://community-based-recycle-tracking-live.onrender.com/recycler/profile/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const [first, last] = res.data.name.split(" ");
        setFirstName(first);
        setLastName(last);
        setEmail(res.data.email);

        fetchProfilePicture(id);
      } catch (err) {
        console.error("Error fetching profile data:", err);
      }
    },
    [fetchProfilePicture]
  );

  useEffect(() => {
    const storedId = localStorage.getItem("id");
    if (storedId) {
      setUserId(storedId);
      fetchProfileData(storedId);
    }
  }, [fetchProfileData]);

  const handleLogout = () => {
    localStorage.removeItem("id");
    localStorage.removeItem("token");
    setUserId(null);
    router.replace("/Login");
  };

  const isActive = (path: string) =>
    pathname === path ? "text-white bg-[#3CB371]" : "text-[#F0F0F0] hover:bg-[#FFD700]";

  return (
    <nav className="bg-[#2E8B57] border-[#206A46] shadow-md">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <div className="flex items-center space-x-3">
          <span className="self-center text-2xl font-semibold text-white">ECORECYCLE</span>
        </div>
        <div className="relative flex items-center md:order-2">
          <button
            type="button"
            className="flex text-sm bg-[#3CB371] rounded-full focus:ring-4 focus:ring-[#FFD700]"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <span className="sr-only">Open user menu</span>
            <Image
              width={32}
              height={32}
              className="rounded-full"
              src={profilePicture}
              alt="User Photo"
            />
          </button>
          {dropdownOpen && (
            <div className="absolute right-1 top-full mt-1 w-48 bg-[#206A46] divide-y divide-gray-100 rounded-lg shadow-sm z-50">
              <div className="px-4 py-3">
                <span className="block text-sm text-white">{firstName} {lastName}</span>
                <span className="block text-sm text-gray-300 truncate">{email}</span>
              </div>
              <ul className="py-2">
                <li>
                  <Link
                    href={`/recycler/Dashboard/${userId}`}
                    className="block px-4 py-2 text-sm text-white hover:bg-[#FFD700]"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/recycler/Profile/${userId}`}
                    className="block px-4 py-2 text-sm text-white hover:bg-[#FFD700]"
                  >
                    Settings
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/recycler/Earning/${userId}`}
                    className="block px-4 py-2 text-sm text-white hover:bg-[#FFD700]"
                  >
                    Earnings
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#FFD700]"
                  >
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1">
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-[#206A46] rounded-lg bg-[#2E8B57] md:flex-row md:space-x-8 md:mt-0 md:border-0">
            {userId && (
              <>
                <li>
                  <Link
                    href={`/recycler/Dashboard/${userId}`}
                    className={`block py-2 px-3 rounded ${isActive(`/recycler/Dashboard/${userId}`)}`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/recycler/Events/${userId}`}
                    className={`block py-2 px-3 rounded ${isActive(`/recycler/Events/${userId}`)}`}
                  >
                    Events
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/recycler/Log/${userId}`}
                    className={`block py-2 px-3 rounded ${isActive(`/recycler/Log/${userId}`)}`}
                  >
                    Log Material
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/recycler/progress/${userId}`}
                    className={`block py-2 px-3 rounded ${isActive(`/recycler/progress/${userId}`)}`}
                  >
                    Progress
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/recycler/payment/${userId}`}
                    className={`block py-2 px-3 rounded ${isActive(`/recycler/payment/${userId}`)}`}
                  >
                    Payment
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
