'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAuthGuard(requiredRole?: string) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return; // Avoid running on SSR

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !role) {
      console.log("Redirecting to login: Missing token or role.");
      router.replace("/login");
      return;
    }

    if (requiredRole && role !== requiredRole) {
      console.log(`Redirecting to unauthorized: Expected role=${requiredRole}, Found=${role}.`);
      router.replace("/unauthorized");
      return;
    }
  }, [router, requiredRole]);
}
