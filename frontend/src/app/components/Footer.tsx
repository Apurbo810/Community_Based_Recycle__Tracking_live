import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 px-8 mt-10 w-full">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center">
        
        <div className="md:w-1/3">
          <h2 className="text-2xl font-semibold text-green-500">
            Community Based <span className="text-blue-400">Recycling Tracker</span>
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            A smart solution to promote environmental sustainability by tracking and managing waste recycling activities efficiently within communities.
          </p>
        </div>

        <nav className="flex flex-col md:flex-row gap-4 md:gap-6 mt-6 md:mt-0">
          <a href="../index" className="hover:text-green-400 transition">Home</a>
          <a href="#" className="hover:text-blue-400 transition">Dashboard</a>
          <a href="#" className="hover:text-yellow-400 transition">About Us</a>
          <a href="#" className="hover:text-red-400 transition">Contact</a>
        </nav>

        <div className="flex gap-4 mt-6 md:mt-0">
          <a href="#" className="text-gray-400 hover:text-blue-500 transition text-lg"><FaFacebookF /></a>
          <a href="#" className="text-gray-400 hover:text-blue-400 transition text-lg"><FaTwitter /></a>
          <a href="#" className="text-gray-400 hover:text-pink-500 transition text-lg"><FaInstagram /></a>
          <a href="#" className="text-gray-400 hover:text-blue-700 transition text-lg"><FaLinkedin /></a>
        </div>
      </div>
      <div className="border-t border-gray-700 mt-6 pt-4 text-center">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Community Based Recycling Tracker. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
