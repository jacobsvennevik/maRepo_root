"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, Sparkles, Zap, Shield, Users, Award, ChevronRight } from "lucide-react"
import { SectionHeader } from "@/components/ui/common/section-header"

export function PricingSection() {
  const [annual, setAnnual] = useState(true)

  // Calculate monthly price based on annual toggle
  const getPrice = (monthlyPrice: number) => {
    if (annual) {
      // Calculate 17% discount for annual billing
      const annualPrice = monthlyPrice * 12 * 0.83 // 17% off
      return {
        monthly: (annualPrice / 12).toFixed(2),
        original: monthlyPrice.toFixed(2),
        saved: "17",
      }
    }
    return {
      monthly: monthlyPrice.toFixed(2),
      original: null,
      saved: null,
    }
  }

  // Free tier features
  const freeFeatures = [
    { name: "Basic flashcards", included: true },
    { name: "Limited concept maps", included: true },
    { name: "5 study sessions per month", included: true },
    { name: "Basic analytics", included: true },
    { name: "Community support", included: true },
    { name: "Advanced AI features", included: false },
    { name: "Unlimited study materials", included: false },
    { name: "Priority support", included: false },
  ]

  // Pro tier features
  const proFeatures = [
    { name: "Unlimited flashcards", included: true },
    { name: "Advanced concept maps", included: true },
    { name: "Unlimited study sessions", included: true },
    { name: "Detailed analytics", included: true },
    { name: "Email support", included: true },
    { name: "Advanced AI features", included: true },
    { name: "Unlimited study materials", included: true },
    { name: "Priority support", included: false },
  ]

  // Enterprise tier features
  const enterpriseFeatures = [
    { name: "Everything in Pro", included: true },
    { name: "Custom integrations", included: true },
    { name: "Team collaboration", included: true },
    { name: "Advanced analytics", included: true },
    { name: "Dedicated support", included: true },
    { name: "Custom AI models", included: true },
    { name: "API access", included: true },
    { name: "SLA guarantees", included: true },
  ]

  // Calculate prices
  const proPrice = getPrice(19.99)
  const enterprisePrice = getPrice(49.99)

  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      {/* Emerald-inspired background with gradient overlay */}
      <div className="absolute inset-0 bg-emerald-50/80 z-0">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-300 via-emerald-100 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_var(--tw-gradient-stops))] from-emerald-100/30 via-transparent to-emerald-50/20" />

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-emerald-300/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <SectionHeader
          badge="Simple Pricing"
          badgeColor="emerald-100"
          title="Choose the Perfect Plan"
          description="Select the plan that fits your learning needs. All plans include access to our core learning tools."
        />

        {/* Billing toggle */}
        <div className="flex items-center justify-center mb-8">
          <span className={`mr-3 text-sm ${annual ? "text-slate-900 font-medium" : "text-slate-600"}`}>
            Annual Billing
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 ${
              annual ? "bg-emerald-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                annual ? "translate-x-9" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`ml-3 text-sm ${!annual ? "text-slate-900 font-medium" : "text-slate-600"}`}>
            Monthly Billing
          </span>
          {annual && (
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              Save 20%
            </span>
          )}
        </div>

        {/* Rest of the component unchanged */}
        {/* ... */}
      </div>
    </section>
  )
} 