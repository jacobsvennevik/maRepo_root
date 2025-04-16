"use client"

import { OceanBackground } from "@/components/ocean-background"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/sections/hero-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { BlogResourcesSection } from "@/components/sections/blog-resources-section"
import { PricingSection } from "@/components/sections/pricing-section"

export default function OceanHero() {
  return (
    <div className="relative overflow-x-hidden min-h-screen">
      {/* Ocean Background */}
      <OceanBackground />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Blog/Resources Section */}
      <BlogResourcesSection />

      {/* Footer */}
      <Footer />
    </div>
  )
}
