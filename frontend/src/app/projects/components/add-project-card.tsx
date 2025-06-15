import Link from 'next/link';

/**
 * Card button for creating a new project in the projects grid.
 */
export function AddProjectCard() {
  return (
    <Link href="/projects/create" className="block w-full h-full p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500">
      <div className="flex flex-col items-center justify-center h-full">
        <svg
          className="w-8 h-8 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <span className="text-lg font-medium">Create New Project</span>
      </div>
    </Link>
  );
} 