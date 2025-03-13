// app/(landing)/page.tsx
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Demo from './components/Demo';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

export default function LandingPage() {
  return (
    <div className="font-sans">
      <Header />
      <main className="pt-20">
        <Hero />
        <section id="about" className="py-20 bg-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">About StudyWhale</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              StudyWhale is an AI-powered study tool designed to help students and educators transform their notes into interactive flashcards, mind maps, and quizzes.
            </p>
          </div>
        </section>
        <Features />
        <Demo />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
