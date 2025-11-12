import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PageSkeletonProps {
  variant?: "login" | "signup" | "dashboard";
  message?: string;
}

export function PageSkeleton({
  variant = "login",
  message = "Redirection en cours...",
}: PageSkeletonProps) {
  if (variant === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo Skeleton */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-200 rounded-full animate-pulse"></div>
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="space-y-2">
                <div className="h-8 w-48 bg-gray-200 rounded mx-auto animate-pulse"></div>
                <div className="h-4 w-64 bg-gray-100 rounded mx-auto animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* User Type Buttons Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex space-x-2">
                    <div className="h-9 flex-1 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-9 flex-1 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Email Field Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-100 rounded animate-pulse"></div>
                </div>

                {/* Password Field Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-100 rounded animate-pulse"></div>
                </div>

                {/* Submit Button Skeleton */}
                <div className="h-10 w-full bg-blue-200 rounded animate-pulse"></div>

                {/* Links Skeleton */}
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-100 rounded mx-auto animate-pulse"></div>
                  <div className="h-4 w-40 bg-gray-100 rounded mx-auto animate-pulse"></div>
                </div>

                {/* Demo Credentials Skeleton */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="h-4 w-48 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-3 w-full bg-gray-50 rounded animate-pulse"></div>
                  <div className="h-3 w-full bg-gray-50 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Redirection Message */}
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-blue-600 font-medium">{message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (variant === "signup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-200 rounded-full animate-pulse"></div>
            </div>
            <div className="h-8 w-64 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 w-48 bg-gray-100 rounded mx-auto animate-pulse"></div>
          </div>

          <Card>
            <CardHeader>
              <div className="h-6 w-56 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-96 bg-gray-100 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* User Type Skeleton */}
                <div className="space-y-4">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
                    <div className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
                  </div>
                </div>

                {/* Form Fields Skeleton */}
                <div className="space-y-4">
                  <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
                        <div className="h-10 w-full bg-gray-50 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* More sections skeleton */}
                <div className="space-y-4">
                  <div className="h-6 w-56 bg-gray-200 rounded animate-pulse"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
                        <div className="h-10 w-full bg-gray-50 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button Skeleton */}
                <div className="h-10 w-full bg-blue-200 rounded animate-pulse"></div>
              </div>

              {/* Redirection Message */}
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-blue-600 font-medium">{message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Dashboard skeleton
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-100 rounded animate-pulse"></div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg animate-pulse"></div>
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-20 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded"
                >
                  <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-32 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Redirection Message */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-base text-blue-600 font-medium">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
