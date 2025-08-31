import React from "react";
import { isTestMode } from "../../services/mock-data";

interface MockModeBannerProps {
  mockDataType?: string;
  courseName?: string;
  className?: string;
}

export function MockModeBanner({
  mockDataType = "mock data",
  courseName,
  className = "",
}: MockModeBannerProps) {
  if (!isTestMode()) return null;

  return (
    <div
      className={`bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 ${className}`}
    >
      <div className="flex items-center space-x-2">
        <span className="text-yellow-600 text-sm">🧪</span>
        <span className="text-yellow-800 text-sm font-medium">
          Mock Mode Active
        </span>
      </div>
      <div className="text-yellow-700 text-xs mt-1">
        Using {mockDataType}
        {courseName && <span className="font-medium"> - {courseName}</span>}.
        Set NEXT_PUBLIC_TEST_MODE=false to disable.
      </div>
    </div>
  );
}

// Specific banner variants for different steps
export function SyllabusMockBanner({ courseName }: { courseName?: string }) {
  return (
    <MockModeBanner
      mockDataType="mock syllabus extraction"
      courseName={courseName}
    />
  );
}

export function CourseContentMockBanner() {
  return (
    <MockModeBanner
      mockDataType="mock course content analysis"
      courseName="Vector Embeddings → Transformers (8 Topics, 15+ Concepts)"
    />
  );
}

export function GeneralMockBanner() {
  return <MockModeBanner mockDataType="mock project data" />;
}
