"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, Sparkles, Zap, Shield, Users, Award, ChevronRight } from "lucide-react"

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
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-block bg-emerald-100 px-4 py-2 rounded-full text-emerald-800 font-medium mb-4">
            Simple Pricing
          </div>
          <h2 className="text-4xl font-medium text-slate-900 mb-4">Choose the Perfect Plan</h2>
          <p className="text-lg text-slate-700 mb-10">
            Select the plan that fits your learning needs. All plans include access to our core learning tools.
          </p>
        </div>

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

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free tier */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 transition-transform hover:shadow-xl hover:-translate-y-1">
            <div className="p-8">
              <h3 className="text-xl font-medium text-slate-900 mb-2">Free</h3>
              <p className="text-slate-600 mb-6">Perfect for getting started</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">$0</span>
                <span className="text-slate-600 ml-1">/month</span>
              </div>
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">Get Started</Button>
            </div>
            <div className="border-t border-slate-200 p-8">
              <ul className="space-y-4">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-slate-300 mr-3 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={feature.included ? "text-slate-700" : "text-slate-400"}>{feature.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pro tier - highlighted */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-emerald-500 transform scale-105 relative z-10">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
              Most Popular
            </div>
            <div className="p-8 bg-gradient-to-b from-emerald-50 to-white">
              <h3 className="text-xl font-medium text-slate-900 mb-2">Pro</h3>
              <p className="text-slate-600 mb-6">Perfect for serious learners</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">${proPrice.monthly}</span>
                <span className="text-slate-600 ml-1">/month</span>
                {proPrice.original && (
                  <div className="mt-1">
                    <span className="text-sm text-slate-500 line-through">${proPrice.original}/month</span>
                    <span className="ml-2 text-xs font-medium bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                      Save {proPrice.saved}%
                    </span>
                  </div>
                )}
              </div>
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">Get Started</Button>
            </div>
            <div className="border-t border-emerald-100 p-8">
              <ul className="space-y-4">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-slate-300 mr-3 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={feature.included ? "text-slate-700" : "text-slate-400"}>{feature.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Enterprise tier */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 transition-transform hover:shadow-xl hover:-translate-y-1">
            <div className="p-8">
              <h3 className="text-xl font-medium text-slate-900 mb-2">Enterprise</h3>
              <p className="text-slate-600 mb-6">For teams and organizations</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">${enterprisePrice.monthly}</span>
                <span className="text-slate-600 ml-1">/month</span>
                {enterprisePrice.original && (
                  <div className="mt-1">
                    <span className="text-sm text-slate-500 line-through">${enterprisePrice.original}/month</span>
                    <span className="ml-2 text-xs font-medium bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                      Save {enterprisePrice.saved}%
                    </span>
                  </div>
                )}
              </div>
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">Contact Sales</Button>
            </div>
            <div className="border-t border-slate-200 p-8">
              <ul className="space-y-4">
                {enterpriseFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-slate-300 mr-3 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={feature.included ? "text-slate-700" : "text-slate-400"}>{feature.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-24 max-w-5xl mx-auto">
          <h3 className="text-2xl font-medium text-center text-slate-900 mb-12">All Plans Include</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">AI-Powered Learning</h4>
              <p className="text-slate-600">Intelligent algorithms that adapt to your learning style</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">Fast Progress</h4>
              <p className="text-slate-600">Learn more efficiently with personalized study paths</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">Data Security</h4>
              <p className="text-slate-600">Your learning data is always private and secure</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">Community Access</h4>
              <p className="text-slate-600">Connect with other learners in our community</p>
            </div>
          </div>
        </div>

        {/* FAQ section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h3 className="text-2xl font-medium text-center text-slate-900 mb-12">Frequently Asked Questions</h3>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h4 className="text-lg font-medium text-slate-900 mb-2">Can I switch plans later?</h4>
              <p className="text-slate-600">
                Yes, you can upgrade or downgrade your plan at any time. If you upgrade, you'll be charged the prorated
                difference. If you downgrade, you'll receive credit towards your next billing cycle.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h4 className="text-lg font-medium text-slate-900 mb-2">Is there a student discount?</h4>
              <p className="text-slate-600">
                Yes! Students with a valid .edu email address can get 50% off any paid plan. Contact our support team to
                verify your student status.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h4 className="text-lg font-medium text-slate-900 mb-2">Do you offer refunds?</h4>
              <p className="text-slate-600">
                We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied with our service, you
                can request a full refund within 14 days of your purchase.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h4 className="text-lg font-medium text-slate-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-slate-600">
                We accept all major credit cards, PayPal, and Apple Pay. For Enterprise plans, we also offer invoicing
                options.
              </p>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="mt-24 max-w-4xl mx-auto bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            <div className="p-8 md:p-12 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-medium text-white mb-4">
                Ready to transform your learning experience?
              </h3>
              <p className="text-emerald-50 mb-6">
                Join thousands of students who are already learning smarter, not harder.
              </p>
              <div className="flex justify-center md:justify-start">
                <Button className="bg-white text-emerald-600 hover:bg-emerald-50 flex items-center">
                  Get Started Now
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="hidden md:block relative h-full">
              <div className="absolute inset-0 bg-emerald-700/20"></div>
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-400/30 rounded-full"></div>
              <div className="absolute -right-5 -top-20 w-40 h-40 bg-emerald-300/20 rounded-full"></div>
              <div className="p-12 relative z-10">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                  <div className="flex items-center mb-4">
                    <Award className="w-8 h-8 text-emerald-300 mr-3" />
                    <div>
                      <h4 className="text-white font-medium">Trusted by educators</h4>
                      <p className="text-emerald-100 text-sm">Used in over 500 schools</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-300 rounded-full mr-2"></div>
                      <span className="text-white text-sm">Improved test scores by 32%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-300 rounded-full mr-2"></div>
                      <span className="text-white text-sm">Reduced study time by 40%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-300 rounded-full mr-2"></div>
                      <span className="text-white text-sm">98% student satisfaction</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
