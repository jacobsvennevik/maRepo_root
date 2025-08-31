"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "./navbar";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Initial check on mount
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Don't show header on auth pages
  if (
    pathname?.startsWith("/(auth)") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup")
  ) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999]">
      <header
        className={`transition-all duration-300 ${scrolled ? "bg-white shadow-md py-3" : "bg-transparent py-4"}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-medium text-ocean-deep flex items-center"
            >
              <Droplets className="mr-2 text-aqua" />
              <span>OceanLearn</span>
            </Link>

            {/* Navigation Menu */}
            <Navbar />

            {/* Right-aligned actions */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-slate-800 hover:text-aqua transition-colors"
                asChild
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button variant="solid-blue" asChild>
                <Link href="/login">Try for free</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
