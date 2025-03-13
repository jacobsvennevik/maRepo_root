// app/(landing)/components/Hero.tsx
import Link from 'next/link';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-b from-white to-blue-50 pt-24 pb-20 overflow-hidden">
      {/* Animated SVG Wave at bottom */}
      <div className="absolute inset-x-0 bottom-0">
        <svg className="w-full" viewBox="0 0 1440 320">
          <path 
            fill="#3A8BCE" 
            fillOpacity="0.1" 
            d="M0,64L48,85.3C96,107,192,149,288,160C384,171,480,149,576,122.7C672,96,768,64,864,80C960,96,1056,160,1152,192C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
      <div className="container mx-auto relative z-10 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 mb-6">
          Study Smarter with AI—Dive into Better Learning.
        </h1>
        <p className="text-lg md:text-2xl text-gray-600 mb-10">
          Generate flashcards, mind maps, and quizzes from your notes in seconds.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Link href="/auth/register" className="px-8 py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition">
            Start for Free
          </Link>
          <a href="#features" className="px-8 py-3 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition">
            How It Works
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
