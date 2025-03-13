// app/(landing)/components/Header.tsx
import Link from 'next/link';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-md z-50">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-2">
          {/* Placeholder Logo */}
          <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
          <span className="font-bold text-2xl text-gray-800">StudyWhale</span>
        </div>
        <nav className="hidden md:flex space-x-6">
          <Link href="#about" className="text-gray-600 hover:text-blue-600 transition">
            About
          </Link>
          <Link href="#features" className="text-gray-600 hover:text-blue-600 transition">
            Features
          </Link>
        </nav>
        <div className="flex space-x-4">
          <Link href="/auth/login" className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition">
            Sign In
          </Link>
          <Link href="/auth/register" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
