// app/(landing)/components/Demo.tsx
"use client";

import { useState } from 'react';

const Demo = () => {
  const [input, setInput] = useState('');
  const [flashcards, setFlashcards] = useState<string[]>([]);

  const handleGenerate = () => {
    // Simulate AI generation with placeholders
    setFlashcards([
      'Flashcard 1: Placeholder content.',
      'Flashcard 2: Placeholder content.',
      'Flashcard 3: Placeholder content.',
    ]);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
          Try Our AI Demo
        </h2>
        <p className="mb-8 text-gray-600 max-w-2xl mx-auto">
          Paste your sample text below and see how StudyWhale can generate flashcards for you.
        </p>
        <div className="max-w-xl mx-auto">
          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            rows={4}
            placeholder="Enter sample text..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            className="mt-4 w-full md:w-auto px-8 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
          >
            Generate Flashcards
          </button>
        </div>
        {flashcards.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              Generated Flashcards
            </h3>
            <ul className="space-y-4 max-w-xl mx-auto">
              {flashcards.map((card, index) => (
                <li key={index} className="p-6 bg-white rounded-lg shadow">
                  {card}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default Demo;
