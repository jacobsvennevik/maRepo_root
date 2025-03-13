// app/(landing)/components/Features.tsx
import { FaLightbulb, FaBrain, FaClipboardList } from 'react-icons/fa';

const featuresData = [
  {
    title: 'Flashcards',
    description: 'Transform your documents into interactive Q&A sets.',
    icon: <FaClipboardList size={32} className="text-blue-500" />,
  },
  {
    title: 'Mind Maps',
    description: 'Visualize complex topics for faster comprehension.',
    icon: <FaBrain size={32} className="text-blue-500" />,
  },
  {
    title: 'Summaries & Quizzes',
    description: 'Auto-generated tests and concise notes to track progress.',
    icon: <FaLightbulb size={32} className="text-blue-500" />,
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
          Why StudyWhale?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {featuresData.map((feature, index) => (
            <div
              key={index}
              className="p-8 border border-gray-200 rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-1 hover:scale-105"
            >
              <div className="flex justify-center mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-semibold text-center mb-3">{feature.title}</h3>
              <p className="text-gray-600 text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
