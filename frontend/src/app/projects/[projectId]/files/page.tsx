'use client';

import { Suspense } from "react";
import { FileStorage } from "@/features/projects";

export default function ProjectFiles() {
  return (
    <Suspense fallback={<div>Loading files...</div>}>
      <FileStorage />
    </Suspense>
  );
}