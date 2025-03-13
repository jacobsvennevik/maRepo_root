// app/(landing)/components/Testimonials.tsx
const testimonials = [
    {
      quote: 'StudyWhale saved me hours of cramming!',
      author: 'Student, University of X',
    },
    {
      quote: 'My students love the interactive flashcards!',
      author: 'Teacher, High School Y',
    },
  ];
  
  const Testimonials = () => {
    return (
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            What People Are Saying
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {testimonials.map((t, index) => (
              <div key={index} className="p-8 bg-white rounded-lg shadow-lg border border-gray-200">
                <p className="text-gray-600 italic mb-4">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-gray-800 font-semibold text-right">— {t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  export default Testimonials;
  