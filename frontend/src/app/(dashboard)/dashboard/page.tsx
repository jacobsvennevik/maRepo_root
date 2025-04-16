export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stats Card Placeholder */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Statistics</h3>
          <p className="text-gray-500">Stats placeholder</p>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Recent Activity</h3>
          <p className="text-gray-500">Activity placeholder</p>
        </div>

        {/* Quick Actions Placeholder */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Quick Actions</h3>
          <p className="text-gray-500">Actions placeholder</p>
        </div>
      </div>
    </div>
  )
} 