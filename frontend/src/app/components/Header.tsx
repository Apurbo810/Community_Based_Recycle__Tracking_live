import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname(); // Get current path

  return (
    <header className="flex justify-between items-center bg-gradient-to-r from-green-600 to-blue-500 text-white px-6 py-4 shadow-lg">
      
      <h1 className="text-2xl font-bold tracking-wide">Community Based Recycling Tracker</h1>

      <div className="flex gap-4">
        <Link href="/Login/" passHref>
          <button
            className={`px-4 py-2 rounded-lg shadow-md font-semibold transition ${
              pathname === "/Login/"
                ? "bg-green-700 text-white"
                : "bg-white text-green-600 hover:bg-green-100"
            }`}
          >
            Login
          </button>
        </Link>

        <Link href="/create_account" passHref>
          <button
            className={`px-4 py-2 rounded-lg shadow-md font-semibold transition ${
              pathname === "/create_account"
                ? "bg-blue-700 text-white"
                : "bg-white text-blue-600 hover:bg-blue-100"
            }`}
          >
            Make Account
          </button>
        </Link>
      </div>

    </header>
  );
};

export default Header;
