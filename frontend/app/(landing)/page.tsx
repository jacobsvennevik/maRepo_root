// app/(landing)/page.tsx
export default function PublicHomePage() {
  return (
    <section>
      <h1 className="text-3xl font-bold mb-4">Welcome to Study AI</h1>
      <p className="mb-4">
        This is a next-gen study platform leveraging AI to generate flashcards, mind maps, tests, and more!
      </p>
      <a
        href="/(auth)/register"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Get Started
      </a>
    </section>
  )
}
