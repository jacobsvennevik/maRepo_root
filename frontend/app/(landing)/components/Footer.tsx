// app/(landing)/components/Footer.tsx
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="py-8 bg-gray-200">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
          <span className="font-bold text-gray-800 text-xl">StudyWhale</span>
        </div>
        <nav className="flex flex-wrap gap-4">
          <Link href="#about" className="text-gray-600 hover:text-blue-600 transition">
            About
          </Link>
          <Link href="#features" className="text-gray-600 hover:text-blue-600 transition">
            Features
          </Link>
          <Link href="/auth/register" className="text-gray-600 hover:text-blue-600 transition">
            Sign Up
          </Link>
          <Link href="/auth/login" className="text-gray-600 hover:text-blue-600 transition">
            Sign In
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
