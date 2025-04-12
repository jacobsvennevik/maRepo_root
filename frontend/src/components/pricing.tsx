"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for casual learners",
    features: [
      "Basic AI study recommendations",
      "Limited content library access",
      "Standard study analytics",
      "1 study plan",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "$12",
    period: "/month",
    description: "Ideal for dedicated students",
    features: [
      "Advanced AI personalization",
      "Full content library access",
      "Detailed progress tracking",
      "Unlimited study plans",
      "Priority support",
      "Offline mode",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Teams",
    price: "$8",
    period: "/user/month",
    description: "Great for schools & groups",
    features: [
      "All Premium features",
      "Collaborative study spaces",
      "Team analytics dashboard",
      "Admin controls",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-teal-900 to-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Choose Your Learning Journey
          </motion.h2>
          <motion.p
            className="text-xl text-teal-100 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Flexible plans designed to fit your learning needs and goals.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex"
            >
              <Card
                className={`flex flex-col h-full w-full ${
                  plan.highlighted
                    ? "bg-gradient-to-b from-teal-800/50 to-blue-800/50 border-teal-400"
                    : "bg-blue-900/30 border-blue-800"
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  <div className="flex items-baseline mt-2">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-teal-200 ml-1">{plan.period}</span>}
                  </div>
                  <CardDescription className="text-teal-100 mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-teal-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-teal-50">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-blue-950"
                        : "bg-blue-800 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
