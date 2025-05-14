import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation"; // Import from next/navigation

export default function Profile() {
  const pathname = usePathname(); // Get the current path
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem("id");
    if (storedId) {
      setUserId(storedId);
    }
  }, []);

  const tabs = [
    { name: "Profile", path: userId ? `/recycler/Profile/${userId}` : "#" },
    { name: "Change Password", path: userId ? `/recycler/changepassword/${userId}` : "#" },
    { name: "Payment Setup", path:  `/recycler/paymentmethod/${userId}` },
    { name: "Profile Picture", path: userId ? `/recycler/Photo/${userId}` : "#" },
    { name: "Verify ID", path: userId ? `/recycler/verify-id/${userId}` : "#" },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      {/* Tabs Section */}
      <div className="flex flex-wrap gap-2 mb-5 border-b pb-3">
        {tabs.map((tab, index) => (
          <Link key={index} href={tab.path} passHref>
            <button
              className={`px-4 py-2 text-sm font-semibold rounded-md ${
                pathname === tab.path
                  ? "bg-[#4a734a] text-white"
                  : "bg-[#3b3b3b] text-gray-200 hover:bg-[#2a2a2a]"
              }`}
              disabled={tab.path === "#"}
            >
              {tab.name}
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
