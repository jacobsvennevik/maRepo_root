"use client";

import { ReactNode } from "react";
import { BaseLayout } from "./base-layout";

interface ProjectLayoutProps {
  children: ReactNode;
}

export function ProjectLayout({ children }: ProjectLayoutProps) {
  return <BaseLayout>{children}</BaseLayout>;
}
