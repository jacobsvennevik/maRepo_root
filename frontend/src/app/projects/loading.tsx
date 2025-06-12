export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen relative p-8">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded-md w-48 animate-pulse"></div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="h-8 bg-gray-200 rounded-full w-16 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded-full w-24 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded-full w-20 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded-full w-28 animate-pulse"></div>
        </div>

        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 