export function AddProjectCard() {
  return (
    <button className="block w-full p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500">
      <div className="flex flex-col items-center justify-center">
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
    </button>
  );
} 