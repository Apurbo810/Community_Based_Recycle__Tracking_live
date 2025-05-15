'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Header from '@/app/components/Header';
import HomeClient from './components/ClientSlider';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const storedRole = localStorage.getItem('role');
      const storedId = localStorage.getItem('id');

      if (token && storedRole && storedId) {
        setIsLoggedIn(true);
        setRole(storedRole);
        setUserId(storedId);
      } else {
        setIsLoggedIn(false);
        setRole(null);
        setUserId(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && isLoggedIn && role === 'recycler' && userId) {
      router.push(`/recycler/Dashboard/${userId}`);
    }
  }, [loading, isLoggedIn, role, userId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Still loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <Header />
        <HomeClient />
        <div className="text-center mt-4 text-red-600">
          <p>You are not logged in. Please <a href="/Login" className="text-blue-600 underline">login</a> to continue.</p>
        </div>
      </>
    );
  }

  // If logged in but role is not 'recycler' or userId is missing:
  return (
    <>
      <Header />
      <HomeClient />
      <div className="text-center mt-4 text-red-600">
        <p>Unauthorized access. Please login with the correct account.</p>
      </div>
    </>
  );
}
