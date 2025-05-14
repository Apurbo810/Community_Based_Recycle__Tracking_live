import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation"; // Import from next/navigation

export default function Navbar3() {
  const pathname = usePathname(); // Get the current path
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem("id");
    if (storedId) {
      setUserId(storedId);
    }
  }, []);

  const tabs = [
    { name: "Log Material", path: userId ? `/recycler/Log/${userId}` : "#" },
    { name: "Material History", path: userId ? `/recycler/met_history/${userId}` : "#" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md py-3 px-6 flex justify-center gap-4">
      {tabs.map((tab, index) => (
        <Link key={index} href={tab.path} passHref>
          <button
            className={`px-4 py-2 text-sm font-semibold rounded-md transition ${
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
    </nav>
  );
}
