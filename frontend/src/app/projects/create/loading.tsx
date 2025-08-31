import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreateProjectLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>

        {/* Title Skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-2xl mx-auto" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[1, 2].map((i) => (
            <Card key={i} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <Skeleton className="h-5 w-5" />
                </div>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-4" />
                <div className="space-y-2 mb-6">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info Skeleton */}
        <div className="mt-12 text-center">
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    </div>
  );
}
